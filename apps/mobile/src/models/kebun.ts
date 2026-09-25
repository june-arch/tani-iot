import { z } from 'zod';

export type Kebun = {
  id: string;
  nama: string;
  lokasi: string;
  luas?: number | null;
  deskripsi?: string | null;
};

export type Lahan = {
  id: string;
  nama: string;
  kebunId: string;
  luas?: number | null;
};

export const kebunSchema = z.object({
  nama: z.string().min(3, 'Nama kebun minimal 3 karakter').max(80, 'Nama kebun maksimal 80 karakter'),
  lokasi: z.string().min(3, 'Lokasi minimal 3 karakter').max(120, 'Lokasi maksimal 120 karakter'),
  luas: z.string().max(12, 'Luas tidak valid').optional().default(''),
  deskripsi: z.string().max(300, 'Deskripsi maksimal 300 karakter').optional().default(''),
});

export type KebunForm = z.infer<typeof kebunSchema>;

export const cariKebunSchema = z.object({
  cari: z.string().max(60, 'Pencarian maksimal 60 karakter'),
});

export type CariKebunForm = z.infer<typeof cariKebunSchema>;
