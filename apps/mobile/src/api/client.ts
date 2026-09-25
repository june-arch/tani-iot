import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const API_BASE_URL =
  extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://10.0.2.2:3101/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore tidak tersedia (web) — abaikan
  }
  return config;
});

/** Normalisasi payload backend menjadi array (mendukung {data}, {data:{data}}, array langsung). */
export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload !== null && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const data = obj['data'];
    if (Array.isArray(data)) return data as T[];
    if (data !== null && typeof data === 'object') {
      const nested = (data as Record<string, unknown>)['data'];
      if (Array.isArray(nested)) return nested as T[];
    }
  }
  return [];
}

/** Normalisasi objek tunggal dari envelope backend. */
export function normalizeOne<T>(payload: unknown): T | null {
  if (Array.isArray(payload)) return (payload[0] as T) ?? null;
  if (payload !== null && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const data = obj['data'];
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
      return data as T;
    }
    if (data === undefined) return obj as unknown as T;
  }
  return null;
}

/** Ubah error apa pun menjadi pesan Indonesia yang ramah. */
export function normalizeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const dariServer = data?.['message'] ?? data?.['pesan'] ?? data?.['error'];
    if (typeof dariServer === 'string' && dariServer.trim().length > 0) {
      return dariServer;
    }
    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  } else if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

client.interceptors.response.use(
  (res) => res,
  (error: unknown) => Promise.reject(new Error(normalizeError(error))),
);

export default client;
