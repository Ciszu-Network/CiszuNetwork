import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  InfoHero,
  InfoFaqExplorer,
  InfoCardGrid,
  InfoCtaRow,
  type InfoFaqItem,
  type InfoFaqCategory,
  type InfoFaqCopy,
  type InfoCardItem,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';
import { INVITE_URL, getDict, parseLang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'CiszuBot | FAQ',
  description:
    'Preguntas frecuentes sobre CiszuBot: invitación, prefijo, comandos, dashboard, leaderboard, idiomas, privacidad y soporte.',
};

const CATEGORIES: InfoFaqCategory[] = [
  {
    id: 'primeros',
    label: 'Primeros pasos',
    icon: 'rocket',
    accent: 'text-neon-blue',
    accentBg: 'bg-neon-blue/10',
    accentBorder: 'border-neon-blue/40',
  },
  {
    id: 'comandos',
    label: 'Comandos',
    icon: 'terminal',
    accent: 'text-neon-cyan',
    accentBg: 'bg-neon-cyan/10',
    accentBorder: 'border-neon-cyan/40',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'monitor',
    accent: 'text-neon-purple',
    accentBg: 'bg-neon-purple/10',
    accentBorder: 'border-neon-purple/40',
  },
  {
    id: 'economia',
    label: 'Economía y niveles',
    icon: 'money',
    accent: 'text-neon-pink',
    accentBg: 'bg-neon-pink/10',
    accentBorder: 'border-neon-pink/40',
  },
  {
    id: 'comunidad',
    label: 'Comunidad',
    icon: 'users',
    accent: 'text-violet-500',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500/40',
  },
  {
    id: 'privacidad',
    label: 'Privacidad',
    icon: 'lock',
    accent: 'text-brand-500',
    accentBg: 'bg-brand-500/10',
    accentBorder: 'border-brand-500/40',
  },
  {
    id: 'soporte',
    label: 'Soporte',
    icon: 'support',
    accent: 'text-brand-700',
    accentBg: 'bg-brand-700/10',
    accentBorder: 'border-brand-700/40',
  },
];

const FAQ_COPY: InfoFaqCopy = {
  searchPlaceholder: 'Busca por comando, módulo o palabra clave…',
  allCategories: 'Todas',
  results: '{n} de {total} preguntas',
  emptyTitle: 'Sin resultados',
  emptyHint: 'Prueba con otra palabra o cambia de categoría.',
  clear: 'Limpiar filtros',
};

