'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Icon, InfoCtaRow, SocialIcon, type InfoTheme } from '@ciszu/ui';
import CdnImage from '@/components/shared/CdnImage';
import { usePageTitle } from '@/lib/usePageTitle';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ProjectSlider from '@/components/projects/ProjectSlider';
import Reveal, { Floating, GlowOrb } from '@/components/projects/Reveal';
import { PROJECTS, getProject, type Project } from '@/data/projects';
import { MUSIC_PLATFORM_LINKS, MUSIC_PLAYLISTS, REAL_ALBUMS } from '@/data/music';
import { CERTIFICATES } from '@/data/certificates';
import { SOCIAL_ENTRIES } from '@/data/socials';

const SELFIE = 'shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg';

const ECOSYSTEM = [
  { name: 'Ciszu Network', href: 'https://ciszunetwork.vercel.app/', desc: 'El ecosistema completo' },
  { name: 'CiszuBot', href: 'https://ciszubot.vercel.app/', desc: 'El bot de Discord' },
  { name: 'MuzicMania', href: 'https://muzicmania.vercel.app/', desc: 'El juego de ritmo' },
  { name: 'Ciszuko Antony', href: '/', desc: 'Esta misma web' },
];

function accentTheme(project: Project): InfoTheme {
  return {
    accent: project.accent.text,
    accentBg: project.accent.chipBg,
    accentBorder: project.accent.chipBorder,
    card: 'bg-white/5',
    border: 'border-white/10',
    gradient: project.accent.gradient,
  };
}

