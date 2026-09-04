"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Droplets, Beaker, Leaf, Sprout, Activity, AlertTriangle, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { api, type Kebun, type Device } from "@/lib/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } } };

function SuiteCard({
  icon,
  label,
  title,
  desc,
  linkLabel,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  desc: string;
  linkLabel: string;
  href: string;
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

type DashboardState = {
  kebuns: Kebun[];
  totalLahan: number;
  totalDevices: number;
  onlineDevices: number;
  totalSensors: number;
  tandonPersen: number | null;
};

export default function OverviewPage() {
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const kebuns = await api.get<Kebun[]>("/kebuns/my");
        if (!alive) return;
        if (kebuns.length === 0) {
          setData({ kebuns: [], totalLahan: 0, totalDevices: 0, onlineDevices: 0, totalSensors: 0, tandonPersen: null });
          setLoading(false);
          return;
        }
        const perKebun = await Promise.all(
          kebuns.map(async (k) => {
            const id = k.id as string;
            try {
              const [lahans, devices] = await Promise.all([
                api.get<unknown[]>(`/kebuns/${id}/lahans`).catch(() => [] as unknown[]),
                api.get<Device[]>(`/kebuns/${id}/devices`).catch(() => [] as Device[]),
              ]);
              return { lahans: (lahans as unknown[]).length, devices: devices as Device[] };
            } catch {
              return { lahans: 0, devices: [] as Device[] };
            }
          })
        );
        const totalLahan = perKebun.reduce((a, b) => a + b.lahans, 0);
        const allDevices = perKebun.flatMap((x) => x.devices);
        const totalDevices = allDevices.length;
        const onlineDevices = allDevices.filter((d) => (d.status ?? "").toLowerCase() === "online").length;
        const totalSensors = allDevices.reduce((a, d) => a + (d.sensors?.length ?? 0), 0);
        let tandonPersen: number | null = null;
        const tandonSensor = allDevices
          .flatMap((d) => d.sensors ?? [])
          .find((s) => {
            const t = (s.type ?? s.tipe ?? "").toString().toLowerCase();
            return t.includes("water") || t.includes("tandon") || t.includes("level");
          });
        if (tandonSensor) {
          try {
            const tel = await api.get<{ data: { value: number }[] }>(`/sensors/${tandonSensor.id}/telemetry?limit=1`).catch(() => null);
            const raw = tel as unknown;
            let val: number | null = null;
            if (raw && typeof raw === "object") {
              const r = raw as Record<string, unknown>;
              if (Array.isArray(r["data"])) val = (r["data"] as { value: number }[])[0]?.value ?? null;
            }
            if (val !== null) tandonPersen = Math.round(val);
          } catch {}
        }
        if (!alive) return;
        setData({ kebuns, totalLahan, totalDevices, onlineDevices, totalSensors, tandonPersen });
      } catch (e: unknown) {
        const status = (e as { status?: number })?.status;
        if (status === 401) return;
        const msg = (e as { message?: string })?.message ?? "Gagal memuat ringkasan.";
        if (alive) {
          setErr(msg);
          showToast(msg);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[420px] rounded-card" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-card" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="space-y-4">
        {toast && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-fg">{toast}</div>}
        <Card className="py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive-soft text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h3 className="mt-3 font-sans font-semibold text-ink-charcoal [text-wrap:balance]">Gagal memuat ringkasan</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-gray [text-wrap:pretty]">{err}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => location.reload()}>Muat Ulang</Button>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-button border border-soft-mist bg-paper-white px-5 text-sm font-semibold text-ink-charcoal hover:bg-warm-parchment">Masuk</Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!data || data.kebuns.length === 0) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Hero — Superhuman full-bleed photograph + floating glass cards */}
        <motion.div variants={item} className="relative overflow-hidden rounded-card border border-soft-mist">
          <div className="relative h-[420px] w-full sm:h-[480px]">
            <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&auto=format&fit=crop" alt="Sawah terasering — hero" fill priority sizes="(max-width: 768px) 100vw, 1200px" className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/65 via-ink-charcoal/15 to-transparent" />
          </div>
          {/* Center headline */}
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
          {/* Floating cards — left & right over photo */}
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
        </motion.div>

        <motion.div variants={item} className="rounded-card border border-soft-mist bg-paper-white p-8 py-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lilac-mist text-ink-charcoal"><MapPin className="h-6 w-6" /></span>
          <h3 className="mt-3 font-sans text-lg font-bold tracking-tight [text-wrap:balance]">Belum ada kebun</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-gray [text-wrap:pretty]">Buat kebun pertama untuk mulai melihat ringkasan lahan, device, dan sensor di atas foto sawah editorial.</p>
          <Link href="/kebuns" className="mt-4 inline-flex h-12 items-center justify-center gap-1.5 rounded-button bg-midnight-wine px-6 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">
            <MapPin className="h-4 w-4" /> Buat Kebun
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const tandonVal = data.tandonPersen !== null ? String(data.tandonPersen) : "—";
  const tandonStatus = data.tandonPersen === null ? "Tidak ada data" : data.tandonPersen < 20 ? "Rendah" : "Aman";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {toast && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-fg">{toast}</div>}

      {/* Hero — full-bleed photograph with floating cards */}
      <motion.div variants={item} className="relative overflow-hidden rounded-card border border-soft-mist">
        <div className="relative h-[420px] w-full sm:h-[460px]">
          <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=80&auto=format&fit=crop" alt="Sawah terasering — hero" fill priority sizes="(max-width: 768px) 100vw, 1200px" className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/70 via-ink-charcoal/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-wine/10 to-transparent" />
        </div>
        {/* Center headline */}
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
        {/* Floating glass cards */}
        <div className="absolute bottom-4 left-4 hidden max-w-[280px] lg:block">
          <div className="floating-card">
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Droplets className="h-4 w-4" /></span>
              <Badge variant={data.tandonPersen !== null && data.tandonPersen < 20 ? "destructive" : "success"}>{tandonStatus}</Badge>
            </div>
            <p className="mt-3 text-xs font-semibold tracking-wide text-stone-gray">TANDON AIR · LIVE</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-sans text-2xl font-bold tracking-tight text-ink-charcoal">{tandonVal}{data.tandonPersen !== null ? "%" : ""}</span>
              {data.tandonPersen !== null && <span className="text-xs text-stone-gray">· {data.kebuns[0]?.lokasi ? String(data.kebuns[0].lokasi) : "telemetry"}</span>}
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
      </motion.div>

      {/* Trust logo card strip — Superhuman social-proof band */}
      <motion.div variants={item} className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-soft-mist bg-soft-mist sm:grid-cols-6">
        {[
          { k: `${data.kebuns.length}`, l: "kebun" },
          { k: `${data.totalLahan}`, l: "lahan" },
          { k: `${data.totalDevices}`, l: "device" },
          { k: `${data.totalSensors}`, l: "sensor" },
          { k: data.tandonPersen !== null ? `${data.tandonPersen}%` : "—", l: "tandon" },
          { k: "60+", l: "komoditas" },
        ].map((s) => (
          <div key={s.l} className="bg-paper-white px-3 py-4 text-center">
            <p className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">{s.k}</p>
            <p className="text-xs font-medium tracking-wide text-stone-gray">{s.l}</p>
          </div>
        ))}
      </motion.div>

      {/* Suite product cards — white on parchment */}
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Droplets className="h-4 w-4" /></span> Tandon Air</CardTitle>
              <Badge variant={data.tandonPersen !== null && data.tandonPersen < 20 ? "destructive" : "success"}>{tandonStatus}</Badge>
            </CardHeader>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-3xl font-bold tracking-tight text-ink-charcoal">{tandonVal}{data.tandonPersen !== null ? "%" : ""}</span>
                {data.tandonPersen !== null && <span className="text-sm text-stone-gray">· live telemetry</span>}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-mist">
                <div className="h-full rounded-full bg-midnight-wine" style={{ width: `${Math.max(0, Math.min(100, data.tandonPersen ?? 0))}%` }} />
              </div>
              <p className="mt-2 text-xs leading-4 text-stone-gray [text-wrap:pretty]">{data.kebuns[0]?.lokasi ? String(data.kebuns[0].lokasi) : "—"} · {data.totalDevices} device terdaftar</p>
              <div className="mt-4 flex gap-2">
                <Link href="/sensors" className="inline-flex h-11 flex-1 items-center justify-center rounded-button bg-midnight-wine px-4 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">Lihat Sensor</Link>
                <Link href="/kebuns" className="inline-flex h-11 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white px-4 text-sm font-semibold text-ink-charcoal hover:bg-warm-parchment">Kelola Kebun</Link>
              </div>
              <Link href="/sensors" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-royal-violet hover:underline">Pelajari kalibrasi <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><Beaker className="h-4 w-4" /></span> pH & NPK Tanah</CardTitle>
              <Badge variant="lilac">Butuh device</Badge>
            </CardHeader>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-warm-parchment px-3 py-3 text-sm leading-5 text-stone-gray [text-wrap:pretty]">Data pH/NPK muncul setelah sensor terpasang di lahan. Tambahkan device lalu sensor pH/NPK.</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: "N", v: "—", u: "ppm" },
                  { k: "P", v: "—", u: "ppm" },
                  { k: "K", v: "—", u: "ppm" },
                ].map((x) => (
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
        </motion.div>

        <motion.div variants={item}>
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
        </motion.div>
      </motion.div>

      {/* Dark Feature Band — Deep Lagoon #0c4243 */}
      <motion.div variants={item} className="overflow-hidden rounded-card border border-deep-lagoon bg-deep-lagoon">
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
                <div className="mt-2 font-mono text-sm font-bold text-paper-white">tani/{data.kebuns[0]?.id ? String(data.kebuns[0].id).slice(0, 6) : "kebun"}/valve • QoS1 retain</div>
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
      </motion.div>

      {/* Gradient Banner — atmospheric */}
      <motion.div variants={item} className="gradient-banner overflow-hidden rounded-card border border-soft-mist p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-sans text-[28px] font-[460] leading-[0.96] tracking-[-0.022em] text-ink-charcoal [text-wrap:balance]">60+ komoditas Indonesia, siap tanam.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-gray [text-wrap:pretty]">Sowing, vegetatif/generatif, hidroponik — semua kurasi iklim tropis dataran rendah & tinggi.</p>
          </div>
          <Link href="/tanaman" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-button bg-midnight-wine px-6 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">
            Jelajahi tanaman <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      {/* Suite tab strip style navigation for 3 actions */}
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Kelola Kebun", desc: "Tambah lahan, atur anggota", href: "/kebuns", cta: "Buka Kebun", Icon: MapPin },
          { title: "Konfigurasi Sensor", desc: "Threshold, kalibrasi, interval", href: "/sensors", cta: "Atur Sensor", Icon: Activity },
          { title: "Panduan Tanaman", desc: "60+ komoditas Indonesia", href: "/tanaman", cta: "Lihat Tanaman", Icon: Sprout },
        ].map((c) => (
          <motion.div key={c.title} variants={item}>
            <SuiteCard icon={<c.Icon className="h-5 w-5" />} label={c.title.toUpperCase()} title={c.title} desc={c.desc} linkLabel={c.cta} href={c.href} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
