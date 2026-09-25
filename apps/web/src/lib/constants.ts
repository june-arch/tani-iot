// Tani IoT — konstanta UI (tanpa hardcode IP di UI).

export const SENSOR_GROUPS: Record<string, string[]> = {
  Tanah: ["PH", "NPK_N", "NPK_P", "NPK_K", "SOIL_MOISTURE", "PH_TANAH"],
  Air: ["WATER_LEVEL", "TDS_PPM", "EC", "TDS"],
  Lingkungan: ["TEMP", "HUMIDITY"],
};

export const TANDON_RENDAH = 20;

export const TOAST_MS = 3500;

export const MQTT_BROKER =
  process.env.NEXT_PUBLIC_MQTT_BROKER ?? "mqtt://broker:1883";
