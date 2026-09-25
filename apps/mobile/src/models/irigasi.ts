import { z } from 'zod';

export type LogIrigasi = {
  id?: string;
  status?: string;
  source?: string;
  sumber?: string;
  createdAt?: string;
  tgl?: string;
  durationSec?: number;
};

export type PemicuIrigasi = {
  kebunId: string;
  lahanId: string;
  durationSec: number;
  source: 'MANUAL';
};

export const pemicuIrigasiSchema = z.object({
  durasiDetik: z
    .string()
    .min(1, 'Durasi wajib diisi')
    .regex(/^\d+$/, 'Durasi harus berupa angka')
    .refine((v) => {
      const n = Number(v);
      return n >= 5 && n <= 600;
    }, 'Durasi minimal 5 detik dan maksimal 600 detik'),
});

export type PemicuIrigasiForm = z.infer<typeof pemicuIrigasiSchema>;
