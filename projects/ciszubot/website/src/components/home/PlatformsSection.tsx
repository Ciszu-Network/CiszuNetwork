'use client';

import Link from 'next/link';
import { Icon, SmartImage, CopyWithButton, CiszugamensLogo } from '@ciszu/ui';
import {
  DISCORD_BOT_LIST_BOT,
  DISCORD_BOT_LIST_BOT_VOTE,
  DISCORD_BOT_LIST_SERVER,
  DISCORD_SERVER,
  DISBOARD_SERVER,
  LOGO_ISOTIPO_CIRCLE,
  TOP_GG_BOT,
  TOP_GG_BOT_VOTE,
  TOP_GG_SERVER,
  TOP_GG_WIDGET_BOT,
  TOP_GG_WIDGET_SERVER,
  type Dict,
} from '@/lib/i18n';
import { BOT_ID } from '@/lib/botStatus';
import Reveal from './Reveal';
import { track } from './track';

interface PlatformsSectionProps {
  dict: Dict;
}

/**
 * Plataformas reales del bot (Top.gg, DBL, Disboard, Ciszu Gamens), widgets
 * oficiales de Top.gg con su código embebible y el servidor de soporte.
 */
export default function PlatformsSection({ dict }: PlatformsSectionProps) {
  const platforms = [
    {
      key: 'topggBot',
      icon: 'trophy',
      href: TOP_GG_BOT,
      accent: 'text-neon-pink',
      bg: 'bg-neon-pink/10',
      border: 'hover:border-neon-pink/60',
      actions: [
        { label: dict.explorePage.visit, href: TOP_GG_BOT, icon: 'external' },
        { label: dict.explorePage.vote, href: TOP_GG_BOT_VOTE, icon: 'heart' },
      ],
    },
    {
      key: 'dblBot',
      icon: 'rocket',
      href: DISCORD_BOT_LIST_BOT,
      accent: 'text-neon-blue',
      bg: 'bg-neon-blue/10',
      border: 'hover:border-neon-blue/60',
      actions: [
        { label: dict.explorePage.visit, href: DISCORD_BOT_LIST_BOT, icon: 'external' },
        { label: dict.explorePage.vote, href: DISCORD_BOT_LIST_BOT_VOTE, icon: 'heart' },
      ],
    },
    {
      key: 'disboard',
      icon: 'search',
      href: DISBOARD_SERVER,
      accent: 'text-neon-purple',
      bg: 'bg-neon-purple/10',
      border: 'hover:border-neon-purple/60',
      actions: [
        { label: dict.explorePage.visit, href: DISBOARD_SERVER, icon: 'external' },
        { label: dict.explorePage.join, href: DISCORD_SERVER, icon: 'discord' },
      ],
    },
    {
      key: 'ciszugamens',
      icon: 'people',
      href: DISCORD_SERVER,
      accent: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      border: 'hover:border-neon-cyan/60',
      actions: [{ label: dict.explorePage.join, href: DISCORD_SERVER, icon: 'discord' }],
    },
  ] as const;

  const widgetBotCode = `<img src="${TOP_GG_WIDGET_BOT}" alt="CiszuBot" />`;
  const widgetServerCode = `<img src="${TOP_GG_WIDGET_SERVER}" alt="Ciszugamens" />`;

  return (
    <section id="plataformas" className="relative scroll-mt-20 py-16 border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <p className="text-neon-pink font-semibold uppercase tracking-[0.25em] text-xs mb-3">
            {dict.explorePage.kicker}
          </p>
          <h2 className="text-3xl md:text-4xl font-header font-bold text-ink">
            {dict.explorePage.platformsTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{dict.explorePage.subtitle}</p>
          <Link
            href="/explore"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted transition-all hover:-translate-y-0.5 hover:border-neon-pink/60 hover:text-neon-pink"
          >
            <Icon name="globe" size={13} />
            {dict.explorePage.viewAll}
          </Link>
        </Reveal>

        {/* Plataformas reales */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform, i) => {
            const copy = dict.explorePage.platforms[platform.key];
            return (
              <Reveal key={platform.key} delay={i * 80}>
                <article
                  className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 ${platform.border}`}
                >
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4 ${platform.bg} ${platform.accent} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon name={platform.icon} size={22} />
                  </span>
                  <h3 className="font-header font-bold text-ink mb-2">{copy.name}</h3>
                  <p className="flex-1 text-sm text-muted leading-relaxed mb-5">{copy.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {platform.actions.map((action) => (
                      <a
                        key={`${platform.key}-${action.label}`}
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track('platform_click', { platform: platform.key, action: action.label })}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${platform.bg} ${platform.border} ${platform.accent}`}
                      >
                        <Icon name={action.icon} size={13} />
                        {action.label}
                      </a>
                    ))}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Widgets oficiales de Top.gg + código copiable */}
        <Reveal delay={120}>
          <div className="mt-14 rounded-3xl border border-border bg-card p-8">
            <div className="text-center mb-8">
              <h3 className="font-header text-2xl font-black text-ink">{dict.explorePage.widgetsTitle}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{dict.explorePage.widgetsDesc}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-center gap-4">
                <a
                  href={TOP_GG_BOT}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={dict.explorePage.widgetBotAlt}
                  className="flex items-center justify-center rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5"
                >
                  <img
                    src={TOP_GG_WIDGET_BOT}
                    alt={dict.explorePage.widgetBotAlt}
                    width={276}
                    height={197}
                    loading="lazy"
                    className="h-[197px] w-auto max-w-full rounded-xl"
                  />
                </a>
                <CopyWithButton
                  value={widgetBotCode}
                  label="Copiar widget del bot"
                  copiedLabel="Widget copiado"
                  size="sm"
                  className="max-w-full rounded-xl border border-border bg-surface px-3 py-2"
                >
                  <code className="truncate text-[10px] text-muted">{widgetBotCode}</code>
                </CopyWithButton>
              </div>
              <div className="flex flex-col items-center gap-4">
                <a
                  href={TOP_GG_SERVER}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={dict.explorePage.widgetServerAlt}
                  className="flex items-center justify-center rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5"
                >
                  <img
                    src={TOP_GG_WIDGET_SERVER}
                    alt={dict.explorePage.widgetServerAlt}
                    loading="lazy"
                    className="max-h-[197px] w-auto max-w-full rounded-xl"
                  />
                </a>
                <CopyWithButton
                  value={widgetServerCode}
                  label="Copiar widget del servidor"
                  copiedLabel="Widget copiado"
                  size="sm"
                  className="max-w-full rounded-xl border border-border bg-surface px-3 py-2"
                >
                  <code className="truncate text-[10px] text-muted">{widgetServerCode}</code>
                </CopyWithButton>
              </div>
            </div>

            {/* ID del bot + enlaces de listas del servidor */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <CopyWithButton
                value={BOT_ID}
                label="Copiar ID del bot"
                copiedLabel="ID copiado"
                size="sm"
                className="rounded-full border border-border bg-surface px-4 py-2"
              >
                <span className="inline-flex items-center gap-2 text-xs font-bold text-ink">
                  <Icon name="copy" size={13} className="text-neon-purple" />
                  BOT ID: <code className="text-neon-purple tabular-nums">{BOT_ID}</code>
                </span>
              </CopyWithButton>
              <a
                href={TOP_GG_SERVER}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-muted transition-all hover:-translate-y-0.5 hover:text-neon-pink hover:border-neon-pink/60"
              >
                <Icon name="trophy" size={13} className="text-neon-pink" />
                {dict.supportPage.serverListsTitle}
              </a>
              <a
                href={DISCORD_BOT_LIST_SERVER}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-muted transition-all hover:-translate-y-0.5 hover:text-neon-blue hover:border-neon-blue/60"
              >
                <Icon name="rocket" size={13} className="text-neon-blue" />
                DBL Server
              </a>
            </div>
          </div>
        </Reveal>

        {/* Servidor de soporte real */}
        <Reveal delay={160}>
          <div className="mt-14 relative overflow-hidden rounded-3xl border border-[#5865F2]/40 bg-[#5865F2]/5 p-8 md:p-10">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#5865F2]/10 blur-[90px] pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                <SmartImage
                  src={LOGO_ISOTIPO_CIRCLE}
                  alt="CiszuBot"
                  width={72}
                  height={72}
                  className="w-16 h-16 rounded-full ring-2 ring-[#5865F2]/50 object-contain shrink-0"
                />
                <div>
                  <h3 className="font-header text-2xl font-black text-ink flex items-center justify-center md:justify-start gap-2">
                    <CiszugamensLogo size={22} />
                    {dict.supportPage.joinTitle}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm text-muted leading-relaxed">{dict.supportPage.joinDesc}</p>
                </div>
              </div>
              <a
                href={DISCORD_SERVER}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('support_join_click', { source: 'home' })}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide btn-discord shrink-0"
              >
                <Icon name="discord" size={18} className="[&>g]:fill-current" />
                {dict.supportPage.joinCta}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
