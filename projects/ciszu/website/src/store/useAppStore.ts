import { create } from 'zustand';
import { loadPreferences, savePreferences, type PrefLang, type PrefTheme } from '@/lib/preferences';

type Theme = PrefTheme;
type Language = PrefLang;
export type SidebarView = 'main' | 'lang';

export interface CiszUser {
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
  user: CiszUser | null;
  setUser: (user: CiszUser | null) => void;
  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;
  zoom: number;
  setZoom: (val: number) => void;
  tabMuted: boolean;
  setTabMuted: (val: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

const persisted = typeof window !== 'undefined' ? loadPreferences() : null;

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  sidebarView: 'main',
  setSidebarView: (val: SidebarView) => set({ sidebarView: val }),
  theme: persisted?.theme ?? 'dark',
  setTheme: (val: Theme) => {
    set({ theme: val });
    const prefs = loadPreferences();
    savePreferences({ ...prefs, theme: val });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', val === 'light');
    }
  },
  language: persisted?.lang ?? 'es',
  setLanguage: (val: Language) => {
    set({ language: val });
    const prefs = loadPreferences();
    savePreferences({ ...prefs, lang: val });
  },
  searchQuery: '',
  setSearchQuery: (val: string) => set({ searchQuery: val }),
  hasAcceptedCookies: false,
  setHasAcceptedCookies: (val: boolean) => set({ hasAcceptedCookies: val }),
  user: null,
  setUser: (user: CiszUser | null) => set({ user }),
  isHydrated: false,
  setIsHydrated: (val: boolean) => set({ isHydrated: val }),
  zoom: persisted?.zoom ?? 100,
  setZoom: (val: number) => {
    const clamped = Math.min(160, Math.max(80, val));
    set({ zoom: clamped });
    const prefs = loadPreferences();
    savePreferences({ ...prefs, zoom: clamped });
  },
  tabMuted: persisted?.tabMuted ?? false,
  setTabMuted: (val: boolean) => {
    set({ tabMuted: val });
    const prefs = loadPreferences();
    savePreferences({ ...prefs, tabMuted: val });
  },
  toast: null,
  showToast: (msg: string) => set({ toast: msg }),
  hideToast: () => set({ toast: null }),
}));