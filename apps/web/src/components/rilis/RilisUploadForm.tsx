"use client";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileUp, AlertTriangle } from "lucide-react";
import { Card, CardTitle, CardDesc } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { apiUpload } from "@/lib/api";
import { ENDPOINTS, errorMessage } from "@/lib/endpoints";
import { rilisSchema } from "@/lib/schemas";
import type { Rilis } from "@/lib/queries";

export function RilisUploadForm({ onSukses }: { onSukses: (msg: string) => void }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [changelog, setChangelog] = useState("");
  const [fileName, setFileName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const unggah = useMutation({
    mutationFn: async () => {
      const parsed = rilisSchema.safeParse({ versionName, versionCode, changelog });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Form belum valid.");
      }
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("Pilih file APK dulu.");
      if (!file.name.toLowerCase().endsWith(".apk")) {
        throw new Error("File harus berekstensi .apk.");
      }
      const form = new FormData();
      form.append("apk", file);
      form.append("versionName", parsed.data.versionName.trim());
      form.append("versionCode", String(parsed.data.versionCode));
      if (parsed.data.changelog?.trim()) form.append("changelog", parsed.data.changelog.trim());
      form.append("isPublished", "true");
      return apiUpload<Rilis>(ENDPOINTS.releases, form);
    },
    onSuccess: (r) => {
      onSukses(`APK v${r.versionName} berhasil diunggah.`);
      setVersionName("");
      setVersionCode("");
      setChangelog("");
      setFileName("");
      setFormError(null);
      if (fileRef.current) fileRef.current.value = "";
      void queryClient.invalidateQueries({ queryKey: ["releases"] });
    },
    onError: (e) => setFormError(errorMessage(e, "Unggah gagal.")),
  });

  return (
    <Card>
      <CardTitle className="flex items-center gap-2 text-base">
        <Upload className="h-4 w-4 text-royal-violet" /> Unggah APK baru
      </CardTitle>
      <CardDesc className="mt-1">
        Kode versi harus naik tiap rilis (contoh: versi 1.1.0 → kode 2). Maks ±500MB.
      </CardDesc>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Nama versi (semver)"
          placeholder="1.1.0"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
        />
        <Input
          label="Kode versi (angka, naik terus)"
          placeholder="2"
          inputMode="numeric"
          value={versionCode}
          onChange={(e) => setVersionCode(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <Textarea
          label="Catatan perubahan (opsional)"
          placeholder="Perbaiki sinkronisasi sensor, tambah banner update…"
          rows={3}
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <label
          htmlFor="apk-file"
          className="flex cursor-pointer items-center gap-3 rounded-small-button border border-dashed border-soft-mist bg-warm-parchment px-4 py-4 text-sm hover:border-royal-violet/40"
        >
          <FileUp className="h-5 w-5 shrink-0 text-royal-violet" />
          <span className="font-medium text-ink-charcoal">
            {fileName || "Pilih file .apk dari komputer"}
          </span>
        </label>
        <input
          id="apk-file"
          ref={fileRef}
          type="file"
          accept=".apk"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
      </div>
      {formError && (
        <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {formError}
        </div>
      )}
      <Button onClick={() => unggah.mutate()} disabled={unggah.isPending} className="mt-4 gap-1.5">
        <Upload className="h-4 w-4" />
        {unggah.isPending ? "Mengunggah…" : "Unggah APK"}
      </Button>
    </Card>
  );
}
