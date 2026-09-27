'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Globe,
  Heart,
  Layers,
  Mail,
  Rocket,
  Scale,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  captureEvent,
  trackEvent,
  usePublishedChangelogs,
  SocialIcon,
  type SocialPlatform,
} from '@ciszu/ui';
import { mergeChangelogSources, type ChangelogItem } from '@ciszunetwork/utils/changelog';
import { assetResolver } from '@ciszunetwork/cdn';
import PageAmbience from '@/components/layout/PageAmbience';
import { AnimatedSection } from '@/components/shared/AnimatedSection';
import QuickDocks from '@/components/molecules/QuickDocks';
import { CountUp } from '@/components/home/CountUp';
import { TAG_CONFIG } from '@/config/changelogIcons';
import { useDict } from '@/lib/useDict';
import { fillTemplate } from '@/lib/i18n';
import { useAppStore } from '@/store';
import { supabase } from '@/config/supabase';
import { CHANGELOG_DATA } from '@/data/changelog';
import {
  ACCENT_STYLES,
  ECOSYSTEM_PROJECTS,
  FEATURED_PROJECTS,
  HOME_STATS,
  SERVICES,
  TECH_STACK,
} from '@/data/ecosystem';
import {
  CISZU_NETWORK,
  CISZUKO_ANTONY,
  CISZUBOT_LINKS,
  DONATION_LINKS,
  GITHUB_REPO,
} from '@/config/site';

/* ------------------------------------------------------------------ */
/* Analytics                                                          */
/* ------------------------------------------------------------------ */

/** Evento de producto: se envía a GA4 y a PostHog (no-op si no hay consentimiento). */
function track(event: string, params?: Record<string, unknown>) {
  trackEvent(event, params);
  captureEvent(event, params);
}

/* ------------------------------------------------------------------ */
/* Reseñas reales (Supabase)                                          */
/* ------------------------------------------------------------------ */

interface HomeReview {
  id: string;
  rating: number;
  comment: string;
  is_anonymous: boolean | null;
  likes_count: number | null;
  created_at: string;
  user_profile: { display_name?: string | null; username?: string | null } | null;
}

const REVIEWS_SHOWN = 3;

function reviewName(review: HomeReview, anonymousLabel: string): string {
  if (review.is_anonymous) return anonymousLabel;
  return review.user_profile?.display_name?.trim() || review.user_profile?.username?.trim() || anonymousLabel;
}

function localeOf(language: string): string {
  if (language === 'en-us') return 'en-US';
  if (language === 'en-uk') return 'en-GB';
  if (language === 'es-es') return 'es-ES';
  return 'es-VE';
}

/* ------------------------------------------------------------------ */
/* Home                                                               */
/* ------------------------------------------------------------------ */

