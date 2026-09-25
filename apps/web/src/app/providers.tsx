"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionSync } from "@/components/auth/SessionSync";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <SessionSync />
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
