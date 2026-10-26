'use client';

import { useEffect, useState } from 'react';
import { getDict, hasCookieLang, readCookieLang, parseLang, type Dict, type Lang } from '@/lib/i18n';
import { loadPreferences } from '@/lib/preferences';

/**
 * Idioma real resuelto en cliente (Fase 3 — STATIC_MIGRATION_PLAN §4.4).
 *
 * El layout raíz ya no lee `cookies()`: el SSR sale siempre en la base
 * `es-latam` y este hook aplica el idioma elegido tras montar, sin romper la
 * hidratación. Orden: cookie `ciszubot_lang` → localStorage → base.
 */
export function useClientI18n(): { lang: Lang; dict: Dict } {
  const [lang, setLang] = useState<Lang>('es-latam');

  useEffect(() => {
    setLang(hasCookieLang() ? readCookieLang() : parseLang(loadPreferences().lang));
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return { lang, dict: getDict(lang) };
}
