'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon, EcosystemSection, captureEvent } from '@ciszu/ui';
import { PROJECTS } from '@/data/projects';
import { CERTIFICATES } from '@/data/certificates';
import { CHANGELOG_DATA } from '@/data/changelog';
import { SOCIAL_ENTRIES, getSocial } from '@/data/socials';
import { MUZICMANIA_ALBUMS, MUSIC_PLATFORMS, REAL_ALBUMS } from '@/data/music';
import MusicCover from '@/components/music/MusicCover';
import CdnImage from '@/components/shared/CdnImage';
import SocialGlyph from '@/components/socials/SocialGlyph';
import QuickDocks from '@/components/molecules/QuickDocks';
import { supabase } from '@/config/supabase';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';

/* ────────────────────────────────────────────────────────────────
 * Datos REALES del portfolio. Nada de métricas inventadas:
 * certificados y proyectos salen del repo; las redes, de la config.
 * ──────────────────────────────────────────────────────────────── */

const FEATURED_CERTS = [...CERTIFICATES]
  .filter((cert) => cert.date)
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  .slice(0, 6);

const PROVIDER_COUNT = new Set(CERTIFICATES.map((cert) => cert.provider)).size;

/** Obra propia (musicboard) primero; repertorio del juego después. */
const REAL_ALBUM = REAL_ALBUMS[0];
const GAME_ALBUM = MUZICMANIA_ALBUMS[0];

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const fmtDate = (iso?: string) => {
  if (!iso) return 'Sin fecha';
  const [year, month] = iso.split('-').map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year}`;
};

interface ReviewRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_anonymous: boolean | null;
  created_at: string;
}
interface ProfileRow {
  id: string;
  display_name: string | null;
  username: string | null;
}

/* ────────────────────────────────────────────────────────────────
 * Reveal — aparición al hacer scroll sin framer-motion.
 * ──────────────────────────────────────────────────────────────── */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  icon,
  kicker,
  title,
  tone,
}: {
  icon: string;
  kicker: string;
  title: string;
  tone: string;
}) {
  return (
    <div className="text-center mb-12">
      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-4 ${tone}`}>
        <Icon name={icon} size={24} />
      </span>
      <p className={`text-[10px] font-black uppercase tracking-[0.45em] mb-2 ${tone}`}>{kicker}</p>
      <h2 className="text-3xl md:text-4xl font-header font-black uppercase italic tracking-tight text-white">{title}</h2>
    </div>
  );
}

