"use client";
import { motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { Sprout, Leaf, SearchX, AlertTriangle } from "lucide-react";
import { api, type Crop } from "@/lib/api";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };

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
          <h1 className="flex items-center gap-2 font-sans text-2xl font-bold tracking-tight [text-wrap:balance]">
            <Sprout className="h-6 w-6 text-primary" /> Tanaman
          </h1>
          <p className="mt-1 text-sm leading-6 text-muted-fg [text-wrap:pretty]">60+ komoditas Indonesia — panduan semai, pupuk, dan hidroponik.</p>
        </div>
        <Badge variant="primary" className="gap-1.5">
          <Leaf className="h-3.5 w-3.5" />
          {crops ? `${filtered.length} komoditas` : "Memuat..."}
        </Badge>
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
        <motion.div variants={item}>
          <EmptyState
            variant="offline"
            title="Gagal memuat tanaman"
            description={`${err} — pastikan backend di ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3101"} aktif.`}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={() => location.reload()}>
              Coba Lagi
            </Button>
          </div>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item}>
          <EmptyState
            variant="search"
            title="Tidak ada hasil"
            description={`Tidak ditemukan tanaman untuk "${q}". Coba kata kunci lain.`}
            actionLabel="Hapus Pencarian"
            onAction={() => setQ("")}
            icon={<SearchX className="h-4 w-4" />}
          />
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((c) => (
            <motion.div key={c.slug} variants={item} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-1.5 text-base [text-wrap:balance]">
                    <Sprout className="h-4 w-4 text-primary" />
                    {c.name}
                  </CardTitle>
                  <Badge variant="neutral">{c.category}</Badge>
                </div>
                {c.scientificName && <p className="mt-1 font-mono text-xs italic text-muted-fg [text-wrap:pretty]">{c.scientificName}</p>}
                <CardDesc className="mt-2 line-clamp-3 [text-wrap:pretty]">{c.description ?? "—"}</CardDesc>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.iklimOptimal && <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{c.iklimOptimal}</span>}
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="secondary" className="w-full gap-1.5">
                    <Leaf className="h-4 w-4" /> Lihat Panduan
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
