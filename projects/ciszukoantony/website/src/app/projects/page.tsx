'use client';

import Link from 'next/link';
import { Icon, InfoHero, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ProjectsExplorer from '@/components/projects/ProjectsExplorer';
import { PROJECTS, PROJECT_CATEGORIES } from '@/data/projects';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const STATS = [
  { icon: 'rocket', value: `${PROJECTS.length}`, label: 'Proyectos', sub: 'Cuatro mundos propios' },
  { icon: 'flag', value: `${PROJECT_CATEGORIES.length}`, label: 'Categorías', sub: 'Contenido, música, persona y empresa' },
  { icon: 'certificates', value: '100%', label: 'Autoría propia', sub: 'Código, música y arte' },
  { icon: 'heart', value: '2022', label: 'Desde', sub: 'Creando y publicando' },
];

/**
 * `/projects` — índice de los proyectos personales de Ciszuko Antony:
 * la marca (él mismo), MusicBoard, Francisco García (persona) y
 * Ciszu Network (empresa). Cada card abre su ficha en un modal con el botón
 * directo al proyecto; el explorador añade búsqueda, filtros y orden.
 */
export default function ProjectsPage() {
  const dict = useDict();
  usePageTitle('PROJECTS');
  return (
    <div className="relative min-h-screen px-4 pb-20 pt-24">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="portfolio"
          title="Projects"
          subtitle="Los cuatro mundos de Ciszuko Antony: la marca de contenido, MusicBoard, la persona y la empresa. Cada proyecto con su página propia."
          kicker="Portfolio personal"
          theme={THEME}
        />

        <div className="mb-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 text-center">
              <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-neon-blue/30 bg-neon-blue/10 text-neon-blue">
                <Icon name={stat.icon} size={20} />
              </span>
              <p className="font-header text-3xl font-black text-white">{stat.value}</p>
              <p className="mt-1 font-header text-xs font-bold text-neon-blue">{stat.label}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-widest text-white/35">{stat.sub}</p>
            </div>
          ))}
        </div>

        <ProjectsExplorer />

        <div className="mt-16 rounded-[2rem] border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 to-transparent p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-neon-blue/30 bg-neon-blue/10 text-neon-blue">
            <Icon name="portfolio" size={22} />
          </span>
          <h2 className="mb-3 font-header text-xl font-bold text-white">{dict.projects.exploreVisual}</h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-white/50">
            Además de estas páginas, el portfolio reúne los trabajos con galería visual y el currículum
            vive con sus 2 versiones del CV (Custom y LinkedIn) en PDF y certificados verificables.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neon-blue/40 bg-neon-blue/20 px-6 py-3 text-sm font-bold text-neon-blue transition-all hover:bg-neon-blue hover:text-white"
            >
              <Icon name="camera" size={16} />
              {dict.projects.goPortfolio}
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <Icon name="terms" size={16} />
              {dict.projects.viewCurriculum}
            </Link>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
