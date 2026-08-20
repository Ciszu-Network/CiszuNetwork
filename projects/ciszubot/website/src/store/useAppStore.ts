import { create } from 'zustand';

export type SidebarView = 'main' | 'lang';

/** Usuario activo. `provider` distingue el origen: Discord (cookie/HMAC) o CISZU ID (Supabase). */
export interface AppUser {
  id: string;
  name: string | null;
  avatar: string | null;
  email: string | null;
  username?: string;
  display_name?: string;
  provider: 'discord' | 'ciszu';
}

interface AppState {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  sidebarView: SidebarView;
  setSidebarView: (val: SidebarView) => void;
  hasAcceptedCookies: boolean;
  setHasAcceptedCookies: (val: boolean) => void;
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  sidebarView: 'main',
  setSidebarView: (val: SidebarView) => set({ sidebarView: val }),
  hasAcceptedCookies: false,
  setHasAcceptedCookies: (val: boolean) => set({ hasAcceptedCookies: val }),
  user: null,
  setUser: (user: AppUser | null) => set({ user }),
  isHydrated: false,
  setIsHydrated: (val: boolean) => set({ isHydrated: val }),
}));