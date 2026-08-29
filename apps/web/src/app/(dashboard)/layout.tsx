"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Ringkasan", icon: "◈" },
  { href: "/kebuns", label: "Kebun", icon: "🏡" },
  { href: "/sensors", label: "Sensor", icon: "📡" },
  { href: "/tanaman", label: "Tanaman", icon: "🌱" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-button border bg-background text-sm font-semibold lg:hidden"
              aria-label="Buka menu"
            >
              ☰
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-fg">
                T
              </span>
              <span className="font-sans text-base font-bold tracking-tight">Tani IoT</span>
              <span className="hidden rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-soft-fg sm:inline">
                Multi-Kebun
              </span>
            </Link>
          </div>

          {/* Kebun switcher placeholder */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-button border bg-muted px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold">Kebun Demo</span>
              <span className="text-xs text-muted-fg">· 3 lahan</span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px]">
        {/* Sidebar desktop */}
        <aside className="hidden w-[280px] shrink-0 border-r bg-background lg:block">
          <div className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col p-4">
            <div className="rounded-card border bg-muted p-3">
              <p className="text-xs font-semibold">Kebun Aktif</p>
              <p className="mt-1 text-sm font-bold">Kebun Demo</p>
              <p className="text-xs text-muted-fg">Sawah Teras — 3 lahan · 6 sensor</p>
              <button className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-button border bg-background text-xs font-semibold">
                Ganti Kebun
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {NAV.map((n) => {
                const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={[
                      "flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-fg"
                        : "text-muted-fg hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <span className="w-5 text-center text-base leading-none">{n.icon}</span>
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-card border bg-accent-soft p-3">
              <p className="text-xs font-bold text-accent-soft-fg">Butuh bantuan?</p>
              <p className="mt-1 text-xs leading-4 text-accent-soft-fg/80">
                Panduan sensor & tandon ada di dokumentasi.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="h-full w-[300px] bg-background p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold">Menu</span>
                <button onClick={() => setOpen(false)} className="h-11 w-11 rounded-button border">
                  ✕
                </button>
              </div>
              <nav className="mt-4 flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="rounded-button px-3 py-3 text-sm font-medium hover:bg-muted"
                  >
                    {n.icon} {n.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-[1.5rem] border bg-background p-2 shadow-lg lg:hidden">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={[
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold",
                active ? "bg-primary text-primary-fg" : "text-muted-fg",
              ].join(" ")}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