export default function HomeContent() {
  const t = useDict();
  const language = useAppStore((state) => state.language);
  const [activeFeatured, setActiveFeatured] = useState(FEATURED_PROJECTS[0].id);
  const [reviews, setReviews] = useState<HomeReview[] | null>(null);

  /* Changelog real: entradas declaradas + publicadas en vivo desde el devcon. */
  const published = usePublishedChangelogs('ciszu');
  const latestChangelog = useMemo<ChangelogItem[]>(() => {
    const merged = mergeChangelogSources(published.entries, CHANGELOG_DATA);
    return [...merged]
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, 3);
  }, [published.entries]);

  /* Reseñas reales: mismas tablas que /reviews; sin datos de ejemplo. */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('id, rating, comment, is_anonymous, likes_count, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(60);
        if (error) throw error;
        const rows = (Array.isArray(data) ? data : []) as (Omit<HomeReview, 'user_profile'> & {
          user_id: string;
        })[];
        const ids = Array.from(new Set(rows.map((row) => row.user_id))).filter(Boolean);
        const profiles: Record<string, HomeReview['user_profile']> = {};
        if (ids.length > 0) {
          const { data: profileRows } = await supabase
            .from('profiles')
            .select('id, display_name, username')
            .in('id', ids.slice(0, 20));
          (Array.isArray(profileRows) ? profileRows : []).forEach(
            (profile: { id: string; display_name: string | null; username: string | null }) => {
              profiles[profile.id] = profile;
            },
          );
        }
        if (cancelled) return;
        setReviews(
          rows.map((row) => ({
            ...row,
            user_profile: profiles[row.user_id] ?? null,
          })),
        );
      } catch {
        if (!cancelled) setReviews([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const reviewSummary = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
    const top = [...reviews]
      .sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0) || Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, REVIEWS_SHOWN);
    return { average, total: reviews.length, top };
  }, [reviews]);

  const featured = FEATURED_PROJECTS.find((project) => project.id === activeFeatured) ?? FEATURED_PROJECTS[0];

  const socialItems = Object.entries(CISZU_NETWORK.social) as [SocialPlatform, string][];

  const heroBars = useMemo(
    () =>
      Array.from({ length: 64 }).map((_, index) => ({
        height: 18 + Math.abs(Math.sin(index * 0.5)) * 42 + Math.abs(Math.cos(index * 1.1)) * 22,
        duration: 1.4 + Math.abs(Math.sin(index * 0.4)) * 0.9,
        delay: index * 0.045,
      })),
    [],
  );

  const marqueeTech = useMemo(() => [...TECH_STACK, ...TECH_STACK], []);

  return (
    <div className="relative">
      <PageAmbience animated />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section
        id="hero"
        className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center scroll-mt-24"
      >
        <div className="pointer-events-none absolute inset-0 home-hero-glow" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-1/4 items-end gap-[2px] opacity-30">
          {heroBars.map((bar, index) => (
            <span
              key={index}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-transparent to-brand-light/60 animate-hero-wave"
              style={{ height: `${bar.height}%`, animationDuration: `${bar.duration}s`, animationDelay: `${bar.delay}s` }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <h1 className="sr-only">{CISZU_NETWORK.name}</h1>

          <div className="mb-6 flex items-center justify-center gap-6 group">
            <Image
              src={assetResolver.resolve(
                'projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zcolor_ccolor.svg',
              )}
              alt={`Isotipo de ${CISZU_NETWORK.name}`}
              width={104}
              height={104}
              priority
              className="h-auto w-20 md:w-26 drop-shadow-brand transition-all duration-500 group-hover:drop-shadow-[0_0_40px_rgba(58,107,240,0.9)] animate-float"
            />
            <Image
              src={assetResolver.resolve(
                'projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg',
              )}
              alt=""
              width={72}
              height={72}
              priority
              className="hidden h-auto w-16 md:block md:w-20 opacity-80 drop-shadow-brand transition-all duration-500 group-hover:opacity-100 animate-float-delayed"
            />
          </div>

          <p className="bg-gradient-to-r from-white via-brand-light to-brand-accent bg-clip-text font-header text-4xl font-black uppercase leading-none tracking-tighter text-transparent md:text-6xl">
            {CISZU_NETWORK.name}
          </p>

          <div className="mt-4 mb-5 flex justify-center">
            <Image
              data-logo-white="true"
              src={assetResolver.resolve('projects/ciszu/content/logos/images/outline/tagline/tagline_white.svg') + '?v=2'}
              alt={CISZU_NETWORK.tagline}
              width={320}
              height={24}
              priority
              className="h-auto w-[min(320px,70vw)] animate-float-delayed"
            />
          </div>

          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.4em] text-brand-light">
            {t.homePage.heroKicker}
          </p>
          <p className="mx-auto mb-10 max-w-2xl font-accent text-lg text-gray-300 md:text-xl">
            {t.homePage.heroDescription}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#ecosystem"
              onClick={() => track('home_cta_click', { target: 'ecosystem' })}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-brand/50 bg-brand/20 px-8 py-4 font-header text-lg font-black text-white shadow-[0_0_20px_rgba(35,63,146,0.3)] transition-all hover:scale-105 hover:bg-brand hover:shadow-[0_0_30px_rgba(35,63,146,0.5)]"
            >
              {t.homePage.ctaExplore} <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/contact"
              onClick={() => track('home_cta_click', { target: 'contact' })}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 font-header text-lg font-black text-white transition-all hover:scale-105 hover:bg-white/10"
            >
              <Mail className="h-5 w-5" /> {t.homePage.ctaContact}
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {socialItems.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={platform}
                onClick={() => track('home_social_click', { platform })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:scale-110 hover:border-brand-light hover:text-brand-light"
              >
                <SocialIcon platform={platform} size={16} colored={false} />
              </a>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="#numbers"
              onClick={() => track('home_scroll_down', { from: 'hero' })}
              aria-label={t.homePage.scrollDown}
              title={t.homePage.scrollDown}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-light text-brand-light transition-colors hover:border-brand-accent hover:text-brand-accent animate-bounce"
            >
              <ChevronDown className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section id="numbers" className="scroll-mt-24 border-y border-white/5 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-in-up">
            <div className="mb-10 text-center">
              <h2 className="font-header text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
                {t.homePage.statsTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-xs uppercase tracking-widest text-gray-400">
                {t.homePage.statsSubtitle}
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {HOME_STATS.map((stat, index) => (
              <AnimatedSection key={stat.id} animation="scale-in" delay={index * 80}>
                <div className="group h-full rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center transition-all hover:-translate-y-1 hover:border-brand-light/40 animate-pulse-glow">
                  <stat.icon className="mx-auto mb-3 h-6 w-6 text-brand-light transition-transform group-hover:scale-110" />
                  <div className="font-header text-4xl font-black text-brand-light">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {t.homePage[stat.labelKey]}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Marquee CSS con el stack real */}
          <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max gap-8 animate-marquee">
              {marqueeTech.map((tech, index) => (
                <span
                  key={`${tech.name}-${index}`}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500"
                >
                  <tech.icon className="h-3.5 w-3.5 text-brand-light" />
                  {tech.name}
                  {tech.version ? <span className="text-brand-light/70">{tech.version}</span> : null}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ ECOSISTEMA ═══════════════════ */}
      <section id="ecosystem" className="scroll-mt-24 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-in-up">
            <div className="mb-14 text-center">
              <div className="mb-3 inline-flex items-center gap-3">
                <Globe className="h-8 w-8 text-brand-light drop-shadow-brand" />
                <h2 className="bg-gradient-to-r from-brand-light via-brand-accent to-neon-cyan bg-clip-text font-header text-4xl font-black uppercase leading-none tracking-tighter text-transparent md:text-5xl">
                  {t.homePage.ecosystemTitle}
                </h2>
              </div>
              <p className="mx-auto max-w-2xl text-xs uppercase tracking-widest text-gray-400">
                {t.homePage.ecosystemSubtitle}
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_PROJECTS.map((project, index) => {
              const accent = ACCENT_STYLES[project.accent];
              const Comp = project.external ? 'a' : Link;
              const props = project.external
                ? { href: project.href, target: '_blank', rel: 'noopener noreferrer' }
                : { href: project.href };
              return (
                <AnimatedSection key={project.id} animation="fade-in-up" delay={index * 90} className="h-full">
                  <Comp
                    {...props}
                    onClick={() => track('home_project_click', { project: project.id })}
                    className={`group flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/5 p-6 transition-all duration-500 hover:-translate-y-2 ${accent.border} ${accent.glow}`}
                  >
                    <div className="mb-5 flex items-center gap-4">
                      <span
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 p-2.5"
                        style={{ background: 'linear-gradient(135deg,#0b0b14,#05050a)' }}
                      >
                        <Image
                          src={project.logo}
                          alt={`Logo de ${project.name}`}
                          width={48}
                          height={48}
                          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      </span>
                      <div className="min-w-0">
                        <h3 className={`truncate font-header text-xl font-black ${accent.text}`}>{project.name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                          {t.homePage[project.taglineKey]}
                        </p>
                      </div>
                    </div>

                    <p className="flex-grow text-xs leading-relaxed text-gray-400">
                      {t.homePage[project.descKey]}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className={`mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all group-hover:gap-2.5 ${accent.text}`}>
                      {project.external ? t.homePage.projectVisit : t.homePage.ecosystemCta}
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </Comp>
                </AnimatedSection>
              );
            })}

            {/* Tarjeta de cierre: repositorio real */}
            <AnimatedSection animation="fade-in-up" delay={450} className="h-full">
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('home_cta_click', { target: 'github' })}
                className="group flex h-full flex-col justify-between rounded-[2rem] border-2 border-dashed border-brand/30 bg-brand/5 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-brand-light/60"
              >
                <div>
                  <Terminal className="mb-4 h-8 w-8 text-brand-light" />
                  <h3 className="font-header text-xl font-black text-white">{t.homePage.ctaGithub}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">{t.homePage.stackSubtitle}</p>
                </div>
                <span className="mt-5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-light transition-all group-hover:gap-2.5">
                  GitHub <ExternalLink className="h-3 w-3" />
                </span>
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICIOS ═══════════════════ */}
      <section id="services" className="scroll-mt-24 border-t border-white/5 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-in-up">
            <div className="mb-14 text-center">
              <div className="mb-3 inline-flex items-center gap-3">
                <Rocket className="h-8 w-8 text-neon-cyan drop-shadow-neon-cyan" />
                <h2 className="bg-gradient-to-r from-neon-cyan via-brand-light to-brand-accent bg-clip-text font-header text-4xl font-black uppercase leading-none tracking-tighter text-transparent md:text-5xl">
                  {t.homePage.servicesTitle}
                </h2>
              </div>
              <p className="mx-auto max-w-xl text-xs uppercase tracking-widest text-gray-400">
                {t.homePage.servicesSubtitle}
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => {
              const accent = ACCENT_STYLES[service.accent];
              return (
                <AnimatedSection key={service.titleKey} animation="scale-in" delay={index * 70} className="h-full">
                  <div className={`group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-7 transition-all hover:-translate-y-1 ${accent.border} ${accent.glow}`}>
                    <div
                      className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent.tile} shadow-lg transition-transform group-hover:scale-110`}
                    >
                      <service.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 font-header text-xl font-bold text-white">{t.homePage[service.titleKey]}</h3>
                    <p className="flex-grow text-sm leading-relaxed text-gray-400">{t.homePage[service.descKey]}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {service.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STACK ═══════════════════ */}
      <section id="stack" className="scroll-mt-24 border-t border-white/5 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-in-up">
            <div className="mb-14 text-center">
              <div className="mb-3 inline-flex items-center gap-3">
                <Layers className="h-8 w-8 text-neon-green drop-shadow-neon-green" />
                <h2 className="bg-gradient-to-r from-neon-green via-neon-cyan to-brand-light bg-clip-text font-header text-4xl font-black uppercase leading-none tracking-tighter text-transparent md:text-5xl">
                  {t.homePage.stackTitle}
                </h2>
              </div>
              <p className="mx-auto max-w-xl text-xs uppercase tracking-widest text-gray-400">
                {t.homePage.stackSubtitle}
              </p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {TECH_STACK.map((tech, index) => {
              const accent = ACCENT_STYLES[tech.accent];
              return (
                <AnimatedSection key={tech.name} animation="scale-in" delay={index * 40}>
                  <a
                    href={tech.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('home_stack_click', { tech: tech.name })}
                    className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-1 ${accent.border}`}
                  >
                    <tech.icon className={`h-7 w-7 shrink-0 ${accent.text} transition-transform group-hover:scale-110`} />
                    <span className="min-w-0">
                      <span className="block truncate font-header text-sm font-bold text-white">{tech.name}</span>
                      {tech.version ? (
                        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
                          v{tech.version}
                        </span>
                      ) : null}
                    </span>
                  </a>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PROYECTOS DESTACADOS (tabs) ═══════════════════ */}
      <section id="featured" className="scroll-mt-24 border-t border-white/5 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-in-up">
            <div className="mb-10 text-center">
              <div className="mb-3 inline-flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-neon-pink drop-shadow-neon-pink" />
                <h2 className="bg-gradient-to-r from-neon-pink via-brand-accent to-neon-cyan bg-clip-text font-header text-4xl font-black uppercase leading-none tracking-tighter text-transparent md:text-5xl">
                  {t.homePage.featuredTitle}
                </h2>
              </div>
              <p className="mx-auto max-w-xl text-xs uppercase tracking-widest text-gray-400">
                {t.homePage.featuredSubtitle}
              </p>
            </div>
          </AnimatedSection>

          {/* Tabs reales: cambian la vitrina, sin carrusel de librerías */}
          <div className="mx-auto mb-8 flex max-w-2xl flex-wrap justify-center gap-2">
            {FEATURED_PROJECTS.map((project) => {
              const accent = ACCENT_STYLES[project.accent];
              const active = project.id === activeFeatured;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setActiveFeatured(project.id);
                    track('home_featured_tab', { project: project.id });
                  }}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-header text-xs font-black uppercase tracking-widest transition-all ${
                    active
                      ? `border-transparent bg-white/10 ${accent.text} shadow-lg`
                      : 'border-white/10 text-gray-400 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <project.icon className="h-4 w-4" />
                  {project.name}
                </button>
              );
            })}
          </div>

          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 lg:grid-cols-2">
            <div className="relative min-h-[260px] w-full">
              <Image
                src={featured.image}
                alt={featured.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
                <featured.icon className="h-3.5 w-3.5" />
                {featured.name}
              </span>
            </div>

            <div className="flex flex-col justify-center p-8 md:p-10">
              <h3 className={`mb-3 font-header text-3xl font-black uppercase tracking-tight ${ACCENT_STYLES[featured.accent].text}`}>
                {featured.name}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-400">{t.homePage[featured.descKey]}</p>

              <div className="mb-6 flex flex-wrap gap-2">
                {(ECOSYSTEM_PROJECTS.find((project) => project.id === featured.id)?.tech ?? []).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <Link
                href={featured.href}
                {...(featured.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={() => track('home_featured_click', { project: featured.id })}
                className="inline-flex w-fit items-center gap-2 rounded-xl border-2 border-brand/50 bg-brand/20 px-6 py-3 font-header text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-brand"
              >
                {featured.external ? t.homePage.projectVisit : t.homePage.ecosystemCta}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                <Globe className="h-3.5 w-3.5" />
                {featured.hrefLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ NOVEDADES + RESEÑAS ═══════════════════ */}
      <section id="changelog" className="scroll-mt-24 border-t border-white/5 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            {/* Changelog real */}
            <div className="flex flex-col">
              <AnimatedSection animation="slide-in-right">
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand-light">
                    <Activity className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="font-header text-3xl font-black uppercase tracking-tighter text-white">
                      {t.homePage.latestTitle}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {t.homePage.latestSubtitle}
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              <div className="flex flex-col gap-4">
                {latestChangelog.map((item, index) => {
                  const tag = TAG_CONFIG[item.types[0]] ?? TAG_CONFIG.feat;
                  return (
                    <AnimatedSection key={item.id} animation="fade-in-up" delay={index * 80}>
                      <Link
                        href={`/changelog/${item.id}`}
                        onClick={() => track('home_changelog_click', { id: item.id })}
                        className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-brand-light/40"
                      >
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/40 ${tag.color}`}>
                          <span className="h-5 w-5">{tag.icon}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-brand-light/30 bg-brand-light/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-light">
                              {item.version}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {item.date}
                            </span>
                          </span>
                          <span className="block truncate font-header text-base font-bold text-white transition-colors group-hover:text-brand-light">
                            {item.title}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-gray-400">
                            {item.description}
                          </span>
                        </span>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-brand-light" />
                      </Link>
                    </AnimatedSection>
                  );
                })}
              </div>

              <AnimatedSection animation="fade-in-up" delay={240}>
                <Link
                  href="/changelog"
                  onClick={() => track('home_cta_click', { target: 'changelog' })}
                  className="group mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-brand/30 bg-white/5 py-4 font-header text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:border-brand-light hover:bg-brand/10"
                >
                  {t.homePage.latestAll}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </AnimatedSection>
            </div>

            {/* Reseñas reales */}
            <div className="flex flex-col">
              <AnimatedSection animation="slide-in-right" delay={100}>
                <div className="mb-6 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-pink/10 text-neon-pink">
                    <Star className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="font-header text-3xl font-black uppercase tracking-tighter text-white">
                      {t.homePage.reviewsTitle}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {t.homePage.reviewsSubtitle}
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              {reviews === null ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
                  {t.common.loading}
                </div>
              ) : reviewSummary === null ? (
                <AnimatedSection animation="fade-in-up">
                  <div className="rounded-3xl border-2 border-dashed border-white/15 bg-white/5 p-8 text-center">
                    <Star className="mx-auto mb-4 h-10 w-10 text-neon-pink/60" />
                    <p className="mb-5 text-sm text-gray-400">{t.homePage.reviewsEmpty}</p>
                    <Link
                      href="/reviews"
                      onClick={() => track('home_review_click', { action: 'write_first' })}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-header text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-105"
                    >
                      {t.homePage.reviewsEmptyCta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </AnimatedSection>
              ) : (
                <>
                  <AnimatedSection animation="scale-in" delay={120}>
                    <div className="mb-5 flex items-center justify-between rounded-3xl border border-neon-pink/25 bg-neon-pink/5 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-header text-4xl font-black italic text-neon-pink">
                          {reviewSummary.average.toFixed(1)}
                        </span>
                        <div>
                          <div className="flex gap-0.5 text-neon-yellow">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4"
                                fill={star <= Math.round(reviewSummary.average) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {reviewSummary.total === 1
                              ? fillTemplate(t.homePage.reviewsOne, { n: reviewSummary.total })
                              : fillTemplate(t.homePage.reviewsCount, { n: reviewSummary.total })}
                          </p>
                        </div>
                      </div>
                      <span className="hidden text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 sm:block">
                        {t.homePage.reviewsAverage}
                      </span>
                    </div>
                  </AnimatedSection>

                  <div className="flex flex-col gap-4">
                    {reviewSummary.top.map((review, index) => (
                      <AnimatedSection key={review.id} animation="fade-in-up" delay={180 + index * 70}>
                        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-1 hover:border-neon-pink/30">
                          <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neon-pink/30 bg-black/40 font-header text-sm font-black text-neon-pink">
                              {review.is_anonymous
                                ? '?'
                                : reviewName(review, t.homePage.reviewsAnonymous).charAt(0).toUpperCase()}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-black uppercase tracking-widest text-white">
                                {reviewName(review, t.homePage.reviewsAnonymous)}
                              </span>
                              <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {new Date(review.created_at).toLocaleDateString(localeOf(language), {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-black text-neon-yellow">
                              <Star className="h-3.5 w-3.5" fill="currentColor" />
                              {Number(review.rating).toFixed(1)}
                            </span>
                          </div>
                          <p className="line-clamp-3 border-l-2 border-neon-pink/40 pl-3 text-xs italic leading-relaxed text-gray-300">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-neon-pink" />
                              {review.likes_count ?? 0}
                            </span>
                            {review.user_profile?.username && !review.is_anonymous ? (
                              <span>@{review.user_profile.username}</span>
                            ) : null}
                          </div>
                        </article>
                      </AnimatedSection>
                    ))}
                  </div>

                  <AnimatedSection animation="fade-in-up" delay={420}>
                    <Link
                      href="/reviews"
                      onClick={() => track('home_review_click', { action: 'view_all' })}
                      className="group mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-neon-pink/30 bg-white/5 py-4 font-header text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:border-neon-pink hover:bg-neon-pink/10"
                    >
                      {t.homePage.reviewsAll}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </AnimatedSection>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ CEO ═══════════════════ */}
      <section id="ceo" className="scroll-mt-24 border-t border-white/5 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="scale-in">
            <div className="group relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-brand/30 bg-gradient-to-br from-brand/10 via-brand-dark/10 to-transparent p-10 text-center md:p-14">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-[80px] transition-all group-hover:bg-brand-light/15" />
              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand via-brand-light to-brand-accent p-1 shadow-[0_0_30px_rgba(35,63,146,0.4)]">
                  <Image
                    src={assetResolver.resolve('shared/images/francisco_selfie/IMG_20251207_001627@869886661.jpg')}
                    alt={CISZUKO_ANTONY.name}
                    width={108}
                    height={108}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <h2 className="mb-2 font-header text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
                  {CISZUKO_ANTONY.name}
                </h2>
                <p className="mb-6 text-xs font-black uppercase tracking-[0.4em] text-brand-light">
                  {CISZUKO_ANTONY.role}
                </p>
                <p className="mx-auto mb-8 max-w-2xl leading-relaxed text-gray-300">
                  {fillTemplate(t.homePage.ceoBio, { site: CISZU_NETWORK.name })}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/contact"
                    onClick={() => track('home_cta_click', { target: 'ceo_contact' })}
                    className="inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/20 px-6 py-3 text-sm font-bold text-brand-light transition-all hover:bg-brand hover:text-white"
                  >
                    {t.homePage.ceoContact} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={CISZUKO_ANTONY.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('home_cta_click', { target: 'ceo_portfolio' })}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
                  >
                    <ExternalLink className="h-4 w-4" /> {t.homePage.ceoPortfolio}
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══════════════════ APOYO + CTA FINAL ═══════════════════ */}
      <section id="cta" className="scroll-mt-24 border-t border-white/5 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-in-up">
            <div className="mx-auto mb-12 max-w-5xl text-center">
              <div className="mb-3 inline-flex items-center gap-3">
                <Users className="h-8 w-8 text-neon-cyan drop-shadow-neon-cyan" />
                <h2 className="font-header text-3xl font-black uppercase tracking-tighter text-white md:text-4xl">
                  {t.homePage.supportTitle}
                </h2>
              </div>
              <p className="mx-auto max-w-xl text-sm text-gray-400">{t.homePage.supportSubtitle}</p>
            </div>
          </AnimatedSection>

          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              { icon: Globe, title: 'CiszuBot', desc: t.homePage.supportBotDesc, cta: t.homePage.supportVisitCta, href: CISZUBOT_LINKS.website },
              { icon: TrendingUp, title: t.homePage.supportVoteTitle, desc: t.homePage.supportVoteDesc, cta: t.homePage.supportVoteCta, href: CISZUBOT_LINKS.topggBotVote },
              { icon: BarChart3, title: t.homePage.supportServerTitle, desc: t.homePage.supportServerDesc, cta: t.homePage.supportServerCta, href: CISZUBOT_LINKS.topggServer },
            ].map((card, index) => (
              <AnimatedSection key={card.title} animation="fade-in-up" delay={index * 90} className="h-full">
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('home_support_click', { card: card.title })}
                  className="group flex h-full flex-col rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/15 to-transparent p-7 transition-all hover:-translate-y-1 hover:border-brand-light/50"
                >
                  <card.icon className="mb-4 h-7 w-7 text-brand-light" />
                  <h3 className="mb-2 font-header text-lg font-black uppercase text-white">{card.title}</h3>
                  <p className="flex-grow text-sm text-gray-400">{card.desc}</p>
                  <span className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-light transition-all group-hover:gap-2.5">
                    {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </a>
              </AnimatedSection>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-3">
            {[
              { name: 'Patreon', href: DONATION_LINKS.patreon, icon: Heart },
              { name: 'Ko-fi', href: DONATION_LINKS.koFi, icon: Zap },
              { name: 'Buy Me a Coffee', href: DONATION_LINKS.buyMeACoffee, icon: BookOpen },
              { name: t.nav.download, href: '/downloads', icon: Scale },
            ].map((item) => {
              const Comp = item.href.startsWith('http') ? 'a' : Link;
              const props = item.href.startsWith('http')
                ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' as const }
                : { href: item.href };
              return (
                <Comp
                  key={item.name}
                  {...props}
                  onClick={() => track('home_cta_click', { target: item.name })}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:border-brand-light/40 hover:text-brand-light"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Comp>
              );
            })}
          </div>

          <AnimatedSection animation="scale-in" delay={200}>
            <div className="mx-auto mt-16 max-w-3xl rounded-[2rem] border border-brand/30 bg-gradient-to-r from-brand/20 via-brand-dark/10 to-transparent p-12 text-center">
              <CheckCircle2 className="mx-auto mb-6 h-14 w-14 text-brand-light drop-shadow-brand" />
              <h2 className="mb-4 bg-gradient-to-r from-white via-brand-light to-brand-accent bg-clip-text font-header text-4xl font-black uppercase tracking-tighter text-transparent md:text-5xl">
                {t.homePage.ctaTitle}
              </h2>
              <p className="mx-auto mb-8 max-w-md text-xs uppercase tracking-widest text-gray-400">
                {t.homePage.ctaSubtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  onClick={() => track('home_cta_click', { target: 'final_contact' })}
                  className="inline-flex items-center gap-3 rounded-2xl bg-brand px-10 py-5 font-header font-black uppercase tracking-widest text-white shadow-brand transition-all hover:scale-105 hover:bg-brand-light"
                >
                  {t.homePage.ctaButton} <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('home_cta_click', { target: 'final_github' })}
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-white/15 bg-white/5 px-8 py-5 font-header font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:border-brand-light/40"
                >
                  <Terminal className="h-5 w-5" /> {t.homePage.ctaGithub}
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <QuickDocks />
    </div>
  );
}
