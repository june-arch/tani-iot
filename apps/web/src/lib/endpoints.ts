// Tani IoT — endpoint API terpusat (tanpa magic strings di page/hook).
// Bentuk ENDPOINTS dipakai juga oleh src/lib/queries.ts.
export const ENDPOINTS = {
  kebunsMy: "/kebuns/my",
  lahans: (kebunId: string) => `/kebuns/${kebunId}/lahans`,
  devices: (kebunId: string) => `/kebuns/${kebunId}/devices`,
  telemetry: (sensorId: string, limit = 20) => `/sensors/${sensorId}/telemetry?limit=${limit}`,
  sensorConfig: (sensorId: string) => `/sensors/${sensorId}/config`,
  plantings: "/plantings",
  planting: (id: string) => `/plantings/${id}`,
  crops: "/crops",
  crop: (slug: string) => `/crops/${slug}`,
  releases: "/releases",
  release: (id: string) => `/releases/${id}`,
  releaseLatest: (currentCode?: number) =>
    typeof currentCode === "number"
      ? `/releases/latest?currentCode=${currentCode}`
      : "/releases/latest",
} as const;

export function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

export function kebunName(k: { nama?: string | null; name?: string | null } | null | undefined): string {
  return k?.nama ?? k?.name ?? "Kebun";
}
