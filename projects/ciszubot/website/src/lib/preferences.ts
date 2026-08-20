export const PREFS_KEY = 'ciszu_preferences';

export interface Preferences {
  lang: 'es' | 'en';
  theme: 'dark' | 'light';
  zoom: number;
  muteTab: boolean;
}

export const PREFS_DEFAULTS: Preferences = {
  lang: 'es',
  theme: 'dark',
  zoom: 100,
  muteTab: false,
};

export const ZOOM_MIN = 80;
export const ZOOM_MAX = 140;
export const ZOOM_STEP = 10;

export function loadPreferences(): Preferences {
  if (typeof window === 'undefined') return { ...PREFS_DEFAULTS };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...PREFS_DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      lang: parsed.lang === 'en' ? 'en' : 'es',
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      zoom: typeof parsed.zoom === 'number' ? parsed.zoom : PREFS_DEFAULTS.zoom,
      muteTab: typeof parsed.muteTab === 'boolean' ? parsed.muteTab : PREFS_DEFAULTS.muteTab,
    };
  } catch {
    return { ...PREFS_DEFAULTS };
  }
}

export function savePreferences(prefs: Preferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function updatePreferences(patch: Partial<Preferences>): Preferences {
  const next = { ...loadPreferences(), ...patch };
  savePreferences(next);
  return next;
}

export function applyZoom(zoom: number): void {
  if (typeof window === 'undefined') return;
  document.documentElement.style.fontSize = `${zoom}%`;
}

const MUTED_FAVICON_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235865F2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'/%3E%3Cline x1='23' y1='9' x2='17' y2='15'/%3E%3Cline x1='17' y1='9' x2='23' y2='15'/%3E%3C/svg%3E";

let originalTitle: string | null = null;
let originalFavicon: string | null = null;

export function setMuteTab(muted: boolean): void {
  if (typeof window === 'undefined') return;
  if (muted) {
    if (originalTitle === null) originalTitle = document.title;
    document.title = 'CiszuBot — Pestaña en silencio';
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

/**
 * Sincroniza las preferencias a `ciszubot.profiles` (settings_lang,
 * settings_theme, settings_controls). Solo se aplica cuando hay una sesión
 * activa de CISZU ID en Supabase para ese usuario; las sesiones de Discord
 * no tienen fila en profiles (el id es un snowflake, no un uuid) y sus
 * preferencias quedan solo en localStorage.
 */
export async function syncPreferencesToProfile(userId: string, prefs: Preferences): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const { supabase } = await import('@/config/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id !== userId) return;
    await supabase
      .from('profiles')
      .update({
        settings_lang: prefs.lang,
        settings_theme: prefs.theme,
        settings_controls: { zoom: prefs.zoom, muteTab: prefs.muteTab },
      })
      .eq('id', userId);
  } catch {
    // La sincronización con la nube nunca debe tirar abajo la UI.
  }
}