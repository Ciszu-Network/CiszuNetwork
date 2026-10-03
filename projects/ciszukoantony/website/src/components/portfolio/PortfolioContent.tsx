'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { InfoCardGrid, InfoCtaRow, InfoHero, Icon, captureEvent, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ProjectCard from '@/components/projects/ProjectCard';
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from '@/data/projects';
import { CERTIFICATES } from '@/data/certificates';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

type Filter = 'Todos' | ProjectCategory;

/**
 * `/portfolio` — galería de trabajos de Ciszuko Antony. El currículum vive en
 * su propia página (`/curriculum`), centrada en la previsualización de los CV;
 * aquí quedan lo general y los trabajos del ecosistema.
 */
export default function PortfolioContent() {
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
          icon="portfolio"
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
                onClick={() => {
                  setFilter(item);
                  captureEvent('portfolio_filter', { filter: item });
                }}
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

        <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-neon-cyan mb-6">
          <Icon name="user" size={16} />
          Proyectos personales de Ciszuko Antony
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <div className="mt-16 mb-16">
          <InfoCardGrid title={dict.portfolio.areas} items={areas} theme={THEME} columns={4} />
        </div>

        {/* Puente al currículum (página independiente con los 3 CV) */}
        <Link
          href="/curriculum"
          onClick={() => captureEvent('portfolio_curriculum_open')}
          className="group flex flex-col md:flex-row md:items-center gap-6 p-8 mb-16 rounded-[2rem] bg-gradient-to-br from-neon-purple/10 to-transparent border border-neon-purple/30 hover:border-neon-purple/60 transition-all"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neon-purple/10 border border-neon-purple/40 text-neon-purple group-hover:scale-110 transition-transform">
            <Icon name="certificates" size={26} />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-header font-black uppercase italic text-white">
              Currículum · {CERTIFICATES.length} documentos verificables
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mt-1">
              Los 3 currículums en PDF con previsualización en pantalla, experiencia, formación, habilidades, idiomas y
              certificaciones. La trayectoria completa vive en su propia página.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-[11px] font-header font-black uppercase tracking-widest text-neon-purple shrink-0">
            Ver currículum
            <Icon name="chevronRight" size={13} />
          </span>
        </Link>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: dict.portfolio.ctaCommissions, href: '/commissions', icon: 'money' },
            { label: dict.portfolio.ctaCertificates, href: '/certificates', icon: 'certificates' },
            { label: 'Socials', href: '/socials', icon: 'share' },
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

      <div className="print:hidden">
        <QuickDocks />
      </div>
    </div>
  );
}
