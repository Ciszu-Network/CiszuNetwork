'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { InfoHero, InfoLinkGrid, InfoCtaRow, type InfoLinkGroup, type InfoTheme } from '@ciszu/ui';
import { getDict, parseLang } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';

/**
 * Índice completo del sitio.
 *
 * Antes esta página listaba solo 7 secciones y el header metía en su desplegable
 * "Information" páginas que no son institucionales (changelog, reviews,
 * leaderboard, stats, downloads, feedback). Ahora esas seis viven en el header
 * como navegación primaria y aquí quedan TODAS indexadas por grupos, con la
 * misma estructura que MuzicMania.
 */
const GROUPS: InfoLinkGroup[] = [
  {
    title: 'Producto',
    items: [
      { name: 'home', href: '/', icon: 'home', desc: 'Portada, estado del bot e invitación' },
      { name: 'commands', href: '/commands', icon: 'gamepad', desc: 'Todos los comandos y sus alias' },
      { name: 'documentation', href: '/documentation', icon: 'policies', desc: 'Guías técnicas y API' },
      { name: 'downloads', href: '/downloads', icon: 'download', desc: 'Apps de escritorio y recursos' },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { name: 'changelog', href: '/changelog', icon: 'history', desc: 'Historial de cambios por versión' },
      { name: 'reviews', href: '/reviews', icon: 'star', desc: 'Reseñas verificadas de la comunidad' },
      { name: 'leaderboard', href: '/leaderboard', icon: 'trophy', desc: 'Ranking de servidores y usuarios' },
      { name: 'stats', href: '/stats', icon: 'signal', desc: 'Métricas, uptime y latencia' },
      { name: 'forum', href: '/forum', icon: 'comment', desc: 'Debates y anuncios de la comunidad' },
      { name: 'feedback', href: '/feedback', icon: 'message', desc: 'Reporta bugs y propone ideas' },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { name: 'help', href: '/help', icon: 'help', desc: 'Centro de ayuda paso a paso' },
      { name: 'faq', href: '/faq', icon: 'help', desc: 'Preguntas frecuentes' },
      { name: 'support', href: '/support', icon: 'support', desc: 'Abrir una incidencia' },
      { name: 'contact', href: '/contact', icon: 'mail', desc: 'Correo y canales oficiales' },
    ],
  },
  {
    title: 'Institucional',
    items: [
      { name: 'information', href: '/information', icon: 'info', desc: 'Este índice de secciones' },
      { name: 'about', href: '/about', icon: 'info', desc: 'Qué es CiszuBot y quién lo hace' },
      { name: 'team', href: '/team', icon: 'users', desc: 'Equipo detrás del proyecto' },
      { name: 'Créditos', href: '/credits', icon: 'trophy', desc: 'Dirección, tecnologías y proyectos del ecosistema' },
      { name: 'donate', href: '/donate', icon: 'heart', desc: 'Apoya el desarrollo' },
      { name: 'privacidad', href: '/privacy', icon: 'lock', desc: 'Política de privacidad' },
      { name: 'terminos', href: '/terms', icon: 'shield', desc: 'Términos y condiciones' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { name: 'Lineamientos', href: '/guidelines', icon: 'policies', desc: 'Uso, integración y estándares del bot' },
      { name: 'Reglas', href: '/rules', icon: 'shield', desc: 'Convivencia y uso aceptable en Discord' },
      { name: 'Licencia', href: '/license', icon: 'certificates', desc: 'MIT y propiedad intelectual' },
      { name: 'Política', href: '/policy', icon: 'lock', desc: 'Privacidad, datos, cookies y anuncios' },
    ],
  },
];

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};

export default function InformationPage() {
  const pathname = usePathname();
  const [dict, setDict] = useState(() => getDict('es-latam'));

  useEffect(() => {
    const cookie = document.cookie.split('; ').find((row) => row.startsWith('ciszubot_lang='));
    setDict(getDict(parseLang(cookie?.split('=')[1])));
  }, []);

  const groups = GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      name: (dict.nav as Record<string, string>)[item.name] ?? item.name,
    })),
  }));

  return (
    <div className="bg-bg min-h-screen py-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <InfoHero
          icon="info"
          title={dict.nav.information}
          subtitle="Índice completo de CiszuBot: todas las secciones del sitio agrupadas por producto, contenido, soporte e información institucional."
          theme={THEME}
        />

        <InfoLinkGrid groups={groups} theme={THEME} currentPath={pathname} />

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: dict.nav.commands, href: '/commands', icon: 'gamepad' },
            { label: dict.nav.support, href: '/support', icon: 'support', variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
