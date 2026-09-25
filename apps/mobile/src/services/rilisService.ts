import client, { normalizeOne, API_BASE_URL } from '../api/client';

export type RilisMobile = {
  id: string;
  versionName: string;
  versionCode: number;
  changelog?: string | null;
  fileSize: number;
  downloadCount: number;
  downloadPath: string;
  adaPembaruan?: boolean;
};

/** URL unduhan absolut dari path relatif backend. */
export function unduhUrl(rilis: Pick<RilisMobile, 'downloadPath'>): string {
  return `${API_BASE_URL}${rilis.downloadPath}`;
}

export function formatUkuran(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const rilisService = {
  /** Rilis terbaru yang dipublikasikan (endpoint publik, tanpa login). */
  async terbaru(currentCode?: number): Promise<RilisMobile | null> {
    const query =
      typeof currentCode === 'number' && Number.isFinite(currentCode)
        ? `?currentCode=${currentCode}`
        : '';
    const res = await client.get(`/releases/latest${query}`);
    return normalizeOne<RilisMobile>(res.data);
  },
};
