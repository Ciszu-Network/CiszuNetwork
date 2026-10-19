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
  { slug: 'minigame_dice', label: 'Minijuego: dado', commands: ['dice'] },
  { slug: 'minigame_rps', label: 'Minijuego: piedra papel tijeras', commands: ['rps'] },
  { slug: 'minigame_rate', label: 'Minijuego: rate', commands: ['rate'] },
  { slug: 'minigame_8ball', label: 'Minijuego: bola 8', commands: ['8ball'] },
  { slug: 'economy', label: 'Economía', categories: ['Economía'] },
  { slug: 'giveaways', label: 'Sorteos (giveaways)', commands: ['giveaway', 'gend'] },
  { slug: 'counting', label: 'Contador', commands: ['contador'] },
  { slug: 'suggestions', label: 'Sugerencias', commands: ['suggest'] },
  { slug: 'polls', label: 'Encuestas', commands: ['poll'] },
  { slug: 'embeds', label: 'Embeds personalizados', commands: ['embed'] },
  // Social: solo perfiles/AFK/casamiento (alianzas e invitaciones van aparte).
  { slug: 'social_afk', label: 'AFK', commands: ['afk'] },
  { slug: 'social_marriage', label: 'Casamiento', commands: ['marry', 'divorce', 'partner'] },
  { slug: 'social', label: 'Social (perfiles)', commands: ['afk', 'marry', 'divorce', 'partner', 'profile'] },
  // Utilidad: sub-opciones por herramienta.
  { slug: 'util_profile', label: 'Perfiles', commands: ['profile'] },
  { slug: 'util_avatar', label: 'Avatar', commands: ['avatar'] },
  { slug: 'util_animal', label: 'Animales', commands: ['animal'] },
  { slug: 'util_serverinfo', label: 'Info del servidor', commands: ['serverinfo'] },
  { slug: 'util_snipe', label: 'Snipe', commands: ['snipe'] },
  { slug: 'util_text', label: 'Texto', commands: ['text'] },
  { slug: 'utility', label: 'Utilidad', categories: ['Utilidad'] },
  // Misceláneo: sub-opciones (say/directsay ya son la sección Decir).
  { slug: 'misc_confess', label: 'Confesiones', commands: ['confess'] },
  { slug: 'misc_hi', label: 'Saludos (hi)', commands: ['hi'] },
  { slug: 'misc_bye', label: 'Despedidas (bye)', commands: ['bye'] },
  { slug: 'misc_test', label: 'Test', commands: ['test'] },
  { slug: 'misc', label: 'Misceláneo', commands: ['confess', 'hi', 'bye', 'test'] },
  { slug: 'help', label: 'Información (ayuda)', categories: ['Información'] },
  { slug: 'moderation', label: 'Moderación', categories: ['Moderación'] },
  { slug: 'setup', label: 'Configuración', categories: ['Configuración'] },
  { slug: 'levels', label: 'Niveles', categories: ['Niveles'] },
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

/** Etiqueta legible de un flag (para embeds de error). */
export function featureLabel(slug: string): string | null {
  return FEATURE_DEFS.find((d) => d.slug === slug)?.label ?? null;
}
