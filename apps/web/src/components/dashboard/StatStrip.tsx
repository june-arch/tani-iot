"use client";
import type { DashboardState } from "@/hooks/useDashboard";

export function StatStrip({ data }: { data: DashboardState }) {
  const stats = [
    { k: `${data.kebuns.length}`, l: "kebun" },
    { k: `${data.totalLahan}`, l: "lahan" },
    { k: `${data.totalDevices}`, l: "device" },
    { k: `${data.totalSensors}`, l: "sensor" },
    { k: data.tandonPersen !== null ? `${data.tandonPersen}%` : "—", l: "tandon" },
    { k: "60+", l: "komoditas" },
  ];
  return (
    <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-soft-mist bg-soft-mist sm:grid-cols-6">
      {stats.map((s) => (
        <div key={s.l} className="bg-paper-white px-3 py-4 text-center">
          <p className="font-sans text-lg font-bold tracking-tight text-ink-charcoal">{s.k}</p>
          <p className="text-xs font-medium tracking-wide text-stone-gray">{s.l}</p>
        </div>
      ))}
    </div>
  );
}
