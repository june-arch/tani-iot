---
colors:
  primary: "#2E7D32"
  primary-hover: "#1B5E20"
  primary-fg: "#FFFFFF"
  primary-soft: "#E8F5E9"
  primary-soft-fg: "#1B5E20"
  accent: "#F59E0B"
  accent-hover: "#D97706"
  accent-fg: "#5C3A05"
  accent-soft: "#FFFBEB"
  accent-soft-fg: "#92400E"
  neutral-50: "#FAFAF8"
  neutral-100: "#F5F5F0"
  neutral-200: "#E7E5E4"
  neutral-300: "#D6D3D1"
  neutral-400: "#A8A29E"
  neutral-500: "#78716C"
  neutral-600: "#57534E"
  neutral-700: "#44403C"
  neutral-800: "#292524"
  neutral-900: "#1C1917"
  background: "#FFFCF8"
  foreground: "#1C1917"
  muted: "#F5F5F0"
  muted-fg: "#57534E"
  border: "#E7E5E4"
  ring: "#2E7D32"
  success: "#15803D"
  success-fg: "#FFFFFF"
  success-soft: "#DCFCE7"
  warning: "#D97706"
  warning-fg: "#FFFFFF"
  warning-soft: "#FEF3C7"
  destructive: "#DC2626"
  destructive-fg: "#FFFFFF"
  destructive-soft: "#FEE2E2"
  info: "#0284C7"
  info-fg: "#FFFFFF"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "3rem"
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  h1:
    fontFamily: "Outfit, sans-serif"
    fontSize: "2rem"
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: "-0.015em"
  h2:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "600"
    lineHeight: "1.3"
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1.25rem"
    fontWeight: "600"
    lineHeight: "1.4"
  body:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "1.6"
  label:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: "600"
    lineHeight: "1.4"
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: "500"
    lineHeight: "1.4"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: "500"
    lineHeight: "1.5"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-fg}"
    typography: "{typography.label}"
    rounded: "0.75rem"
    padding: "0.625rem 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-fg}"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "0.75rem"
    padding: "0.625rem 1.25rem"
    height: "2.75rem"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-fg}"
    typography: "{typography.label}"
    rounded: "0.75rem"
    padding: "0.625rem 1.25rem"
    height: "2.75rem"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "1rem"
    padding: "1.25rem"
  card-muted:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "1rem"
    padding: "1.25rem"
  sensor-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "1rem"
    padding: "1.25rem"
  stat:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary-soft-fg}"
    typography: "{typography.mono}"
    rounded: "0.75rem"
    padding: "1rem"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "0.75rem"
    padding: "0.625rem 0.875rem"
    height: "2.75rem"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.caption}"
    rounded: "9999px"
    padding: "0.25rem 0.625rem"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "#92400E"
    typography: "{typography.caption}"
    rounded: "9999px"
    padding: "0.25rem 0.625rem"
  badge-destructive:
    backgroundColor: "{colors.destructive-soft}"
    textColor: "#991B1B"
    typography: "{typography.caption}"
    rounded: "9999px"
    padding: "0.25rem 0.625rem"
  bottom-nav:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-fg}"
    typography: "{typography.caption}"
    rounded: "1.5rem"
    padding: "0.5rem"
  page-surface:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "0rem"
    padding: "0rem"
---

# Tani IoT — DESIGN.md

## Overview

Design system untuk platform monitoring pertanian multi-kebun — dashboard web + APK lapangan. Karakter: **organik, hangat, terpercaya** — bukan tech gelap korporat. Inspirasi: sawah terasering, kertas daur ulang, daun segar. Semua interaksi harus terasa ramah petani (touch besar, bahasa Indonesia, feedback jelas), bukan dashboard SCADA industri.

**The Harvest Rule:** Setiap layar harus bisa dipahami petani dalam 5 detik — angka besar, warna semantik (hijau=aman, kuning=perlu perhatian, merah=bahaya), tanpa jargon.

## Colors

- **Primary** `#2E7D32` (hijau hutan) — aksi utama, navigasi aktif, chart. Hover `#1B5E20`. Soft `#E8F5E9` untuk stat/card highlight. **JANGAN pakai pure black** — tint ke `#1C1917` (stone-900 hangat).
- **Accent** `#F59E0B` (amber panen) — CTA sekunder, badge panen, highlight. Text di atas accent WAJIB `#5C3A05` (amber-950) — putih di amber 2.2:1 gagal AA, jadi pakai coklat tua (4.76:1 pass).
- **Neutral** stone hangat 50→900 — background `#FFFCF8` (cream), card putih, border `#E7E5E4`. Abu murni `#808080` dilarang — semua abu di-tint warm.
- **Semantic:** success `#15803D` (hijau panen), warning `#D97706`, destructive `#DC2626`, info `#0284C7` — masing-masing punya soft bg untuk badge.
- **Dark mode (opsional fase 2):** background `#1C1917`, card `#292524`, primary tetap `#2E7D32` tapi soft jadi `#1B5E20`.

