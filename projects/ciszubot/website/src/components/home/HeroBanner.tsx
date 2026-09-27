'use client';

import { Icon, SmartImage, CopyWithButton } from '@ciszu/ui';
import {
  BOT_PREFIX,
  DISCORD_BOT_LIST_BOT,
  DISCORD_SERVER,
  DISBOARD_SERVER,
  GITHUB_REPO,
  INVITE_URL,
  LOGO_ISOTIPO_CIRCLE,
  LOGO_LOGOTIPO,
  TOP_GG_BOT,
  type Dict,
} from '@/lib/i18n';
import { BOT_ID, isBotOnline, type BotStatus } from '@/lib/botStatus';
import { track } from './track';

interface HeroBannerProps {
  dict: Dict;
  status: BotStatus | null;
  serverNow: number;
}

/** Iconos decorativos flotantes del fondo (posiciones literales, sin azar). */
const FLOATERS: { icon: string; top: string; left: string; size: number; delay: string }[] = [
  { icon: 'terminal', top: '16%', left: '5%', size: 46, delay: '0s' },
  { icon: 'shield', top: '70%', left: '8%', size: 34, delay: '1.4s' },
  { icon: 'music', top: '24%', left: '90%', size: 40, delay: '0.8s' },
  { icon: 'gamepad', top: '72%', left: '88%', size: 44, delay: '2.1s' },
  { icon: 'trophy', top: '46%', left: '94%', size: 28, delay: '3s' },
  { icon: 'star', top: '44%', left: '2%', size: 26, delay: '2.6s' },
];

const PLATFORM_PILLS = [
  { href: TOP_GG_BOT, label: 'Top.gg', icon: 'trophy' },
  { href: DISCORD_BOT_LIST_BOT, label: 'DBL', icon: 'rocket' },
  { href: DISBOARD_SERVER, label: 'Disboard', icon: 'search' },
  { href: DISCORD_SERVER, label: 'Ciszugamens', icon: 'discord' },
];

/**
 * Hero de la home: banner animado con los logos reales del CDN, estado en vivo
 * y accesos directos reales (invitación, comandos, GitHub, ID del bot).
 * Fondo 100% CSS (rejilla, blobs, scanline, visualizador e iconos flotantes).
 */
