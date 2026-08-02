export interface CommandInfo {
  name: string;
  description: string;
  aliases: string[];
  usage: string;
  category: 'Diversión' | 'Información' | 'Social' | 'Utilidad';
  emoji: string;
}

export const COMMANDS: CommandInfo[] = [
  {
    name: 'help',
    description: 'Muestra información del bot y la lista de comandos disponibles',
    aliases: ['ayuda', 'comandos', 'botinfo', 'cmds', 'cmd'],
    usage: 'cz!help [comando]',
    category: 'Información',
    emoji: '📖',
  },
  {
    name: 'ping',
    description: 'Muestra el ping del bot con "pong"',
    aliases: ['latencia', 'ms', 'pingpong', 'p'],
    usage: 'cz!ping',
    category: 'Utilidad',
    emoji: '📨',
  },
  {
    name: 'pong',
    description: 'Muestra el ping del bot con "ping"',
    aliases: ['latencia2', 'ms2', 'pongping', 'p2'],
    usage: 'cz!pong',
    category: 'Utilidad',
    emoji: '🏓',
  },
  {
    name: 'hi',
    description: 'Saluda al usuario con un mensaje amigable',
    aliases: ['hola', 'saludar', 'saludo', 'hello', 'hey', 'hihi', 'h'],
    usage: 'cz!hi',
    category: 'Social',
    emoji: '👋',
  },
  {
    name: 'bye',
    description: 'Se despide del usuario con un mensaje amigable',
    aliases: ['adios', 'despedir', 'despedida', 'chao', 'byebye', 'b'],
    usage: 'cz!bye',
    category: 'Social',
    emoji: '👋',
  },
  {
    name: 'say',
    description: 'Hace que el bot repita tu mensaje en un embed',
    aliases: ['decir', 'di', 'pronunciar', 'repetir', 's', 'repeat'],
    usage: 'cz!say <mensaje>',
    category: 'Diversión',
    emoji: '🗣️',
  },
  {
    name: 'directsay',
    description: 'Hace que el bot repita tu mensaje directamente sin embed',
    aliases: ['decirdirecto', 'deds', 'dsay', 'ds', 'repeatdirect'],
    usage: 'cz!directsay <mensaje>',
    category: 'Diversión',
    emoji: '💬',
  },
  {
    name: 'confess',
    description: 'Envía un mensaje anónimo y borra tu mensaje original',
    aliases: ['confesar', 'anonimo', 'secreto', 'c', 'confession'],
    usage: 'cz!confess <mensaje>',
    category: 'Diversión',
    emoji: '🤫',
  },
  {
    name: '8ball',
    description: 'Responde a tus preguntas con la sabiduría de la bola 8',
    aliases: ['bola8', 'pregunta', 'oraculo', '8b', 'magicball'],
    usage: 'cz!8ball <pregunta>',
    category: 'Diversión',
    emoji: '🎱',
  },
  {
    name: 'profile',
    description: 'Muestra información detallada del usuario',
    aliases: ['perfil', 'usuario', 'userinfo', 'u'],
    usage: 'cz!profile [@usuario]',
    category: 'Información',
    emoji: '📛',
  },
  {
    name: 'serverinfo',
    description: 'Muestra información detallada del servidor',
    aliases: ['servidor', 'infoserver', 'guild', 'server', 'guildinfo'],
    usage: 'cz!serverinfo',
    category: 'Información',
    emoji: '🛰️',
  },
  {
    name: 'test',
    description: 'Comando de prueba para verificar el funcionamiento del bot',
    aliases: ['prueba', 'testear', 'verificar', 't', 'check'],
    usage: 'cz!test',
    category: 'Utilidad',
    emoji: '🧪',
  },
];

export const CATEGORIES = ['Diversión', 'Información', 'Social', 'Utilidad'] as const;
