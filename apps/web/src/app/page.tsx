"use client";

import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-fg font-bold text-sm">
              T
            </div>
            <span className="font-sans text-lg font-bold tracking-tight">Tani IoT</span>
            <span className="hidden sm:inline rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-soft-fg">
              Multi-Kebun
            </span>
          </div>
          <span className="rounded-full border px-3 py-1 text-xs text-muted-fg">Full Indonesia</span>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-soft-fg">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            VPS Dragon · Multi-Kebun · 60+ Komoditas Indonesia
          </p>
          <h1 className="font-sans text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Monitoring pertanian
            <br />
            <span className="text-primary">dari semai sampai panen</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-6 text-muted-fg">
            Satu aplikasi untuk penyemaian, bibit vegetatif/generatif, tandon, irigasi otomatis,
            pH/NPK/PPM, dan Doctor Tani AI — semua kebun dalam satu dashboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#status"
              className="inline-flex h-11 items-center justify-center rounded-button bg-primary px-6 text-sm font-semibold text-primary-fg transition hover:bg-primary-hover"
            >
              Lihat Status Sistem
            </a>
            <span className="inline-flex h-11 items-center rounded-button border bg-background px-6 text-sm font-semibold">
              Dokumentasi Hardware
            </span>
          </div>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.05 }}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { title: "Penyemaian", desc: "Media tanam, durasi, suhu, langkah, indikator siap tanam", icon: "🌱" },
            { title: "Bibit & Pupuk", desc: "Vegetatif/generatif + takaran pupuk per fase", icon: "🌿" },
            { title: "Tandon", desc: "Level air % realtime + alert tandon hampir kosong", icon: "💧" },
            { title: "Irigasi", desc: "Solenoid valve — manual, jadwal, dan otomatis", icon: "🚿" },
            { title: "pH & NPK", desc: "pH tanah + unsur hara N/P/K per lahan", icon: "🧪" },
            { title: "Hidroponik PPM", desc: "EC/TDS → PPM, pH air, suhu — auto-dosing fase 2", icon: "🥬" },
            { title: "Doctor Tani", desc: "Foto tanaman → diagnosis + solusi takaran", icon: "🤖" },
            { title: "Multi-Kebun", desc: "1 akun kelola N kebun, RBAC per-kebun", icon: "🏡" },
            { title: "Dashboard Config", desc: "Threshold, kalibrasi, interval semua sensor", icon: "⚙️" },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-card border bg-background p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 text-xl">{f.icon}</div>
              <h3 className="font-sans text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm leading-5 text-muted-fg">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Status */}
        <div
          id="status"
          className="mt-10 rounded-card border bg-muted p-6 sm:p-8"
        >
          <h2 className="font-sans text-lg font-bold">Status Pengembangan</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" /> Backend NestJS — schema valid, siap migrate
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" /> Design System — lint 0 errors, tokens terpasang
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" /> BOM Hardware — 3 skenario + wiring + firmware
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning" /> Web dashboard — scaffold selesai, lanjut CRUD
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-fg" /> Mobile APK — segera scaffold
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-fg" /> Sensor pipeline — MQTT + WS
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-fg">
            Bahasa: Full Indonesia · VPS: dragon (101.50.2.190) — port 3101/3100/1884 · Monorepo: tani-iot
          </p>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-fg">
        Tani IoT © 2026 — Arcson Development · Design: Organik Biophilic · Dibuat untuk petani Indonesia
      </footer>
    </div>
  );
}
