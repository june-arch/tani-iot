import { z } from 'zod';

export type HasilDiagnosis = {
  diagnosis: string;
  confidence?: number;
  penyebab?: string;
  solusi?: string[] | string;
  pencegahan?: string;
  cropSlug?: string;
};

export const catatanDiagnosisSchema = z.object({
  catatan: z.string().max(300, 'Catatan maksimal 300 karakter'),
});

export type CatatanDiagnosisForm = z.infer<typeof catatanDiagnosisSchema>;

export function formatSolusi(v: HasilDiagnosis['solusi']): string {
  if (!v) return '-';
  if (Array.isArray(v)) return v.join('\n• ');
  if (typeof v === 'string') return v;
  return '-';
}

/** Petakan payload backend yang fleksibel ke HasilDiagnosis. */
export function mapHasilDiagnosis(payload: Record<string, unknown>): HasilDiagnosis {
  const ambilString = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = payload[k];
      if (typeof v === 'string' && v.trim().length > 0) return v;
    }
    return undefined;
  };
  const solusiRaw = payload['solusi'] ?? payload['solution'] ?? payload['solusiList'];
  const solusi =
    typeof solusiRaw === 'string' || Array.isArray(solusiRaw)
      ? (solusiRaw as string[] | string)
      : undefined;
  const confidenceRaw = payload['confidence'];
  return {
    diagnosis:
      ambilString(['diagnosis', 'hasil', 'message', 'pesan']) ?? JSON.stringify(payload),
    confidence: typeof confidenceRaw === 'number' ? confidenceRaw : undefined,
    penyebab: ambilString(['penyebab', 'cause']),
    solusi,
    pencegahan: ambilString(['pencegahan', 'prevention']),
    cropSlug: ambilString(['cropSlug']),
  };
}
