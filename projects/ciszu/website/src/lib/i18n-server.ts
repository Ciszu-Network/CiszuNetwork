import { cookies } from 'next/headers';
import { getDict, parseLang, LANG_COOKIE, type Dict, type Lang } from './i18n';

/**
 * Diccionario del idioma activo en el servidor.
 *
 * La web resuelve el idioma con la cookie `ciszu_lang` (la escribe el selector
 * de idioma del cliente). Antes solo la leía el layout raíz, así que las páginas
 * seguían en español pasara lo que pasara: cualquier página de servidor que
 * quiera ser multiidioma usa este helper.
 */
export async function getServerI18n(): Promise<{ lang: Lang; t: Dict }> {
  const store = await cookies();
  const lang = parseLang(store.get(LANG_COOKIE)?.value);
  return { lang, t: getDict(lang) };
}
