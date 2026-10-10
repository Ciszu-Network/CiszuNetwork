'use client';

import Image from 'next/image';
import Link from 'next/link';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  Icon,
  InfoHero,
  InfoLinkGrid,
  InfoAccordion,
  InfoSteps,
  InfoCtaRow,
  ScrollSpy,
  type InfoTheme,
  type InfoLinkGroup,
  type InfoAccordionItem,
  type InfoStepGroup,
} from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import ColorSwatches, { type ColorSwatch } from '@/components/molecules/ColorSwatches';
import IconShowcase from './IconShowcase';
import { CISZU_NETWORK, GITHUB_REPO } from '@/config/site';
import { useDict } from '@/lib/useDict';
import { fillTemplate, type Dict } from '@/lib/i18n';

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

/** Acentos reales de la paleta de la web (`globals.scss`). */
const ACCENTS = {
  brand: {
    text: 'text-brand-light',
    bg: 'bg-brand/10',
    border: 'border-brand/40',
    bar: 'bg-brand-light',
    glow: 'bg-brand/25',
  },
  blue: {
    text: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/40',
    bar: 'bg-neon-blue',
    glow: 'bg-neon-blue/25',
  },
  cyan: {
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/40',
    bar: 'bg-neon-cyan',
    glow: 'bg-neon-cyan/25',
  },
  pink: {
    text: 'text-neon-pink',
    bg: 'bg-neon-pink/10',
    border: 'border-neon-pink/40',
    bar: 'bg-neon-pink',
    glow: 'bg-neon-pink/25',
  },
  purple: {
    text: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/40',
    bar: 'bg-neon-purple',
    glow: 'bg-neon-purple/25',
  },
  green: {
    text: 'text-neon-green',
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/40',
    bar: 'bg-neon-green',
    glow: 'bg-neon-green/25',
  },
} as const;

type AccentKey = keyof typeof ACCENTS;

/** Rutas reales de los logos en el CDN (mismas que usan navbar, footer y home). */
const LOGO_ISOTYPE =
  'projects/ciszu/content/logos/images/outline/isotype/gradient/color/ciszu_logo_isotipo_outline_degradado_zwhite_ccolor.svg';
const LOGO_WORDMARK =
  'projects/ciszu/content/logos/images/outline/logotype/color/ciszu_logotipo_outline_zcolor_cwhite_short.svg';
const LOGO_MASTER =
  'projects/ciszu/content/logos/images/outline/logotype/gradient/color/ciszu_logotipo_outline_zcolor_cwhite_full.svg';
const LOGO_TAGLINE = 'projects/ciszu/content/logos/images/outline/tagline/tagline_white.svg';

/** Tokens reales de `globals.scss` (paleta de marca y neones). */
const brandColorsOf = (t: Dict): ColorSwatch[] => [
  { name: 'Brand', hex: '#233F92', role: t.informationPage.colorRoles[0] },
  { name: 'Brand Light', hex: '#3A6BF0', role: t.informationPage.colorRoles[1] },
  { name: 'Brand Accent', hex: '#4A7DFF', role: t.informationPage.colorRoles[2] },
  { name: 'Brand Dark', hex: '#1A2E6B', role: t.informationPage.colorRoles[3] },
  { name: 'Neon Blue', hex: '#59B4FF', role: t.informationPage.colorRoles[4] },
  { name: 'Neon Cyan', hex: '#68CFFF', role: t.informationPage.colorRoles[5] },
  { name: 'Neon Pink', hex: '#FF33CC', role: t.informationPage.colorRoles[6] },
  { name: 'Neon Purple', hex: '#4800FF', role: t.informationPage.colorRoles[7] },
];

/** Métricas reales del ecosistema (AGENTS.md / documentación). */
const heroStatsOf = (t: Dict) => [
  { value: '4', label: t.informationPage.stats[0].label, sub: t.informationPage.stats[0].sub },
  { value: '7', label: t.informationPage.stats[1].label, sub: t.informationPage.stats[1].sub },
  { value: '62', label: t.informationPage.stats[2].label, sub: t.informationPage.stats[2].sub },
  { value: '100%', label: t.informationPage.stats[3].label, sub: t.informationPage.stats[3].sub },
];

