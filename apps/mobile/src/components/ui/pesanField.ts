/** Ambil pesan error Indonesia pertama dari meta field TanStack Form (string / issue Standard Schema / errorMap). */
export function pesanField(field: unknown): string | undefined {
  if (!field || typeof field !== 'object') return undefined;
  const state = (field as { state?: unknown }).state;
  if (!state || typeof state !== 'object') return undefined;
  const meta = (state as { meta?: unknown }).meta;
  if (!meta || typeof meta !== 'object') return undefined;
  const m = meta as { errors?: unknown; errorMap?: unknown };
  return pesanDariNilai(m.errors) ?? pesanDariMap(m.errorMap);
}

function pesanDariMap(map: unknown): string | undefined {
  if (!map || typeof map !== 'object') return undefined;
  const rec = map as Record<string, unknown>;
  for (const k of ['onChange', 'onBlur', 'onSubmit', 'onMount']) {
    const p = pesanDariNilai(rec[k]);
    if (p) return p;
  }
  return undefined;
}

function pesanDariNilai(v: unknown): string | undefined {
  if (typeof v === 'string' && v.trim().length > 0) return v;
  if (Array.isArray(v)) {
    for (const item of v) {
      const p = pesanDariNilai(item);
      if (p) return p;
    }
    return undefined;
  }
  if (v !== null && typeof v === 'object' && 'message' in v) {
    const msg = (v as { message: unknown }).message;
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;
  }
  return undefined;
}