/** Imagen del proyecto: CDN (`projects/`, `shared/`) o pública local (`/...`). */
function ProjectImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (src.startsWith('projects/') || src.startsWith('shared/')) {
    return <CdnImage src={src} alt={alt} className={className} />;
  }
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const project = useMemo(() => (slug ? getProject(slug) : undefined), [slug]);

  usePageTitle(project ? project.name.toUpperCase() : 'PROJECTS');

  if (!project) {
    return (
      <div className="relative min-h-screen px-4 pb-20 pt-24">
        <PageAmbience />
        <PageReveal className="relative mx-auto max-w-screen-xl text-center">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40">
            <Icon name="warning" size={30} />
          </span>
          <h1 className="font-header text-4xl font-black uppercase tracking-tighter text-white">
            Proyecto no encontrado
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/50">
            El proyecto que buscas no existe o cambió de nombre. Explora el índice de proyectos personales.
          </p>
          <Link
            href="/projects"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-neon-blue/40 bg-neon-blue/20 px-6 py-3 text-sm font-bold text-neon-blue transition-all hover:bg-neon-blue hover:text-white"
          >
            <Icon name="rocket" size={16} />
            Todos los proyectos
          </Link>
        </PageReveal>
      </div>
    );
  }

  const theme = accentTheme(project);
  const others = PROJECTS.filter((item) => item.slug !== project.slug);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-24">
      <PageAmbience />
      {/* Fondo único por proyecto: halo de su color de marca. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <GlowOrb color={`${project.accent.hex}33`} className="left-1/3 top-20 h-[30rem] w-[30rem]" />
        <GlowOrb color={`${project.accent.hex2}22`} className="right-1/4 top-[45rem] h-[26rem] w-[26rem]" duration={8} />
      </div>

      <PageReveal className="relative mx-auto max-w-screen-xl">
        {/* Héroe del proyecto */}
        <header className="mb-14 text-center">
          <Floating className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border ${project.accent.chipBorder} ${project.accent.chipBg} p-3`}>
            <ProjectImage src={project.preview} alt={`Identidad de ${project.name}`} className="h-full w-full object-contain" />
          </Floating>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${project.accent.text}`}>
            {project.categories.join(' · ')}
          </p>
          <h1 className={`mt-3 bg-gradient-to-r bg-clip-text font-header text-4xl font-black uppercase tracking-tighter text-transparent md:text-6xl ${project.accent.gradient}`}>
            {project.name}
          </h1>
          <p className={`mt-3 text-sm font-bold uppercase tracking-[0.25em] ${project.accent.text}`}>
            {project.tagline}
          </p>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-white/60">{project.longDescription}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {project.actions[0] ? (
              project.actions[0].href.startsWith('http') ? (
                <a
                  href={project.actions[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-header text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 hover:brightness-110 ${project.accent.solid}`}
                >
                  <Icon name={project.actions[0].icon} size={16} />
                  {project.actions[0].label}
                </a>
              ) : (
                <Link
                  href={project.actions[0].href}
                  className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-header text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 hover:brightness-110 ${project.accent.solid}`}
                >
                  <Icon name={project.actions[0].icon} size={16} />
                  {project.actions[0].label}
                </Link>
              )
            ) : null}
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/70 transition-all hover:border-white/40 hover:text-white"
            >
              <Icon name="menu" size={16} />
              Todos los proyectos
            </Link>
          </div>
        </header>

        {/* Cifras del proyecto */}
        <div className="mb-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {project.stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div className={`h-full rounded-[1.75rem] border p-6 text-center transition-all hover:-translate-y-1 ${project.accent.chipBorder} ${project.accent.chipBg}`}>
                <span className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${project.accent.chipBorder} ${project.accent.chipBg} ${project.accent.text}`}>
                  <Icon name={stat.icon} size={20} />
                </span>
                <p className="font-header text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest text-white/45">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Sección única según el proyecto */}
        {project.slug === 'musicboard' ? <MusicboardSections project={project} /> : null}
        {project.slug === 'francisco-garcia' ? <PersonSections project={project} /> : null}
        {project.slug === 'ciszukoantony' ? <BrandSections project={project} /> : null}
        {project.slug === 'ciszunetwork' ? <CompanySections project={project} /> : null}

        {/* Qué incluye (común a todos, con iconos) */}
        <section className="mb-14" aria-labelledby="project-features">
          <h2 id="project-features" className={`mb-6 flex items-center gap-3 font-header text-2xl font-black text-white`}>
            <Icon name="star" size={22} />
            Qué incluye
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {project.features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.08}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-white/25">
                  <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${project.accent.chipBorder} ${project.accent.chipBg} ${project.accent.text}`}>
                    <Icon name={feature.icon} size={20} />
                  </span>
                  <h3 className="font-header text-sm font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="mb-14 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 className={`mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] ${project.accent.text}`}>
            <Icon name="terminal" size={15} />
            Stack y herramientas
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/75 ${project.accent.chipBorder} ${project.accent.chipBg}`}
              >
                <Icon name="check" size={11} />
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Enlaces del proyecto */}
        <InfoCtaRow
          theme={theme}
          actions={[
            ...project.actions.map((action) => ({
              label: action.label,
              href: action.href,
              icon: action.icon,
              external: action.external,
            })),
            { label: 'Todos los proyectos', href: '/projects', icon: 'menu', variant: 'ghost' as const },
          ]}
        />

        {/* Otros proyectos */}
        <section className="mt-16 border-t border-white/5 pt-10" aria-labelledby="other-projects">
          <h2 id="other-projects" className={`mb-6 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] ${project.accent.text}`}>
            <Icon name="rocket" size={14} />
            Otros proyectos de Ciszuko Antony
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item, index) => (
              <Reveal key={item.slug} delay={index * 0.06}>
                <Link
                href={`/projects/${item.slug}`}
                className={`group flex items-center gap-4 rounded-2xl border bg-white/[0.03] p-5 transition-all hover:-translate-y-1 ${item.accent.border}`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${item.accent.chipBorder} ${item.accent.chipBg}`}>
                  <ProjectImage src={item.preview} alt={`Identidad de ${item.name}`} className="h-9 w-9 object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-header text-sm font-bold text-white transition-colors group-hover:text-neon-blue">
                    {item.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] uppercase tracking-wider text-white/40">
                    {item.tagline}
                  </span>
                </span>
                <Icon name="chevronRight" size={16} />
              </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}

