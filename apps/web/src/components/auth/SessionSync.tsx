"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { clearAuth, setToken } from "@/lib/auth";

/**
 * Jembatan sesi NextAuth → transport fetch (localStorage).
 * api.ts membaca token secara sinkron dari localStorage; komponen ini
 * menyalin accessToken sesi ke sana (dan membersihkan saat keluar).
 */
export function SessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setToken(session.accessToken, session.refreshToken ?? null, session.user);
    } else if (status === "unauthenticated") {
      clearAuth();
    }
  }, [session, status]);

  return null;
}
