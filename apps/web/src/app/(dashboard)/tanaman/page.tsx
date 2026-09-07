"use client";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Sprout, Leaf, SearchX, AlertTriangle, Beaker, Lightbulb, ArrowRight, MapPin, CalendarDays, Droplets } from "lucide-react";
import { api, type Crop } from "@/lib/api";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } } };

export default function TanamanPage() {
  const [q, setQ] = useState("");
  const [crops, setCrops] = useState<Crop[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<Crop | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get<Crop[]>("/crops").then((data) => { if (alive) setCrops(data); }).catch((e: { message?: string }) => { if (alive) setErr(e.message ?? "Gagal memuat tanaman"); });
    return () => { alive = false; };
  }, []);

  async function openDetail(c: Crop) {
    setSelected(c);
    setDetail(null);
    setDetailLoading(true);
    try { const d = await api.get<any>(`/crops/${c.slug}`); setDetail(d); } catch { setDetail(c as any); } finally { setDetailLoading(false); }
  }

  const filtered = useMemo(() => {
    if (!crops) return [];
    if (!q.trim()) return crops;
    const t = q.toLowerCase();
    return crops.filter((c) => c.name.toLowerCase().includes(t) || c.slug.toLowerCase().includes(t) || (c.scientificName ?? "").toLowerCase().includes(t) || c.category.toLowerCase().includes(t));
  }, [crops, q]);

  const isLoading = crops === null && !err;

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
            <Card key={i} className="space-y-3"><Skeleton className="h-5 w-24" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></Card>
          ))}
        </div>
      ) : err ? (
        <motion.div variants={item}>
          <EmptyState variant="offline" title="Gagal memuat tanaman" description={`${err} — pastikan backend aktif.`} icon={<AlertTriangle className="h-4 w-4" />} />
          <div className="mt-4 flex justify-center"><Button variant="secondary" onClick={() => location.reload()}>Coba Lagi</Button></div>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item}><EmptyState variant="search" title="Tidak ada hasil" description={`Tidak ditemukan tanaman untuk "${q}".`} actionLabel="Hapus Pencarian" onAction={() => setQ("")} icon={<SearchX className="h-4 w-4" />} /></motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <motion.div key={c.slug} variants={item}>
              <Card className="flex h-full flex-col hover:border-royal-violet/20 transition-colors">
                {(c.imageUrl) && (
                  <div className="relative -m-4 mb-3 h-32 overflow-hidden rounded-t-card">
                    <Image src={c.imageUrl} alt={c.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/50 to-transparent" />
                    <div className="absolute bottom-2 left-2 rounded-pill bg-paper-white px-2 py-1 text-xs font-semibold text-ink-charcoal">{c.category}</div>
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-1.5 text-base [text-wrap:balance]"><Sprout className="h-4 w-4 text-royal-violet" />{c.name}</CardTitle>
                  {!c.imageUrl && <Badge variant="lilac">{c.category}</Badge>}
                </div>
                {c.scientificName && <p className="mt-1 font-mono text-xs italic text-stone-gray [text-wrap:pretty]">{c.scientificName}</p>}
                <CardDesc className="mt-2 line-clamp-3 [text-wrap:pretty]">{c.description ?? "—"}</CardDesc>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.iklimOptimal && <span className="rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs font-medium text-stone-gray">{c.iklimOptimal}</span>}
                  {c.ketinggianOptimal && <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">{c.ketinggianOptimal}</span>}
                </div>
                <div className="mt-auto pt-4">
                  <Button variant="secondary" className="w-full gap-1.5" onClick={() => openDetail(c)}><Leaf className="h-4 w-4" /> Lihat Panduan</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-card border border-soft-mist bg-paper-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Sinematik header — golden hour */}
            <div className="relative overflow-hidden">
              {(selected as any).imageUrl ? (
                <div className="relative h-48 w-full">
                  <Image src={(selected as any).imageUrl} alt={selected.name} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/70 via-ink-charcoal/20 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <div className="inline-flex items-center gap-1.5 rounded-pill bg-paper-white px-2.5 py-1 text-xs font-semibold text-ink-charcoal"><Sprout className="h-3.5 w-3.5 text-royal-violet" /> {selected.category}</div>
                    <h3 className="mt-2 font-sans text-2xl font-bold tracking-tight text-paper-white [text-wrap:balance]">{selected.name}</h3>
                    {selected.scientificName && <p className="font-mono text-xs italic text-paper-white/80">{selected.scientificName}</p>}
                  </div>
                  <button onClick={() => setSelected(null)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-paper-white/30 bg-paper-white/10 text-paper-white backdrop-blur hover:bg-paper-white/20">✕</button>
                </div>
              ) : (
                <div className="bg-warm-parchment p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="flex items-center gap-2 font-sans text-lg font-bold [text-wrap:balance]"><Sprout className="h-5 w-5 text-midnight-wine" /> {selected.name}<Badge variant="lilac">{selected.category}</Badge></h3>
                      {selected.scientificName && <p className="mt-1 font-mono text-xs italic text-stone-gray">{selected.scientificName}</p>}
                    </div>
                    <button onClick={() => setSelected(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-soft-mist bg-paper-white hover:bg-warm-parchment">✕</button>
                  </div>
                </div>
              )}
              {/* floating card over photo like hero */}
              {(selected as any).imageUrl && (
                <div className="mx-4 -mt-4 relative z-10 rounded-card border border-soft-mist bg-paper-white p-3 shadow-sm">
                  <p className="text-sm leading-6 text-stone-gray [text-wrap:pretty]">{selected.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.iklimOptimal && <span className="rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs text-stone-gray">{selected.iklimOptimal}</span>}
                    {selected.ketinggianOptimal && <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">{selected.ketinggianOptimal}</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link href="/kalender" onClick={() => setSelected(null)} className="inline-flex h-9 items-center gap-1.5 rounded-small-button bg-midnight-wine px-3 text-xs font-semibold text-paper-white hover:bg-[#2f151a]"><CalendarDays className="h-3.5 w-3.5" /> Catat di Kalender</Link>
                    <span className="inline-flex items-center gap-1 rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs text-stone-gray"><Droplets className="h-3 w-3" /> 60+ komoditas</span>
                  </div>
                </div>
              )}
              {! (selected as any).imageUrl && (
                <div className="border-b border-soft-mist bg-warm-parchment p-5">
                  <p className="text-sm leading-6 text-stone-gray [text-wrap:pretty]">{selected.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.iklimOptimal && <span className="rounded-pill border border-soft-mist bg-paper-white px-2.5 py-1 text-xs text-stone-gray">{selected.iklimOptimal}</span>}
                    {selected.ketinggianOptimal && <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">{selected.ketinggianOptimal}</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5">
              {detailLoading ? (
                <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
              ) : detail ? (
                <div className="space-y-6">
                  {(detail as any).sowingGuides?.length > 0 && (
                    <div className="rounded-card border border-soft-mist bg-warm-parchment p-4">
                      <h4 className="flex items-center gap-2 font-sans text-sm font-bold tracking-tight text-ink-charcoal"><Leaf className="h-4 w-4 text-royal-violet" /> Penyemaian — Media & Langkah</h4>
                      {(detail as any).sowingGuides.map((s: any) => {
                        const metodeKey = String(s.metode ?? "BIJI").toUpperCase();
                        const metodeCls = metodeKey === "STEK" ? "bg-midnight-wine text-paper-white" : metodeKey === "CANGKOK" ? "bg-lilac-mist text-ink-charcoal border border-royal-violet/20" : metodeKey === "OKULASI" ? "bg-royal-violet text-paper-white" : "bg-paper-white text-ink-charcoal border border-soft-mist";
                        const rawSumber: unknown = s.sumber;
                        let sumberItems: Array<{ label: string; url?: string }> | null = null;
                        if (typeof rawSumber === "string" && (rawSumber as string).trim()) { sumberItems = [{ label: rawSumber as string }]; } else if (Array.isArray(rawSumber) && rawSumber.length > 0) {
                          const parsed = (rawSumber as unknown[]).map((it: unknown, idx: number) => { if (typeof it === "string") return { label: it }; if (it && typeof it === "object") { const o = it as Record<string, unknown>; const label = (o.nama ?? o.judul ?? o.title ?? o.name ?? `Sumber ${idx + 1}`) as string; const url = (o.url ?? o.link ?? o.href) as string | undefined; return { label: String(label), url: url ? String(url) : undefined }; } return null; }).filter(Boolean) as Array<{ label: string; url?: string }>;
                          if (parsed.length > 0) sumberItems = parsed;
                        }
                        return (
                          <div key={s.id} className="mt-3 space-y-2 text-sm leading-6">
                            <span className={["inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold leading-none", metodeCls].join(" ")}>Metode: {metodeKey}</span>
                            <p><span className="font-semibold text-ink-charcoal">Media tanam:</span> <span className="text-stone-gray">{s.mediaTanam}</span></p>
                            <p className="text-stone-gray"><span className="font-semibold text-ink-charcoal">Durasi:</span> {s.durasiHari} hari · <span className="font-semibold text-ink-charcoal">Suhu:</span> {s.suhuOptimal} · <span className="font-semibold text-ink-charcoal">Kelembapan:</span> {s.kelembaban}</p>
                            <ol className="list-decimal pl-5 marker:text-royal-violet">
                              {(s.langkah as string[]).map((l: string, i: number) => (<li key={i} className="text-stone-gray">{l}</li>))}
                            </ol>
                            <p className="rounded-lg bg-lilac-mist px-3 py-2 text-xs font-medium text-ink-charcoal">Siap tanam: {s.siapTanamIndikator}</p>
                            {Array.isArray((s as any).tipsCepat) && (s as any).tipsCepat.length > 0 && (
                              <div className="rounded-lg border border-royal-violet/15 bg-paper-white px-3 py-2">
                                <p className="flex items-center gap-1.5 text-xs font-bold text-royal-violet"><Lightbulb className="h-3.5 w-3.5" /> Tips Cepat</p>
                                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5 text-stone-gray marker:text-royal-violet">
                                  {((s as any).tipsCepat as string[]).map((t: string, i: number) => (<li key={i}>{t}</li>))}
                                </ul>
                              </div>
                            )}
                            {sumberItems ? (
                              <div className="rounded-lg border border-soft-mist bg-paper-white px-3 py-2">
                                <p className="text-xs font-bold text-ink-charcoal">Sumber:</p>
                                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5">
                                  {sumberItems.map((src, i) => (
                                    <li key={i} className="break-words text-stone-gray">
                                      {src.url ? (<a href={src.url} target="_blank" rel="noopener noreferrer" className="font-medium text-royal-violet underline decoration-royal-violet/30 underline-offset-2 hover:text-midnight-wine">{src.label}</a>) : (<span>{src.label}</span>)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (<p className="text-xs text-stone-gray">Sumber: Data verifikasi internal</p>)}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(detail as any).growingGuides?.length > 0 && (
                    <div className="space-y-3">
                      {(detail as any).growingGuides.map((g: any) => (
                        <div key={g.id} className="rounded-card border border-soft-mist bg-paper-white p-4">
                          <h4 className="font-sans text-sm font-bold tracking-tight text-ink-charcoal flex items-center gap-2">
                            {g.fase === "VEGETATIF" ? <Sprout className="h-4 w-4 text-royal-violet" /> : <Leaf className="h-4 w-4 text-midnight-wine" />} Fase {g.fase} — <span className="font-mono text-royal-violet">{g.panenHariRange}</span>
                          </h4>
                          <p className="mt-1 text-xs text-stone-gray">Penyiraman: {g.penyiraman}</p>
                          <div className="mt-2 space-y-1.5">
                            {(g.pupuk as any[]).map((p: any, i: number) => (
                              <div key={i} className="rounded-lg border border-soft-mist bg-warm-parchment px-3 py-2 text-xs">
                                <span className="font-bold text-ink-charcoal">{p.nama}</span> <span className="text-stone-gray">— {p.takaran} · tiap {p.intervalHari} hari · {p.cara}</span>
                              </div>
                            ))}
                          </div>
                          {g.hama?.length > 0 && <p className="mt-2 text-xs text-stone-gray">Hama: {(g.hama as string[]).join(", ")}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {(detail as any).hydroponicGuides?.length > 0 && (
                    <div className="rounded-card border border-royal-violet/15 bg-lilac-mist/30 p-4">
                      <h4 className="font-sans text-sm font-bold tracking-tight text-ink-charcoal flex items-center gap-2"><Beaker className="h-4 w-4 text-royal-violet" /> Hidroponik</h4>
                      {(detail as any).hydroponicGuides.map((h: any) => (
                        <div key={h.id} className="mt-2 text-sm leading-6">
                          <p className="text-stone-gray"><span className="font-bold text-ink-charcoal">Sistem:</span> {h.sistem} · <span className="font-bold text-ink-charcoal">PPM:</span> <span className="font-mono text-royal-violet">{h.ppmRange}</span> · <span className="font-bold text-ink-charcoal">pH:</span> <span className="font-mono">{h.phRange}</span></p>
                          <p className="text-xs text-stone-gray">Nutrisi: {(h.nutrisi as string[]).join(", ")} · Durasi {h.durasiHari} hari</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (<p className="text-sm text-stone-gray">Gagal memuat panduan.</p>)}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
