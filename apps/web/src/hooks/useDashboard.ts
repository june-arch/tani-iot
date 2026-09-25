import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Device, type Kebun } from "@/lib/api";
import { ENDPOINTS, errorMessage } from "@/lib/endpoints";

export type DashboardState = {
  kebuns: Kebun[];
  totalLahan: number;
  totalDevices: number;
  onlineDevices: number;
  totalSensors: number;
  tandonPersen: number | null;
};

type TelemetryEnvelope = { data?: { value: number }[] };

function isRec(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

async function fetchDashboard(): Promise<DashboardState | null> {
  try {
    const kebuns = await api.get<Kebun[]>(ENDPOINTS.kebunsMy);
    if (kebuns.length === 0) {
      return { kebuns: [], totalLahan: 0, totalDevices: 0, onlineDevices: 0, totalSensors: 0, tandonPersen: null };
    }
    const perKebun = await Promise.all(
      kebuns.map(async (k) => {
        const id = String(k.id);
        try {
          const [lahans, devices] = await Promise.all([
            api.get<unknown[]>(ENDPOINTS.lahans(id)).catch(() => [] as unknown[]),
            api.get<Device[]>(ENDPOINTS.devices(id)).catch(() => [] as Device[]),
          ]);
          return { lahans: lahans.length, devices };
        } catch {
          return { lahans: 0, devices: [] as Device[] };
        }
      })
    );
    const totalLahan = perKebun.reduce((a, b) => a + b.lahans, 0);
    const allDevices = perKebun.flatMap((x) => x.devices);
    const onlineDevices = allDevices.filter((d) => (d.status ?? "").toLowerCase() === "online").length;
    const totalSensors = allDevices.reduce((a, d) => a + (d.sensors?.length ?? 0), 0);
    let tandonPersen: number | null = null;
    const tandonSensor = allDevices
      .flatMap((d) => d.sensors ?? [])
      .find((sn) => {
        const t = String(sn.type ?? sn.tipe ?? "").toLowerCase();
        return t.includes("water") || t.includes("tandon") || t.includes("level");
      });
    if (tandonSensor) {
      try {
        const tel = await api.get<TelemetryEnvelope>(ENDPOINTS.telemetry(String(tandonSensor.id), 1)).catch(() => null);
        const val = tel && Array.isArray(tel.data) ? tel.data[0]?.value : null;
        if (typeof val === "number") tandonPersen = Math.round(val);
      } catch { /* abaikan — tandon opsional */ }
    }
    return { kebuns, totalLahan, totalDevices: allDevices.length, onlineDevices, totalSensors, tandonPersen };
  } catch (e: unknown) {
    if (isRec(e) && e.status === 401) return null;
    throw e;
  }
}

export function useDashboard(notify: (m: string) => void) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30 * 1000,
  });
  const err = error ? errorMessage(error, "Gagal memuat ringkasan.") : null;
  const retry = useCallback(async (): Promise<void> => {
    const r = await refetch();
    if (r.error) notify(errorMessage(r.error, "Gagal memuat ringkasan."));
  }, [refetch, notify]);
  return { data: data ?? null, loading: isLoading, err, retry };
}
