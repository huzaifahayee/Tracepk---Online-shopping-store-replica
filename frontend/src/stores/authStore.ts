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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      admin: null,
      token: null,
      role: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({ user, token, role: 'customer', isAuthenticated: true, admin: null }),
      adminLogin: (admin, token) =>
        set({ admin, token, role: 'admin', isAuthenticated: true, user: null }),
      logout: () =>
        set({ user: null, admin: null, token: null, role: null, isAuthenticated: false }),
    }),
    { name: 'trace-auth' }
  )
);
