import type { Metadata } from 'next';
import { InfoHero, InfoLinkGrid, InfoCtaRow, type InfoLinkGroup, type InfoTheme } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'Ciszu Network | INFORMATION',
  description:
    'Índice completo de Ciszu Network: proyectos, contenido, soporte e información institucional.',
};

/**
 * Índice completo del sitio.
 *
 * Antes esta página pintaba `item.icon` —una cadena como `'info'`— dentro de un
 * <div>, así que no se veía ningún icono. Ahora usa los bloques compartidos de
 * `@ciszu/ui` con iconos reales del CDN y agrupa TODAS las secciones, incluidas
 * las que viven en el header (changelog, reviews, leaderboard, stats, downloads,
 * feedback) y que ya no están dentro del desplegable "Information".
 */
const GROUPS: InfoLinkGroup[] = [
  {
    title: 'Producto',
    items: [
      { name: 'Inicio', href: '/', icon: 'home', desc: 'Portada, ecosistema y proyectos destacados' },
      { name: 'Productos', href: '/projects', icon: 'rocket', desc: 'CiszuGamens, CiszuBot, MuzicMania y más' },
      { name: 'Courses', href: '/courses', icon: 'certificates', desc: 'Formación y recursos de aprendizaje' },
      { name: 'Documentación', href: '/documentation', icon: 'policies', desc: 'Guías técnicas y referencia de API' },
      { name: 'Descargas', href: '/downloads', icon: 'download', desc: 'Aplicaciones de escritorio (PDWA)' },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { name: 'Changelog', href: '/changelog', icon: 'history', desc: 'Historial de cambios por versión' },
      { name: 'Reviews', href: '/reviews', icon: 'star', desc: 'Reseñas verificadas de la comunidad' },
      { name: 'Leaderboard', href: '/leaderboard', icon: 'trophy', desc: 'Clasificación de usuarios y equipos' },
      { name: 'Stats', href: '/stats', icon: 'signal', desc: 'Métricas de proyectos e infraestructura' },
      { name: 'Foro', href: '/forum', icon: 'comment', desc: 'Debates, anuncios y comunidad' },
      { name: 'Feedback', href: '/feedback', icon: 'message', desc: 'Reportes de bugs y sugerencias' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'Centro de ayuda', href: '/help', icon: 'help', desc: 'Guías paso a paso y solución de problemas' },
      { name: 'FAQ', href: '/faq', icon: 'faq', desc: 'Preguntas frecuentes' },
      { name: 'Soporte', href: '/support', icon: 'support', desc: 'Abrir una incidencia técnica' },
      { name: 'Contacto', href: '/contact', icon: 'mail', desc: 'Correo, WhatsApp y redes oficiales' },
    ],
  },
  {
    title: 'Institucional',
    items: [
      { name: 'Information', href: '/information', icon: 'info', desc: 'Este índice de secciones' },
      { name: 'Sobre nosotros', href: '/about', icon: 'info', desc: 'Misión, visión y compañía' },
      { name: 'Equipo', href: '/team', icon: 'team', desc: 'Quién está detrás de Ciszu Network' },
      { name: 'Políticas', href: '/policies', icon: 'terms', desc: 'Términos, privacidad y cookies' },
      { name: 'Donar', href: '/donate', icon: 'heart', desc: 'Apoya el desarrollo del ecosistema' },
    ],
  },
];

const PAGE_TITLE = 'Information';

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

export default function InformationPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <InfoHero
          icon="info"
          title={PAGE_TITLE}
          subtitle="Índice completo de Ciszu Network: todos los proyectos, secciones de contenido, soporte e información institucional en un solo lugar."
          theme={THEME}
        />

        <InfoLinkGrid groups={GROUPS} theme={THEME} />

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Ver proyectos', href: '/projects', icon: 'rocket' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
