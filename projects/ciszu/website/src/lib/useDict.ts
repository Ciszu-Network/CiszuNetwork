'use client';

import { getDict } from './i18n';
import { useAppStore } from '@/store';

/**
 * Diccionario del idioma activo en componentes de cliente.
 *
 * El idioma vive en el store (persistido en localStorage y sincronizado con la
 * cookie `ciszu_lang` al cambiarlo), así que el cliente y el servidor pintan el
 * mismo idioma tras la recarga voluntaria.
 */
export function useDict() {
  const language = useAppStore((state) => state.language);
  return getDict(language);
}
