"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, type Kebun, type Device, type Sensor } from "@/lib/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function displaySensor(s: Sensor & { deviceNama?: string; lastValue?: number | null }) {
  const tipe = (s.type ?? s.tipe ?? "Sensor") as string;
  const name = (s as unknown as { name?: string }).name ?? `${tipe} ${String(s.id).slice(0, 6)}`;
  const value = (s as unknown as { lastValue?: number | null }).lastValue != null ? String((s as unknown as { lastValue?: number | null }).lastValue) : "—";
  const unit = s.unit ?? "";
  const rawStatus = (s as unknown as { status?: string }).status;
  const status: "online" | "offline" | "warning" = s.isEnabled === false ? "offline" : rawStatus === "offline" ? "offline" : rawStatus === "warning" ? "warning" : "online";
  return { name, tipe, value, unit, status, id: String(s.id), lahan: (s as unknown as { deviceNama?: string }).deviceNama ?? s.deviceId };
}

export default function SensorsPage() {
  const [filter, setFilter] = useState("Semua");
  const [q, setQ] = useState("");
  const [kebuns, setKebuns] = useState<Kebun[] | null>(null);
  const [selectedKebun, setSelectedKebun] = useState<string>("");
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [sensors, setSensors] = useState<(Sensor & { deviceNama?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // telemetry & threshold form
  const [selectedSensor, setSelectedSensor] = useState<string>("");
  const [telemetry, setTelemetry] = useState<{ value: number; recordedAt: string }[] | null>(null);
  const [telLoading, setTelLoading] = useState(false);
  const [thMin, setThMin] = useState("");
  const [thMax, setThMax] = useState("");
  const [thEnabled, setThEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 3500);
  }

  // fetch kebuns
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.get<Kebun[]>("/kebuns/my");
        if (!alive) return;
        setKebuns(data);
        if (data.length > 0) setSelectedKebun(String(data[0].id));
        else setLoading(false);
      } catch (e: unknown) {
        const status = (e as { status?: number })?.status;
        if (status === 401) return;
        const msg = (e as { message?: string })?.message ?? "Gagal memuat kebun.";
        if (alive) { setErr(msg); showToast(msg); setLoading(false); }
      }
    })();
    return () => { alive = false; };
  }, []);

  // fetch devices for selected kebun
  useEffect(() => {
    if (!selectedKebun) return;
    let alive = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const devs = await api.get<Device[]>(`/kebuns/${selectedKebun}/devices`);
        if (!alive) return;
        setDevices(devs);
        const allSensors = devs.flatMap((d) => (d.sensors ?? []).map((s) => ({ ...s, deviceNama: d.nama })));
        // enrich with last telemetry value (optional, fetch last 1 per sensor could be heavy — skip for list, show — and fetch on select)
        setSensors(allSensors as (Sensor & { deviceNama?: string })[]);
        if (allSensors.length > 0) {
          const firstId = String(allSensors[0].id);
          if (!selectedSensor) setSelectedSensor(firstId);
          // prefill threshold from first sensor
          const f = allSensors[0] as Sensor;
          if (f.minThreshold != null) setThMin(String(f.minThreshold));
          if (f.maxThreshold != null) setThMax(String(f.maxThreshold));
        }
      } catch (e: unknown) {
        const status = (e as { status?: number })?.status;
        if (status === 401) return;
        const msg = (e as { message?: string })?.message ?? "Gagal memuat device/sensor.";
        if (alive) { setErr(msg); showToast(msg); }
        if (alive) setDevices([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [selectedKebun]);

  // fetch telemetry for selected sensor
  useEffect(() => {
    if (!selectedSensor) { setTelemetry(null); return; }
    let alive = true;
    async function load() {
      setTelLoading(true);
      try {
        const res = await api.get<{ data: { value: number; recordedAt: string }[]; meta?: unknown } | { value: number; recordedAt: string }[]>(`/sensors/${selectedSensor}/telemetry?limit=20`);
        if (!alive) return;
        // unwrap
        let rows: { value: number; recordedAt: string }[] = [];
        if (Array.isArray(res)) rows = res as { value: number; recordedAt: string }[];
        else if (res && typeof res === "object" && "data" in res) rows = (res as { data: { value: number; recordedAt: string }[] }).data;
        else rows = [];
        setTelemetry(rows);
        // sync threshold fields from sensor metadata if available
        const s = sensors.find((x) => String(x.id) === selectedSensor) as Sensor | undefined;
        if (s) {
          if (s.minThreshold != null) setThMin(String(s.minThreshold));
          else setThMin("");
          if (s.maxThreshold != null) setThMax(String(s.maxThreshold));
          else setThMax("");
          setThEnabled(s.isEnabled ?? true);
        }
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message ?? "Gagal memuat telemetry.";
        showToast(msg);
        if (alive) setTelemetry([]);
      } finally {
        if (alive) setTelLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [selectedSensor]);

  async function handleThresholdSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSensor) { showToast("Pilih sensor terlebih dahulu."); return; }
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, unknown> = {
        isEnabled: thEnabled,
      };
      if (thMin.trim() !== "") {
        const n = Number(thMin);
        if (Number.isNaN(n)) { showToast("Batas bawah harus angka."); setSaving(false); return; }
        payload.minThreshold = n;
      } else payload.minThreshold = null;
      if (thMax.trim() !== "") {
        const n = Number(thMax);
        if (Number.isNaN(n)) { showToast("Batas atas harus angka."); setSaving(false); return; }
        payload.maxThreshold = n;
      } else payload.maxThreshold = null;

      await api.patch(`/sensors/${selectedSensor}/config`, payload);
      showToast("Threshold berhasil disimpan.");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      // refresh sensors to reflect new thresholds
      if (selectedKebun) {
        const devs = await api.get<Device[]>(`/kebuns/${selectedKebun}/devices`);
        setDevices(devs);
        setSensors(devs.flatMap((d) => (d.sensors ?? []).map((s) => ({ ...s, deviceNama: d.nama }))) as (Sensor & { deviceNama?: string })[]);
      }
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Gagal menyimpan threshold.";
      showToast(msg);
    } finally {
      setSaving(false);
    }
  }

  const filtered = sensors
    .map((s) => ({ orig: s, disp: displaySensor(s as Sensor & { deviceNama?: string; lastValue?: number | null }) }))
    .filter(({ disp }) => {
      if (filter !== "Semua" && disp.tipe !== filter) return false;
      if (q && !disp.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });

  const hasKebun = kebuns !== null && kebuns.length > 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
      {toast && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-fg shadow-lg">{toast}</div>}

      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight">Sensor</h1>
          <p className="mt-1 text-sm text-muted-fg">Konfigurasi threshold, kalibrasi, dan status MQTT.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">MQTT ● Terhubung</Badge>
          <span className="text-xs text-muted-fg">broker: mqtt://101.50.2.190:1883</span>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card muted className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <div>
              <p className="text-sm font-semibold">Status MQTT</p>
              <p className="text-xs text-muted-fg">Terhubung · {sensors.length} sensor terdaftar · interval 60 dtk</p>
            </div>
          </div>
          <Badge variant="primary">QoS 1</Badge>
        </Card>
      </motion.div>

      {/* Kebun selector */}
      {kebuns === null ? (
        <Skeleton className="h-11 w-48" />
      ) : !hasKebun ? (
        <Card className="py-10 text-center">
          <p className="text-3xl">🏡</p>
          <h3 className="mt-2 font-sans font-semibold">Belum ada kebun</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-fg">Buat kebun dulu untuk melihat device & sensor.</p>
        </Card>
      ) : (
        <motion.div variants={item} className="flex flex-wrap items-center gap-3">
          <Select label="Kebun" value={selectedKebun} onChange={(e) => setSelectedKebun(e.target.value)} className="max-w-xs">
            {kebuns.map((k) => {
              const name = (k.nama as string) ?? (k.name as string) ?? "Kebun";
              return <option key={String(k.id)} value={String(k.id)}>{name}</option>;
            })}
          </Select>
          <Input placeholder="Cari sensor..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <div className="flex flex-wrap gap-2">
            {["Semua", "PH", "NPK_N", "NPK_P", "NPK_K", "TDS_PPM", "WATER_LEVEL", "TEMP", "HUMIDITY", "SOIL_MOISTURE"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={[
                  "h-11 rounded-pill border px-3 text-xs font-semibold transition-colors",
                  filter === t ? "bg-primary text-primary-fg border-primary" : "bg-background hover:bg-muted",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {err && <div className="rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-[#991B1B]">⚠️ {err}</div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !hasKebun ? null : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-4xl">📡</p>
          <h3 className="mt-3 font-sans font-semibold">Tidak ada sensor</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-fg">
            Tidak ditemukan sensor dengan filter ini. Coba ubah kata kunci atau tipe.
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => { setFilter("Semua"); setQ(""); }}>
            Reset Filter
          </Button>
        </Card>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ disp, orig }) => {
            const isSelected = String(orig.id) === selectedSensor;
            return (
              <motion.div key={disp.id} variants={item}>
                <Card className={["relative cursor-pointer transition-colors", isSelected ? "border-primary ring-2 ring-primary/20" : ""].join(" ")} onClick={() => setSelectedSensor(String(orig.id))}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {disp.name}
                    </CardTitle>
                    <Badge variant={disp.status === "online" ? "success" : disp.status === "warning" ? "warning" : "destructive"}>
                      {disp.status === "online" ? "Online" : disp.status === "warning" ? "Perhatian" : "Offline"}
                    </Badge>
                  </CardHeader>
                  <p className="mt-3 font-mono text-2xl font-bold">
                    {disp.value} <span className="text-sm font-medium text-muted-fg">{disp.unit}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-fg">
                    {disp.lahan} · {disp.tipe}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/4 rounded-full bg-primary opacity-60" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Telemetry & threshold */}
      {hasKebun && sensors.length > 0 && (
        <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="font-sans text-base font-semibold">Telemetry — {sensors.find((s) => String(s.id) === selectedSensor) ? (sensors.find((s) => String(s.id) === selectedSensor)?.name ?? selectedSensor) : "Pilih sensor"}</h3>
            <p className="mt-1 text-sm text-muted-fg">20 data terakhir. Klik kartu sensor untuk ganti.</p>
            {telLoading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : !telemetry || telemetry.length === 0 ? (
              <p className="mt-4 rounded-lg bg-muted px-3 py-3 text-sm text-muted-fg">Belum ada data telemetry untuk sensor ini.</p>
            ) : (
              <div className="mt-4 max-h-64 overflow-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Waktu</th>
                      <th className="px-3 py-2 text-right font-semibold">Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemetry.map((t, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">{new Date(t.recordedAt).toLocaleString("id-ID")}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">{t.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-sans text-base font-semibold">Atur Threshold</h3>
            <p className="mt-1 text-sm text-muted-fg">Simpan ambang batas — akan memicu alert jika telemetry di luar range. PATCH /sensors/:id/config</p>
            <form onSubmit={handleThresholdSave} className="mt-4 grid gap-4 sm:grid-cols-2">
              <Select label="Sensor" value={selectedSensor} onChange={(e) => setSelectedSensor(e.target.value)}>
                {sensors.map((s) => (
                  <option key={String(s.id)} value={String(s.id)}>{(s.name ?? String(s.id))} — {(s.type ?? s.tipe ?? "") as string}</option>
                ))}
              </Select>
              <Select label="Aktif" value={thEnabled ? "true" : "false"} onChange={(e) => setThEnabled(e.target.value === "true")}>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </Select>
              <Input label="Batas Bawah (minThreshold)" placeholder="mis. 5.5" value={thMin} onChange={(e) => setThMin(e.target.value)} inputMode="decimal" />
              <Input label="Batas Atas (maxThreshold)" placeholder="mis. 6.5" value={thMax} onChange={(e) => setThMax(e.target.value)} inputMode="decimal" />
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving} className="w-full">{saving ? "Menyimpan..." : "Simpan Threshold"}</Button>
              </div>
            </form>
            {saved && <p className="mt-3 text-sm font-medium text-success">✓ Threshold tersimpan</p>}
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