const fileFormatsOf = (t: Dict): Array<{
  ext: string;
  icon: string;
  accent: AccentKey;
  title: string;
  body: string;
}> => [
  {
    ext: '.svg',
    icon: 'star',
    accent: 'brand',
    title: t.informationPage.formats[0].title,
    body: t.informationPage.formats[0].body,
  },
  {
    ext: '.png',
    icon: 'camera',
    accent: 'cyan',
    title: t.informationPage.formats[1].title,
    body: t.informationPage.formats[1].body,
  },
  {
    ext: '.ai',
    icon: 'edit',
    accent: 'pink',
    title: t.informationPage.formats[2].title,
    body: t.informationPage.formats[2].body,
  },
];

const missionVisionOf = (t: Dict): Array<{
  icon: string;
  accent: AccentKey;
  title: string;
  body: string;
}> => [
  {
    icon: 'target',
    accent: 'pink',
    title: t.informationPage.missionVision[0].title,
    body: t.informationPage.missionVision[0].body,
  },
  {
    icon: 'globe',
    accent: 'blue',
    title: t.informationPage.missionVision[1].title,
    body: t.informationPage.missionVision[1].body,
  },
];

const generalGoalsOf = (t: Dict): Array<{ icon: string; title: string; body: string }> => [
  {
    icon: 'globe',
    title: t.informationPage.generalGoals[0].title,
    body: t.informationPage.generalGoals[0].body,
  },
  {
    icon: 'team',
    title: t.informationPage.generalGoals[1].title,
    body: t.informationPage.generalGoals[1].body,
  },
  {
    icon: 'palette',
    title: t.informationPage.generalGoals[2].title,
    body: t.informationPage.generalGoals[2].body,
  },
  {
    icon: 'policies',
    title: t.informationPage.generalGoals[3].title,
    body: t.informationPage.generalGoals[3].body,
  },
];

const specificGoalsOf = (t: Dict): Array<{ icon: string; title: string; body: string }> => [
  {
    icon: 'server',
    title: t.informationPage.specificGoals[0].title,
    body: t.informationPage.specificGoals[0].body,
  },
  {
    icon: 'lock',
    title: t.informationPage.specificGoals[1].title,
    body: t.informationPage.specificGoals[1].body,
  },
  {
    icon: 'rocket',
    title: t.informationPage.specificGoals[2].title,
    body: t.informationPage.specificGoals[2].body,
  },
  {
    icon: 'signal',
    title: t.informationPage.specificGoals[3].title,
    body: t.informationPage.specificGoals[3].body,
  },
];

const ideologyOf = (t: Dict): Array<{ icon: string; accent: AccentKey; title: string; body: string }> => [
  {
    icon: 'globe',
    accent: 'cyan',
    title: t.informationPage.ideology[0].title,
    body: t.informationPage.ideology[0].body,
  },
  {
    icon: 'lock',
    accent: 'purple',
    title: t.informationPage.ideology[1].title,
    body: t.informationPage.ideology[1].body,
  },
  {
    icon: 'star',
    accent: 'pink',
    title: t.informationPage.ideology[2].title,
    body: t.informationPage.ideology[2].body,
  },
  {
    icon: 'heart',
    accent: 'green',
    title: t.informationPage.ideology[3].title,
    body: t.informationPage.ideology[3].body,
  },
];

const philosophyOf = (t: Dict): InfoAccordionItem[] => [
  {
    q: t.informationPage.philosophy[0].q,
    a: t.informationPage.philosophy[0].a,
  },
  {
    q: t.informationPage.philosophy[1].q,
    a: t.informationPage.philosophy[1].a,
  },
  {
    q: t.informationPage.philosophy[2].q,
    a: t.informationPage.philosophy[2].a,
  },
  {
    q: t.informationPage.philosophy[3].q,
    a: t.informationPage.philosophy[3].a,
  },
];

