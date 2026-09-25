import client, { normalizeOne } from '../api/client';
import type { AuthUser } from '../models/auth';

export type LoginHasil = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export const authService = {
  async masuk(email: string, password: string): Promise<LoginHasil> {
    const res = await client.post('/auth/login', { email: email.trim(), password });
    const hasil = normalizeOne<LoginHasil>(res.data);
    if (!hasil?.accessToken || !hasil.user) {
      throw new Error('Respons login tidak valid dari server.');
    }
    return hasil;
  },
};
