"use client";
import Link from "next/link";
import { Activity, ArrowRight, Beaker, Droplets, Leaf, MapPin, Sprout } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { DashboardState } from "@/hooks/useDashboard";
import { isTandonRendah, tandonStatus } from "./HeroSection";

export function SuiteCard({ icon, label, title, desc, linkLabel, href }: {
  icon: React.ReactNode; label: string; title: string; desc: string; linkLabel: string; href: string;
}) {
  return (
    <div className="rounded-card border border-soft-mist bg-paper-white p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal">{icon}</span>
      <p className="mt-3 text-xs font-semibold tracking-wide text-stone-gray">{label}</p>
      <h3 className="mt-1 font-sans text-[19px] font-bold leading-tight tracking-tight text-ink-charcoal [text-wrap:balance]">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-stone-gray [text-wrap:pretty]">{desc}</p>
      <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-royal-violet hover:underline">
        {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function TandonPanel({ data }: { data: DashboardState }) {
  const status = tandonStatus(data.tandonPersen);
  const lokasi = data.kebuns[0]?.lokasi ? String(data.kebuns[0].lokasi) : "—";
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Droplets className="h-4 w-4" /></span> Tandon Air</CardTitle>
        <Badge variant={isTandonRendah(data.tandonPersen) ? "destructive" : "success"}>{status}</Badge>
      </CardHeader>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-3xl font-bold tracking-tight text-ink-charcoal">{data.tandonPersen !== null ? `${data.tandonPersen}%` : "—"}</span>
          {data.tandonPersen !== null && <span className="text-sm text-stone-gray">· live telemetry</span>}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-mist">
          <div className="h-full rounded-full bg-midnight-wine" style={{ width: `${Math.max(0, Math.min(100, data.tandonPersen ?? 0))}%` }} />
        </div>
        <p className="mt-2 text-xs leading-4 text-stone-gray [text-wrap:pretty]">{lokasi} · {data.totalDevices} device terdaftar</p>
        <div className="mt-4 flex gap-2">
          <Link href="/sensors" className="inline-flex h-11 flex-1 items-center justify-center rounded-button bg-midnight-wine px-4 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">Lihat Sensor</Link>
          <Link href="/kebuns" className="inline-flex h-11 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white px-4 text-sm font-semibold text-ink-charcoal hover:bg-warm-parchment">Kelola Kebun</Link>
        </div>
        <Link href="/sensors" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-royal-violet hover:underline">Pelajari kalibrasi <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </Card>
  );
}

function SoilPanel() {
  const nutrients = [
    { k: "N", v: "—", u: "ppm" },
    { k: "P", v: "—", u: "ppm" },
    { k: "K", v: "—", u: "ppm" },
  ];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Beaker className="h-4 w-4" /></span> pH & NPK Tanah</CardTitle>
        <Badge variant="lilac">Butuh device</Badge>
      </CardHeader>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-warm-parchment px-3 py-3 text-sm leading-5 text-stone-gray [text-wrap:pretty]">Data pH/NPK muncul setelah sensor terpasang di lahan. Tambahkan device lalu sensor pH/NPK.</div>
        <div className="grid grid-cols-3 gap-2">
          {nutrients.map((x) => (
            <div key={x.k} className="rounded-lg border border-soft-mist bg-paper-white px-3 py-3 text-center">
              <p className="text-xs font-semibold text-stone-gray">{x.k}</p>
              <p className="font-sans text-lg font-bold text-ink-charcoal">{x.v}</p>
              <p className="text-xs text-stone-gray">{x.u}</p>
            </div>
          ))}
        </div>
        <Link href="/sensors" className="inline-flex items-center gap-1 text-sm font-medium text-royal-violet hover:underline">Atur threshold <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </Card>
  );
}

function HydroPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Leaf className="h-4 w-4" /></span> PPM Hidroponik</CardTitle>
        <Badge variant="info">TDS</Badge>
      </CardHeader>
      <div className="mt-4">
        <p className="text-sm leading-6 text-stone-gray [text-wrap:pretty]">Nilai PPM/TDS tampil setelah sensor hidroponik mengirim telemetry via MQTT.</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-sans text-3xl font-bold tracking-tight text-ink-charcoal">—</span>
          <span className="text-sm text-stone-gray">ppm</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-mist">
          <div className="h-full w-0 rounded-full bg-royal-violet" />
        </div>
        <Link href="/tanaman" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-royal-violet hover:underline">Lihat panduan hidroponik <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </Card>
  );
}

