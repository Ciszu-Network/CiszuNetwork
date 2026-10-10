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
import { EXTERNAL_LINKS, GITHUB_REPO } from '@/config/site';
import { getProject } from '@/data/projects';
import { useDict } from '@/lib/useDict';
import { fillTemplate } from '@/lib/i18n';

const THEME: InfoTheme = {
  accent: 'text-[#ff66dd]',
  accentBg: 'bg-[#ff33cc]/10',
  accentBorder: 'border-[#ff33cc]/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-[#4800ff] via-[#ff33cc] to-[#68cfff]',
};

const project = getProject('muzicmania')!;

const ALBUM = {
  title: 'Genesis Neon',
  artist: 'CiszukoAntony',
  year: '2026',
  cover: 'projects/muzicmania/content/music/albums/genesis_neon/cover.png',
};

const albumDescOf = (t: ReturnType<typeof useDict>) => t.muzicmaniaPage.albumDesc;

type Track = {
  id: string;
  name: string;
  duration: string;
  bpm: number;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert';
  stars: number;
  plays: number;
  record: number;
  recordUser: string;
  cover: string;
  description: string;
  difficultyCls: string;
};

const tracksOf = (t: ReturnType<typeof useDict>): Track[] => [
  {
    id: 'oled_darkness',
    name: 'OLED Darkness',
    duration: '5:01',
    bpm: 110,
    difficulty: 'Easy',
    stars: 2,
    plays: 750,
    record: 1250000,
    recordUser: 'CiszuMaster',
    cover: 'projects/muzicmania/content/music/albums/genesis_neon/oled_darkness/cover.png',
    description: t.muzicmaniaPage.tracksDesc[0],
    difficultyCls: 'text-neon-green border-neon-green/40 bg-neon-green/10',
  },
  {
    id: 'neon_dreams',
    name: 'Neon Dreams',
    duration: '3:45',
    bpm: 124,
    difficulty: 'Normal',
    stars: 5,
    plays: 1250,
    record: 2450000,
    recordUser: 'NeonRider',
    cover: 'projects/muzicmania/content/music/albums/genesis_neon/neon_dreams/cover.png',
    description: t.muzicmaniaPage.tracksDesc[1],
    difficultyCls: 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10',
  },
  {
    id: 'digital_soul',
    name: 'Digital Soul',
    duration: '4:12',
    bpm: 128,
    difficulty: 'Hard',
    stars: 12,
    plays: 980,
    record: 3100000,
    recordUser: 'DigiGod',
    cover: 'projects/muzicmania/content/music/albums/genesis_neon/digital_soul/cover.png',
    description: t.muzicmaniaPage.tracksDesc[2],
    difficultyCls: 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
  },
  {
    id: 'cyber_beat',
    name: 'Cyber Beat',
    duration: '3:28',
    bpm: 140,
    difficulty: 'Expert',
    stars: 18,
    plays: 2500,
    record: 4500000,
    recordUser: 'CyberPhantom',
    cover: 'projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cover.png',
    description: t.muzicmaniaPage.tracksDesc[3],
    difficultyCls: 'text-neon-pink border-neon-pink/40 bg-neon-pink/10',
  },
];

const stepsOf = (t: ReturnType<typeof useDict>) => [
  { icon: 'globe', ...t.muzicmaniaPage.steps[0] },
  { icon: 'music', ...t.muzicmaniaPage.steps[1] },
  { icon: 'target', ...t.muzicmaniaPage.steps[2] },
  { icon: 'trophy', ...t.muzicmaniaPage.steps[3] },
];

const modesOf = (t: ReturnType<typeof useDict>) => [
  { icon: 'monitor', ...t.muzicmaniaPage.modes[0] },
  { icon: 'download', ...t.muzicmaniaPage.modes[1] },
  { icon: 'trophy', ...t.muzicmaniaPage.modes[2] },
];

