// Tani IoT — API fetch wrapper
// Base URL dari NEXT_PUBLIC_API_URL, fallback ke http://localhost:3101
// Semua path otomatis prefix /api jika belum ada

const RAW_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3101";

export const baseUrl = RAW_BASE.endsWith("/api")
  ? RAW_BASE
  : `${RAW_BASE}/api`;

export type ApiEnvelope<T> = {
  sukses?: boolean;
  success?: boolean;
  pesan?: string;
  message?: string;
  data: T;
};

export type ApiError = {
  status: number;
  message: string;
  raw?: unknown;
};

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };

  // forward token jika ada di localStorage (client only)
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("tani_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    // cache default: no-store untuk dashboard realtime
    cache: opts.cache ?? "no-store",
  });

  const body = await parseJson(res);

  if (!res.ok) {
    const msg =
      (body as { message?: string; pesan?: string; error?: string })
        ?.message ??
      (body as { pesan?: string })?.pesan ??
      (body as { error?: string })?.error ??
      `Request gagal (${res.status})`;
    throw { status: res.status, message: msg, raw: body } as ApiError;
  }

  // unwrap envelope { data: ... } jika ada
  if (
    body &&
    typeof body === "object" &&
    "data" in (body as Record<string, unknown>)
  ) {
    return (body as ApiEnvelope<T>).data as T;
  }
  return body as T;
}

// helpers
export const api = {
  get: <T>(path: string, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    apiFetch<T>(path, {
      ...opts,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, opts?: RequestInit) =>
    apiFetch<T>(path, {
      ...opts,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};

// Types konsumsi
export type Crop = {
  id: string;
  name: string;
  slug: string;
  category: string;
  scientificName?: string | null;
  description?: string | null;
  iklimOptimal?: string | null;
  ketinggianOptimal?: string | null;
  imageUrl?: string | null;
};

export type Kebun = {
  id: string;
  name: string;
  lokasi?: string | null;
  deskripsi?: string | null;
  createdAt?: string;
};

export type Sensor = {
  id: string;
  name: string;
  tipe: string;
  deviceId: string;
  config?: Record<string, unknown>;
  lastValue?: number | null;
  lastSeen?: string | null;
  status?: "online" | "offline" | "warning";
};
