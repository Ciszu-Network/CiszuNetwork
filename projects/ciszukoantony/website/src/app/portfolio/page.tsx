'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { InfoCardGrid, InfoCtaRow, InfoHero, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
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

type Filter = 'Todos' | ProjectCategory;

export default function PortfolioPage() {
  usePageTitle('PORTFOLIO');
  const dict = useDict();
  const [filter, setFilter] = useState<Filter>('Todos');

  const areas = [
    { icon: 'globe', title: dict.portfolio.areaWeb, body: dict.portfolio.areaWebBody },
    { icon: 'robot', title: dict.portfolio.areaBots, body: dict.portfolio.areaBotsBody },
    { icon: 'gamepad', title: dict.portfolio.areaGames, body: dict.portfolio.areaGamesBody },
    { icon: 'palette', title: dict.portfolio.areaBrand, body: dict.portfolio.areaBrandBody },
  ];

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
          subtitle={dict.portfolio.subtitle}
          kicker={dict.portfolio.kicker}
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
                {item === 'Todos' ? dict.portfolio.all : item}
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
          <InfoCardGrid title={dict.portfolio.areas} items={areas} theme={THEME} columns={4} />
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: dict.portfolio.ctaCommissions, href: '/commissions', icon: 'money' },
            { label: dict.portfolio.ctaCertificates, href: '/certificates', icon: 'certificates' },
            { label: dict.portfolio.ctaContact, href: '/contact', icon: 'mail', variant: 'ghost' },
            { label: 'GitHub', href: 'https://github.com/Ciszu-Network/CiszuNetwork', icon: 'external', variant: 'ghost', external: true },
          ]}
        />

        <p className="text-center text-white/30 text-xs mt-8">
          {dict.portfolio.seekIndex}{' '}
          <Link href="/projects" className="text-neon-blue hover:text-white transition-colors">
            {dict.portfolio.goProjects}
          </Link>
        </p>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
