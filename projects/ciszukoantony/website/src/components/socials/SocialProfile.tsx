'use client';

import React from 'react';
import Link from 'next/link';
import { Icon, captureEvent } from '@ciszu/ui';
import { SOCIAL_ENTRIES, getSocial, type SocialEntry } from '@/data/socials';
import SocialGlyph, { socialTone } from '@/components/socials/SocialGlyph';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { usePageTitle } from '@/lib/usePageTitle';

/**
 * Ficha de una red social real (`/socials/<red>`): hero con el color y el
 * icono de la marca, qué se publica allí, datos públicos, enlace directo al
 * perfil externo y redes afines. El contenido es específico por red; sale de
 * `src/data/socials.ts`.
 */
export default function SocialProfile({ social }: { social: SocialEntry }) {
  usePageTitle(social.name.toUpperCase());
  const ink = socialTone(social);
  const related = social.related
    .map((id) => getSocial(id))
    .filter((entry): entry is SocialEntry => Boolean(entry));

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-lg">
        {/* Migas */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/socials" className="hover:text-white transition-colors">Socials</Link>
          <span>/</span>
          <span style={{ color: ink }}>{social.name}</span>
        </nav>

        {/* Hero de la red */}
        <header
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-12 mb-12"
          style={{ backgroundImage: `radial-gradient(circle at 15% 15%, ${social.accent}22, transparent 60%)` }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-7">
            <span
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/5 border"
              style={{ borderColor: `${ink}55`, boxShadow: `0 0 40px ${social.accent}33` }}
            >
              <SocialGlyph social={social} size={48} />
            </span>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2" style={{ color: ink }}>
                {social.tagline}
              </p>
              <h1 className="text-4xl md:text-5xl font-header font-black uppercase italic tracking-tight text-white mb-2">
                {social.name}
              </h1>
              <p className="text-sm font-header font-bold text-gray-400 mb-4">{social.handle}</p>
              <p className="text-gray-300 leading-relaxed max-w-2xl">{social.about}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => captureEvent('social_direct_click', { platform: social.id })}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-header font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all"
                  style={{ backgroundImage: `linear-gradient(135deg, ${social.accent}, ${social.accentAlt})` }}
                >
                  <Icon name="external" size={14} />
                  Ir a {social.name}
                </a>
                <Link
                  href="/socials"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white font-header font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all"
                >
                  <Icon name="chevronRight" size={14} className="rotate-180" />
                  Todas las redes
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Qué se publica aquí */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] mb-5" style={{ color: ink }}>
            <Icon name="message" size={15} />
            Qué se publica en {social.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {social.publishes.map((item) => (
              <article
                key={item.title}
                className="h-full p-6 rounded-[1.75rem] bg-white/5 border border-white/10 hover:border-white/25 transition-all hover:-translate-y-1"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                  <Icon name={item.icon} size={20} color={ink} />
                </span>
                <h3 className="font-header font-black uppercase italic text-white text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Datos públicos */}
        <section className="mb-14">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] mb-5" style={{ color: ink }}>
            <Icon name="info" size={15} />
            Datos de la cuenta
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {social.facts.map((fact) => (
              <div key={fact.label} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{fact.label}</p>
                <p className="text-sm font-header font-bold text-white break-words">{fact.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Redes afines */}
        {related.length > 0 && (
          <section className="mb-14">
            <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] mb-5" style={{ color: ink }}>
              <Icon name="share" size={15} />
              Sigue explorando
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/socials/${entry.id}`}
                  onClick={() => captureEvent('social_related_click', { from: social.id, to: entry.id })}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:-translate-y-0.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    <SocialGlyph social={entry} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-header font-black text-white truncate">{entry.name}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">
                      {entry.tagline}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA final */}
        <section className="text-center p-8 md:p-12 rounded-[2.5rem] border border-white/10 bg-white/5">
          <h2 className="text-2xl md:text-3xl font-header font-black uppercase italic text-white mb-3">
            {social.cta.label}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-7">
            Perfil oficial de {social.name} de Ciszuko Antony. Se abre en una pestaña nueva, directo al perfil externo.
          </p>
          <a
            href={social.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => captureEvent('social_cta_click', { platform: social.id })}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-header font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
            style={{ backgroundImage: `linear-gradient(135deg, ${social.accent}, ${social.accentAlt})` }}
          >
            <SocialGlyph social={social} size={18} tone="mono" className="text-white" />
            {social.cta.label}
            <Icon name="external" size={14} />
          </a>
        </section>

        {/* Otras redes del índice */}
        <p className="text-center text-gray-500 text-xs mt-10">
          Este perfil es una de las {SOCIAL_ENTRIES.length} redes oficiales listadas en{' '}
          <Link href="/socials" className="font-bold hover:text-white transition-colors" style={{ color: ink }}>
            /socials
          </Link>
          .
        </p>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
