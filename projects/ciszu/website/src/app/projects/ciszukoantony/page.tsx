'use client';

import Image from 'next/image';
import Link from 'next/link';
import { assetResolver } from '@ciszunetwork/cdn';
import { Icon, InfoCtaRow, SocialIcon, SOCIAL_COLORS, type InfoTheme } from '@ciszu/ui';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ProjectSlider from '@/components/projects/ProjectSlider';
import Reveal, { Floating, GlowOrb } from '@/components/projects/Reveal';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CISZUKO_ANTONY } from '@/config/site';
import { getProject } from '@/data/projects';
import { useDict } from '@/lib/useDict';

const THEME: InfoTheme = {
  accent: 'text-[#68cfff]',
  accentBg: 'bg-[#4a7dff]/10',
  accentBorder: 'border-[#4a7dff]/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-[#4a7dff] via-[#68cfff] to-[#ff33cc]',
};

const project = getProject('ciszukoantony')!;

const PILLARS_OF = (t: ReturnType<typeof useDict>) => [
  { icon: 'gamepad', ...t.antonyPage.pillars[0] },
  { icon: 'music', ...t.antonyPage.pillars[1] },
  { icon: 'terminal', ...t.antonyPage.pillars[2] },
  { icon: 'certificates', ...t.antonyPage.pillars[3] },
];

const MUSIC_OF = (t: ReturnType<typeof useDict>) => [
  { icon: 'music', ...t.antonyPage.musicHighlights[0] },
  { icon: 'headset', ...t.antonyPage.musicHighlights[1] },
  { icon: 'play', ...t.antonyPage.musicHighlights[2] },
];

const SELFIE = 'shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg';

