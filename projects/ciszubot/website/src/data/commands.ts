/**
 * Catálogo de comandos de CiszuBot para la web.
 *
 * La LISTA de comandos ya NO se escribe a mano: vive en `commands.generated.ts`
 * y se genera desde el código real del bot con `node scripts/sync-bot-commands.mjs`.
 * Este archivo solo aporta la capa de presentación (colores, referencias,
 * ejemplos y relaciones entre comandos).
 */
import { COMMANDS, CATEGORIES } from './commands.generated';

export type { CommandInfo } from './commands.generated';
export { COMMANDS, CATEGORIES } from './commands.generated';

/** Categoría de un comando (libre: proviene del código real del bot). */
export type CommandCategory = string;

export const CATEGORY_ICONS: Record<string, string> = {
  'Diversión': 'gamepad',
  'Economía': 'money',
  'Información': 'info',
  'Música': 'music',
  'Niveles': 'star',
  'Social': 'people',
  'Presentación': 'user',
  'Utilidad': 'settings',
  'Moderación': 'shield',
  'Configuración': 'settings',
  'Búsqueda': 'search',
  'Secreto': 'lock',
  'General': 'help',
  '+18': 'triangle-exclamation',
};

/**
 * Color de acento por comando. Cada comando recibe un tono propio usando el
 * ángulo áureo (137.5°) sobre el círculo cromático: así dos comandos
 * consecutivos nunca comparten color y el catálogo se lee como una galería
 * multicolor, igual que las categorías de los certificados.
 */
export const COMMAND_COLORS: Record<string, string> = Object.fromEntries(
  COMMANDS.map((cmd, index) => [cmd.name, `hsl(${Math.round((index * 137.508) % 360)} 72% 62%)`]),
);

/** Identidad de color por categoría (chips, cabeceras y filtros). */
export const CATEGORY_COLORS: Record<string, string> = {
  'Diversión': '#f472b6',
  'Economía': '#facc15',
  'Información': '#60a5fa',
  'Música': '#a855f7',
  'Niveles': '#34d399',
  'Social': '#22d3ee',
  'Presentación': '#f59e0b',
  'Utilidad': '#fb923c',
  'Moderación': '#ef4444',
  'Configuración': '#94a3b8',
  'Búsqueda': '#818cf8',
  'Secreto': '#6b7280',
  'General': '#94a3b8',
  '+18': '#f43f5e',
};

/** Sigla de cada categoría para la referencia de catálogo. */
const CATEGORY_CODE: Record<string, string> = {
  'Diversión': 'FUN',
  'Economía': 'ECO',
  'Información': 'INF',
  'Música': 'MUS',
  'Niveles': 'LVL',
  'Social': 'SOC',
  'Presentación': 'PRE',
  'Utilidad': 'UTL',
  'Moderación': 'MOD',
  'Configuración': 'CFG',
  'Búsqueda': 'BQS',
  'Secreto': 'SEC',
  'General': 'GEN',
  '+18': 'NSF',
};

/**
 * Referencia interna de catálogo por comando: `CZB-<CAT>-<NNN>`, determinista
 * (estable mientras no cambie la categoría ni el orden de la lista). Sirve para
 * citar cada comando sin ambigüedad, igual que `CKO-...` en los certificados.
 */
export const COMMAND_REFS: Record<string, string> = (() => {
  const counters = new Map<string, number>();
  const refs: Record<string, string> = {};
  for (const cmd of COMMANDS) {
    const base = CATEGORY_CODE[cmd.category] ?? 'GEN';
    const n = (counters.get(base) ?? 0) + 1;
    counters.set(base, n);
    refs[cmd.name] = `CZB-${base}-${String(n).padStart(3, '0')}`;
  }
  return refs;
})();

export const commandAccent = (cmd: { name: string }): string => COMMAND_COLORS[cmd.name] ?? '#94a3b8';
export const categoryColor = (cat: string): string => CATEGORY_COLORS[cat] ?? '#94a3b8';
export const commandRef = (cmd: { name: string }): string => COMMAND_REFS[cmd.name] ?? cmd.name;

/**
 * Valores de muestra para convertir una sintaxis (`cz!say <mensaje>`) en un
 * ejemplo listo para copiar (`cz!say ¡Hola a todos!`). Se resuelve por palabra
 * clave del marcador para no inventar datos por comando.
 */
const SAMPLE_VALUES: { test: RegExp; value: string }[] = [
  { test: /piedra|papel|tijeras/i, value: 'piedra' },
  { test: /cat\|dog|animal/i, value: 'cat' },
  { test: /premio/i, value: 'Nitro 1 mes' },
  { test: /ganadores/i, value: '1' },
  { test: /canci[oó]n|music|url/i, value: 'Never Gonna Give You Up' },
  { test: /pregunta|[oó]rculo|oraculo/i, value: '¿Lloverá hoy?' },
  { test: /consulta|buscar|b[uú]squeda|search|texto/i, value: 'Ciszu Network' },
  { test: /t[ií]tulo/i, value: 'Título del anuncio' },
  { test: /descripci[oó]n/i, value: 'Descripción del anuncio' },
  { test: /color/i, value: '#22d3ee' },
  { test: /estilo/i, value: 'uwu' },
  { test: /invite del servidor|invitaci[oó]n/i, value: 'discord.gg/abc123' },
  { test: /@usuario|usuario|miembro/i, value: '@Ciszuko' },
  { test: /canal|#canal|#canal-panel/i, value: '#general' },
  { test: /@rol/i, value: '@Miembro' },
  { test: /prefijo|prefix/i, value: '!' },
  { test: /es\|en|idioma|lang/i, value: 'es' },
  { test: /raz[oó]n|motivo/i, value: 'Incumplir las normas' },
  { test: /off|on/i, value: 'on' },
  { test: /cantidad|minutos|n[uú]mero|min\b/i, value: '100' },
  { test: /nombre del [ií]tem|ítem|item/i, value: 'Rol VIP' },
  { test: /nombre-\{n\}|nombre/i, value: 'Miembros: {n}' },
  { test: /tipo/i, value: 'members' },
  { test: /\bid\b/i, value: '123456789012345678' },
];

/** Sustituye los marcadores `<...>` de una sintaxis por valores de ejemplo. */
export function usageExample(usage: string): string {
  return usage.replace(/<([^>]+)>/g, (_match, token: string) => {
    const hit = SAMPLE_VALUES.find((sample) => sample.test.test(token));
    return hit ? hit.value : 'valor';
  });
}

/** Comandos relacionados: misma categoría primero, luego mismo icono/uso. */
export function relatedCommands<T extends { name: string; category: string; icon: string }>(cmd: T, limit = 4): T[] {
  const sameCategory = COMMANDS.filter((c) => c.name !== cmd.name && c.category === cmd.category) as unknown as T[];
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const extra = COMMANDS.filter(
    (c) => c.name !== cmd.name && c.category !== cmd.category && c.icon === cmd.icon,
  ) as unknown as T[];
  return [...sameCategory, ...extra].slice(0, limit);
}
