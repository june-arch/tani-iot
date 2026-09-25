// Tani IoT — transport token untuk fetch (localStorage + cookie).
// Sumber kebenaran sesi adalah NextAuth (lihat src/auth.ts + SessionSync);
// file ini hanya dibaca/ditulis secara sinkron oleh api.ts dan SessionSync.
export const TOKEN_KEY = "tani_token";
export const REFRESH_KEY = "tani_refresh";
export const USER_KEY = "tani_user";

function cookieGet(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem(TOKEN_KEY);
    if (ls) return ls;
  }
  return cookieGet(TOKEN_KEY);
}

export function setToken(accessToken: string, refreshToken?: string | null, user?: unknown): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
    if (user !== undefined) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  if (typeof document !== "undefined") {
    const maxAge = 60 * 60 * 24 * 7; // 7 hari
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    if (refreshToken) document.cookie = `${REFRESH_KEY}=${encodeURIComponent(refreshToken)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
  }
  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0`;
    document.cookie = `${REFRESH_KEY}=; Path=/; Max-Age=0`;
  }
}
