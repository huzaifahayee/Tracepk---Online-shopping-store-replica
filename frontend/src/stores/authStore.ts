import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Admin } from '@/types';

interface AuthState {
  user: User | null;
  admin: Admin | null;
  token: string | null;
  role: 'customer' | 'admin' | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  adminLogin: (admin: Admin, token: string) => void;
  logout: () => void;
}

const EMPTY: Pick<AuthState, 'user' | 'admin' | 'token' | 'role' | 'isAuthenticated'> = {
  user: null,
  admin: null,
  token: null,
  role: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...EMPTY,
      login: (user, token) =>
        set({ ...EMPTY, user, token, role: 'customer', isAuthenticated: true }),
      adminLogin: (admin, token) =>
        set({ ...EMPTY, admin, token, role: 'admin', isAuthenticated: true }),
      logout: () => set({ ...EMPTY }),
    }),
    {
      name: 'trace-auth',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const valid =
          (state.role === 'customer' && !!state.user && !!state.token) ||
          (state.role === 'admin' && !!state.admin && !!state.token);
        if (!valid) {
          Object.assign(state, EMPTY);
        }
      },
    }
  )
);
