"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X, AlertTriangle } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { kebunSchema } from "@/lib/schemas";

type KebunFormValues = { nama: string; lokasi: string; luas: string; deskripsi: string };

export function KebunFormModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const qc = useQueryClient();
  const [serverErr, setServerErr] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (v: { nama: string; lokasi?: string; luas?: number; deskripsi?: string }) =>
      api.post("/kebuns", v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kebuns"] });
      onSuccess("Kebun berhasil dibuat.");
      onClose();
    },
    onError: (e: unknown) =>
      setServerErr((e as { message?: string })?.message ?? "Gagal membuat kebun."),
  });

  const form = useForm({
    defaultValues: { nama: "", lokasi: "", luas: "", deskripsi: "" } as KebunFormValues,
    onSubmit: async ({ value }) => {
      setServerErr(null);
      const luas =
        value.luas.trim() === ""
          ? undefined
          : Number.isNaN(Number(value.luas))
            ? Number.NaN
            : Number(value.luas);
      if (luas !== undefined && (typeof luas !== "number" || Number.isNaN(luas))) {
        setServerErr("Luas harus angka.");
        return;
      }
      const parsed = kebunSchema.safeParse({
        nama: value.nama,
        lokasi: value.lokasi || undefined,
        luas,
        deskripsi: value.deskripsi || undefined,
      });
      if (!parsed.success) {
        setServerErr(parsed.error.issues[0]?.message ?? "Data kebun tidak valid.");
        return;
      }
      await create.mutateAsync({
        nama: parsed.data.nama.trim(),
        ...(parsed.data.lokasi?.trim() ? { lokasi: parsed.data.lokasi.trim() } : {}),
        ...(parsed.data.luas != null ? { luas: parsed.data.luas } : {}),
        ...(parsed.data.deskripsi?.trim() ? { deskripsi: parsed.data.deskripsi.trim() } : {}),
      });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Tambah kebun"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-card border border-soft-mist bg-paper-white p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">Tambah Kebun</h3>
            <p className="mt-1 text-sm leading-5 text-stone-gray">
              Isi data kebun. Anggota otomatis: Anda sebagai OWNER.
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
              <Input label="Nama kebun *" placeholder="Kebun Sawah Teras" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} required />
            )}
          </form.Field>
          <form.Field name="lokasi">
            {(f) => (
              <Input label="Lokasi" placeholder="Sawah Teras, Bandung" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
            )}
          </form.Field>
          <form.Field name="luas">
            {(f) => (
              <Input label="Luas (m²)" type="number" placeholder="1000" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />
            )}
          </form.Field>
          <form.Field name="deskripsi">
            {(f) => (
              <Textarea label="Deskripsi" placeholder="Deskripsi singkat kebun" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} rows={3} />
            )}
          </form.Field>

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
                  {st.busy || create.isPending ? "Menyimpan..." : "Simpan Kebun"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
