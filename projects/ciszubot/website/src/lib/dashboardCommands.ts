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
  starboard: {
    title: 'Comandos de starboard',
    commands: byNames(['starboard']),
    note: 'Configura canal, emoji y mínimo de reacciones; el bot destaca solo los mensajes que lleguen al mínimo.',
  },
  nitro: {
    title: 'Comandos de emojis Nitro',
    commands: byNames(['nitro']),
    note: 'Reenvía por webhook los emojis externos para que se vean sin Nitro.',
  },
  staff: {
    title: 'Comandos de staff',
    commands: byNames(['staff', 'automod', 'cooldown', 'addmoney', 'removemoney']),
    note: 'El rol de staff puede usar todos los comandos de gestión; los admins siempre pueden.',
  },
  stats: {
    title: 'Comandos de stats',
    commands: byNames(['counters', 'serverinfo', 'stats']),
    note: 'Los contadores se actualizan al entrar/salir gente; también puedes ver datos con cz!serverinfo.',
  },
  goodbye: {
    title: 'Comandos de despedidas',
    commands: byNames(['goodbye']),
    note: 'Variables: {user} {username} {guild} {members}.',
  },
  vcs: {
    title: 'Comandos de VCs privados',
    commands: byNames(['privatevc', 'closeprivate']),
    note: 'Hub de voz + panel: bloquear, ocultar, renombrar, límite y eliminar.',
  },
  counting: {
    title: 'Comandos del contador',
    commands: byNames(['contador']),
    note: 'cz!contador muestra el estado; cz!contador reset reinicia y cz!contador iniciar anuncia el arranque (staff).',
  },
  suggestions: {
    title: 'Comandos de sugerencias',
    commands: byNames(['suggest']),
    note: 'cz!suggest <texto> envía; cz!suggest aprobar/cancelar <id> [razón] decide (staff). Los votos son con botones 👍/👎.',
  },
  polls: {
    title: 'Comandos de encuestas',
    commands: byNames(['poll']),
    note: 'cz!poll <pregunta> | opción 1 | opción 2 [--anon] [--tiempo 30m]; cz!poll cerrar <id> (autor/staff).',
  },
  trivia: {
    title: 'Comandos de trivia',
    commands: byNames(['trivia']),
    note: 'cz!trivia [facil|media|dificil|mixta] inicia; cz!trivia top muestra el ranking; cz!trivia add <pregunta> | resp1 | resp2 agrega preguntas (staff).',
  },
  invites: {
    title: 'Comandos de invitaciones',
    commands: byNames(['invites']),
    note: 'Puntos por invitar, top y recompensas por umbral.',
  },
  messages: {
    title: 'Say / DirectSay',
    commands: byNames(['say', 'directsay', 'text']),
    note: 'Desde aquí el mensaje se envía por el bot (cola de acciones, ~5s). say usa embed; directsay es plano.',
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
