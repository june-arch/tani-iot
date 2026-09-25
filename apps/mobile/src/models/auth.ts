import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid').max(120),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter').max(100),
});

export type LoginForm = z.infer<typeof loginSchema>;

export type AuthUser = {
  id: string;
  email: string;
  nama: string;
  role: string;
};
