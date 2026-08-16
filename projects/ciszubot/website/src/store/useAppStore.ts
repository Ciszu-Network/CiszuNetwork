import { create } from 'zustand';

export type SidebarView = 'main' | 'lang';

interface AppState {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  sidebarView: SidebarView;
  setSidebarView: (val: SidebarView) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  sidebarView: 'main',
  setSidebarView: (val: SidebarView) => set({ sidebarView: val }),
}));