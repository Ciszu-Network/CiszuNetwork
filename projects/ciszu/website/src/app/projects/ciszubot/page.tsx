'use client';

import Image from 'next/image';
import Link from 'next/link';
import { assetResolver } from '@ciszunetwork/cdn';
import { Icon, InfoCtaRow, type InfoTheme } from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import QuickDocks from '@/components/molecules/QuickDocks';
import ProjectSlider from '@/components/projects/ProjectSlider';
import Reveal, { Floating, GlowOrb } from '@/components/projects/Reveal';
import { CISZUBOT_LINKS, GITHUB_REPO } from '@/config/site';
import { getProject } from '@/data/projects';
import { useDict } from '@/lib/useDict';

const THEME: InfoTheme = {
  accent: 'text-[#8b93f8]',
  accentBg: 'bg-[#5865F2]/10',
  accentBorder: 'border-[#5865F2]/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-[#5865F2] via-[#8b93f8] to-[#4752C4]',
};

const project = getProject('ciszubot')!;

/** Comandos reales del bot, agrupados por categoría. */
const commandGroupsOf = (t: ReturnType<typeof useDict>) => [
  {
    id: 'moderacion',
    icon: 'shield',
    ...t.ciszubotPage.commandGroups[0],
    commands: ['ban', 'kick', 'mute', 'close', 'closeprivate', 'panel'],
  },
  {
    id: 'musica',
    icon: 'music',
    ...t.ciszubotPage.commandGroups[1],
    commands: ['play', 'pause', 'loop', 'cancion', 'duracion'],
  },
  {
    id: 'economia',
    icon: 'money',
    ...t.ciszubotPage.commandGroups[2],
    commands: ['balance', 'daily', 'deposit', 'buy', 'item', 'gamble', 'leaderboard'],
  },
  {
    id: 'diversion',
    icon: 'dice',
    ...t.ciszubotPage.commandGroups[3],
    commands: ['8ball', 'dice', 'animal', 'confess', 'hi', 'bye'],
  },
  {
    id: 'utilidad',
    icon: 'key',
    ...t.ciszubotPage.commandGroups[4],
    commands: ['help', 'ping', 'avatar', 'id', 'profile', 'rank', 'invite', 'links', 'estado'],
  },
  {
    id: 'automatizacion',
    icon: 'robot',
    ...t.ciszubotPage.commandGroups[5],
    commands: ['giveaway', 'embed', 'say', 'directsay', 'comando', 'prefijo', 'canal', 'color', 'idioma'],
  },
];

const stepsOf = (t: ReturnType<typeof useDict>) => [
  { icon: 'robot', ...t.ciszubotPage.steps[0] },
  { icon: 'help', ...t.ciszubotPage.steps[1] },
  { icon: 'settings', ...t.ciszubotPage.steps[2] },
  { icon: 'trophy', ...t.ciszubotPage.steps[3] },
];

const DIRECTORIES = [
  { name: 'Top.gg', href: CISZUBOT_LINKS.topggBot, icon: 'trophy' },
  { name: 'Votar en Top.gg', href: CISZUBOT_LINKS.topggBotVote, icon: 'heart' },
  { name: 'Discord Bot List', href: CISZUBOT_LINKS.discordBotListBot, icon: 'flag' },
];

