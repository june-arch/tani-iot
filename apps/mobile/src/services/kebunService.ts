import client, { normalizeList, normalizeOne } from '../api/client';
import type { Kebun, Lahan } from '../models/kebun';

export type KebunBaru = {
  nama: string;
  lokasi: string;
  luas?: number;
  deskripsi?: string;
};

export const kebunService = {
  async daftarKebunSaya(): Promise<Kebun[]> {
    const res = await client.get('/kebuns/my');
    return normalizeList<Kebun>(res.data);
  },
  async daftarLahan(kebunId: string): Promise<Lahan[]> {
    const res = await client.get(`/kebuns/${kebunId}/lahans`);
    return normalizeList<Lahan>(res.data);
  },
  async tambahKebun(input: KebunBaru): Promise<Kebun> {
    const res = await client.post('/kebuns', input);
    const kebun = normalizeOne<Kebun>(res.data);
    if (!kebun) throw new Error('Respons tambah kebun tidak valid dari server.');
    return kebun;
  },
};
