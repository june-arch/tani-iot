"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Plus, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { container, item } from "@/lib/motion";
import { useKebuns } from "@/lib/queries";
import type { Kebun } from "@/lib/api";
import { KebunFormModal } from "@/components/kebuns/KebunFormModal";

function displayKebun(k: Kebun) {
  const name = k.nama ?? k.name ?? "Kebun";
  const countLahan =
    k._count?.lahans ?? (Array.isArray(k.lahans) ? k.lahans.length : 0);
  const countDevice =
    k._count?.devices ?? (Array.isArray(k.devices) ? k.devices.length : 0);
  return { name, lokasi: k.lokasi ?? "-", countLahan, countDevice };
}

export default function KebunsPage() {
  const { toast, showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const { data: kebuns, isLoading, isError, error, refetch } = useKebuns();
  const err =
    isError ? ((error as { message?: string })?.message ?? "Gagal memuat kebun.") : null;

  if (isLoading || !kebuns) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={`kebun-skel-${i}`} className="h-40 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-20 lg:pb-0">
      <Toast message={toast} />
      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-[26px] font-[460] text-ink-charcoal">Kebun</h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-6 text-stone-gray">
            Kelola kebun dan lahan. Multi-kebun — satu akun untuk banyak lokasi.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Tambah Kebun
        </Button>
      </motion.div>

      {err && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {err} —{" "}
          <button onClick={() => refetch()} className="font-bold text-royal-violet underline">
            Muat ulang
          </button>
        </div>
      )}

      {kebuns.length === 0 ? (
        <motion.div variants={item}>
          <EmptyState
            variant="kebun"
            title="Belum ada kebun"
            description="Buat kebun pertama untuk mulai mengelola lahan dan sensor."
            actionLabel="Buat Kebun Pertama"
            onAction={() => setShowModal(true)}
            icon={<MapPin className="h-4 w-4" />}
          />
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid gap-4 sm:grid-cols-2">
          {kebuns.map((k) => {
            const d = displayKebun(k);
            return (
              <motion.div key={k.id} variants={item}>
                <Card className="flex flex-col transition-colors hover:border-royal-violet/20">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lilac-mist text-ink-charcoal">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <CardTitle className="mt-3">{d.name}</CardTitle>
                  <CardDesc>{d.lokasi}</CardDesc>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-pill border border-soft-mist bg-warm-parchment px-2.5 py-1 text-xs font-semibold text-stone-gray">
                      {d.countLahan} lahan
                    </span>
                    <span className="rounded-pill bg-lilac-mist px-2.5 py-1 text-xs font-semibold text-ink-charcoal">
                      {d.countDevice} device
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href="/sensors" className="inline-flex h-11 flex-1 items-center justify-center rounded-button bg-midnight-wine px-4 text-sm font-semibold text-paper-white">
                      Lihat Sensor
                    </Link>
                    <Link href="/kalender" className="inline-flex h-11 flex-1 items-center justify-center rounded-small-button border border-soft-mist px-4 text-sm font-semibold hover:bg-warm-parchment">
                      Kalender <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {showModal && (
        <KebunFormModal onClose={() => setShowModal(false)} onSuccess={showToast} />
      )}
    </motion.div>
  );
}