export default function CiszukoAntonyPage() {
  const t = useDict();
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-24">
      <PageAmbience />
      {/* Fondo único de Ciszuko Antony: azul y rosa neón. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GlowOrb color="rgba(74,125,255,0.2)" className="left-1/4 top-24 h-[26rem] w-[26rem]" />
        <GlowOrb color="rgba(255,51,204,0.16)" className="right-1/4 top-[40rem] h-[26rem] w-[26rem]" duration={8} />
      </div>

      <PageReveal className="relative mx-auto max-w-screen-xl">
        {/* Héroe: logo oficial + retrato + plataformas */}
        <header className="mb-16 text-center">
          <Floating className="mx-auto w-fit">
            <Image
              src={assetResolver.resolve(project.logo)}
              alt={t.antonyPage.kicker}
              width={260}
              height={260}
              className="h-24 w-auto object-contain drop-shadow-[0_0_45px_rgba(74,125,255,0.5)] md:h-32"
              priority
            />
          </Floating>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#68cfff]">
            {t.antonyPage.kicker}
          </p>
          <h1 className="mt-3 bg-gradient-to-r from-[#4a7dff] via-[#68cfff] to-[#ff33cc] bg-clip-text font-header text-4xl font-black uppercase tracking-tighter text-transparent md:text-6xl">
            {t.antonyPage.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60">
            {project.longDescription}
          </p>

          <div className="mt-10 flex justify-center">
            <Floating className="relative" amplitude={6} duration={6}>
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#4a7dff] via-[#68cfff] to-[#ff33cc] p-1 md:h-36 md:w-36">
                <Image
                  src={assetResolver.resolve(SELFIE)}
                  alt={t.projectsPage.antonyPortraitAlt}
                  width={144}
                  height={144}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#68cfff]">
                {t.projectsPage.antonyName}
              </span>
            </Floating>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={CISZUKO_ANTONY.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4a7dff] px-7 py-3.5 font-header text-sm font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(74,125,255,0.45)] transition-all hover:scale-105 hover:brightness-110"
            >
              <Icon name="globe" size={16} />
              {t.antonyPage.officialPage}
            </a>
            <a
              href={CISZUKO_ANTONY.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ff33cc]/50 bg-[#ff33cc]/10 px-6 py-3.5 text-sm font-bold text-[#ff66dd] transition-all hover:bg-[#ff33cc]/20"
            >
              <Icon name="play" size={16} />
              YouTube
            </a>
          </div>
        </header>

        {/* Cifras del proyecto */}
        <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {project.stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="h-full rounded-[1.75rem] border border-[#4a7dff]/25 bg-[#4a7dff]/5 p-6 text-center transition-all hover:-translate-y-1 hover:border-[#4a7dff]/50">
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#4a7dff]/40 bg-[#4a7dff]/10 text-[#68cfff]">
                  <Icon name={stat.icon} size={20} />
                </span>
                <p className="font-header text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest text-white/45">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Pilares de contenido */}
        <section className="mb-16" aria-labelledby="ciszukoantony-pillars">
          <h2 id="ciszukoantony-pillars" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="star" size={26} />
            {t.antonyPage.pillarsTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PILLARS_OF(t).map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.08}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-[#4a7dff]/40">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#4a7dff]/40 bg-[#4a7dff]/10 text-[#68cfff]">
                    <Icon name={pillar.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{pillar.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Música del artista */}
        <section className="mb-16 rounded-[2rem] border border-[#ff33cc]/25 bg-gradient-to-br from-[#4a7dff]/10 via-transparent to-[#ff33cc]/10 p-8" aria-labelledby="ciszukoantony-music">
          <h2 id="ciszukoantony-music" className="mb-2 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="music" size={26} />
            {t.antonyPage.musicTitle}
          </h2>
          <p className="mb-6 max-w-2xl text-xs leading-relaxed text-white/50">
            {t.antonyPage.musicBody}
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {MUSIC_OF(t).map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-black/30 p-6 transition-all hover:-translate-y-1 hover:border-[#ff33cc]/40">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ff33cc]/40 bg-[#ff33cc]/10 text-[#ff66dd]">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/projects/muzicmania"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ff33cc]/40 bg-[#ff33cc]/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#ff66dd] transition-all hover:bg-[#ff33cc]/20"
            >
              <Icon name="gamepad" size={13} />
              {t.antonyPage.linkMuzicmania}
            </Link>
            <a
              href={CISZUKO_ANTONY.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-white/40 hover:text-white"
            >
              <Icon name="external" size={13} />
              {t.antonyPage.musicboard}
            </a>
          </div>
        </section>

        {/* Plataformas y redes */}
        <section className="mb-16" aria-labelledby="ciszukoantony-platforms">
          <h2 id="ciszukoantony-platforms" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="share" size={26} />
            {t.antonyPage.platformsTitle}
          </h2>
          <ProjectSlider ariaLabel="Plataformas y redes de Ciszuko Antony" itemClassName="w-60 sm:w-64">
            {Object.entries(CISZUKO_ANTONY.social)
              .filter(([platform]) => platform !== 'discordTag')
              .map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col justify-between gap-4 rounded-[1.75rem] border bg-white/[0.03] p-5 transition-all hover:-translate-y-1 hover:brightness-125"
                  style={{
                    borderColor: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}40`,
                    background: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}10`,
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                      style={{
                        background: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}22`,
                        borderColor: `${SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS]}55`,
                      }}
                    >
                      <SocialIcon platform={platform as keyof typeof SOCIAL_COLORS} size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-header text-sm font-bold capitalize text-white">
                        {platform === 'x' ? 'X' : platform}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-white/40">{t.antonyPage.profileOfficial}</span>
                    </span>
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: SOCIAL_COLORS[platform as keyof typeof SOCIAL_COLORS] }}
                  >
                    <Icon name="external" size={12} />
                    {t.antonyPage.visit}
                  </span>
                </a>
              ))}
          </ProjectSlider>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.stack.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#4a7dff]/30 bg-[#4a7dff]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#68cfff]"
              >
                <Icon name="check" size={11} />
                {platform}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: t.antonyPage.ctaWeb, href: CISZUKO_ANTONY.portfolio, icon: 'globe', external: true, variant: 'primary' },
            { label: 'YouTube', href: CISZUKO_ANTONY.social.youtube, icon: 'play', external: true, variant: 'ghost' },
            { label: 'Ciszugamens', href: CISZUKO_ANTONY.social.discord, icon: 'discord', external: true, variant: 'ghost' },
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
