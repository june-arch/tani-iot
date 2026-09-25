"use client";
import { useCallback, useRef, useState } from "react";
import { TOAST_MS } from "@/lib/constants";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);
  return { toast, showToast };
}

export function Toast({ message, tone = "wine", variant }: { message: string | null; tone?: "wine" | "red"; variant?: "error" | "default" }) {
  if (!message) return null;
  const resolved = variant === "error" ? "red" : tone;
  const cls = resolved === "red" ? "bg-destructive text-destructive-fg" : "bg-midnight-wine text-paper-white";
  return <div role="status" className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-pill px-4 py-2.5 text-sm font-semibold shadow-lg ${cls}`}>{message}</div>;
}
