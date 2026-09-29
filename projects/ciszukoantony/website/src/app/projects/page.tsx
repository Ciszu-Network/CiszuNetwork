'use client';

import React from 'react';
import Link from 'next/link';
import { Icon, InfoHero, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ProjectCard from '@/components/projects/ProjectCard';
import { ALL_PROJECTS, NETWORK_PROJECTS, PROJECTS } from '@/data/projects';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

const STATS = [
  { value: `${ALL_PROJECTS.length}`, label: 'Proyectos', sub: 'Propios y de Ciszu Network' },
  { value: '4', label: 'Webs Next.js', sub: 'Un solo monorepo' },
  { value: '100%', label: 'Autoría propia', sub: 'Código, diseño y arte' },
];

export default function ProjectsPage() {
  const dict = useDict();
  usePageTitle('PROJECTS');
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="rocket"
          title="Projects"
          subtitle="Proyectos personales de Ciszuko Antony y proyectos de Ciszu Network: webs, bots, juego, comunidad y contenido. Un ecosistema construido desde cero."
          kicker="Portfolio"
          theme={THEME}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
              <p className="text-3xl font-header font-black text-neon-blue">{stat.value}</p>
              <p className="text-white font-header font-bold text-sm mt-1">{stat.label}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-neon-cyan mb-6">
          <Icon name="user" size={16} />
          Proyectos personales de Ciszuko Antony
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-neon-pink mt-14 mb-6">
          <Icon name="server" size={16} />
          Proyectos de Ciszu Network
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {NETWORK_PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <div className="mt-14 text-center p-8 rounded-[2rem] bg-gradient-to-br from-neon-blue/10 to-transparent border border-neon-blue/30">
          <h2 className="text-xl font-header font-bold text-white mb-3">{dict.projects.wantMore}</h2>
          <p className="text-white/50 text-sm mb-6 max-w-xl mx-auto">
            Explora el portfolio visual, revisa los certificados verificables o escríbeme para
            colaboraciones y comisiones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-xl font-bold text-sm hover:bg-neon-blue hover:text-white transition-all"
            >
              {dict.projects.viewPortfolio}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
            >
              Contacto
            </Link>
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
