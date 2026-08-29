"use client";
import { motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { api, type Crop } from "@/lib/api";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function TanamanPage() {
  const [q, setQ] = useState("");
  const [crops, setCrops] = useState<Crop[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .get<Crop[]>("/crops")
      .then((data) => {
        if (alive) setCrops(data);
      })
      .catch((e: { message?: string }) => {
        if (alive) setErr(e.message ?? "Gagal memuat tanaman");
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!crops) return [];
    if (!q.trim()) return crops;
    const t = q.toLowerCase();
    return crops.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        c.slug.toLowerCase().includes(t) ||
        (c.scientificName ?? "").toLowerCase().includes(t) ||
        c.category.toLowerCase().includes(t),
    );
  }, [crops, q]);

  const isLoading = crops === null && !err;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight">Tanaman</h1>
          <p className="mt-1 text-sm text-muted-fg">60+ komoditas Indonesia — panduan semai, pupuk, dan hidroponik.</p>
        </div>
        <Badge variant="primary">{crops ? `${filtered.length} komoditas` : "Memuat..."}</Badge>
      </motion.div>

      <motion.div variants={item} className="max-w-md">
        <Input placeholder="Cari: kangkung, padi, cabai..." value={q} onChange={(e) => setQ(e.target.value)} />
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : err ? (
        <Card className="py-10 text-center">
          <p className="text-3xl">⚠️</p>
          <h3 className="mt-2 font-sans font-semibold">Gagal memuat tanaman</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-fg">{err} — pastikan backend di {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3101"} aktif.</p>
          <Button variant="secondary" className="mt-4" onClick={() => location.reload()}>
            Coba Lagi
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-4xl">🌱</p>
          <h3 className="mt-3 font-sans font-semibold">Tidak ada hasil</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-fg">
            Tidak ditemukan tanaman untuk &quot;{q}&quot;. Coba kata kunci lain.
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => setQ("")}>
            Hapus Pencarian
          </Button>
        </Card>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <motion.div key={c.slug} variants={item}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <Badge variant="neutral">{c.category}</Badge>
                </div>
                {c.scientificName && (
                  <p className="mt-1 font-mono text-xs italic text-muted-fg">{c.scientificName}</p>
                )}
                <CardDesc className="mt-2 line-clamp-3">{c.description ?? "—"}</CardDesc>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.iklimOptimal && (
                    <span className="rounded-full bg-muted px-2 py-1 text-xs">{c.iklimOptimal}</span>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="secondary" className="w-full">
                    Lihat Panduan
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
