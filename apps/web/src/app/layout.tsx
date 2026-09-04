import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const superSans = Inter({
  variable: "--font-super-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tani IoT — Monitoring Pertanian Multi-Kebun",
  description:
    "Platform monitoring pertanian: penyemaian, bibit, tandon, irigasi otomatis, pH/NPK/PPM, Doctor Tani AI — full Indonesia, multi-kebun.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${superSans.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-parchment text-ink-charcoal">
        {/* THESIS: Pertanian tropis Indonesia dipantau seperti editorial premium — parchment hangat sebagai kanvas, foto sawah sinematik sebagai hero, data sensor melayang sebagai kartu kaca. OWN-WORLD: Warm Parchment #f2f0eb + Paper White #ffffff + Midnight Wine #421d24 + Royal Violet #714cb6 + Lilac Mist #d4c7ff + Deep Lagoon #0c4243, Super Sans 460 light-cut, hairline Soft Mist #e3e3e2, no drop shadow. STORY: Petani lihat sawah hidup + tandon/pH/PPM dalam satu pandang, percaya ini bukan dashboard korporat dingin. FIRST VIEWPORT: Full-bleed sawah golden-hour, headline 460 di atas foto, dua floating cards kaca (tandon & PPM) di kanan-kiri, CTA Wine pill. FORM: Operate — editorial dashboard, seed Operate canonical. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md */}
        {children}
      </body>
    </html>
  );
}
