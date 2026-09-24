import { create } from 'zustand';
import { reloadPage } from '@ciszu/ui';
import { loadPreferences, savePreferences, applyZoom, applyTheme, type PrefLang, type PrefTheme } from '@/lib/preferences';

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
  setTheme: (val: Theme, skipReload?: boolean) => void;
  language: Language;
  setLanguage: (val: Language, skipReload?: boolean) => void;
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
}

const persisted = typeof window !== 'undefined' ? loadPreferences() : null;

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  sidebarView: 'main',
  setSidebarView: (val: SidebarView) => set({ sidebarView: val }),
  theme: persisted?.theme ?? 'dark',
  setTheme: (val: Theme, skipReload = false) => {
    set({ theme: val });
    const prefs = loadPreferences();
    savePreferences({ ...prefs, theme: val });
    applyTheme(val);
    // Recarga VOLUNTARIA (~1.5s para que el toast sea visible): la página se
    // actualiza al cambiar el tema y el AdBlockerGuard no reaparece porque es
    // una acción del usuario, no un F5 manual.
    if (!skipReload) reloadPage(1500);
  },
  language: persisted?.lang ?? 'es-latam',
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
    applyZoom(clamped);
  },
  tabMuted: persisted?.tabMuted ?? false,
  setTabMuted: (val: boolean) => {
    set({ tabMuted: val });
    const prefs = loadPreferences();
    savePreferences({ ...prefs, tabMuted: val });
  },
}));

if (typeof window !== 'undefined') {
  const initial = loadPreferences();
  applyTheme(initial.theme);
}