export default function HomeContent() {
  usePageTitle('HOME');
  const dict = useDict();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [reviewNames, setReviewNames] = useState<Record<string, string>>({});

  const track = (target: string) => captureEvent('home_cta', { target, page: 'home' });

  // Reseñas reales de Supabase: si no hay datos, la sección no se pinta.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('id,user_id,rating,comment,is_anonymous,created_at')
          .order('created_at', { ascending: false })
          .limit(3);
        if (error) throw error;
        const rows = (Array.isArray(data) ? data : []) as ReviewRow[];
        if (!active || rows.length === 0) return;

        const ids = Array.from(new Set(rows.map((row) => row.user_id))).filter(Boolean);
        const names: Record<string, string> = {};
        if (ids.length > 0) {
          const { data: profileRows } = await supabase
            .from('profiles')
            .select('id,display_name,username')
            .in('id', ids);
          (Array.isArray(profileRows) ? (profileRows as ProfileRow[]) : []).forEach((profile) => {
            names[profile.id] = profile.display_name || profile.username || '';
          });
        }
        if (!active) return;
        setReviewNames(names);
        setReviews(rows);
      } catch {
        /* sin reseñas reales no se muestra nada */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { value: `${CERTIFICATES.length}`, label: 'Certificados', icon: 'certificates', tone: 'text-neon-blue' },
    { value: `${PROJECTS.length}`, label: dict.home.statProjects, icon: 'rocket', tone: 'text-neon-pink' },
    { value: `${SOCIAL_ENTRIES.length}`, label: 'Redes', icon: 'share', tone: 'text-neon-cyan' },
    { value: '2022', label: 'Desde', icon: 'history', tone: 'text-neon-green' },
  ];

  const youtube = getSocial('youtube');
  const twitch = getSocial('twitch');

  return (
    <div className="min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <h1 className="sr-only">Ciszuko Antony — CEO y fundador de Ciszu Network</h1>

        {/* Fondo animado (CSS puro) */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(35,63,146,0.28)_0%,rgba(5,10,20,0.35)_60%,transparent_100%)]" />
          <div
            className="absolute inset-0 animate-grid-shift opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(90,130,232,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(90,130,232,0.12) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-neon-blue/10 rounded-full blur-[130px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-neon-purple/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-neon-pink/10 rounded-full blur-[110px] animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 md:gap-7 mb-8 flex-wrap">
            <CdnImage
              src="projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png"
              alt="Isotipo de Ciszuko Antony"
              width={96}
              height={86}
              fetchPriority="high"
              className="animate-float drop-shadow-[0_0_25px_rgba(90,130,232,0.55)]"
            />
            <CdnImage
              src="projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png"
              alt="Logotipo de Ciszuko Antony"
              width={300}
              height={75}
              fetchPriority="high"
              className="animate-float-delayed max-w-[62vw] drop-shadow-[0_0_30px_rgba(61,106,223,0.5)]"
            />
            <CdnImage
              src="projects/ciszukoantony/content/logos/images/samples/circle/circle_1_yt.png"
              alt="Ciszuko Antony — canal de YouTube"
              width={96}
              height={96}
              fetchPriority="high"
              className="rounded-full ring-2 ring-neon-blue/50 shadow-[0_0_30px_rgba(167,139,250,0.45)] animate-pulse"
            />
          </div>

          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            {dict.home.role}{' '}
            <a
              href="https://ciszunetwork.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-blue font-bold hover:text-white transition-colors"
            >
              Ciszu Network
            </a>
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mb-9 text-xs uppercase tracking-[0.3em]">
            {dict.home.tagline}
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/portfolio"
              onClick={() => track('projects')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-neon-blue/15 border-2 border-neon-blue/60 text-neon-blue font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-neon-blue hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <Icon name="rocket" size={18} />
              {dict.home.viewProjects}
            </Link>
            <Link
              href="/socials"
              onClick={() => track('socials')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-neon-pink/10 border-2 border-neon-pink/50 text-neon-pink font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-neon-pink hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <Icon name="share" size={18} />
              Socials
            </Link>
            <Link
              href="/contact"
              onClick={() => track('contact')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white/5 border-2 border-white/20 text-white font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95"
            >
              <Icon name="mail" size={18} />
              {dict.home.contact}
            </Link>
          </div>
        </div>

        {/* Scroll down */}
        <a
          href="#sobre-mi"
          aria-label="Bajar al contenido"
          onClick={() => track('scroll_down')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-neon-blue hover:text-neon-pink transition-colors"
        >
          <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center animate-bounce">
            <Icon name="chevronRight" size={18} className="rotate-90" />
          </span>
        </a>
      </section>

      {/* ── TICKER de datos reales ───────────────────────────── */}
      <section aria-hidden className="relative border-y-2 border-white/5 bg-black/40 py-3 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center shrink-0">
              {[
                `${CERTIFICATES.length} CERTIFICADOS`,
                `${PROJECTS.length} PROYECTOS`,
                `${SOCIAL_ENTRIES.length} REDES OFICIALES`,
                'CISZU NETWORK',
                'CISZUKO ANTONY',
                'GAMING · STREAMING',
                'GENESIS NEON',
                'MÚSICA',
                'NEXT.JS · TYPESCRIPT · SUPABASE',
              ].map((word) => (
                <span key={`${copy}-${word}`} className="mx-6 text-[11px] font-header font-black uppercase tracking-[0.35em] text-gray-500 whitespace-nowrap">
                  {word} <span className="text-neon-blue ml-6">{'//'}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS reales ─────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 80}>
              <div className="group h-full text-center p-6 rounded-[1.75rem] bg-white/5 border border-white/10 hover:border-white/25 transition-all hover:-translate-y-1">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 mb-3 ${stat.tone}`}>
                  <Icon name={stat.icon} size={22} />
                </span>
                <p className={`text-3xl md:text-4xl font-header font-black ${stat.tone}`}>{stat.value}</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.25em] mt-1">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SOBRE MÍ ─────────────────────────────────────────── */}
      <section id="sobre-mi" className="scroll-mt-24 py-20 px-4 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionTitle icon="user" kicker="Perfil" title={dict.home.aboutTitle} tone="text-neon-blue" />
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 rounded-[2.5rem] bg-black/40 border border-white/10">
              <CdnImage
                src="shared/images/francisco_selfie/IMG_20251207_001632@893898207.jpg"
                alt="Retrato de Ciszuko Antony"
                width={160}
                height={160}
                className="rounded-full object-cover shrink-0 ring-2 ring-neon-blue/40 shadow-[0_0_35px_rgba(61,106,223,0.35)]"
              />
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-header font-black uppercase italic text-white mb-2">
                  Ciszuko Antony
                  <span className="block text-[10px] tracking-[0.4em] text-neon-blue not-italic mt-1">
                    FRANCISCO ANTONIO GARCÍA MENOLASCINA
                  </span>
                </h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  {dict.home.aboutBefore} <span className="text-neon-blue font-bold">Ciszuko Antony</span>, {dict.home.aboutRole}{' '}
                  <a
                    href="https://ciszunetwork.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-blue font-bold hover:text-white transition-colors"
                  >
                    Ciszu Network
                  </a>
                  {dict.home.aboutAfter}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-5">
                  {['Coro, Falcón · Venezuela', 'GMT-4', 'Full-stack · Diseño · Música', 'Desde 2022'].map((chip) => (
                    <span key={chip} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Link
                    href="/portfolio"
                    onClick={() => track('about_portfolio')}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-neon-blue/15 border border-neon-blue/50 text-neon-blue font-header font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-neon-blue hover:text-white transition-all"
                  >
                    <Icon name="palette" size={16} />
                    Portfolio &amp; CV
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/20 text-white font-header font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    <Icon name="info" size={16} />
                    {dict.home.moreAbout}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── MÚSICA ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionTitle icon="music" kicker="Discografía" title="Música" tone="text-neon-purple" />
          </Reveal>

          {/* Obra propia (musicboard): primero y con sus enlaces reales */}
          {REAL_ALBUM ? (
            <>
              <Reveal>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-neon-pink">
                    <Icon name="star" size={16} />
                    Obra propia · {REAL_ALBUM.title}
                  </h3>
                  <Link
                    href="/musicboard"
                    onClick={() => track('music_musicboard')}
                    className="inline-flex items-center gap-2 text-[10px] font-header font-black uppercase tracking-widest text-neon-pink hover:text-white transition-colors"
                  >
                    Ver musicboard
                    <Icon name="chevronRight" size={13} />
                  </Link>
                </div>
              </Reveal>
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-8 items-stretch">
                <Reveal delay={80} className="h-full">
                  <div className="h-full p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-neon-pink/15 via-transparent to-transparent border border-neon-pink/30 flex flex-col">
                    <MusicCover
                      src={REAL_ALBUM.cover}
                      alt={`Portada de ${REAL_ALBUM.title}`}
                      width={420}
                      height={420}
                      className="w-full max-w-[320px] mx-auto rounded-3xl border border-white/10 shadow-[0_0_45px_rgba(255,51,204,0.28)]"
                    />
                    <div className="mt-6 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-pink">
                        {REAL_ALBUM.kind} · {REAL_ALBUM.year}
                      </p>
                      <h3 className="text-2xl font-header font-black uppercase italic text-white mt-1">
                        {REAL_ALBUM.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mt-3">{REAL_ALBUM.description}</p>
                      <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {REAL_ALBUM.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track(`music_real_${link.label.toLowerCase()}`)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-neon-pink/15 border border-neon-pink/50 text-neon-pink font-header font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-neon-pink hover:text-white transition-all"
                          >
                            <Icon name={link.icon} size={16} />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={160} className="h-full">
                  <div className="h-full grid grid-cols-2 gap-4">
                    {REAL_ALBUM.tracks.map((song) => (
                      <a
                        key={song.id}
                        href={song.links[0].href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track(`music_real_track_${song.id}`)}
                        className="group p-4 rounded-[1.75rem] bg-white/5 border border-white/10 hover:border-neon-pink/50 transition-all hover:-translate-y-1"
                      >
                        <MusicCover
                          src={song.cover}
                          alt={`Portada de ${song.title}`}
                          width={200}
                          height={200}
                          className="w-full aspect-square object-cover rounded-2xl border border-white/10 group-hover:scale-[1.02] transition-transform"
                        />
                        <div className="mt-3 flex items-center gap-2">
                          <Icon name="music" size={14} className="text-neon-pink" />
                          <span className="text-xs font-header font-bold text-white truncate">{song.title}</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                          Escuchar en {song.links[0].label}
                        </span>
                      </a>
                    ))}
                  </div>
                </Reveal>
              </div>
            </>
          ) : null}

          {/* Repertorio de MuzicMania: después de la obra propia */}
          {GAME_ALBUM ? (
            <Reveal delay={200}>
              <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-8 items-stretch">
                <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-neon-purple/15 via-transparent to-transparent border border-neon-purple/30 flex flex-col">
                  <MusicCover
                    src={GAME_ALBUM.cover}
                    alt={`Portada de ${GAME_ALBUM.title}`}
                    width={420}
                    height={420}
                    className="w-full max-w-[280px] mx-auto rounded-3xl border border-white/10 shadow-[0_0_45px_rgba(128,0,255,0.35)]"
                  />
                  <div className="mt-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-purple">
                      {GAME_ALBUM.kind} · MuzicMania
                    </p>
                    <h3 className="text-2xl font-header font-black uppercase italic text-white mt-1">
                      {GAME_ALBUM.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed mt-3">{GAME_ALBUM.description}</p>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                      {GAME_ALBUM.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track(`music_game_${link.label.toLowerCase()}`)}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-neon-purple/20 border border-neon-purple/50 text-neon-purple font-header font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-neon-purple hover:text-white transition-all"
                        >
                          <Icon name={link.icon} size={16} />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {GAME_ALBUM.tracks.map((song) => (
                    <a
                      key={song.id}
                      href={song.links[0].href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track(`music_track_${song.id}`)}
                      className="group p-4 rounded-[1.75rem] bg-white/5 border border-white/10 hover:border-neon-purple/50 transition-all hover:-translate-y-1"
                    >
                      <MusicCover
                        src={song.cover}
                        alt={`Portada de ${song.title}`}
                        width={200}
                        height={200}
                        className="w-full aspect-square object-cover rounded-2xl border border-white/10 group-hover:scale-[1.02] transition-transform"
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <Icon name="music" size={14} className="text-neon-purple" />
                        <span className="text-xs font-header font-bold text-white truncate">{song.title}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {GAME_ALBUM.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          ) : null}

          {/* Canales reales de música */}
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="https://www.youtube.com/@CiszukoAntony"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('music_youtube')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:border-neon-red/50 transition-all"
              >
                {youtube ? <SocialGlyph social={youtube} size={18} /> : null}
                <span className="text-xs font-header font-bold text-white">YouTube</span>
              </a>
              <a
                href={MUSIC_PLATFORMS.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('music_soundcloud')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:border-orange-500/50 transition-all"
              >
                <Icon name="music" size={16} className="text-orange-500" />
                <span className="text-xs font-header font-bold text-white">SoundCloud</span>
              </a>
              <a
                href={MUSIC_PLATFORMS.ytmusic}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('music_ytmusic')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:border-neon-red/50 transition-all"
              >
                <Icon name="headset" size={16} className="text-neon-red" />
                <span className="text-xs font-header font-bold text-white">YouTube Music</span>
              </a>
              <a
                href="https://www.twitch.tv/ciszukoantony_"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('music_twitch')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:border-neon-purple/50 transition-all"
              >
                {twitch ? <SocialGlyph social={twitch} size={18} /> : null}
                <span className="text-xs font-header font-bold text-white">Twitch</span>
              </a>
              <Link
                href="/musicboard"
                onClick={() => track('music_musicboard')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:border-neon-pink/50 transition-all"
              >
                <Icon name="music" size={16} className="text-neon-pink" />
                <span className="text-xs font-header font-bold text-white">Musicboard completo</span>
              </Link>
              <Link
                href="/socials/spotify"
                onClick={() => track('music_social_page')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl hover:border-neon-green/50 transition-all"
              >
                <Icon name="headset" size={16} className="text-neon-green" />
                <span className="text-xs font-header font-bold text-white">Página de Spotify</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ── REDES / PLATAFORMAS ──────────────────────────────── */}
      <section className="py-20 px-4 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionTitle icon="share" kicker={dict.home.connectSub} title={dict.home.connect} tone="text-neon-pink" />
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SOCIAL_ENTRIES.map((social, i) => (
              <Reveal key={social.id} delay={i * 40}>
                <Link
                  href={`/socials/${social.id}`}
                  onClick={() => track(`social_card_${social.id}`)}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    <SocialGlyph social={social} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-header font-black text-white truncate">{social.name}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">
                      {social.tagline}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="text-center mt-10">
              <Link
                href="/socials"
                onClick={() => track('socials_index')}
                className="inline-flex items-center gap-2 px-7 py-4 bg-neon-pink/15 border-2 border-neon-pink/50 text-neon-pink font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-neon-pink hover:text-white transition-all hover:scale-105"
              >
                <Icon name="external" size={16} />
                Ver todas las redes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PROYECTOS ────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionTitle icon="rocket" kicker="Portfolio" title={dict.home.projectsTitle} tone="text-neon-blue" />
          </Reveal>

          <Reveal>
            <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-neon-cyan mb-6">
              <Icon name="user" size={16} />
              Proyectos personales de Ciszuko Antony
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {PROJECTS.map((project, i) => (
              <Reveal key={project.slug} delay={i * 80}>
                <article className="group h-full p-6 rounded-[2.25rem] bg-white/5 border border-white/10 hover:border-neon-cyan/40 transition-all hover:-translate-y-1 flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <CdnImage
                      src={project.logo}
                      alt={`Logo de ${project.name}`}
                      width={56}
                      height={56}
                      className="h-14 w-14 object-contain shrink-0 group-hover:scale-110 transition-transform"
                    />
                    <div>
                      <h4 className="text-lg font-header font-black uppercase italic text-white">{project.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">{project.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed flex-1">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {project.stack.slice(0, 4).map((tech) => (
                      <span key={tech} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-gray-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/projects/${project.slug}`}
                    onClick={() => track(`project_${project.slug}`)}
                    className="inline-flex items-center gap-2 mt-5 text-neon-blue hover:text-white text-xs font-header font-bold uppercase tracking-widest transition-colors"
                  >
                    {dict.common.viewProject}
                    <Icon name="chevronRight" size={14} />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={150}>
            <div className="text-center mt-10">
              <Link
                href="/projects"
                onClick={() => track('projects_all')}
                className="inline-flex items-center gap-2 px-7 py-4 bg-white/5 border-2 border-white/20 text-white font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105"
              >
                <Icon name="gamepad" size={16} />
                {dict.home.viewAllProjects}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CERTIFICACIONES ──────────────────────────────────── */}
      <section className="py-20 px-4 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionTitle icon="certificates" kicker="Formación verificable" title="Certificaciones" tone="text-neon-green" />
          </Reveal>
          <Reveal>
            <p className="text-center text-gray-400 text-sm max-w-2xl mx-auto mb-10">
              {CERTIFICATES.length} documentos reales de {PROVIDER_COUNT} emisores (Cisco, Microsoft, IBM, HP, EF SET,
              University of Pennsylvania y más), con verificación y preview en el catálogo del portfolio.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_CERTS.map((cert, i) => (
              <Reveal key={cert.id} delay={i * 60}>
                <Link
                  href="/certificates"
                  onClick={() => track('cert_card')}
                  className="group block h-full p-5 rounded-[1.75rem] bg-white/5 border border-white/10 hover:border-neon-green/40 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neon-green">{fmtDate(cert.date)}</span>
                    <Icon name="certificates" size={16} className="text-neon-green" />
                  </div>
                  <h4 className="font-header font-bold text-white text-sm leading-snug mb-1">{cert.title}</h4>
                  <p className="text-xs text-gray-500">{cert.provider}</p>
                  {cert.level ? <p className="text-[10px] text-gray-400 mt-2">{cert.level}</p> : null}
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="text-center mt-10">
              <Link
                href="/certificates"
                onClick={() => track('certificates_all')}
                className="inline-flex items-center gap-2 px-7 py-4 bg-neon-green/15 border-2 border-neon-green/50 text-neon-green font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-neon-green hover:text-white transition-all hover:scale-105"
              >
                <Icon name="check" size={16} />
                Ver catálogo completo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── RESEÑAS REALES (solo si existen) ─────────────────── */}
      {reviews.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <SectionTitle icon="star" kicker={dict.reviews.kicker} title="Reseñas de la comunidad" tone="text-neon-yellow" />
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviews.map((review, i) => (
                <Reveal key={review.id} delay={i * 80}>
                  <article className="h-full p-5 rounded-[1.75rem] bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1 mb-3 text-neon-yellow">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon key={star} name="star" size={14} className={star <= Math.round(review.rating) ? '' : 'opacity-25'} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-4">{review.comment}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {review.is_anonymous ? 'Anónimo' : reviewNames[review.user_id] || 'Usuario registrado'}
                      {' · '}
                      {fmtDate(review.created_at.slice(0, 10))}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 text-neon-yellow hover:text-white text-xs font-header font-bold uppercase tracking-widest transition-colors"
              >
                {dict.reviews.trustTitle}
                <Icon name="chevronRight" size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CHANGELOG REAL ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <SectionTitle icon="history" kicker="Bitácora" title={dict.nav.changelog} tone="text-neon-cyan" />
          </Reveal>
          <div className="space-y-4">
            {CHANGELOG_DATA.slice(0, 3).map((item, i) => (
              <Reveal key={item.id} delay={i * 70}>
                <Link
                  href={`/changelog/${item.id}`}
                  onClick={() => track('changelog_item')}
                  className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-[1.75rem] bg-white/5 border border-white/10 hover:border-neon-cyan/40 transition-all hover:-translate-y-0.5"
                >
                  <span className="shrink-0 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[9px] font-black uppercase tracking-widest">
                    {item.version}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-header font-bold text-white text-sm truncate group-hover:text-neon-cyan transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 shrink-0">
                    {fmtDate(item.date)}
                  </span>
                  <Icon name="chevronRight" size={16} className="text-gray-500 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="text-center mt-8">
              <Link
                href="/changelog"
                onClick={() => track('changelog_all')}
                className="inline-flex items-center gap-2 px-7 py-4 bg-neon-cyan/15 border-2 border-neon-cyan/50 text-neon-cyan font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-neon-cyan hover:text-white transition-all hover:scale-105"
              >
                <Icon name="history" size={16} />
                Registro completo
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA CONTACTO ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-[3rem] border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-pink/10 p-8 md:p-12 text-center">
          <div aria-hidden className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-neon-pink/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-neon-blue mb-5">
              <Icon name="mail" size={28} />
            </span>
            <h2 className="text-3xl md:text-4xl font-header font-black uppercase italic text-white mb-4">
              ¿Trabajamos juntos?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
              Comisiones de desarrollo web, bots, automatización, identidad visual y música. Atención directa por
              WhatsApp o mediante el formulario de contacto.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/commissions"
                onClick={() => track('cta_commissions')}
                className="inline-flex items-center gap-2 px-7 py-4 bg-neon-blue text-white font-header font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(61,106,223,0.35)]"
              >
                <Icon name="money" size={16} />
                Comisiones
              </Link>
              <a
                href="https://wa.me/584126858111"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('cta_whatsapp')}
                className="inline-flex items-center gap-2 px-7 py-4 bg-[#25D366]/15 border-2 border-[#25D366]/50 text-[#25D366] font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-[#25D366] hover:text-white transition-all hover:scale-105"
              >
                <Icon name="phone" size={16} />
                WhatsApp
              </a>
              <Link
                href="/contact"
                onClick={() => track('cta_contact')}
                className="inline-flex items-center gap-2 px-7 py-4 bg-white/5 border-2 border-white/20 text-white font-header font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:text-black transition-all hover:scale-105"
              >
                <Icon name="comment" size={16} />
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      <QuickDocks />

      <EcosystemSection
        title={dict.home.ecosystemTitle}
        description={dict.home.ecosystemBody}
        visitHref="https://ciszunetwork.vercel.app"
        projectsHref="/projects"
      />
    </div>
  );
}
