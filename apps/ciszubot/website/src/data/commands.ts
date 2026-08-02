export interface CommandInfo {
  name: string;
  description: string;
  aliases: string[];
  usage: string;
  category: 'Diversión' | 'Información' | 'Social' | 'Utilidad';
  icon: string;
}

export const COMMANDS: CommandInfo[] = [
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
    category: 'Utilidad',
    icon: 'wifi',
  },
  {
    name: 'pong',
    description: 'Muestra el ping del bot con "ping"',
    aliases: ['latencia2', 'ms2', 'pongping', 'p2'],
    usage: 'cz!pong',
    category: 'Utilidad',
    icon: 'wifi',
  },
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
    name: 'test',
    description: 'Comando de prueba para verificar el funcionamiento del bot',
    aliases: ['prueba', 'testear', 'verificar', 't', 'check'],
    usage: 'cz!test',
    category: 'Utilidad',
    icon: 'check',
  },
];

export const CATEGORIES = ['Diversión', 'Información', 'Social', 'Utilidad'] as const;

export const CATEGORY_ICONS: Record<(typeof CATEGORIES)[number], string> = {
  Diversión: 'gamepad',
  Información: 'info',
  Social: 'people',
  Utilidad: 'settings',
};
