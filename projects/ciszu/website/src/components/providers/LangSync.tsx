'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { loadPreferences } from '@/lib/preferences';
import { parseLang, LANG_COOKIE } from '@/lib/i18n';

/**
 * Resuelve el idioma real en cliente cuando el layout raíz ya no lee `cookies()`
 * (el SSR sale siempre en el idioma base `es-latam`).
 *
 * Orden de resolución: cookie `ciszu_lang` → localStorage (`ciszu_preferences`)
 * → base. El primer render coincide con el HTML del servidor (base) y el idioma
 * real se aplica en el efecto de montaje, sin romper la hidratación.
 */
function readCookieLang(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export default function LangSync() {
  const language = useAppStore((state) => state.language);
  const hydrateLanguage = useAppStore((state) => state.hydrateLanguage);

  useEffect(() => {
    const resolved = parseLang(readCookieLang() ?? loadPreferences().lang);
    if (resolved !== useAppStore.getState().language) {
      hydrateLanguage(resolved);
    }
  }, [hydrateLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return null;
}
