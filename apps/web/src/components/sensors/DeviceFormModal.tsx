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
import { deviceSchema } from "@/lib/schemas";

const DEVICE_TYPES = ["TANDON", "IRRIGATION", "SOIL", "HYDROPONIC", "GATEWAY"] as const;

export type LahanOpt = { id: string; nama: string };

type DeviceFormValues = {
  nama: string;
  type: string;
  mqttTopic: string;
  lokasi: string;
  lahanId: string;
};

export function DeviceFormModal({
  kebunId,
  kebunNama,
  lahans,
  onClose,
  onSuccess,
}: {
  kebunId: string;
  kebunNama?: string;
  lahans?: LahanOpt[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const qc = useQueryClient();
  const [serverErr, setServerErr] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (v: { nama: string; type: string; mqttTopic: string; lokasi?: string; lahanId?: string }) =>
      api.post(ENDPOINTS.devices(kebunId), v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices", kebunId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onSuccess("Device berhasil ditambahkan.");
      onClose();
    },
    onError: (e: unknown) =>
      setServerErr((e as { message?: string })?.message ?? "Gagal menambah device."),
  });

  const form = useForm({
    defaultValues: { nama: "", type: "", mqttTopic: "", lokasi: "", lahanId: "" } as DeviceFormValues,
    onSubmit: async ({ value }) => {
      setServerErr(null);
      const parsed = deviceSchema.safeParse({
        nama: value.nama,
        type: value.type || undefined,
        mqttTopic: value.mqttTopic,
        lokasi: value.lokasi || undefined,
        lahanId: value.lahanId || undefined,
      });
      if (!parsed.success) {
        setServerErr(parsed.error.issues[0]?.message ?? "Data device tidak valid.");
        return;
      }
      await create.mutateAsync({
        nama: parsed.data.nama.trim(),
        type: parsed.data.type,
        mqttTopic: parsed.data.mqttTopic.trim(),
        ...(parsed.data.lokasi?.trim() ? { lokasi: parsed.data.lokasi.trim() } : {}),
        ...(parsed.data.lahanId ? { lahanId: parsed.data.lahanId } : {}),
      });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Tambah device"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[92vh] w-full max-w-md overflow-auto rounded-card border border-soft-mist bg-paper-white p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">Tambah Device</h3>
            <p className="mt-1 text-sm leading-5 text-stone-gray">
              {kebunNama ? `Ke kebun “${kebunNama}”. ` : ""}Device dulu, sensor ditambahkan setelahnya.
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
          <form.Field name="nama">
            {(f) => (
              <Input label="Nama device *" placeholder="Node Tandon 1" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} required />
            )}
          </form.Field>
          <form.Field name="type">
            {(f) => (
              <Select label="Tipe device *" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} required>
                <option value="">Pilih tipe...</option>
                {DEVICE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            )}
          </form.Field>
          <form.Field name="mqttTopic">
            {(f) => (
              <Input label="Topik MQTT * (unik)" placeholder="tani/kebun-1/node-tandon-1" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} required />
            )}
          </form.Field>
          <form.Field name="lokasi">
            {(f) => (
              <Input label="Lokasi (opsional)" placeholder="Dekat tandon utama" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
            )}
          </form.Field>
          {lahans !== undefined && (
            <form.Field name="lahanId">
              {(f) => (
                <Select label="Lahan (opsional)" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)}>
                  <option value="">Tanpa lahan khusus...</option>
                  {lahans.map((l) => (
                    <option key={l.id} value={l.id}>{l.nama}</option>
                  ))}
                </Select>
              )}
            </form.Field>
          )}

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
                  {st.busy || create.isPending ? "Menyimpan..." : "Simpan Device"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