export default function CiszubotPage() {
  const t = useDict();
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-24">
      <PageAmbience />
      {/* Fondo único de CiszuBot: azul Discord y rejilla técnica. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GlowOrb color="#5865F233" className="left-1/3 top-20 h-[28rem] w-[28rem]" duration={7} />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,147,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,147,248,0.5) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
      </div>

      <PageReveal className="relative mx-auto max-w-screen-xl">
        {/* Héroe con isotipo real */}
        <header className="mb-16 text-center">
          <Floating className="mx-auto w-fit" amplitude={10}>
            <Image
              src={assetResolver.resolve(project.logo)}
              alt={t.ciszubotPage.isoAlt}
              width={160}
              height={160}
              className="h-28 w-28 object-contain drop-shadow-[0_0_45px_rgba(88,101,242,0.55)]"
              priority
            />
          </Floating>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#8b93f8]">
            {t.ciszubotPage.kicker}
          </p>
          <h1 className="mt-3 bg-gradient-to-r from-[#5865F2] via-[#8b93f8] to-[#68cfff] bg-clip-text font-header text-4xl font-black uppercase tracking-tighter text-transparent md:text-6xl">
            {t.ciszubotPage.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60">
            {project.longDescription}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CISZUBOT_LINKS.invite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-7 py-3.5 font-header text-sm font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(88,101,242,0.45)] transition-all hover:scale-105 hover:brightness-110"
            >
              <Icon name="robot" size={16} />
              {t.projectPages.ciszubot.invite}
            </a>
            <a
              href={CISZUBOT_LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#5865F2]/50 bg-[#5865F2]/10 px-6 py-3.5 text-sm font-bold text-[#8b93f8] transition-all hover:bg-[#5865F2]/20"
            >
              <Icon name="globe" size={16} />
              {t.projectPages.ciszubot.officialWeb}
            </a>
          </div>
        </header>

        {/* Cifras del bot */}
        <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {project.stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="rounded-[1.75rem] border border-[#5865F2]/25 bg-[#5865F2]/5 p-6 text-center">
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/10 text-[#8b93f8]">
                  <Icon name={stat.icon} size={20} />
                </span>
                <p className="font-header text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest text-white/45">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Funcionalidades */}
        <section className="mb-16" aria-labelledby="ciszubot-features">
          <h2 id="ciszubot-features" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="star" size={26} />
            {t.ciszubotPage.featuresTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {project.features.map((feature) => (
              <div key={feature.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#5865F2]/40 bg-[#5865F2]/10 text-[#8b93f8]">
                  <Icon name={feature.icon} size={20} />
                </span>
                <h3 className="font-header text-sm font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/50">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comandos reales por categoría */}
        <section className="mb-16" aria-labelledby="ciszubot-commands">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="ciszubot-commands" className="flex items-center gap-3 font-header text-3xl font-black text-white">
                <Icon name="terminal" size={26} />
                {t.ciszubotPage.commandsTitle}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
                <Icon name="key" size={14} />
                {t.ciszubotPage.commandsSub}
              </p>
            </div>
            <a
              href={CISZUBOT_LINKS.discordServer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-[#5865F2]/50 hover:text-[#8b93f8]"
            >
              <Icon name="comment" size={13} />
              {t.ciszubotPage.testDiscord}
            </a>
          </div>

          <ProjectSlider ariaLabel={t.ciszubotPage.sliderAria} itemClassName="w-[19rem] sm:w-[22rem]">
            {commandGroupsOf(t).map((group) => (
              <article key={group.id} className="h-full rounded-[1.75rem] border border-[#5865F2]/25 bg-[#5865F2]/5 p-6 transition-all hover:-translate-y-1 hover:border-[#5865F2]/60">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/10 text-[#8b93f8]">
                    <Icon name={group.icon} size={19} />
                  </span>
                  <div>
                    <h3 className="font-header text-sm font-black text-white">{group.title}</h3>
                    <p className="text-[10px] text-white/40">{group.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.commands.map((command) => (
                    <code
                      key={command}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1 font-mono text-[11px] text-[#8b93f8]"
                    >
                      <span className="text-white/30">/</span>
                      {command}
                    </code>
                  ))}
                </div>
              </article>
            ))}
          </ProjectSlider>
        </section>

        {/* Cómo se usa */}
        <section className="mb-16" aria-labelledby="ciszubot-how">
          <h2 id="ciszubot-how" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="signal" size={26} />
            {t.ciszubotPage.howTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stepsOf(t).map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <div className="relative h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-[#5865F2]/50">
                  <span className="absolute right-5 top-5 font-header text-3xl font-black text-white/10">{index + 1}</span>
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#5865F2]/40 bg-[#5865F2]/10 text-[#8b93f8]">
                    <Icon name={step.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stack, directorios y comunidad */}
        <section className="mb-16 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className={`mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
            <Icon name="terminal" size={15} />
            {t.projectPages.stack}
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8b93f8]"
              >
                <Icon name="check" size={11} />
                {tech}
              </span>
            ))}
          </div>
          <h3 className="mb-3 mt-8 flex items-center gap-2 text-sm font-header font-bold text-white">
            <Icon name="trophy" size={16} />
            {t.projectPages.ciszubot.directories}
          </h3>
          <div className="flex flex-wrap gap-3">
            {DIRECTORIES.map((directory) => (
              <a
                key={directory.name}
                href={directory.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:border-[#5865F2]/60 hover:text-[#8b93f8]"
              >
                <Icon name={directory.icon} size={14} />
                {directory.name}
                <Icon name="external" size={12} />
              </a>
            ))}
          </div>
        </section>

        {/* CTA */}
        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: t.ciszubotPage.ctaInvite, href: CISZUBOT_LINKS.invite, icon: 'robot', external: true, variant: 'primary' },
            { label: t.ciszubotPage.ctaSupport, href: CISZUBOT_LINKS.discordServer, icon: 'discord', external: true, variant: 'ghost' },
            { label: t.ciszubotPage.ctaRepo, href: GITHUB_REPO, icon: 'external', external: true, variant: 'ghost' },
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