const FAQS: InfoFaqItem[] = [
  {
    category: 'primeros',
    q: '¿Qué es CiszuBot?',
    a: 'CiszuBot es el bot oficial de Discord de Ciszu Network, hecho en Node.js y TypeScript. Incluye módulos de comunidad, moderación, música, economía, niveles, utilidades y sorteos, con prefijo cz! y slash commands, todo en español e inglés.',
    tags: 'que es ciszubot bot discord oficial descripcion',
  },
  {
    category: 'primeros',
    q: '¿Cómo invito a CiszuBot a mi servidor?',
    a: 'Pulsa el botón «Invitar» de la web (o usa el enlace de invitación oficial) y elige el servidor en Discord. Necesitas el permiso «Gestionar servidor» para añadirlo, y el bot llegará con los permisos mínimos ya configurados.',
    tags: 'invitar invitacion agregar servidor discord permisos gestionar',
  },
  {
    category: 'primeros',
    q: '¿Funciona en servidores grandes o con otros bots?',
    a: 'Sí. El bot convive con otros bots y con servidores de cualquier tamaño: cada módulo se activa o desactiva por servidor y todas las funciones respetan los permisos que les concedas.',
    tags: 'servidores grandes escalabilidad otros bots rendimiento',
  },
  {
    category: 'primeros',
    q: '¿En qué idiomas está disponible?',
    a: 'CiszuBot detecta el idioma del servidor automáticamente y también puedes fijarlo con /config. Soportamos español latinoamericano, español de España, inglés US e inglés UK; las webs del ecosistema usan los mismos cuatro idiomas.',
    tags: 'idiomas ingles espanol latino configuracion lenguaje',
  },
  {
    category: 'comandos',
    q: '¿Cuál es el prefijo y cómo veo los comandos?',
    a: 'El prefijo es cz!. También puedes usar los slash commands escribiendo / en Discord. Con /help (o cz!help) obtienes la lista completa agrupada por módulo: diversión, información, social, utilidad, economía, música, niveles, moderación y configuración.',
    tags: 'prefijo cz ayuda help comandos lista slash',
  },
  {
    category: 'comandos',
    q: '¿Qué diferencia hay entre cz! y los slash commands?',
    a: 'Los slash commands se escriben con / y muestran sus opciones en Discord; el prefijo cz! se escribe en el chat y es más rápido para el uso diario. Ambos ejecutan las mismas funciones.',
    tags: 'diferencia slash commands prefijo cz comandos',
  },
  {
    category: 'comandos',
    q: '¿Puedo cambiar el prefijo del bot?',
    a: 'No: el prefijo oficial es cz! y se mantiene igual en todos los servidores para que los comandos documentados funcionen siempre. Si prefieres otra forma de invocarlos, usa los slash commands con /.',
    tags: 'cambiar prefijo personalizar comandos cz',
  },
  {
    category: 'comandos',
    q: '¿Los comandos funcionan en mensajes privados?',
    a: 'Algunos comandos de utilidad responden por MD, pero la mayoría requiere estar dentro de un servidor con CiszuBot y contar con los permisos adecuados. Si un comando no responde, comprueba que el módulo esté activo y que tengas permisos.',
    tags: 'mensajes privados md dm comandos no responden permisos',
  },
  {
    category: 'dashboard',
    q: '¿Cómo accedo al dashboard?',
    a: 'El dashboard web permite gestionar módulos, canales, avisos e idioma de tus servidores. Se accede desde /dashboard y, si inicias sesión con tu CISZU ID, tus preferencias se sincronizan entre todas las webs y servicios de Ciszu Network.',
    tags: 'dashboard panel web acceso login ciszuid',
  },
  {
    category: 'dashboard',
    q: '¿Qué puedo configurar desde el dashboard?',
    a: 'Módulos, canales de avisos, idioma y otras opciones por servidor. Los cambios se aplican al instante y solo los ve quien tiene permisos de administración en ese servidor.',
    tags: 'configurar dashboard modulos canales avisos idioma',
  },
  {
    category: 'dashboard',
    q: '¿Necesito una cuenta CISZU ID para el dashboard?',
    a: 'Sí. El dashboard se autentica con CISZU ID: la misma cuenta sirve para todas las webs del ecosistema y mantiene tus preferencias sincronizadas entre servicios.',
    tags: 'cuenta ciszuid dashboard autenticacion login',
  },
  {
    category: 'economia',
    q: '¿Cómo funcionan la economía y los niveles?',
    a: 'La economía y los niveles premian tu actividad: ganas monedas y experiencia al usar el bot y subes de nivel en cada servidor. Escribe /help para ver los comandos y recompensas disponibles.',
    tags: 'economia niveles monedas experiencia actividad recompensas',
  },
  {
    category: 'economia',
    q: '¿Qué puedo hacer con las monedas?',
    a: 'Las monedas del bot son virtuales y sirven para las funciones de economía y diversión (consultas, rankings y juegos internos). No tienen valor real ni se canjean por dinero.',
    tags: 'monedas virtuales economia canjear dinero valor',
  },
  {
    category: 'comunidad',
    q: '¿CiszuBot tiene música?',
    a: 'Sí, incluye un módulo de música con cola de reproducción y controles desde Discord. Puede desactivarse por servidor desde el dashboard si no lo necesitas.',
    tags: 'musica modulo cola reproduccion audio',
  },
  {
    category: 'comunidad',
    q: '¿Cómo creo sorteos o eventos?',
    a: 'El módulo de sorteos permite crear giveaways desde Discord con duración, premio y requisitos. Consulta los comandos en /help y anúncialos en el canal que prefieras.',
    tags: 'sorteos giveaways eventos premios comunidad',
  },
  {
    category: 'comunidad',
    q: '¿Hay leaderboard de actividad?',
    a: 'El leaderboard es el ranking de actividad del bot: muestra los servidores con más uso y los usuarios más activos según los comandos ejecutados. Puedes consultarlo en /leaderboard; solo se usan contadores agregados, nunca el contenido de tus mensajes.',
    tags: 'leaderboard ranking actividad top usuarios servidores',
  },
  {
    category: 'privacidad',
    q: '¿Qué datos almacena el bot?',
    a: 'Solo registramos un contador de comandos ejecutados, el estado de conexión del servidor y la configuración que tú defines (canales, módulos, idioma). No leemos ni almacenamos mensajes ni datos personales. El detalle completo está en la Política de Privacidad.',
    tags: 'datos almacena privacidad informacion personal',
  },
  {
    category: 'privacidad',
    q: '¿CiszuBot lee mis mensajes?',
    a: 'No. El bot solo procesa los mensajes que empiezan por su prefijo o que invocan un comando, y guarda contadores agregados de uso. No almacena el contenido de las conversaciones.',
    tags: 'leer mensajes privacidad contenido conversaciones',
  },
  {
    category: 'privacidad',
    q: '¿Puedo excluir un canal del bot?',
    a: 'Sí. Desde el dashboard puedes limitar los módulos y los canales donde actúan, de modo que el bot ignore los canales que no te interesen.',
    tags: 'excluir canal permisos dashboard ignorar',
  },
  {
    category: 'soporte',
    q: '¿CiszuBot es gratis?',
    a: 'Sí, el bot es completamente gratuito y no hay funciones encerradas tras un muro de pago. Las donaciones son opcionales y sirven para cubrir el hosting y el desarrollo. Puedes apoyar desde la página de Donar.',
    tags: 'gratis precio pago donaciones muro de pago',
  },
  {
    category: 'soporte',
    q: '¿Cómo reporto un error o pido soporte?',
    a: 'Puedes abrir una incidencia desde la página de Soporte, entrar al servidor de Discord de Ciszu Network o escribirnos al correo oficial. Cuanto más detalle des (comando, servidor, captura y pasos para reproducirlo), más rápido lo resolvemos.',
    tags: 'error bug soporte incidencia reporte ayuda',
  },
  {
    category: 'soporte',
    q: '¿Cómo puedo aportar o sugerir funciones?',
    a: 'Usa la página de Feedback o el canal de sugerencias del Discord oficial. El ecosistema es open source: el repositorio público en GitHub acepta reportes, correcciones y propuestas, y toda colaboración se acredita en la página de Créditos.',
    tags: 'sugerir funciones aportar feedback github open source',
  },
  {
    category: 'soporte',
    q: '¿Dónde veo el estado del bot?',
    a: 'La portada y la página de Stats muestran el estado en vivo: conexión, servidores y comandos ejecutados. Si el indicador aparece en rojo, el problema es global y no de tu servidor.',
    tags: 'estado status online caido uptime stats servidores',
  },
  {
    category: 'economia',
    q: '¿Cómo gano monedas y para qué sirven?',
    a: 'Ganas monedas con cz!work (cada hora), cz!daily (una vez al día), cz!gamble, cz!slot y reclamando los drops de dinero que caen en los canales. Con ellas usas la tienda (cz!shop), apuestas, das monedas a otros (cz!give) y guardas en el banco (cz!deposit / cz!withdraw). Todo es por servidor y cz!balance o cz!leaderboard muestran tu progreso.',
    tags: 'ganar monedas work daily gamble drops tienda banco deposito retirar balance',
  },
  {
    category: 'economia',
    q: '¿Qué son los drops de dinero?',
    a: 'Los drops son montos de dinero que caen solos en un canal con un botón «¡Reclamar!»: el primero que pulse se lo lleva. Los administradores los activan con cz!drops on y configuran canales, cantidades, intervalos, mensaje y roles excluidos. En servidores free caen hasta 3 al día; con Premium son ilimitados.',
    tags: 'drops caidas dinero boton reclamar premium ilimitado configurar',
  },
  {
    category: 'economia',
    q: '¿Puedo cambiar el nombre y el emoji de la moneda?',
    a: 'Sí. Con cz!coin emoji 🪙, cz!coin name <nombre> o cz!coin reset cambias cómo se muestra la moneda en todo el servidor (también desde el dashboard, sección Economía). Aparece así en balances, tienda, drops y rankings.',
    tags: 'moneda emoji nombre coin personalizar dashboard economia',
  },
  {
    category: 'economia',
    q: '¿Cómo funcionan los niveles y los roles por nivel?',
    a: 'Cada mensaje da XP (con multiplicador configurable) y al subir de nivel el bot lo anuncia con un mensaje personalizable. Los admins pueden configurar roles por nivel con cz!levelconfig role 10 @Rol: al alcanzar ese nivel, el rol se otorga automáticamente. cz!rank muestra tu progreso y cz!topxp el ranking.',
    tags: 'niveles xp subir nivel roles por nivel levelconfig rank topxp',
  },
  {
    category: 'economia',
    q: '¿Qué son las invitaciones con puntos?',
    a: 'El bot detecta quién invitó a cada nuevo miembro. Cada invitación válida da puntos al invitador (configurable) y con cz!invites ves tus puntos, el top de invitadores y las recompensas por umbral (por ejemplo, 10 invitaciones → rol especial). Si alguien se va del servidor, puedes ajustar con cz!invites reset.',
    tags: 'invitaciones invites puntos top invitador recompensas umbral',
  },
  {
    category: 'comunidad',
    q: '¿Qué es el sistema de alianzas?',
    a: 'Es un canal dedicado donde los miembros con el rango de alianzas publican links de servidores. El bot capta el link, valida la invitación, da un punto de alianza al autor y muestra una tarjeta con el servidor. Tiene leaderboard propio (cz!alliance top), cooldown por usuario, detección de servidores repetidos, filtros de palabras y servidores bloqueados, y rechaza servidores +18 si el servidor no los permite.',
    tags: 'alianzas alliance alianza servidores puntos leaderboard cooldown',
  },
  {
    category: 'comunidad',
    q: '¿Cómo publico una alianza y qué errores puedo ver?',
    a: 'Escribe en el canal de alianzas un mensaje con el link del servidor (discord.gg/...). Si todo está bien, el bot reemplaza tu mensaje por la tarjeta de alianza. Si falta el link, el servidor está repetido, estás en cooldown o el servidor está bloqueado, el bot borra tu mensaje y te explica el motivo en un aviso que se autoelimina. Los administradores configuran todo con cz!alliance.',
    tags: 'publicar alianza link discord.gg error motivo cooldown repetido bloqueado',
  },
  {
    category: 'comunidad',
    q: '¿Cómo funcionan los tickets?',
    a: 'El servidor puede tener un panel de soporte con varias categorías (soporte, postulaciones, reportes...). Eliges una categoría en el menú, respondes el formulario si lo tiene y el bot crea un canal privado solo para ti y el equipo, con botones para que el staff lo reclame o lo cierre. Al cerrarlo queda registrado en el canal de logs del staff.',
    tags: 'tickets soporte panel categorias formulario canal privado reclamar cerrar logs',
  },
  {
    category: 'comunidad',
    q: '¿Qué es el starboard?',
    a: 'Es el canal de mensajes destacados: cuando un mensaje recibe suficientes reacciones (por defecto ⭐ 3), el bot lo publica automáticamente en el canal de starboard con un enlace al original. Los admins configuran canal, emoji y mínimo de reacciones con cz!starboard.',
    tags: 'starboard destacados reacciones estrella mensajes destacar configurar',
  },
  {
    category: 'comunidad',
    q: '¿Cómo funcionan los canales de voz privados?',
    a: 'Al unirte al canal hub configurado, el bot te crea tu propio canal de voz privado y te mueve a él. Dentro tienes un panel con botones para bloquear, ocultar o eliminar el canal, y comandos como cz!privatevc rename o cz!privatevc limit. El canal se borra solo cuando queda vacío.',
    tags: 'canales privados voz hub privatevc bloquear ocultar eliminar rename limit',
  },
  {
    category: 'comunidad',
    q: '¿Puedo casarme con alguien en el bot?',
    a: 'Sí, es parte del módulo social: cz!marry @usuario envía una propuesta con botones (la otra persona acepta o rechaza), cz!partner muestra tu pareja y cz!divorce te divorcia. Es un sistema de diversión: no afecta a nada más.',
    tags: 'casar matrimonio marry divorce pareja partner social diversion',
  },
  {
    category: 'comunidad',
    q: '¿Qué son los emojis Nitro?',
    a: 'Cuando alguien sin Nitro usa un emoji externo, el bot puede reenviar su mensaje mediante un webhook (manteniendo nombre y avatar) para que el emoji se vea igual. Los admins lo activan con cz!nitro on.',
    tags: 'emojis nitro externos webhook reenviar sin nitro',
  },
  {
    category: 'comunidad',
    q: '¿Cómo configuro las bienvenidas y despedidas?',
    a: 'Con cz!welcome channel #canal y cz!welcome message <texto> configuras el mensaje de entrada (variables {user}, {username}, {guild}, {members}); cz!goodbye hace lo mismo para las salidas y cz!welcome test lo prueba sin esperar a que entre alguien. También puedes asignar roles automáticos a los nuevos miembros.',
    tags: 'bienvenidas despedidas welcome goodbye mensaje canal autorol variables',
  },
  {
    category: 'comandos',
    q: '¿Qué es el automod y cómo detecta spam?',
    a: 'El automod borra mensajes que incumplen las reglas configuradas: enlaces, invitaciones de Discord, MAYÚSCULAS excesivas, palabras prohibidas, spam (el mismo mensaje repetido 3+ veces en 10 segundos) y flood (8+ mensajes en 10 segundos). Se activa y ajusta con cz!automod y desde el dashboard.',
    tags: 'automod spam flood enlaces invitaciones mayusculas palabras prohibidas borrar',
  },
  {
    category: 'comandos',
    q: '¿Qué son los cooldowns por comando?',
    a: 'Son límites de uso configurables por los admins: cz!cooldown set work 60 hace que ese comando solo se pueda usar cada 60 segundos por persona, y el bot responde «espera X segundos» si te adelantas. Sirven para evitar abuso de comandos concretos.',
    tags: 'cooldown rate limit espera segundos abuso comando configurar',
  },
  {
    category: 'comandos',
    q: '¿Qué son los embeds personalizados?',
    a: 'Los admins pueden crear avisos con el diseño exacto que quieran usando JSON: cz!embed json {...} envía uno al momento, cz!embed save <nombre> lo guarda y cz!embed send <nombre> lo publica cuando quieras (incluso por webhook). Es una función Premium, gratis durante la beta.',
    tags: 'embeds personalizados json avisos webhook premium guardar enviar',
  },
  {
    category: 'dashboard',
    q: '¿Qué hay de nuevo en el dashboard?',
    a: 'El dashboard ahora incluye secciones para Economía (moneda, drops, invitaciones), Comunidad (starboard, Nitro, rol de staff), Automod (reglas y palabras), Alianzas (canal, filtros, sanciones, recompensas y embeds) y Tickets (categorías con roles, formularios y auto-borrado), además de niveles con roles por nivel.',
    tags: 'dashboard secciones economia comunidad automod alianzas tickets nuevos',
  },
  {
    category: 'dashboard',
    q: '¿Cómo sé qué comandos usar sin salir del dashboard?',
    a: 'Cada sección tiene un botón «?» (QuickHelp): al pasar el cursor muestra los comandos de esa opción y para qué sirven. Además, al pie de cada sección hay una zona de información con la misma lista. Así no necesitas ir a la página de comandos para configurar algo.',
    tags: 'dashboard quickhelp ayuda comandos interrogacion tooltip secciones',
  },
];

