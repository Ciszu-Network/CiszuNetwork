import type { Metadata } from 'next';
import {
  InfoHero,
  InfoFaqExplorer,
  InfoCardGrid,
  InfoCtaRow,
  type InfoTheme,
  type InfoFaqItem,
  type InfoFaqCategory,
  type InfoFaqCopy,
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

const CATEGORIES: InfoFaqCategory[] = [
  {
    id: 'perfil',
    label: 'Sobre mí',
    icon: 'user',
    accent: 'text-neon-blue',
    accentBg: 'bg-neon-blue/10',
    accentBorder: 'border-neon-blue/40',
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    icon: 'rocket',
    accent: 'text-neon-purple',
    accentBg: 'bg-neon-purple/10',
    accentBorder: 'border-neon-purple/40',
  },
  {
    id: 'certificados',
    label: 'Certificados',
    icon: 'certificates',
    accent: 'text-neon-green',
    accentBg: 'bg-neon-green/10',
    accentBorder: 'border-neon-green/40',
  },
  {
    id: 'contenido',
    label: 'Contenido',
    icon: 'camera',
    accent: 'text-neon-pink',
    accentBg: 'bg-neon-pink/10',
    accentBorder: 'border-neon-pink/40',
  },
  {
    id: 'privacidad',
    label: 'Privacidad',
    icon: 'lock',
    accent: 'text-neon-yellow',
    accentBg: 'bg-neon-yellow/10',
    accentBorder: 'border-neon-yellow/40',
  },
  {
    id: 'soporte',
    label: 'Soporte y contacto',
    icon: 'mail',
    accent: 'text-brand-light',
    accentBg: 'bg-brand-light/10',
    accentBorder: 'border-brand-light/40',
  },
];

const FAQ_COPY: InfoFaqCopy = {
  searchPlaceholder: 'Busca por proyecto, certificado o palabra clave…',
  allCategories: 'Todas',
  results: '{n} de {total} preguntas',
  emptyTitle: 'Sin resultados',
  emptyHint: 'Prueba con otra palabra o cambia de categoría.',
  clear: 'Limpiar filtros',
};

const FAQS: InfoFaqItem[] = [
  {
    category: 'perfil',
    q: '¿Quién es Ciszuko Antony?',
    a: 'Ciszuko Antony (Francisco Garcia) es desarrollador full-stack, CEO y fundador de Ciszu Network. Desde Venezuela crea aplicaciones web, bots, juegos, herramientas y contenido digital; este portfolio reúne su obra, sus certificados, su música y su documentación oficial.',
    tags: 'quien es ciszuko antony francisco garcia desarrollador ceo fundador',
  },
  {
    category: 'perfil',
    q: '¿Qué es Ciszu Network?',
    a: 'Ciszu Network es el ecosistema digital fundado por Ciszuko Antony: agrupa las webs del ecosistema, el juego MuzicMania, el bot CiszuBot, la comunidad Ciszugamens y la infraestructura que los conecta. Toda la información está en ciszunetwork.vercel.app.',
    tags: 'ciszu network ecosistema empresa proyectos',
  },
  {
    category: 'perfil',
    q: '¿Qué tecnologías se usan en este portfolio?',
    a: 'Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase, Zustand y Framer Motion, entre otras. Todas las tecnologías base y sus autores están listados en la página de Créditos.',
    tags: 'tecnologias stack nextjs react typescript tailwind supabase',
  },
  {
    category: 'perfil',
    q: '¿Cómo empezaste en el desarrollo?',
    a: 'Ciszuko Antony empezó creando herramientas y servidores para su propia comunidad y convirtió ese trabajo en Ciszu Network: hoy desarrolla webs, bots, juegos y aplicaciones de escritorio, y documenta cada proyecto en abierto.',
    tags: 'trayectoria historia empezar desarrollo experiencia',
  },
  {
    category: 'proyectos',
    q: '¿Qué proyectos forman parte del ecosistema?',
    a: 'Además del portfolio, se documentan MuzicMania (juego de ritmo), CiszuBot (bot de Discord), CiszuGamens (comunidad gamer) y herramientas como la aplicación de escritorio PDWA. Puedes verlos todos en Projects y Downloads.',
    tags: 'proyectos ecosistema muzicmania ciszubot ciszugamens pdwa',
  },
  {
    category: 'proyectos',
    q: '¿Existe una aplicación de escritorio?',
    a: 'Sí. El portfolio es una PDWA instalable: puedes instalarlo como aplicación desde la página de Downloads, con instrucciones específicas por navegador (Chrome, Edge, Brave, entre otros).',
    tags: 'aplicacion escritorio pdwa instalar descargar pwa',
  },
  {
    category: 'proyectos',
    q: '¿Cómo sigo las novedades de los proyectos?',
    a: 'Cada proyecto publica sus cambios en su changelog y en el repositorio de GitHub. Las redes oficiales anuncian lanzamientos, y la página de Stats resume las métricas del ecosistema.',
    tags: 'novedades changelog github stats actualizaciones',
  },
  {
    category: 'certificados',
    q: '¿Qué certificados y logros tiene?',
    a: 'El catálogo completo está en la página de Certificates: certificaciones, cursos y reconocimientos con su emisor y fecha. Cada certificado se muestra como referencia de formación verificable, no como acreditación oficial de terceros.',
    tags: 'certificados logros cursos reconocimientos formacion',
  },
  {
    category: 'certificados',
    q: '¿Cómo verifico un certificado?',
    a: 'Cada certificado del catálogo muestra su referencia, el emisor y la fecha real extraída del documento. Desde la ficha puedes abrir el original para comprobarlo con la entidad emisora.',
    tags: 'verificar certificado referencia emisor validez',
  },
  {
    category: 'certificados',
    q: '¿Por qué algunos documentos no muestran fecha?',
    a: 'Cuando el documento no incluye una fecha legible (por ejemplo, una imagen con datos censurados) no se inventa ninguna: la ficha lo indica explícitamente en lugar de mostrar un dato falso.',
    tags: 'documentos fecha censurada certificado informacion',
  },
  {
    category: 'contenido',
    q: '¿Puedo usar el contenido de este portfolio?',
    a: 'El contenido multimedia (fotos, vídeos, música, arte y logotipos) es propiedad de Ciszuko Antony. Se permite citarlo con atribución y enlace; para uso comercial o redistribución necesitas autorización previa. Consulta las páginas de Lineamientos y Licencia.',
    tags: 'usar contenido copyright licencia atribucion permisos',
  },
  {
    category: 'contenido',
    q: '¿Dónde puedo escuchar la música?',
    a: 'La música está publicada en Spotify y enlazada desde este portfolio; los vídeos y directos viven en YouTube y Twitch. Todas las cuentas oficiales están listadas en la página de Contacto.',
    tags: 'musica spotify youtube twitch escuchar videos directos',
  },
  {
    category: 'contenido',
    q: '¿Aceptas encargos o colaboraciones?',
    a: 'Sí. Envía tu propuesta por la página de Contacto con el área, el alcance y enlaces a trabajo previo. Las propuestas de colaboración, patrocinio o encargos profesionales se responden por el mismo canal.',
    tags: 'encargos colaboraciones propuesta patrocinio trabajo',
  },
  {
    category: 'privacidad',
    q: '¿Cómo se tratan mis datos y las cookies?',
    a: 'Solo se recopilan los datos necesarios para el funcionamiento del sitio y, con tu consentimiento, para analítica y anuncios. El detalle completo está en la página de Política (privacidad, cookies, anuncios y datos de audiencia).',
    tags: 'datos privacidad cookies analitica consentimiento',
  },
  {
    category: 'privacidad',
    q: '¿Qué pasa con los anuncios del sitio?',
    a: 'El sitio puede mostrar anuncios para financiar su mantenimiento. Si usas un bloqueador, algunas secciones avisan porque dependen de esos ingresos; la experiencia principal del portfolio sigue disponible.',
    tags: 'anuncios publicidad bloqueador ads ingresos',
  },
  {
    category: 'privacidad',
    q: '¿Puedo desactivar la analítica?',
    a: 'Sí. La analítica solo se activa con tu consentimiento y puedes retirarlo en cualquier momento desde el banner de cookies o la configuración del navegador.',
    tags: 'analitica desactivar consentimiento cookies privacidad',
  },
  {
    category: 'soporte',
    q: '¿Cómo puedo contactar o colaborar con Ciszuko Antony?',
    a: 'A través de la página de Contact: formulario, correo, WhatsApp y redes oficiales. Para propuestas de colaboración, patrocinio o encargos profesionales, indica el proyecto y el alcance en el mensaje para recibir una respuesta más precisa.',
    tags: 'contactar colaborar formulario correo whatsapp propuesta',
  },
  {
    category: 'soporte',
    q: '¿Cuáles son las redes oficiales?',
    a: 'GitHub (Ciszu-Network), YouTube, Discord (Ciszugamens), X, Instagram, TikTok, Twitch, LinkedIn, Facebook, Pinterest, Spotify y WhatsApp. Cualquier otra cuenta que afirme representar al proyecto no es oficial: desconfía de suplantaciones.',
    tags: 'redes oficiales github youtube discord instagram tiktok twitch',
  },
  {
    category: 'soporte',
    q: '¿Cómo puedo apoyar los proyectos?',
    a: 'Con donaciones en Ko-fi o criptomonedas desde la página de Donar, compartiendo los proyectos en tus redes o contribuyendo al código abierto en GitHub. Cualquier apoyo, grande o pequeño, mantiene el ecosistema en pie.',
    tags: 'apoyar donar kofi criptomonedas compartir',
  },
  {
    category: 'soporte',
    q: '¿Puedo contribuir al código fuente?',
    a: 'Sí. Los proyectos open source del ecosistema aceptan forks, pull requests y reportes de issues en GitHub (github.com/Ciszu-Network). Antes de contribuir, revisa los lineamientos y el estilo de cada proyecto.',
    tags: 'contribuir codigo github open source pull request issue fork',
  },
  {
    category: 'soporte',
    q: '¿Cómo reporto un error en el sitio?',
    a: 'Usa la página de Support para abrir una incidencia con la página afectada, el navegador y una captura. También puedes escribir desde la página de Contacto o abrir un issue en GitHub.',
    tags: 'error bug reporte incidencia sitio web soporte',
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
          <InfoFaqExplorer items={FAQS} categories={CATEGORIES} theme={THEME} copy={FAQ_COPY} />
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