/** Iconos registrados del subset inline de `@ciszu/ui` (selección de muestra). */
const ICON_NAMES = ['home', 'search', 'settings', 'menu', 'user', 'team', 'heart', 'star', 'check', 'download', 'calendar', 'clock', 'info', 'help', 'mail', 'globe', 'lock', 'copy', 'message', 'support', 'policies', 'file-text', 'history', 'chart-bar', 'certificates', 'music', 'rocket', 'shield'];

const iconLibraryOf = (t: Dict): { name: string; label: string }[] =>
  ICON_NAMES.map((name, index) => ({ name, label: t.informationPage.iconLabels[index] }));

/**
 * Stack real declarado en `package.json` de la web + servicios del ecosistema.
 * `brand` apunta a los SVG de marca reales del repo (`shared/icons/svg/**`,
 * servidos por el CDN con fallback local); `icon` es el icono registrado de
 * `@ciszu/ui` que se usa cuando no hay marca disponible.
 */
const techStackOf = (t: Dict): Array<{
  icon: string;
  brand?: string;
  brandStyle?: 'filled' | 'outline';
  role: string;
  accent: AccentKey;
  title: string;
  body: string;
}> => [
  {
    icon: 'rocket',
    brand: 'ri-filled-nextjs',
    brandStyle: 'filled',
    role: t.informationPage.techRoles[0],
    accent: 'brand',
    title: 'Next.js 15',
    body: t.informationPage.techBodies[0],
  },
  {
    icon: 'monitor',
    brand: 'ri-filled-reactjs',
    brandStyle: 'filled',
    role: t.informationPage.techRoles[1],
    accent: 'cyan',
    title: 'React 19',
    body: t.informationPage.techBodies[1],
  },
  {
    icon: 'security',
    brand: 'ri-typescript',
    brandStyle: 'outline',
    role: t.informationPage.techRoles[2],
    accent: 'blue',
    title: 'TypeScript',
    body: t.informationPage.techBodies[2],
  },
  {
    icon: 'palette',
    brand: 'ri-filled-tailwind-css',
    brandStyle: 'filled',
    role: t.informationPage.techRoles[3],
    accent: 'cyan',
    title: 'Tailwind CSS 4',
    body: t.informationPage.techBodies[3],
  },
  {
    icon: 'server',
    brand: 'ri-filled-supabase',
    brandStyle: 'filled',
    role: t.informationPage.techRoles[4],
    accent: 'green',
    title: 'Supabase',
    body: t.informationPage.techBodies[4],
  },
  {
    icon: 'globe',
    role: t.informationPage.techRoles[5],
    accent: 'purple',
    title: 'Vercel',
    body: t.informationPage.techBodies[5],
  },
  {
    icon: 'settings',
    role: t.informationPage.techRoles[6],
    accent: 'pink',
    title: 'Zustand',
    body: t.informationPage.techBodies[6],
  },
  {
    icon: 'chart-bar',
    role: t.informationPage.techRoles[7],
    accent: 'blue',
    title: 'Sentry + PostHog',
    body: t.informationPage.techBodies[7],
  },
];

const groupsOf = (t: Dict): InfoLinkGroup[] => {
  const defs: { href: string; icon: string }[][] = [
    [{ href: '/', icon: 'home' }, { href: '/services', icon: 'star' }, { href: '/projects', icon: 'rocket' }, { href: '/courses', icon: 'certificates' }, { href: '/documentation', icon: 'policies' }, { href: '/downloads', icon: 'download' }],
    [{ href: '/projects', icon: 'rocket' }, { href: '/projects/ciszugamens', icon: 'gamepad' }, { href: '/projects/ciszubot', icon: 'robot' }, { href: '/projects/muzicmania', icon: 'music' }, { href: '/projects/ciszunetwork', icon: 'server' }, { href: '/projects/ciszukoantony', icon: 'star' }],
    [{ href: '/changelog', icon: 'history' }, { href: '/reviews', icon: 'star' }, { href: '/stats', icon: 'signal' }, { href: '/forum', icon: 'comment' }, { href: '/feedback', icon: 'message' }],
    [{ href: '/help', icon: 'help' }, { href: '/faq', icon: 'faq' }, { href: '/support', icon: 'support' }, { href: '/contact', icon: 'mail' }],
    [{ href: '/about', icon: 'info' }, { href: '/team', icon: 'team' }, { href: '/credits', icon: 'file-text' }, { href: '/donate', icon: 'heart' }],
    [{ href: '/guidelines', icon: 'policies' }, { href: '/rules', icon: 'shield' }, { href: '/license', icon: 'certificates' }, { href: '/policy', icon: 'lock' }],
  ];
  return t.informationPage.groupNames.map((name, gi) => ({
    title: name,
    items: t.informationPage.groups[gi].items.map((item, ii) => ({ ...defs[gi][ii], ...item })),
  }));
};

