'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Icon, InfoCardGrid, InfoCtaRow, InfoHero, SmartImage, type InfoTheme } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { getProject, PROJECTS } from '@/data/projects';

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-dark to-brand',
};

export default function ProjectDetailPage() {
  const dict = useDict();
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const project = useMemo(() => (slug ? getProject(slug) : undefined), [slug]);

  usePageTitle(project ? project.name.toUpperCase() : 'PROJECTS');

  if (!project) {
    return (
      <div className="relative min-h-screen pt-24 pb-20 px-4">
        <PageAmbience />
        <PageReveal className="relative mx-auto max-w-screen-xl text-center">
          <InfoHero
            icon="warning"
            title={dict.projects.notFound}
            subtitle="El proyecto que buscas no existe o cambió de nombre. Explora el índice completo del ecosistema."
            kicker="404"
            theme={THEME}
          />
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue rounded-xl font-bold text-sm hover:bg-neon-blue hover:text-white transition-all"
          >
            <Icon name="chevronRight" size={16} /> {dict.common.backToProjects}
          </Link>
        </PageReveal>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon={project.icon}
          title={project.name}
          subtitle={project.description}
          kicker={project.tagline}
          theme={THEME}
        />

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-neon-blue/10 via-transparent to-transparent border border-neon-blue/20 mb-10">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-4 shrink-0">
              <SmartImage src={project.logo} alt={project.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-[10px] font-black uppercase tracking-widest">
                  {project.status}
                </span>
                {project.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-[10px] font-black uppercase tracking-widest"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{project.description}</p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <InfoCardGrid
            title={dict.projects.includes}
            items={project.features.map((feature) => ({
              icon: feature.icon,
              title: feature.title,
              body: feature.desc,
            }))}
            theme={THEME}
            columns={2}
          />
        </div>

        <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 mb-10">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            {dict.projects.stack}
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-[10px] font-bold uppercase tracking-wider"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            ...project.links.map((link) => ({
              label: link.label,
              href: link.href,
              icon: link.icon,
              external: link.external,
            })),
            { label: 'Todos los proyectos', href: '/projects', icon: 'chevronRight', variant: 'ghost' as const },
          ]}
        />

        <div className="mt-16 pt-8 border-t border-white/5">
          <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-5 ${THEME.accent}`}>
            {dict.projects.others}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PROJECTS.filter((item) => item.slug !== project.slug).map((item) => (
              <Link
                key={item.slug}
                href={`/projects/${item.slug}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-blue/50 transition-all group"
              >
                <span className="w-9 h-9 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue shrink-0 group-hover:scale-110 transition-transform">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="text-xs font-header font-bold text-white group-hover:text-neon-blue transition-colors truncate">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
