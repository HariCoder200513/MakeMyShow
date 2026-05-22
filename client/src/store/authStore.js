import { create } from 'zustand';
import { api } from '../api/client.js';

export const useAuthStore = create((set) => ({
  user: null,
  hydrated: false,
  setAuth: ({ user }) => set({ user, hydrated: true }),
  setUser: (user) => set({ user, hydrated: true }),
  finishHydration: () => set({ hydrated: true }),
  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    set({ user: null, hydrated: true });
  }
}));
