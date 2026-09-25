import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Device, type Kebun, type Sensor } from "@/lib/api";
import { ENDPOINTS, errorMessage } from "@/lib/endpoints";

export type SensorEnriched = Sensor & { deviceNama?: string };
export type TelemetryRow = { value: number; recordedAt: string };

function isRec(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function is401(e: unknown): boolean {
  return isRec(e) && e.status === 401;
}

function toRows(res: unknown): TelemetryRow[] {
  const list: unknown = isRec(res) && "data" in res ? res.data : res;
  if (!Array.isArray(list)) return [];
  return list.filter(isRec).flatMap((r): TelemetryRow[] => {
    const value = typeof r.value === "number" ? r.value : Number(r.value);
    const recordedAt = typeof r.recordedAt === "string" ? r.recordedAt : "";
    return !Number.isNaN(value) && recordedAt ? [{ value, recordedAt }] : [];
  });
}

export function useSensors(notify: (m: string) => void) {
  const queryClient = useQueryClient();
  const [selectedKebun, setSelectedKebun] = useState<string>("");
  const [selectedSensor, setSelectedSensor] = useState<string>("");

  const kebunsQuery = useQuery({
    queryKey: ["kebuns-my"],
    queryFn: async (): Promise<Kebun[]> => {
      try {
        return await api.get<Kebun[]>(ENDPOINTS.kebunsMy);
      } catch (e: unknown) {
        if (is401(e)) return [];
        throw e;
      }
    },
  });
  const kebuns = kebunsQuery.data ?? null;

  // Sinkronisasi pilihan default tanpa useEffect (render-phase adjustment).
  if (kebuns && kebuns.length > 0 && !selectedKebun) {
    setSelectedKebun(String(kebuns[0].id));
  }

  const devicesQuery = useQuery({
    queryKey: ["devices", selectedKebun],
    enabled: selectedKebun.length > 0,
    queryFn: async (): Promise<Device[]> => {
      try {
        return await api.get<Device[]>(ENDPOINTS.devices(selectedKebun));
      } catch (e: unknown) {
        if (is401(e)) return [];
        throw e;
      }
    },
  });

  const sensors = useMemo<SensorEnriched[]>(() => {
    const devs = devicesQuery.data ?? [];
    return devs.flatMap((d) => (d.sensors ?? []).map((s) => ({ ...s, deviceNama: d.nama })));
  }, [devicesQuery.data]);

  // Pertahankan pilihan sensor bila masih ada, fallback ke sensor pertama.
  if (sensors.length === 0) {
    if (selectedSensor !== "") setSelectedSensor("");
  } else if (!selectedSensor || !sensors.some((s) => String(s.id) === selectedSensor)) {
    setSelectedSensor(String(sensors[0].id));
  }

  const telemetryQuery = useQuery({
    queryKey: ["telemetry", selectedSensor],
    enabled: selectedSensor.length > 0,
    queryFn: async (): Promise<TelemetryRow[]> => {
      try {
        return toRows(await api.get<unknown>(ENDPOINTS.telemetry(selectedSensor)));
      } catch {
        return [];
      }
    },
  });

  const loading = kebunsQuery.isLoading || devicesQuery.isLoading;
  const err = kebunsQuery.error
    ? errorMessage(kebunsQuery.error, "Gagal memuat kebun.")
    : devicesQuery.error
      ? errorMessage(devicesQuery.error, "Gagal memuat device/sensor.")
      : null;

  const refreshDevices = useCallback(async (kebunId: string): Promise<void> => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["devices", kebunId] });
    } catch (e: unknown) {
      notify(errorMessage(e, "Gagal memuat device/sensor."));
    }
  }, [queryClient, notify]);

  const selectedSensorObj = sensors.find((x) => String(x.id) === selectedSensor);

  return {
    kebuns, selectedKebun, setSelectedKebun,
    sensors, loading, err,
    selectedSensor, setSelectedSensor, selectedSensorObj,
    telemetry: telemetryQuery.data ?? null, telLoading: telemetryQuery.isLoading,
    refreshDevices,
  };
}
