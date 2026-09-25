"use client";
import { motion } from "motion/react";
import { container, item } from "@/lib/motion";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast, useToast } from "@/components/ui/Toast";
import { useDashboard } from "@/hooks/useDashboard";
import { EmptyKebunCta, HeroSection } from "@/components/dashboard/HeroSection";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { FeatureBand, GradientBanner, SuiteNav, SuitePanels } from "@/components/dashboard/SuiteCards";

export default function OverviewPage() {
  const { toast, showToast } = useToast();
  const { data, loading, err, retry } = useDashboard(showToast);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[420px] rounded-card" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={`dash-skel-${i}`} className="h-24 rounded-card" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={`dash-panel-${i}`} className="h-64 rounded-card" />)}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="space-y-4">
        <Toast message={toast} tone="red" />
        <Card className="py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive-soft text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h3 className="mt-3 font-sans font-semibold text-ink-charcoal [text-wrap:balance]">Gagal memuat ringkasan</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-stone-gray [text-wrap:pretty]">{err}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => void retry()}>Muat Ulang</Button>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-button border border-soft-mist bg-paper-white px-5 text-sm font-semibold text-ink-charcoal hover:bg-warm-parchment">Masuk</Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!data || data.kebuns.length === 0) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        <Toast message={toast} tone="red" />
        <motion.div variants={item}><HeroSection data={null} /></motion.div>
        <motion.div variants={item}><EmptyKebunCta /></motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <Toast message={toast} tone="red" />
      <motion.div variants={item}><HeroSection data={data} /></motion.div>
      <motion.div variants={item}><StatStrip data={data} /></motion.div>
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        <motion.div variants={item}><SuitePanels data={data} /></motion.div>
      </motion.div>
      <motion.div variants={item}><FeatureBand kebunId={data.kebuns[0] ? String(data.kebuns[0].id) : null} /></motion.div>
      <motion.div variants={item}><GradientBanner /></motion.div>
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
        <motion.div variants={item}><SuiteNav /></motion.div>
      </motion.div>
    </motion.div>
  );
}
