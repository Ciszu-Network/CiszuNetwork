export type PreferenceLang = 'EN' | 'ES';
export type PreferenceTheme = 'dark' | 'light';

export interface Preferences {
  /** Idioma (se mapea a settings_lang: 'en' | 'es'). */
  lang: PreferenceLang;
  /** Tema (se mapea a settings_theme). */
  theme: PreferenceTheme;
  /** Zoom en % aplicado a document.documentElement.style.fontSize. */
  fontSize: number;
  /** Indica si la pestaña está en modo silencio (título + favicon). */
  muted: boolean;
}

const PREFERENCES_KEY = 'ciszu_preferences';

export const SITE_NAME = 'Ciszuko Antony';

export const DEFAULT_PREFERENCES: Preferences = {
  lang: 'EN',
  theme: 'dark',
  fontSize: 100,
  muted: false,
};

export const FONT_SIZE_MIN = 80;
export const FONT_SIZE_MAX = 150;
export const FONT_SIZE_STEP = 10;

export function getPreferences(): Preferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES };
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      fontSize: typeof parsed.fontSize === 'number' ? parsed.fontSize : DEFAULT_PREFERENCES.fontSize,
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
  const next = { ...getPreferences(), ...patch };
  savePreferences(next);
  return next;
}

/** Aplica el zoom al documento raíz (persistido). 100% limpia el inline style. */
export function applyFontSize(size: number): void {
  if (typeof window === 'undefined') return;
  if (size === DEFAULT_PREFERENCES.fontSize) {
    document.documentElement.style.fontSize = '';
  } else {
    document.documentElement.style.fontSize = `${size}%`;
  }
}

const MUTED_FAVICON_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#050a14"/><path d="M11 5 6 9H2v6h4l5 4V5z" fill="#3d6adf"/><g stroke="#ff33cc" stroke-width="2" stroke-linecap="round" fill="none"><path d="m15.5 9 6 6M21.5 9l-6 6"/></g></svg>`
)}`;

/** Href original del favicon capturado en JS (nunca se relee del DOM). */
let originalFaviconHref: string | null = null;

export function applyMuted(muted: boolean): void {
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

/** Empuja las preferencias locales al perfil conectado (schema ciszukoantony). */
export async function pushPreferencesToProfile(userId: string): Promise<void> {
  const prefs = getPreferences();
  try {
    const { supabase } = await import('@/config/supabase');
    await supabase
      .from('profiles')
      .update({
        settings_lang: prefs.lang === 'ES' ? 'es' : 'en',
        settings_theme: prefs.theme,
        settings_controls: { fontSize: prefs.fontSize, muted: prefs.muted },
      })
      .eq('id', userId);
  } catch {
    // sin conexión o error transitorio — las locales siguen siendo la fuente
  }
}