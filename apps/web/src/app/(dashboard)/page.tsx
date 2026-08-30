"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Droplets, Beaker, Leaf, Sprout, Activity, AlertTriangle, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { api, type Kebun, type Device } from "@/lib/api";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

function StatCard({
  label,
  value,
  unit,
  trend,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
}) {
  return (
    <motion.div variants={item} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <div className="rounded-card border bg-muted p-5 shadow-sm border-primary/10">
        <p className="text-xs font-semibold tracking-wide text-muted-fg [text-wrap:balance]">{label}</p>
        <p className="mt-2 font-sans text-2xl font-bold tracking-tight [text-wrap:balance]">
          {value} <span className="text-sm font-medium text-muted-fg">{unit}</span>
        </p>
        {trend && <p className="mt-1 font-mono text-xs text-success">{trend}</p>}
      </div>
    </motion.div>
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
        // 1) kebuns
        const kebuns = await api.get<Kebun[]>("/kebuns/my");
        if (!alive) return;

        if (kebuns.length === 0) {
          setData({ kebuns: [], totalLahan: 0, totalDevices: 0, onlineDevices: 0, totalSensors: 0, tandonPersen: null });
          setLoading(false);
          return;
        }

        // parallel fetch lahans & devices per kebun
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

        // tandon: cari sensor WATER_LEVEL / tandon; ambil telemetry terakhir
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
            // unwrap berbagai bentuk
            let val: number | null = null;
            if (raw && typeof raw === "object") {
              const r = raw as Record<string, unknown>;
              if (Array.isArray(r["data"])) val = (r["data"] as { value: number }[])[0]?.value ?? null;
              else if (Array.isArray(r["data"] as unknown)) val = null;
            }
            if (val !== null) tandonPersen = Math.round(val);
          } catch {}
        }

        if (!alive) return;
        setData({ kebuns, totalLahan, totalDevices, onlineDevices, totalSensors, tandonPersen });
      } catch (e: unknown) {
        const status = (e as { status?: number })?.status;
        if (status === 401) return; // api.ts sudah redirect
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
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="space-y-4 pb-20 lg:pb-0">
        {toast && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-fg shadow-lg">{toast}</div>}
        <Card className="py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive-soft text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h3 className="mt-3 font-sans font-semibold [text-wrap:balance]">Gagal memuat ringkasan</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-fg [text-wrap:pretty]">{err}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => location.reload()}>Muat Ulang</Button>
            <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-button border bg-background px-5 text-sm font-semibold hover:bg-muted">Masuk</Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!data || data.kebuns.length === 0) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
        {/* Hero organik */}
        <motion.div variants={item} className="relative overflow-hidden rounded-card border shadow-sm" whileHover={{ scale: 1.005 }} transition={{ duration: 0.3 }}>
          <div className="relative h-[220px] w-full sm:h-[260px]">
            <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop" alt="Sawah terasering — hero organik" fill priority sizes="(max-width: 768px) 100vw, 900px" className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/70 via-[#1C1917]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-fg"><Leaf className="h-3.5 w-3.5" /> Panen Organik</span>
            <h1 className="display mt-3 text-white drop-shadow-sm">Sawah terasering, data real-time — panen lebih pasti</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/85 [text-wrap:pretty]">Pantau tandon, pH/NPK, dan PPM hidroponik — semua kebun dalam satu layar.</p>
          </div>
        </motion.div>
        <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-sans text-2xl font-bold tracking-tight [text-wrap:balance]">Ringkasan Kebun</h2>
            <p className="mt-1 text-sm leading-6 text-muted-fg [text-wrap:pretty]">Pantau tandon, pH/NPK, dan PPM hidroponik — semua kebun dalam satu layar.</p>
          </div>
          <Badge variant="success" className="gap-1.5"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live</Badge>
        </motion.div>
        <motion.div variants={item}>
          <Card className="py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary-soft-fg"><MapPin className="h-6 w-6" /></span>
            <h3 className="mt-3 font-sans text-lg font-bold [text-wrap:balance]">Belum ada kebun</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-fg [text-wrap:pretty]">Buat kebun pertama untuk mulai melihat ringkasan lahan, device, dan sensor.</p>
            <Link href="/kebuns" className="mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-button bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
              <MapPin className="h-4 w-4" /> Buat Kebun
            </Link>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  const sensorLabel = data.totalSensors === 0 ? "0" : `${data.onlineDevices} / ${data.totalDevices} device`;
  const tandonVal = data.tandonPersen !== null ? String(data.tandonPersen) : "—";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
      {toast && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-fg shadow-lg">{toast}</div>}
      {/* Hero organik */}
      <motion.div variants={item} className="relative overflow-hidden rounded-card border shadow-sm" whileHover={{ scale: 1.005 }} transition={{ duration: 0.3 }}>
        <div className="relative h-[220px] w-full sm:h-[280px]">
          <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop" alt="Sawah terasering — hero organik" fill priority sizes="(max-width: 768px) 100vw, 900px" className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/70 via-[#1C1917]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-fg"><Leaf className="h-3.5 w-3.5" /> Panen Organik</span>
          <h1 className="display mt-2 !text-white drop-shadow-sm">Sawah terasering, data real-time — panen lebih pasti</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/85 [text-wrap:pretty]">Pantau tandon, pH/NPK, dan PPM hidup — {data.kebuns.length} kebun · {data.totalLahan} lahan · {data.totalSensors} sensor terhubung.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/kebuns" className="inline-flex h-10 items-center gap-1.5 rounded-button bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover"><MapPin className="h-4 w-4" /> Kelola Kebun</Link>
            <Link href="/sensors" className="inline-flex h-10 items-center gap-1.5 rounded-button border border-white/30 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"><Activity className="h-4 w-4" /> Lihat Sensor</Link>
          </div>
        </div>
      </motion.div>
      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight [text-wrap:balance]">Ringkasan Kebun</h2>
          <p className="mt-1 text-sm leading-6 text-muted-fg [text-wrap:pretty]">
            Pantau tandon, pH/NPK, dan PPM hidroponik — semua kebun dalam satu layar.
          </p>
        </div>
        <Badge variant="success" className="gap-1.5"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live</Badge>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Kebun" value={String(data.kebuns.length)} unit="kebun" />
        <StatCard label="Lahan Aktif" value={String(data.totalLahan)} unit="lahan" />
        <StatCard label="Device" value={sensorLabel} unit="online" />
        <StatCard label="Tandon Terisi" value={tandonVal} unit={data.tandonPersen !== null ? "%" : ""} />
      </motion.div>

      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={item} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg"><Droplets className="h-4 w-4" /></span> Tandon Air</CardTitle>
              <Badge variant={data.tandonPersen !== null && data.tandonPersen < 20 ? "destructive" : "success"}>
                {data.tandonPersen === null ? "Tidak ada data" : data.tandonPersen < 20 ? "Rendah" : "Aman"}
              </Badge>
            </CardHeader>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tracking-tight">{tandonVal}{data.tandonPersen !== null ? "%" : ""}</span>
                {data.tandonPersen !== null && <span className="text-sm text-muted-fg">· live telemetry</span>}
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, data.tandonPersen ?? 0))}%` }} />
              </div>
              <p className="mt-2 text-xs leading-4 text-muted-fg [text-wrap:pretty]">{data.kebuns[0]?.lokasi ? String(data.kebuns[0].lokasi) : "—"} · {data.totalDevices} device terdaftar</p>
              <div className="mt-4 flex gap-2">
                <Link href="/sensors" className="inline-flex h-11 flex-1 items-center justify-center rounded-button bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
                  Lihat Sensor
                </Link>
                <Link href="/kebuns" className="inline-flex h-11 items-center justify-center rounded-button border bg-background px-4 text-sm font-semibold hover:bg-muted">
                  Kelola Kebun
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-soft text-[#92400E]"><Beaker className="h-4 w-4" /></span> pH & NPK Tanah</CardTitle>
              <Badge variant="warning">Butuh device</Badge>
            </CardHeader>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-muted px-3 py-3 text-sm leading-5 text-muted-fg [text-wrap:pretty]">
                Data pH/NPK muncul setelah sensor terpasang di lahan. Tambahkan device lalu sensor pH/NPK.
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: "N", v: "—", u: "ppm" },
                  { k: "P", v: "—", u: "ppm" },
                  { k: "K", v: "—", u: "ppm" },
                ].map((x) => (
                  <div key={x.k} className="rounded-lg border bg-background px-3 py-3 text-center">
                    <p className="text-xs font-semibold text-muted-fg">{x.k}</p>
                    <p className="font-mono text-lg font-bold">{x.v}</p>
                    <p className="text-xs text-muted-fg">{x.u}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-4 text-muted-fg [text-wrap:pretty]">{data.kebuns.length} kebun · {data.totalLahan} lahan · {data.totalSensors} sensor</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-fg"><Leaf className="h-4 w-4" /></span> PPM Hidroponik</CardTitle>
              <Badge variant="primary">TDS</Badge>
            </CardHeader>
            <div className="mt-4">
              <p className="text-sm leading-6 text-muted-fg [text-wrap:pretty]">Nilai PPM/TDS tampil setelah sensor hidroponik mengirim telemetry.</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold tracking-tight">—</span>
                <span className="text-sm text-muted-fg">ppm</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-0 rounded-full bg-accent" />
              </div>
              <p className="mt-2 text-xs leading-4 text-muted-fg [text-wrap:pretty]">{data.totalSensors} sensor terdaftar — pasang sensor PPM untuk melihat grafik.</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Kelola Kebun", desc: "Tambah lahan, atur anggota", href: "/kebuns", cta: "Buka Kebun", Icon: MapPin },
          { title: "Konfigurasi Sensor", desc: "Threshold, kalibrasi, interval", href: "/sensors", cta: "Atur Sensor", Icon: Activity },
          { title: "Panduan Tanaman", desc: "60+ komoditas Indonesia", href: "/tanaman", cta: "Lihat Tanaman", Icon: Sprout },
        ].map((c) => (
          <motion.div key={c.title} variants={item} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <Card className="flex h-full flex-col">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-fg"><c.Icon className="h-5 w-5" /></span>
              <CardTitle className="mt-3 [text-wrap:balance]">{c.title}</CardTitle>
              <CardDesc className="mt-1 [text-wrap:pretty]">{c.desc}</CardDesc>
              <Link
                href={c.href}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-button border bg-background px-4 text-sm font-semibold hover:bg-muted"
              >
                {c.cta}
              </Link>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
