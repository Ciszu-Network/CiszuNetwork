'use client';

import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import { BOT_PREFIX, DISCORD_SERVER, INVITE_URL, type Dict } from '@/lib/i18n';
import { COMMANDS } from '@/data/commands';
import Reveal from './Reveal';
import { track } from './track';

interface CtaSectionProps {
  dict: Dict;
}

/**
 * Cierre de la home: marquesina con los comandos reales, CTA de invitación
 * real y accesos a soporte/comandos.
 */
export default function CtaSection({ dict }: CtaSectionProps) {
  const ticker = COMMANDS.map((cmd) => `${BOT_PREFIX}${cmd.name}`);

  return (
    <section id="invitar" className="relative border-t border-border overflow-hidden">
      {/* Marquesina de comandos reales */}
      <div className="relative py-6 border-b border-border bg-surface overflow-hidden" aria-hidden>
        <div className="flex w-max animate-cb-ticker gap-3">
          {[...ticker, ...ticker].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-bold text-muted"
            >
              <span className="text-neon-blue">{name}</span>
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface to-transparent" />
      </div>

      <div className="relative py-20 text-center">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-neon-blue/10 blur-[120px] animate-cb-blob" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[260px] rounded-full bg-neon-pink/10 blur-[110px] animate-cb-blob cb-delay-2" />
        </div>

        <div className="max-w-screen-xl mx-auto px-4">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-header font-black text-ink mb-4">
              {dict.cta.title}
            </h2>
            <p className="mx-auto mb-9 max-w-lg text-sm md:text-base text-muted">
              {dict.cta.description}
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('invite_click', { source: 'cta' })}
                className="group relative inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-sm font-bold tracking-wide btn-discord overflow-hidden"
              >
                <span className="absolute inset-y-0 w-16 -skew-x-12 bg-white/20 -translate-x-[150%] group-hover:animate-cb-shine" aria-hidden />
                <Icon name="discord" size={20} className="[&>g]:fill-current relative" />
                <span className="relative">{dict.cta.button}</span>
              </a>
              <a
                href={DISCORD_SERVER}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('support_join_click', { source: 'cta' })}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold tracking-wide btn-ghost"
              >
                <Icon name="life-ring" size={18} />
                {dict.supportPage.joinCta}
              </a>
              <Link
                href="/commands"
                onClick={() => track('commands_page_click', { from: 'cta' })}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm font-bold tracking-wide btn-primary"
              >
                <Icon name="gamepad" size={18} />
                {dict.commandsSection.title}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
