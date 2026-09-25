'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { InfoCardGrid, InfoCtaRow, InfoHero, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ProjectCard from '@/components/projects/ProjectCard';
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from '@/data/projects';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const AREAS = [
  { icon: 'globe', title: 'Desarrollo web', body: 'Webs y aplicaciones Next.js/React con diseño responsive y rendimiento medido.' },
  { icon: 'robot', title: 'Bots y automatización', body: 'Bots de Discord, WhatsApp y Telegram, scripts y herramientas internas.' },
  { icon: 'gamepad', title: 'Juegos y experiencias', body: 'Juego de ritmo MuzicMania, web y app de escritorio para Windows.' },
  { icon: 'palette', title: 'Identidad visual', body: 'Logos, paletas, iconografía y sistemas de diseño para cada proyecto.' },
];

type Filter = 'Todos' | ProjectCategory;

export default function PortfolioPage() {
  usePageTitle('PORTFOLIO');
  const [filter, setFilter] = useState<Filter>('Todos');

  const filters: Filter[] = ['Todos', ...PROJECT_CATEGORIES];
  const projects = useMemo(
    () => (filter === 'Todos' ? PROJECTS : PROJECTS.filter((project) => project.categories.includes(filter))),
    [filter],
  );

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="palette"
          title="Portfolio"
          subtitle="Trabajos y proyectos de Ciszuko Antony: webs, bots, juego, comunidad, contenido y herramientas. Filtra por categoría y explora cada caso."
          kicker="Trabajos"
          theme={THEME}
        />

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map((item) => {
            const active = item === filter;
            return (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  active
                    ? 'bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-[0_0_15px_rgba(61,106,223,0.3)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <div className="mt-16 mb-16">
          <InfoCardGrid title="Áreas de trabajo" items={AREAS} theme={THEME} columns={4} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: 'Comisiones abiertas', href: '/commissions', icon: 'money' },
            { label: 'Certificados', href: '/certificates', icon: 'certificates' },
            { label: 'Contacto', href: '/contact', icon: 'mail', variant: 'ghost' },
            { label: 'GitHub', href: 'https://github.com/Ciszu-Network/CiszuNetwork', icon: 'external', variant: 'ghost', external: true },
          ]}
        />

        <p className="text-center text-white/30 text-xs mt-8">
          ¿Buscas el índice técnico de todo el ecosistema?{' '}
          <Link href="/projects" className="text-neon-blue hover:text-white transition-colors">
            Ver Projects
          </Link>
        </p>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
