"use client";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TelemetryRow } from "@/hooks/useSensors";

export function TelemetryTable({ title, rows, loading }: {
  title: string; rows: TelemetryRow[] | null; loading: boolean;
}) {
  return (
    <Card className="border-soft-mist bg-paper-white">
      <h3 className="font-sans text-base font-bold tracking-tight text-ink-charcoal">Telemetry — {title}</h3>
      <p className="mt-1 text-sm text-stone-gray">20 data terakhir. Klik kartu sensor untuk ganti.</p>
      {loading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`tel-skel-${i}`} className="h-10" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="mt-4 rounded-lg border border-soft-mist bg-warm-parchment px-3 py-3 text-sm text-stone-gray">Belum ada data telemetry untuk sensor ini.</p>
      ) : (
        <div className="mt-4 max-h-64 overflow-auto rounded-lg border border-soft-mist">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-warm-parchment">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-ink-charcoal">Waktu</th>
                <th className="px-3 py-2 text-right font-semibold text-ink-charcoal">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={`${t.recordedAt}-${t.value}`} className="border-t border-soft-mist">
                  <td className="px-3 py-2 font-mono text-xs text-stone-gray">{new Date(t.recordedAt).toLocaleString("id-ID")}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-ink-charcoal">{t.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
