"use client";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { eventsOn, formatIndo, isSameDay, type Rencana } from "@/lib/kalender";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function eventLabel(r: Rencana, iso: string): { label: string; cls: string } {
  if (r.tanggalSemai === iso) return { label: "Semai", cls: "bg-lilac-mist text-ink-charcoal" };
  if (r.tanggalTanam === iso) return { label: "Tanam", cls: "bg-paper-white border border-soft-mist text-ink-charcoal" };
  if (r.prediksi.tanam === iso) return { label: "Pred. Tanam", cls: "bg-royal-violet text-paper-white" };
  if (r.prediksi.panenAvg === iso || r.prediksi.panenMin === iso) return { label: "Pred. Panen", cls: "bg-midnight-wine text-paper-white" };
  return { label: "•", cls: "bg-paper-white border border-soft-mist text-ink-charcoal" };
}

export function CalendarGrid({ month, onMonth, rencana, loading, selectedDay, onSelectDay }: {
  month: Date; onMonth: (d: Date) => void; rencana: Rencana[]; loading: boolean;
  selectedDay: string | null; onSelectDay: (iso: string | null) => void;
}) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const startIdx = (new Date(y, m, 1).getDay() + 6) % 7; // Senin=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = month.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const dayDetail = selectedDay ? eventsOn(rencana, selectedDay) : [];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-soft-mist bg-warm-parchment px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => onMonth(new Date(y, m - 1, 1))} aria-label="Bulan sebelumnya" className="flex h-8 w-8 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white hover:bg-warm-parchment"><ChevronLeft className="h-4 w-4" /></button>
            <h2 className="min-w-[160px] text-center font-sans text-base font-bold capitalize tracking-tight text-ink-charcoal">{monthLabel}</h2>
            <button onClick={() => onMonth(new Date(y, m + 1, 1))} aria-label="Bulan berikutnya" className="flex h-8 w-8 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white hover:bg-warm-parchment"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={() => { const n = new Date(); onMonth(new Date(n.getFullYear(), n.getMonth(), 1)); }} className="rounded-pill border border-soft-mist bg-paper-white px-3 py-1.5 text-xs font-semibold hover:bg-warm-parchment">Hari ini</button>
            <Badge variant="neutral" className="gap-1"><Clock className="h-3 w-3" /> {loading ? "memuat..." : `${rencana.length} rencana`}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-soft-mist">
          {WEEKDAYS.map((d) => (
            <div key={d} className="bg-warm-parchment py-2 text-center text-xs font-semibold tracking-wide text-stone-gray">{d}</div>
          ))}
          {loading ? (
            Array.from({ length: 35 }).map((_, i) => <Skeleton key={`cal-skel-${i}`} className="min-h-[96px] bg-paper-white" />)
          ) : cells.map((d, idx) => {
            if (!d) return <div key={`cal-empty-${idx}`} className="min-h-[96px] bg-warm-parchment" />;
            const iso = d.toISOString().slice(0, 10);
            const evs = eventsOn(rencana, iso);
            const isToday = isSameDay(iso, new Date());
            const isSelected = selectedDay === iso;
            return (
              <button
                key={iso}
                onClick={() => onSelectDay(isSelected ? null : iso)}
                className={["min-h-[96px] bg-paper-white p-1.5 text-left transition-colors hover:bg-lilac-mist/20", isToday ? "ring-1 ring-inset ring-royal-violet" : "", isSelected ? "bg-lilac-mist/30" : ""].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className={["flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", isToday ? "bg-midnight-wine text-paper-white" : "text-ink-charcoal"].join(" ")}>{d.getDate()}</span>
                  {evs.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-royal-violet" />}
                </div>
                <div className="mt-1 space-y-1">
                  {evs.slice(0, 3).map((e) => {
                    const { label, cls } = eventLabel(e, iso);
                    return <div key={`${e.id}_${label}`} className={["truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none", cls].join(" ")}>{label}: {e.cropName}</div>;
                  })}
                  {evs.length > 3 && <div className="text-[10px] font-medium text-stone-gray">+{evs.length - 3} lagi</div>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="rounded-card border border-soft-mist bg-paper-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-sm font-bold tracking-tight text-ink-charcoal">{formatIndo(selectedDay)} — {dayDetail.length} kejadian</h3>
              <button onClick={() => onSelectDay(null)} aria-label="Tutup detail hari" className="flex h-7 w-7 items-center justify-center rounded-full border border-soft-mist hover:bg-warm-parchment"><X className="h-4 w-4" /></button>
            </div>
            {dayDetail.length === 0 ? <p className="mt-2 text-sm text-stone-gray">Tidak ada rencana di tanggal ini.</p> : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {dayDetail.map((r) => (
                  <div key={r.id} className="rounded-card border border-soft-mist bg-warm-parchment p-3">
                    <p className="text-xs font-semibold tracking-wide text-stone-gray">{r.cropCategory} • {r.metode}</p>
                    <p className="font-sans text-sm font-bold text-ink-charcoal">{r.cropName} — {r.lahanNama}</p>
                    <p className="mt-1 text-xs text-stone-gray">Semai {formatIndo(r.tanggalSemai)} → Tanam {r.tanggalTanam ? formatIndo(r.tanggalTanam) + " (aktual)" : `prediksi ${formatIndo(r.prediksi.tanam)}`} → Panen prediksi {formatIndo(r.prediksi.panenAvg)} ({r.prediksi.panenRangeLabel})</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