const stepsOf = (t: Dict): InfoStepGroup[] => [
  {
    title: t.informationPage.steps[0].title,
    body: t.informationPage.steps[0].body,
  },
  {
    title: t.informationPage.steps[1].title,
    body: t.informationPage.steps[1].body,
  },
  {
    title: t.informationPage.steps[2].title,
    body: t.informationPage.steps[2].body,
  },
  {
    title: t.informationPage.steps[3].title,
    body: t.informationPage.steps[3].body,
  },
];

const sectionsOf = (t: Dict) => [
  { id: 'hero', label: t.informationPage.navSections[0] },
  { id: 'identidad', label: t.informationPage.navSections[1] },
  { id: 'color', label: t.informationPage.navSections[2] },
  { id: 'formatos', label: t.informationPage.navSections[3] },
  { id: 'proposito', label: t.informationPage.navSections[4] },
  { id: 'objetivos', label: t.informationPage.navSections[5] },
  { id: 'ideologia', label: t.informationPage.navSections[6] },
  { id: 'filosofia', label: t.informationPage.navSections[7] },
  { id: 'libreria', label: t.informationPage.navSections[8] },
  { id: 'tecnologias', label: t.informationPage.navSections[9] },
  { id: 'explora', label: t.informationPage.navSections[10] },
  { id: 'origenes', label: t.informationPage.navSections[11] },
];

function SectionHeading({
  icon,
  title,
  kicker,
  accent,
}: {
  icon: string;
  title: string;
  kicker?: string;
  accent: AccentKey;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="mb-6 flex items-start gap-4">
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 hover:scale-110 ${a.bg} ${a.border} ${a.text}`}
      >
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <h2 className="text-xl font-header font-black uppercase tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        {kicker ? (
          <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.3em] ${a.text} opacity-80`}>
            {kicker}
          </p>
        ) : null}
        <span className={`mt-3 block h-0.5 w-14 rounded-full ${a.bar}`} />
      </div>
    </div>
  );
}

