import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  name?: string;
  email?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: async (token, user) => {
    try {
      await SecureStore.setItemAsync('access_token', token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    } catch {
      // web fallback ignore
    }
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('auth_user');
    } catch {}
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const raw = await SecureStore.getItemAsync('auth_user');
      const user: User | null = raw ? (JSON.parse(raw) as User) : null;
      if (token) set({ token, user, isAuthenticated: true });
    } catch {}
  },
}));
