import { useQuery } from '@tanstack/react-query';
import { normalizeError } from '../api/client';
import { kebunService } from '../services/kebunService';
import { sensorService } from '../services/sensorService';
import { tanamanService } from '../services/tanamanService';
import type { Kebun } from '../models/kebun';
import type { RencanaTanam } from '../models/tanaman';

export type RingkasanDashboard = {
  kebuns: Kebun[];
  totalLahan: number;
  totalDevices: number;
  totalSensors: number;
  tandonPersen: number | null;
  plantings: RencanaTanam[];
};

const KOSONG: RingkasanDashboard = {
  kebuns: [],
  totalLahan: 0,
  totalDevices: 0,
  totalSensors: 0,
  tandonPersen: null,
  plantings: [],
};

export function useDashboardViewModel() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<RingkasanDashboard> => {
      const kebuns = await kebunService.daftarKebunSaya();
      if (kebuns.length === 0) return KOSONG;
      const perKebun = await Promise.all(
        kebuns.map(async (k) => {
          try {
            const [lahans, devices] = await Promise.all([
              kebunService.daftarLahan(k.id),
              sensorService.daftarDevice(k.id),
            ]);
            return { lahan: lahans.length, devices };
          } catch {
            return { lahan: 0, devices: [] };
          }
        }),
      );
      const totalLahan = perKebun.reduce((a, b) => a + b.lahan, 0);
      const semuaDevice = perKebun.flatMap((x) => x.devices);
      const totalSensors = semuaDevice.reduce((a, d) => a + (d.sensors?.length ?? 0), 0);
      let tandonPersen: number | null = null;
      const tandon = semuaDevice
        .flatMap((d) => d.sensors ?? [])
        .find((s) => {
          const t = (s.type ?? s.tipe ?? '').toString().toLowerCase();
          return t.includes('water') || t.includes('tandon') || t.includes('level');
        });
      if (tandon?.id) {
        try {
          const nilai = await sensorService.telemetriTerakhir(tandon.id);
          if (nilai !== null) tandonPersen = Math.round(nilai);
        } catch {
          tandonPersen = null;
        }
      }
      let plantings: RencanaTanam[] = [];
      try {
        plantings = await tanamanService.daftarRencana();
      } catch {
        plantings = [];
      }
      return {
        kebuns,
        totalLahan,
        totalDevices: semuaDevice.length,
        totalSensors,
        tandonPersen,
        plantings,
      };
    },
  });

  return {
    ringkasan: query.data ?? KOSONG,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    pesanError: query.isError ? normalizeError(query.error) : null,
    refetch: query.refetch,
  };
}
