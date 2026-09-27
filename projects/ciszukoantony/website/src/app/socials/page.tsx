'use client';

import React from 'react';
import Link from 'next/link';
import { InfoCtaRow, InfoHero, Icon, captureEvent, type InfoTheme } from '@ciszu/ui';
import { SOCIAL_ENTRIES } from '@/data/socials';
import SocialGlyph from '@/components/socials/SocialGlyph';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { usePageTitle } from '@/lib/usePageTitle';
import { useDict } from '@/components/providers/I18nProvider';

const THEME: InfoTheme = {
  accent: 'text-neon-pink',
  accentBg: 'bg-neon-pink/10',
  accentBorder: 'border-neon-pink/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-neon-pink to-neon-purple',
};

/**
 * `/socials` — índice de las redes REALES de Ciszuko Antony.
 * Cada tarjeta enlaza a su subpágina (/socials/<red>) con el detalle de qué
 * se publica allí y un acceso directo al perfil externo.
 */
export default function SocialsPage() {
  usePageTitle('SOCIALS');
  const dict = useDict();

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="share"
          title="Socials"
          subtitle="Todas las redes oficiales de Ciszuko Antony en un solo índice: qué se publica en cada plataforma, sus datos públicos y el enlace directo al perfil."
          kicker={`${SOCIAL_ENTRIES.length} redes oficiales`}
          theme={THEME}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOCIAL_ENTRIES.map((social) => (
            <article
              key={social.id}
              className="group flex flex-col h-full p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  <SocialGlyph social={social} size={22} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-header font-black uppercase italic text-white">{social.name}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 truncate">{social.handle}</p>
                </div>
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-pink mb-2">{social.tagline}</p>
              <p className="text-sm text-gray-400 leading-relaxed flex-1 line-clamp-3">{social.about}</p>

              <div className="flex flex-wrap items-center gap-3 mt-5">
                <Link
                  href={`/socials/${social.id}`}
                  onClick={() => captureEvent('socials_index_open', { platform: social.id })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-pink/15 border border-neon-pink/40 text-neon-pink text-[10px] font-header font-black uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all"
                >
                  Ver página
                  <Icon name="chevronRight" size={12} />
                </Link>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => captureEvent('socials_index_external', { platform: social.id })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-header font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <Icon name="external" size={12} />
                  Abrir
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <InfoCtaRow
            theme={THEME}
            actions={[
              { label: dict.portfolio.ctaContact, href: '/contact', icon: 'mail' },
              { label: dict.portfolio.ctaCommissions, href: '/commissions', icon: 'money' },
              { label: 'Portfolio & CV', href: '/portfolio', icon: 'palette', variant: 'ghost' },
            ]}
          />
        </div>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
