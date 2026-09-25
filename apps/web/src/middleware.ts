export { auth as middleware } from "@/auth";

export const config = {
  // Lindungi semua route kecuali aset statis (authorized() di auth.ts yang putuskan).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