const TOPICS: InfoCardItem[] = [
  {
    icon: 'info',
    title: 'Sobre el bot',
    body: 'Qué es CiszuBot, quién lo desarrolla y cómo funciona. Consulta la página Sobre nosotros y la de Equipo.',
  },
  {
    icon: 'gamepad',
    title: 'Comandos y dashboard',
    body: 'Lista completa de comandos, categorías y alias, además del panel web para configurar tus servidores.',
  },
  {
    icon: 'shield',
    title: 'Privacidad y legal',
    body: 'Política de privacidad, reglas de la comunidad, lineamientos de uso y licencia del software.',
  },
  {
    icon: 'support',
    title: 'Soporte oficial',
    body: 'Centro de ayuda con guías paso a paso, incidencias y canales de contacto con el equipo.',
  },
];

export default async function FAQPage() {
  const t = getDict(parseLang((await cookies()).get('ciszubot_lang')?.value));
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero
            icon="faq"
            title={t.faqPage.infoTitle}
            subtitle="Respuestas rápidas a las dudas más comunes sobre CiszuBot: invitación, comandos, dashboard, idiomas, privacidad y soporte."
            kicker="FAQ"
            theme={THEME}
          />
        </PageReveal>

        <div className="space-y-14">
          <InfoFaqExplorer items={FAQS} categories={CATEGORIES} theme={THEME} copy={FAQ_COPY} />
          <InfoCardGrid title={t.faqPage.relatedTitle} items={TOPICS} theme={THEME} columns={4} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Centro de ayuda', href: '/help', icon: 'help' },
            { label: 'Abrir incidencia', href: '/support', icon: 'support', variant: 'ghost' },
            { label: 'Invitar a CiszuBot', href: INVITE_URL, icon: 'rocket', external: true, variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
