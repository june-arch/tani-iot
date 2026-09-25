"use client";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { Smartphone, AlertTriangle } from "lucide-react";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { container, item } from "@/lib/motion";
import { errorMessage } from "@/lib/endpoints";
import { useReleases } from "@/lib/queries";
import { RilisUploadForm } from "@/components/rilis/RilisUploadForm";
import { RilisDaftar } from "@/components/rilis/RilisDaftar";

export default function RilisPage() {
  const { toast, showToast } = useToast();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const { data: rilisList, isLoading, isError, error, refetch } = useReleases();

  if (role && role !== "SUPERADMIN") {
    return (
      <div className="mx-auto max-w-[560px] pt-10">
        <Card className="text-center">
          <CardTitle>Akses ditolak</CardTitle>
          <CardDesc className="mt-1">
            Menu Rilis APK hanya untuk SUPERADMIN. Peran Anda: {role}.
          </CardDesc>
        </Card>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-20 lg:pb-0">
      <Toast message={toast} />
      <motion.div variants={item}>
        <div>
          <h1 className="flex items-center gap-2 font-sans text-[26px] font-[460] text-ink-charcoal">
            <Smartphone className="h-6 w-6 text-royal-violet" /> Rilis APK
          </h1>
          <p className="mt-2 max-w-[60ch] text-sm leading-6 text-stone-gray">
            Unggah APK baru — aplikasi mobile petani otomatis menawarkan pembaruan
            + notifikasi. Hanya SUPERADMIN.
          </p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <RilisUploadForm onSukses={showToast} />
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        <h2 className="font-sans text-lg font-semibold text-ink-charcoal">Riwayat rilis</h2>
        {isLoading || !rilisList ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={`rilis-skel-${i}`} className="h-24 rounded-card" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {errorMessage(error, "Gagal memuat rilis.")} —{" "}
            <button onClick={() => refetch()} className="font-bold text-royal-violet underline">
              Muat ulang
            </button>
          </div>
        ) : (
          <RilisDaftar daftar={rilisList} onPesan={showToast} />
        )}
      </motion.div>
    </motion.div>
  );
}