export default function HeroBanner({ dict, status, serverNow }: HeroBannerProps) {
  const online = isBotOnline(status, serverNow);

  return (
    <section className="relative overflow-hidden pt-14 pb-16 md:pt-20 md:pb-24">
      {/* ── Fondo animado ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 animate-cb-grid opacity-70"
          style={{
            backgroundImage:
              'linear-gradient(var(--cb-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--cb-grid-line) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(35,63,146,0.16)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(0,212,255,0.10)_0%,transparent_70%)]" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-neon-blue/10 blur-[120px] animate-cb-blob" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-neon-purple/10 blur-[110px] animate-cb-blob cb-delay-2" />
        <div className="absolute top-1/3 left-2/3 w-72 h-72 rounded-full bg-neon-pink/10 blur-[100px] animate-cb-blob cb-delay-4" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/70 to-transparent animate-cb-scanline" />

        {FLOATERS.map((f) => (
          <span
            key={f.icon + f.left + f.top}
            className="absolute text-neon-blue/10 animate-float"
            style={{ top: f.top, left: f.left, animationDelay: f.delay }}
          >
            <Icon name={f.icon} size={f.size} />
          </span>
        ))}

        {/* Visualizador CSS en el borde inferior */}
        <div className="absolute bottom-0 left-0 w-full h-24 flex items-end gap-[3px] opacity-40">
          {Array.from({ length: 64 }).map((_, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-transparent to-neon-blue/50 animate-cb-visualizer"
              style={{
                height: `${(18 + Math.sin(i * 0.55) * 22 + Math.cos(i * 1.15) * 14 + 24).toFixed(3)}%`,
                animationDelay: `${(i * 0.05).toFixed(2)}s`,
                animationDuration: `${(1.6 + Math.abs(Math.sin(i * 0.4)) * 0.9).toFixed(2)}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 text-center">
        {/* Estado en vivo */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full chip mb-8 animate-fade-in-up">
          <span className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                online ? 'bg-success animate-pulse' : 'bg-danger'
              }`}
            />
            {online && (
              <span className="absolute w-2.5 h-2.5 rounded-full bg-success/60 animate-cb-pulse-ring" />
            )}
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase">
            {online ? dict.hero.online : dict.hero.offline}
            {status?.version ? ` · ${status.version}` : ''}
          </span>
        </div>

        {/* Logos reales del CDN */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-6">
          <SmartImage
            src={LOGO_ISOTIPO_CIRCLE}
            alt="CiszuBot isotipo"
            width={128}
            height={128}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-2 ring-neon-blue/40 shadow-[0_0_35px_rgba(0,212,255,0.35)] animate-float object-contain"
          />
          <SmartImage
            src={LOGO_LOGOTIPO}
            alt="CiszuBot logotipo"
            width={420}
            height={90}
            className="w-[260px] md:w-[400px] h-auto animate-cb-float-delayed drop-shadow-[0_0_25px_rgba(0,212,255,0.35)]"
          />
        </div>
        <h1 className="sr-only">CiszuBot</h1>

        <p className="text-lg md:text-2xl font-header font-bold text-neon-blue mb-4">
          {dict.hero.tagline}
        </p>
        <p className="mx-auto max-w-2xl text-sm md:text-base text-muted leading-relaxed mb-7">
          {dict.hero.description}
        </p>

        {/* Chips reales: prefijo + ID del bot copiable */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-xs font-bold text-ink">
            <Icon name="terminal" size={14} className="text-neon-blue" />
            {dict.footer.prefix}:{' '}
            <code className="text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-1.5 py-0.5 rounded">
              {BOT_PREFIX}
            </code>
          </span>
          <CopyWithButton
            value={BOT_ID}
            label="Copiar ID del bot"
            copiedLabel="ID copiado"
            size="sm"
            className="rounded-full bg-card border border-border px-4 py-2"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold text-ink">
              <Icon name="copy" size={14} className="text-neon-purple" />
              BOT ID: <code className="text-neon-purple tabular-nums">{BOT_ID}</code>
            </span>
          </CopyWithButton>
        </div>

        {/* CTAs reales */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('invite_click', { source: 'hero' })}
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide btn-discord overflow-hidden"
          >
            <span className="absolute inset-y-0 w-16 -skew-x-12 bg-white/20 -translate-x-[150%] group-hover:animate-cb-shine" aria-hidden />
            <Icon name="discord" size={20} className="[&>g]:fill-current relative" />
            <span className="relative">{dict.hero.ctaInvite}</span>
          </a>
          <a
            href="#comandos"
            onClick={() => track('commands_scroll', { source: 'hero' })}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide btn-primary"
          >
            <Icon name="gamepad" size={18} />
            {dict.commandsSection.viewAll}
          </a>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('github_click', { source: 'hero' })}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide btn-ghost"
          >
            <Icon name="star" size={18} />
            {dict.hero.ctaGithub}
          </a>
        </div>

        {/* Plataformas reales */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {PLATFORM_PILLS.map((p) => (
            <a
              key={p.label}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('platform_click', { platform: p.label, source: 'hero' })}
              className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-muted transition-all hover:-translate-y-0.5 hover:text-neon-blue hover:border-neon-blue/60"
            >
              <Icon name={p.icon} size={14} className="text-neon-blue" />
              {p.label}
            </a>
          ))}
        </div>

        {/* Botón bajar */}
        <a
          href="#estado"
          aria-label="Scroll down"
          className="group inline-flex flex-col items-center text-muted hover:text-neon-blue transition-colors"
        >
          <span className="relative flex items-center justify-center w-11 h-11 rounded-full border-2 border-current animate-bounce">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
