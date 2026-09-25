import type { InfoTheme } from '@ciszu/ui';

/**
 * Tema canónico de las páginas de contenido de CiszuBot.
 *
 * Un solo acento (neon-blue → neon-purple) para que heros, tarjetas, pasos y
 * CTAs de todas las páginas compartan la misma identidad visual. Cualquier
 * página nueva de contenido debe importar este tema en vez de declarar uno
 * propio.
 */
export const INFO_THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};
