import client, { normalizeList } from '../api/client';
import type { LogIrigasi, PemicuIrigasi } from '../models/irigasi';

export const irigasiService = {
  async daftarLog(kebunId: string, limit = 10): Promise<LogIrigasi[]> {
    const res = await client.get(`/irrigation/logs?kebunId=${kebunId}&limit=${limit}`);
    const data = res.data as { logs?: unknown; data?: unknown } | unknown[];
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
      if (Array.isArray(data.logs)) return data.logs as LogIrigasi[];
    }
    return normalizeList<LogIrigasi>(res.data);
  },
  async picu(input: PemicuIrigasi): Promise<unknown> {
    const res = await client.post('/irrigation/trigger', input);
    return res.data;
  },
};