export function SuitePanels({ data }: { data: DashboardState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <TandonPanel data={data} />
      <SoilPanel />
      <HydroPanel />
    </div>
  );
}

export function FeatureBand({ kebunId }: { kebunId: string | null }) {
  return (
    <div className="overflow-hidden rounded-card border border-deep-lagoon bg-deep-lagoon">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[280px] overflow-hidden p-6">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute left-6 top-6 h-28 w-40 rounded-lg bg-lilac-mist/30 backdrop-blur" />
            <div className="absolute left-16 top-16 h-28 w-44 rounded-lg bg-[#8fb8c8]/30 backdrop-blur" />
            <div className="absolute left-10 top-32 h-20 w-36 rounded-lg bg-[#ffb3a0]/25 backdrop-blur" />
            <div className="absolute left-6 bottom-6 font-sans text-2xl font-[460] tracking-tight text-paper-white/40 [font-style:italic]">irigasi otomatis</div>
          </div>
          <div className="relative flex h-full items-center justify-center">
            <div className="rounded-card border border-paper-white/20 bg-paper-white/10 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-paper-white/80">SOLENOID VALVE • MQTT</div>
              <div className="mt-2 font-mono text-sm font-bold text-paper-white">tani/{kebunId ? kebunId.slice(0, 6) : "kebun"}/valve • QoS1 retain</div>
              <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-paper-white/20"><div className="h-full w-3/4 rounded-full bg-lilac-mist" /></div>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <h2 className="font-sans text-[32px] font-[460] leading-[0.96] tracking-[-0.022em] text-paper-white [text-wrap:balance]">Irigasi jalan sendiri. Petani tinggal panen.</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-paper-white/80 [text-wrap:pretty]">Schedule & threshold solenoid otomatis via ESP32 → EMQX :1884 → NestJS → WebSocket. Offline queue SPIFFS jaga jadwal tetap jalan tanpa internet kebun.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/sensors" className="inline-flex h-11 items-center justify-center rounded-small-button border border-paper-white/30 bg-paper-white px-5 text-sm font-semibold text-ink-charcoal hover:bg-paper-white/90">Atur irigasi</Link>
            <Link href="/kebuns" className="inline-flex h-11 items-center justify-center rounded-small-button border border-paper-white/20 bg-transparent px-5 text-sm font-semibold text-paper-white hover:bg-paper-white/10">Lihat kebun</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GradientBanner() {
  return (
    <div className="gradient-banner overflow-hidden rounded-card border border-soft-mist p-6 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-sans text-[28px] font-[460] leading-[0.96] tracking-[-0.022em] text-ink-charcoal [text-wrap:balance]">60+ komoditas Indonesia, siap tanam.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-gray [text-wrap:pretty]">Sowing, vegetatif/generatif, hidroponik — semua kurasi iklim tropis dataran rendah & tinggi.</p>
        </div>
        <Link href="/tanaman" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-button bg-midnight-wine px-6 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">
          Jelajahi tanaman <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

const NAV_CARDS = [
  { title: "Kelola Kebun", desc: "Tambah lahan, atur anggota", href: "/kebuns", cta: "Buka Kebun", Icon: MapPin },
  { title: "Konfigurasi Sensor", desc: "Threshold, kalibrasi, interval", href: "/sensors", cta: "Atur Sensor", Icon: Activity },
  { title: "Panduan Tanaman", desc: "60+ komoditas Indonesia", href: "/tanaman", cta: "Lihat Tanaman", Icon: Sprout },
];

export function SuiteNav() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {NAV_CARDS.map((c) => (
        <SuiteCard key={c.title} icon={<c.Icon className="h-5 w-5" />} label={c.title.toUpperCase()} title={c.title} desc={c.desc} linkLabel={c.cta} href={c.href} />
      ))}
    </div>
  );
}
