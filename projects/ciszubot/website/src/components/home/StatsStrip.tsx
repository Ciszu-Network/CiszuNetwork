'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import { BOT_PREFIX, isEsLang, type Dict, type Lang } from '@/lib/i18n';
import { COMMANDS } from '@/data/commands';
import { formatUptime, isBotOnline, type BotStatus } from '@/lib/botStatus';
import AnimatedCounter from './AnimatedCounter';
import Reveal from './Reveal';
import useLiveBotStatus from './useLiveBotStatus';

interface StatsStripProps {
  dict: Dict;
  lang: Lang;
  status: BotStatus | null;
  serverNow: number;
}

/**
 * Estado en vivo real (Supabase `ciszubot.bot_status`) con contadores animados.
 * Sin datos disponibles se muestra "—" (placeholder honesto, nunca cifras
 * inventadas). El uptime se recalcula cada 30s en el cliente.
 */
export default function StatsStrip({ dict, lang, status, serverNow }: StatsStripProps) {
  const live = useLiveBotStatus(status);
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const online = isBotOnline(live, now);
  const locale = isEsLang(lang) ? 'es' : 'en';

  const tiles = [
    {
      key: 'servers',
      icon: 'server',
      label: dict.stats.servers,
      value: live ? live.guilds : null,
      accent: 'text-neon-blue',
      bgClass: 'bg-neon-blue/10',
      ring: 'hover:border-neon-blue/60 hover:shadow-[0_0_25px_rgba(0,212,255,0.18)]',
    },
    {
      key: 'commandsRun',
      icon: 'terminal',
      label: dict.stats.commandsRun,
      value: live ? live.commands_total : null,
      accent: 'text-neon-purple',
      bgClass: 'bg-neon-purple/10',
      ring: 'hover:border-neon-purple/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]',
    },
    {
      key: 'uptime',
      icon: 'clock',
      label: dict.stats.uptime,
      value: null as number | null,
      text: live ? formatUptime(live.started_at, now) : '—',
      accent: 'text-neon-cyan',
      bgClass: 'bg-neon-cyan/10',
      ring: 'hover:border-neon-cyan/60 hover:shadow-[0_0_25px_rgba(34,211,238,0.18)]',
    },
    {
      key: 'commands',
      icon: 'gamepad',
      label: dict.stats.commands,
      value: COMMANDS.length,
      accent: 'text-neon-pink',
      bgClass: 'bg-neon-pink/10',
      ring: 'hover:border-neon-pink/60 hover:shadow-[0_0_25px_rgba(255,51,204,0.18)]',
    },
  ];

  return (
    <section id="estado" className="relative scroll-mt-20 py-16 border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-header font-bold text-ink">
            {dict.statusSection.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{dict.statusSection.subtitle}</p>
        </Reveal>

        <Reveal delay={80}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {tiles.map((tile) => (
              <div
                key={tile.key}
                className={`group soft-card rounded-2xl p-6 text-center border transition-all duration-300 hover:-translate-y-1 ${tile.ring}`}
              >
                <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${tile.bgClass} ${tile.accent} mb-4`}>
                  <Icon name={tile.icon} size={22} />
                </span>
                <div className="text-3xl md:text-4xl font-header font-black text-ink">
                  {tile.value !== null ? (
                    <AnimatedCounter value={tile.value} locale={locale} />
                  ) : (
                    <span className="tabular-nums">{tile.text ?? '—'}</span>
                  )}
                </div>
                <div className="text-[10px] text-faint font-bold uppercase tracking-widest mt-2">
                  {tile.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted">
            <span className="inline-flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${online ? 'bg-success animate-pulse' : 'bg-danger'}`} />
              {online ? dict.statusSection.online : dict.statusSection.offline}
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="verified" size={14} className="text-neon-blue" />
              {dict.statusSection.version}:{' '}
              <strong className="text-ink">{live?.version ?? '—'}</strong>
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="terminal" size={14} className="text-neon-purple" />
              {dict.footer.prefix}: <code className="text-ink">{live?.prefix ?? BOT_PREFIX}</code>
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon name="clock" size={14} className="text-neon-cyan" />
              {dict.statusSection.lastSeen}:{' '}
              <strong className="text-ink">
                {live?.last_seen
                  ? new Date(live.last_seen).toLocaleString(locale)
                  : '—'}
              </strong>
            </span>
          </div>

          <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-faint">
            {live ? dict.statusSection.heartbeat : dict.statusSection.noStatus}
          </p>

          <div className="mt-6 text-center">
            <Link href="/stats" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold btn-ghost">
              {dict.statusSection.viewPage}
              <Icon name="chevronRight" size={16} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
