// Helper kalender tanam — tanpa any, pakai unknown + type guard.
export type MetodeTanam = "TANAH" | "HIDROPONIK";
export type RencanaStatus = "SEMAI" | "TANAM" | "PANEN" | "SELESAI";

export type RencanaPrediksi = {
  tanam: string; siapTanamLabel: string;
  panenMin: string; panenMax: string; panenAvg: string;
  durasiSemai: number; panenRangeLabel: string;
};

export type Rencana = {
  id: string; cropSlug: string; cropName: string; cropCategory: string;
  lahanId: string | null; lahanNama: string; kebunNama: string; kebunId?: string;
  metode: MetodeTanam; tanggalSemai: string;
  tanggalTanam?: string | null; tanggalPanen?: string | null;
  jumlah?: number | null; catatan?: string;
  prediksi: RencanaPrediksi; status: RencanaStatus; createdAt: string;
  raw?: unknown;
};

export type LahanOpt = { id: string; nama: string; kebunNama: string };

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function parsePanenRange(label: string): { min: number; max: number; avg: number } {
  const nums = (label.match(/\d+/g) ?? []).map(Number);
  if (nums.length >= 2) return { min: nums[0], max: nums[1], avg: Math.round((nums[0] + nums[1]) / 2) };
  if (nums.length === 1) return { min: nums[0], max: nums[0], avg: nums[0] };
  return { min: 60, max: 90, avg: 75 };
}

