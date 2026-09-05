import { create } from 'zustand';
import { getPreferences, updatePreferences, type PreferenceLang } from '@/lib/preferences';

type Theme = 'dark' | 'light';
type Language = PreferenceLang;
type SidebarView = 'main' | 'lang';

// Recarga diferida: al cambiar idioma/tema se muestra el toast (azul) y se
// recarga la página ~1.8s después para que el aviso sea visible.
let reloadTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleReload() {
  if (typeof window === 'undefined') return;
  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    reloadTimer = null;
    window.location.reload();
  }, 1800);
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
  setTheme: (val: Theme, skipReload?: boolean) => void;
  language: Language;
  setLanguage: (val: Language, skipReload?: boolean) => void;
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
  theme: getPreferences().theme,
  setTheme: (val: Theme, skipReload = false) => {
    set({ theme: val });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', val === 'light');
    }
    updatePreferences({ theme: val });
    if (!skipReload) scheduleReload();
  },
  language: getPreferences().lang,
  setLanguage: (val: Language, skipReload = false) => {
    set({ language: val });
    // Los 4 idiomas son individuales: se guarda el código exacto.
    updatePreferences({ lang: val });
    if (!skipReload) scheduleReload();
  },
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