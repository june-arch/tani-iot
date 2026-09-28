"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { container, item } from "@/lib/motion";
import { Cpu, SearchX } from "lucide-react";
import { KATALOG_SENSORS, KATEGORI_LIST, type KatalogSensor } from "@/lib/katalog-sensor";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { SensorCard } from "@/components/katalog/SensorCard";
import { SensorDetailModal } from "@/components/katalog/SensorDetailModal";

export default function KatalogPage() {
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState<string>("Semua");
  const [selected, setSelected] = useState<KatalogSensor | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return KATALOG_SENSORS.filter((s) => {
      if (kategori !== "Semua" && s.kategori !== kategori) return false;
      if (!t) return true;
      return (
        s.nama.toLowerCase().includes(t) ||
        s.keyword.toLowerCase().includes(t) ||
        s.tipeApps.some((x) => x.toLowerCase().includes(t)) ||
        s.fungsi.toLowerCase().includes(t)
      );
    });
  }, [q, kategori]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-20 lg:pb-0">
      <motion.div variants={item} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-sans text-[26px] font-[460] leading-[1.1] tracking-[-0.022em] text-ink-charcoal [text-wrap:balance]">
            <Cpu className="h-6 w-6 text-midnight-wine" /> Katalog Sensor
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-gray [text-wrap:pretty] max-w-[60ch]">Semua sensor yang dipakai aplikasi — foto, harga, keyword belanja & threshold saran.</p>
        </div>
        <Badge variant="lilac" className="gap-1.5"><Cpu className="h-3.5 w-3.5" />{filtered.length} alat</Badge>
      </motion.div>

      <motion.div variants={item} className="flex max-w-md flex-col gap-3">
        <Input placeholder="Cari: pH, NPK, tandon, ESP32..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-1.5">
          {["Semua", ...KATEGORI_LIST].map((k) => (
            <button
              key={k}
              onClick={() => setKategori(k)}
              className={[
                "rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors",
                kategori === k ? "bg-midnight-wine text-paper-white" : "border border-soft-mist bg-paper-white text-stone-gray hover:bg-warm-parchment hover:text-ink-charcoal",
              ].join(" ")}
            >
              {k}
            </button>
          ))}
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={item}><EmptyState variant="search" title="Tidak ada hasil" description={`Tidak ditemukan alat untuk "${q}".`} actionLabel="Hapus Pencarian" onAction={() => { setQ(""); setKategori("Semua"); }} icon={<SearchX className="h-4 w-4" />} /></motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <motion.div key={s.slug} variants={item}>
              <SensorCard item={s} onDetail={setSelected} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selected && <SensorDetailModal item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
