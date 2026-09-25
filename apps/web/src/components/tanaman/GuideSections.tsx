import { Beaker, Leaf, Lightbulb, Sprout } from "lucide-react";
import type { Crop } from "@/lib/api";

export type SowingGuide = {
  id: string; metode?: string | null; mediaTanam: string; durasiHari: number;
  suhuOptimal: string; kelembaban: string; langkah: string[];
  siapTanamIndikator: string; tipsCepat?: string[] | null; sumber?: unknown;
};
export type PupukInfo = { nama: string; takaran: string; intervalHari: number; cara: string };
export type GrowingGuide = {
  id: string; fase: string; panenHariRange: string; penyiraman: string;
  pupuk: PupukInfo[]; hama: string[];
};
export type HydroGuide = {
  id: string; sistem: string; ppmRange: string; phRange: string;
  nutrisi: string[]; durasiHari: number;
};
export type CropDetail = Crop & {
  sowingGuides: SowingGuide[]; growingGuides: GrowingGuide[]; hydroponicGuides: HydroGuide[];
};

type Rec = Record<string, unknown>;
function isRec(v: unknown): v is Rec { return typeof v === "object" && v !== null; }
function str(v: unknown, fb = ""): string { return typeof v === "string" ? v : fb; }
function num(v: unknown, fb = 0): number { return typeof v === "number" && !Number.isNaN(v) ? v : fb; }
function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function capitalize(s: string): string {
  return s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function parseSowing(r: Rec): SowingGuide {
  return {
    id: str(r.id), metode: typeof r.metode === "string" ? r.metode : null,
    mediaTanam: str(r.mediaTanam), durasiHari: num(r.durasiHari, 7),
    suhuOptimal: str(r.suhuOptimal), kelembaban: str(r.kelembaban),
    langkah: strArr(r.langkah), siapTanamIndikator: str(r.siapTanamIndikator),
    tipsCepat: Array.isArray(r.tipsCepat) ? strArr(r.tipsCepat) : null, sumber: r.sumber,
  };
}
function parseGrowing(r: Rec): GrowingGuide {
  const pupuk = Array.isArray(r.pupuk) ? r.pupuk.filter(isRec).map((p) => ({
    nama: str(p.nama), takaran: str(p.takaran), intervalHari: num(p.intervalHari), cara: str(p.cara),
  })) : [];
  return {
    id: str(r.id), fase: str(r.fase), panenHariRange: str(r.panenHariRange),
    penyiraman: str(r.penyiraman), pupuk, hama: strArr(r.hama),
  };
}
function parseHydro(r: Rec): HydroGuide {
  return {
    id: str(r.id), sistem: str(r.sistem), ppmRange: str(r.ppmRange), phRange: str(r.phRange),
    nutrisi: strArr(r.nutrisi), durasiHari: num(r.durasiHari),
  };
}
function guideArr<T>(v: unknown, parse: (r: Rec) => T): T[] {
  return Array.isArray(v) ? v.filter(isRec).map(parse) : [];
}

export function parseCropDetail(raw: unknown, fallback: Crop): CropDetail {
  const r = isRec(raw) ? raw : {};
  const base = isRec(raw) && typeof raw.slug === "string" ? (raw as unknown as Crop) : fallback;
  return {
    ...base, ...fallback,
    sowingGuides: guideArr(r.sowingGuides, parseSowing),
    growingGuides: guideArr(r.growingGuides, parseGrowing),
    hydroponicGuides: guideArr(r.hydroponicGuides, parseHydro),
  };
}

export type SumberItem = { label: string; url?: string };
export function sumberItems(sumber: unknown): SumberItem[] | null {
  if (typeof sumber === "string" && sumber.trim()) return [{ label: sumber }];
  if (Array.isArray(sumber) && sumber.length > 0) {
    const parsed = sumber.flatMap((it: unknown, idx: number): SumberItem[] => {
      if (typeof it === "string") return [{ label: it }];
      if (isRec(it)) {
        const label = str(it.nama || it.judul || it.title || it.name, `Sumber ${idx + 1}`);
        const url = typeof it.url === "string" ? it.url : typeof it.link === "string" ? it.link : typeof it.href === "string" ? it.href : undefined;
        return [{ label, url }];
      }
      return [];
    });
    if (parsed.length > 0) return parsed;
  }
  return null;
}

function metodeClass(metodeKey: string): string {
  if (metodeKey === "STEK") return "bg-midnight-wine text-paper-white";
  if (metodeKey === "CANGKOK") return "bg-lilac-mist text-ink-charcoal border border-royal-violet/20";
  if (metodeKey === "OKULASI") return "bg-royal-violet text-paper-white";
  return "bg-paper-white text-ink-charcoal border border-soft-mist";
}

export function SowingSection({ guides }: { guides: SowingGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <div className="rounded-card border border-soft-mist bg-warm-parchment p-4">
      <h4 className="flex items-center gap-2 font-sans text-sm font-bold tracking-tight text-ink-charcoal"><Leaf className="h-4 w-4 text-royal-violet" /> Penyemaian — Media & Langkah</h4>
      {guides.map((s) => {
        const metodeKey = String(s.metode ?? "BIJI").toUpperCase();
        const sumber = sumberItems(s.sumber);
        return (
          <div key={s.id} className="mt-3 space-y-2 text-sm leading-6">
            <span className={["inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold leading-none", metodeClass(metodeKey)].join(" ")}>Metode: {metodeKey}</span>
            <p><span className="font-semibold text-ink-charcoal">Media tanam:</span> <span className="text-stone-gray">{s.mediaTanam}</span></p>
            <p className="text-stone-gray"><span className="font-semibold text-ink-charcoal">Durasi:</span> {s.durasiHari} hari · <span className="font-semibold text-ink-charcoal">Suhu:</span> {s.suhuOptimal} · <span className="font-semibold text-ink-charcoal">Kelembapan:</span> {s.kelembaban}</p>
            <ol className="list-decimal pl-5 marker:text-royal-violet">
              {s.langkah.map((l) => (<li key={l} className="text-stone-gray">{l}</li>))}
            </ol>
            <p className="rounded-lg bg-lilac-mist px-3 py-2 text-xs font-medium text-ink-charcoal">Siap tanam: {s.siapTanamIndikator}</p>
            {s.tipsCepat && s.tipsCepat.length > 0 && (
              <div className="rounded-lg border border-royal-violet/15 bg-paper-white px-3 py-2">
                <p className="flex items-center gap-1.5 text-xs font-bold text-royal-violet"><Lightbulb className="h-3.5 w-3.5" /> Tips Cepat</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5 text-stone-gray marker:text-royal-violet">
                  {s.tipsCepat.map((t) => (<li key={t}>{t}</li>))}
                </ul>
              </div>
            )}
            {sumber ? (
              <div className="rounded-lg border border-soft-mist bg-paper-white px-3 py-2">
                <p className="text-xs font-bold text-ink-charcoal">Sumber:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs leading-5">
                  {sumber.map((src) => (
                    <li key={src.label} className="break-words text-stone-gray">
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
  );
}

export function GrowingSection({ guides }: { guides: GrowingGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <div className="space-y-3">
      {guides.map((g) => (
        <div key={g.id} className="rounded-card border border-soft-mist bg-paper-white p-4">
          <h4 className="font-sans text-sm font-bold tracking-tight text-ink-charcoal flex items-center gap-2">
            {String(g.fase).startsWith("VEGETATIF") ? <Sprout className="h-4 w-4 text-royal-violet" /> : <Leaf className="h-4 w-4 text-midnight-wine" />} Fase {capitalize(g.fase)} — <span className="font-mono text-royal-violet">{g.panenHariRange}</span>
          </h4>
          <p className="mt-1 text-xs text-stone-gray">Penyiraman: {g.penyiraman}</p>
          <div className="mt-2 space-y-1.5">
            {g.pupuk.map((p) => (
              <div key={p.nama} className="rounded-lg border border-soft-mist bg-warm-parchment px-3 py-2 text-xs">
                <span className="font-bold text-ink-charcoal">{p.nama}</span> <span className="text-stone-gray">— {p.takaran} · tiap {p.intervalHari} hari · {p.cara}</span>
              </div>
            ))}
          </div>
          {g.hama.length > 0 && <p className="mt-2 text-xs text-stone-gray">Hama: {g.hama.join(", ")}</p>}
        </div>
      ))}
    </div>
  );
}

export function HydroSection({ guides }: { guides: HydroGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <div className="rounded-card border border-royal-violet/15 bg-lilac-mist/30 p-4">
      <h4 className="font-sans text-sm font-bold tracking-tight text-ink-charcoal flex items-center gap-2"><Beaker className="h-4 w-4 text-royal-violet" /> Hidroponik</h4>
      {guides.map((h) => (
        <div key={h.id} className="mt-2 text-sm leading-6">
          <p className="text-stone-gray"><span className="font-bold text-ink-charcoal">Sistem:</span> {h.sistem} · <span className="font-bold text-ink-charcoal">PPM:</span> <span className="font-mono text-royal-violet">{h.ppmRange}</span> · <span className="font-bold text-ink-charcoal">pH:</span> <span className="font-mono">{h.phRange}</span></p>
          <p className="text-xs text-stone-gray">Nutrisi: {h.nutrisi.join(", ")} · Durasi {h.durasiHari} hari</p>
        </div>
      ))}
    </div>
  );
}
