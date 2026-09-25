import Link from "next/link";
import { Smartphone, Download, Wifi, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "Unduh APK — Tani IoT",
  description: "Unduh aplikasi Android Tani IoT untuk monitoring kebun di lapangan.",
};

const LANGKAH = [
  {
    judul: "1. Unduh APK",
    isi: "Klik tombol unduh di bawah (±228 MB, versi debug). Pindahkan file ke HP Xiaomi bila mengunduh via laptop.",
  },
  {
    judul: "2. Izinkan instalasi",
    isi: "Buka file APK → izinkan “Instal aplikasi yang tidak dikenal” saat diminta Android. APK debug tidak perlu Play Store.",
  },
  {
    judul: "3. Satu WiFi + backend aktif",
    isi: "HP harus satu WiFi dengan laptop (192.168.1.x) dan backend wajib jalan: cd apps/backend && npm run start:dev (port 3101).",
  },
  {
    judul: "4. Masuk & uji",
    isi: "Buka aplikasi → Masuk → Kebun → tambah kebun → cek sensor/telemetry → Doctor Tani via foto daun.",
  },
];

export default function UnduhPage() {
  return (
    <div className="mx-auto max-w-[720px] space-y-6 px-4 py-10">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-midnight-wine text-paper-white">
          <Smartphone className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-sans text-[32px] font-[460] text-ink-charcoal">
          Aplikasi Android Tani IoT
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-gray">
          Monitoring kebun, kontrol irigasi, dan Doctor Tani AI langsung dari HP di lapangan.
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <Badge variant="lilac">Android API 29+</Badge>
          <Badge variant="neutral">v1.0.0-debug</Badge>
        </div>
      </div>

      <Card className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Download className="h-5 w-5 text-royal-violet" /> Unduh APK
        </CardTitle>
        <CardDesc className="mx-auto mt-1 max-w-sm">
          File ±228 MB. Versi debug untuk uji lapangan — bukan rilis Play Store.
        </CardDesc>
        <a
          href="/tani-iot-debug.apk"
          download
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-button bg-midnight-wine px-8 text-sm font-semibold text-paper-white hover:bg-[#2f151a]"
        >
          <Download className="h-4 w-4" /> Unduh tani-iot-debug.apk
        </a>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {LANGKAH.map((l) => (
          <Card key={l.judul}>
            <CardTitle className="text-sm">{l.judul}</CardTitle>
            <CardDesc className="mt-1">{l.isi}</CardDesc>
          </Card>
        ))}
      </div>

      <Card className="flex items-start gap-3 border-royal-violet/20 bg-lilac-mist/30">
        <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-royal-violet" />
        <div>
          <CardTitle className="text-sm">Syarat koneksi</CardTitle>
          <CardDesc className="mt-1">
            APK ini menunjuk ke API <span className="font-mono">http://192.168.1.6:3101/api</span> (laptop
            dev). Untuk server VPS, hubungi admin untuk build ulang dengan URL produksi.
          </CardDesc>
        </div>
      </Card>

      <div className="flex items-center justify-between rounded-card border border-soft-mist bg-paper-white p-4">
        <span className="inline-flex items-center gap-2 text-sm text-stone-gray">
          <ShieldCheck className="h-4 w-4 text-royal-violet" /> Data petani milik petani — tidak dijual.
        </span>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-royal-violet hover:underline">
          Buka dashboard <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
