// Tani IoT — hook toast dengan cleanup timeout (anti leak).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOAST_MS } from "@/lib/constants";

export function useToast(durationMs: number = TOAST_MS) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (msg: string) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(msg);
      timer.current = setTimeout(() => {
        setToast(null);
        timer.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { toast, showToast, clear };
}
