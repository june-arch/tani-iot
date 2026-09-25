"use client";
import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowRight, Beaker, Droplets, Leaf, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { DashboardState } from "@/hooks/useDashboard";
import { TANDON_RENDAH } from "@/lib/constants";

const HERO_IMAGE = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&auto=format&fit=crop";

export function tandonStatus(persen: number | null): string {
  if (persen === null) return "Tidak ada data";
  return persen < TANDON_RENDAH ? "Rendah" : "Aman";
}
export function isTandonRendah(persen: number | null): boolean {
  return persen !== null && persen < TANDON_RENDAH;
}

function EmptyHero() {
  return (
    <div className="relative overflow-hidden rounded-card border border-soft-mist">
      <div className="relative h-[420px] w-full sm:h-[480px]">
        <Image src={HERO_IMAGE} alt="Sawah terasering — hero" fill priority sizes="(max-width: 768px) 100vw, 1200px" className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/65 via-ink-charcoal/15 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-paper-white px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-charcoal">
          <span className="h-2 w-2 rounded-full bg-royal-violet animate-pulse" /> Editorial Dashboard • Superhuman
        </span>
        <h1 className="mt-4 max-w-[720px] font-sans text-[32px] font-[460] leading-[0.96] tracking-[-0.028em] text-paper-white drop-shadow-sm sm:text-[48px]">
          Sawah terasering, <br className="hidden sm:inline" /> data real-time
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-paper-white/85 [text-wrap:pretty] sm:text-[15px]">Pantau tandon, pH/NPK, dan PPM hidroponik — semua kebun dalam satu layar parchment yang tenang.</p>
        <Link href="/kebuns" className="mt-6 inline-flex h-12 items-center gap-2 rounded-button bg-midnight-wine px-6 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">
          Buat Kebun Pertama <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="absolute bottom-4 left-4 hidden max-w-[260px] sm:block">
        <div className="floating-card">
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Droplets className="h-4 w-4" /></span>
            <Badge variant="success">Aman</Badge>
          </div>
          <p className="mt-3 text-xs font-semibold tracking-wide text-stone-gray">TANDON AIR</p>
          <p className="font-mono text-xl font-bold text-ink-charcoal">— % <span className="text-xs font-medium text-stone-gray">· live</span></p>
          <p className="mt-1 text-xs text-stone-gray">Pasang sensor JSN-SR04T untuk melihat persentase.</p>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 hidden max-w-[260px] sm:block">
        <div className="floating-card">
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Beaker className="h-4 w-4" /></span>
            <Badge variant="lilac">TDS</Badge>
          </div>
          <p className="mt-3 text-xs font-semibold tracking-wide text-stone-gray">PPM HIDROPONIK</p>
          <p className="font-mono text-xl font-bold text-ink-charcoal">— ppm</p>
          <p className="mt-1 text-xs text-stone-gray">Nilai PPM muncul setelah sensor EC mengirim telemetry.</p>
        </div>
      </div>
    </div>
  );
}

function FilledHero({ data }: { data: DashboardState }) {
  const status = tandonStatus(data.tandonPersen);
  const lokasi = data.kebuns[0]?.lokasi ? String(data.kebuns[0].lokasi) : "telemetry";
  return (
    <div className="relative overflow-hidden rounded-card border border-soft-mist">
      <div className="relative h-[420px] w-full sm:h-[460px]">
        <Image src={HERO_IMAGE} alt="Sawah terasering — hero" fill priority sizes="(max-width: 768px) 100vw, 1200px" className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/70 via-ink-charcoal/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-wine/10 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-paper-white px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-charcoal">
          <Leaf className="h-3.5 w-3.5 text-royal-violet" /> Panen Organik • {data.kebuns.length} kebun terhubung
        </span>
        <h1 className="mt-4 max-w-[720px] font-sans text-[32px] font-[460] leading-[0.96] tracking-[-0.028em] text-paper-white drop-shadow-sm sm:text-[52px]">
          Sawah terasering, <br className="hidden sm:inline" /> data real-time
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-paper-white/85 [text-wrap:pretty] sm:text-[15px]">Pantau tandon, pH/NPK, dan PPM hidup — {data.totalLahan} lahan · {data.totalSensors} sensor terhubung.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/kebuns" className="inline-flex h-12 items-center gap-1.5 rounded-button bg-midnight-wine px-6 text-sm font-semibold text-paper-white hover:bg-[#2f151a]"><MapPin className="h-4 w-4" /> Kelola Kebun</Link>
          <Link href="/sensors" className="inline-flex h-12 items-center gap-1.5 rounded-button border border-paper-white/30 bg-paper-white/10 px-6 text-sm font-semibold text-paper-white backdrop-blur hover:bg-paper-white/20"><Activity className="h-4 w-4" /> Lihat Sensor</Link>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 hidden max-w-[280px] lg:block">
        <div className="floating-card">
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Droplets className="h-4 w-4" /></span>
            <Badge variant={isTandonRendah(data.tandonPersen) ? "destructive" : "success"}>{status}</Badge>
          </div>
          <p className="mt-3 text-xs font-semibold tracking-wide text-stone-gray">TANDON AIR · LIVE</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-bold tracking-tight text-ink-charcoal">{data.tandonPersen !== null ? `${data.tandonPersen}%` : "—"}</span>
            {data.tandonPersen !== null && <span className="text-xs text-stone-gray">· {lokasi}</span>}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-mist">
            <div className="h-full rounded-full bg-midnight-wine" style={{ width: `${Math.max(0, Math.min(100, data.tandonPersen ?? 0))}%` }} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 hidden max-w-[280px] lg:block">
        <div className="floating-card">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Sparkles className="h-4 w-4" /></span>
            <span className="text-xs font-semibold tracking-wide text-stone-gray">DOCTOR TANI AI</span>
          </div>
          <p className="mt-3 text-sm leading-5 text-ink-charcoal [text-wrap:pretty]">Foto daun → diagnosis + takaran pupuk spesifik dalam &lt;10 dtk.</p>
          <Link href="/tanaman" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-royal-violet hover:underline">Lihat 60+ tanaman <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ data }: { data: DashboardState | null }) {
  if (!data || data.kebuns.length === 0) return <EmptyHero />;
  return <FilledHero data={data} />;
}

export function EmptyKebunCta() {
  return (
    <div className="rounded-card border border-soft-mist bg-paper-white p-8 py-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lilac-mist text-ink-charcoal"><MapPin className="h-6 w-6" /></span>
      <h3 className="mt-3 font-sans text-lg font-bold tracking-tight [text-wrap:balance]">Belum ada kebun</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-gray [text-wrap:pretty]">Buat kebun pertama untuk mulai melihat ringkasan lahan, device, dan sensor di atas foto sawah editorial.</p>
      <Link href="/kebuns" className="mt-4 inline-flex h-12 items-center justify-center gap-1.5 rounded-button bg-midnight-wine px-6 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">
        <MapPin className="h-4 w-4" /> Buat Kebun
      </Link>
    </div>
  );
}
