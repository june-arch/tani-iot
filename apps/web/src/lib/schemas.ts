// Tani IoT — zod schemas (pesan Indonesia).
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export const kebunSchema = z.object({
  nama: z.string().min(3, "Nama kebun minimal 3 karakter"),
  lokasi: z.string().optional(),
  luas: z.coerce.number().positive("Luas harus lebih dari 0").optional(),
  deskripsi: z.string().optional(),
});

export const thresholdSchema = z
  .object({
    min: z.coerce.number().nullable().optional(),
    max: z.coerce.number().nullable().optional(),
  })
  .refine((v) => v.min == null || v.max == null || v.min < v.max, {
    message: "Batas bawah harus lebih kecil dari batas atas",
    path: ["min"],
  });

export const rencanaTanamSchema = z.object({
  lahanId: z.string().min(1, "Lahan wajib dipilih"),
  cropSlug: z.string().min(1, "Tanaman wajib dipilih"),
  tanggalSemai: z.string().min(1, "Tanggal semai wajib diisi"),
  metode: z.enum(["semai", "pindah_tanam", "tanam_langsung"], {
    message: "Metode tanam tidak valid",
  }),
  jumlah: z.coerce.number().positive("Jumlah harus lebih dari 0").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type KebunInput = z.infer<typeof kebunSchema>;
export type ThresholdInput = z.infer<typeof thresholdSchema>;
export type RencanaTanamInput = z.infer<typeof rencanaTanamSchema>;
