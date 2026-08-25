import { create } from 'zustand';
import { assetResolver } from '@ciszunetwork/cdn';

type NavigationState = false | 'navigating' | 'refreshing';
export type SidebarView = 'main' | 'lang';

interface AppState {
  isMusicPlaying: boolean;
  currentTrack: string | null;
  isNavigating: NavigationState;
  isMenuOpen: boolean;
  sidebarView: SidebarView;
  darkMode: boolean;
  lang: string;
  // Audio Global
  audioInstance: HTMLAudioElement | null;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  isAudioInitialized: boolean;
  audioInfo: { name: string; artist: string } | null;
  musicVol: number;
  sfxVol: number;
  hitSound: boolean;
  
  toggleMusic: () => void;
  setTrack: (track: string) => void;
  setIsNavigating: (val: NavigationState) => void;
  setIsMenuOpen: (val: boolean) => void;
  setSidebarView: (val: SidebarView) => void;
  setDarkMode: (val: boolean) => void;
  setLang: (val: string) => void;
  user: { 
    id: string; 
    email: string; 
    username: string; 
    display_name: string; 
    avatar_url?: string;
    role?: string;
  } | null;
  setUser: (user: any | null) => void;

  // Actions
  initializeAudio: () => void;
  playGlobalMusic: () => void;
  pauseGlobalMusic: () => void;
  setMusicVol: (val: number) => void;
  setSfxVol: (val: number) => void;
  setHitSound: (val: boolean) => void;
  syncGlobalVolume: () => void;
  
  hasAcceptedCookies: boolean;
  setHasAcceptedCookies: (val: boolean) => void;
  
  isCloudflareVerified: boolean;
  setIsCloudflareVerified: (val: boolean) => void;

  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;
}

/**
 * Global Zustand Store para MuzicMania.
 * Gestionará estados vitales sin prop-drilling.
 */
export const useAppStore = create<AppState>((set: any, get: any) => ({
  isMusicPlaying: false,
  currentTrack: null,
  isNavigating: false,
  isMenuOpen: false,
  sidebarView: 'main',
  darkMode: true,
  lang: 'EN-US',
  user: null,
  audioInstance: null,
  analyser: null,
  audioContext: null,
  isAudioInitialized: false,
  audioInfo: { name: "Cyber Beat", artist: "MuzicMania" },
  musicVol: typeof window !== 'undefined' ? Number(localStorage.getItem('audio_music_vol')) || 100 : 100,
  sfxVol: typeof window !== 'undefined' ? Number(localStorage.getItem('audio_sfx_vol')) || 100 : 100,
  hitSound: typeof window !== 'undefined' ? localStorage.getItem('audio_hit_sound') === 'true' : false,
  hasAcceptedCookies: false,
  isCloudflareVerified: false,
  isHydrated: false,

  setIsHydrated: (val: boolean) => set({ isHydrated: val }),
  setIsCloudflareVerified: (val: boolean) => set({ isCloudflareVerified: val }),
  setHasAcceptedCookies: (val: boolean) => set({ hasAcceptedCookies: val }),
  setUser: (user: any) => set({ user }),
  toggleMusic: () => {
    const { isMusicPlaying, playGlobalMusic, pauseGlobalMusic } = get();
    if (isMusicPlaying) pauseGlobalMusic();
    else playGlobalMusic();
  },
  setTrack: (track: string) => set({ currentTrack: track }),
  setIsNavigating: (val: NavigationState) => set({ isNavigating: val }),
  setIsMenuOpen: (val: boolean) => set({ isMenuOpen: val }),
  setSidebarView: (val: SidebarView) => set({ sidebarView: val }),
  setDarkMode: (val: boolean) => {
    set({ darkMode: val });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', !val);
    }
  },
  setLang: (val: string) => set({ lang: val }),

  initializeAudio: () => {
    if (get().isAudioInitialized || typeof window === 'undefined') return;
    
    const audio = new Audio(assetResolver.resolve('projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cyber_beat.ogg'));
    audio.loop = true;
    audio.volume = (get().musicVol || 100) / 100;
    
    // Web Audio API for visualizer
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      set({ analyser, audioContext: ctx });
    }
    
    set({ audioInstance: audio, isAudioInitialized: true });
  },

  playGlobalMusic: () => {
    let state = get();
    if (!state.isAudioInitialized) {
      state.initializeAudio();
      state = get(); // Obtener el estado actualizado con audioInstance y audioContext
    }
    
    // Si hay un contexto de audio suspendido, intentar reanudarlo
    if (state.audioContext && state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }
    
    const audio = state.audioInstance;
    if (audio) {
      audio.play().then(() => {
        set({ isMusicPlaying: true });
      }).catch(() => {
        console.log("Autoplay blocked or audio error");
        set({ isMusicPlaying: false });
      });
    }
  },

  pauseGlobalMusic: () => {
    const { audioInstance } = get();
    if (audioInstance) {
      audioInstance.pause();
      set({ isMusicPlaying: false });
    }
  },

  setMusicVol: (val: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('audio_music_vol', String(val));
    set({ musicVol: val });
    const { audioInstance } = get();
    if (audioInstance) audioInstance.volume = val / 100;
  },

  setSfxVol: (val: number) => {
    if (typeof window !== 'undefined') localStorage.setItem('audio_sfx_vol', String(val));
    set({ sfxVol: val });
  },
  setHitSound: (val: boolean) => {
    if (typeof window !== 'undefined') localStorage.setItem('audio_hit_sound', String(val));
    set({ hitSound: val });
  },

  syncGlobalVolume: () => {
    const { audioInstance, musicVol } = get();
    if (audioInstance) audioInstance.volume = (musicVol || 100) / 100;
  }
}));
