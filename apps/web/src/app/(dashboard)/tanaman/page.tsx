"use client";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { container, item } from "@/lib/motion";
import { Sprout, Leaf, SearchX, AlertTriangle } from "lucide-react";
import { api, type Crop } from "@/lib/api";
import { ENDPOINTS, errorMessage } from "@/lib/endpoints";
import { useCrops } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CropCard } from "@/components/tanaman/CropCard";
import { CropDetailModal } from "@/components/tanaman/CropDetailModal";
import { parseCropDetail, type CropDetail } from "@/components/tanaman/GuideSections";

export default function TanamanPage() {
  const [q, setQ] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<CropDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data: crops, isLoading, isError, error, refetch } = useCrops();
  const err = isError ? errorMessage(error, "Gagal memuat tanaman") : null;

  const selected = useMemo(
    () => (crops ?? []).find((c) => c.slug === selectedSlug) ?? null,
    [crops, selectedSlug],
  );

  // Fetch on-demand di event handler klik (bukan effect) — lint-clean.
  async function openDetail(c: { slug: string }) {
    setSelectedSlug(c.slug);
    setDetail(null);
    setDetailLoading(true);
    const target =
      (crops ?? []).find((x) => x.slug === c.slug) ??
      ({ id: c.slug, name: c.slug, slug: c.slug, category: "-" } as Crop);
    try {
      setDetail(parseCropDetail(await api.get<unknown>(ENDPOINTS.crop(c.slug)), target));
    } catch {
      setDetail(parseCropDetail(null, target));
    } finally {
      setDetailLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!crops) return [];
    if (!q.trim()) return crops;
    const t = q.toLowerCase();
    return crops.filter((c) => c.name.toLowerCase().includes(t) || c.slug.toLowerCase().includes(t) || (c.scientificName ?? "").toLowerCase().includes(t) || c.category.toLowerCase().includes(t));
  }, [crops, q]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-20 lg:pb-0">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-sans text-[26px] font-[460] leading-[1.1] tracking-[-0.022em] text-ink-charcoal [text-wrap:balance]">
            <Sprout className="h-6 w-6 text-midnight-wine" /> Tanaman
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-gray [text-wrap:pretty] max-w-[60ch]">60+ komoditas Indonesia — panduan semai, pupuk, dan hidroponik.</p>
        </div>
        <Badge variant="lilac" className="gap-1.5"><Leaf className="h-3.5 w-3.5" />{crops ? `${filtered.length} komoditas` : "Memuat..."}</Badge>
      </motion.div>

      <motion.div variants={item} className="max-w-md">
        <Input placeholder="Cari: kangkung, padi, cabai..." value={q} onChange={(e) => setQ(e.target.value)} />
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`tanaman-skel-${i}`} className="space-y-3"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></Card>
          ))}
        </div>
      ) : err ? (
        <motion.div variants={item}>
          <EmptyState variant="offline" title="Gagal memuat tanaman" description={`${err} — pastikan backend aktif.`} icon={<AlertTriangle className="h-4 w-4" />} />
          <div className="mt-4 flex justify-center"><Button variant="secondary" onClick={() => void refetch()}>Coba Lagi</Button></div>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item}><EmptyState variant="search" title="Tidak ada hasil" description={`Tidak ditemukan tanaman untuk "${q}".`} actionLabel="Hapus Pencarian" onAction={() => setQ("")} icon={<SearchX className="h-4 w-4" />} /></motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <motion.div key={c.slug} variants={item}>
              <CropCard crop={c} onDetail={openDetail} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {selected && (
        <CropDetailModal crop={selected} detail={detail} loading={detailLoading} onClose={() => setSelectedSlug(null)} />
      )}
    </motion.div>
  );
}
