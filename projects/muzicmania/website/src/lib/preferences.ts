export const PREFS_KEY = 'ciszu_preferences';

export interface Preferences {
  lang: string;
  theme: 'dark' | 'light';
  zoom: number;
  muteTab: boolean;
}

export const PREFS_DEFAULTS: Preferences = {
  lang: 'EN-US',
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
    return { ...PREFS_DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
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
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300f0ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='11 5 6 9 2 9 2 15 6 15 11 19 11 5'/%3E%3Cline x1='23' y1='9' x2='17' y2='15'/%3E%3Cline x1='17' y1='9' x2='23' y2='15'/%3E%3C/svg%3E";

let originalTitle: string | null = null;
let originalFavicon: string | null = null;

export function setMuteTab(muted: boolean): void {
  if (typeof window === 'undefined') return;
  if (muted) {
    if (originalTitle === null) originalTitle = document.title;
    document.title = 'MuzicMania — Pestaña en silencio';
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