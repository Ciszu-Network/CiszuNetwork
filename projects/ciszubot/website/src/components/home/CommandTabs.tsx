'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import { COMMANDS, CATEGORIES, CATEGORY_ICONS, type CommandInfo } from '@/data/commands';
import { BOT_PREFIX, type Dict } from '@/lib/i18n';
import Reveal from './Reveal';
import { track } from './track';

interface CommandTabsProps {
  dict: Dict;
  prefix: string;
}

/** Selección de comandos destacados: nombres reales del repositorio del bot. */
const FEATURED_NAMES = [
  'help',
  'ping',
  'profile',
  'serverinfo',
  'play',
  'balance',
  'daily',
  'rank',
  'giveaway',
];

type Tab = 'all' | (typeof CATEGORIES)[number];

/**
 * Comandos reales (fuente: `src/data/commands.ts`, sincronizado con el bot)
 * en tabs CSS por categoría. Sin buscador: eso vive en `/commands`.
 */
export default function CommandTabs({ dict, prefix }: CommandTabsProps) {
  const [tab, setTab] = useState<Tab>('all');

  const featured = useMemo(
    () =>
      FEATURED_NAMES.map((name) => COMMANDS.find((cmd) => cmd.name === name)).filter(
        (cmd): cmd is CommandInfo => Boolean(cmd)
      ),
    []
  );

  const shown = tab === 'all' ? featured : COMMANDS.filter((cmd) => cmd.category === tab);

  const selectTab = (next: Tab) => {
    setTab(next);
    track('command_tab', { tab: next });
  };

  return (
    <section id="comandos" className="relative scroll-mt-20 py-16 border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <p className="text-neon-blue font-semibold uppercase tracking-[0.25em] text-xs mb-3">
            {dict.commandsSection.kicker.replace(/^\d+/, String(COMMANDS.length))}
          </p>
          <h2 className="text-3xl md:text-4xl font-header font-bold text-ink">
            {dict.commandsSection.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{dict.commandsSection.subtitle}</p>
        </Reveal>

        {/* Tabs por categoría (CSS puro, estado React) */}
        <Reveal delay={80}>
          <div
            role="tablist"
            aria-label={dict.commandsSection.title}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            <button
              role="tab"
              aria-selected={tab === 'all'}
              onClick={() => selectTab('all')}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                tab === 'all'
                  ? 'border-neon-blue bg-neon-blue/15 text-neon-blue'
                  : 'border-border bg-card text-muted hover:text-ink'
              }`}
            >
              <Icon name="star" size={14} className={tab === 'all' ? 'text-neon-blue' : 'text-faint'} />
              {dict.commandsPage.all}
              <span className="tabular-nums opacity-60">{COMMANDS.length}</span>
            </button>
            {CATEGORIES.map((category) => {
              const count = COMMANDS.filter((cmd) => cmd.category === category).length;
              const active = tab === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectTab(category)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 ${
                    active
                      ? 'border-neon-purple bg-neon-purple/15 text-neon-purple'
                      : 'border-border bg-card text-muted hover:text-ink'
                  }`}
                >
                  <Icon name={CATEGORY_ICONS[category]} size={14} className={active ? 'text-neon-purple' : 'text-faint'} />
                  {dict.commandsSection.categories[category]}
                  <span className="tabular-nums opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Tarjetas de comandos reales */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((cmd, i) => (
            <Reveal key={`${tab}-${cmd.name}`} delay={Math.min(i, 6) * 60}>
              <article className="group h-full soft-card rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:border-neon-blue/50 hover:shadow-[0_0_25px_rgba(0,212,255,0.12)]">
                <div className="flex items-center justify-between mb-3">
                  <code className="text-sm font-semibold text-neon-blue bg-neon-blue/10 px-2.5 py-1 rounded-lg border border-neon-blue/25">
                    {prefix}
                    {cmd.name}
                  </code>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neon-purple/10 text-neon-purple transition-transform duration-300 group-hover:scale-110">
                    <Icon name={cmd.icon} size={16} />
                  </span>
                </div>
                <p className="text-sm text-muted mb-3">{cmd.description}</p>
                <p className="text-xs text-faint font-medium">
                  {dict.commandsSection.usage}:{' '}
                  <code className="text-ink bg-card border border-border px-1.5 py-0.5 rounded">{cmd.usage}</code>
                </p>
                {cmd.aliases.length > 0 && (
                  <p className="text-xs text-faint mt-2">
                    {dict.commandsSection.aliases}:{' '}
                    {cmd.aliases.slice(0, 3).map((a) => (
                      <code key={a} className="bg-card border border-border px-1 py-0.5 rounded mr-1">
                        {a}
                      </code>
                    ))}
                    {cmd.aliases.length > 3 && <span className="text-faint/60">+{cmd.aliases.length - 3}</span>}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/commands"
            onClick={() => track('commands_page_click', { from: 'home' })}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold btn-primary"
          >
            {dict.commandsSection.viewAll}
            <Icon name="chevronRight" size={16} className="animate-cb-bounce-x" />
          </Link>
        </div>
      </div>
    </section>
  );
}
