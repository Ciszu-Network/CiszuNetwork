import { create } from 'zustand';

type Theme = 'dark' | 'light';
type Language = 'EN' | 'ES';
type SidebarView = 'main' | 'lang';

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const raw = window.localStorage.getItem('ciszu_preferences');
    if (!raw) return 'dark';
    const parsed = JSON.parse(raw) as { theme?: Theme };
    return parsed.theme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

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
  theme: readTheme(),
  setTheme: (val: Theme) => {
    set({ theme: val });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', val === 'light');
    }
    try {
      const raw = window.localStorage.getItem('ciszu_preferences');
      const prefs = raw ? JSON.parse(raw) : {};
      window.localStorage.setItem('ciszu_preferences', JSON.stringify({ ...prefs, theme: val }));
    } catch {
      // localStorage no disponible; el tema solo aplica en sesión.
    }
  },
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