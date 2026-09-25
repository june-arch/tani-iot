"use client";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { CalendarDays, Droplets, Sprout } from "lucide-react";
import type { Crop } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { CropImage } from "./CropImage";
import { GrowingSection, HydroSection, SowingSection, type CropDetail } from "./GuideSections";

export function CropDetailModal({ crop, detail, loading, onClose }: {
  crop: Crop; detail: CropDetail | null; loading: boolean; onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={onClose}>
      <motion.div
        role="dialog" aria-modal="true" aria-label={`Panduan ${crop.name}`}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-card border border-soft-mist bg-paper-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden">
          {crop.imageUrl ? (
            <div className="relative h-48 w-full">
              <CropImage src={crop.imageUrl} alt={crop.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/70 via-ink-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <div className="inline-flex items-center gap-1.5 rounded-pill bg-paper-white px-2.5 py-1 text-xs font-semibold text-ink-charcoal"><Sprout className="h-3.5 w-3.5 text-royal-violet" /> {crop.category}</div>
                <h3 className="mt-2 font-sans text-2xl font-bold tracking-tight text-paper-white [text-wrap:balance]">{crop.name}</h3>
                {crop.scientificName && <p className="font-mono text-xs italic text-paper-white/80">{crop.scientificName}</p>}
              </div>
              <button ref={closeRef} onClick={onClose} aria-label="Tutup panduan" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-paper-white/30 bg-paper-white/10 text-paper-white backdrop-blur hover:bg-paper-white/20">✕</button>
            </div>
          ) : (
            <div className="bg-warm-parchment p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 font-sans text-lg font-bold [text-wrap:balance]"><Sprout className="h-5 w-5 text-midnight-wine" /> {crop.name}<Badge variant="lilac">{crop.category}</Badge></h3>
                  {crop.scientificName && <p className="mt-1 font-mono text-xs italic text-stone-gray">{crop.scientificName}</p>}
                </div>
                <button ref={closeRef} onClick={onClose} aria-label="Tutup panduan" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-soft-mist bg-paper-white hover:bg-warm-parchment">✕</button>
              </div>
            </div>
          )}
          {crop.imageUrl ? (
            <div className="mx-4 -mt-4 relative z-10 rounded-card border border-soft-mist bg-paper-white p-3 shadow-sm">
              <p className="text-sm leading-6 text-stone-gray [text-wrap:pretty]">{crop.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {crop.iklimOptimal && <span className="rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs text-stone-gray">{crop.iklimOptimal}</span>}
                {crop.ketinggianOptimal && <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">{crop.ketinggianOptimal}</span>}
              </div>
              <div className="mt-3 flex gap-2">
                <Link href="/kalender" onClick={onClose} className="inline-flex h-9 items-center gap-1.5 rounded-small-button bg-midnight-wine px-3 text-xs font-semibold text-paper-white hover:bg-[#2f151a]"><CalendarDays className="h-3.5 w-3.5" /> Catat di Kalender</Link>
                <span className="inline-flex items-center gap-1 rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs text-stone-gray"><Droplets className="h-3 w-3" /> 60+ komoditas</span>
              </div>
            </div>
          ) : (
            <div className="border-b border-soft-mist bg-warm-parchment p-5">
              <p className="text-sm leading-6 text-stone-gray [text-wrap:pretty]">{crop.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {crop.iklimOptimal && <span className="rounded-pill border border-soft-mist bg-paper-white px-2.5 py-1 text-xs text-stone-gray">{crop.iklimOptimal}</span>}
                {crop.ketinggianOptimal && <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">{crop.ketinggianOptimal}</span>}
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
          ) : detail ? (
            <div className="space-y-6">
              <SowingSection guides={detail.sowingGuides} />
              <GrowingSection guides={detail.growingGuides} />
              <HydroSection guides={detail.hydroponicGuides} />
            </div>
          ) : (<p className="text-sm text-stone-gray">Gagal memuat panduan.</p>)}
        </div>
      </motion.div>
    </div>
  );
}
