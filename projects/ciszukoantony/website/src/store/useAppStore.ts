import { create } from 'zustand';

type Theme = 'dark' | 'light';
type Language = 'EN' | 'ES';
type SidebarView = 'main' | 'lang';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  role?: string;
}

interface AppState {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  theme: Theme;
  setTheme: (val: Theme) => void;
  language: Language;
  setLanguage: (val: Language) => void;
  sidebarView: SidebarView;
  setSidebarView: (val: SidebarView) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  hasAcceptedCookies: boolean;
  setHasAcceptedCookies: (val: boolean) => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  theme: 'dark',
  setTheme: (val: Theme) => set({ theme: val }),
  language: 'EN',
  setLanguage: (val: Language) => set({ language: val }),
  sidebarView: 'main',
  setSidebarView: (val: SidebarView) => set({ sidebarView: val }),
  searchQuery: '',
  setSearchQuery: (val: string) => set({ searchQuery: val }),
  hasAcceptedCookies: false,
  setHasAcceptedCookies: (val: boolean) => set({ hasAcceptedCookies: val }),
  user: null,
  setUser: (user: AuthUser | null) => set({ user }),
  isHydrated: false,
  setIsHydrated: (val: boolean) => set({ isHydrated: val }),
}));