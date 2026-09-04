"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarDays, Sprout, Leaf, Droplets, ChevronLeft, ChevronRight, Plus, X, MapPin, Search, Trash2, Pencil, ArrowRight, Clock, Sun } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, type Crop, type Kebun } from "@/lib/api";

type Rencana = {
  id: string;
  cropSlug: string;
  cropName: string;
  cropCategory: string;
  lahanId: string | null;
  lahanNama: string;
  kebunNama: string;
  metode: "TANAH" | "HIDROPONIK";
  tanggalSemai: string; // YYYY-MM-DD
  tanggalTanam?: string | null;
  tanggalPanen?: string | null;
  jumlah?: number | null;
  catatan?: string;
  prediksi: {
    tanam: string; // YYYY-MM-DD
    siapTanamLabel: string;
    panenMin: string;
    panenMax: string;
    panenAvg: string;
    durasiSemai: number;
    panenRangeLabel: string;
  };
  status: "SEMAI" | "TANAM" | "PANEN" | "SELESAI";
  createdAt: string;
};

const STORE_KEY = "tani.rencana.v1";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function parsePanenRange(label: string): { min: number; max: number; avg: number } {
  const nums = (label.match(/\d+/g) ?? []).map(Number);
  if (nums.length >= 2) return { min: nums[0], max: nums[1], avg: Math.round((nums[0] + nums[1]) / 2) };
  if (nums.length === 1) return { min: nums[0], max: nums[0], avg: nums[0] };
  return { min: 60, max: 90, avg: 75 };
}
function formatIndo(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
function daysDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}
function isSameDay(a: string, b: Date): boolean {
  return a === b.toISOString().slice(0, 10);
}

