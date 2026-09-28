"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Check, Copy, Cpu, ShoppingCart } from "lucide-react";
import type { KatalogSensor } from "@/lib/katalog-sensor";
import { Badge } from "@/components/ui/Badge";
import { SensorImage } from "./SensorImage";

export function SensorDetailModal({ item, onClose }: { item: KatalogSensor; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyKeyword() {
    try {
      await navigator.clipboard.writeText(item.keyword);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard tak tersedia */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-charcoal/40 p-4" onClick={onClose}>
      <motion.div
        role="dialog" aria-modal="true" aria-label={item.nama}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-card border border-soft-mist bg-paper-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 w-full">
          <SensorImage src={item.imageUrl} alt={item.nama} eager />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-charcoal/70 via-ink-charcoal/20 to-transparent" />
          <div className="absolute bottom-0 p-5">
            <div className="inline-flex items-center gap-1.5 rounded-pill bg-paper-white px-2.5 py-1 text-xs font-semibold text-ink-charcoal"><Cpu className="h-3.5 w-3.5 text-royal-violet" /> {item.kategori}</div>
            <h3 className="mt-2 font-sans text-2xl font-bold tracking-tight text-paper-white [text-wrap:balance]">{item.nama}</h3>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Tutup detail" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-paper-white/30 bg-paper-white/10 text-paper-white backdrop-blur hover:bg-paper-white/20">✕</button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            {item.tipeApps.map((t) => <Badge key={t} variant="lilac">{t}</Badge>)}
            <Badge variant="neutral">{item.satuan}</Badge>
            <span className="ml-auto font-sans text-lg font-bold text-midnight-wine">{item.harga}</span>
          </div>

          <div>
            <p className="text-xs font-bold tracking-wide text-stone-gray">FUNGSI</p>
            <p className="mt-1 text-sm leading-6 text-ink-charcoal [text-wrap:pretty]">{item.fungsi}</p>
          </div>

          <div className="rounded-card border border-soft-mist bg-warm-parchment p-3">
            <p className="text-xs font-bold tracking-wide text-stone-gray">REKOMENDASI BELI</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-charcoal [text-wrap:pretty]">{item.rekomendasi}</p>
            {item.alternatif && <p className="mt-1 text-xs leading-5 text-stone-gray [text-wrap:pretty]">{item.alternatif}</p>}
            <button onClick={copyKeyword} className="mt-2 inline-flex items-center gap-1.5 rounded-small-button border border-soft-mist bg-paper-white px-3 py-2 text-xs font-semibold text-ink-charcoal hover:border-royal-violet/30">
              {copied ? <Check className="h-3.5 w-3.5 text-[#1a7a4a]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Tersalin!" : `Cari: ${item.keyword}`}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-card border border-soft-mist p-3">
              <p className="text-xs font-bold tracking-wide text-stone-gray">THRESHOLD SARAN</p>
              <p className="mt-1 text-sm leading-6 text-ink-charcoal [text-wrap:pretty]">{item.threshold}</p>
            </div>
            <div className="rounded-card border border-soft-mist p-3">
              <p className="text-xs font-bold tracking-wide text-stone-gray">TIPS PASANG</p>
              <p className="mt-1 text-sm leading-6 text-ink-charcoal [text-wrap:pretty]">{item.tips}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <a href={`https://www.tokopedia.com/search?st=product&q=${encodeURIComponent(item.keyword)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-button bg-midnight-wine px-4 text-sm font-semibold text-paper-white hover:bg-[#2f151a]">
              <ShoppingCart className="h-4 w-4" /> Cari di Tokopedia
            </a>
            <Link href="/sensors" onClick={onClose} className="inline-flex h-11 flex-1 items-center justify-center rounded-small-button border border-soft-mist px-4 text-sm font-semibold hover:bg-warm-parchment">
              Sensor Saya
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
