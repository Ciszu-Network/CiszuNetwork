'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import type { Dict, Lang } from '@/lib/i18n';

interface I18nContextValue {
  lang: Lang;
  dict: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Provee el diccionario del idioma activo (resuelto en el servidor desde la
 * cookie `ciszu_lang`) a los componentes cliente. El cambio de idioma recarga
 * la página, así que el valor servidor y el cliente nunca divergen.
 */
export function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: Lang;
  dict: Dict;
  children: ReactNode;
}) {
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
