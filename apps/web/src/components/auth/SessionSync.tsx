"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuth, setToken } from "@/lib/auth";

/**
 * Jembatan sesi NextAuth → transport fetch (localStorage).
 * api.ts membaca token secara sinkron dari localStorage; komponen ini
 * menyalin accessToken sesi ke sana (dan membersihkan saat keluar).
 * Saat sesi baru terautentikasi, query yang sempat gagal tanpa token
 * dimuat ulang otomatis — tanpa tendangan ke /login (anti-kedip).
 */
export function SessionSync() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const statusLalu = useRef(status);

  useEffect(() => {
    if (session?.error === "RefreshGagal") {
      // Refresh token backend mati — akhiri sesi NextAuth sekalian.
      clearAuth();
      queryClient.clear();
      void signOut({ callbackUrl: "/login" });
      return;
    }
    if (status === "authenticated" && session?.accessToken) {
      const baruMasuk = statusLalu.current !== "authenticated";
      setToken(session.accessToken, session.refreshToken ?? null, session.user);
      if (baruMasuk) {
        void queryClient.invalidateQueries();
      }
    } else if (status === "unauthenticated") {
      clearAuth();
    }
    statusLalu.current = status;
  }, [session, status, queryClient]);

  return null;
}
