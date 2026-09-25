"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Eye, EyeOff, Smartphone } from "lucide-react";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { ENDPOINTS, errorMessage } from "@/lib/endpoints";
import { unduhUrl, type Rilis } from "@/lib/queries";

function formatMB(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatTanggal(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

type RilisRow = Rilis & { isPublished?: boolean };

export function RilisDaftar({
  daftar,
  onPesan,
}: {
  daftar: Rilis[];
  onPesan: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const segarkan = () => {
    void queryClient.invalidateQueries({ queryKey: ["releases"] });
  };

  const togglePublis = useMutation({
    mutationFn: async (r: RilisRow) =>
      api.patch<Rilis>(ENDPOINTS.release(r.id), { isPublished: !r.isPublished }),
    onSuccess: (r) => {
      onPesan(`Rilis v${r.versionName} diperbarui.`);
      segarkan();
    },
    onError: (e) => onPesan(errorMessage(e, "Gagal memperbarui rilis.")),
  });

  const hapus = useMutation({
    mutationFn: async (r: Rilis) => api.del(ENDPOINTS.release(r.id)),
    onSuccess: () => {
      onPesan("Rilis berhasil dihapus.");
      segarkan();
    },
    onError: (e) => onPesan(errorMessage(e, "Gagal menghapus rilis.")),
  });

  if (daftar.length === 0) {
    return (
      <EmptyState
        variant="kebun"
        title="Belum ada APK"
        description="Unggah APK pertama lewat form di atas. Mobile akan menawarkan update otomatis."
        icon={<Smartphone className="h-4 w-4" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {daftar.map((item) => {
        const r = item as RilisRow;
        const published = r.isPublished !== false;
        return (
          <Card key={r.id} className={published ? "" : "opacity-75"}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>v{r.versionName}</CardTitle>
                  <Badge variant={published ? "lilac" : "neutral"}>
                    {published ? "Terpublikasi" : "Draft"}
                  </Badge>
                  <span className="text-xs text-stone-gray">kode {r.versionCode}</span>
                </div>
                <CardDesc className="mt-1">
                  {formatMB(r.fileSize)} • {r.downloadCount}x diunduh • {formatTanggal(r.createdAt)}
                  {r.dibuatOleh ? ` • oleh ${r.dibuatOleh}` : ""}
                </CardDesc>
                {r.changelog && (
                  <p className="mt-2 max-w-[70ch] whitespace-pre-line text-sm leading-6 text-ink-charcoal">
                    {r.changelog}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={unduhUrl(r)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-small-button bg-midnight-wine px-3.5 text-[13px] font-semibold text-paper-white hover:bg-[#2f151a]"
                >
                  <Download className="h-3.5 w-3.5" /> Unduh
                </a>
                <button
                  onClick={() => togglePublis.mutate(r)}
                  disabled={togglePublis.isPending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-small-button border border-soft-mist bg-paper-white px-3.5 text-[13px] font-semibold text-ink-charcoal hover:bg-warm-parchment disabled:opacity-50"
                >
                  {published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {published ? "Draftkan" : "Publikasikan"}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus rilis v${r.versionName}? File APK ikut terhapus.`)) {
                      hapus.mutate(r);
                    }
                  }}
                  disabled={hapus.isPending}
                  className="inline-flex h-9 items-center gap-1.5 rounded-small-button border border-destructive/30 bg-paper-white px-3.5 text-[13px] font-semibold text-destructive hover:bg-destructive-soft disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
