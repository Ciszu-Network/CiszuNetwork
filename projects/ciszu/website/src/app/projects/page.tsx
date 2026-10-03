'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Icon, InfoHero, type InfoTheme } from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import QuickDocks from '@/components/molecules/QuickDocks';
import ProjectsExplorer from '@/components/projects/ProjectsExplorer';
import { CISZU_NETWORK, GITHUB_REPO } from '@/config/site';
import { PROJECTS, PROJECT_CATEGORIES, PROJECT_STACK_COUNT } from '@/data/projects';
import { useDict } from '@/lib/useDict';
import { fillTemplate } from '@/lib/i18n';

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

const STATS = [
  { icon: 'rocket', value: `${PROJECTS.length}`, label: 'Proyectos', sub: 'Del ecosistema' },
  { icon: 'flag', value: `${PROJECT_CATEGORIES.length}`, label: 'Categorías', sub: 'Para filtrar' },
  { icon: 'terminal', value: `${PROJECT_STACK_COUNT}`, label: 'Tecnologías', sub: 'En los stacks' },
  { icon: 'heart', value: '100%', label: 'Autoría propia', sub: 'Código, arte y música' },
];

/**
 * `/projects` — índice gigante del ecosistema.
 *
 * Cada proyecto es un mundo: card con su isotipo, sus colores, su tagline y
 * su stack; el explorador añade búsqueda por texto, filtros por categoría y
 * orden ascendente/descendente. Al abrir una card se muestra su ficha en un
 * modal personalizado con el botón directo a su página.
 */
export default function ProjectsPage() {
  const t = useDict();
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="rocket"
          title={t.projectsPage.heroTitle}
          subtitle={fillTemplate(t.projectsPage.heroSubtitle, { site: CISZU_NETWORK.name })}
          kicker={t.projectsPage.kicker}
          theme={THEME}
        />

        {/* Cifras reales del catálogo */}
        <div className="mb-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 text-center">
              <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand-light">
                <Icon name={stat.icon} size={20} />
              </span>
              <p className="font-header text-3xl font-black text-white">{stat.value}</p>
              <p className="mt-1 font-header text-xs font-bold text-brand-light">{stat.label}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-widest text-white/35">{stat.sub}</p>
            </div>
          ))}
        </div>

        <ProjectsExplorer />

        <div className="mt-16 rounded-[2rem] border border-brand/30 bg-gradient-to-br from-brand/10 to-transparent p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand-light">
            <Icon name="terminal" size={22} />
          </span>
          <h2 className="mb-3 font-header text-xl font-bold text-white">{t.projectsPage.builtTitle}</h2>
          <p className="mx-auto mb-6 max-w-xl text-sm text-gray-400">{t.projectsPage.builtDesc}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
            >
              <ExternalLink className="w-4 h-4" /> {t.projectsPage.githubRepo}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all"
            >
              {t.projectsPage.workWithUs} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
