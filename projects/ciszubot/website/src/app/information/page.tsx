import type { Metadata } from 'next';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { assetResolver } from '@ciszunetwork/cdn';
import {
  Icon,
  InfoHero,
  InfoCardGrid,
  InfoLinkGrid,
  InfoCtaRow,
  type InfoLinkGroup,
  type InfoCardItem,
  type InfoTheme,
} from '@ciszu/ui';
import { getDict, parseLang, DISCORD_SERVER } from '@/lib/i18n';
import QuickDocks from '@/components/molecules/QuickDocks';
import BrandSwatches from './BrandSwatches';
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

const THEME: InfoTheme = {
  accent: 'text-neon-blue',
  accentBg: 'bg-neon-blue/10',
  accentBorder: 'border-neon-blue/40',
  card: 'bg-card',
  border: 'border-border',
  gradient: 'from-neon-blue to-neon-purple',
};

const ACCENTS: Record<
  AccentKey,
  { text: string; bg: string; border: string; bar: string }
> = {
  blue: {
    text: 'text-neon-blue',
    bg: 'bg-neon-blue/10',
    border: 'border-neon-blue/30',
    bar: 'bg-neon-blue',
  },
  cyan: {
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    bar: 'bg-neon-cyan',
  },
  purple: {
    text: 'text-neon-purple',
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/30',
    bar: 'bg-neon-purple',
  },
  pink: {
    text: 'text-neon-pink',
    bg: 'bg-neon-pink/10',
    border: 'border-neon-pink/30',
    bar: 'bg-neon-pink',
  },
};

