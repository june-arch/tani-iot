"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Activity, Sprout, Leaf, ChevronRight, CalendarDays } from "lucide-react";

const NAV = [
  { href: "/", label: "Ringkasan", Icon: LayoutDashboard },
  { href: "/kalender", label: "Kalender", Icon: CalendarDays },
  { href: "/kebuns", label: "Kebun", Icon: MapPin },
  { href: "/sensors", label: "Sensor", Icon: Activity },
  { href: "/tanaman", label: "Tanaman", Icon: Sprout },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-warm-parchment text-ink-charcoal">
      {/* Announcement pill — Superhuman top strip */}
      <div className="hidden border-b border-soft-mist bg-midnight-wine text-paper-white sm:block">
        <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-4 py-2 text-xs">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-paper-white/15 text-[10px]">◈</span>
          <span className="font-medium tracking-wide">Tani IoT — Multi-kebun • Sensor realtime • Doctor Tani AI</span>
          <span className="ml-2 hidden items-center gap-1 rounded-pill border border-paper-white/20 px-3 py-1 text-xs font-semibold hover:bg-paper-white/10 sm:inline-flex">
            Panduan sensor <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Header — Superhuman Navigation Header: transparent + blur + hairline */}
      <header className="sticky top-0 z-30 border-b border-soft-mist bg-warm-parchment/80 backdrop-blur-[12px] supports-[backdrop-filter]:bg-warm-parchment/70">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight-wine text-paper-white">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="font-sans text-[16px] font-bold tracking-tight text-ink-charcoal [text-wrap:balance]">Tani IoT</span>
              <span className="hidden rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold tracking-wide text-ink-charcoal sm:inline">
                Multi-Kebun
              </span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV.map(({ href, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "rounded-small-button px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-paper-white text-ink-charcoal shadow-subtle" : "text-stone-gray hover:bg-paper-white hover:text-ink-charcoal",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-small-button border border-soft-mist bg-paper-white px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#1a7a4a] animate-pulse" />
              <span className="text-xs font-semibold text-ink-charcoal">Kebun Demo</span>
              <span className="text-xs text-stone-gray">· 3 lahan</span>
            </div>
            <Link href="/login" className="hidden text-sm font-medium text-stone-gray hover:text-ink-charcoal sm:inline">Masuk</Link>
            <Link href="/kebuns" className="inline-flex h-8 items-center justify-center rounded-small-button border border-ink-charcoal bg-lilac-mist px-3.5 text-xs font-semibold text-ink-charcoal hover:bg-[#c3b6f0]">
              Mulai
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lilac-mist text-sm font-bold text-ink-charcoal ring-1 ring-soft-mist">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px]">
        {/* Sidebar desktop — Paper White cards on parchment */}
        <aside className="hidden w-[260px] shrink-0 border-r border-soft-mist bg-warm-parchment lg:block">
          <div className="sticky top-[57px] flex h-[calc(100vh-57px)] flex-col p-4">
            <div className="rounded-card border border-soft-mist bg-paper-white p-4">
              <p className="text-xs font-semibold tracking-wide text-stone-gray">KEBUN AKTIF</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink-charcoal [text-wrap:balance]">
                <MapPin className="h-3.5 w-3.5 text-midnight-wine" /> Kebun Demo
              </p>
              <p className="text-xs leading-4 text-stone-gray [text-wrap:pretty]">Sawah Teras — 3 lahan · 6 sensor</p>
              <button className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-small-button border border-soft-mist bg-paper-white text-xs font-semibold text-ink-charcoal hover:bg-warm-parchment">
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
                      "flex items-center gap-2.5 rounded-small-button px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-midnight-wine text-paper-white"
                        : "text-stone-gray hover:bg-paper-white hover:text-ink-charcoal",
                    ].join(" ")}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Dark feature band hint — Deep Lagoon */}
            <div className="mt-auto rounded-card border border-deep-lagoon bg-deep-lagoon p-4 text-paper-white">
              <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide">
                <Leaf className="h-3.5 w-3.5" /> Butuh bantuan?
              </p>
              <p className="mt-1 text-xs leading-4 text-paper-white/75 [text-wrap:pretty]">
                Panduan media tanam, pupuk vegetatif & kalibrasi sensor ada di dokumentasi.
              </p>
              <Link href="/tanaman" className="mt-3 inline-flex h-8 items-center justify-center rounded-small-button border border-paper-white/20 bg-paper-white/10 px-3 text-xs font-semibold text-paper-white hover:bg-paper-white/20">
                Buka panduan
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-8">{children}</main>
      </div>

      {/* Bottom nav mobile — Paper White + Soft Mist */}
      <nav className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-around rounded-[1.25rem] border border-soft-mist bg-paper-white p-1.5 shadow-[0_8px_32px_rgba(41,40,39,0.12)] lg:hidden">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-1 rounded-xl px-5 py-2 text-xs font-semibold transition-colors",
                active ? "bg-midnight-wine text-paper-white" : "text-stone-gray",
              ].join(" ")}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — Wine Ground (only on dashboard layout, subtle) */}
      <footer className="hidden border-t border-midnight-wine bg-midnight-wine text-paper-white lg:block">
        <div className="mx-auto max-w-[1200px] px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-medium tracking-wide opacity-80">© Tani IoT • Data petani adalah milik petani • Full Bahasa Indonesia</span>
            <span className="opacity-60">VPS dragon • MQTT QoS1 • Offline queue SPIFFS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
