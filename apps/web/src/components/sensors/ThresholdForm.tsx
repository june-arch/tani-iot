"use client";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { ENDPOINTS, errorMessage } from "@/lib/endpoints";
import { thresholdSchema } from "@/lib/schemas";
import type { SensorEnriched } from "@/hooks/useSensors";

// TanStack Form + thresholdSchema (zod) — error string per submit.
// Diremount via key dari parent (key mencakup id + nilai threshold aktif)
// sehingga nilai awal selalu sinkron tanpa effect.
export function ThresholdForm({ sensors, selectedId, initialMin, initialMax, initialEnabled, onSelect, onSaved, notify }: {
  sensors: SensorEnriched[]; selectedId: string;
  initialMin: string; initialMax: string; initialEnabled: boolean;
  onSelect: (id: string) => void; onSaved: () => void; notify: (m: string) => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm({
    defaultValues: { min: initialMin, max: initialMax, enabled: initialEnabled } as { min: string; max: string; enabled: boolean },
    onSubmit: async ({ value }) => {
      if (!selectedId) { setFormError("Pilih sensor terlebih dahulu."); return; }
      setFormError(null);
      const toNum = (raw: string): number | null | undefined => {
        if (raw.trim() === "") return null;
        const n = Number(raw);
        return Number.isNaN(n) ? undefined : n;
      };
      const min = toNum(value.min);
      const max = toNum(value.max);
      if (min === undefined) { setFormError("Batas bawah harus angka."); return; }
      if (max === undefined) { setFormError("Batas atas harus angka."); return; }
      const parsed = thresholdSchema.safeParse({ min, max });
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Threshold tidak valid.");
        return;
      }
      try {
        await api.patch(ENDPOINTS.sensorConfig(selectedId), { isEnabled: value.enabled, minThreshold: min, maxThreshold: max });
        notify("Threshold berhasil disimpan.");
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        onSaved();
      } catch (err: unknown) {
        setFormError(errorMessage(err, "Gagal menyimpan threshold."));
      }
    },
  });

  return (
    <Card className="border-soft-mist bg-paper-white">
      <h3 className="font-sans text-base font-bold tracking-tight text-ink-charcoal">Atur Threshold</h3>
      <p className="mt-1 text-sm text-stone-gray">Simpan ambang batas — akan memicu alert jika telemetry di luar range. PATCH /sensors/:id/config</p>
      <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(); }} className="mt-4 grid gap-4 sm:grid-cols-2">
        <Select label="Sensor" value={selectedId} onChange={(e) => onSelect(e.target.value)}>
          {sensors.map((s) => (
            <option key={String(s.id)} value={String(s.id)}>{s.name ?? String(s.id)} — {String(s.type ?? s.tipe ?? "")}</option>
          ))}
        </Select>
        <form.Field name="enabled">
          {(field) => (
            <Select label="Aktif" value={field.state.value ? "true" : "false"} onChange={(e) => field.handleChange(e.target.value === "true")}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </Select>
          )}
        </form.Field>
        <form.Field name="min">
          {(field) => <Input label="Batas Bawah (minThreshold)" placeholder="mis. 5.5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} inputMode="decimal" />}
        </form.Field>
        <form.Field name="max">
          {(field) => <Input label="Batas Atas (maxThreshold)" placeholder="mis. 6.5" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} inputMode="decimal" />}
        </form.Field>
        {formError && <p className="text-sm font-medium text-destructive sm:col-span-2">{formError}</p>}
        <div className="sm:col-span-2">
          <form.Subscribe selector={(s) => ({ busy: s.isSubmitting })}>
            {(st) => <Button type="submit" disabled={st.busy} className="w-full">{st.busy ? "Menyimpan..." : "Simpan Threshold"}</Button>}
          </form.Subscribe>
        </div>
      </form>
      {saved && <p className="mt-3 text-sm font-medium text-success">✓ Threshold tersimpan</p>}
    </Card>
  );
}
