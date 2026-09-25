'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { InfoHero, InfoLinkGrid, InfoCtaRow, type InfoLinkGroup, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';

/**
 * Índice completo del sitio.
 *
 * Las secciones vivas (changelog, reviews, leaderboard, stats, downloads y
 * feedback) ya NO se indexan dentro del desplegable "Information" del header:
 * son navegación primaria. Aquí sí aparecen todas, agrupadas, para que la
 * página siga siendo el índice completo del sitio.
 */
const GROUPS: InfoLinkGroup[] = [
  {
    title: 'Producto',
    items: [
      { name: 'Home', href: '/', icon: 'home', desc: 'Portada y proyectos destacados' },
      { name: 'Projects', href: '/projects', icon: 'rocket', desc: 'Todos los proyectos de Ciszuko Antony' },
      { name: 'Certificates', href: '/certificates', icon: 'certificates', desc: 'Catálogo de certificados y logros' },
      { name: 'Documentation', href: '/documentation', icon: 'policies', desc: 'Guías técnicas y referencia' },
      { name: 'Downloads', href: '/downloads', icon: 'download', desc: 'Aplicación de escritorio (PDWA)' },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { name: 'Changelog', href: '/changelog', icon: 'history', desc: 'Historial de cambios por versión' },
      { name: 'Reviews', href: '/reviews', icon: 'star', desc: 'Reseñas verificadas de la comunidad' },
      { name: 'Stats', href: '/stats', icon: 'signal', desc: 'Métricas de proyectos y audiencia' },
      { name: 'Forum', href: '/forum', icon: 'comment', desc: 'Debates y comunidad' },
      { name: 'Feedback', href: '/feedback', icon: 'message', desc: 'Reportes y sugerencias' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'Help', href: '/help', icon: 'help', desc: 'Centro de ayuda paso a paso' },
      { name: 'FAQ', href: '/faq', icon: 'faq', desc: 'Preguntas frecuentes' },
      { name: 'Support', href: '/support', icon: 'support', desc: 'Abrir una incidencia' },
      { name: 'Contact', href: '/contact', icon: 'mail', desc: 'Correo y canales oficiales' },
    ],
  },
  {
    title: 'Institucional',
    items: [
      { name: 'Information', href: '/information', icon: 'info', desc: 'Este índice de secciones' },
      { name: 'About', href: '/about', icon: 'info', desc: 'Quién es Ciszuko Antony' },
      { name: 'Team', href: '/team', icon: 'team', desc: 'Equipo detrás del proyecto' },
      { name: 'Créditos', href: '/credits', icon: 'trophy', desc: 'Autoría, tecnologías base y proyectos' },
      { name: 'Policies', href: '/policies', icon: 'terms', desc: 'Términos, privacidad y cookies' },
      { name: 'Donar', href: '/donate', icon: 'heart', desc: 'Apoya los proyectos' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { name: 'Guidelines', href: '/guidelines', icon: 'policies', desc: 'Uso, contenido y estándares del portfolio' },
      { name: 'Rules', href: '/rules', icon: 'shield', desc: 'Conducta y uso aceptable de la comunidad' },
      { name: 'License', href: '/license', icon: 'certificates', desc: 'Licencia MIT y propiedad intelectual' },
      { name: 'Policy', href: '/policy', icon: 'lock', desc: 'Privacidad, datos, cookies y anuncios' },
    ],
  },
];

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

export default function InformationPage() {
  usePageTitle('INFORMATION');
  const pathname = usePathname();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <InfoHero
          icon="info"
          title="Information"
          subtitle="Índice completo de Ciszuko Antony: proyecto, contenido, soporte e información institucional, con todas las secciones del sitio enlazadas."
          theme={THEME}
        />

        <InfoLinkGrid groups={GROUPS} theme={THEME} currentPath={pathname} />

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Ver certificados', href: '/certificates', icon: 'certificates' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
