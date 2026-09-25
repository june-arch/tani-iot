"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { SensorEnriched } from "@/hooks/useSensors";

export type SensorStatus = "online" | "offline" | "warning";
export type SensorMeta = {
  id: string; name: string; tipe: string;
  value: string; unit: string; status: SensorStatus; context: string;
};

export function describeSensor(s: SensorEnriched): SensorMeta {
  const raw = s as SensorEnriched & { name?: string; type?: string; status?: string; lastValue?: number | null };
  const tipe = String(s.type ?? s.tipe ?? "Sensor");
  const name = raw.name ?? `${tipe} ${String(s.id).slice(0, 6)}`;
  const value = raw.lastValue != null ? String(raw.lastValue) : "—";
  const status: SensorStatus = s.isEnabled === false || raw.status === "offline" ? "offline" : raw.status === "warning" ? "warning" : "online";
  return { id: String(s.id), name, tipe, value, unit: s.unit ?? "", status, context: raw.deviceNama ?? s.deviceId };
}

export function SensorCard({ sensor, selected, onSelect }: {
  sensor: SensorEnriched; selected: boolean; onSelect: (id: string) => void;
}) {
  const m = describeSensor(sensor);
  return (
    <Card className={["relative cursor-pointer", selected ? "border-royal-violet shadow-subtle" : "border-soft-mist"].join(" ")} onClick={() => onSelect(m.id)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-ink-charcoal">{m.name}</CardTitle>
        <Badge variant={m.status === "online" ? "success" : m.status === "warning" ? "warning" : "destructive"}>
          {m.status === "online" ? "Online" : m.status === "warning" ? "Perhatian" : "Offline"}
        </Badge>
      </CardHeader>
      <p className="mt-3 font-mono text-2xl font-bold text-ink-charcoal">
        {m.value} <span className="text-sm font-medium text-stone-gray">{m.unit}</span>
      </p>
      <p className="mt-1 text-xs text-stone-gray">{m.context} · {m.tipe}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft-mist">
        <div className="h-full w-3/4 rounded-full bg-midnight-wine" />
      </div>
    </Card>
  );
}
