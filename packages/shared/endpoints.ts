export const ENDPOINTS = {
  kebunsMy: "/kebuns/my",
  lahans: (kebunId: string) => `/kebuns/${kebunId}/lahans`,
  devices: (kebunId: string) => `/kebuns/${kebunId}/devices`,
  telemetry: (sensorId: string, limit = 20) =>
    `/sensors/${sensorId}/telemetry?limit=${limit}`,
  sensorConfig: (sensorId: string) => `/sensors/${sensorId}/config`,
  plantings: "/plantings",
  planting: (id: string) => `/plantings/${id}`,
  crops: "/crops",
  crop: (slug: string) => `/crops/${slug}`,
  irrigationTrigger: "/irrigation/trigger",
  irrigationLogs: "/irrigation/logs",
  aiDiagnose: "/ai/diagnose",
} as const;

export const SENSOR_GROUPS: Record<string, string[]> = {
  Tanah: ["PH", "NPK_N", "NPK_P", "NPK_K", "SOIL_MOISTURE", "PH_TANAH"],
  Air: ["WATER_LEVEL", "TDS_PPM", "EC", "TDS"],
  Lingkungan: ["TEMP", "HUMIDITY"],
};

export const TANDON_RENDAH_PERSEN = 20;
export const TOAST_MS = 3500;
