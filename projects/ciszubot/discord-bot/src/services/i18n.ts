import { getGuildConfig } from './configService';

/**
 * i18n del bot: todo lo que el bot MUESTRA se traduce según el idioma del
 * servidor (cfg.lang: 'es' | 'en'). Lo que el bot ENTIENDE (alias, argumentos)
 * sigue siendo multiidioma por diseño (acepta ambos).
 *
 * Patrón en comandos:
 *   const L = await langOf(message);
 *   await message.reply(tr(L, '❌ Uso: `cz!x`', '❌ Usage: `cz!x`'));
 *
 * Patrón en listeners/servicios (con cfg en scope):
 *   tr(cfg.lang, '...', '...')
 */

export type Lang = 'es' | 'en';

/** Devuelve el texto en el idioma pedido (default: español). */
export function tr(lang: string | null | undefined, es: string, en: string): string {
  return lang === 'en' ? en : es;
}

/** Idioma configurado del servidor del mensaje (default 'es'). */
export async function langOf(message: { guild?: { id: string } | null }): Promise<Lang> {
  if (!message.guild) return 'es';
  try {
    const cfg = await getGuildConfig(message.guild.id);
    return cfg.lang === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}
