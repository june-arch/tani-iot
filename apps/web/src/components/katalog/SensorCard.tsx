"use client";
import { Cpu } from "lucide-react";
import type { KatalogSensor } from "@/lib/katalog-sensor";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SensorImage } from "./SensorImage";

export function SensorCard({ item, onDetail }: { item: KatalogSensor; onDetail: (s: KatalogSensor) => void }) {
  return (
    <Card className="flex h-full flex-col transition-colors hover:border-royal-violet/20">
      <div className="relative -m-4 mb-3 h-32 overflow-hidden rounded-t-card">
        <SensorImage src={item.imageUrl} alt={item.nama} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/50 to-transparent" />
        <div className="absolute bottom-2 left-2 rounded-pill bg-paper-white px-2 py-1 text-xs font-semibold text-ink-charcoal">{item.kategori}</div>
        <div className="absolute bottom-2 right-2 rounded-pill bg-midnight-wine px-2 py-1 text-xs font-bold text-paper-white">{item.harga}</div>
      </div>
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="flex items-center gap-1.5 text-base [text-wrap:balance]"><Cpu className="h-4 w-4 text-royal-violet" />{item.nama}</CardTitle>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {item.tipeApps.map((t) => (
          <Badge key={t} variant="lilac">{t}</Badge>
        ))}
      </div>
      <CardDesc className="mt-2 line-clamp-3 [text-wrap:pretty]">{item.fungsi}</CardDesc>
      <div className="mt-auto pt-4">
        <Button variant="secondary" className="w-full gap-1.5" onClick={() => onDetail(item)}>Lihat Detail & Belanja</Button>
      </div>
    </Card>
  );
}
