"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { motion } from "motion/react";
import { ArrowRight, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, type Crop } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { buildPrediksi, formatIndo, type LahanOpt, type Rencana } from "@/lib/kalender";
import type { SaveRencanaInput } from "@/hooks/useKalender";

const rencanaSchema = z.object({
  lahanId: z.string().min(1, "Pilih lahan"),
  cropSlug: z.string().min(1, "Pilih tanaman"),
  metode: z.enum(["TANAH", "HIDROPONIK"]),
  tanggalSemai: z.string().min(1, "Tanggal semai wajib diisi"),
  tanggalTanam: z.string().optional(),
  jumlah: z.string().optional(),
  catatan: z.string().optional(),
});
type RencanaFormValues = z.infer<typeof rencanaSchema>;

function PrediksiPreview({ slug, semai, tanam }: { slug: string; semai: string; tanam: string }) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ["crop-prediksi", slug],
    enabled: slug.length > 0,
    queryFn: () => api.get<unknown>(ENDPOINTS.crop(slug)).catch(() => null),
    staleTime: 5 * 60 * 1000,
  });
  if (!slug) return null;
  if (isLoading) return <Skeleton className="h-20 rounded-card" />;
  const calc = buildPrediksi(detail, semai, tanam || null);
  if (!calc) return null;
  return (
    <div className="rounded-card border border-royal-violet/15 bg-lilac-mist/30 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-ink-charcoal"><Clock className="h-3.5 w-3.5 text-royal-violet" /> Prediksi Otomatis</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-soft-mist bg-paper-white px-3 py-2">
          <p className="font-semibold tracking-wide text-stone-gray">TANAM TERBAIK</p>
          <p className="font-sans text-sm font-bold text-royal-violet">{formatIndo(calc.tanamPred)}</p>
          <p className="text-[11px] text-stone-gray">+{calc.durasi} hari dari semai</p>
        </div>
        <div className="rounded-lg border border-soft-mist bg-paper-white px-3 py-2">
          <p className="font-semibold tracking-wide text-stone-gray">PANEN PREDIKSI</p>
          <p className="font-sans text-sm font-bold text-midnight-wine">{formatIndo(calc.panenAvg)}</p>
          <p className="text-[11px] text-stone-gray">{formatIndo(calc.panenMin)}–{formatIndo(calc.panenMax)} • {calc.rangeLabel}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-3 text-stone-gray [text-wrap:pretty]">{calc.siapTanamLabel}</p>
    </div>
  );
}

