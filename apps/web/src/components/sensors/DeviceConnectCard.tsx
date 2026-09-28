"use client";
import { useState } from "react";
import { Check, Copy, Cpu } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Device } from "@/lib/api";

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } catch { /* clipboard tak tersedia */ }
  }
  return (
    <button
      onClick={copy}
      title={`Salin ${label}`}
      className="inline-flex items-center gap-1 rounded-small-button border border-soft-mist bg-paper-white px-2 py-1 font-mono text-[11px] text-ink-charcoal hover:border-royal-violet/40"
    >
      {ok ? <Check className="h-3 w-3 text-[#1a7a4a]" /> : <Copy className="h-3 w-3" />}
      {ok ? "Tersalin" : label}
    </button>
  );
}

// Kartu panduan koneksi ESP32: ID + topik + payload yang harus dipakai firmware.
export function DeviceConnectCard({ kebunId, device, sensor }: {
  kebunId: string;
  device: Device;
  sensor: { id: string; type?: string; tipe?: string; unit?: string | null };
}) {
  const tipe = String(sensor.type ?? sensor.tipe ?? "").toLowerCase();
  const topic = `tani/${kebunId}/${device.id}/${tipe || sensor.id}`;
  const payload = JSON.stringify({ value: 0, unit: sensor.unit ?? "" });
  return (
    <Card className="border-royal-violet/20 bg-lilac-mist/20">
      <p className="flex items-center gap-1.5 text-sm font-bold text-ink-charcoal">
        <Cpu className="h-4 w-4 text-royal-violet" /> Koneksi Firmware — {device.nama}
      </p>
      <p className="mt-1 text-xs leading-5 text-stone-gray [text-wrap:pretty]">
        ESP32 publish ke topik di bawah via MQTT (host: IP VPS, port 1884). deviceId & sensorId wajib sama persis — klik untuk salin.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <CopyBtn text={String(device.id)} label={`dev:${String(device.id).slice(0, 8)}…`} />
        <CopyBtn text={String(sensor.id)} label={`sen:${String(sensor.id).slice(0, 8)}…`} />
      </div>
      <div className="mt-2 rounded-lg border border-soft-mist bg-paper-white p-2.5">
        <p className="text-[11px] font-bold tracking-wide text-stone-gray">TOPIK PUBLISH</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <code className="break-all font-mono text-xs text-royal-violet">{topic}</code>
          <CopyBtn text={topic} label="Salin" />
        </div>
      </div>
      <div className="mt-2 rounded-lg border border-soft-mist bg-paper-white p-2.5">
        <p className="text-[11px] font-bold tracking-wide text-stone-gray">PAYLOAD JSON</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <code className="break-all font-mono text-xs text-ink-charcoal">{payload}</code>
          <CopyBtn text={payload} label="Salin" />
        </div>
      </div>
    </Card>
  );
}
