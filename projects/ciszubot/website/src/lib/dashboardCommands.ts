import { COMMANDS } from '@/data/commands';
import type { HelpCommand } from '@/components/dashboard/QuickHelp';

/**
 * Catálogo de ayuda por sección del dashboard: qué comandos pertenecen a cada
 * opción/subopción y para qué sirven. Se deriva del catálogo REAL del bot
 * (commands.generated.ts) — si un comando no existe, no aparece.
 */

const byNames = (names: string[]): HelpCommand[] =>
  names
    .map((n) => COMMANDS.find((c) => c.name === n))
    .filter((c): c is (typeof COMMANDS)[number] => Boolean(c))
    .map((c) => ({ name: c.name, description: c.description, premium: c.premium }));

const byCategory = (cat: string): HelpCommand[] =>
  COMMANDS.filter((c) => c.category === cat).map((c) => ({ name: c.name, description: c.description, premium: c.premium }));

export interface SectionHelp {
  title: string;
  commands: HelpCommand[];
  note?: string;
}

export const SECTION_HELP: Record<string, SectionHelp> = {
  general: {
    title: 'Comandos generales',
    commands: byNames(['setprefix', 'setlang', 'help', 'ping', 'status']),
    note: 'El prefijo por defecto es cz! — los slash (/) también funcionan siempre.',
  },
  levels: {
    title: 'Comandos de niveles',
    commands: byNames(['levelconfig', 'rank', 'topxp', 'leaderboard']),
    note: 'levelconfig configura el sistema; rank y topxp consultan el progreso.',
  },
  welcome: {
    title: 'Comandos de bienvenidas',
    commands: byNames(['welcome', 'goodbye', 'invites']),
    note: 'Variables del mensaje: {user} {username} {guild} {members}.',
  },
  extras: {
    title: 'Comandos de tickets y extras',
    commands: byNames(['logs', 'counters', 'privatevc', 'nitro', 'staff', 'tickets']),
    note: 'Los canales privados usan un hub de voz: al unirte se crea tu canal con panel.',
  },
  economy: {
    title: 'Comandos de economía',
    commands: byCategory('Economía'),
    note: 'La moneda del servidor se cambia con cz!coin; los drops se configuran con cz!drops.',
  },
  community: {
    title: 'Comandos de comunidad',
    commands: byNames(['starboard', 'invites', 'marry', 'divorce', 'partner', 'nitro', 'afk']),
    note: 'Starboard destaca mensajes; invites premia a quien invita.',
  },
  automod: {
    title: 'Comandos de moderación',
    commands: [...byNames(['automod', 'cooldown']), ...byCategory('Moderación')],
    note: 'El automod borra el mensaje y avisa; los cooldowns aplican "espera X segundos".',
  },
  alliance: {
    title: 'Comandos de alianzas',
    commands: byNames(['alliance', 'invites']),
    note: 'cz!alliance configura el sistema (canal, rol, filtros, sanciones, recompensas); el leaderboard es cz!alliance top.',
  },
  tickets: {
    title: 'Comandos de tickets',
    commands: byNames(['tickets', 'closechannels', 'logs']),
    note: 'Publica el panel con cz!tickets panel; edita categorías con cz!tickets cat <id> ...',
  },
  music: { title: 'Comandos de música', commands: byCategory('Música'), note: 'Función Premium (gratis durante la beta).' },
  search: { title: 'Comandos de búsqueda', commands: byCategory('Búsqueda'), note: 'Función Premium (gratis durante la beta).' },
  minigames: { title: 'Comandos de diversión', commands: byCategory('Diversión') },
  help: {
    title: 'Comandos de información',
    commands: byNames(['help', 'links', 'web', 'premium', 'invite', 'vote', 'donate', 'status', 'promo', 'bump']),
  },
  utility: {
    title: 'Comandos de utilidad',
    commands: byNames(['profile', 'serverinfo', 'avatar', 'snipe', 'text', 'embed', 'animal', 'test']),
  },
  moderation: { title: 'Comandos de moderación', commands: byCategory('Moderación') },
  setup: {
    title: 'Comandos de configuración',
    commands: byNames(['setprefix', 'setlang', 'logs', 'counters', 'staff', 'privatevc', 'welcome', 'goodbye']),
  },
  social: { title: 'Comandos sociales', commands: byCategory('Social') },
};
