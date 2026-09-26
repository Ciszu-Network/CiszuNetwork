'use client';

import { useAppStore } from '@/store';
import { getDict, parseLang, type Dict } from '@/lib/i18n';

/**
 * Diccionario del idioma activo, reactivo al store.
 *
 * Uso: `const t = useT();` y luego `t.pages.library.title`. El idioma vive en
 * `useAppStore` (se hidrata desde las preferencias locales), así que los
 * componentes cliente no necesitan recibir el dict por props.
 */
export function useT(): Dict {
  const lang = useAppStore((state: { lang: string }) => state.lang);
  return getDict(parseLang(lang));
}
