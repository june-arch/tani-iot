import { z } from 'zod';

export type Device = {
  id: string;
  nama: string;
  kebunId?: string;
  sensors?: Sensor[];
};

export type Sensor = {
  id: string;
  type?: string;
  tipe?: string;
  unit?: string | null;
  deviceId: string;
  isEnabled?: boolean;
  minThreshold?: number | null;
  maxThreshold?: number | null;
};

export type SensorDenganKonteks = Sensor & {
  deviceNama?: string;
  kebunNama?: string;
};

export type TelemetryTandon = {
  persen: number | null;
  sensor?: SensorDenganKonteks | null;
};

export const KATEGORI_SENSOR = ['Semua', 'Tanah', 'Air', 'Lingkungan'] as const;
export type KategoriSensor = (typeof KATEGORI_SENSOR)[number];

export const filterSensorSchema = z.object({
  kategori: z.enum(KATEGORI_SENSOR),
  cari: z.string().max(60, 'Pencarian maksimal 60 karakter'),
});

export type FilterSensorForm = z.infer<typeof filterSensorSchema>;

const TIPE_TANAH = ['PH', 'NPK_N', 'NPK_P', 'NPK_K', 'SOIL_MOISTURE'];
const TIPE_AIR = ['WATER_LEVEL', 'TDS_PPM', 'TDS', 'EC'];
const TIPE_LINGKUNGAN = ['TEMP', 'HUMIDITY', 'TEMPERATURE'];

/** Kelompokkan tipe sensor ke kategori tab. */
export function kategoriDariTipe(sensor: Sensor): Exclude<KategoriSensor, 'Semua'> | null {
  const t = (sensor.type ?? sensor.tipe ?? '').toString().toUpperCase();
  if (TIPE_TANAH.some((x) => t.includes(x))) return 'Tanah';
  if (TIPE_AIR.some((x) => t.includes(x))) return 'Air';
  if (TIPE_LINGKUNGAN.some((x) => t.includes(x))) return 'Lingkungan';
  return null;
}

export function labelSensor(sensor: Sensor): string {
  return (sensor.type ?? sensor.tipe ?? 'Sensor').toString();
}

export function ikonSensor(sensor: Sensor): string {
  const t = labelSensor(sensor).toUpperCase();
  if (t.includes('PH')) return '🧪';
  if (t.includes('TDS') || t.includes('EC')) return '🧂';
  if (t.includes('WATER') || t.includes('LEVEL') || t.includes('TANDON')) return '💧';
  if (t.includes('TEMP')) return '🌡️';
  if (t.includes('HUMID')) return '💦';
  return '🌱';
}
