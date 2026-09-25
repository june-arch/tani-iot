import { z } from 'zod';

export type PanduanSemai = {
  id: string;
  mediaTanam: string;
  durasiHari: number;
  suhuOptimal: string;
  kelembaban: string;
  langkah: string[] | string | null;
  siapTanamIndikator: string;
};

export type PanduanTumbuh = {
  id: string;
  fase: 'VEGETATIF' | 'GENERATIF';
  pupuk: string | string[] | Record<string, string> | null;
  penyiraman: string;
  hama?: string | string[] | Record<string, string> | null;
  panenHariRange: string;
};

export type PanduanHidroponik = {
  id: string;
  sistem: string;
  ppmRange: string;
  phRange: string;
  nutrisi: string | Record<string, string> | null;
  durasiHari: number;
};

export type Crop = {
  id: string;
  name: string;
  slug: string;
  category: string;
  scientificName?: string | null;
  description?: string | null;
  iklimOptimal?: string | null;
  ketinggianOptimal?: string | null;
  sowingGuides?: PanduanSemai[];
  growingGuides?: PanduanTumbuh[];
  hydroponicGuides?: PanduanHidroponik[];
};

export type RencanaTanam = {
  id: string;
  cropName?: string;
  tanggalSemai?: string | null;
  lahan?: { nama?: string } | null;
  crop?: { name?: string } | null;
  prediksi?: { panenAvg?: string } | null;
};

export const cariTanamanSchema = z.object({
  cari: z.string().max(60, 'Pencarian maksimal 60 karakter'),
});

export type CariTanamanForm = z.infer<typeof cariTanamanSchema>;

/** Ubah nilai JSON/tekstual panduan menjadi teks tampil. */
export function formatPanduan(v: string | string[] | Record<string, string> | null | undefined): string {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.join(', ');
  return Object.entries(v)
    .map(([k, val]) => `${k}: ${val}`)
    .join(', ');
}
