import client, { normalizeList } from '../api/client';
import type { Crop, RencanaTanam } from '../models/tanaman';

export const tanamanService = {
  async daftarCrop(): Promise<Crop[]> {
    const res = await client.get('/crops');
    return normalizeList<Crop>(res.data);
  },
  async daftarRencana(): Promise<RencanaTanam[]> {
    const res = await client.get('/plantings');
    return normalizeList<RencanaTanam>(res.data);
  },
};
