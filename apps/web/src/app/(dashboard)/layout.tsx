"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Activity, Sprout, Leaf } from "lucide-react";

const NAV = [
  { href: "/", label: "Ringkasan", Icon: LayoutDashboard },
  { href: "/kebuns", label: "Kebun", Icon: MapPin },
  { href: "/sensors", label: "Sensor", Icon: Activity },
  { href: "/tanaman", label: "Tanaman", Icon: Sprout },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-fg shadow-sm">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="font-sans text-base font-bold tracking-tight [text-wrap:balance]">Tani IoT</span>
              <span className="hidden rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold tracking-wide text-primary-soft-fg sm:inline">
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-soft-fg ring-1 ring-border">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1280px]">
        {/* Sidebar desktop */}
        <aside className="hidden w-[280px] shrink-0 border-r bg-background lg:block">
          <div className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col p-4">
            <div className="rounded-card border bg-muted p-3.5">
              <p className="text-xs font-semibold tracking-wide text-muted-fg">Kebun Aktif</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold [text-wrap:balance]">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Kebun Demo
              </p>
              <p className="text-xs leading-4 text-muted-fg [text-wrap:pretty]">Sawah Teras — 3 lahan · 6 sensor</p>
              <button className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-button border bg-background text-xs font-semibold hover:bg-muted">
                <MapPin className="h-3.5 w-3.5" /> Ganti Kebun
              </button>
            </div>

            <nav className="mt-4 flex flex-col gap-1">
              {NAV.map(({ href, label, Icon }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "flex items-center gap-2.5 rounded-button px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-fg shadow-sm"
                        : "text-muted-fg hover:bg-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-card border bg-accent-soft p-3.5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-accent-soft-fg">
                <Leaf className="h-3.5 w-3.5" /> Butuh bantuan?
              </p>
              <p className="mt-1 text-xs leading-4 text-accent-soft-fg/80 [text-wrap:pretty]">
                Panduan sensor & tandon ada di dokumentasi.
              </p>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-8">{children}</main>
      </div>

      {/* Bottom nav mobile — hanya mobile, sidebar sudah handle desktop */}
      <nav className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-[1.5rem] border bg-background p-2 shadow-lg lg:hidden">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                active ? "bg-primary text-primary-fg" : "text-muted-fg",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