export function formatIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysDiff(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export function isSameDay(dateStr: string, b: Date): boolean {
  return dateStr === b.toISOString().slice(0, 10);
}

export function isRec(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function str(v: unknown, fb = ""): string {
  return typeof v === "string" ? v : fb;
}
function num(v: unknown, fb = 0): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fb;
}

export function toISODate(v: unknown): string {
  if (!v) return "";
  try {
    const d = v instanceof Date ? v : typeof v === "string" || typeof v === "number" ? new Date(v) : null;
    return d ? d.toISOString().slice(0, 10) : "";
  } catch {
    return String(v).slice(0, 10);
  }
}

function coercePrediksi(v: unknown, tanggalSemai: string, tanggalTanam: string | null): RencanaPrediksi {
  const base = tanggalTanam ?? addDays(tanggalSemai, 7);
  const fb: RencanaPrediksi = {
    tanam: addDays(tanggalSemai, 7), siapTanamLabel: "Siap pindah tanam",
    panenMin: addDays(base, 60), panenMax: addDays(base, 90), panenAvg: addDays(base, 75),
    durasiSemai: 7, panenRangeLabel: "60-90 hari",
  };
  if (!isRec(v)) return fb;
  return {
    tanam: str(v.tanam, fb.tanam), siapTanamLabel: str(v.siapTanamLabel, fb.siapTanamLabel),
    panenMin: str(v.panenMin, fb.panenMin), panenMax: str(v.panenMax, fb.panenMax), panenAvg: str(v.panenAvg, fb.panenAvg),
    durasiSemai: num(v.durasiSemai, fb.durasiSemai), panenRangeLabel: str(v.panenRangeLabel, fb.panenRangeLabel),
  };
}

export function mapBackend(p: unknown): Rencana | null {
  if (!isRec(p) || p.id === undefined || p.id === null) return null;
  const tanggalSemai = toISODate(p.tanggalSemai);
  if (!tanggalSemai) return null;
  const tanggalTanam = p.tanggalTanam ? toISODate(p.tanggalTanam) : null;
  const tanggalPanen = p.tanggalPanen ? toISODate(p.tanggalPanen) : null;
  const crop = isRec(p.crop) ? p.crop : null;
  const lahan = isRec(p.lahan) ? p.lahan : null;
  const lahanKebun = lahan && isRec(lahan.kebun) ? lahan.kebun : null;
  const statusRaw = String(p.status ?? "AKTIF").toUpperCase();
  const status: RencanaStatus = statusRaw === "PANEN" ? "PANEN" : statusRaw === "SELESAI" ? "SELESAI" : tanggalTanam ? "TANAM" : "SEMAI";
  const catatanRaw = p.catatan;
  const catatan = typeof catatanRaw === "string" ? catatanRaw : isRec(catatanRaw) && typeof catatanRaw.text === "string" ? catatanRaw.text : undefined;
  const kebunIdRaw = p.kebunId ?? lahanKebun?.id ?? (lahan ? lahan.kebunId : undefined);
  return {
    id: String(p.id),
    cropSlug: str(p.cropSlug, crop ? str(crop.slug) : ""),
    cropName: str(p.cropName, crop ? str(crop.name, "Tanaman") : "Tanaman"),
    cropCategory: str(p.cropCategory, crop ? str(crop.category, "SAYUR") : "SAYUR"),
    lahanId: p.lahanId !== undefined && p.lahanId !== null ? String(p.lahanId) : lahan && lahan.id !== undefined && lahan.id !== null ? String(lahan.id) : null,
    lahanNama: str(p.lahanNama, lahan ? str(lahan.nama ?? lahan.name, "Tanpa lahan") : "Tanpa lahan"),
    kebunNama: str(p.kebunNama, lahanKebun ? str(lahanKebun.nama ?? lahanKebun.name, "—") : "—"),
    kebunId: kebunIdRaw !== undefined && kebunIdRaw !== null ? String(kebunIdRaw) : undefined,
    metode: p.metode === "HIDROPONIK" ? "HIDROPONIK" : "TANAH",
    tanggalSemai, tanggalTanam, tanggalPanen,
    jumlah: typeof p.jumlah === "number" ? p.jumlah : null,
    catatan,
    prediksi: coercePrediksi(p.prediksi ?? (isRec(p.raw) ? p.raw.prediksi : null), tanggalSemai, tanggalTanam),
    status,
    createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
    raw: p,
  };
}

export function eventsOn(list: Rencana[], dateStr: string): Rencana[] {
  return list.filter((r) =>
    r.tanggalSemai === dateStr ||
    r.prediksi.tanam === dateStr ||
    r.prediksi.panenAvg === dateStr ||
    r.prediksi.panenMin === dateStr ||
    r.tanggalTanam === dateStr ||
    r.tanggalPanen === dateStr
  );
}

export type PrediksiCalc = {
  durasi: number; tanamPred: string; siapTanamLabel: string; rangeLabel: string;
  min: number; max: number; avg: number;
  panenMin: string; panenMax: string; panenAvg: string; baseTanam: string;
};

export function buildPrediksi(detail: unknown, tanggalSemai: string, tanggalTanam: string | null): PrediksiCalc | null {
  if (!isRec(detail) || !tanggalSemai) return null;
  const sowing = Array.isArray(detail.sowingGuides) ? detail.sowingGuides.filter(isRec)[0] : undefined;
  const guides = Array.isArray(detail.growingGuides) ? detail.growingGuides.filter(isRec) : [];
  const generatif = guides.find((g) => g.fase === "GENERATIF") ?? guides[guides.length - 1];
  const durasi = sowing ? num(sowing.durasiHari, 7) : 7;
  const rangeLabel = generatif ? str(generatif.panenHariRange, "60-90 hari") : "60-90 hari";
  const { min, max, avg } = parsePanenRange(rangeLabel);
  const baseTanam = tanggalTanam ? tanggalTanam : addDays(tanggalSemai, durasi);
  return {
    durasi, tanamPred: addDays(tanggalSemai, durasi),
    siapTanamLabel: sowing ? str(sowing.siapTanamIndikator, `Siap pindah tanam setelah ${durasi} hari`) : `Siap pindah tanam setelah ${durasi} hari`,
    rangeLabel, min, max, avg,
    panenMin: addDays(baseTanam, min), panenMax: addDays(baseTanam, max), panenAvg: addDays(baseTanam, avg),
    baseTanam,
  };
}
