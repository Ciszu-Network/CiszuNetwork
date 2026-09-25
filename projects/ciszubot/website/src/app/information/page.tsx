import type { Metadata } from 'next';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  Icon,
  InfoHero,
  InfoLinkGrid,
  InfoCardGrid,
  InfoCtaRow,
  ScrollSpy,
  type InfoLinkGroup,
  type InfoCardItem,
} from '@ciszu/ui';
import { getDict, parseLang, DISCORD_SERVER, BOT_PREFIX } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { INFO_THEME as THEME } from '@/components/layout/pageTheme';
import BrandSwatches from './BrandSwatches';
import IconShowcase from './IconShowcase';
import {
  HERO,
  SECTION_TITLES,
  IDENTITY,
  PALETTE,
  PALETTE_LABELS,
  FILE_FORMATS,
  MISSION,
  VISION,
  OBJECTIVES,
  IDEOLOGY,
  PHILOSOPHY,
  ICON_LIBRARY,
  TECH_STACK,
  ORIGINS,
  LINK_GROUPS,
  CTA,
  PAGE_META,
  type AccentKey,
  type Note,
} from './content';

export const metadata: Metadata = PAGE_META;

const ACCENTS: Record<
  AccentKey,
  { text: string; bg: string; border: string; bar: string; glow: string }
> = {
  blue: {
    text: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/30',
    bar: 'bg-neon-blue',
    glow: 'bg-neon-blue/20',
  },
  cyan: {
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    bar: 'bg-neon-cyan',
    glow: 'bg-neon-cyan/20',
  },
  purple: {
    text: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/30',
    bar: 'bg-neon-purple',
    glow: 'bg-neon-purple/20',
  },
  pink: {
    text: 'text-neon-pink',
    bg: 'bg-neon-pink/10',
    border: 'border-neon-pink/30',
    bar: 'bg-neon-pink',
    glow: 'bg-neon-pink/20',
  },
};

const SECTIONS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'identidad', label: 'Identidad' },
  { id: 'color', label: 'Colorología' },
  { id: 'formatos', label: 'Formatos' },
  { id: 'mision', label: 'Misión' },
  { id: 'vision', label: 'Visión' },
  { id: 'objetivos', label: 'Objetivos' },
  { id: 'ideologia', label: 'Ideología' },
  { id: 'filosofia', label: 'Filosofía' },
  { id: 'libreria', label: 'Iconos' },
  { id: 'tecnologias', label: 'Tecnologías' },
  { id: 'explora', label: 'Explora' },
  { id: 'origenes', label: 'Orígenes' },
];

const HERO_STATS = [
  { value: '72', label: 'Comandos', sub: '9 categorías' },
  { value: BOT_PREFIX, label: 'Prefijo', sub: 'Slash incluidos' },
  { value: '60s', label: 'Heartbeat', sub: 'Estado en vivo' },
  { value: '100%', label: 'Gratis', sub: 'Sin pay-to-win' },
];

