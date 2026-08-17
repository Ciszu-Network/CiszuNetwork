import { create } from 'zustand';

type Theme = 'dark' | 'light';
type Language = 'es' | 'en';
export type SidebarView = 'main' | 'lang';

interface AppState {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  sidebarView: SidebarView;
  setSidebarView: (val: SidebarView) => void;
  theme: Theme;
  setTheme: (val: Theme) => void;
  language: Language;
  setLanguage: (val: Language) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  hasAcceptedCookies: boolean;
  setHasAcceptedCookies: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  sidebarView: 'main',
  setSidebarView: (val: SidebarView) => set({ sidebarView: val }),
  theme: 'dark',
  setTheme: (val: Theme) => set({ theme: val }),
  language: 'es',
  setLanguage: (val: Language) => set({ language: val }),
  searchQuery: '',
  setSearchQuery: (val: string) => set({ searchQuery: val }),
  hasAcceptedCookies: false,
  setHasAcceptedCookies: (val: boolean) => set({ hasAcceptedCookies: val }),
}));