function SectionHeading({
  icon,
  title,
  accent,
}: {
  icon: string;
  title: string;
  accent: AccentKey;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${a.bg} ${a.text}`}>
        <Icon name={icon} size={20} />
      </span>
      <h2 className="font-header text-lg font-black uppercase tracking-widest text-ink md:text-xl">
        {title}
      </h2>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  const a = ACCENTS[note.accent];
  return (
    <div className={`rounded-2xl border border-border border-l-4 bg-white/5 p-4 ${a.border}`}>
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
    <div className="min-h-screen bg-bg px-4 py-20">
      <div className="mx-auto max-w-screen-xl">
        <InfoHero
          icon="info"
          title={dict.nav.information}
          subtitle={HERO.subtitle}
          kicker={HERO.kicker}
          theme={THEME}
        />

        <div className="space-y-20">
          {/* ── Identidad Visual ─────────────────────────────── */}
          <section>
            <SectionHeading icon="id-card" title={IDENTITY.title} accent="purple" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <article className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 sm:flex-row sm:items-start">
                <Image
                  src={assetResolver.resolve(IDENTITY.isotype.src)}
                  alt={IDENTITY.isotype.alt}
                  width={128}
                  height={128}
                  className="h-28 w-28 shrink-0 object-contain"
                />
                <div className="flex-1 space-y-4 text-center sm:text-left">
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

              <article className="flex flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8">
                <Image
                  src={assetResolver.resolve(IDENTITY.logotype.src)}
                  alt={IDENTITY.logotype.alt}
                  width={280}
                  height={72}
                  className="h-16 w-auto max-w-[260px] object-contain"
                />
                <div className="w-full space-y-4">
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

            <article className="mt-6 rounded-3xl border border-border bg-card p-8 md:p-10">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <Image
                  src={assetResolver.resolve(IDENTITY.composition.src)}
                  alt={IDENTITY.composition.alt}
                  width={520}
                  height={140}
                  className="mx-auto h-auto w-full max-w-md object-contain"
                />
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
                      className={`rounded-2xl border ${a.border} bg-white/5 p-5`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.bg} ${a.text}`}>
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

            {/* Colorología */}
            <div className="mt-10">
              <SectionHeading icon="palette" title={SECTION_TITLES.colorology} accent="cyan" />
              <BrandSwatches groups={PALETTE} labels={PALETTE_LABELS} />
            </div>

            {/* Formatos de archivo */}
            <div className="mt-10">
              <SectionHeading icon="file-text" title={SECTION_TITLES.formats} accent="pink" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {FILE_FORMATS.map((category) => {
                  const a = ACCENTS[category.accent];
                  return (
                    <div key={category.category} className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bg} ${a.text}`}>
                          <Icon name={category.icon} size={18} />
                        </span>
                        <h3 className="font-header font-bold text-ink">{category.category}</h3>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {category.formats.map((format) => (
                          <code
                            key={format}
                            className={`rounded-lg border px-2 py-0.5 text-[10px] font-black ${a.border} ${a.bg} ${a.text}`}
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
            </div>
          </section>

          {/* ── Misión ───────────────────────────────────────── */}
          <section>
            <SectionHeading icon="target" title={MISSION.title} accent="pink" />
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
                    <div key={stat.label} className="text-center">
                      <p className="font-header text-3xl font-black text-neon-pink">{stat.value}</p>
                      <p className="text-xs font-black uppercase text-ink">{stat.label}</p>
                      <p className="text-[10px] font-bold text-faint">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Visión ───────────────────────────────────────── */}
          <section>
            <SectionHeading icon="eye" title={VISION.title} accent="blue" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {VISION.phases.map((phase) => {
                const a = ACCENTS[phase.accent];
                return (
                  <div key={phase.period} className={`rounded-3xl border ${a.border} bg-card p-8`}>
                    <p className={`font-header text-4xl font-black ${a.text}`}>{phase.period}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-widest text-ink">
                      {phase.label}
                    </p>
                    <ul className="mt-5 space-y-2">
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
          <section>
            <SectionHeading icon="chart-bar" title={OBJECTIVES.title} accent="cyan" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-neon-blue/30 bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-blue/10 text-neon-blue">
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
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-blue/10 text-[10px] font-black text-neon-blue">
                        {index + 1}
                      </span>
                      <p className="text-xs font-bold leading-relaxed text-white/60">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-neon-cyan/30 bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-cyan/10 text-neon-cyan">
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
                    <li key={item} className="flex items-start gap-3">
                      <code className="mt-0.5 shrink-0 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-1.5 py-0.5 text-[9px] font-black text-neon-cyan">
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
          <section>
            <SectionHeading icon="favorite" title={IDEOLOGY.title} accent="purple" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {IDEOLOGY.pillars.map((pillar) => {
                const a = ACCENTS[pillar.accent];
                return (
                  <div key={pillar.title} className={`rounded-2xl border ${a.border} bg-card p-6`}>
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.bg} ${a.text}`}>
                      <Icon name={pillar.icon} size={22} />
                    </span>
                    <h3 className="mt-4 font-header font-black uppercase text-ink">{pillar.title}</h3>
                    <p className="mt-2 text-xs font-bold leading-relaxed text-white/60">
                      {pillar.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Filosofía ────────────────────────────────────── */}
          <section>
            <SectionHeading icon="moon" title={PHILOSOPHY.title} accent="cyan" />
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
                        className={`rounded-2xl border border-border border-t-4 bg-white/5 p-5 ${a.border}`}
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
          <section>
            <SectionHeading icon="star" title={ICON_LIBRARY.title} accent="pink" />
            <p className="-mt-4 mb-6 text-xs font-bold uppercase tracking-widest text-faint">
              {ICON_LIBRARY.subtitle}
            </p>
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {ICON_LIBRARY.icons.map((icon) => (
                  <div
                    key={icon.name}
                    className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40"
                  >
                    <span className="text-neon-blue transition-transform duration-300 group-hover:scale-110">
                      <Icon name={icon.name} size={24} />
                    </span>
                    <code className="w-full truncate text-center text-[10px] font-bold text-muted">
                      {icon.name}
                    </code>
                    <span className="w-full truncate text-center text-[9px] font-black uppercase tracking-widest text-faint">
                      {icon.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Ecosistema tecnológico ───────────────────────── */}
          <section>
            <SectionHeading icon="server" title={TECH_STACK.title} accent="blue" />
            <p className="-mt-4 mb-6 text-xs font-bold uppercase tracking-widest text-faint">
              {TECH_STACK.subtitle}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TECH_STACK.items.map((tech) => {
                const a = ACCENTS[tech.accent];
                return (
                  <a
                    key={tech.name}
                    href={tech.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/40"
                  >
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.bg} ${a.text}`}>
                      <Icon name={tech.icon} size={22} />
                    </span>
                    <h3 className="mt-4 font-header text-lg font-black text-ink">{tech.name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${a.text}`}>
                      {tech.role}
                    </p>
                    <p className="mt-3 border-t border-border pt-3 text-[11px] font-bold leading-relaxed text-white/60">
                      {tech.detail}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>

          {/* ── Explora el proyecto ──────────────────────────── */}
          <section>
            <SectionHeading icon="globe" title={SECTION_TITLES.explore} accent="purple" />
            <InfoLinkGrid groups={groups} theme={THEME} />
          </section>

          {/* ── Orígenes & Arquitectura ──────────────────────── */}
          <section>
            <SectionHeading icon="rocket" title={ORIGINS.title} accent="pink" />
            <p className="-mt-4 mb-6 text-xs font-bold uppercase tracking-widest text-faint">
              {ORIGINS.subtitle}
            </p>
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