export default function KalenderPage() {
  const [crops, setCrops] = useState<Crop[] | null>(null);
  const [kebuns, setKebuns] = useState<Kebun[] | null>(null);
  const [lahans, setLahans] = useState<{ id: string; nama: string; kebunNama: string }[]>([]);
  const [rencana, setRencana] = useState<Rencana[]>([]);
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // form state
  const [formCrop, setFormCrop] = useState("");
  const [formLahan, setFormLahan] = useState("");
  const [formMetode, setFormMetode] = useState<"TANAH" | "HIDROPONIK">("TANAH");
  const [formTanggalSemai, setFormTanggalSemai] = useState(() => new Date().toISOString().slice(0, 10));
  const [formTanggalTanam, setFormTanggalTanam] = useState("");
  const [formJumlah, setFormJumlah] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [cropDetail, setCropDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2800);
  }

  // load crops & kebuns
  useEffect(() => {
    api.get<Crop[]>("/crops").then(setCrops).catch(() => {});
    api.get<Kebun[]>("/kebuns/my").then(setKebuns).catch(() => setKebuns([]));
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setRencana(JSON.parse(raw));
    } catch {}
  }, []);

  // load lahans when kebuns ready
  useEffect(() => {
    if (!kebuns || kebuns.length === 0) return;
    (async () => {
      const all: { id: string; nama: string; kebunNama: string }[] = [];
      for (const k of kebuns) {
        const name = (k.nama as string) ?? (k.name as string) ?? "Kebun";
        try {
          const ls = await api.get<any[]>(`/kebuns/${k.id}/lahans`);
          for (const l of ls) all.push({ id: String(l.id), nama: String(l.nama ?? l.name ?? "Lahan"), kebunNama: name });
        } catch {}
      }
      setLahans(all);
    })();
  }, [kebuns]);

  // persist
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(rencana)); } catch {}
  }, [rencana]);

  // fetch crop detail when selected
  useEffect(() => {
    if (!formCrop) { setCropDetail(null); return; }
    setDetailLoading(true);
    api.get<any>(`/crops/${formCrop}`).then(d => setCropDetail(d)).catch(() => setCropDetail(null)).finally(() => setDetailLoading(false));
  }, [formCrop]);

  const prediksi = useMemo(() => {
    if (!cropDetail || !formTanggalSemai) return null;
    const sowing = cropDetail.sowingGuides?.[0];
    const generatif = cropDetail.growingGuides?.find((g: any) => g.fase === "GENERATIF");
    const durasi = sowing?.durasiHari ?? 7;
    const rangeLabel: string = generatif?.panenHariRange ?? "60-90 hari";
    const { min, max, avg } = parsePanenRange(rangeLabel);
    const baseTanam = formTanggalTanam ? formTanggalTanam : addDays(formTanggalSemai, durasi);
    const tanamPred = addDays(formTanggalSemai, durasi);
    const panenMin = addDays(baseTanam, min);
    const panenMax = addDays(baseTanam, max);
    const panenAvg = addDays(baseTanam, avg);
    return {
      durasi,
      tanamPred,
      siapTanamLabel: sowing?.siapTanamIndikator ?? `Siap pindah tanam setelah ${durasi} hari`,
      rangeLabel,
      min, max, avg,
      panenMin, panenMax, panenAvg,
      baseTanam,
    };
  }, [cropDetail, formTanggalSemai, formTanggalTanam]);

  function resetForm() {
    setFormCrop("");
    setFormLahan("");
    setFormMetode("TANAH");
    setFormTanggalSemai(new Date().toISOString().slice(0, 10));
    setFormTanggalTanam("");
    setFormJumlah("");
    setFormCatatan("");
    setCropDetail(null);
    setEditId(null);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formCrop || !formTanggalSemai) { showToast("Pilih tanaman & tanggal semai"); return; }
    if (!cropDetail || !prediksi) { showToast("Memuat panduan tanaman..."); return; }
    const crop = crops?.find(c => c.slug === formCrop);
    const lahan = lahans.find(l => l.id === formLahan);
    const base: Rencana = {
      id: editId ?? `r_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      cropSlug: formCrop,
      cropName: crop?.name ?? formCrop,
      cropCategory: crop?.category ?? "SAYUR",
      lahanId: lahan?.id ?? null,
      lahanNama: lahan?.nama ?? "Tanpa lahan",
      kebunNama: lahan?.kebunNama ?? "—",
      metode: formMetode,
      tanggalSemai: formTanggalSemai,
      tanggalTanam: formTanggalTanam || null,
      tanggalPanen: null,
      jumlah: formJumlah ? Number(formJumlah) : null,
      catatan: formCatatan || undefined,
      prediksi: {
        tanam: prediksi.tanamPred,
        siapTanamLabel: prediksi.siapTanamLabel,
        panenMin: prediksi.panenMin,
        panenMax: prediksi.panenMax,
        panenAvg: prediksi.panenAvg,
        durasiSemai: prediksi.durasi,
        panenRangeLabel: prediksi.rangeLabel,
      },
      status: formTanggalTanam ? "TANAM" : "SEMAI",
      createdAt: new Date().toISOString(),
    };
    if (editId) {
      setRencana(prev => prev.map(r => r.id === editId ? { ...r, ...base, id: editId, createdAt: r.createdAt } : r));
      showToast("Rencana diperbarui");
    } else {
      setRencana(prev => [base, ...prev]);
      showToast(`Semai ${base.cropName} dicatat — tanam prediksi ${formatIndo(base.prediksi.tanam)}`);
    }
    setShowForm(false);
    resetForm();
  }

  function startEdit(r: Rencana) {
    setEditId(r.id);
    setFormCrop(r.cropSlug);
    setFormLahan(r.lahanId ?? "");
    setFormMetode(r.metode);
    setFormTanggalSemai(r.tanggalSemai);
    setFormTanggalTanam(r.tanggalTanam ?? "");
    setFormJumlah(r.jumlah ? String(r.jumlah) : "");
    setFormCatatan(r.catatan ?? "");
    setShowForm(true);
  }

  function removeRencana(id: string) {
    setRencana(prev => prev.filter(r => r.id !== id));
    showToast("Rencana dihapus");
  }

  function markTanam(id: string) {
    const r = rencana.find(x => x.id === id);
    if (!r) return;
    const today = new Date().toISOString().slice(0,10);
    setRencana(prev => prev.map(x => x.id === id ? { ...x, tanggalTanam: today, status: "TANAM" as const } : x));
    // recompute panen based on today
    showToast(`Tanam tercatat hari ini — panen prediksi ${formatIndo(addDays(today, parsePanenRange(r.prediksi.panenRangeLabel).avg))}`);
  }

  function markPanen(id: string) {
    const today = new Date().toISOString().slice(0,10);
    setRencana(prev => prev.map(x => x.id === id ? { ...x, tanggalPanen: today, status: "PANEN" as const } : x));
    showToast("Panen tercatat — selamat!");
  }

  // calendar generation
  const cal = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(y, m, 1);
    const startIdx = (first.getDay() + 6) % 7; // Senin=0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startIdx; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  function eventsOn(dateStr: string): Rencana[] {
    return rencana.filter(r =>
      r.tanggalSemai === dateStr ||
      r.prediksi.tanam === dateStr ||
      r.prediksi.panenAvg === dateStr ||
      r.prediksi.panenMin === dateStr ||
      r.tanggalTanam === dateStr ||
      r.tanggalPanen === dateStr
    );
  }

  const filteredList = useMemo(() => {
    if (!q.trim()) return rencana;
    const t = q.toLowerCase();
    return rencana.filter(r => r.cropName.toLowerCase().includes(t) || r.lahanNama.toLowerCase().includes(t) || r.kebunNama.toLowerCase().includes(t));
  }, [rencana, q]);

  const dayDetail = selectedDay ? rencana.filter(r =>
    r.tanggalSemai === selectedDay || r.prediksi.tanam === selectedDay || r.prediksi.panenAvg === selectedDay || r.tanggalTanam === selectedDay || r.tanggalPanen === selectedDay
  ) : [];

  const monthLabel = month.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {toast && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-midnight-wine px-4 py-2.5 text-sm font-semibold text-paper-white shadow-lg">{toast}</div>}

      {/* Header editorial */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-sans text-2xl font-bold tracking-tight [text-wrap:balance]">
            <CalendarDays className="h-6 w-6 text-midnight-wine" /> Kalender Tanam
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-stone-gray [text-wrap:pretty]">
            Catat semai → prediksi pindah tanam (+durasi semai) → prediksi panen (+panen range). Kalender enak dilihat petani.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Catat Semai
        </Button>
      </div>

      {/* Legend + search */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">● Semai</span>
        <span className="rounded-pill bg-royal-violet px-2.5 py-1 text-xs font-semibold text-paper-white">● Prediksi Tanam</span>
        <span className="rounded-pill bg-midnight-wine px-2.5 py-1 text-xs font-semibold text-paper-white">● Prediksi Panen</span>
        <span className="rounded-pill border border-soft-mist bg-paper-white px-2.5 py-1 text-xs font-semibold text-ink-charcoal">● Tanam aktual</span>
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-stone-gray" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari tanaman / lahan" className="h-9 w-56 rounded-small-button border border-soft-mist bg-paper-white pl-8 pr-3 text-sm placeholder:text-stone-gray/60 focus:border-royal-violet focus:outline-none focus:ring-2 focus:ring-royal-violet/20" />
          </div>
        </div>
      </div>

      {/* Month nav + calendar */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-soft-mist bg-warm-parchment px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1,1))} className="flex h-8 w-8 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white hover:bg-warm-parchment"><ChevronLeft className="h-4 w-4" /></button>
            <h2 className="min-w-[160px] text-center font-sans text-base font-bold capitalize tracking-tight text-ink-charcoal">{monthLabel}</h2>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1,1))} className="flex h-8 w-8 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white hover:bg-warm-parchment"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(),1))} className="rounded-pill border border-soft-mist bg-paper-white px-3 py-1.5 text-xs font-semibold hover:bg-warm-parchment">Hari ini</button>
            <Badge variant="neutral" className="gap-1"><Clock className="h-3 w-3" /> {rencana.length} rencana</Badge>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-soft-mist">
          {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(d=>(
            <div key={d} className="bg-warm-parchment py-2 text-center text-xs font-semibold tracking-wide text-stone-gray">{d}</div>
          ))}
          {cal.map((d, idx) => {
            if (!d) return <div key={idx} className="min-h-[96px] bg-warm-parchment" />;
            const iso = d.toISOString().slice(0,10);
            const evs = eventsOn(iso);
            const isToday = isSameDay(iso, new Date());
            const isSelected = selectedDay === iso;
            return (
              <button
                key={idx}
                onClick={()=> setSelectedDay(isSelected ? null : iso)}
                className={[
                  "min-h-[96px] bg-paper-white p-1.5 text-left transition-colors hover:bg-lilac-mist/20",
                  isToday ? "ring-1 ring-inset ring-royal-violet" : "",
                  isSelected ? "bg-lilac-mist/30" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className={["flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", isToday ? "bg-midnight-wine text-paper-white" : "text-ink-charcoal"].join(" ")}>{d.getDate()}</span>
                  {evs.length>0 && <span className="h-1.5 w-1.5 rounded-full bg-royal-violet" />}
                </div>
                <div className="mt-1 space-y-1">
                  {evs.slice(0,3).map(e=>{
                    const isSemai = e.tanggalSemai===iso;
                    const isPredTanam = e.prediksi.tanam===iso;
                    const isPredPanen = e.prediksi.panenAvg===iso || e.prediksi.panenMin===iso;
                    const isTanamAktual = e.tanggalTanam===iso;
                    const label = isSemai ? "Semai" : isTanamAktual ? "Tanam" : isPredTanam ? "Pred. Tanam" : isPredPanen ? "Pred. Panen" : "•";
                    const cls = isSemai ? "bg-lilac-mist text-ink-charcoal" : isPredTanam ? "bg-royal-violet text-paper-white" : isPredPanen ? "bg-midnight-wine text-paper-white" : "bg-paper-white border border-soft-mist text-ink-charcoal";
                    return (
                      <div key={e.id+"_"+label} className={["truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none", cls].join(" ")}>{label}: {e.cropName}</div>
                    );
                  })}
                  {evs.length>3 && <div className="text-[10px] font-medium text-stone-gray">+{evs.length-3} lagi</div>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day detail drawer */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:8}} className="rounded-card border border-soft-mist bg-paper-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-sm font-bold tracking-tight text-ink-charcoal">{formatIndo(selectedDay)} — {dayDetail.length} kejadian</h3>
              <button onClick={()=>setSelectedDay(null)} className="flex h-7 w-7 items-center justify-center rounded-full border border-soft-mist hover:bg-warm-parchment"><X className="h-4 w-4" /></button>
            </div>
            {dayDetail.length===0 ? <p className="mt-2 text-sm text-stone-gray">Tidak ada rencana di tanggal ini.</p> : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {dayDetail.map(r=>(
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

      {/* List rencana */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">Daftar Budidaya</h3>
          <span className="text-xs text-stone-gray">{filteredList.length} rencana</span>
        </div>
        {filteredList.length===0 ? (
          <Card className="py-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lilac-mist text-ink-charcoal"><Sprout className="h-6 w-6" /></span>
            <h4 className="mt-3 font-sans font-semibold text-ink-charcoal">Belum ada catatan</h4>
            <p className="mx-auto mt-1 max-w-md text-sm text-stone-gray [text-wrap:pretty]">Klik Catat Semai — pilih tanaman & tanggal semai, sistem otomatis prediksi hari terbaik pindah tanam dan tanggal panen dari panduan 60+ komoditas.</p>
            <Button onClick={()=>{resetForm(); setShowForm(true);}} className="mt-4 gap-1.5"><Plus className="h-4 w-4" /> Catat Semai Pertama</Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredList.map(r=>{
              const progress = r.status==="SEMAI" ? 20 : r.status==="TANAM" ? 60 : r.status==="PANEN" ? 90 : 100;
              const hariKe = daysDiff(r.tanggalSemai, new Date().toISOString().slice(0,10));
              return (
                <Card key={r.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-1.5 text-sm"><Sprout className="h-4 w-4 text-royal-violet" /> {r.cropName}</CardTitle>
                    <Badge variant={r.status==="SEMAI" ? "lilac" : r.status==="TANAM" ? "info" : r.status==="PANEN" ? "success" : "neutral"}>{r.status}</Badge>
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
                    <div className="flex items-center justify-between text-xs text-stone-gray"><span>Hari ke-{Math.max(0,hariKe)}</span><span>{progress}%</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft-mist"><div className="h-full rounded-full bg-midnight-wine" style={{width: `${progress}%`}} /></div>
                  </div>

                  {r.jumlah && <p className="mt-2 text-xs text-stone-gray">Jumlah: {r.jumlah} bibit</p>}
                  {r.catatan && <p className="mt-1 text-xs leading-4 text-stone-gray [text-wrap:pretty]">“{r.catatan}”</p>}

                  <div className="mt-3 flex gap-1.5">
                    {r.status==="SEMAI" && <Button size="sm" onClick={()=>markTanam(r.id)} className="flex-1 gap-1"><Leaf className="h-3.5 w-3.5" /> Tandai Tanam Hari Ini</Button>}
                    {r.status==="TANAM" && <Button size="sm" onClick={()=>markPanen(r.id)} className="flex-1 gap-1"><Sun className="h-3.5 w-3.5" /> Tandai Panen</Button>}
                    <button onClick={()=>startEdit(r)} className="flex h-9 w-9 items-center justify-center rounded-small-button border border-soft-mist bg-paper-white hover:bg-warm-parchment"><Pencil className="h-4 w-4" /></button>
                    <button onClick={()=>removeRencana(r.id)} className="flex h-9 w-9 items-center justify-center rounded-small-button border border-soft-mist bg-destructive-soft text-destructive hover:bg-destructive hover:text-paper-white"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={()=>setShowForm(false)}>
            <motion.div initial={{opacity:0, scale:0.97, y:8}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.97}} className="max-h-[92vh] w-full max-w-[560px] overflow-auto rounded-card border border-soft-mist bg-paper-white shadow-xl" onClick={e=>e.stopPropagation()}>
              <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-soft-mist bg-paper-white p-5">
                <div>
                  <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">{editId ? "Ubah Rencana" : "Catat Semai Baru"}</h3>
                  <p className="mt-1 text-xs leading-4 text-stone-gray [text-wrap:pretty]">Pilih tanaman & tanggal semai — prediksi tanam & panen otomatis dari panduan.</p>
                </div>
                <button onClick={()=>setShowForm(false)} className="flex h-8 w-8 items-center justify-center rounded-full border border-soft-mist hover:bg-warm-parchment"><X className="h-4 w-4" /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 p-5">
                <Select label="Komoditas * — 60+ pilihan" value={formCrop} onChange={e=>setFormCrop(e.target.value)} required>
                  <option value="">Pilih tanaman...</option>
                  {crops?.map(c=> <option key={c.slug} value={c.slug}>{c.name} — {c.slug} ({c.category})</option>)}
                </Select>

                {detailLoading && <Skeleton className="h-20 rounded-card" />}
                {prediksi && (
                  <div className="rounded-card border border-royal-violet/15 bg-lilac-mist/30 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-ink-charcoal"><Clock className="h-3.5 w-3.5 text-royal-violet" /> Prediksi Otomatis</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-soft-mist bg-paper-white px-3 py-2">
                        <p className="font-semibold tracking-wide text-stone-gray">TANAM TERBAIK</p>
                        <p className="font-sans text-sm font-bold text-royal-violet">{formatIndo(prediksi.tanamPred)}</p>
                        <p className="text-[11px] text-stone-gray">+{prediksi.durasi} hari dari semai</p>
                      </div>
                      <div className="rounded-lg border border-soft-mist bg-paper-white px-3 py-2">
                        <p className="font-semibold tracking-wide text-stone-gray">PANEN PREDIKSI</p>
                        <p className="font-sans text-sm font-bold text-midnight-wine">{formatIndo(prediksi.panenAvg)}</p>
                        <p className="text-[11px] text-stone-gray">{formatIndo(prediksi.panenMin)}–{formatIndo(prediksi.panenMax)} • {prediksi.rangeLabel}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] leading-3 text-stone-gray [text-wrap:pretty]">{prediksi.siapTanamLabel}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Tanggal Semai *" type="date" value={formTanggalSemai} onChange={e=>setFormTanggalSemai(e.target.value)} required />
                  <Input label="Tanggal Tanam aktual (opsional)" type="date" value={formTanggalTanam} onChange={e=>setFormTanggalTanam(e.target.value)} />
                </div>
                <Select label="Lahan" value={formLahan} onChange={e=>setFormLahan(e.target.value)}>
                  <option value="">Tanpa lahan / pilih nanti</option>
                  {lahans.map(l=> <option key={l.id} value={l.id}>{l.kebunNama} — {l.nama}</option>)}
                </Select>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Metode" value={formMetode} onChange={e=>setFormMetode(e.target.value as any)}>
                    <option value="TANAH">TANAH</option>
                    <option value="HIDROPONIK">HIDROPONIK</option>
                  </Select>
                  <Input label="Jumlah bibit" type="number" placeholder="100" value={formJumlah} onChange={e=>setFormJumlah(e.target.value)} />
                </div>
                <Textarea label="Catatan" placeholder="Media tanam, perlakuan..." value={formCatatan} onChange={e=>setFormCatatan(e.target.value)} rows={3} />

                <div className="flex gap-2">
                  <Button type="button" variant="outlined" className="flex-1" onClick={()=>setShowForm(false)}>Batal</Button>
                  <Button type="submit" className="flex-1 gap-1.5">{editId ? "Simpan" : "Catat Semai"} <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
