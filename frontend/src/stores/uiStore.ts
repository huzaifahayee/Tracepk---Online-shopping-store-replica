import { create } from 'zustand';

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  splashDone: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSplashDone: (done: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  splashDone: sessionStorage.getItem('trace_splash_shown') === 'true',
  setCartOpen: (open) => set({ cartOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setSplashDone: (done) => {
    sessionStorage.setItem('trace_splash_shown', 'true');
    set({ splashDone: done });
  },
}));