/** MusicBoard: álbumes reales, playlists oficiales y plataformas de escucha. */
function MusicboardSections({ project }: { project: Project }) {
  return (
    <>
      <section className="mb-14" aria-labelledby="musicboard-albums">
        <h2 id="musicboard-albums" className="mb-6 flex items-center gap-3 font-header text-2xl font-black text-white">
          <Icon name="music" size={22} />
          Discografía
        </h2>
        <div className="space-y-6">
          {REAL_ALBUMS.map((album) => (
            <Reveal key={album.id}>
            <article className={`rounded-[2rem] border p-6 md:p-8 ${project.accent.border} ${project.accent.chipBg}`}>
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="mx-auto w-48 shrink-0 md:mx-0">
                  <ProjectImage src={album.cover} alt={`Portada de ${album.title}`} className="w-full rounded-2xl border border-white/10 object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-header text-xl font-black text-white">{album.title}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${project.accent.chipBorder} ${project.accent.text}`}>
                      <Icon name="calendar" size={10} />
                      {album.year}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${project.accent.chipBorder} ${project.accent.text}`}>
                      <Icon name="headset" size={10} />
                      {album.kind}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">{album.description}</p>
                  <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {album.tracks.map((track) => (
                      <li key={track.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                        <ProjectImage src={track.cover} alt={`Portada de ${track.title}`} className="h-10 w-10 rounded-lg object-cover" />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-white">{track.title}</span>
                          {track.note ? <span className="block text-[9px] uppercase tracking-wider text-white/40">{track.note}</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {album.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-white/40 hover:text-white"
                      >
                        <Icon name={link.icon ?? 'external'} size={13} />
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mb-14" aria-labelledby="musicboard-playlists">
        <h2 id="musicboard-playlists" className="mb-6 flex items-center gap-3 font-header text-2xl font-black text-white">
          <Icon name="headset" size={22} />
          Podcast y playlists oficiales
        </h2>
        <ProjectSlider ariaLabel="Podcast y playlists oficiales" itemClassName="w-[19rem] sm:w-[21rem]">
          {MUSIC_PLAYLISTS.map((playlist) => (
            <a
              key={playlist.id}
              href={playlist.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex h-full flex-col rounded-[1.75rem] border bg-white/[0.03] p-6 transition-all hover:-translate-y-1 ${project.accent.border}`}
            >
              <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${project.accent.chipBorder} ${project.accent.chipBg} ${project.accent.text}`}>
                <Icon name={playlist.icon ?? 'headset'} size={20} />
              </span>
              <h3 className="font-header text-sm font-bold text-white">{playlist.title}</h3>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
                {playlist.platform} · {playlist.kind}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{playlist.description}</p>
            </a>
          ))}
        </ProjectSlider>
        <div className="mt-6 flex flex-wrap gap-2">
          {MUSIC_PLATFORM_LINKS.map((platform) => (
            <a
              key={platform.href}
              href={platform.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:border-white/40 hover:text-white"
            >
              <Icon name={platform.icon ?? 'music'} size={13} />
              {platform.label}
              <Icon name="external" size={11} />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

/** Francisco García: la persona — currículums y certificados verificables. */
function PersonSections({ project }: { project: Project }) {
  const featured = useMemo(
    () =>
      [...CERTIFICATES]
        .filter((cert) => cert.date)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 6),
    [],
  );

  return (
    <>
      <section className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]" aria-labelledby="person-identity">
        <div className={`rounded-[2rem] border p-6 text-center ${project.accent.border} ${project.accent.chipBg}`}>
          <div className={`mx-auto h-40 w-40 overflow-hidden rounded-full border-4 p-1 ${project.accent.border}`}>
            <ProjectImage src={SELFIE} alt="Retrato de Francisco García" className="h-full w-full rounded-full object-cover" />
          </div>
          <h3 className="mt-4 font-header text-lg font-black text-white">Francisco García</h3>
          <p className={`text-[10px] uppercase tracking-[0.3em] ${project.accent.text}`}>Ciszuko Antony</p>
          <p className="mt-3 text-xs leading-relaxed text-white/55">
            Desarrollador y creador de contenido. Esta identidad profesional sostiene los tres proyectos
            del ecosistema.
          </p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h2 id="person-identity" className="mb-4 flex items-center gap-3 font-header text-2xl font-black text-white">
            <Icon name="terms" size={22} />
            Trayectoria verificable
          </h2>
          <p className="text-sm leading-relaxed text-white/55">
            Los currículums reúnen experiencia, formación, habilidades e idiomas; los certificados se
            publican con su emisor, fecha e identificador cuando el documento lo indica, y con enlace de
            verificación cuando la institución lo ofrece.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: 'terms', label: 'Currículums', value: '3 PDF', href: '/curriculum' },
              { icon: 'certificates', label: 'Certificados', value: `${CERTIFICATES.length}`, href: '/certificates' },
              { icon: 'language', label: 'Idiomas', value: 'ES / EN', href: '/certificates' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-2xl border p-4 transition-all hover:-translate-y-1 ${project.accent.chipBorder} ${project.accent.chipBg}`}
              >
                <span className={`mb-2 inline-flex ${project.accent.text}`}>
                  <Icon name={item.icon} size={18} />
                </span>
                <p className="font-header text-lg font-black text-white">{item.value}</p>
                <p className="text-[9px] uppercase tracking-widest text-white/45">{item.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-14" aria-labelledby="person-certs">
        <h2 id="person-certs" className="mb-6 flex items-center gap-3 font-header text-2xl font-black text-white">
          <Icon name="certificates" size={22} />
          Certificados recientes
        </h2>
        <ProjectSlider ariaLabel="Certificados recientes de Francisco García" itemClassName="w-[17rem] sm:w-[19rem]">
          {featured.map((cert) => (
            <div key={cert.id} className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-1 hover:border-white/25">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                <Icon name="verified" size={12} />
                {cert.provider}
              </p>
              <h3 className="mt-2 text-sm font-bold leading-snug text-white">{cert.title}</h3>
              <p className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/35">
                <Icon name="calendar" size={12} />
                {cert.dateText ?? cert.date}
              </p>
            </div>
          ))}
        </ProjectSlider>
        <p className="mt-6">
          <Link
            href="/certificates"
            className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:brightness-150 ${project.accent.chipBorder} ${project.accent.chipBg} ${project.accent.text}`}
          >
            <Icon name="certificates" size={13} />
            Ver todos los certificados
          </Link>
        </p>
      </section>
    </>
  );
}

/** Ciszuko Antony (marca): pilares, redes reales y contenido. */
function BrandSections({ project }: { project: Project }) {
  const socials = SOCIAL_ENTRIES.slice(0, 8);
  return (
    <>
      <section className="mb-14" aria-labelledby="brand-socials">
        <h2 id="brand-socials" className="mb-6 flex items-center gap-3 font-header text-2xl font-black text-white">
          <Icon name="share" size={22} />
          Dónde publica
        </h2>
        <ProjectSlider ariaLabel="Redes de Ciszuko Antony" itemClassName="w-[15rem] sm:w-[17rem]">
          {socials.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:-translate-y-1"
              style={{ borderColor: `${social.accent}40` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${social.accent}22` }}>
                {social.ui ? <SocialIcon platform={social.ui} size={18} /> : <Icon name="share" size={18} />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white">{social.name}</span>
                <span className="block truncate text-[10px] text-white/40">{social.handle}</span>
              </span>
            </a>
          ))}
        </ProjectSlider>
      </section>

      <section className="mb-14 grid grid-cols-1 items-center gap-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className={`mx-auto h-48 w-48 overflow-hidden rounded-[2rem] border-4 p-1 ${project.accent.border}`}>
          <ProjectImage src={SELFIE} alt="Retrato de Ciszuko Antony" className="h-full w-full rounded-[1.6rem] object-cover" />
        </div>
        <div>
          <h2 className="flex items-center gap-3 font-header text-2xl font-black text-white">
            <Icon name="user" size={22} />
            El creador
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Ciszuko Antony es el nombre artístico de Francisco García, CEO y fundador de Ciszu Network.
            Todo el contenido, la música y el desarrollo del ecosistema sale de su trabajo, y esta web es
            su portfolio oficial.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['YouTube', 'Twitch', 'TikTok', 'Instagram', 'Spotify', 'SoundCloud'].map((platform) => (
              <span
                key={platform}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 ${project.accent.chipBorder} ${project.accent.chipBg}`}
              >
                <Icon name="check" size={11} />
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** Ciszu Network (empresa): ecosistema real y comisiones. */
function CompanySections({ project }: { project: Project }) {
  return (
    <>
      <section className="mb-14" aria-labelledby="company-ecosystem">
        <h2 id="company-ecosystem" className="mb-6 flex items-center gap-3 font-header text-2xl font-black text-white">
          <Icon name="rocket" size={22} />
          El ecosistema que construye
        </h2>
        <ProjectSlider ariaLabel="Ecosistema Ciszu Network" itemClassName="w-[15rem] sm:w-[17rem]">
          {ECOSYSTEM.map((site) => (
            <a
              key={site.name}
              href={site.href}
              target={site.href.startsWith('http') ? '_blank' : undefined}
              rel={site.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`group block h-full rounded-2xl border bg-white/[0.03] p-5 transition-all hover:-translate-y-1 ${project.accent.border}`}
            >
              <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${project.accent.chipBorder} ${project.accent.chipBg} ${project.accent.text}`}>
                <Icon name={site.href.startsWith('http') ? 'external' : 'home'} size={18} />
              </span>
              <p className="font-header text-sm font-bold text-white">{site.name}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">{site.desc}</p>
            </a>
          ))}
        </ProjectSlider>
      </section>

      <section className={`mb-14 rounded-[2rem] border p-8 ${project.accent.border} ${project.accent.chipBg}`}>
        <h2 className="flex items-center gap-3 font-header text-2xl font-black text-white">
          <Icon name="money" size={22} />
          Servicios y comisiones
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
          La empresa acepta encargos de desarrollo web, bots, identidad visual y automatización. Las
          condiciones y ejemplos viven en la página de comisiones.
        </p>
        <Link
          href="/commissions"
          className={`mt-6 inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:brightness-150 ${project.accent.chipBorder} ${project.accent.chipBg} ${project.accent.text}`}
        >
          <Icon name="money" size={13} />
          Ver comisiones
        </Link>
      </section>
    </>
  );
}
