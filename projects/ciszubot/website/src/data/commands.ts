export interface CommandInfo {
  name: string;
  description: string;
  aliases: string[];
  usage: string;
  category:
    | 'Diversión'
    | 'Economía'
    | 'Información'
    | 'Música'
    | 'Niveles'
    | 'Social'
    | 'Utilidad'
    | 'Moderación'
    | 'Configuración';
  icon: string;
}

export const COMMANDS: CommandInfo[] = [
  // ─── Diversión ───
  {
    name: 'say',
    description: 'Hace que el bot repita tu mensaje en un embed',
    aliases: ['decir', 'di', 'pronunciar', 'repetir', 's', 'repeat'],
    usage: 'cz!say <mensaje>',
    category: 'Diversión',
    icon: 'message',
  },
  {
    name: 'directsay',
    description: 'Hace que el bot repita tu mensaje directamente sin embed',
    aliases: ['decirdirecto', 'deds', 'dsay', 'ds', 'repeatdirect'],
    usage: 'cz!directsay <mensaje>',
    category: 'Diversión',
    icon: 'comment',
  },
  {
    name: 'confess',
    description: 'Envía un mensaje anónimo y borra tu mensaje original',
    aliases: ['confesar', 'anonimo', 'secreto', 'c', 'confession'],
    usage: 'cz!confess <mensaje>',
    category: 'Diversión',
    icon: 'lock',
  },
  {
    name: '8ball',
    description: 'Responde a tus preguntas con la sabiduría de la bola 8',
    aliases: ['bola8', 'pregunta', 'oraculo', '8b', 'magicball'],
    usage: 'cz!8ball <pregunta>',
    category: 'Diversión',
    icon: 'star',
  },
  {
    name: 'dice',
    description: 'Lanza un dado (1-6)',
    aliases: ['dado', 'roll'],
    usage: 'cz!dice',
    category: 'Diversión',
    icon: 'gamepad',
  },
  {
    name: 'rps',
    description: 'Piedra, papel o tijeras contra el bot',
    aliases: ['ppt', 'piedrapapelotijeras'],
    usage: 'cz!rps <piedra|papel|tijeras>',
    category: 'Diversión',
    icon: 'gamepad',
  },
  {
    name: 'rate',
    description: 'Cuánto te quiere el bot (0-100%)',
    aliases: ['cuan'],
    usage: 'cz!rate [categoria]',
    category: 'Diversión',
    icon: 'heart',
  },
  {
    name: 'text',
    description: 'Convierte texto con estilos (reverse, uwu, clap, bubble)',
    aliases: ['convertir', 'estilo', 'textoconvert'],
    usage: 'cz!text <estilo> <texto>',
    category: 'Diversión',
    icon: 'edit',
  },
  {
    name: 'avatar',
    description: 'Muestra el avatar de un usuario',
    aliases: ['foto', 'pic', 'imagen'],
    usage: 'cz!avatar [@usuario]',
    category: 'Diversión',
    icon: 'user',
  },
  {
    name: 'animal',
    description: 'Muestra una foto aleatoria de un animal (cat, dog, fox, duck)',
    aliases: ['gato', 'perro', 'zorro', 'pato', 'mascota'],
    usage: 'cz!animal <cat|dog|fox|duck>',
    category: 'Diversión',
    icon: 'heart',
  },
  {
    name: 'snipe',
    description: 'Recupera el último mensaje borrado del canal',
    aliases: ['snipear'],
    usage: 'cz!snipe',
    category: 'Diversión',
    icon: 'message',
  },
  // ─── Economía ───
  {
    name: 'balance',
    description: 'Muestra tu saldo (monedas y banco)',
    aliases: ['bal', 'saldo', 'coins'],
    usage: 'cz!balance [@usuario]',
    category: 'Economía',
    icon: 'money',
  },
  {
    name: 'daily',
    description: 'Reclama tu recompensa diaria',
    aliases: ['recompensa', 'día'],
    usage: 'cz!daily',
    category: 'Economía',
    icon: 'clock',
  },
  {
    name: 'give',
    description: 'Transfiere monedas a otro usuario',
    aliases: ['pay', 'transfer', 'enviar', 'dar'],
    usage: 'cz!give @usuario <cantidad>',
    category: 'Economía',
    icon: 'share',
  },
  {
    name: 'gamble',
    description: 'Aposta monedas a cara o cruz',
    aliases: ['apostar', 'coinflip', 'caraocruz', 'flip'],
    usage: 'cz!gamble <cantidad>',
    category: 'Economía',
    icon: 'star',
  },
  {
    name: 'slot',
    description: 'Máquina tragaperras',
    aliases: ['slots', 'tragaperras'],
    usage: 'cz!slot <cantidad>',
    category: 'Economía',
    icon: 'gamepad',
  },
  {
    name: 'deposit',
    description: 'Guarda monedas en el banco',
    aliases: ['depositar', 'bank', 'banco'],
    usage: 'cz!deposit <cantidad|all>',
    category: 'Economía',
    icon: 'money',
  },
  {
    name: 'withdraw',
    description: 'Retira monedas del banco',
    aliases: ['retirar', 'withdrawall', 'retiro'],
    usage: 'cz!withdraw <cantidad|all>',
    category: 'Economía',
    icon: 'money',
  },
  {
    name: 'leaderboard',
    description: 'Top 10 de monedas del servidor',
    aliases: ['top', 'ranking', 'tabla'],
    usage: 'cz!leaderboard',
    category: 'Economía',
    icon: 'server',
  },
  {
    name: 'shop',
    description: 'Tienda del servidor con ítems por rol',
    aliases: ['tienda', 'store'],
    usage: 'cz!shop',
    category: 'Economía',
    icon: 'gift',
  },
  {
    name: 'buy',
    description: 'Compra un ítem de la tienda',
    aliases: ['comprar'],
    usage: 'cz!buy <nombre del ítem>',
    category: 'Economía',
    icon: 'gift',
  },
  // ─── Niveles ───
  {
    name: 'rank',
    description: 'Muestra tu nivel y XP',
    aliases: ['nivel', 'level', 'xp'],
    usage: 'cz!rank [@usuario]',
    category: 'Niveles',
    icon: 'star',
  },
  {
    name: 'topxp',
    description: 'Top 10 de niveles del servidor',
    aliases: ['toppniveles', 'rankingxp'],
    usage: 'cz!topxp',
    category: 'Niveles',
    icon: 'server',
  },
  // ─── Música ───
  {
    name: 'play',
    description: 'Reproduce música de YouTube en un canal de voz',
    aliases: ['p', 'reproducir', 'music'],
    usage: 'cz!play <canción o URL>',
    category: 'Música',
    icon: 'music',
  },
  {
    name: 'skip',
    description: 'Salta la canción actual',
    aliases: ['next', 'siguiente'],
    usage: 'cz!skip',
    category: 'Música',
    icon: 'music',
  },
  {
    name: 'queue',
    description: 'Muestra la cola de reproducción',
    aliases: ['cola', 'q'],
    usage: 'cz!queue',
    category: 'Música',
    icon: 'music',
  },
  {
    name: 'stop',
    description: 'Detiene la música y sale del canal de voz',
    aliases: ['parar', 'leave', 'salir'],
    usage: 'cz!stop',
    category: 'Música',
    icon: 'close',
  },
  {
    name: 'loop',
    description: 'Activa/desactiva el bucle de la cola',
    aliases: ['bucle', 'repeat'],
    usage: 'cz!loop',
    category: 'Música',
    icon: 'music',
  },
  {
    name: 'pause',
    description: 'Pausa la reproducción',
    aliases: ['pausar'],
    usage: 'cz!pause',
    category: 'Música',
    icon: 'music',
  },
  {
    name: 'resume',
    description: 'Reanuda la reproducción',
    aliases: ['reanudar'],
    usage: 'cz!resume',
    category: 'Música',
    icon: 'music',
  },
  // ─── Información ───
  {
    name: 'help',
    description: 'Muestra información del bot y la lista de comandos disponibles',
    aliases: ['ayuda', 'comandos', 'botinfo', 'cmds', 'cmd'],
    usage: 'cz!help [comando]',
    category: 'Información',
    icon: 'help',
  },
  {
    name: 'ping',
    description: 'Muestra el ping del bot con "pong"',
    aliases: ['latencia', 'ms', 'pingpong', 'p'],
    usage: 'cz!ping',
    category: 'Información',
    icon: 'wifi',
  },
  {
    name: 'profile',
    description: 'Muestra información detallada del usuario',
    aliases: ['perfil', 'usuario', 'userinfo', 'u'],
    usage: 'cz!profile [@usuario]',
    category: 'Información',
    icon: 'user',
  },
  {
    name: 'serverinfo',
    description: 'Muestra información detallada del servidor',
    aliases: ['servidor', 'infoserver', 'guild', 'server', 'guildinfo'],
    usage: 'cz!serverinfo',
    category: 'Información',
    icon: 'server',
  },
  {
    name: 'status',
    description: 'Muestra el estado en vivo del bot y su web',
    aliases: ['stats', 'estado', 'info', 'botinfo', 'uptime'],
    usage: 'cz!status',
    category: 'Información',
    icon: 'verified',
  },
  {
    name: 'links',
    description: 'Muestra todos los enlaces oficiales del ecosistema',
    aliases: ['enlaces', 'link', 'links', 'social', 'sociales', 'redes'],
    usage: 'cz!links',
    category: 'Información',
    icon: 'key',
  },
  {
    name: 'search',
    description: 'Busca resultados en Google',
    aliases: ['google', 'buscar', 'g'],
    usage: 'cz!search <consulta>',
    category: 'Información',
    icon: 'globe',
  },
  // ─── Social ───
  {
    name: 'hi',
    description: 'Saluda al usuario con un mensaje amigable',
    aliases: ['hola', 'saludar', 'saludo', 'hello', 'hey', 'hihi', 'h'],
    usage: 'cz!hi',
    category: 'Social',
    icon: 'hand',
  },
  {
    name: 'bye',
    description: 'Se despide del usuario con un mensaje amigable',
    aliases: ['adios', 'despedir', 'despedida', 'chao', 'byebye', 'b'],
    usage: 'cz!bye',
    category: 'Social',
    icon: 'flag',
  },
  {
    name: 'afk',
    description: 'Márquese como AFK con una razón',
    aliases: ['ausente'],
    usage: 'cz!afk <razón>',
    category: 'Social',
    icon: 'clock',
  },
  {
    name: 'alliance',
    description: 'Forma una alianza con otro servidor',
    aliases: ['alianza'],
    usage: 'cz!alliance <invite del servidor>',
    category: 'Social',
    icon: 'people',
  },
  {
    name: 'allies',
    description: 'Muestra las alianzas del servidor',
    aliases: ['alianzas'],
    usage: 'cz!allies',
    category: 'Social',
    icon: 'people',
  },
  {
    name: 'closeprivate',
    description: 'Cierra tu canal privado',
    aliases: ['cerrarprivado'],
    usage: 'cz!closeprivate',
    category: 'Social',
    icon: 'lock',
  },
  // ─── Utilidad ───
  {
    name: 'test',
    description: 'Comando de prueba para verificar el funcionamiento del bot',
    aliases: ['prueba', 'testear', 'verificar', 't', 'check'],
    usage: 'cz!test',
    category: 'Utilidad',
    icon: 'check',
  },
  {
    name: 'bump',
    description: 'Bumpea y promociona el servidor en las listas de Discord',
    aliases: ['bumpear', 'promocionar', 'boost', 'topgg'],
    usage: 'cz!bump',
    category: 'Utilidad',
    icon: 'share',
  },
  {
    name: 'promo',
    description: 'Promociona las webs del ecosistema Ciszu Network',
    aliases: ['promocionar', 'webs', 'sitio', 'web', 'promote'],
    usage: 'cz!promo',
    category: 'Utilidad',
    icon: 'globe',
  },
  {
    name: 'invite',
    description: 'Obtén el enlace de invitación del bot',
    aliases: ['invitar', 'añadir', 'add', 'agregar', 'invitacion'],
    usage: 'cz!invite',
    category: 'Utilidad',
    icon: 'external',
  },
  {
    name: 'vote',
    description: 'Vota por CiszuBot en las listas de bots',
    aliases: ['votar', 'voto', 'votación', 'votacion'],
    usage: 'cz!vote',
    category: 'Utilidad',
    icon: 'star',
  },
  {
    name: 'donate',
    description: 'Apoya el desarrollo del bot con una donación',
    aliases: ['donar', 'donación', 'donacion', 'apoyo', 'support', 'patreon', 'kofi', 'ko-fi'],
    usage: 'cz!donate',
    category: 'Utilidad',
    icon: 'heart',
  },
  {
    name: 'giveaway',
    description: 'Crea un sorteo con recompensa de reacción',
    aliases: ['sorteo', 'gstart'],
    usage: 'cz!giveaway <premio> | <ganadores> | <min>',
    category: 'Utilidad',
    icon: 'gift',
  },
  {
    name: 'gend',
    description: 'Fuerza el fin de un sorteo activo',
    aliases: ['gfinish'],
    usage: 'cz!gend',
    category: 'Utilidad',
    icon: 'gift',
  },
  {
    name: 'embed',
    description: 'Crea un embed personalizado',
    aliases: ['createembed'],
    usage: 'cz!embed <título> | <descripción> | <color>',
    category: 'Utilidad',
    icon: 'edit',
  },
  // ─── Moderación ───
  {
    name: 'kick',
    description: 'Expulsa a un miembro del servidor',
    aliases: ['expulsar'],
    usage: 'cz!kick @usuario [razón]',
    category: 'Moderación',
    icon: 'shield',
  },
  {
    name: 'ban',
    description: 'Banea a un miembro del servidor',
    aliases: ['banear'],
    usage: 'cz!ban @usuario [razón]',
    category: 'Moderación',
    icon: 'shield',
  },
  {
    name: 'unban',
    description: 'Desbanea a un usuario (ID)',
    aliases: ['desbanear'],
    usage: 'cz!unban <id>',
    category: 'Moderación',
    icon: 'shield',
  },
  {
    name: 'mute',
    description: 'Silencia a un miembro (por defecto 10 min)',
    aliases: ['silenciar', 'timeout'],
    usage: 'cz!mute @usuario [minutos] [razón]',
    category: 'Moderación',
    icon: 'shield',
  },
  {
    name: 'unmute',
    description: 'Quita el silencio a un miembro',
    aliases: ['desmutear', 'untimeout'],
    usage: 'cz!unmute @usuario',
    category: 'Moderación',
    icon: 'shield',
  },
  {
    name: 'warn',
    description: 'Avisa (warn) a un miembro',
    aliases: ['advertir'],
    usage: 'cz!warn @usuario [razón]',
    category: 'Moderación',
    icon: 'warning',
  },
  {
    name: 'warns',
    description: 'Muestra los avisos de un miembro',
    aliases: ['avisos'],
    usage: 'cz!warns @usuario',
    category: 'Moderación',
    icon: 'warning',
  },
  {
    name: 'purge',
    description: 'Borra mensajes en masa (máx. 100)',
    aliases: ['clear', 'limpiar', 'prune'],
    usage: 'cz!purge <cantidad>',
    category: 'Moderación',
    icon: 'close',
  },
  {
    name: 'close',
    description: 'Cierra el canal actual (tickets y canales gestionados)',
    aliases: ['cerrarcanal'],
    usage: 'cz!close',
    category: 'Moderación',
    icon: 'lock',
  },
  // ─── Configuración ───
  {
    name: 'setprefix',
    description: 'Cambia el prefijo del bot en este servidor',
    aliases: ['prefix', 'prefijo'],
    usage: 'cz!setprefix <prefijo>',
    category: 'Configuración',
    icon: 'settings',
  },
  {
    name: 'setlang',
    description: 'Cambia el idioma del bot en este servidor (es/en)',
    aliases: ['idioma', 'language', 'lang'],
    usage: 'cz!setlang <es|en>',
    category: 'Configuración',
    icon: 'globe',
  },
  {
    name: 'setupwelcome',
    description: 'Configura el canal y mensaje de bienvenidas',
    aliases: ['welcome', 'bienvenidas'],
    usage: 'cz!setupwelcome <#canal> [mensaje]',
    category: 'Configuración',
    icon: 'heart',
  },
  {
    name: 'setupgoodbye',
    description: 'Configura el canal y mensaje de despedidas',
    aliases: ['goodbye', 'despedidas'],
    usage: 'cz!setupgoodbye <#canal> [mensaje]',
    category: 'Configuración',
    icon: 'flag',
  },
  {
    name: 'setupautorole',
    description: 'Asigna roles automáticos a nuevos miembros',
    aliases: ['autorole'],
    usage: 'cz!setupautorole <@rol|off>',
    category: 'Configuración',
    icon: 'user',
  },
  {
    name: 'setupcounters',
    description: 'Crea canales contador (members, online, bots, channels)',
    aliases: ['contadores', 'counters'],
    usage: 'cz!setupcounters <tipo> <nombre-{n}>',
    category: 'Configuración',
    icon: 'server',
  },
  {
    name: 'setuptickets',
    description: 'Configura el sistema de tickets con botón',
    aliases: ['tickets'],
    usage: 'cz!setuptickets <#canal> [categoría] [@rol]',
    category: 'Configuración',
    icon: 'lock',
  },
  {
    name: 'setupleveling',
    description: 'Activa/desactiva el sistema de niveles',
    aliases: ['leveling', 'niveles'],
    usage: 'cz!setupleveling <on|off> [#canal]',
    category: 'Configuración',
    icon: 'star',
  },
  {
    name: 'setupprivate',
    description: 'Activa canales privados por botón',
    aliases: ['privatechannels', 'canalesprivados'],
    usage: 'cz!setupprivate <on|off> [#canal-panel]',
    category: 'Configuración',
    icon: 'lock',
  },
  {
    name: 'setuplogs',
    description: 'Configura el canal de logs del servidor',
    aliases: ['logs', 'logschannel'],
    usage: 'cz!setuplogs <#canal|off>',
    category: 'Configuración',
    icon: 'terminal',
  },
];

