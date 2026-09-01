"use client";
import { motion } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { Sprout, Leaf, SearchX, AlertTriangle, Beaker } from "lucide-react";
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
  const [selected, setSelected] = useState<Crop | null>(null);
  const [detail, setDetail] = useState<Crop | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  async function openDetail(c: Crop) {
    setSelected(c);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await api.get<Crop>(`/crops/${c.slug}`);
      setDetail(d);
    } catch {
      setDetail(c);
    } finally {
      setDetailLoading(false);
    }
  }

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
                  <Button variant="secondary" className="w-full gap-1.5" onClick={() => openDetail(c)}>
                    <Leaf className="h-4 w-4" /> Lihat Panduan
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-card border bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b bg-background p-5">
              <div>
                <h3 className="flex items-center gap-2 font-sans text-lg font-bold [text-wrap:balance]">
                  <Sprout className="h-5 w-5 text-primary" /> {selected.name}
                  <Badge variant="neutral">{selected.category}</Badge>
                </h3>
                {selected.scientificName && <p className="mt-1 font-mono text-xs italic text-muted-fg">{selected.scientificName}</p>}
                <p className="mt-2 text-sm leading-6 text-muted-fg [text-wrap:pretty]">{selected.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.iklimOptimal && <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{selected.iklimOptimal}</span>}
                  {selected.ketinggianOptimal && <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-fg">{selected.ketinggianOptimal}</span>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border hover:bg-muted">
                ✕
              </button>
            </div>

            <div className="p-5">
              {detailLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : detail ? (
                <div className="space-y-6">
                  {(detail as any).sowingGuides?.length > 0 && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h4 className="flex items-center gap-2 font-semibold text-sm">
                        <Leaf className="h-4 w-4 text-primary" /> Penyemaian — Media & Langkah
                      </h4>
                      {(detail as any).sowingGuides.map((s: any) => {
                        const metodeKey = String(s.metode ?? "BIJI").toUpperCase();
                        const metodeCls =
                          metodeKey === "STEK"
                            ? "bg-[#FFF0EB] text-[#9C4221] border border-[#FFC8A2]/60"
                            : metodeKey === "CANGKOK"
                              ? "bg-warning-soft text-[#92400E] border border-warning/20"
                              : metodeKey === "OKULASI"
                                ? "bg-info-soft text-info border border-info/20"
                                : "bg-success-soft text-success border border-success/20";
                        const rawSumber: unknown = s.sumber;
                        let sumberItems: Array<{ label: string; url?: string }> | null = null;
                        if (typeof rawSumber === "string" && (rawSumber as string).trim()) {
                          sumberItems = [{ label: rawSumber as string }];
                        } else if (Array.isArray(rawSumber) && rawSumber.length > 0) {
                          const parsed = (rawSumber as unknown[])
                            .map((it: unknown, idx: number) => {
                              if (typeof it === "string") return { label: it };
                              if (it && typeof it === "object") {
                                const o = it as Record<string, unknown>;
                                const label = (o.nama ?? o.judul ?? o.title ?? o.name ?? `Sumber ${idx + 1}`) as string;
                                const url = (o.url ?? o.link ?? o.href) as string | undefined;
                                return { label: String(label), url: url ? String(url) : undefined };
                              }
                              return null;
                            })
                            .filter(Boolean) as Array<{ label: string; url?: string }>;
                          if (parsed.length > 0) sumberItems = parsed;
                        }
                        return (
                          <div key={s.id} className="mt-3 space-y-2 text-sm leading-6">
                            <span
                              className={["inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold leading-none", metodeCls].join(" ")}
                            >
                              Metode: {metodeKey}
                            </span>
                            <p>
                              <span className="font-semibold">Media tanam:</span> {s.mediaTanam}
                            </p>
                            <p>
                              <span className="font-semibold">Durasi:</span> {s.durasiHari} hari · <span className="font-semibold">Suhu:</span> {s.suhuOptimal} ·{" "}
                              <span className="font-semibold">Kelembapan:</span> {s.kelembaban}
                            </p>
                            <ol className="list-decimal pl-5">
                              {(s.langkah as string[]).map((l: string, i: number) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ol>
                            <p className="rounded bg-primary-soft px-3 py-2 text-xs font-medium text-primary-soft-fg">Siap tanam: {s.siapTanamIndikator}</p>
                            {sumberItems ? (
                              <div className="rounded border bg-background px-3 py-2">
                                <p className="text-xs font-semibold">Sumber:</p>
                                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5">
                                  {sumberItems.map((src, i) => (
                                    <li key={i} className="break-words">
                                      {src.url ? (
                                        <a
                                          href={src.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="underline decoration-border underline-offset-2 hover:text-foreground"
                                        >
                                          {src.label}
                                        </a>
                                      ) : (
                                        <span>{src.label}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-fg">Sumber: Data verifikasi internal</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(detail as any).growingGuides?.length > 0 && (
                    <div className="space-y-3">
                      {(detail as any).growingGuides.map((g: any) => (
                        <div key={g.id} className="rounded-lg border p-4">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            {g.fase === "VEGETATIF" ? <Sprout className="h-4 w-4 text-success" /> : <Leaf className="h-4 w-4 text-accent" />}
                            Fase {g.fase} — {g.panenHariRange}
                          </h4>
                          <p className="mt-1 text-xs text-muted-fg">Penyiraman: {g.penyiraman}</p>
                          <div className="mt-2 space-y-1.5">
                            {(g.pupuk as any[]).map((p: any, i: number) => (
                              <div key={i} className="rounded bg-muted px-3 py-2 text-xs">
                                <span className="font-semibold">{p.nama}</span> — {p.takaran} · tiap {p.intervalHari} hari · {p.cara}
                              </div>
                            ))}
                          </div>
                          {g.hama?.length > 0 && <p className="mt-2 text-xs text-muted-fg">Hama: {(g.hama as string[]).join(", ")}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {(detail as any).hydroponicGuides?.length > 0 && (
                    <div className="rounded-lg border bg-accent-soft/30 p-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Beaker className="h-4 w-4 text-accent" /> Hidroponik
                      </h4>
                      {(detail as any).hydroponicGuides.map((h: any) => (
                        <div key={h.id} className="mt-2 text-sm leading-6">
                          <p>
                            <span className="font-semibold">Sistem:</span> {h.sistem} · <span className="font-semibold">PPM:</span> {h.ppmRange} ·{" "}
                            <span className="font-semibold">pH:</span> {h.phRange}
                          </p>
                          <p className="text-xs text-muted-fg">Nutrisi: {(h.nutrisi as string[]).join(", ")} · Durasi {h.durasiHari} hari</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-fg">Gagal memuat panduan.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
