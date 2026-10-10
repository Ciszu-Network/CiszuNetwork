'use client';

import Image from 'next/image';
import Link from 'next/link';
import { assetResolver } from '@ciszunetwork/cdn';
import { Icon, InfoCtaRow, type InfoTheme } from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ProjectSlider from '@/components/projects/ProjectSlider';
import Reveal, { Floating, GlowOrb } from '@/components/projects/Reveal';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CISZU_NETWORK, EXTERNAL_LINKS, GITHUB_REPO } from '@/config/site';
import { getProject, PROJECTS } from '@/data/projects';
import { useDict } from '@/lib/useDict';
import { fillTemplate } from '@/lib/i18n';

const THEME: InfoTheme = {
  accent: 'text-[#59b4ff]',
  accentBg: 'bg-[#3a6bf0]/10',
  accentBorder: 'border-[#3a6bf0]/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-[#3a6bf0] via-[#59b4ff] to-[#68cfff]',
};

const project = getProject('ciszunetwork')!;

const valuesOf = (t: ReturnType<typeof useDict>) => [
  { icon: 'eye', ...t.ciszunetworkPage.values[0] },
  { icon: 'target', ...t.ciszunetworkPage.values[1] },
  { icon: 'shield', ...t.ciszunetworkPage.values[2] },
];

export default function CiszuNetworkPage() {
  const t = useDict();
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-24">
      <PageAmbience />
      {/* Fondo único de Ciszu Network: azul corporativo con retícula. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GlowOrb color="rgba(58,107,240,0.2)" className="left-1/3 top-20 h-[30rem] w-[30rem]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(89,180,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(89,180,255,0.6) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <PageReveal className="relative mx-auto max-w-screen-xl">
        {/* Héroe corporativo */}
        <header className="mb-16 text-center">
          <Floating className="mx-auto w-fit">
            <Image
              src={assetResolver.resolve(project.logo)}
              alt={t.ciszunetworkPage.title}
              width={320}
              height={200}
              className="h-24 w-auto object-contain drop-shadow-[0_0_45px_rgba(58,107,240,0.5)] md:h-32"
              priority
            />
          </Floating>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#59b4ff]">
            {t.ciszunetworkPage.kicker}
          </p>
          <h1 className="mt-3 bg-gradient-to-r from-[#3a6bf0] via-[#59b4ff] to-[#68cfff] bg-clip-text font-header text-4xl font-black uppercase tracking-tighter text-transparent md:text-6xl">
            {t.ciszunetworkPage.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60">
            {project.longDescription}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-[#3a6bf0] px-7 py-3.5 font-header text-sm font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(58,107,240,0.45)] transition-all hover:scale-105 hover:brightness-110"
            >
              <Icon name="palette" size={16} />
              {t.ciszunetworkPage.viewServices}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-[#3a6bf0]/50 bg-[#3a6bf0]/10 px-6 py-3.5 text-sm font-bold text-[#59b4ff] transition-all hover:bg-[#3a6bf0]/20"
            >
              <Icon name="mail" size={16} />
              {t.ciszunetworkPage.workTogether}
            </Link>
          </div>
        </header>

        {/* Cifras corporativas */}
        <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {project.stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="h-full rounded-[1.75rem] border border-[#3a6bf0]/25 bg-[#3a6bf0]/5 p-6 text-center transition-all hover:-translate-y-1 hover:border-[#3a6bf0]/50">
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#3a6bf0]/40 bg-[#3a6bf0]/10 text-[#59b4ff]">
                  <Icon name={stat.icon} size={20} />
                </span>
                <p className="font-header text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest text-white/45">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Áreas de trabajo */}
        <section className="mb-16" aria-labelledby="ciszunetwork-areas">
          <h2 id="ciszunetwork-areas" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="target" size={26} />
            {t.ciszunetworkPage.areasTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {project.features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.08}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-[#3a6bf0]/40">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a6bf0]/40 bg-[#3a6bf0]/10 text-[#59b4ff]">
                    <Icon name={feature.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Proyectos del ecosistema */}
        <section className="mb-16" aria-labelledby="ciszunetwork-ecosystem">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="ciszunetwork-ecosystem" className="flex items-center gap-3 font-header text-3xl font-black text-white">
              <Icon name="rocket" size={26} />
              {t.ciszunetworkPage.ecosystemTitle}
            </h2>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-[#3a6bf0]/50 hover:text-[#59b4ff]"
            >
              <Icon name="menu" size={13} />
              {t.projectPages.viewAll}
            </Link>
          </div>
          <ProjectSlider ariaLabel={t.ciszunetworkPage.sliderAria} itemClassName="w-[16rem] sm:w-[18rem]">
            {PROJECTS.filter((item) => item.id !== 'ciszunetwork').map((item) => (
              <Link
                key={item.id}
                href={`/projects/${item.id}`}
                className={`group flex h-full items-center gap-4 rounded-2xl border bg-white/[0.03] p-5 transition-all hover:-translate-y-1 ${item.accent.border}`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.accent.chipBg} ${item.accent.chipBorder}`}>
                  <Image
                    src={assetResolver.resolve(item.logo)}
                    alt={fillTemplate(t.ciszunetworkPage.isoAlt, { name: item.name })}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-header text-sm font-bold text-white transition-colors group-hover:text-[#59b4ff]">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] uppercase tracking-wider text-white/40">
                    {item.tagline}
                  </span>
                </span>
              </Link>
            ))}
          </ProjectSlider>
        </section>

        {/* Valores */}
        <section className="mb-16" aria-labelledby="ciszunetwork-values">
          <h2 id="ciszunetwork-values" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="verified" size={26} />
            {t.ciszunetworkPage.valuesTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {valuesOf(t).map((value, index) => (
              <Reveal key={value.title} delay={index * 0.08}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#3a6bf0]/10 to-transparent p-6 transition-all hover:-translate-y-1 hover:border-[#3a6bf0]/40">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#68cfff]/40 bg-[#68cfff]/10 text-[#68cfff]">
                    <Icon name={value.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{value.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{value.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stack corporativo */}
        <section className="mb-16 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className={`mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
            <Icon name="terminal" size={15} />
            {t.projectPages.stack}
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#3a6bf0]/30 bg-[#3a6bf0]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#59b4ff]"
              >
                <Icon name="check" size={11} />
                {tech}
              </span>
            ))}
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="mail" size={13} /> {CISZU_NETWORK.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="globe" size={13} /> {CISZU_NETWORK.location}
            </span>
          </p>
        </section>

        {/* CTA */}
        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: t.ciszunetworkPage.ctaWeb, href: EXTERNAL_LINKS.ciszunetwork, icon: 'globe', external: true, variant: 'primary' },
            { label: t.ciszunetworkPage.ctaServices, href: '/services', icon: 'palette', variant: 'ghost' },
            { label: 'GitHub', href: GITHUB_REPO, icon: 'external', external: true, variant: 'ghost' },
            { label: t.projectPages.viewAll, href: '/projects', icon: 'rocket', variant: 'ghost' },
          ]}
        />

        <p className="mt-8 text-center">
          <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-white">
            <Icon name="rocket" size={13} />
            {t.projectPages.viewAll}
          </Link>
        </p>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