export default function InformationContent() {
  const t = useDict();
  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <ScrollSpy items={sectionsOf(t)} />

      <PageReveal className="relative mx-auto max-w-screen-xl space-y-16">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section id="hero" className="scroll-mt-28">
          <InfoHero
            icon="info"
            title="Information"
            kicker={t.informationPage.heroKicker}
            subtitle={fillTemplate(t.informationPage.subtitle, { site: CISZU_NETWORK.name })}
            theme={THEME}
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {heroStatsOf(t).map((stat) => (
              <div
                key={stat.label}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-brand/5"
              >
                <p className="font-header text-3xl font-black text-brand-light transition-transform duration-300 group-hover:scale-110">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-black uppercase text-white">{stat.label}</p>
                <p className="mt-0.5 text-[10px] font-bold text-white/40">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Identidad visual ─────────────────────────────────────────── */}
        <section id="identidad" className="scroll-mt-28">
          <SectionHeading
            icon="info"
            accent="brand"
            title={t.informationPage.headings.identidad}
            kicker={t.informationPage.kickers.identidad}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 md:p-8">
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0" />
              <div className="relative flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-3 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={assetResolver.resolve(LOGO_ISOTYPE)}
                    alt="Isotipo de Ciszu Network"
                    width={112}
                    height={116}
                    className="object-contain drop-shadow-brand"
                  />
                </div>
                <div className="space-y-3 text-center sm:text-left">
                  <span className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-light">
                    {t.informationPage.identBadge}
                  </span>
                  <h3 className="font-header font-bold text-white text-lg">{t.informationPage.identTitle}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {t.informationPage.identBody}
                  </p>
                  <ul className="space-y-1 text-left">
                    <li className="text-[11px] text-white/40">
                      {t.informationPage.identBullet1}
                    </li>
                    <li className="text-[11px] text-white/40">
                      {t.informationPage.identBullet2}
                    </li>
                  </ul>
                </div>
              </div>
            </article>

            <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan/40 md:p-8">
              <div className="relative flex flex-col items-center gap-6">
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/30 p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src={assetResolver.resolve(LOGO_WORDMARK)}
                    alt="Logotipo de Ciszu Network"
                    width={356}
                    height={108}
                    className="w-full h-auto"
                  />
                </div>
                <div className="space-y-3 text-center">
                  <span className="inline-flex rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-neon-cyan">
                    {t.informationPage.wordBadge}
                  </span>
                  <h3 className="font-header font-bold text-white text-lg">{t.informationPage.wordTitle}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {t.informationPage.wordBody}
                  </p>
                </div>
              </div>
            </article>
          </div>

          <article className="group relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-brand/40 md:p-10">
            <span className="pointer-events-none absolute right-6 top-4 select-none font-header text-6xl font-black uppercase tracking-tighter text-white/5 md:text-8xl">
              Brand
            </span>
            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
              <div className="w-full max-w-md shrink-0 rounded-2xl border border-white/10 bg-black/30 p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src={assetResolver.resolve(LOGO_MASTER)}
                  alt="Composición maestra de Ciszu Network: isotipo y logotipo"
                  width={342}
                  height={183}
                  className="w-full h-auto drop-shadow-brand"
                />
              </div>
              <div className="space-y-4 text-center lg:text-left">
                <h3 className="font-header font-bold text-white text-lg">{t.informationPage.masterTitle}</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {t.informationPage.masterBody}
                </p>
                <div className="flex justify-center lg:justify-start">
                  <Image
                    src={assetResolver.resolve(LOGO_TAGLINE) + '?v=2'}
                    alt={CISZU_NETWORK.tagline}
                    width={285}
                    height={22}
                    className="h-auto opacity-90"
                  />
                </div>
                <ul className="space-y-1">
                  <li className="text-[11px] text-white/40">
                    {t.informationPage.masterBullet1}
                  </li>
                  <li className="text-[11px] text-white/40">
                    {t.informationPage.masterBullet2}
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </section>

        {/* ── Colorología ──────────────────────────────────────────────── */}
        <section id="color" className="scroll-mt-28">
          <SectionHeading
            icon="palette"
            accent="pink"
            title={t.informationPage.headings.color}
            kicker={t.informationPage.kickers.color}
          />
          <ColorSwatches colors={brandColorsOf(t)} />
          <p className="mt-5 text-xs text-white/40 leading-relaxed max-w-3xl">
            {t.informationPage.colorIntro}
          </p>
        </section>

        {/* ── Formatos de archivo ─────────────────────────────────────── */}
        <section id="formatos" className="scroll-mt-28">
          <SectionHeading
            icon="file-text"
            accent="green"
            title={t.informationPage.headings.formatos}
            kicker={t.informationPage.kickers.formatos}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {fileFormatsOf(t).map((format) => {
              const a = ACCENTS[format.accent];
              return (
                <article
                  key={format.ext}
                  className={`group rounded-2xl border bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] ${a.border}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${a.bg} ${a.border} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon name={format.icon} size={20} />
                    </span>
                    <code
                      className={`rounded-lg border px-2.5 py-1 text-xs font-black tracking-wider ${a.bg} ${a.border} ${a.text}`}
                    >
                      {format.ext}
                    </code>
                  </div>
                  <h3 className="mt-4 font-header font-bold text-white">{format.title}</h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{format.body}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-white/40 leading-relaxed max-w-3xl">
            {t.informationPage.formatsNote}
          </p>
        </section>

        {/* ── Misión y visión ─────────────────────────────────────────── */}
        <section id="proposito" className="scroll-mt-28">
          <SectionHeading icon="target" accent="cyan" title={t.informationPage.headings.proposito} kicker={t.informationPage.kickers.proposito} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {missionVisionOf(t).map((item) => {
              const a = ACCENTS[item.accent];
              return (
                <article
                  key={item.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/5 p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] ${a.border}`}
                >
                  <span
                    className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl ${a.glow}`}
                  />
                  <div className="relative flex items-center gap-3">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${a.bg} ${a.border} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon name={item.icon} size={22} />
                    </span>
                    <h3 className={`font-header text-lg font-black uppercase ${a.text}`}>{item.title}</h3>
                  </div>
                  <p className="relative mt-4 text-sm leading-relaxed text-white/60">{item.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Objetivos ───────────────────────────────────────────────── */}
        <section id="objetivos" className="scroll-mt-28 space-y-8">
          <SectionHeading icon="chart-bar" accent="blue" title={t.informationPage.headings.objetivos} kicker={t.informationPage.kickers.objetivos} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-neon-blue/25 bg-white/5 p-7">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-blue/30 bg-neon-blue/10 text-neon-blue">
                  <Icon name="target" size={20} />
                </span>
                <div>
                  <h3 className="font-header text-lg font-black uppercase text-neon-blue">
                    {t.informationPage.goalsGenTitle}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    {t.informationPage.goalsGenSub}
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {generalGoalsOf(t).map((goal, index) => (
                  <li
                    key={goal.title}
                    className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neon-blue/30 bg-neon-blue/10 text-[10px] font-black text-neon-blue transition-transform duration-300 group-hover:scale-110">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-black uppercase text-white">{goal.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/60">{goal.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-neon-cyan/25 bg-white/5 p-7">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
                  <Icon name="settings" size={20} />
                </span>
                <div>
                  <h3 className="font-header text-lg font-black uppercase text-neon-cyan">
                    {t.informationPage.goalsSpecTitle}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    {t.informationPage.goalsSpecSub}
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {specificGoalsOf(t).map((goal, index) => (
                  <li
                    key={goal.title}
                    className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <code className="mt-0.5 shrink-0 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-1.5 py-0.5 text-[9px] font-black text-neon-cyan transition-transform duration-300 group-hover:scale-110">
                      {String(index + 1).padStart(2, '0')}
                    </code>
                    <div>
                      <p className="text-xs font-black uppercase text-white">{goal.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/60">{goal.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Ideología ───────────────────────────────────────────────── */}
        <section id="ideologia" className="scroll-mt-28">
          <SectionHeading icon="heart" accent="purple" title={t.informationPage.headings.ideologia} kicker={t.informationPage.kickers.ideologia} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ideologyOf(t).map((pillar) => {
              const a = ACCENTS[pillar.accent];
              return (
                <article
                  key={pillar.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] ${a.border}`}
                >
                  <span
                    className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                  />
                  <span
                    className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${a.bg} ${a.border} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon name={pillar.icon} size={24} />
                  </span>
                  <h3 className={`relative mt-4 font-header font-black uppercase ${a.text}`}>
                    {pillar.title}
                  </h3>
                  <p className="relative mt-2 text-xs leading-relaxed text-white/60">{pillar.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Filosofía ───────────────────────────────────────────────── */}
        <section id="filosofia" className="scroll-mt-28">
          <SectionHeading icon="moon" accent="cyan" title={t.informationPage.headings.filosofia} kicker={t.informationPage.kickers.filosofia} />
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                  {fillTemplate(t.informationPage.taglineKicker, { site: CISZU_NETWORK.name })}
                </p>
                <blockquote
                  className={`bg-gradient-to-r bg-clip-text font-header text-2xl font-black uppercase leading-tight text-transparent md:text-4xl ${THEME.gradient}`}
                >
                  Bright Future Promised
                </blockquote>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60">
                  {t.informationPage.philosophyBody}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {['DRY', 'KISS', 'SOLID'].map((principle, index) => (
                  <span
                    key={principle}
                    className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-transform duration-300 hover:scale-110 ${
                      index === 0
                        ? 'border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan'
                        : index === 1
                          ? 'border-neon-pink/30 bg-neon-pink/10 text-neon-pink'
                          : 'border-neon-purple/30 bg-neon-purple/10 text-neon-purple'
                    }`}
                  >
                    {principle}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <InfoAccordion items={philosophyOf(t)} theme={THEME} />
        </section>

        {/* ── Librería de iconos ──────────────────────────────────────── */}
        <section id="libreria" className="scroll-mt-28">
          <SectionHeading
            icon="star"
            accent="brand"
            title={t.informationPage.headings.libreria}
            kicker={fillTemplate(t.informationPage.iconsKicker, { n: String(iconLibraryOf(t).length) })}
          />
          <IconShowcase
            icons={iconLibraryOf(t)}
            accent={ACCENTS.brand.text}
            accentBg={ACCENTS.brand.bg}
            accentBorder={ACCENTS.brand.border}
            glow={ACCENTS.brand.glow}
          />
        </section>

        {/* ── Ecosistema tecnológico ──────────────────────────────────── */}
        <section id="tecnologias" className="scroll-mt-28">
          <SectionHeading
            icon="server"
            accent="blue"
            title={t.informationPage.headings.tecnologias}
            kicker={t.informationPage.kickers.tecnologias}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {techStackOf(t).map((tech) => {
              const a = ACCENTS[tech.accent];
              return (
                <article
                  key={tech.title}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.07] ${a.border}`}
                >
                  <span
                    className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1020] shadow-inner transition-transform duration-300 group-hover:scale-110">
                      {tech.brand ? (
                        <Icon
                          name={tech.brand}
                          style={tech.brandStyle}
                          size={30}
                          className="invert"
                        />
                      ) : (
                        <Icon name={tech.icon} size={26} className={a.text} />
                      )}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${a.bg} ${a.border} ${a.text}`}
                    >
                      {tech.role}
                    </span>
                  </div>
                  <h3 className="relative mt-5 font-header font-bold text-white">{tech.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/60">{tech.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Explora el proyecto ─────────────────────────────────────── */}
        <section id="explora" className="scroll-mt-28">
          <SectionHeading icon="globe" accent="cyan" title={t.informationPage.headings.explora} kicker={t.informationPage.kickers.explora} />
          <InfoLinkGrid groups={groupsOf(t)} theme={THEME} />
        </section>

        {/* ── Orígenes & arquitectura ─────────────────────────────────── */}
        <section id="origenes" className="scroll-mt-28">
          <SectionHeading
            icon="server"
            accent="brand"
            title={t.informationPage.headings.origenes}
            kicker={t.informationPage.kickers.origenes}
          />
          <InfoSteps steps={stepsOf(t)} theme={THEME} />

          <Link
            href="/team"
            className={`mt-6 flex flex-col items-center gap-5 rounded-2xl border p-6 transition-all duration-300 group hover:-translate-y-1 ${THEME.border} ${THEME.card} hover:border-brand/40`}
          >
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${THEME.accentBg} ${THEME.accent}`}
            >
              <Icon name="team" size={24} />
            </span>
            <span className="flex-1 text-center sm:text-left">
              <span className="block font-header font-bold text-white mb-1">{t.informationPage.originsTitle}</span>
              <span className="block text-sm text-white/60 leading-relaxed">
                {fillTemplate(t.informationPage.originsBody, { site: CISZU_NETWORK.name })}
              </span>
            </span>
            <span className={`text-sm font-bold shrink-0 ${THEME.accent} group-hover:underline`}>
              {t.informationPage.originsCta}
            </span>
          </Link>
        </section>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: t.informationPage.ctaProjects, href: '/projects', icon: 'rocket' },
            { label: t.informationPage.ctaTeam, href: '/team', icon: 'team', variant: 'ghost' },
            { label: t.informationPage.ctaRepo, href: GITHUB_REPO, icon: 'external', external: true, variant: 'ghost' },
          ]}
        />
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
