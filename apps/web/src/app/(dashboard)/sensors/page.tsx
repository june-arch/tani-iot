"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

type SensorMock = {
  id: string;
  name: string;
  tipe: string;
  value: string;
  unit: string;
  status: "online" | "offline" | "warning";
  lastSeen: string;
  lahan: string;
};

const MOCK: SensorMock[] = [
  { id: "s1", name: "pH Tanah A1", tipe: "pH", value: "6.2", unit: "pH", status: "online", lastSeen: "2 menit lalu", lahan: "Lahan A1" },
  { id: "s2", name: "NPK A1", tipe: "NPK", value: "18/22/15", unit: "ppm", status: "warning", lastSeen: "5 menit lalu", lahan: "Lahan A1" },
  { id: "s3", name: "Kelembapan Tanah B1", tipe: "Kelembapan", value: "68", unit: "%", status: "online", lastSeen: "1 menit lalu", lahan: "Lahan B1" },
  { id: "s4", name: "Suhu Udara", tipe: "Suhu", value: "29.4", unit: "°C", status: "online", lastSeen: "30 detik lalu", lahan: "Lahan B1" },
  { id: "s5", name: "Level Tandon", tipe: "Tandon", value: "68", unit: "%", status: "online", lastSeen: "2 menit lalu", lahan: "Tandon Utama" },
  { id: "s6", name: "PPM Hidroponik NFT", tipe: "PPM", value: "980", unit: "ppm", status: "offline", lastSeen: "1 jam lalu", lahan: "Hidroponik" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function SensorsPage() {
  const [filter, setFilter] = useState("Semua");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState(false);

  const filtered = MOCK.filter((s) => {
    if (filter !== "Semua" && s.tipe !== filter) return false;
    if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const loading = false;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-20 lg:pb-0">
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

      {/* MQTT status card */}
      <motion.div variants={item}>
        <Card muted className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <div>
              <p className="text-sm font-semibold">Status MQTT</p>
              <p className="text-xs text-muted-fg">Terhubung · 6 sensor terdaftar · interval 60 dtk</p>
            </div>
          </div>
          <Badge variant="primary">QoS 1</Badge>
        </Card>
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex flex-wrap items-center gap-3">
        <Input placeholder="Cari sensor..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <div className="flex flex-wrap gap-2">
          {["Semua", "pH", "NPK", "PPM", "Tandon", "Suhu", "Kelembapan"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={[
                "h-9 rounded-pill border px-3 text-xs font-semibold transition-colors",
                filter === t ? "bg-primary text-primary-fg border-primary" : "bg-background hover:bg-muted",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
          {filtered.map((s) => (
            <motion.div key={s.id} variants={item}>
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {s.name}
                  </CardTitle>
                  <Badge variant={s.status === "online" ? "success" : s.status === "warning" ? "warning" : "destructive"}>
                    {s.status === "online" ? "Online" : s.status === "warning" ? "Perhatian" : "Offline"}
                  </Badge>
                </CardHeader>
                <p className="mt-3 font-mono text-2xl font-bold">
                  {s.value} <span className="text-sm font-medium text-muted-fg">{s.unit}</span>
                </p>
                <p className="mt-1 text-xs text-muted-fg">
                  {s.lahan} · {s.lastSeen}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-3/4 rounded-full bg-primary opacity-60" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Threshold form mock */}
      <motion.div variants={item}>
        <Card>
          <h3 className="font-sans text-base font-semibold">Atur Threshold (Mock)</h3>
          <p className="mt-1 text-sm text-muted-fg">Simpan ambang batas untuk alert. Belum terhubung ke backend — mock UI.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
            className="mt-4 grid gap-4 sm:grid-cols-3"
          >
            <Select label="Sensor" defaultValue="pH">
              <option value="pH">pH Tanah A1</option>
              <option value="NPK">NPK A1</option>
              <option value="PPM">PPM Hidroponik</option>
              <option value="Tandon">Level Tandon</option>
            </Select>
            <Input label="Batas Bawah" placeholder="5.5" defaultValue="5.5" />
            <Input label="Batas Atas" placeholder="6.5" defaultValue="6.5" />
            <Input label="Interval Kirim (detik)" placeholder="60" defaultValue="60" />
            <Select label="Aksi Saat Melebihi" defaultValue="notif">
              <option value="notif">Notifikasi saja</option>
              <option value="solenoid">Aktifkan solenoid</option>
              <option value="dosing">Auto-dosing</option>
            </Select>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Simpan Threshold</Button>
            </div>
          </form>
          {saved && <p className="mt-3 text-sm font-medium text-success">✓ Threshold tersimpan (mock)</p>}
        </Card>
      </motion.div>
    </motion.div>
  );
}
