"use client";
import { Droplets, Leaf, MapPin, Pencil, Sprout, Sun, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { daysDiff, formatIndo, type Rencana, type RencanaStatus } from "@/lib/kalender";

function progressOf(status: RencanaStatus): number {
  if (status === "SEMAI") return 20;
  if (status === "TANAM") return 60;
  if (status === "PANEN") return 90;
  return 100;
}

export function RencanaCard({ rencana: r, onMarkTanam, onMarkPanen, onEdit, onDelete }: {
  rencana: Rencana;
  onMarkTanam: (id: string) => void; onMarkPanen: (id: string) => void;
  onEdit: (r: Rencana) => void; onDelete: (id: string) => void;
}) {
  const progress = progressOf(r.status);
  const hariKe = daysDiff(r.tanggalSemai, new Date().toISOString().slice(0, 10));
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm"><Sprout className="h-4 w-4 text-royal-violet" /> {r.cropName}</CardTitle>
        <Badge variant={r.status === "SEMAI" ? "lilac" : r.status === "TANAM" ? "info" : r.status === "PANEN" ? "success" : "neutral"}>{r.status}</Badge>
      </CardHeader>
      <p className="mt-2 flex items-center gap-1 text-xs text-stone-gray"><MapPin className="h-3 w-3" /> {r.kebunNama} • {r.lahanNama} • {r.metode}</p>

      <div className="mt-3 space-y-2 rounded-lg border border-soft-mist bg-warm-parchment p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-semibold text-ink-charcoal"><Sun className="h-3 w-3 text-royal-violet" /> Semai</span>
          <span className="font-mono font-bold">{formatIndo(r.tanggalSemai)}</span>
        </div>
        <div className="h-px bg-soft-mist" />
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-semibold text-ink-charcoal"><Leaf className="h-3 w-3 text-royal-violet" /> {r.tanggalTanam ? "Tanam (aktual)" : "Prediksi Tanam"}</span>
          <span className={["font-mono font-bold", r.tanggalTanam ? "text-ink-charcoal" : "text-royal-violet"].join(" ")}>{formatIndo(r.tanggalTanam ?? r.prediksi.tanam)}</span>
        </div>
        {!r.tanggalTanam && <p className="text-[11px] leading-3 text-stone-gray">+{r.prediksi.durasiSemai} hari dari semai • {r.prediksi.siapTanamLabel}</p>}
        <div className="h-px bg-soft-mist" />
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-semibold text-ink-charcoal"><Droplets className="h-3 w-3 text-midnight-wine" /> Prediksi Panen</span>
          <span className="font-mono font-bold text-midnight-wine">{formatIndo(r.prediksi.panenAvg)}</span>
        </div>
        <p className="text-[11px] leading-3 text-stone-gray">{formatIndo(r.prediksi.panenMin)} – {formatIndo(r.prediksi.panenMax)} • {r.prediksi.panenRangeLabel} setelah {r.tanggalTanam ? "tanam aktual" : "prediksi tanam"}</p>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-stone-gray"><span>Hari ke-{Math.max(0, hariKe)}</span><span>{progress}%</span></div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft-mist"><div className="h-full rounded-full bg-midnight-wine" style={{ width: `${progress}%` }} /></div>
      </div>

      {r.jumlah && <p className="mt-2 text-xs text-stone-gray">Jumlah: {r.jumlah} bibit</p>}
      {r.catatan && <p className="mt-1 text-xs leading-4 text-stone-gray [text-wrap:pretty]">“{r.catatan}”</p>}

      <div className="mt-3 flex gap-1.5">
        {r.status === "SEMAI" && <Button size="sm" onClick={() => onMarkTanam(r.id)} className="flex-1 gap-1"><Leaf className="h-3.5 w-3.5" /> Tandai Tanam Hari Ini</Button>}
        {r.status === "TANAM" && <Button size="sm" onClick={() => onMarkPanen(r.id)} className="flex-1 gap-1"><Sun className="h-3.5 w-3.5" /> Tandai Panen</Button>}
        <button onClick={() => onEdit(r)} aria-label={`Ubah ${r.cropName}`} className="flex h-9 w-9 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white hover:bg-warm-parchment"><Pencil className="h-4 w-4" /></button>
        <button onClick={() => onDelete(r.id)} aria-label={`Hapus ${r.cropName}`} className="flex h-9 w-9 items-center justify-center rounded-small-button border border-soft-mist bg-destructive-soft text-destructive hover:bg-destructive hover:text-paper-white"><Trash2 className="h-4 w-4" /></button>
      </div>
    </Card>
  );
}
