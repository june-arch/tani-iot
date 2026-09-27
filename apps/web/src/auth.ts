import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/schemas";
import { baseUrl } from "@/lib/api";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    /** Diisi "RefreshGagal" bila refresh token backend ditolak (sesi harus diakhiri). */
    error?: string;
    user: DefaultSession["user"] & {
      id: string;
      nama: string;
      role: string;
    };
  }
  interface User {
    accessToken?: string;
    refreshToken?: string;
    nama?: string;
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    nama?: string;
    role?: string;
    /** Epoch ms kedaluwarsa access token backend (disegarkan proaktif sebelum 15 mnt). */
    accessExpires?: number;
    error?: string;
  }
}

type BackendLogin = {
  user: { id: string; email: string; nama: string; role: string };
  accessToken: string;
  refreshToken: string;
};

function unwrapBackend(body: unknown): BackendLogin | null {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: BackendLogin }).data;
  }
  return body as BackendLogin | null;
}

type BackendTokenPair = { accessToken: string; refreshToken: string };

// Backend menerbitkan access 15 mnt — segarkan proaktif di 13 mnt agar
// api.ts tidak pernah menendang ke /login saat sesi NextAuth masih valid.
const AKSES_UMUR_MS = 13 * 60 * 1000;
const ULANG_SEBENTAR_MS = 30 * 1000;

async function segarkanTokenBackend(refreshToken: string): Promise<BackendTokenPair | null | "fatal"> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    return null; // jaringan gagal — coba lagi nanti, jangan bunuh sesi
  }
  if (res.status === 401 || res.status === 403) return "fatal";
  if (!res.ok) return null;
  const body = (await res.json().catch(() => null)) as { data?: BackendTokenPair } | null;
  const pair = body?.data;
  if (!pair?.accessToken) return null;
  return { accessToken: pair.accessToken, refreshToken: pair.refreshToken ?? refreshToken };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "Email",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: parsed.data.email.trim(),
            password: parsed.data.password,
          }),
          cache: "no-store",
        });
        if (!res.ok) return null;
        const data = unwrapBackend(await res.json().catch(() => null));
        if (!data?.accessToken || !data.user) return null;
        return {
          id: data.user.id,
          email: data.user.email,
          nama: data.user.nama,
          role: data.user.role,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.nama = user.nama;
        token.role = user.role;
        token.accessExpires = Date.now() + AKSES_UMUR_MS;
        token.error = undefined;
        if (user.email) token.email = user.email;
        return token;
      }
      // Sesi berjalan: token masih segar → tanpa fetch tambahan.
      if (token.accessToken && (token.accessExpires ?? 0) > Date.now()) {
        return token;
      }
      if (!token.refreshToken) {
        return { ...token, error: "RefreshGagal" };
      }
      const hasil = await segarkanTokenBackend(token.refreshToken);
      if (hasil === "fatal") {
        return { ...token, error: "RefreshGagal" };
      }
      if (hasil === null) {
        // Gangguan sesaat — coba lagi 30 detik ke depan.
        return { ...token, accessExpires: Date.now() + ULANG_SEBENTAR_MS };
      }
      return {
        ...token,
        accessToken: hasil.accessToken,
        refreshToken: hasil.refreshToken,
        accessExpires: Date.now() + AKSES_UMUR_MS,
        error: undefined,
      };
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      session.user.id = token.sub ?? "";
      session.user.nama = token.nama ?? "";
      session.user.role = token.role ?? "";
      if (token.email) session.user.email = token.email;
      return session;
    },
    authorized({ auth: sess, request }) {
      const path = request.nextUrl.pathname;
      const publik = ["/login", "/unduh", "/tani-iot-debug.apk"];
      if (publik.some((p) => path === p || path.startsWith(`${p}/`))) return true;
      if (path.startsWith("/api/auth")) return true;
      if (path.startsWith("/_next") || path === "/favicon.ico") return true;
      return !!sess?.user;
    },
  },
});
