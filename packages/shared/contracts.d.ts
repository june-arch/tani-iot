export type ID = string;

export interface Kebun {
  id: ID;
  nama: string;
  lokasi?: string | null;
  luas?: number | null;
  deskripsi?: string | null;
  pemilikId?: string;
  createdAt?: string;
}

export interface Lahan {
  id: ID;
  nama: string;
  kebunId: ID;
  kebunNama?: string;
  luas?: number | null;
}

export type SensorTipe =
  | "PH" | "NPK_N" | "NPK_P" | "NPK_K" | "SOIL_MOISTURE" | "PH_TANAH"
  | "WATER_LEVEL" | "TDS_PPM" | "EC" | "TDS"
  | "TEMP" | "HUMIDITY";

export interface Sensor {
  id: ID;
  name: string;
  tipe: SensorTipe | string;
  deviceId: ID;
  deviceNama?: string;
  unit?: string | null;
  minThreshold?: number | null;
  maxThreshold?: number | null;
  isEnabled?: boolean;
  lastValue?: number | null;
  status?: "online" | "offline" | "warning";
}

export interface Device {
  id: ID;
  nama: string;
  status?: string;
  kebunId: ID;
  lahanId?: ID | null;
  sensors: Sensor[];
}

export interface Telemetry {
  value: number;
  recordedAt: string;
}

export interface Crop {
  id: string;
  name: string;
  slug: string;
  category: string;
  scientificName?: string | null;
  description?: string | null;
  iklimOptimal?: string | null;
  ketinggianOptimal?: string | null;
  imageUrl?: string | null;
}

export type MetodeTanam = "TANAH" | "HIDROPONIK";
export type RencanaStatus = "SEMAI" | "TANAM" | "PANEN" | "SELESAI";

export interface RencanaPrediksi {
  tanam: string;
  siapTanamLabel: string;
  panenMin: string;
  panenMax: string;
  panenAvg: string;
  durasiSemai: number;
  panenRangeLabel: string;
}

export interface Rencana {
  id: ID;
  cropSlug: string;
  cropName: string;
  cropCategory: string;
  lahanId: ID | null;
  lahanNama: string;
  kebunNama: string;
  kebunId?: ID;
  metode: MetodeTanam;
  tanggalSemai: string;
  tanggalTanam?: string | null;
  tanggalPanen?: string | null;
  jumlah?: number | null;
  catatan?: string;
  prediksi: RencanaPrediksi;
  status: RencanaStatus;
  createdAt: string;
}
