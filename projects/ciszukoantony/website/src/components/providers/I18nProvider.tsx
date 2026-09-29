'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getDict, parseLang, type Dict, type Lang } from '@/lib/i18n';

const LANG_COOKIE = 'ciszu_lang';

/**
 * Idioma real resuelto en cliente (Fase 3 — STATIC_MIGRATION_PLAN §4.4).
 * Orden: cookie `ciszu_lang` (la escribe `savePreferences`) → localStorage →
 * idioma base que recibe el provider desde el layout (SSR). El primer render
 * coincide con el HTML del servidor y el idioma se aplica tras montar.
 */
function resolveClientLang(fallback: Lang): Lang {
  if (typeof document === 'undefined') return fallback;
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]+)`));
    if (match?.[1]) return parseLang(decodeURIComponent(match[1]));
  } catch {
    // cookie no accesible — se intenta localStorage
  }
  try {
    const raw = window.localStorage.getItem('ciszu_preferences');
    if (raw) return parseLang((JSON.parse(raw) as { lang?: string }).lang);
  } catch {
    // storage no disponible — se mantiene el fallback
  }
  return fallback;
}

interface I18nContextValue {
  lang: Lang;
  dict: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Provee el diccionario del idioma activo a los componentes cliente.
 *
 * El layout raíz ya no lee `cookies()`: siempre pasa la base `es-latam`, y este
 * provider resuelve la cookie en cliente y actualiza `document.documentElement.lang`.
 */
export function I18nProvider({
  lang: initialLang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const dict = getDict(lang);

  useEffect(() => {
    setLang(resolveClientLang(initialLang));
  }, [initialLang]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return <I18nContext.Provider value={{ lang, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n debe usarse dentro de <I18nProvider>');
  }
  return value;
}

/** Atajo: solo el diccionario. */
export function useDict(): Dict {
  return useI18n().dict;
}
