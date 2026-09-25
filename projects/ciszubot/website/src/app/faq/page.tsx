import type { Metadata } from 'next';
import {
  InfoHero,
  InfoAccordion,
  InfoCardGrid,
  InfoCtaRow,
  type InfoTheme,
  type InfoAccordionItem,
  type InfoCardItem,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import { INVITE_URL } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'CiszuBot | FAQ',
  description:
    'Preguntas frecuentes sobre CiszuBot: invitación, prefijo, comandos, dashboard, leaderboard, idiomas, privacidad y soporte.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};

const FAQS: InfoAccordionItem[] = [
  {
    q: '¿Qué es CiszuBot?',
    a: 'CiszuBot es el bot oficial de Discord de Ciszu Network, hecho en Node.js y TypeScript. Incluye módulos de comunidad, moderación, música, economía, niveles, utilidades y sorteos, con prefijo cz! y slash commands, todo en español e inglés.',
  },
  {
    q: '¿Cómo invito a CiszuBot a mi servidor?',
    a: 'Pulsa el botón «Invitar» de la web (o usa el enlace de invitación oficial) y elige el servidor en Discord. Necesitas el permiso «Gestionar servidor» para añadirlo, y el bot llegará con los permisos mínimos ya configurados.',
  },
  {
    q: '¿Cuál es el prefijo y cómo veo los comandos?',
    a: 'El prefijo es cz!. También puedes usar los slash commands escribiendo / en Discord. Con /help (o cz!help) obtienes la lista completa agrupada por módulo: diversión, información, social, utilidad, economía, música, niveles, moderación y configuración.',
  },
  {
    q: '¿CiszuBot es gratis?',
    a: 'Sí, el bot es completamente gratuito y no hay funciones encerradas tras un muro de pago. Las donaciones son opcionales y sirven para cubrir el hosting y el desarrollo. Puedes apoyar desde la página de Donar.',
  },
  {
    q: '¿Cómo accedo al dashboard?',
    a: 'El dashboard web permite gestionar módulos, canales, avisos e idioma de tus servidores. Se accede desde /dashboard y, si inicias sesión con tu CISZU ID, tus preferencias se sincronizan entre todas las webs y servicios de Ciszu Network.',
  },
  {
    q: '¿Qué es el leaderboard?',
    a: 'El leaderboard es el ranking de actividad del bot: muestra los servidores con más uso y los usuarios más activos según los comandos ejecutados. Puedes consultarlo en /leaderboard; solo se usan contadores agregados, nunca el contenido de tus mensajes.',
  },
  {
    q: '¿En qué idiomas está disponible?',
    a: 'CiszuBot detecta el idioma del servidor automáticamente y también puedes fijarlo con /config. Soportamos español latinoamericano, español de España, inglés US e inglés UK; las webs del ecosistema usan los mismos cuatro idiomas.',
  },
  {
    q: '¿Qué datos almacena el bot?',
    a: 'Solo registramos un contador de comandos ejecutados, el estado de conexión del servidor y la configuración que tú defines (canales, módulos, idioma). No leemos ni almacenamos mensajes ni datos personales. El detalle completo está en la Política de Privacidad.',
  },
  {
    q: '¿Los comandos funcionan en mensajes privados?',
    a: 'Algunos comandos de utilidad responden por MD, pero la mayoría requiere estar dentro de un servidor con CiszuBot y contar con los permisos adecuados. Si un comando no responde, comprueba que el módulo esté activo y que tengas permisos.',
  },
  {
    q: '¿Cómo reporto un error o pido soporte?',
    a: 'Puedes abrir una incidencia desde la página de Soporte, entrar al servidor de Discord de Ciszu Network o escribirnos al correo oficial. Cuanto más detalle des (comando, servidor, captura y pasos para reproducirlo), más rápido lo resolvemos.',
  },
  {
    q: '¿Cómo puedo aportar o sugerir funciones?',
    a: 'Usa la página de Feedback o el canal de sugerencias del Discord oficial. El ecosistema es open source: el repositorio público en GitHub acepta reportes, correcciones y propuestas, y toda colaboración se acredita en la página de Créditos.',
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
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <InfoHero
          icon="faq"
          title="Preguntas frecuentes"
          subtitle="Respuestas rápidas a las dudas más comunes sobre CiszuBot: invitación, comandos, dashboard, idiomas, privacidad y soporte."
          kicker="FAQ"
          theme={THEME}
        />

        <div className="space-y-14">
          <InfoAccordion items={FAQS} theme={THEME} />
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
