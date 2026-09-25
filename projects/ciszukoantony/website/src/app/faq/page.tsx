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
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | FAQ',
  description:
    'Preguntas frecuentes sobre Ciszuko Antony, Ciszu Network, sus proyectos, certificados y formas de contacto.',
};

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const FAQS: InfoAccordionItem[] = [
  {
    q: '¿Quién es Ciszuko Antony?',
    a: 'Ciszuko Antony (Francisco Garcia) es desarrollador full-stack, CEO y fundador de Ciszu Network. Desde Venezuela crea aplicaciones web, bots, juegos, herramientas y contenido digital; este portfolio reúne su obra, sus certificados, su música y su documentación oficial.',
  },
  {
    q: '¿Qué es Ciszu Network?',
    a: 'Ciszu Network es el ecosistema digital fundado por Ciszuko Antony: agrupa las webs del ecosistema, el juego MuzicMania, el bot CiszuBot, la comunidad Ciszugamens y la infraestructura que los conecta. Toda la información está en ciszunetwork.vercel.app.',
  },
  {
    q: '¿Qué certificados y logros tiene?',
    a: 'El catálogo completo está en la página de Certificates: certificaciones, cursos y reconocimientos con su emisor y fecha. Cada certificado se muestra como referencia de formación verificable, no como acreditación oficial de terceros.',
  },
  {
    q: '¿Qué proyectos forman parte del ecosistema?',
    a: 'Además del portfolio, se documentan MuzicMania (juego de ritmo), CiszuBot (bot de Discord), CiszuGamens (comunidad gamer) y herramientas como la aplicación de escritorio PDWA. Puedes verlos todos en Projects y Downloads.',
  },
  {
    q: '¿Cómo puedo contactar o colaborar con Ciszuko Antony?',
    a: 'A través de la página de Contact: formulario, correo, WhatsApp y redes oficiales. Para propuestas de colaboración, patrocinio o encargos profesionales, indica el proyecto y el alcance en el mensaje para recibir una respuesta más precisa.',
  },
  {
    q: '¿Cuáles son las redes oficiales?',
    a: 'GitHub (Ciszu-Network), YouTube, Discord (Ciszugamens), X, Instagram, TikTok, Twitch, LinkedIn, Facebook, Pinterest, Spotify y WhatsApp. Cualquier otra cuenta que afirme representar al proyecto no es oficial: desconfía de suplantaciones.',
  },
  {
    q: '¿Puedo usar el contenido de este portfolio?',
    a: 'El contenido multimedia (fotos, vídeos, música, arte y logotipos) es propiedad de Ciszuko Antony. Se permite citarlo con atribución y enlace; para uso comercial o redistribución necesitas autorización previa. Consulta las páginas de Lineamientos y Licencia.',
  },
  {
    q: '¿Cómo se tratan mis datos y las cookies?',
    a: 'Solo se recopilan los datos necesarios para el funcionamiento del sitio y, con tu consentimiento, para analítica y anuncios. El detalle completo está en la página de Política (privacidad, cookies, anuncios y datos de audiencia).',
  },
  {
    q: '¿Cómo puedo apoyar los proyectos?',
    a: 'Con donaciones en Ko-fi o criptomonedas desde la página de Donar, compartiendo los proyectos en tus redes o contribuyendo al código abierto en GitHub. Cualquier apoyo, grande o pequeño, mantiene el ecosistema en pie.',
  },
  {
    q: '¿Puedo contribuir al código fuente?',
    a: 'Sí. Los proyectos open source del ecosistema aceptan forks, pull requests y reportes de issues en GitHub (github.com/Ciszu-Network). Antes de contribuir, revisa los lineamientos y el estilo de cada proyecto.',
  },
  {
    q: '¿Qué tecnologías se usan en este portfolio?',
    a: 'Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase, Zustand y Framer Motion, entre otras. Todas las tecnologías base y sus autores están listados en la página de Créditos.',
  },
  {
    q: '¿Existe una aplicación de escritorio?',
    a: 'Sí. El portfolio es una PDWA instalable: puedes instalarlo como aplicación desde la página de Downloads, con instrucciones específicas por navegador (Chrome, Edge, Brave, entre otros).',
  },
];

const TOPICS: InfoCardItem[] = [
  {
    icon: 'info',
    title: 'Sobre Ciszuko Antony',
    body: 'Biografía, trayectoria y certificados. Las páginas About y Certificates resumen quién está detrás del proyecto.',
  },
  {
    icon: 'rocket',
    title: 'Proyectos del ecosistema',
    body: 'MuzicMania, CiszuBot, CiszuGamens y las webs de Ciszu Network, con detalles y enlaces en la página de Projects.',
  },
  {
    icon: 'policies',
    title: 'Contenido legal',
    body: 'Lineamientos de uso, reglas de la comunidad, licencia del software y política de privacidad reunidos en el grupo Legal.',
  },
  {
    icon: 'mail',
    title: 'Soporte y contacto',
    body: '¿No encuentras respuesta? Abre una incidencia en Support o escríbenos a través de la página de Contact.',
  },
];

export default function FAQPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="faq"
          title="Preguntas frecuentes"
          subtitle="Respuestas rápidas sobre Ciszuko Antony, Ciszu Network, los proyectos del ecosistema, el uso del contenido y las vías de contacto."
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
            { label: 'Contacto', href: '/contact', icon: 'mail' },
            { label: 'Ver certificados', href: '/certificates', icon: 'certificates', variant: 'ghost' },
            { label: 'Donar', href: '/donate', icon: 'heart', variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
