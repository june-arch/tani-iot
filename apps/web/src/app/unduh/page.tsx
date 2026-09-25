"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Smartphone, Download, Wifi, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { baseUrl } from "@/lib/api";

const LANGKAH = [
  {
    judul: "1. Unduh APK",
    isi: "Klik tombol unduh di bawah. Pindahkan file ke HP Xiaomi bila mengunduh via laptop.",
  },
  {
    judul: "2. Izinkan instalasi",
    isi: "Buka file APK → izinkan “Instal aplikasi yang tidak dikenal” saat diminta Android.",
  },
  {
    judul: "3. Satu WiFi + backend aktif",
    isi: "HP harus satu WiFi dengan server dan backend wajib jalan agar data kebun bisa dimuat.",
  },
  {
    judul: "4. Masuk & uji",
    isi: "Buka aplikasi → Masuk → Kebun → tambah kebun → cek sensor/telemetry → Doctor Tani via foto daun.",
  },
];

type RilisTerbaru = {
  id: string;
  versionName: string;
  versionCode: number;
  changelog?: string | null;
  fileSize: number;
  downloadCount: number;
  downloadPath: string;
};

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UnduhPage() {
  const [rilis, setRilis] = useState<RilisTerbaru | null>(null);

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/releases/latest`, { cache: "no-store" });
        if (!res.ok) return;
        const body = (await res.json()) as { data?: RilisTerbaru };
        if (!batal && body?.data) setRilis(body.data);
      } catch {
        // fallback ke file statis bila backend belum punya rilis
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  const unduhHref = rilis ? `${baseUrl}${rilis.downloadPath}` : "/tani-iot-debug.apk";
  const labelVersi = rilis ? `v${rilis.versionName}` : "v1.0.0-debug";
  const labelUkuran = rilis ? formatMB(rilis.fileSize) : "±228 MB";

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
          <Badge variant="neutral">{labelVersi}</Badge>
        </div>
      </div>

      <Card className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Download className="h-5 w-5 text-royal-violet" /> Unduh APK
        </CardTitle>
        <CardDesc className="mx-auto mt-1 max-w-sm">
          File {labelUkuran}
          {rilis?.downloadCount ? ` • sudah diunduh ${rilis.downloadCount}x` : " • versi uji lapangan"}.
        </CardDesc>
        {rilis?.changelog && (
          <p className="mx-auto mt-3 max-w-md whitespace-pre-line rounded-small-button border border-soft-mist bg-warm-parchment px-4 py-3 text-left text-sm leading-6 text-ink-charcoal">
            {rilis.changelog}
          </p>
        )}
        <a
          href={unduhHref}
          download
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-button bg-midnight-wine px-8 text-sm font-semibold text-paper-white hover:bg-[#2f151a]"
        >
          <Download className="h-4 w-4" /> Unduh {rilis ? `tani-iot-v${rilis.versionName}.apk` : "tani-iot-debug.apk"}
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
            APK menunjuk ke API backend yang dikonfigurasi saat build. Untuk server VPS,
            hubungi admin untuk build ulang dengan URL produksi.
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
