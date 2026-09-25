import client, { normalizeList } from '../api/client';
import type { Device, Sensor, SensorDenganKonteks } from '../models/sensor';
import type { Kebun } from '../models/kebun';

export type AgregatSensor = {
  sensors: SensorDenganKonteks[];
  tandonPersen: number | null;
  tandon?: SensorDenganKonteks | null;
};

function tandaiTandon(s: Sensor): boolean {
  const t = (s.type ?? s.tipe ?? '').toString().toUpperCase();
  return t.includes('WATER') || t.includes('TANDON') || t.includes('LEVEL');
}

export const sensorService = {
  async daftarDevice(kebunId: string): Promise<Device[]> {
    const res = await client.get(`/kebuns/${kebunId}/devices`);
    return normalizeList<Device>(res.data);
  },

  async telemetriTerakhir(sensorId: string, limit = 1): Promise<number | null> {
    const res = await client.get(`/sensors/${sensorId}/telemetry?limit=${limit}`);
    const arr = normalizeList<{ value?: number }>(res.data);
    const nilai = arr[0]?.value;
    return typeof nilai === 'number' ? nilai : null;
  },

  /** Agregasi kebun → device → sensor + level tandon terkini. */
  async agregatSemua(kebuns: Kebun[]): Promise<AgregatSensor> {
    if (kebuns.length === 0) return { sensors: [], tandonPersen: null, tandon: null };
    const semua: SensorDenganKonteks[] = [];
    for (const k of kebuns) {
      try {
        const devices = await this.daftarDevice(k.id);
        for (const d of devices) {
          for (const s of d.sensors ?? []) {
            semua.push({ ...s, deviceNama: d.nama, kebunNama: k.nama });
          }
        }
      } catch {
        // Satu kebun gagal — lanjutkan kebun lain
      }
    }
    const tandon = semua.find(tandaiTandon) ?? null;
    let tandonPersen: number | null = null;
    if (tandon) {
      try {
        const nilai = await this.telemetriTerakhir(tandon.id);
        if (nilai !== null) tandonPersen = Math.round(nilai);
      } catch {
        tandonPersen = null;
      }
    }
    return { sensors: semua, tandonPersen, tandon };
  },
};
