import type { Metadata } from 'next';
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
import { INVITE_URL } from '@/lib/i18n';

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

export default function FAQPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <div className="max-w-screen-xl mx-auto">
        <PageReveal>
          <InfoHero
            icon="faq"
            title="Preguntas frecuentes"
            subtitle="Respuestas rápidas a las dudas más comunes sobre CiszuBot: invitación, comandos, dashboard, idiomas, privacidad y soporte."
            kicker="FAQ"
            theme={THEME}
          />
        </PageReveal>

        <div className="space-y-14">
          <InfoFaqExplorer items={FAQS} categories={CATEGORIES} theme={THEME} copy={FAQ_COPY} />
          <InfoCardGrid title="Temas relacionados" items={TOPICS} theme={THEME} columns={4} />
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
