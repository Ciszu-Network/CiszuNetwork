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
import type { CurriculumData } from '@/data/curriculum';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

type Filter = 'Todos' | ProjectCategory;
type Tab = 'work' | 'cv';

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const fmtDate = (iso?: string) => {
  if (!iso) return 'Sin fecha';
  const [year, month] = iso.split('-').map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year}`;
};

/**
 * Portfolio + Currículum en una sola ruta: antes `/portfolio` y `/curriculum`
 * eran dos páginas con la mitad de la historia cada una. Aquí conviven como
 * pestañas de la misma ficha: trabajos (con filtros) y CV interactivo
 * (experiencia, formación, habilidades, idiomas y certificaciones).
 */
export default function PortfolioContent({ cv }: { cv: CurriculumData }) {
  usePageTitle('PORTFOLIO & CV');
  const dict = useDict();
  const [tab, setTab] = useState<Tab>('work');
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

  const featuredCerts = useMemo(
    () =>
      [...CERTIFICATES]
        .filter((cert) => cert.date)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 6),
    [],
  );

  const providerCount = useMemo(() => new Set(CERTIFICATES.map((cert) => cert.provider)).size, []);

  const cvStats = [
    { value: `${CERTIFICATES.length}`, label: 'Documentos', sub: 'Certificados y credenciales' },
    { value: `${providerCount}`, label: 'Emisores', sub: 'Instituciones y plataformas' },
    { value: `${cv.skills.length}`, label: 'Áreas técnicas', sub: 'Stack de desarrollo' },
    { value: 'B1', label: 'Inglés', sub: 'EF SET certificado' },
  ];

  const changeTab = (next: Tab) => {
    setTab(next);
    captureEvent('portfolio_tab', { tab: next });
  };

  const tabCls = (active: boolean) =>
    `inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-[11px] font-header font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 ${
      active
        ? 'bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-[0_0_18px_rgba(61,106,223,0.3)]'
        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
    }`;

  const printCv = () => {
    captureEvent('portfolio_cv_print', {});
    window.print();
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <div className="print:hidden">
          <InfoHero
            icon="palette"
            title="Portfolio & CV"
            subtitle={`Trabajos y trayectoria de ${cv.profile.name}: proyectos del ecosistema y currículum interactivo con experiencia, formación, habilidades, idiomas y certificaciones verificables.`}
            kicker={`${dict.portfolio.kicker} · CV`}
            theme={THEME}
          />
        </div>

        {/* Pestañas: Trabajos | Currículum */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 print:hidden" role="tablist" aria-label="Portfolio y currículum">
          <button type="button" role="tab" aria-selected={tab === 'work'} onClick={() => changeTab('work')} className={tabCls(tab === 'work')}>
            <Icon name="palette" size={16} />
            {dict.portfolio.kicker}
          </button>
          <button type="button" role="tab" aria-selected={tab === 'cv'} onClick={() => changeTab('cv')} className={tabCls(tab === 'cv')}>
            <Icon name="medal" size={16} />
            {dict.nav.curriculum}
          </button>
        </div>

        {/* ── PESTAÑA TRABAJOS ─────────────────────────────────── */}
        {tab === 'work' && (
          <div role="tabpanel" aria-label={dict.portfolio.kicker}>
            <div className="flex flex-wrap justify-center gap-2 mb-12 print:hidden">
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
          </div>
        )}

        {/* ── PESTAÑA CURRÍCULUM ──────────────────────────────── */}
        {tab === 'cv' && (
          <div role="tabpanel" aria-label={dict.nav.curriculum} className="space-y-14">
            {/* Ficha de perfil + acciones */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-neon-blue/10 via-transparent to-transparent border border-neon-blue/20">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-header font-black uppercase italic text-white">{cv.profile.name}</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue mt-1 mb-4">
                    {cv.profile.role}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{cv.profile.summary}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                    <span>{cv.profile.legalName}</span>
                    <span>{cv.profile.location}</span>
                    <a href={`mailto:${cv.profile.email}`} className="text-neon-blue hover:text-white transition-colors">
                      {cv.profile.email}
                    </a>
                  </div>
                </div>
                <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto print:hidden">
                  <button
                    type="button"
                    onClick={printCv}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-xl font-bold text-sm hover:bg-neon-blue hover:text-white transition-all cursor-pointer active:scale-95"
                  >
                    <Icon name="download" size={16} />
                    {dict.curriculum.print}
                  </button>
                  <Link
                    href="/certificates"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
                  >
                    <Icon name="certificates" size={16} />
                    {dict.curriculum.viewCertificates}
                  </Link>
                  <Link
                    href="/socials"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
                  >
                    <Icon name="share" size={16} />
                    Socials
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats del CV */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cvStats.map((stat) => (
                <div key={stat.label} className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <p className="text-3xl font-header font-black text-neon-blue">{stat.value}</p>
                  <p className="text-white font-header font-bold text-sm mt-1">{stat.label}</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Formación */}
            <div>
              <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-blue mb-5">
                <Icon name="medal" size={15} />
                {dict.curriculum.training}
              </h2>
              <InfoCardGrid items={cv.education} theme={THEME} columns={2} />
            </div>

            {/* Experiencia (timeline) */}
            <section>
              <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-blue mb-5">
                <Icon name="trophy" size={15} />
                Experiencia
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-blue via-neon-blue/40 to-transparent" />
                <div className="space-y-5">
                  {cv.experience.map((item) => (
                    <div key={`${item.role}-${item.org}`} className="relative pl-12 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-blue/40 transition-all">
                      <span className="absolute left-2.5 top-7 w-3 h-3 rounded-full bg-neon-blue border-2 border-black" />
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name={item.icon} size={14} className="text-neon-blue" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-neon-blue">{item.period}</p>
                      </div>
                      <h3 className="font-header font-bold text-white">
                        {item.role} · <span className="text-gray-500">{item.org}</span>
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed mt-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Certificaciones destacadas */}
            <section>
              <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-blue mb-5">
                <Icon name="certificates" size={15} />
                {dict.curriculum.featuredCerts}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredCerts.map((cert) => (
                  <Link
                    key={cert.id}
                    href="/certificates"
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-blue/40 transition-all hover:-translate-y-0.5"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-neon-blue mb-2">{fmtDate(cert.date)}</p>
                    <h3 className="font-header font-bold text-white text-sm leading-snug mb-1">{cert.title}</h3>
                    <p className="text-xs text-gray-500">{cert.provider}</p>
                    {cert.level ? <p className="text-xs text-neon-green mt-2">{cert.level}</p> : null}
                  </Link>
                ))}
              </div>
              <p className="text-center text-white/30 text-xs mt-6">
                Catálogo completo con documentos y verificación en{' '}
                <Link href="/certificates" className="text-neon-blue hover:text-white transition-colors">
                  /certificates
                </Link>
              </p>
            </section>

            {/* Habilidades */}
            <section>
              <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-blue mb-5">
                <Icon name="target" size={15} />
                {dict.curriculum.skills}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cv.skills.map((skill) => (
                  <div key={skill.name} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{skill.name}</span>
                      <span className="text-neon-blue font-bold">{skill.level}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-neon-blue transition-all duration-700"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Idiomas */}
            <div>
              <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-blue mb-5">
                <Icon name="globe" size={15} />
                Idiomas
              </h2>
              <InfoCardGrid items={cv.languages} theme={THEME} columns={2} />
            </div>

            <InfoCtaRow
              theme={THEME}
              actions={[
                { label: dict.portfolio.ctaCertificates, href: '/certificates', icon: 'certificates' },
                { label: dict.portfolio.goProjects, href: '/projects', icon: 'rocket' },
                { label: dict.portfolio.ctaCommissions, href: '/commissions', icon: 'money' },
                { label: dict.portfolio.ctaContact, href: '/contact', icon: 'mail', variant: 'ghost' },
              ]}
            />
          </div>
        )}
      </PageReveal>

      <div className="print:hidden">
        <QuickDocks />
      </div>

    </div>
  );
}
