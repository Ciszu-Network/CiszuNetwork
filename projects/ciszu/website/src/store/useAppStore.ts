import { create } from 'zustand';

type Theme = 'dark' | 'light';
type Language = 'es' | 'en';

interface AppState {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  theme: Theme;
  setTheme: (val: Theme) => void;
  language: Language;
  setLanguage: (val: Language) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  theme: 'dark',
  setTheme: (val: Theme) => set({ theme: val }),
  language: 'es',
  setLanguage: (val: Language) => set({ language: val }),
  searchQuery: '',
  setSearchQuery: (val: string) => set({ searchQuery: val }),
}));
