"use client";
import { Leaf, Sprout } from "lucide-react";
import type { Crop } from "@/lib/api";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CropImage } from "./CropImage";

export function CropCard({ crop, onDetail }: { crop: Crop; onDetail: (c: Crop) => void }) {
  return (
    <Card className="flex h-full flex-col transition-colors hover:border-royal-violet/20">
      {crop.imageUrl && (
        <div className="relative -m-4 mb-3 h-32 overflow-hidden rounded-t-card">
          <CropImage src={crop.imageUrl} alt={crop.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/50 to-transparent" />
          <div className="absolute bottom-2 left-2 rounded-pill bg-paper-white px-2 py-1 text-xs font-semibold text-ink-charcoal">{crop.category}</div>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="flex items-center gap-1.5 text-base [text-wrap:balance]"><Sprout className="h-4 w-4 text-royal-violet" />{crop.name}</CardTitle>
        {!crop.imageUrl && <Badge variant="lilac">{crop.category}</Badge>}
      </div>
      {crop.scientificName && <p className="mt-1 font-mono text-xs italic text-stone-gray [text-wrap:pretty]">{crop.scientificName}</p>}
      <CardDesc className="mt-2 line-clamp-3 [text-wrap:pretty]">{crop.description ?? "—"}</CardDesc>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {crop.iklimOptimal && <span className="rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs font-medium text-stone-gray">{crop.iklimOptimal}</span>}
        {crop.ketinggianOptimal && <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">{crop.ketinggianOptimal}</span>}
      </div>
      <div className="mt-auto pt-4">
        <Button variant="secondary" className="w-full gap-1.5" onClick={() => onDetail(crop)}><Leaf className="h-4 w-4" /> Lihat Panduan</Button>
      </div>
    </Card>
  );
}
