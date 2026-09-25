/** Normalizer envelope backend (freeze backend → adapter di frontend).
 * Dialek: {message,data} | {sukses,pesan,data} | raw array | {data,meta} */

export function normalizeList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r["data"])) return r["data"] as T[];
  }
  return [];
}

export function normalizeError(e: unknown): string {
  if (typeof e === "string") return e;
  const o = e as { message?: unknown } | null;
  if (o && typeof o.message === "string") return o.message;
  if (o && Array.isArray(o.message)) return (o.message as string[]).join(", ");
  return "Terjadi kesalahan. Coba lagi.";
}
