import type { BotCommand } from '../types/command';

/**
 * Definición de las funciones (features) controlables desde la devcon.
 *
 * Cada flag cubre una categoría completa de comandos o comandos concretos
 * (los comandos concretos tienen prioridad). `premium` marca las funciones
 * sujetas al sistema Premium (beta ⇒ gratis; al salir de beta ⇒ bloqueo real).
 */
export interface FeatureDef {
  slug: string;
  label: string;
  /** Categorías de comandos cubiertas por el flag. */
  categories?: string[];
  /** Comandos concretos (prioridad sobre categorías). */
  commands?: string[];
  /** true = función premium (sujeta a beta/suscripción). */
  premium?: boolean;
}

export const FEATURE_DEFS: FeatureDef[] = [
  { slug: 'music', label: 'Música', categories: ['Música'], premium: true },
  { slug: 'search', label: 'Búsqueda', commands: ['search'], premium: true },
  { slug: 'minigames', label: 'Minijuegos', categories: ['Diversión'] },
  { slug: 'economy', label: 'Economía', categories: ['Economía'] },
  { slug: 'help', label: 'Información (ayuda)', categories: ['Información'] },
  { slug: 'utility', label: 'Utilidad', categories: ['Utilidad'] },
  { slug: 'moderation', label: 'Moderación', categories: ['Moderación'] },
  { slug: 'setup', label: 'Configuración', categories: ['Configuración'] },
  { slug: 'levels', label: 'Niveles', categories: ['Niveles'] },
  { slug: 'social', label: 'Social', categories: ['Social'] },
];

/** Fila especial de feature_flags que controla la beta premium. */
export const PREMIUM_BETA_FLAG = 'premium_beta';

/** Comandos premium individuales (además de los flags con `premium: true`). */
export const PREMIUM_COMMANDS = new Set(['embed']);

type CommandLike = Pick<BotCommand, 'name' | 'category'>;

/** Slug del flag que cubre un comando (comando concreto primero, luego categoría). */
export function resolveFeatureForCommand(cmd: CommandLike): string | null {
  for (const def of FEATURE_DEFS) {
    if (def.commands?.includes(cmd.name)) return def.slug;
  }
  for (const def of FEATURE_DEFS) {
    if (def.categories?.includes(cmd.category)) return def.slug;
  }
  return null;
}

/** ¿El comando es premium? (flag con premium o lista de comandos premium). */
export function isPremiumCommand(cmd: CommandLike): boolean {
  if (PREMIUM_COMMANDS.has(cmd.name)) return true;
  const slug = resolveFeatureForCommand(cmd);
  return slug !== null && Boolean(FEATURE_DEFS.find((d) => d.slug === slug)?.premium);
}
