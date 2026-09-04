'use client';

export type PrefLang = 'es-latam' | 'es-es' | 'en-us' | 'en-uk';
export type PrefTheme = 'dark' | 'light';

export interface CiszuPreferences {
  lang: PrefLang;
  theme: PrefTheme;
  zoom: number;
  tabMuted: boolean;
  /** Guard azul de redirección a otras webs (default activo). */
  redirectGuard: boolean;
  /** Guard rojo de acciones no recuperables (default activo). */
  activityGuard: boolean;
}

export const PREFS_STORAGE_KEY = 'ciszu_preferences';

export const DEFAULT_PREFERENCES: CiszuPreferences = {
  lang: 'es-latam',
  theme: 'dark',
  zoom: 100,
  tabMuted: false,
  redirectGuard: true,
  activityGuard: true,
};

export const ZOOM_MIN = 80;
export const ZOOM_MAX = 140;
export const ZOOM_STEP = 10;

/** Idiomas disponibles (completados). El resto están bloqueados. */
export const AVAILABLE_LANGS: PrefLang[] = ['es-latam', 'es-es', 'en-us', 'en-uk'];

export function isLangAvailable(lang: PrefLang): boolean {
  return AVAILABLE_LANGS.includes(lang);
}

export function loadPreferences(): CiszuPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<CiszuPreferences>;
    return {
      lang: parsed.lang && AVAILABLE_LANGS.includes(parsed.lang as PrefLang) ? (parsed.lang as PrefLang) : DEFAULT_PREFERENCES.lang,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      zoom: typeof parsed.zoom === 'number' && parsed.zoom >= ZOOM_MIN && parsed.zoom <= ZOOM_MAX ? parsed.zoom : DEFAULT_PREFERENCES.zoom,
      tabMuted: parsed.tabMuted === true,
      redirectGuard: parsed.redirectGuard !== false,
      activityGuard: parsed.activityGuard !== false,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: CiszuPreferences) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage puede no estar disponible (modo privado/quota), ignorar.
  }
}

export function updatePreferences(patch: Partial<CiszuPreferences>): CiszuPreferences {
  const next = { ...loadPreferences(), ...patch };
  savePreferences(next);
  return next;
}

export function applyZoom(zoom: number) {
  if (typeof window === 'undefined') return;
  document.documentElement.style.fontSize = `${zoom}%`;
}

export function applyTheme(theme: PrefTheme) {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.toggle('light', theme === 'light');
}

const MUTED_FAVICON_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233a6bf0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'/%3E%3Cline x1='23' y1='9' x2='17' y2='15'/%3E%3Cline x1='17' y1='9' x2='23' y2='15'/%3E%3C/svg%3E";

let originalTitle: string | null = null;
let originalFavicon: string | null = null;

export function setMuteTab(muted: boolean) {
  if (typeof window === 'undefined') return;
  if (muted) {
    if (originalTitle === null) originalTitle = document.title;
    document.title = 'Ciszu Network — Pestaña en silencio';
    const fav = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (fav) {
      if (originalFavicon === null) originalFavicon = fav.href;
      fav.href = MUTED_FAVICON_DATA_URI;
    }
  } else {
    if (originalTitle !== null) document.title = originalTitle;
    originalTitle = null;
    if (originalFavicon !== null) {
      const fav = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (fav) fav.href = originalFavicon;
      originalFavicon = null;
    }
  }
}

export async function syncPreferencesToProfile(userId: string, prefs: CiszuPreferences) {
  const { supabase } = await import('@/config/supabase');
  const { error } = await supabase
    .from('profiles')
    .update({
      settings_lang: prefs.lang,
      settings_theme: prefs.theme,
      settings_controls: { zoom: prefs.zoom, tabMuted: prefs.tabMuted },
    })
    .eq('id', userId);
  if (error) {
    console.error('[Preferences] Error sincronizando preferencias al perfil:', error);
  }
}