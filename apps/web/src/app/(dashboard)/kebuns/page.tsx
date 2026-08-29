"use client";
import { motion } from "motion/react";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

const MOCK_KEBUNS = [
  { id: "k1", name: "Kebun Demo", lokasi: "Sawah Teras, Bandung", lahan: 3, sensor: 6, status: "Aktif" as const },
  { id: "k2", name: "Kebun Hidroponik Atap", lokasi: "Jakarta Selatan", lahan: 2, sensor: 4, status: "Aktif" as const },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function KebunsPage() {
  const loading = false;
  const kebuns = MOCK_KEBUNS; // ganti dengan fetch /api/kebuns/my saat auth ready

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight">Kebun</h1>
          <p className="mt-1 text-sm text-muted-fg">Kelola kebun dan lahan. Multi-kebun — satu akun untuk banyak lokasi.</p>
        </div>
        <Button>＋ Tambah Kebun</Button>
      </motion.div>

      {kebuns.length === 0 ? (
        <motion.div variants={item}>
          <Card className="py-16 text-center">
            <p className="text-4xl">🏡</p>
            <h3 className="mt-3 font-sans text-lg font-bold">Belum ada kebun</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-fg">
              Buat kebun pertama untuk mulai mengelola lahan dan sensor.
            </p>
            <Button className="mt-4">＋ Buat Kebun Pertama</Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2">
          {kebuns.map((k) => (
            <motion.div key={k.id} variants={item}>
              <Card className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{k.name}</CardTitle>
                    <CardDesc>{k.lokasi}</CardDesc>
                  </div>
                  <Badge variant="success">{k.status}</Badge>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{k.lahan} lahan</span>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-soft-fg">
                    {k.sensor} sensor
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/kebuns`}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-button bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
                  >
                    Kelola
                  </Link>
                  <Button variant="secondary" className="flex-1">
                    Lihat Lahan
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
          {/* CTA add card */}
          <motion.div variants={item}>
            <Card className="flex h-full flex-col items-center justify-center border-dashed py-10 text-center">
              <p className="text-2xl">＋</p>
              <p className="mt-2 text-sm font-semibold">Tambah Kebun Baru</p>
              <p className="mt-1 text-xs text-muted-fg">Lokasi baru, lahan baru, sensor baru</p>
              <Button variant="secondary" className="mt-4">
                Buat Kebun
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
