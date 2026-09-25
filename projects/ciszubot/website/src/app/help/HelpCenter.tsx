'use client';

import {
  InfoHelpExplorer,
  type InfoHelpCard,
  type InfoHelpCategory,
  type InfoHelpCopy,
  type InfoTheme,
} from '@ciszu/ui';
import { INVITE_URL, TOP_GG_BOT_VOTE } from '@/lib/i18n';

/**
 * Contenido del centro de ayuda de CiszuBot.
 *
 * La lógica (buscador, chips por categoría, grid y modal central) vive en
 * `InfoHelpExplorer`; aquí solo van las 24 ayudas reales del bot y su paleta,
 * con las clases literales para que Tailwind las extraiga.
 */
const CATEGORIES: InfoHelpCategory[] = [
  {
    id: 'empezar',
    label: 'Empezar',
    icon: 'rocket',
    accent: 'text-brand-600 dark:text-brand-300',
    accentBg: 'bg-brand-400/10',
    accentBorder: 'border-brand-400/40',
    cta: 'bg-brand-500 text-white hover:bg-brand-600',
  },
  {
    id: 'comandos',
    label: 'Comandos',
    icon: 'terminal',
    accent: 'text-neon-cyan',
    accentBg: 'bg-neon-cyan/10',
    accentBorder: 'border-neon-cyan/40',
    cta: 'bg-neon-cyan text-black hover:bg-neon-cyan/90',
  },
  {
    id: 'servidor',
    label: 'Servidor',
    icon: 'server',
    accent: 'text-violet-500 dark:text-violet-300',
    accentBg: 'bg-violet-400/10',
    accentBorder: 'border-violet-400/40',
    cta: 'bg-violet-500 text-white hover:bg-violet-600',
  },
  {
    id: 'musica',
    label: 'Música',
    icon: 'music',
    accent: 'text-neon-pink',
    accentBg: 'bg-neon-pink/10',
    accentBorder: 'border-neon-pink/40',
    cta: 'bg-neon-pink text-white hover:bg-neon-pink/90',
  },
  {
    id: 'economia',
    label: 'Economía',
    icon: 'money',
    accent: 'text-success',
    accentBg: 'bg-success/10',
    accentBorder: 'border-success/40',
    cta: 'bg-success text-black hover:bg-success/90',
  },
  {
    id: 'niveles',
    label: 'Niveles',
    icon: 'trophy',
    accent: 'text-warn',
    accentBg: 'bg-warn/10',
    accentBorder: 'border-warn/40',
    cta: 'bg-warn text-black hover:bg-warn/90',
  },
  {
    id: 'moderacion',
    label: 'Moderación',
    icon: 'shield',
    accent: 'text-danger',
    accentBg: 'bg-danger/10',
    accentBorder: 'border-danger/40',
    cta: 'bg-danger text-white hover:bg-danger/90',
  },
  {
    id: 'soporte',
    label: 'Soporte',
    icon: 'support',
    accent: 'text-brand-600 dark:text-brand-300',
    accentBg: 'bg-brand-400/10',
    accentBorder: 'border-brand-400/40',
    cta: 'bg-brand-500 text-white hover:bg-brand-600',
  },
];

const COPY: InfoHelpCopy = {
  searchPlaceholder: 'Busca una ayuda: comandos, música, permisos...',
  allCategories: 'Todas',
  results: 'Mostrando {n} de {total} ayudas',
  emptyTitle: 'Sin resultados',
  emptyHint: 'Prueba con otro comando o cambia de categoría.',
  clear: 'Reiniciar búsqueda',
  stepsTitle: 'Pasos rápidos',
  open: 'Abrir ayuda',
  close: 'Cerrar',
};

