/** Los 4 idiomas de producción son individuales entre sí. */
export type PreferenceLang = 'es-latam' | 'es-es' | 'en-us' | 'en-uk';
export type PreferenceTheme = 'dark' | 'light';

export interface Preferences {
  /** Idioma (se mapea a settings_lang: familia 'es' | 'en' en la DB). */
  lang: PreferenceLang;
  /** Tema (se mapea a settings_theme). */
  theme: PreferenceTheme;
  /** Zoom en % aplicado a document.documentElement.style.fontSize. */
  zoom: number;
  /** Indica si la pestaña está en modo silencio (título + favicon). */
  muteTab: boolean;
  /** Guard azul de redirección a otras webs (default activo). */
  redirectGuard: boolean;
  /** Guard rojo de acciones no recuperables (default activo). */
  activityGuard: boolean;
}

const PREFERENCES_KEY = 'ciszu_preferences';

export const SITE_NAME = 'MuzicMania';

export const DEFAULT_PREFERENCES: Preferences = {
  lang: 'es-latam',
  theme: 'dark',
  zoom: 100,
  muteTab: false,
  redirectGuard: true,
  activityGuard: true,
};

export const ZOOM_MIN = 80;
export const ZOOM_MAX = 140;
export const ZOOM_STEP = 10;

/** Idiomas terminados (el resto están bloqueados). */
export const AVAILABLE_LANGS: PreferenceLang[] = ['es-latam', 'es-es', 'en-us', 'en-uk'];

export function isLangAvailable(lang: string): boolean {
  return (AVAILABLE_LANGS as string[]).includes(lang);
}

/** Normaliza un valor guardado (acepta códigos antiguos 'ES-LA'/'ES-ES'/'EN-US'/'EN-UK'). */
function normalizeLang(raw: unknown): PreferenceLang {
  if (raw === 'ES-LA' || raw === 'es-latam' || raw === 'es-es') {
    return raw === 'es-es' ? 'es-es' : 'es-latam';
  }
  if (raw === 'EN-US' || raw === 'EN-UK' || raw === 'en-us' || raw === 'en-uk') {
    return raw === 'en-uk' ? 'en-uk' : 'en-us';
  }
  return DEFAULT_PREFERENCES.lang;
}

export function loadPreferences(): Preferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES };
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      lang: normalizeLang(parsed.lang),
      zoom: typeof parsed.zoom === 'number' ? parsed.zoom : DEFAULT_PREFERENCES.zoom,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Preferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable — ignore, preferences no son críticas
  }
}

export function updatePreferences(patch: Partial<Preferences>): Preferences {
  const next = { ...loadPreferences(), ...patch };
  savePreferences(next);
  return next;
}

/** Aplica el zoom al documento raíz (persistido). 100% limpia el inline style. */
export function applyZoom(zoom: number): void {
  if (typeof window === 'undefined') return;
  if (zoom === DEFAULT_PREFERENCES.zoom) {
    document.documentElement.style.fontSize = '';
  } else {
    document.documentElement.style.fontSize = `${zoom}%`;
  }
}

const MUTED_FAVICON_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#050a14"/><path d="M11 5 6 9H2v6h4l5 4V5z" fill="#3d6adf"/><g stroke="#ff33cc" stroke-width="2" stroke-linecap="round" fill="none"><path d="m15.5 9 6 6M21.5 9l-6 6"/></g></svg>`
)}`;

/** Href original del favicon capturado en JS (nunca se relee del DOM). */
let originalFaviconHref: string | null = null;

export function setMuteTab(muted: boolean): void {
  if (typeof window === 'undefined') return;

  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (icon && originalFaviconHref === null) {
    originalFaviconHref = icon.href || '';
  }

  document.title = muted ? `${SITE_NAME} \uD83D\uDD07 (sin sonido)` : SITE_NAME;

  if (icon) {
    icon.href = muted ? MUTED_FAVICON_SVG : safeFaviconHref(originalFaviconHref) || MUTED_FAVICON_SVG;
  }
}

/** Solo admite esquemas seguros para el favicon (http/https/data); evita
 *  reinterpretar un href arbitrario (javascript: etc.) como URL.
 *  Devuelve el href normalizado por `new URL` (nunca el string crudo). */
function safeFaviconHref(href: string | null): string | null {
  if (!href) return null;
  try {
    const parsed = new URL(href, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'data:') {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}

export const RELOAD_MSG_KEY = 'ciszu_reload_toast_msg';

export function setReloadToastMsg(msg: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(RELOAD_MSG_KEY, msg);
  } catch {
    /* noop */
  }
}

export function consumeReloadToastMsg(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const msg = sessionStorage.getItem(RELOAD_MSG_KEY);
    if (!msg) return null;
    sessionStorage.removeItem(RELOAD_MSG_KEY);
    return msg;
  } catch {
    return null;
  }
}

export function reloadAfterPrefChange(msg: string): void {
  setReloadToastMsg(msg);
  if (typeof window !== 'undefined') window.location.reload();
}