**The Earth Rule:** Tidak ada gradient ungu-biru, tidak ada gray text di atas warna — semua text di atas warna pakai fg token yang sudah dihitung kontrasnya.

## Typography

- **Display/Heading:** `Outfit` (rounded, ramah, modern) — display 48px/700, h1 32px/700, h2 24px/600, h3 20px/600. Tracking negatif tipis (-0.02em) untuk heading besar.
- **Body:** `Instrument Sans` (humanist, legible) — body 15px/400, body-sm 14px, label 13px/600 uppercase 0.02em, caption 12px/500.
- **Mono:** `JetBrains Mono` — untuk telemetry (ppm, pH, NPK, suhu), timestamp sensor, kode device.
- **Scale:** Fluid clamp hanya di prose (bukan di YAML frontmatter) — `clamp(2rem, 5vw, 3rem)` untuk hero. Di frontmatter pakai rem statis (`designmd lint` error kalau clamp di YAML).
- **Aturan:** `text-wrap: balance` untuk heading, `pretty` untuk body. Line-height body 1.6, tidak pernah <1.4.

## Layout

- **Grid:** 8px base (4/8/16/24/32/48/64). Container max 1280px, padding 16px mobile → 24px tablet → 32px desktop.
- **Dashboard:** Sidebar 280px (desktop) / bottom-nav 72px (mobile) + drawer. Content gap 24px, card gap 16px, section gap 48px.
- **Mobile-first:** Breakpoints 375/768/1024/1280/1440. Tidak ada `w-[320px]` fixed — semua fluid/grid. Horizontal scroll hanya untuk tabel sensor (dengan `overflow-x:auto` + shadow hint).
- **Kebun switcher:** Selalu di top-bar — petani multi-kebun harus ganti konteks 1 tap, tanpa masuk pengaturan.

## Elevation & Depth

- **Shadow:** `sm: 0 1px 2px rgba(28,25,23,0.06)`, `md: 0 4px 12px rgba(28,25,23,0.08)`, `lg: 0 12px 32px rgba(28,25,23,0.12)` — warm, bukan blue-gray.
- **Card:** `shadow-sm` + `border` 1px `border` — tidak ada card di dalam card. Sensor card pakai `shadow-md` saat live update (pulse).
- **No glow:** Dilarang dark glow / neon — tidak cocok dengan brand organik.

## Shapes

- **Radius:** 12px card/sensor-card, 12px button/input, 9999px badge/pill, 24px bottom-nav. Tidak ada `rounded: 4px` off-scale — semua ikut token.
- **Organic:** Hero bisa pakai blob/leaf SVG mask (opsional), tapi card tetap rounded biasa — jangan over-decorate.
- **Icon:** Lucide/Heroicons outline 20px, stroke 1.75 — tidak pakai emoji sebagai ikon.

## Components

- **Button:** Primary (hijau), secondary (muted), accent (amber dengan text coklat tua). States: default → hover (darker) → active (scale 0.97) → disabled (opacity 0.5) → focus-visible (ring 2px primary). Min touch 48px (kiosk 56px), gap 8px icon+label.
- **Card:** Background putih, border 1px, radius 16px, padding 20px, shadow-sm. Header: label + badge status. Hover: shadow-md (jika clickable).
- **Sensor Card:** Card + header (ikon + nama + status dot hijau/kuning/merah + lastSeen) + value besar mono + unit + mini chart + threshold bar.
- **Stat:** Soft green bg, mono value, label caption di bawah — untuk ringkasan kebun (jumlah lahan, active device).
- **Input:** Height 44px, border 1px, focus:border-primary + ring, error:border-destructive + pesan di bawah field (bukan di atas). Label selalu visible — tidak pakai placeholder-only.
- **Badge:** Pill 9999px, soft bg + colored text — success/warning/destructive. Jangan pakai badge di dalam badge.
- **Bottom Nav (mobile):** 5 item max, ikon 24px + label 10px, active = primary color + indicator dot, inactive = muted-fg. Height 72px + safe-area.
- **Toast:** Slide-in dari top, auto-dismiss 4s, warna sesuai semantic, ada close button.

## Do's and Don'ts

- **Do:** Pakai token — `bg-primary`, `text-primary-fg`, `bg-accent`, `text-accent-fg` (bukan `bg-green-600` hardcode). Pakai Motion untuk entrance (staggered 80ms), hover 150-300ms, jangan 0ms instant.
- **Do:** Empty state selalu ada ikon + judul + deskripsi + CTA (“Tambah Kebun”, “Hubungkan Sensor”).
- **Do:** Loading = skeleton (bukan spinner fullscreen) — petani tahu layout tetap ada.
- **Don't:** Jangan pakai Inter/Arial everywhere — heading Outfit, body Instrument Sans sudah dikurasi. Jangan pakai gradient ungu, bounce easing, card dalam card, atau rounded-square ikon di atas setiap heading.
- **Don't:** Jangan pakai `alert()`/`confirm()` browser — pakai modal component + toast.
- **Don't:** Jangan tulis hex random di component — semua warna dari frontmatter tokens.
