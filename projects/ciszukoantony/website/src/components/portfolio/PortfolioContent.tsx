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
import SkillLogo from '@/components/shared/SkillLogo';
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from '@/data/projects';
import { CERTIFICATES } from '@/data/certificates';
import { PROFILE, PROFILE_ROLES, PROFILE_ASPIRATIONS, PROFILE_FACTS } from '@/data/profile';

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
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'az' | 'stack'>('recent');

  const areas = [
    { icon: 'globe', title: dict.portfolio.areaWeb, body: dict.portfolio.areaWebBody },
    { icon: 'robot', title: dict.portfolio.areaBots, body: dict.portfolio.areaBotsBody },
    { icon: 'gamepad', title: dict.portfolio.areaGames, body: dict.portfolio.areaGamesBody },
    { icon: 'palette', title: dict.portfolio.areaBrand, body: dict.portfolio.areaBrandBody },
  ];

  const filters: Filter[] = ['Todos', ...PROJECT_CATEGORIES];

  const projects = useMemo(() => {
    let list = filter === 'Todos' ? [...PROJECTS] : PROJECTS.filter((project) => project.categories.includes(filter));
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (project) =>
          project.name.toLowerCase().includes(q) ||
          project.tagline.toLowerCase().includes(q) ||
          project.description.toLowerCase().includes(q) ||
          project.stack.some((s) => s.toLowerCase().includes(q)) ||
          project.keywords.some((k) => k.toLowerCase().includes(q)),
      );
    }
    if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'stack') list.sort((a, b) => b.stack.length - a.stack.length);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filter, query, sort]);

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

        {/* Perfil profesional + datos clave */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-12">
          <div className="p-7 rounded-[2rem] bg-gradient-to-br from-neon-blue/10 via-transparent to-transparent border border-neon-blue/30">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-neon-blue mb-3">Perfil profesional</p>
            <h2 className="text-2xl font-header font-black uppercase italic text-white mb-3">
              {PROFILE.name}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{PROFILE.summary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROFILE_FACTS.map((fact) => (
                <div key={fact.label} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <Icon name={fact.icon} size={15} className="text-neon-blue shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">{fact.label}</p>
                    <p className="text-xs text-gray-200 font-medium truncate">{fact.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-7 rounded-[2rem] bg-gradient-to-br from-neon-pink/10 via-transparent to-transparent border border-neon-pink/30">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-neon-pink mb-4">Qué hago</p>
            <div className="space-y-3">
              {PROFILE_ROLES.slice(0, 4).map((role) => (
                <div key={role.title} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink">
                    <Icon name={role.icon} size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-header font-bold">{role.title}</p>
                    <p className="text-[11px] text-gray-500 leading-snug">{role.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aspiraciones */}
        <div className="flex flex-wrap items-center gap-2 p-6 rounded-2xl bg-white/[0.03] border border-white/10 mb-12">
          <Icon name="target" size={16} className="text-neon-green shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-green mr-2">Aspiraciones</span>
          {PROFILE_ASPIRATIONS.map((asp) => (
            <span key={asp} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300">
              {asp}
            </span>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Icon name="search" size={16} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                captureEvent('portfolio_search', { q: e.target.value });
              }}
              placeholder="Buscar por nombre, stack o palabra clave…"
              className="w-full py-3 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-gray-600 outline-none focus:border-neon-blue/60 focus:bg-white/[0.07] transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'recent', label: 'Recientes', icon: 'clock' },
                { id: 'az', label: 'A-Z', icon: 'sort' },
                { id: 'stack', label: 'Por stack', icon: 'stack' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSort(opt.id);
                  captureEvent('portfolio_sort', { sort: opt.id });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  sort === opt.id
                    ? 'bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-[0_0_15px_rgba(61,106,223,0.3)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                <Icon name={opt.icon} size={12} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

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
          <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-gray-500 normal-case tracking-normal">
            <Icon name="stack" size={12} />
            {projects.length} de {PROJECTS.length}
          </span>
        </h2>
        {projects.length === 0 ? (
          <div className="p-12 rounded-[2rem] bg-white/[0.03] border border-dashed border-white/15 text-center">
            <p className="text-3xl mb-3">🔎</p>
            <p className="text-white font-header font-black uppercase tracking-widest">Sin resultados</p>
            <p className="text-gray-500 text-sm mt-2">No hay proyectos que coincidan con «{query}». Prueba otra búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}

        <div className="mt-16 mb-16">
          <InfoCardGrid title={dict.portfolio.areas} items={areas} theme={THEME} columns={4} />
        </div>

        {/* Puente al currículum (página independiente con las 2 versiones) */}
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
              Currículum actualizado · {CERTIFICATES.length} documentos verificables
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mt-1">
              2 versiones oficiales (Custom y LinkedIn) en PDF con previsualización en pantalla, actualizadas a
              octubre 2026, más experiencia, formación, habilidades y certificaciones. La trayectoria completa vive
              en su propia página.
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
