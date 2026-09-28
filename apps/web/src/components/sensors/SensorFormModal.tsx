"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X, AlertTriangle } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { sensorSchema } from "@/lib/schemas";

const SENSOR_TYPES = [
  "WATER_LEVEL",
  "SOLENOID",
  "PH",
  "NPK_N",
  "NPK_P",
  "NPK_K",
  "EC",
  "TDS_PPM",
  "TEMP",
  "HUMIDITY",
  "SOIL_MOISTURE",
] as const;

const DEFAULT_UNIT: Record<string, string> = {
  WATER_LEVEL: "%",
  SOLENOID: "on/off",
  PH: "pH",
  NPK_N: "mg/kg",
  NPK_P: "mg/kg",
  NPK_K: "mg/kg",
  EC: "mS/cm",
  TDS_PPM: "ppm",
  TEMP: "°C",
  HUMIDITY: "%",
  SOIL_MOISTURE: "%",
};

export type DeviceOpt = { id: string; nama: string };

type SensorFormValues = {
  deviceId: string;
  type: string;
  unit: string;
  minThreshold: string;
  maxThreshold: string;
};

export function SensorFormModal({
  devices,
  preselectedDeviceId,
  kebunId,
  onClose,
  onSuccess,
}: {
  devices: DeviceOpt[];
  preselectedDeviceId?: string;
  kebunId: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const qc = useQueryClient();
  const [serverErr, setServerErr] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (v: { deviceId: string; type: string; unit: string; minThreshold?: number; maxThreshold?: number }) =>
      api.post(ENDPOINTS.deviceSensors(v.deviceId), {
        type: v.type,
        unit: v.unit,
        ...(v.minThreshold !== undefined ? { minThreshold: v.minThreshold } : {}),
        ...(v.maxThreshold !== undefined ? { maxThreshold: v.maxThreshold } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices", kebunId] });
      onSuccess("Sensor berhasil ditambahkan.");
      onClose();
    },
    onError: (e: unknown) =>
      setServerErr((e as { message?: string })?.message ?? "Gagal menambah sensor."),
  });

  const form = useForm({
    defaultValues: {
      deviceId: preselectedDeviceId ?? "",
      type: "",
      unit: "",
      minThreshold: "",
      maxThreshold: "",
    } as SensorFormValues,
    onSubmit: async ({ value }) => {
      setServerErr(null);
      const parsed = sensorSchema.safeParse({
        deviceId: value.deviceId,
        type: value.type || undefined,
        unit: value.unit,
        minThreshold: value.minThreshold.trim() === "" ? undefined : Number(value.minThreshold),
        maxThreshold: value.maxThreshold.trim() === "" ? undefined : Number(value.maxThreshold),
      });
      if (!parsed.success) {
        setServerErr(parsed.error.issues[0]?.message ?? "Data sensor tidak valid.");
        return;
      }
      if (
        parsed.data.minThreshold != null &&
        parsed.data.maxThreshold != null &&
        parsed.data.minThreshold >= parsed.data.maxThreshold
      ) {
        setServerErr("Batas bawah harus lebih kecil dari batas atas.");
        return;
      }
      await create.mutateAsync({
        deviceId: parsed.data.deviceId,
        type: parsed.data.type,
        unit: parsed.data.unit.trim(),
        ...(parsed.data.minThreshold != null ? { minThreshold: parsed.data.minThreshold } : {}),
        ...(parsed.data.maxThreshold != null ? { maxThreshold: parsed.data.maxThreshold } : {}),
      });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Tambah sensor"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[92vh] w-full max-w-md overflow-auto rounded-card border border-soft-mist bg-paper-white p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">Tambah Sensor</h3>
            <p className="mt-1 text-sm leading-5 text-stone-gray">
              Sensor menempel ke device. Buat device dulu bila belum ada.
            </p>
          </div>
          <button
            autoFocus
            aria-label="Tutup"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-soft-mist hover:bg-warm-parchment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="deviceId">
            {(f) => (
              <Select label="Device * — sensor dipasang di" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} required>
                <option value="">{devices.length === 0 ? "Belum ada device..." : "Pilih device..."}</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>{d.nama}</option>
                ))}
              </Select>
            )}
          </form.Field>
          {devices.length === 0 && (
            <p className="text-xs leading-4 text-stone-gray">
              Belum ada device di kebun ini — tutup form ini lalu klik “Tambah Device” dulu.
            </p>
          )}
          <form.Field name="type">
            {(f) => (
              <Select
                label="Tipe sensor *"
                value={f.state.value}
                onChange={(e) => {
                  const t = e.target.value;
                  f.handleChange(t);
                  // Isi satuan otomatis bila masih kosong
                  form.setFieldValue("unit", (prev) => (prev ? prev : (DEFAULT_UNIT[t] ?? "")));
                }}
                required
              >
                <option value="">Pilih tipe...</option>
                {SENSOR_TYPES.map((t) => (
                  <option key={t} value={t}>{t}{DEFAULT_UNIT[t] ? ` (${DEFAULT_UNIT[t]})` : ""}</option>
                ))}
              </Select>
            )}
          </form.Field>
          <form.Field name="unit">
            {(f) => (
              <Input label="Satuan *" placeholder="%, ppm, pH, °C..." value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} required />
            )}
          </form.Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="minThreshold">
              {(f) => (
                <Input label="Batas bawah (opsional)" type="number" placeholder="0" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
              )}
            </form.Field>
            <form.Field name="maxThreshold">
              {(f) => (
                <Input label="Batas atas (opsional)" type="number" placeholder="100" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
              )}
            </form.Field>
          </div>

          {serverErr && (
            <div className="flex items-center gap-1.5 rounded-lg bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" /> {serverErr}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <form.Subscribe selector={(s) => ({ busy: s.isSubmitting })}>
              {(st) => (
                <Button type="submit" disabled={st.busy || create.isPending} className="flex-1">
                  {st.busy || create.isPending ? "Menyimpan..." : "Simpan Sensor"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
