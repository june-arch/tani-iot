import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/schemas";
import { baseUrl } from "@/lib/api";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
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
        if (user.email) token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
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