export function RencanaForm({ crops, lahans, initial, onClose, onSave }: {
  crops: Crop[] | null; lahans: LahanOpt[]; initial: Rencana | null;
  onClose: () => void; onSave: (input: SaveRencanaInput, editId: string | null) => Promise<boolean>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const today = new Date().toISOString().slice(0, 10);
  const form = useForm({
    defaultValues: {
      lahanId: initial?.lahanId ?? "", cropSlug: initial?.cropSlug ?? "",
      metode: (initial?.metode ?? "TANAH") as "TANAH" | "HIDROPONIK",
      tanggalSemai: initial?.tanggalSemai ?? today, tanggalTanam: initial?.tanggalTanam ?? "",
      jumlah: initial?.jumlah ? String(initial.jumlah) : "", catatan: initial?.catatan ?? "",
    } as RencanaFormValues,
    onSubmit: async ({ value }) => {
      const parsed = rencanaSchema.safeParse(value);
      if (!parsed.success) {
        const map: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? "form");
          if (!map[key]) map[key] = issue.message;
        }
        setErrors(map);
        return;
      }
      setErrors({});
      const v = parsed.data;
      if (v.jumlah && Number.isNaN(Number(v.jumlah))) { setErrors({ jumlah: "Jumlah harus angka." }); return; }
      let detail: unknown = null;
      try { detail = await api.get<unknown>(ENDPOINTS.crop(v.cropSlug)); } catch { detail = null; }
      if (!buildPrediksi(detail, v.tanggalSemai, v.tanggalTanam || null)) { setErrors({ form: "Memuat panduan tanaman..." }); return; }
      const ok = await onSave({
        lahanId: v.lahanId, cropSlug: v.cropSlug, metode: v.metode, tanggalSemai: v.tanggalSemai,
        tanggalTanam: v.tanggalTanam || undefined,
        jumlah: v.jumlah ? Number(v.jumlah) : undefined, catatan: v.catatan || undefined,
      }, initial?.id ?? null);
      if (ok) onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-label={initial ? "Ubah rencana" : "Catat semai baru"}
        initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
        className="max-h-[92vh] w-full max-w-[560px] overflow-auto rounded-card border border-soft-mist bg-paper-white shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-soft-mist bg-paper-white p-5">
          <div>
            <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">{initial ? "Ubah Rencana" : "Catat Semai Baru"}</h3>
            <p className="mt-1 text-xs leading-4 text-stone-gray [text-wrap:pretty]">Pilih lahan, tanaman & tanggal semai — prediksi tanam & panen otomatis dari panduan (disimpan di server).</p>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Tutup formulir" className="flex h-8 w-8 items-center justify-center rounded-full border border-soft-mist hover:bg-warm-parchment"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(); }} className="space-y-4 p-5">
          <form.Field name="lahanId">
            {(field) => (
              <Select label="Lahan * — pilih dulu" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={errors.lahanId} required>
                <option value="">Pilih lahan...</option>
                {lahans.map((l) => <option key={l.id} value={l.id}>{l.kebunNama} — {l.nama}</option>)}
              </Select>
            )}
          </form.Field>
          <form.Field name="cropSlug">
            {(field) => (
              <Select label="Komoditas * — 60+ pilihan" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={errors.cropSlug} required>
                <option value="">Pilih tanaman...</option>
                {crops?.map((c) => <option key={c.slug} value={c.slug}>{c.name} — {c.slug} ({c.category})</option>)}
              </Select>
            )}
          </form.Field>

          <form.Subscribe selector={(s) => ({ slug: s.values.cropSlug, semai: s.values.tanggalSemai, tanam: s.values.tanggalTanam ?? "" })}>
            {(sel) => <PrediksiPreview slug={sel.slug} semai={sel.semai} tanam={sel.tanam} />}
          </form.Subscribe>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="tanggalSemai">
              {(field) => <Input label="Tanggal Semai *" type="date" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} error={errors.tanggalSemai} required />}
            </form.Field>
            <form.Field name="tanggalTanam">
              {(field) => <Input label="Tanggal Tanam aktual (opsional)" type="date" value={field.state.value ?? ""} onChange={(e) => field.handleChange(e.target.value)} />}
            </form.Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="metode">
              {(field) => (
                <Select label="Metode" value={field.state.value} onChange={(e) => field.handleChange(e.target.value === "HIDROPONIK" ? "HIDROPONIK" : "TANAH")}>
                  <option value="TANAH">TANAH</option>
                  <option value="HIDROPONIK">HIDROPONIK</option>
                </Select>
              )}
            </form.Field>
            <form.Field name="jumlah">
              {(field) => <Input label="Jumlah bibit" type="number" placeholder="100" value={field.state.value ?? ""} onChange={(e) => field.handleChange(e.target.value)} error={errors.jumlah} />}
            </form.Field>
          </div>
          <form.Field name="catatan">
            {(field) => <Textarea label="Catatan" placeholder="Media tanam, perlakuan..." value={field.state.value ?? ""} onChange={(e) => field.handleChange(e.target.value)} rows={3} />}
          </form.Field>

          {errors.form && <p className="text-sm font-medium text-destructive">{errors.form}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outlined" className="flex-1" onClick={onClose}>Batal</Button>
            <form.Subscribe selector={(s) => ({ busy: s.isSubmitting })}>
              {(st) => (
                <Button type="submit" disabled={st.busy} className="flex-1 gap-1.5">{st.busy ? "Menyimpan..." : initial ? "Simpan" : "Catat Semai"} <ArrowRight className="h-4 w-4" /></Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
