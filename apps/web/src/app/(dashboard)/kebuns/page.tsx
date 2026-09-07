"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MapPin, Plus, X, AlertTriangle, ArrowRight, Leaf, Sprout } from "lucide-react";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, type Kebun } from "@/lib/api";
import Link from "next/link";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

function displayKebun(k: Kebun) {
  const name = (k.nama as string) ?? (k.name as string) ?? "Kebun";
  const countLahan = k._count?.lahans ?? (Array.isArray(k.lahans) ? (k.lahans as unknown[]).length : 0);
  const countDevice = k._count?.devices ?? (Array.isArray(k.devices) ? (k.devices as unknown[]).length : 0);
  return { name, lokasi: (k.lokasi as string) ?? "-", countLahan, countDevice };
}

export default function KebunsPage() {
  const [kebuns, setKebuns] = useState<Kebun[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nama: "", lokasi: "", luas: "", deskripsi: "" });
  const [creating, setCreating] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchKebuns() {
    setErr(null);
    try {
      const data = await api.get<Kebun[]>("/kebuns/my");
      setKebuns(data);
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status;
      if (status === 401) return;
      const msg = (e as { message?: string })?.message ?? "Gagal memuat kebun.";
      setErr(msg);
      showToast(msg);
      setKebuns([]);
    }
  }

  useEffect(() => { fetchKebuns(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    if (!form.nama.trim() || !form.lokasi.trim()) {
      const m = "Nama dan lokasi wajib diisi.";
      setFormErr(m); showToast(m); return;
    }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = { nama: form.nama.trim(), lokasi: form.lokasi.trim() };
      if (form.luas.trim()) { const n = Number(form.luas); if (!Number.isNaN(n)) payload.luas = n; }
      if (form.deskripsi.trim()) payload.deskripsi = form.deskripsi.trim();
      await api.post("/kebuns", payload);
      showToast("Kebun berhasil dibuat.");
      setShowModal(false);
      setForm({ nama: "", lokasi: "", luas: "", deskripsi: "" });
      fetchKebuns();
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Gagal membuat kebun.";
      setFormErr(msg); showToast(msg);
    } finally { setCreating(false); }
  }

  if (kebuns === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 2 }).map((_, i) => (<Skeleton key={i} className="h-40 rounded-card" />))}</div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-20 lg:pb-0">
      {toast && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-midnight-wine px-4 py-2.5 text-sm font-semibold text-paper-white">{toast}</div>}

      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-[26px] font-[460] leading-[1.1] tracking-[-0.022em] text-ink-charcoal [text-wrap:balance]">Kebun</h1>
          <p className="mt-2 text-sm leading-6 text-stone-gray [text-wrap:pretty] max-w-[60ch]">Kelola kebun dan lahan. Multi-kebun — satu akun untuk banyak lokasi.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Tambah Kebun</Button>
      </motion.div>

      {err && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" /> {err} — <button onClick={fetchKebuns} className="font-bold text-royal-violet underline">Muat ulang</button></div>
      )}

      {kebuns.length === 0 ? (
        <motion.div variants={item}>
          <EmptyState variant="kebun" title="Belum ada kebun" description="Buat kebun pertama untuk mulai mengelola lahan dan sensor. Satu kebun bisa punya banyak lahan & sensor." actionLabel="Buat Kebun Pertama" onAction={() => setShowModal(true)} icon={<MapPin className="h-4 w-4" />} />
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-4 sm:grid-cols-2">
          {kebuns.map((k) => {
            const d = displayKebun(k);
            return (
              <motion.div key={String(k.id)} variants={item}>
                <Card className="flex flex-col hover:border-royal-violet/20 transition-colors">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal"><MapPin className="h-4 w-4" /></span>
                  <CardTitle className="mt-3 [text-wrap:balance]">{d.name}</CardTitle>
                  <CardDesc className="[text-wrap:pretty]">{d.lokasi}</CardDesc>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs font-semibold text-stone-gray">{d.countLahan} lahan</span>
                    <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">{d.countDevice} device</span>
                  </div>
                  <p className="mt-3 text-xs leading-4 text-stone-gray [text-wrap:pretty]">Satu kebun, banyak lahan & sensor — kelola irigasi dan kalender tanam per-lahan.</p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/kebuns`} className="inline-flex h-11 flex-1 items-center justify-center rounded-button bg-midnight-wine px-4 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">Kelola</Link>
                    <Link href="/sensors" className="inline-flex h-11 flex-1 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white px-4 text-sm font-semibold text-ink-charcoal hover:bg-warm-parchment">Lihat Sensor</Link>
                  </div>
                  <Link href="/kalender" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-royal-violet hover:underline">Buka kalender <ArrowRight className="h-3.5 w-3.5" /></Link>
                </Card>
              </motion.div>
            );
          })}
          <motion.div variants={item}>
            <Card className="flex h-full flex-col items-center justify-center border-dashed border-soft-mist bg-paper-white py-10 text-center hover:border-royal-violet/30 transition-colors">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lilac-mist text-ink-charcoal"><Plus className="h-5 w-5" /></span>
              <p className="mt-3 font-sans text-sm font-bold text-ink-charcoal [text-wrap:balance]">Tambah Kebun Baru</p>
              <p className="mt-1 text-xs leading-4 text-stone-gray [text-wrap:pretty]">Lokasi baru, lahan baru, sensor baru</p>
              <Button variant="secondary" className="mt-4 gap-1.5" onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Buat Kebun</Button>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-card border border-soft-mist bg-paper-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal [text-wrap:balance]">Tambah Kebun</h3>
                <p className="mt-1 text-sm leading-5 text-stone-gray [text-wrap:pretty]">Isi data kebun. Anggota otomatis: Anda sebagai OWNER.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full border border-soft-mist bg-paper-white hover:bg-warm-parchment"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <Input label="Nama kebun *" placeholder="Kebun Sawah Teras" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
              <Input label="Lokasi *" placeholder="Sawah Teras, Bandung" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} required />
              <Input label="Luas (m²)" type="number" placeholder="1000" value={form.luas} onChange={(e) => setForm({ ...form, luas: e.target.value })} />
              <Textarea label="Deskripsi" placeholder="Deskripsi singkat kebun" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} />
              {formErr && <div className="flex items-center gap-1.5 rounded-lg bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive"><AlertTriangle className="h-4 w-4" /> {formErr}</div>}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit" disabled={creating} className="flex-1">{creating ? "Menyimpan..." : "Simpan Kebun"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