export const CATEGORIES = [
  'Diversión',
  'Economía',
  'Información',
  'Música',
  'Niveles',
  'Social',
  'Utilidad',
  'Moderación',
  'Configuración',
] as const;

export const CATEGORY_ICONS: Record<(typeof CATEGORIES)[number], string> = {
  Diversión: 'gamepad',
  Economía: 'money',
  Información: 'info',
  Música: 'music',
  Niveles: 'star',
  Social: 'people',
  Utilidad: 'settings',
  Moderación: 'shield',
  Configuración: 'settings',
};

export type CommandCategory = CommandInfo['category'];

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
export const CATEGORY_COLORS: Record<CommandCategory, string> = {
  'Diversión': '#f472b6',
  'Economía': '#facc15',
  'Información': '#60a5fa',
  'Música': '#a855f7',
  'Niveles': '#34d399',
  'Social': '#22d3ee',
  'Utilidad': '#fb923c',
  'Moderación': '#ef4444',
  'Configuración': '#94a3b8',
};

/** Sigla de cada categoría para la referencia de catálogo. */
const CATEGORY_CODE: Record<CommandCategory, string> = {
  'Diversión': 'FUN',
  'Economía': 'ECO',
  'Información': 'INF',
  'Música': 'MUS',
  'Niveles': 'LVL',
  'Social': 'SOC',
  'Utilidad': 'UTL',
  'Moderación': 'MOD',
  'Configuración': 'CFG',
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

export const commandAccent = (cmd: CommandInfo): string => COMMAND_COLORS[cmd.name] ?? '#94a3b8';
export const categoryColor = (cat: string): string =>
  CATEGORY_COLORS[cat as CommandCategory] ?? '#94a3b8';
export const commandRef = (cmd: CommandInfo): string => COMMAND_REFS[cmd.name] ?? cmd.name;

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
export function relatedCommands(cmd: CommandInfo, limit = 4): CommandInfo[] {
  const sameCategory = COMMANDS.filter((c) => c.name !== cmd.name && c.category === cmd.category);
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const extra = COMMANDS.filter(
    (c) => c.name !== cmd.name && c.category !== cmd.category && c.icon === cmd.icon,
  );
  return [...sameCategory, ...extra].slice(0, limit);
}