function SectionHeading({
  icon,
  title,
  accent,
  kicker,
}: {
  icon: string;
  title: string;
  accent: AccentKey;
  kicker?: string;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="mb-8 flex items-start gap-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 hover:scale-110 ${a.bg} ${a.border} ${a.text}`}
      >
        <Icon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <h2 className="font-header text-lg font-black uppercase tracking-widest text-ink md:text-xl">
          {title}
        </h2>
        {kicker ? (
          <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.25em] opacity-80 ${a.text}`}>
            {kicker}
          </p>
        ) : null}
        <span className={`mt-3 block h-0.5 w-14 rounded-full ${a.bar}`} />
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  const a = ACCENTS[note.accent];
  return (
    <div
      className={`rounded-2xl border border-border border-l-4 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 ${a.border}`}
    >
      <p className={`mb-1 text-[10px] font-black uppercase tracking-widest ${a.text}`}>{note.title}</p>
      <p className="text-xs font-bold leading-relaxed text-white/60">{note.body}</p>
    </div>
  );
}

export default async function InformationPage() {
  const store = await cookies();
  const lang = parseLang(store.get('ciszubot_lang')?.value);
  const dict = getDict(lang);

  const groups: InfoLinkGroup[] = LINK_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      name: dict.nav[item.navKey],
      href: item.href,
      icon: item.icon,
      desc: item.body,
    })),
  }));

  const originsCards: InfoCardItem[] = ORIGINS.cards.map((card) => ({
    icon: card.icon,
    title: card.title,
    body: card.body,
  }));

  return (
    <div className="relative min-h-screen px-4 pt-24 pb-20">
      <PageAmbience />
      <ScrollSpy items={SECTIONS} />

      <div className="mx-auto max-w-screen-xl">
        <PageReveal>
          <section id="hero" className="scroll-mt-28">
            <InfoHero
              icon="info"
              title={dict.nav.information}
              subtitle={HERO.subtitle}
              kicker={HERO.kicker}
              theme={THEME}
            />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="group rounded-3xl border border-border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40"
                >
                  <p className="font-header text-3xl font-black text-neon-blue transition-transform duration-300 group-hover:scale-110">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase text-ink">{stat.label}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-faint">{stat.sub}</p>
                </div>
              ))}
            </div>
          </section>
        </PageReveal>

        <div className="space-y-20">
          {/* ── Identidad Visual ─────────────────────────────── */}
          <section id="identidad" className="scroll-mt-28">
            <SectionHeading
              icon="id-card"
              title={IDENTITY.title}
              accent="purple"
              kicker="Isotipo · Logotipo · Composición"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-neon-purple/40 sm:flex-row sm:items-start">
                <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-neon-purple/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <Image
                  src={assetResolver.resolve(IDENTITY.isotype.src)}
                  alt={IDENTITY.isotype.alt}
                  width={128}
                  height={128}
                  className="h-28 w-28 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="relative flex-1 space-y-4 text-center sm:text-left">
                  <h3 className="font-header text-xl font-black uppercase text-ink">
                    {IDENTITY.isotype.title}
                  </h3>
                  <div className="space-y-3">
                    {IDENTITY.isotype.notes.map((note) => (
                      <NoteCard key={note.title} note={note} />
                    ))}
                  </div>
                </div>
              </article>

              <article className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40">
                <span className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-neon-blue/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="w-full rounded-2xl border border-border bg-white/5 p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src={assetResolver.resolve(IDENTITY.logotype.src)}
                    alt={IDENTITY.logotype.alt}
                    width={280}
                    height={72}
                    className="mx-auto h-16 w-auto max-w-[260px] object-contain"
                  />
                </div>
                <div className="relative w-full space-y-4">
                  <h3 className="text-center font-header text-xl font-black uppercase text-ink">
                    {IDENTITY.logotype.title}
                  </h3>
                  <div className="space-y-3">
                    {IDENTITY.logotype.notes.map((note) => (
                      <NoteCard key={note.title} note={note} />
                    ))}
                  </div>
                </div>
              </article>
            </div>

            <article className="group relative mt-6 overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:border-neon-cyan/40 md:p-10">
              <span className="pointer-events-none absolute right-6 top-4 select-none font-header text-6xl font-black uppercase tracking-tighter text-ink/5 md:text-8xl">
                Bot
              </span>
              <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white/5 p-5 transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src={assetResolver.resolve(IDENTITY.composition.src)}
                    alt={IDENTITY.composition.alt}
                    width={520}
                    height={140}
                    className="mx-auto h-auto w-full max-w-md object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-header text-2xl font-black uppercase text-ink">
                    {IDENTITY.composition.title}
                  </h3>
                  <p className="text-sm font-bold leading-relaxed text-white/60">
                    {IDENTITY.composition.body}
                  </p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {IDENTITY.composition.principles.map((principle) => {
                  const a = ACCENTS[principle.accent];
                  return (
                    <div
                      key={principle.title}
                      className={`group/card rounded-2xl border ${a.border} bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.bg} ${a.text} transition-transform duration-300 group-hover/card:scale-110`}
                      >
                        <Icon name="check" size={16} />
                      </span>
                      <h4 className="mt-3 font-header text-sm font-black uppercase text-ink">
                        {principle.title}
                      </h4>
                      <p className="mt-1 text-[11px] font-bold leading-relaxed text-white/60">
                        {principle.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          {/* ── Colorología ──────────────────────────────────── */}
          <section id="color" className="scroll-mt-28">
            <SectionHeading
              icon="palette"
              title={SECTION_TITLES.colorology}
              accent="cyan"
              kicker="Toca un valor para copiarlo"
            />
            <BrandSwatches groups={PALETTE} labels={PALETTE_LABELS} />
          </section>

          {/* ── Formatos de archivo ──────────────────────────── */}
          <section id="formatos" className="scroll-mt-28">
            <SectionHeading
              icon="file-text"
              title={SECTION_TITLES.formats}
              accent="pink"
              kicker="Entrega y fuente de los assets de marca"
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {FILE_FORMATS.map((category) => {
                const a = ACCENTS[category.accent];
                return (
                  <div
                    key={category.category}
                    className={`group rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/5 ${a.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bg} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon name={category.icon} size={18} />
                      </span>
                      <h3 className="font-header font-bold text-ink">{category.category}</h3>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.formats.map((format) => (
                        <code
                          key={format}
                          className={`rounded-lg border px-2 py-0.5 text-[10px] font-black transition-transform duration-300 hover:scale-105 ${a.border} ${a.bg} ${a.text}`}
                        >
                          {format}
                        </code>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-bold leading-relaxed text-white/60">
                      {category.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Misión ───────────────────────────────────────── */}
          <section id="mision" className="scroll-mt-28">
            <SectionHeading icon="target" title={MISSION.title} accent="pink" kicker="Declaración central" />
            <div className="relative overflow-hidden rounded-3xl border border-neon-pink/30 bg-card p-8 md:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neon-pink/10 blur-3xl" />
              <div className="relative space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-pink">
                  {MISSION.label}
                </p>
                <blockquote className="font-header text-xl font-black uppercase leading-snug text-ink md:text-2xl">
                  {MISSION.quote}
                </blockquote>
                <div className="grid grid-cols-2 gap-6 border-t border-border pt-6 lg:grid-cols-4">
                  {MISSION.stats.map((stat) => (
                    <div key={stat.label} className="group text-center">
                      <p className="font-header text-3xl font-black text-neon-pink transition-transform duration-300 group-hover:scale-110">
                        {stat.value}
                      </p>
                      <p className="text-xs font-black uppercase text-ink">{stat.label}</p>
                      <p className="text-[10px] font-bold text-faint">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Visión ───────────────────────────────────────── */}
          <section id="vision" className="scroll-mt-28">
            <SectionHeading icon="eye" title={VISION.title} accent="blue" kicker="Fases del proyecto" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {VISION.phases.map((phase) => {
                const a = ACCENTS[phase.accent];
                return (
                  <div
                    key={phase.period}
                    className={`group relative overflow-hidden rounded-3xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/5 ${a.border}`}
                  >
                    <span
                      className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                    />
                    <p
                      className={`relative font-header text-4xl font-black ${a.text} transition-transform duration-300 group-hover:scale-110`}
                    >
                      {phase.period}
                    </p>
                    <p className="relative mt-1 text-xs font-black uppercase tracking-widest text-ink">
                      {phase.label}
                    </p>
                    <ul className="relative mt-5 space-y-2">
                      {phase.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs font-bold leading-relaxed text-white/60"
                        >
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.bar}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Objetivos ────────────────────────────────────── */}
          <section id="objetivos" className="scroll-mt-28">
            <SectionHeading
              icon="chart-bar"
              title={OBJECTIVES.title}
              accent="cyan"
              kicker="Macro estrategia · Micro táctica"
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-neon-blue/30 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-blue/10 text-neon-blue transition-transform duration-300 hover:scale-110">
                    <Icon name="target" size={20} />
                  </span>
                  <div>
                    <h3 className="font-header text-lg font-black uppercase text-neon-blue">
                      {OBJECTIVES.general.title}
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-faint">
                      {OBJECTIVES.general.label}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-4">
                  {OBJECTIVES.general.items.map((item, index) => (
                    <li
                      key={item}
                      className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-blue/10 text-[10px] font-black text-neon-blue transition-transform duration-300 group-hover:scale-110">
                        {index + 1}
                      </span>
                      <p className="text-xs font-bold leading-relaxed text-white/60">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-neon-cyan/30 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-cyan/10 text-neon-cyan transition-transform duration-300 hover:scale-110">
                    <Icon name="settings" size={20} />
                  </span>
                  <div>
                    <h3 className="font-header text-lg font-black uppercase text-neon-cyan">
                      {OBJECTIVES.specific.title}
                    </h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-faint">
                      {OBJECTIVES.specific.label}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 space-y-4">
                  {OBJECTIVES.specific.items.map((item, index) => (
                    <li
                      key={item}
                      className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                    >
                      <code className="mt-0.5 shrink-0 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-1.5 py-0.5 text-[9px] font-black text-neon-cyan transition-transform duration-300 group-hover:scale-110">
                        {String(index + 1).padStart(2, '0')}
                      </code>
                      <p className="text-xs font-bold leading-relaxed text-white/60">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── Ideología ────────────────────────────────────── */}
          <section id="ideologia" className="scroll-mt-28">
            <SectionHeading icon="favorite" title={IDEOLOGY.title} accent="purple" kicker="Los cuatro pilares" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {IDEOLOGY.pillars.map((pillar) => {
                const a = ACCENTS[pillar.accent];
                return (
                  <div
                    key={pillar.title}
                    className={`group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/5 ${a.border}`}
                  >
                    <span
                      className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                    />
                    <span
                      className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${a.bg} ${a.text} transition-transform duration-300 group-hover:scale-110`}
                    >
                      <Icon name={pillar.icon} size={22} />
                    </span>
                    <h3 className="relative mt-4 font-header font-black uppercase text-ink">
                      {pillar.title}
                    </h3>
                    <p className="relative mt-2 text-xs font-bold leading-relaxed text-white/60">
                      {pillar.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Filosofía ────────────────────────────────────── */}
          <section id="filosofia" className="scroll-mt-28">
            <SectionHeading icon="moon" title={PHILOSOPHY.title} accent="cyan" kicker={PHILOSOPHY.kicker} />
            <div className="rounded-3xl border border-border bg-card p-8 md:p-12">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <div className="space-y-3 lg:border-r lg:border-border lg:pr-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-cyan">
                    {PHILOSOPHY.kicker}
                  </p>
                  <h3 className="font-header text-2xl font-black uppercase leading-tight text-ink">
                    {PHILOSOPHY.headline}
                  </h3>
                  <p className="text-sm font-bold leading-relaxed text-white/60">
                    {PHILOSOPHY.intro}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
                  {PHILOSOPHY.cards.map((card) => {
                    const a = ACCENTS[card.accent];
                    return (
                      <div
                        key={card.label}
                        className={`rounded-2xl border border-border border-t-4 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 ${a.border}`}
                      >
                        <h4 className={`text-xs font-black uppercase tracking-widest ${a.text}`}>
                          {card.label}
                        </h4>
                        <p className="mt-2 text-[11px] font-bold italic leading-relaxed text-white/60">
                          {card.quote}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── Librería de iconos ───────────────────────────── */}
          <section id="libreria" className="scroll-mt-28">
            <SectionHeading
              icon="star"
              title={ICON_LIBRARY.title}
              accent="pink"
              kicker={ICON_LIBRARY.subtitle}
            />
            <IconShowcase
              icons={ICON_LIBRARY.icons}
              accent={ACCENTS.blue.text}
              accentBg={ACCENTS.blue.bg}
              accentBorder={ACCENTS.blue.border}
              copyLabel="Copiar nombre"
              copiedLabel="Copiado"
            />
          </section>

          {/* ── Ecosistema tecnológico ───────────────────────── */}
          <section id="tecnologias" className="scroll-mt-28">
            <SectionHeading
              icon="server"
              title={TECH_STACK.title}
              accent="blue"
              kicker={TECH_STACK.subtitle}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TECH_STACK.items.map((tech) => {
                const a = ACCENTS[tech.accent];
                return (
                  <a
                    key={tech.name}
                    href={tech.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/5 ${a.border}`}
                  >
                    <span
                      className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                    />
                    <div className="relative flex items-start justify-between gap-3">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-[#0b1020] shadow-inner transition-transform duration-300 group-hover:scale-110">
                        {tech.brand ? (
                          <Icon
                            name={tech.brand.name}
                            style={tech.brand.style}
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
                    <h3 className="relative mt-4 font-header text-lg font-black text-ink">
                      {tech.name}
                    </h3>
                    <p className={`relative text-[10px] font-black uppercase tracking-widest ${a.text}`}>
                      {tech.role}
                    </p>
                    <p className="relative mt-3 border-t border-border pt-3 text-[11px] font-bold leading-relaxed text-white/60">
                      {tech.detail}
                    </p>
                    <span className="relative mt-auto flex items-center gap-2 pt-4 text-[10px] font-black uppercase tracking-widest text-faint transition-colors group-hover:text-ink">
                      Documentación oficial
                      <Icon name="arrow-right" size={12} />
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* ── Explora el proyecto ──────────────────────────── */}
          <section id="explora" className="scroll-mt-28">
            <SectionHeading
              icon="globe"
              title={SECTION_TITLES.explore}
              accent="purple"
              kicker="Todas las secciones del sitio"
            />
            <InfoLinkGrid groups={groups} theme={THEME} />
          </section>

          {/* ── Orígenes & Arquitectura ──────────────────────── */}
          <section id="origenes" className="scroll-mt-28">
            <SectionHeading
              icon="rocket"
              title={ORIGINS.title}
              accent="pink"
              kicker={ORIGINS.subtitle}
            />
            <InfoCardGrid items={originsCards} theme={THEME} columns={4} />
          </section>
        </div>

        <InfoCtaRow
          theme={THEME}
          actions={[
            { label: CTA.invite, href: CTA.inviteHref, icon: 'discord', external: true },
            { label: dict.nav.commands, href: '/commands', icon: 'gamepad' },
            { label: dict.nav.documentation, href: '/documentation', icon: 'policies', variant: 'ghost' },
            { label: dict.nav.support, href: DISCORD_SERVER, icon: 'life-ring', external: true, variant: 'ghost' },
          ]}
        />
      </div>

      <QuickDocks />
    </div>
  );
}
