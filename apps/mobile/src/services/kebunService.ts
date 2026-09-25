import client, { normalizeList } from '../api/client';
import type { Kebun, Lahan } from '../models/kebun';

export const kebunService = {
  async daftarKebunSaya(): Promise<Kebun[]> {
    const res = await client.get('/kebuns/my');
    return normalizeList<Kebun>(res.data);
  },
  async daftarLahan(kebunId: string): Promise<Lahan[]> {
    const res = await client.get(`/kebuns/${kebunId}/lahans`);
    return normalizeList<Lahan>(res.data);
  },
};
