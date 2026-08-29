"use client";
import { motion } from "motion/react";
import { Card, CardHeader, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
    <Card muted className="border-primary/10">
      <p className="text-xs font-semibold tracking-wide text-muted-fg">{label}</p>
      <p className="mt-2 font-sans text-2xl font-bold tracking-tight">
        {value} <span className="text-sm font-medium text-muted-fg">{unit}</span>
      </p>
      {trend && <p className="mt-1 font-mono text-xs text-success">{trend}</p>}
    </Card>
  );
}

export default function OverviewPage() {
  // mock – nanti ganti fetch realtime
  const loading = false;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight">Ringkasan Kebun</h1>
          <p className="mt-1 text-sm text-muted-fg">
            Pantau tandon, pH/NPK, dan PPM hidroponik — semua kebun dalam satu layar.
          </p>
        </div>
        <Badge variant="success">● Live</Badge>
      </motion.div>

      {/* Stat grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Kebun" value="1" unit="kebun" trend="↗ +1 bulan ini" />
          <StatCard label="Lahan Aktif" value="3" unit="lahan" />
          <StatCard label="Sensor Online" value="5 / 6" unit="sensor" trend="1 perlu kalibrasi" />
          <StatCard label="Tandon Terisi" value="68" unit="%" />
        </motion.div>
      )}

      {/* Tandon + pH/NPK + PPM */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>💧 Tandon Air</CardTitle>
              <Badge variant="success">Aman</Badge>
            </CardHeader>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold">68%</span>
                <span className="text-sm text-muted-fg">· 680 L / 1000 L</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-primary" />
              </div>
              <p className="mt-2 text-xs text-muted-fg">Update 2 menit lalu · estimasi habis 4 hari</p>
              <div className="mt-4 flex gap-2">
                <Link href="/sensors" className="inline-flex h-11 flex-1 items-center justify-center rounded-button bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
                  Lihat Sensor
                </Link>
                <Button variant="secondary">Atur Alert</Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>🧪 pH & NPK Tanah</CardTitle>
              <Badge variant="warning">Perlu Perhatian</Badge>
            </CardHeader>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between rounded-lg bg-muted px-3 py-2.5">
                <span className="text-sm font-medium">pH</span>
                <span className="font-mono text-sm font-bold">6.2 <span className="text-muted-fg">/ 5.5–6.5 ideal</span></span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { k: "N", v: "18", u: "ppm" },
                  { k: "P", v: "22", u: "ppm" },
                  { k: "K", v: "15", u: "ppm" },
                ].map((x) => (
                  <div key={x.k} className="rounded-lg border bg-background px-3 py-3 text-center">
                    <p className="text-xs font-semibold text-muted-fg">{x.k}</p>
                    <p className="font-mono text-lg font-bold">{x.v}</p>
                    <p className="text-xs text-muted-fg">{x.u}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-fg">Lahan A1 — Sawah Teras · 10 menit lalu</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>🥬 PPM Hidroponik</CardTitle>
              <Badge variant="primary">NFT · Kangkung</Badge>
            </CardHeader>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold">980</span>
                <span className="text-sm text-muted-fg">ppm · target 800–1200</span>
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="rounded-full bg-success-soft px-2 py-1 font-semibold text-success">pH air 6.0</span>
                <span className="rounded-full bg-muted px-2 py-1">Suhu 27°C</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[72%] rounded-full bg-accent" />
              </div>
              <p className="mt-2 text-xs text-muted-fg">Auto-dosing aktif · EC 1.4 mS/cm</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Kelola Kebun", desc: "Tambah lahan, atur anggota", href: "/kebuns", cta: "Buka Kebun" },
          { title: "Konfigurasi Sensor", desc: "Threshold, kalibrasi, interval", href: "/sensors", cta: "Atur Sensor" },
          { title: "Panduan Tanaman", desc: "60+ komoditas Indonesia", href: "/tanaman", cta: "Lihat Tanaman" },
        ].map((c) => (
          <Card key={c.title} className="flex flex-col">
            <CardTitle>{c.title}</CardTitle>
            <CardDesc className="mt-1">{c.desc}</CardDesc>
            <Link
              href={c.href}
              className="mt-4 inline-flex h-11 items-center justify-center rounded-button border bg-background px-4 text-sm font-semibold hover:bg-muted"
            >
              {c.cta}
            </Link>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}
