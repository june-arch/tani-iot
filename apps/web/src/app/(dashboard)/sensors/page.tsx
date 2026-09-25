"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { container, item } from "@/lib/motion";
import { Activity, Droplets, Thermometer, Beaker } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast, useToast } from "@/components/ui/Toast";
import { useSensors } from "@/hooks/useSensors";
import { SensorCard, describeSensor } from "@/components/sensors/SensorCard";
import { TelemetryTable } from "@/components/sensors/TelemetryTable";
import { ThresholdForm } from "@/components/sensors/ThresholdForm";
import { MQTT_BROKER, SENSOR_GROUPS } from "@/lib/constants";
import { kebunName } from "@/lib/endpoints";

const TABS = [
  { id: "Semua", label: "Semua", sub: "", Icon: Activity },
  { id: "Tanah", label: "Tanah", sub: "pH • NPK • Soil", Icon: Beaker },
  { id: "Air", label: "Air", sub: "Tandon • TDS", Icon: Droplets },
  { id: "Lingkungan", label: "Lingkungan", sub: "Temp • Humidity", Icon: Thermometer },
];

function isTabActive(filter: string, id: string): boolean {
  if (id === "Semua") return filter === "Semua";
  return filter === id || (SENSOR_GROUPS[id] ?? []).includes(filter);
}

export default function SensorsPage() {
  const [filter, setFilter] = useState("Semua");
  const [q, setQ] = useState("");
  const { toast, showToast } = useToast();
  const s = useSensors(showToast);
  const pills = filter === "Semua" ? [] : (SENSOR_GROUPS[filter] ?? []);
  const isSpecific = filter !== "Semua" && !SENSOR_GROUPS[filter];

  const filtered = s.sensors
    .map((sensor) => ({ sensor, m: describeSensor(sensor) }))
    .filter(({ m }) => {
      if (filter !== "Semua") {
        if (SENSOR_GROUPS[filter]) { if (!SENSOR_GROUPS[filter].includes(m.tipe)) return false; }
        else if (m.tipe !== filter) return false;
      }
      return !q || m.name.toLowerCase().includes(q.toLowerCase());
    });

  const hasKebun = s.kebuns !== null && s.kebuns.length > 0;
  const telTitle = s.selectedSensorObj ? (s.selectedSensorObj.name ?? s.selectedSensor) : "Pilih sensor";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
      <Toast message={toast} />

      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-[26px] font-[460] leading-[1.1] tracking-[-0.022em] text-ink-charcoal [text-wrap:balance]">Sensor</h1>
          <p className="mt-2 text-sm leading-6 text-stone-gray [text-wrap:pretty] max-w-[60ch]">Konfigurasi threshold, kalibrasi, dan status MQTT.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="lilac">MQTT ● Terhubung</Badge>
          <span className="text-xs text-stone-gray">broker: {MQTT_BROKER}</span>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card className="flex flex-wrap items-center justify-between gap-3 bg-paper-white">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-royal-violet animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-ink-charcoal">Status MQTT</p>
              <p className="text-xs text-stone-gray">Terhubung · {s.sensors.length} sensor terdaftar · interval 60 dtk</p>
            </div>
          </div>
          <Badge variant="lilac">QoS 1</Badge>
        </Card>
      </motion.div>

      <motion.div variants={item} className="rounded-card border border-soft-mist bg-paper-white p-1">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {TABS.map((tab) => {
            const active = isTabActive(filter, tab.id);
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className={["flex items-center gap-2 rounded-small-button px-3 py-2.5 text-left transition-colors", active ? "bg-lilac-mist text-ink-charcoal" : "bg-paper-white text-stone-gray hover:bg-warm-parchment hover:text-ink-charcoal"].join(" ")}>
                <span className={["flex h-7 w-7 items-center justify-center rounded-lg", active ? "bg-paper-white text-midnight-wine" : "bg-warm-parchment text-stone-gray"].join(" ")}>
                  <tab.Icon className="h-4 w-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xs font-bold leading-none">{tab.label}</span>
                  {tab.sub && <span className="text-[10px] leading-none opacity-70">{tab.sub}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {s.kebuns === null ? (
        <Skeleton className="h-11 w-48" />
      ) : !hasKebun ? (
        <Card className="py-10 text-center">
          <p className="text-3xl">🏡</p>
          <h3 className="mt-2 font-sans font-semibold text-ink-charcoal">Belum ada kebun</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone-gray">Buat kebun dulu untuk melihat device & sensor.</p>
        </Card>
      ) : (
        <motion.div variants={item} className="flex flex-wrap items-center gap-3">
          <Select label="Kebun" value={s.selectedKebun} onChange={(e) => s.setSelectedKebun(e.target.value)} className="max-w-xs">
            {(s.kebuns ?? []).map((k) => <option key={String(k.id)} value={String(k.id)}>{kebunName(k)}</option>)}
          </Select>
          <Input placeholder="Cari sensor..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <div className="flex flex-wrap gap-1.5">
            {pills.map((t) => (
              <button key={t} onClick={() => setFilter(t)} className="rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs font-semibold text-stone-gray hover:bg-paper-white hover:text-ink-charcoal">{t}</button>
            ))}
            {isSpecific && <button onClick={() => setFilter("Semua")} className="rounded-pill bg-midnight-wine px-3 py-1 text-xs font-semibold text-paper-white">Reset → Semua</button>}
          </div>
        </motion.div>
      )}

      {s.err && <div className="rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-[#991B1B]">⚠️ {s.err}</div>}

      {s.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={`sensor-skel-${i}`} className="h-40" />)}
        </div>
      ) : !hasKebun ? null : filtered.length === 0 ? (
        <Card className="py-16 text-center border-soft-mist bg-paper-white">
          <p className="text-4xl">📡</p>
          <h3 className="mt-3 font-sans font-semibold text-ink-charcoal">Tidak ada sensor</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone-gray">Tidak ditemukan sensor dengan filter ini. Coba ubah kata kunci atau tipe.</p>
          <Button variant="secondary" className="mt-4" onClick={() => { setFilter("Semua"); setQ(""); }}>Reset Filter</Button>
        </Card>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ m, sensor }) => (
            <motion.div key={m.id} variants={item}>
              <SensorCard sensor={sensor} selected={String(sensor.id) === s.selectedSensor} onSelect={s.setSelectedSensor} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {hasKebun && s.sensors.length > 0 && (
        <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
          <TelemetryTable title={telTitle} rows={s.telemetry} loading={s.telLoading} />
          <ThresholdForm
            key={`${s.selectedSensor}|${s.selectedSensorObj?.minThreshold ?? ""}|${s.selectedSensorObj?.maxThreshold ?? ""}|${s.selectedSensorObj?.isEnabled ?? ""}`}
            sensors={s.sensors}
            selectedId={s.selectedSensor}
            initialMin={s.selectedSensorObj?.minThreshold != null ? String(s.selectedSensorObj.minThreshold) : ""}
            initialMax={s.selectedSensorObj?.maxThreshold != null ? String(s.selectedSensorObj.maxThreshold) : ""}
            initialEnabled={s.selectedSensorObj?.isEnabled ?? true}
            onSelect={s.setSelectedSensor}
            onSaved={() => void s.refreshDevices(s.selectedKebun)}
            notify={showToast}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