const CARDS: InfoHelpCard[] = [
  {
    title: 'Invitar a CiszuBot a tu servidor',
    category: 'empezar',
    icon: 'robot',
    summary: 'Añade el bot con permisos completos y empieza a usarlo en minutos.',
    detail:
      'La invitación oficial abre el diálogo de Discord para elegir el servidor y autorizar los permisos. CiszuBot funciona con prefijo cz! y con slash commands; solo necesita un canal donde pueda leer y escribir.',
    steps: [
      'Abre el enlace de invitación desde esta web o desde top.gg.',
      'Elige el servidor y revisa los permisos solicitados antes de autorizar.',
      'Escribe /help o cz!help en un canal para confirmar que responde.',
    ],
    tags: 'invitar invite añadir bot servidor permisos discord oauth',
    cta: { label: 'Invitar a CiszuBot', href: INVITE_URL, external: true },
  },
  {
    title: 'Primeros pasos y configuración inicial',
    category: 'empezar',
    icon: 'settings',
    summary: 'Qué revisar tras invitar al bot para que todo funcione.',
    detail:
      'Después de invitar al bot conviene comprobar los permisos del canal, el rol del bot en la jerarquía y los canales donde quieres que actúe. La documentación recoge la configuración recomendada.',
    steps: [
      'Comprueba que CiszuBot aparece en la lista de miembros del servidor.',
      'Dale permisos de enviar mensajes, insertar enlaces y usar comandos de aplicación.',
      'Sube su rol por encima de los roles que deba moderar.',
    ],
    tags: 'primeros pasos configuración inicial setup instalar permisos canales',
    cta: { label: 'Ver documentación', href: '/documentation' },
  },
  {
    title: 'Vota y apoya a CiszuBot',
    category: 'empezar',
    icon: 'heart',
    summary: 'Vota en top.gg y ayuda a que más servidores descubran el bot.',
    detail:
      'Los votos en las listas de bots mejoran su visibilidad y mantienen el proyecto activo. Puedes votar cada día desde top.gg; no hace falta registrarse en ninguna web externa.',
    steps: [
      'Abre la ficha de CiszuBot en top.gg.',
      'Pulsa el botón de voto e inicia sesión con Discord si te lo pide.',
      'Vuelve cada 24 horas para renovar el voto.',
    ],
    tags: 'votar vote top.gg apoyo difundir lista bots',
    cta: { label: 'Votar ahora', href: TOP_GG_BOT_VOTE, external: true },
  },
  {
    title: 'Prefijo cz! y alias',
    category: 'comandos',
    icon: 'terminal',
    summary: 'Cómo escribir los comandos clásicos y sus atajos.',
    detail:
      'Los comandos clásicos usan el prefijo cz! (por ejemplo cz!play). Muchos tienen alias cortos para no escribirlos completos, y el listado de comandos muestra el uso exacto de cada uno.',
    steps: [
      'Escribe cz!help para ver las categorías disponibles.',
      'Abre la página de comandos y busca el que necesites.',
      'Usa los alias que aparecen en su ficha para ir más rápido.',
    ],
    tags: 'prefijo prefix cz! comando alias uso comandos clásicos',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Slash commands (/)',
    category: 'comandos',
    icon: 'keyboard',
    summary: 'La vía recomendada: menús de Discord con autocompletado.',
    detail:
      'Los slash commands se escriben con / y muestran sus opciones directamente en Discord. Evitan problemas de prefijo y funcionan aunque el mensaje clásico del bot esté oculto.',
    steps: [
      'Escribe / en el canal y empieza a teclear el nombre del comando.',
      'Selecciona el comando en el menú de Discord.',
      'Rellena las opciones y pulsa Enter.',
    ],
    tags: 'slash comandos / discord aplicación application commands autocompletar',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Los comandos no aparecen en Discord',
    category: 'comandos',
    icon: 'refresh',
    summary: 'Soluciones cuando el menú / está vacío o el prefijo no responde.',
    detail:
      'Si el bot está en línea pero no ves sus comandos, suele ser un problema de permisos del canal o de caché de Discord. Los slash commands se sincronizan al autorizar la aplicación.',
    steps: [
      'Revisa que el bot pueda usar comandos de aplicación en el canal.',
      'Prueba en otro canal o expulsa y vuelve a invitar al bot para refrescar comandos.',
      'Si sigue igual, abre una incidencia con el ID del servidor.',
    ],
    tags: 'comandos no aparecen menu vacío permisos caché sincronizar',
    cta: { label: 'Ver soporte', href: '/support' },
  },
  {
    title: 'Dashboard de tu servidor',
    category: 'servidor',
    icon: 'monitor',
    summary: 'Gestiona ajustes del bot sin escribir comandos.',
    detail:
      'El dashboard permite ajustar módulos del servidor desde la web, iniciando sesión con Discord. Solo los administradores de cada servidor pueden guardar cambios.',
    steps: [
      'Inicia sesión en el dashboard con tu cuenta de Discord.',
      'Selecciona el servidor que quieres configurar.',
      'Activa los módulos y guarda los cambios.',
    ],
    tags: 'dashboard panel web configurar servidor ajustes módulos',
    cta: { label: 'Abrir dashboard', href: '/dashboard' },
  },
  {
    title: 'Permisos y jerarquía de roles',
    category: 'servidor',
    icon: 'lock',
    summary: 'Qué permisos necesita el bot y cómo ordenar los roles.',
    detail:
      'CiszuBot necesita permisos básicos para leer y escribir, y permisos de moderación para los comandos que expulsan o silencian. Su rol debe estar por encima de los roles que modera.',
    steps: [
      'Entra en Configuración del servidor > Roles y coloca el rol del bot arriba.',
      'Revisa los permisos del canal donde quieres usarlo.',
      'Evita dar administrador si no necesitas los comandos de moderación global.',
    ],
    tags: 'permisos roles jerarquía moderación administrador ordenar',
    cta: { label: 'Ver documentación', href: '/documentation' },
  },
  {
    title: 'Embeds, anuncios y utilidades',
    category: 'servidor',
    icon: 'message',
    summary: 'Comandos para dar vida al servidor: embeds, bumps y sorteos.',
    detail:
      'El bot incluye utilidades para publicar embeds, anunciar promociones, gestionar alianzas y hacer sorteos. Cada comando indica sus opciones en la página de comandos.',
    steps: [
      'Busca en la página de comandos la categoría Utilidad.',
      'Revisa el uso de embed, promo o giveaway.',
      'Recuerda que necesitas permisos de gestión de mensajes.',
    ],
    tags: 'embed anuncios promo bump giveaway sorteos alianza utilidad',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Reproducir música con play',
    category: 'musica',
    icon: 'play',
    summary: 'Pon una canción o una lista en el canal de voz donde estás.',
    detail:
      'El comando play une al bot a tu canal de voz y reproduce lo que pidas: nombre, enlace o búsqueda. Desde la misma ficha puedes ver el uso y los alias exactos.',
    steps: [
      'Entra en un canal de voz primero.',
      'Escribe cz!play <título o URL> o usa el slash command equivalente.',
      'Comprueba con queue lo que queda por sonar.',
    ],
    tags: 'música play reproducir canción cancion voz audio track',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Cola, loop y salto de pistas',
    category: 'musica',
    icon: 'music',
    summary: 'Controla la reproducción: skip, pause, resume y loop.',
    detail:
      'La cola de reproducción acepta más canciones mientras suena una. Los comandos skip, pause, resume y loop controlan la sesión; stop vacía la cola y desconecta el reproductor.',
    steps: [
      'Usa queue para consultar las pistas en espera.',
      'Salta con skip o pausa con pause y reanuda con resume.',
      'Activa loop para repetir la canción o la lista.',
    ],
    tags: 'cola queue skip pause resume loop stop reproducir controlar',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'El bot no entra al canal de voz',
    category: 'musica',
    icon: 'headset',
    summary: 'Causas típicas: permisos, canal lleno o falta de un canal de texto.',
    detail:
      'Para reproducir, el bot necesita conectarse y hablar en el canal de voz, y usar un canal de texto donde recibir los comandos. Los límites de usuario del canal también lo bloquean.',
    steps: [
      'Revisa que el canal de voz no esté lleno ni bloqueado.',
      'Concede los permisos Conectar y Hablar al rol de CiszuBot.',
      'Comprueba que escribes el comando en un canal de texto visible para el bot.',
    ],
    tags: 'voz canal no entra conectar hablar permisos lleno bloqueado',
    cta: { label: 'Abrir soporte', href: '/support' },
  },
  {
    title: 'Problemas de audio y cortes',
    category: 'musica',
    icon: 'warning',
    summary: 'Qué hacer si la música se entrecorta o no se oye.',
    detail:
      'Los cortes suelen venir de la conexión del servidor de Discord o de la región de voz del canal. Cambiar de canal de voz y revisar la conexión del servidor resuelve la mayoría de casos.',
    steps: [
      'Cambia el canal de voz a otra región desde la configuración del servidor.',
      'Prueba en otro canal para descartar un problema puntual.',
      'Si persiste, revisa el estado del bot en la página de estadísticas.',
    ],
    tags: 'audio cortes entrecortado sin sonido lag voz música calidad',
    cta: { label: 'Ver la FAQ', href: '/faq' },
  },
  {
    title: 'Economía: daily, balance y banco',
    category: 'economia',
    icon: 'money',
    summary: 'Gana monedas a diario y guarda tu saldo en el banco.',
    detail:
      'Economía virtual con recompensa diaria, cartera y banco. El banco protege el saldo de las apuestas; deposit y withdraw mueven monedas entre ambos.',
    steps: [
      'Reclama tu recompensa con daily en cuanto esté disponible.',
      'Consulta tu saldo con balance.',
      'Deposita en el banco con deposit para proteger tus monedas.',
    ],
    tags: 'economía daily balance banco bank deposit withdraw monedas coins',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Gamble y slot: juegos de apuestas',
    category: 'economia',
    icon: 'dice',
    summary: 'Apuesta una parte de tu cartera por diversión.',
    detail:
      'Los juegos de apuestas usan la moneda virtual del servidor y nunca dinero real. Las ganancias van a la cartera; para no arriesgar, tienes el banco.',
    steps: [
      'Asegúrate de tener saldo en la cartera (no en el banco).',
      'Elige el juego y la cantidad que quieres apostar.',
      'Consulta las reglas del juego en la página de comandos.',
    ],
    tags: 'gamble slot apuestas casino monedas azar dados apostar',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Tienda y compras (shop, buy)',
    category: 'economia',
    icon: 'gift',
    summary: 'Gasta tus monedas en objetos y recompensas del servidor.',
    detail:
      'La tienda ofrece artículos definidos por el servidor y compras con la moneda virtual. Cada objeto tiene su precio y algunos se reclaman con un comando de uso.',
    steps: [
      'Abre la tienda con shop para ver el catálogo.',
      'Elige el artículo y cómpralo con buy.',
      'Revisa en tu inventario o perfil que la compra se registró.',
    ],
    tags: 'tienda shop buy comprar objetos inventario recompensas monedas',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Niveles y XP (rank, topxp)',
    category: 'niveles',
    icon: 'trophy',
    summary: 'Sube de nivel escribiendo y consulta tu progreso.',
    detail:
      'La experiencia se gana con la actividad en el servidor y sube tu nivel con recompensas de rol si el servidor las tiene configuradas. rank muestra tu tarjeta de progreso.',
    steps: [
      'Participa en los canales de texto para sumar XP.',
      'Consulta tu nivel con rank.',
      'Usa topxp para ver a los miembros con más experiencia.',
    ],
    tags: 'niveles xp experiencia rank topxp subir progreso actividad',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Leaderboard del servidor',
    category: 'niveles',
    icon: 'medal',
    summary: 'Consulta el ranking en vivo de CiszuBot.',
    detail:
      'La página de leaderboard muestra el ranking del servidor con los saldos y la posición de cada miembro, actualizado desde la base de datos del bot.',
    steps: [
      'Abre la página del leaderboard desde esta web.',
      'Busca tu posición en la lista.',
      'Usa el comando leaderboard en Discord para la versión del chat.',
    ],
    tags: 'leaderboard ranking tabla posiciones top mejores saldos clasificación',
    cta: { label: 'Ver leaderboard', href: '/leaderboard' },
  },
  {
    title: 'Moderación: kick, ban y unban',
    category: 'moderacion',
    icon: 'shield',
    summary: 'Expulsa o bloquea miembros con registro de la acción.',
    detail:
      'Los comandos de moderación actúan sobre miembros con o sin expulsión y requieren permisos y jerarquía. El bot registra cada acción para que quede constancia.',
    steps: [
      'Comprueba que tu rol está por encima del miembro a moderar.',
      'Usa kick para expulsar o ban para bloquear, con el motivo.',
      'Revierte con unban indicando la ID del usuario.',
    ],
    tags: 'moderación kick ban unban expulsar bloquear usuario sanción',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Mute, advertir y purgar mensajes',
    category: 'moderacion',
    icon: 'delete',
    summary: 'Silencia, advierte y limpia mensajes del canal.',
    detail:
      'Los comandos de moderación incluyen silencio temporal, advertencias persistentes y purga de mensajes. La purga elimina en bloque y no se puede deshacer.',
    steps: [
      'Usa mute y unmute para el silencio temporal.',
      'Registra advertencias con warn y consúltalas con warns.',
      'Limpia el canal con purge indicando cuántos mensajes borrar.',
    ],
    tags: 'mute unmute warn warns purga purge borrar mensajes silenciar',
    cta: { label: 'Ver comandos', href: '/commands' },
  },
  {
    title: 'Rate limits y cooldowns',
    category: 'soporte',
    icon: 'timer',
    summary: 'Por qué el bot pide esperar entre usos y cómo evitarlo.',
    detail:
      'Discord limita la frecuencia de peticiones para proteger sus servidores. El bot aplica cooldowns en algunos comandos para no superar esos límites; respetarlos evita bloqueos temporales.',
    steps: [
      'Si un comando pide esperar, aguarda el tiempo indicado.',
      'Evita repetir comandos pesados en ráfaga.',
      'Si el límite persiste, reporta el caso con la hora y el comando.',
    ],
    tags: 'rate limit cooldown límite esperar bloqueo peticiones discord',
    cta: { label: 'Ver documentación', href: '/documentation' },
  },
  {
    title: 'Reportar un bug o comando roto',
    category: 'soporte',
    icon: 'error',
    summary: 'Envía el fallo con los datos que permiten reproducirlo.',
    detail:
      'El formulario de feedback recoge errores del bot y de la web. Incluir la hora, el servidor y el comando exacto acelera mucho la corrección.',
    steps: [
      'Abre la página de feedback.',
      'Indica el comando usado, el resultado y la hora.',
      'Añade capturas o el enlace del mensaje si es posible.',
    ],
    tags: 'bug error comando roto fallo reportar feedback incidencia',
    cta: { label: 'Enviar feedback', href: '/feedback' },
  },
  {
    title: 'Privacidad y datos del servidor',
    category: 'soporte',
    icon: 'eye',
    summary: 'Qué datos guarda el bot y cómo se tratan.',
    detail:
      'La política de privacidad detalla qué datos se almacenan (configuración del servidor, niveles, economía) y con qué finalidad. No se venden datos a terceros.',
    steps: [
      'Lee la política de privacidad del bot.',
      'Revisa qué módulos guardan datos para tu servidor.',
      'Solicita la eliminación por el canal de contacto si lo necesitas.',
    ],
    tags: 'privacidad datos privacy almacenamiento política borrar gdpr',
    cta: { label: 'Leer política', href: '/privacy' },
  },
  {
    title: 'Contacto y soporte directo',
    category: 'soporte',
    icon: 'mail',
    summary: 'Habla con el equipo por el servidor de Discord o por correo.',
    detail:
      'Para dudas que no resuelve la FAQ, el equipo atiende por el servidor oficial de Discord y por correo. Consulta primero el estado del bot antes de reportar una caída.',
    steps: [
      'Revisa la FAQ y la página de estado.',
      'Entra al servidor oficial de Discord o abre una incidencia.',
      'Aporta los datos del problema desde el primer mensaje.',
    ],
    tags: 'contacto soporte discord correo equipo ayuda directo',
    cta: { label: 'Ir a contacto', href: '/contact' },
  },
];

export default function HelpCenter({ theme }: { theme: InfoTheme }) {
  return <InfoHelpExplorer cards={CARDS} categories={CATEGORIES} copy={COPY} theme={theme} />;
}
