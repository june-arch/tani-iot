// Tani IoT — query hooks (queryKey stabil, adapter envelope terpusat).
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, type Crop, type Device, type Kebun, type Telemetry } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { normalizeList } from "@/lib/envelope";

export type Lahan = {
  id: string;
  nama: string;
  kebunId?: string;
  luas?: number | null;
  [k: string]: unknown;
};

export type Planting = {
  id: string;
  lahanId?: string;
  cropSlug?: string;
  tanggalSemai?: string;
  [k: string]: unknown;
};

export function useKebuns() {
  return useQuery({
    queryKey: ["kebuns", "my"],
    queryFn: async () => {
      const raw = await apiFetch<unknown>(ENDPOINTS.kebunsMy);
      return normalizeList<Kebun>(raw);
    },
  });
}

export function useLahans(kebunId: string | null | undefined) {
  return useQuery({
    queryKey: ["lahans", kebunId],
    enabled: !!kebunId,
    queryFn: async () => {
      const raw = await apiFetch<unknown>(ENDPOINTS.lahans(kebunId as string));
      return normalizeList<Lahan>(raw);
    },
  });
}

export function useDevices(kebunId: string | null | undefined) {
  return useQuery({
    queryKey: ["devices", kebunId],
    enabled: !!kebunId,
    queryFn: async () => {
      const raw = await apiFetch<unknown>(ENDPOINTS.devices(kebunId as string));
      return normalizeList<Device>(raw);
    },
  });
}

export function useTelemetry(sensorId: string | null | undefined, limit = 20) {
  return useQuery({
    queryKey: ["telemetry", sensorId, limit],
    enabled: !!sensorId,
    queryFn: async () => {
      const raw = await apiFetch<unknown>(
        ENDPOINTS.telemetry(sensorId as string, limit),
      );
      return normalizeList<Telemetry>(raw);
    },
  });
}

export function useCrops() {
  return useQuery({
    queryKey: ["crops"],
    queryFn: async () => {
      const raw = await apiFetch<unknown>(ENDPOINTS.crops);
      return normalizeList<Crop>(raw);
    },
  });
}

export function usePlantings() {
  return useQuery({
    queryKey: ["plantings"],
    queryFn: async () => {
      const raw = await apiFetch<unknown>(ENDPOINTS.plantings);
      return normalizeList<Planting>(raw);
    },
  });
}
