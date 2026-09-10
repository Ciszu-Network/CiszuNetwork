'use client';

import React, { useState } from 'react';
import { Icon } from '@ciszu/ui';
import Script from 'next/script';
import QuickDocks from '@/components/molecules/QuickDocks';
import Link from 'next/link';

const GHOST_RATING = 5.0;

const DEFAULT_REVIEWS = [
  { id: 'bot-1', platform: 'Top.gg', rating: 5.0, text: 'Bot imprescindible para cualquier comunidad de Discord.', author: 'Votante verificado', is_verified: true, created_at: '2026-08-01T12:00:00.000Z' },
  { id: 'bot-2', platform: 'Discord Bot List', rating: 5.0, text: 'Muy estable y con comandos útiles.', author: 'Admin de servidor', is_verified: false, created_at: '2026-08-05T12:00:00.000Z' },
];

export default function ReviewsPage() {
  const [reviews] = useState<typeof DEFAULT_REVIEWS>(() => DEFAULT_REVIEWS);

  const reviewsCount = reviews.length;
  const averageWithGhost = reviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) + GHOST_RATING) / (reviewsCount + 1)
    : GHOST_RATING;
  const hasRealReviews = reviewsCount > 0;

  return (
    <div className="bg-bg py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-pink/5 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-screen-xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-pink/12 text-neon-pink shadow-[0_0_20px_rgba(255,51,204,0.25)] mb-6">
            <Icon name="star" size={26} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-ink">REVIEWS</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">Reseñas y opiniones de usuarios sobre CiszuBot en directorios de bots de Discord.</p>
        </div>

        <div className="max-w-3xl mx-auto soft-card rounded-[3rem] p-10 text-center mb-8 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-neon-pink/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="text-6xl font-header font-black text-neon-pink drop-shadow-neon-pink italic">
                {averageWithGhost.toFixed(1)}
              </div>
              <div className="text-sm text-muted font-black uppercase tracking-[0.3em] mt-1">
                / 5.0
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-6 h-6 text-neon-pink">
                  <Icon name="star" size={24} />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted font-black uppercase tracking-widest">
              {hasRealReviews ? 'Satisfaction Protocol v2.1.0' : 'Sin reseñas · Baseline 5.0'}
            </p>
            <p className="text-xs text-faint">
              {hasRealReviews
                ? `Baseline + ${reviewsCount} review${reviewsCount !== 1 ? 's' : ''}`
                : 'No user reviews to analyze — showing baseline 5.0'}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 mb-12">
          {reviews.map((r, i) => (
            <div
              key={r.id}
              className="soft-card rounded-[2.5rem] p-8 text-left hover:border-neon-pink/30 transition-all duration-500 group relative overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-pink/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Icon key={j} name="star" size={14} className="text-neon-pink" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-ink">{r.platform}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.is_verified && (
                    <span className="px-4 py-1.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-header font-black text-xs uppercase tracking-widest">
                      Verificado
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted mb-1 relative mt-4">
                <span className="absolute -left-3 top-0 w-1 h-full rounded-full bg-neon-pink/30" />
                &ldquo;{r.text}&rdquo;
              </p>
              <p className="text-xs text-faint mt-2">— {r.author}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto p-8 rounded-[3rem] bg-gradient-to-br from-neon-blue/10 via-transparent to-transparent border border-neon-blue/25 text-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-header font-black text-white mb-2 uppercase tracking-tight">Confianza y Verificación</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Verifica la reputación de CiszuBot en plataformas independientes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-green/30 text-neon-green font-header font-black text-sm uppercase tracking-widest">
              Trustpilot
            </div>
            <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-blue/30 text-neon-blue font-header font-black text-sm uppercase tracking-widest">
              Top.gg
            </div>
            <div className="px-6 py-3 rounded-2xl bg-black border-2 border-[#5865F2]/30 text-[#5865F2] font-header font-black text-sm uppercase tracking-widest">
              Discord
            </div>
          </div>
          <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-6">
            Verified by community · Trusted by users · Powered by Ciszuko Antony
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="trustpilot-widget" data-locale="en-US" data-template-id="56278e9abfbbba0bdcd568bc" data-businessunit-id="6a7be8beb27b048803166c8f" data-style-height="52px" data-style-width="100%" data-token="62a9715c-b305-4cb7-a9cf-629a5cc67f63">
              <a href="https://www.trustpilot.com/review/ciszunetwork.vercel.app">Trustpilot</a>
            </div>
          </div>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold btn-ghost">
            Volver al inicio
          </Link>
        </div>

        <QuickDocks />
        <Script src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" strategy="lazyOnload" />
      </div>
    </div>
  );
}