export default function MuzicManiaPage() {
  const t = useDict();
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-24">
      <PageAmbience />
      {/* Fondo único de MuzicMania: neon púrpura/rosa sobre negro. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GlowOrb color="#4800ff33" className="left-1/4 top-24 h-96 w-96" />
        <GlowOrb color="#ff33cc26" className="right-1/4 top-[38rem] h-96 w-96" duration={7} />
      </div>

      <PageReveal className="relative mx-auto max-w-screen-xl">
        {/* Héroe con el logotipo real del juego */}
        <header className="mb-16 text-center">
          <Floating className="mx-auto w-fit">
            <Image
              src={assetResolver.resolve(project.logo)}
              alt="Logotipo oficial de MuzicMania"
              width={420}
              height={160}
              className="h-24 w-auto object-contain drop-shadow-[0_0_45px_rgba(255,51,204,0.45)] md:h-32"
              priority
            />
          </Floating>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#ff66dd]">
            {t.muzicmaniaPage.kicker}
          </p>
          <h1 className="mt-3 bg-gradient-to-r from-[#4800ff] via-[#ff33cc] to-[#68cfff] bg-clip-text font-header text-4xl font-black uppercase tracking-tighter text-transparent md:text-6xl">
            {t.muzicmaniaPage.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60">
            {project.longDescription}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={EXTERNAL_LINKS.muzicmania}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ff33cc] px-7 py-3.5 font-header text-sm font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(255,51,204,0.4)] transition-all hover:scale-105 hover:brightness-110"
            >
              <Icon name="play" size={16} />
              {t.projectPages.muzicmania.playNow}
            </a>
            <a
              href={`${EXTERNAL_LINKS.muzicmania}library`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ff33cc]/50 bg-[#ff33cc]/10 px-6 py-3.5 text-sm font-bold text-[#ff66dd] transition-all hover:bg-[#ff33cc]/20"
            >
              <Icon name="music" size={16} />
              {t.muzicmaniaPage.viewLibrary}
            </a>
          </div>
        </header>

        {/* Cifras del proyecto */}
        <div className="mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {project.stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className="rounded-[1.75rem] border border-[#ff33cc]/25 bg-[#ff33cc]/5 p-6 text-center">
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff33cc]/40 bg-[#ff33cc]/10 text-[#ff66dd]">
                  <Icon name={stat.icon} size={20} />
                </span>
                <p className="font-header text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest text-white/45">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Biblioteca: álbum Genesis Neon con pistas reales */}
        <section className="mb-16" aria-labelledby="muzicmania-library">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="muzicmania-library" className="flex items-center gap-3 font-header text-3xl font-black text-white">
                <Icon name="music" size={26} />
                {t.muzicmaniaPage.libraryTitle}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-white/40">
                <Icon name="camera" size={14} />
                {fillTemplate(t.muzicmaniaPage.albumBy, { artist: ALBUM.artist, year: ALBUM.year })}
              </p>
            </div>
            <a
              href={`${EXTERNAL_LINKS.muzicmania}library`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-[#ff33cc]/50 hover:text-[#ff66dd]"
            >
              <Icon name="external" size={13} />
              {t.muzicmaniaPage.openInGame}
            </a>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            {/* Portada del álbum */}
            <div className="rounded-[2rem] border border-[#ff33cc]/30 bg-gradient-to-br from-[#4800ff]/15 to-[#ff33cc]/5 p-6 text-center">
              <Image
                src={assetResolver.resolve(ALBUM.cover)}
                alt={`Portada del álbum ${ALBUM.title}`}
                width={320}
                height={320}
                className="mx-auto w-full max-w-[18rem] rounded-2xl border border-white/10 object-cover shadow-[0_0_45px_rgba(255,51,204,0.3)]"
              />
              <h3 className="mt-5 font-header text-xl font-black text-white">{ALBUM.title}</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#ff66dd]">{ALBUM.artist}</p>
              <p className="mt-3 text-xs leading-relaxed text-white/50">{albumDescOf(t)}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/60">
                  <Icon name="music" size={11} /> {t.muzicmaniaPage.playableTracks}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/60">
                  <Icon name="clock" size={11} /> {t.muzicmaniaPage.totalTime}
                </span>
              </div>
            </div>

            {/* Pistas jugables en slider horizontal */}
            <ProjectSlider ariaLabel="Pistas del álbum Genesis Neon" itemClassName="w-[19rem] sm:w-[21rem]">
              {tracksOf(t).map((track) => (
                <article
                  key={track.id}
                  className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-1 hover:border-[#ff33cc]/40 hover:bg-[#ff33cc]/5"
                >
                  <Image
                    src={assetResolver.resolve(track.cover)}
                    alt={`Portada de ${track.name}`}
                    width={320}
                    height={320}
                    className="h-44 w-full rounded-2xl border border-white/10 object-cover"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <h3 className="font-header text-lg font-bold text-white">{track.name}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${track.difficultyCls}`}>
                      <Icon name="target" size={10} />
                      {track.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-white/50">{track.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="timer" size={12} /> {track.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="signal" size={12} /> {track.bpm} BPM
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="star" size={12} /> {track.stars} {t.muzicmaniaPage.stars}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="play" size={12} /> {track.plays.toLocaleString('es-VE')} {t.muzicmaniaPage.plays}
                    </span>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3 text-center">
                    <p className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">
                      <Icon name="trophy" size={11} /> {t.muzicmaniaPage.globalRecord}
                    </p>
                    <p className="mt-1 font-header text-lg font-black text-[#ff66dd]">
                      {track.record.toLocaleString('es-VE')}
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-white/40">{fillTemplate(t.muzicmaniaPage.byUser, { user: track.recordUser })}</p>
                  </div>
                </article>
              ))}
            </ProjectSlider>
          </div>
        </section>

        {/* Cómo se juega */}
        <section className="mb-16" aria-labelledby="muzicmania-how">
          <h2 id="muzicmania-how" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="target" size={26} />
            {t.muzicmaniaPage.howTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stepsOf(t).map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <div className="relative h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-[#ff33cc]/40">
                  <span className="absolute right-5 top-5 font-header text-3xl font-black text-white/10">
                    {index + 1}
                  </span>
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ff33cc]/40 bg-[#ff33cc]/10 text-[#ff66dd]">
                    <Icon name={step.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Plataformas y modos */}
        <section className="mb-16" aria-labelledby="muzicmania-modes">
          <h2 id="muzicmania-modes" className="mb-6 flex items-center gap-3 font-header text-3xl font-black text-white">
            <Icon name="monitor" size={26} />
            {t.muzicmaniaPage.modesTitle}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {modesOf(t).map((mode, index) => (
              <Reveal key={mode.title} delay={index * 0.1}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#4800ff]/10 to-transparent p-6 transition-all hover:-translate-y-1 hover:border-[#68cfff]/40">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#68cfff]/40 bg-[#68cfff]/10 text-[#68cfff]">
                    <Icon name={mode.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{mode.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{mode.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stack y comunidad */}
        <section className="mb-16 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className={`mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] ${THEME.accent}`}>
            <Icon name="terminal" size={15} />
            {t.projectPages.stack}
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ff33cc]/30 bg-[#ff33cc]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ff66dd]"
              >
                <Icon name="check" size={11} />
                {tech}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-white/45">
            {t.projectPages.muzicmania.devTitle} {t.projectPages.muzicmania.devDesc}
          </p>
        </section>

        {/* CTA */}
        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: t.muzicmaniaPage.ctaPlay, href: EXTERNAL_LINKS.muzicmania, icon: 'play', external: true, variant: 'primary' },
            { label: t.muzicmaniaPage.ctaRepo, href: GITHUB_REPO, icon: 'external', external: true, variant: 'ghost' },
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
