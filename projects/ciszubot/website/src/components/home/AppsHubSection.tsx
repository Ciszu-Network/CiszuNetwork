'use client';

import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import {
  CISZU_NETWORK,
  CISZUKO_ANTONY,
  DISCORD_SERVER,
  INVITE_URL,
  type Dict,
} from '@/lib/i18n';
import Reveal from './Reveal';
import { track } from './track';

const MUZICMANIA = 'https://muzicmania.vercel.app';
const CISZUPY = 'https://pypi.org/project/ciszupy/';

interface AppsHubSectionProps {
  dict: Dict;
}

/**
 * Ecosistema completo en la home: Discord como canal principal y un acceso
 * definitivo a cada app de Ciszu Network. Telegram y WhatsApp se enlazan a sus
 * páginas de "próximamente" para no prometer una integración que aún no existe.
 */
export default function AppsHubSection({ dict }: AppsHubSectionProps) {
  type AppItem = {
    name: string;
    desc: string;
    href: string;
    icon: string;
    style?: 'brand';
    accent: string;
    bg: string;
    border: string;
    internal?: boolean;
  };
  const apps: AppItem[] = [
    { name: dict.appsHub.apps[0].name, desc: dict.appsHub.apps[0].desc, href: CISZU_NETWORK, icon: 'globe', accent: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'hover:border-neon-blue/60' },
    { name: dict.appsHub.apps[1].name, desc: dict.appsHub.apps[1].desc, href: CISZUKO_ANTONY, icon: 'portfolio', accent: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'hover:border-neon-purple/60' },
    { name: dict.appsHub.apps[2].name, desc: dict.appsHub.apps[2].desc, href: MUZICMANIA, icon: 'music', accent: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'hover:border-neon-cyan/60' },
    { name: dict.appsHub.apps[3].name, desc: dict.appsHub.apps[3].desc, href: '/invite', icon: 'discord', accent: 'text-[#5865F2]', bg: 'bg-[#5865F2]/10', border: 'hover:border-[#5865F2]/60', internal: true },
    { name: dict.appsHub.apps[4].name, desc: dict.appsHub.apps[4].desc, href: DISCORD_SERVER, icon: 'gamepad', accent: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'hover:border-neon-pink/60' },
    { name: dict.appsHub.apps[5].name, desc: dict.appsHub.apps[5].desc, href: CISZUPY, icon: 'python', style: 'brand', accent: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'hover:border-yellow-400/60' },
  ];

  return (
    <section id="apps" className="relative scroll-mt-20 py-16 border-t border-border overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-neon-blue/10 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-neon-pink/10 blur-[100px]" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <p className="text-neon-blue font-semibold uppercase tracking-[0.25em] text-xs mb-3">
            {dict.appsHub.kicker}
          </p>
          <h2 className="text-3xl md:text-4xl font-header font-bold text-ink mb-3">
            {dict.appsHub.title}
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted">{dict.appsHub.subtitle}</p>
        </Reveal>

        {/* Discord como canal principal */}
        <Reveal>
          <div className="relative mb-10 overflow-hidden rounded-3xl border border-[#5865F2]/30 bg-gradient-to-r from-[#5865F2]/15 via-card to-neon-cyan/10 p-6 sm:p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white shadow-lg shadow-[#5865F2]/30">
                <Icon name="discord" size={34} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-header font-black text-ink">{dict.appsHub.discordTitle}</h3>
                <p className="mt-1 max-w-2xl text-sm text-muted">{dict.appsHub.discordDesc}</p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <a
                  href={INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('invite_click', { source: 'apps_hub' })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#4752c4]"
                >
                  <Icon name="discord" size={17} />
                  {dict.appsHub.discordCta}
                </a>
                <Link
                  href="/invite/telegram"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#229ED9]/40 bg-[#229ED9]/10 px-4 py-3 text-xs font-bold text-[#229ED9] transition-all hover:-translate-y-0.5 hover:bg-[#229ED9]/20"
                >
                  <Icon name="telegram" style="brand" size={16} />
                  {dict.appsHub.telegramCta}
                </Link>
                <Link
                  href="/invite/whatsapp"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-xs font-bold text-[#25D366] transition-all hover:-translate-y-0.5 hover:bg-[#25D366]/20"
                >
                  <Icon name="whatsapp" style="brand" size={16} />
                  {dict.appsHub.whatsappCta}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Todas las apps */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app, index) => {
            const content = (
              <article className={`cz-card group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 ${app.border}`}>
                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${app.bg} ${app.accent} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon name={app.icon} style={app.style ?? 'outline'} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-header font-bold text-ink">{app.name}</h3>
                  <p className="mt-1 text-sm text-muted leading-relaxed">{app.desc}</p>
                </div>
                <span className="mt-1 text-muted transition-transform duration-300 group-hover:translate-x-1">→</span>
              </article>
            );
            return (
              <Reveal key={app.name} delay={index * 60}>
                {app.internal ? (
                  <Link href={app.href} className="block h-full" onClick={() => track('app_click', { app: app.name })}>
                    {content}
                  </Link>
                ) : (
                  <a href={app.href} target="_blank" rel="noopener noreferrer" className="block h-full" onClick={() => track('app_click', { app: app.name })}>
                    {content}
                  </a>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
