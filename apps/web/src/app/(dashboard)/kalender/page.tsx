"use client";
import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { CalendarDays, Plus, Search, Sprout } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast, useToast } from "@/components/ui/Toast";
import { useKalender } from "@/hooks/useKalender";
import { CalendarGrid } from "@/components/kalender/CalendarGrid";
import { RencanaCard } from "@/components/kalender/RencanaCard";
import { RencanaForm } from "@/components/kalender/RencanaForm";
import type { Rencana } from "@/lib/kalender";

export default function KalenderPage() {
  const { toast, showToast } = useToast();
  const k = useKalender(showToast);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Rencana | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return k.rencana;
    const t = q.toLowerCase();
    return k.rencana.filter((r) => r.cropName.toLowerCase().includes(t) || r.lahanNama.toLowerCase().includes(t) || r.kebunNama.toLowerCase().includes(t));
  }, [k.rencana, q]);

  function openCreate() { setEditing(null); setShowForm(true); }
  function startEdit(r: Rencana) { setEditing(r); setShowForm(true); }

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <Toast message={toast} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-sans text-[26px] font-[460] leading-[1.1] tracking-[-0.022em] text-ink-charcoal [text-wrap:balance]">
            <CalendarDays className="h-6 w-6 text-midnight-wine" /> Kalender Tanam
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-gray [text-wrap:pretty] max-w-[60ch]">
            Catat semai → prediksi pindah tanam (+durasi semai) → prediksi panen (+panen range). Data dinamis dari API.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Catat Semai</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">● Semai</span>
        <span className="rounded-pill bg-royal-violet px-2.5 py-1 text-xs font-semibold text-paper-white">● Prediksi Tanam</span>
        <span className="rounded-pill bg-midnight-wine px-2.5 py-1 text-xs font-semibold text-paper-white">● Prediksi Panen</span>
        <span className="rounded-pill border border-soft-mist bg-paper-white px-2.5 py-1 text-xs font-semibold text-ink-charcoal">● Tanam aktual</span>
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-stone-gray" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari tanaman / lahan" className="h-9 w-56 rounded-small-button border border-soft-mist bg-paper-white pl-8 pr-3 text-sm placeholder:text-stone-gray/60 focus:border-royal-violet focus:outline-none focus:ring-2 focus:ring-royal-violet/20" />
          </div>
        </div>
      </div>

      <CalendarGrid month={k.month} onMonth={k.setMonth} rencana={k.rencana} loading={k.loading} selectedDay={k.selectedDay} onSelectDay={k.setSelectedDay} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">Daftar Budidaya</h3>
          <span className="text-xs text-stone-gray">{k.loading ? "memuat..." : `${filtered.length} rencana`}</span>
        </div>
        {k.loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={`rencana-skel-${i}`} className="h-48 rounded-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lilac-mist text-ink-charcoal"><Sprout className="h-6 w-6" /></span>
            <h4 className="mt-3 font-sans font-semibold text-ink-charcoal">Belum ada catatan</h4>
            <p className="mx-auto mt-1 max-w-md text-sm text-stone-gray [text-wrap:pretty]">Klik Catat Semai — pilih lahan & tanaman & tanggal semai, sistem otomatis prediksi hari terbaik pindah tanam dan tanggal panen dari panduan 60+ komoditas. Data tersimpan di server, bukan di browser.</p>
            <Button onClick={openCreate} className="mt-4 gap-1.5"><Plus className="h-4 w-4" /> Catat Semai Pertama</Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <RencanaCard key={r.id} rencana={r} onMarkTanam={(id) => void k.markTanam(id)} onMarkPanen={(id) => void k.markPanen(id)} onEdit={startEdit} onDelete={(id) => void k.removeRencana(id)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <RencanaForm crops={k.crops} lahans={k.lahans} initial={editing} onClose={() => setShowForm(false)} onSave={k.saveRencana} />
        )}
      </AnimatePresence>
    </div>
  );
}
