import client from '../api/client';
import { mapHasilDiagnosis, type HasilDiagnosis } from '../models/diagnosis';

export const doctorService = {
  /** Kirim foto daun sebagai FormData (timeout 60 detik untuk inferensi AI). */
  async diagnosis(imageUri: string): Promise<HasilDiagnosis> {
    const form = new FormData();
    form.append('image', {
      uri: imageUri,
      name: 'tanaman.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
    const res = await client.post('/ai/diagnose', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    const payload = (res.data as { data?: Record<string, unknown> } | Record<string, unknown>) ?? {};
    const isi =
      payload !== null &&
      typeof payload === 'object' &&
      'data' in payload &&
      payload.data !== null &&
      typeof payload.data === 'object'
        ? (payload.data as Record<string, unknown>)
        : (payload as Record<string, unknown>);
    return mapHasilDiagnosis(isi);
  },
};
