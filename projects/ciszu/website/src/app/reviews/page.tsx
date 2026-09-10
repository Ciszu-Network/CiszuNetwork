'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';

const GHOST_RATING = 5.0;

const STATIC_REVIEWS = [
  {
    id: 'static-1',
    platform: 'Trustpilot',
    rating: 5.0,
    text: 'Excelente servicio y profesionalismo. La web superó todas mis expectativas.',
    author: 'Cliente verificado',
    is_verified: true,
    created_at: '2026-08-01T12:00:00.000Z',
  },
  {
    id: 'static-2',
    platform: 'Google',
    rating: 5.0,
    text: 'Muy recomendado. Ciszuko Antony y su equipo son unos genios.',
    author: 'Usuario web',
    is_verified: true,
    created_at: '2026-08-05T12:00:00.000Z',
  },
  {
    id: 'static-3',
    platform: 'Discord',
    rating: 5.0,
    text: 'CiszuBot es el mejor bot que he usado. Muy estable y con muchas funcionalidades.',
    author: 'Admin de servidor',
    is_verified: false,
    created_at: '2026-08-10T12:00:00.000Z',
  },
  {
    id: 'static-4',
    platform: 'Top.gg',
    rating: 5.0,
    text: 'Bot imprescindible para cualquier comunidad de Discord.',
    author: 'Votante verificado',
    is_verified: true,
    created_at: '2026-08-15T12:00:00.000Z',
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const I = {
  star: (fillType = 'good', size = 'w-full h-full') => (
    <div className={`${size} relative`}>
      <svg viewBox="0 0 24 24" className="w-full h-full" stroke="none">
        <defs>
          <linearGradient id="grad-good" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#59b4ff" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
          <linearGradient id="half-good" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#59b4ff" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          fill={fillType.startsWith('url') ? fillType : `url(#grad-${fillType})`}
        />
      </svg>
    </div>
  ),
  check: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={3}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

export default function ReviewsPage() {
  usePageTitle('REVIEWS');
  const [reviews] = useState<typeof STATIC_REVIEWS>(() => STATIC_REVIEWS);

  const reviewsCount = reviews.length;
  const averageWithGhost = reviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) + GHOST_RATING) / (reviewsCount + 1)
    : GHOST_RATING;
  const hasRealReviews = reviewsCount > 0;

  const getRatingColor = (r: number) => {
    if (r >= 4) return '#59b4ff';
    if (r >= 3) return '#00ff88';
    if (r >= 2) return '#ff6600';
    return '#ff0000';
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-blue/5 rounded-full blur-[250px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-0 pb-32 space-y-12">
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center gap-6 group">
              <div className="w-12 h-12 text-neon-yellow flex items-center justify-center">
                {I.star('good')}
              </div>
              <h1 className="text-5xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-yellow to-white bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                RESEÑAS
              </h1>
            </div>
            <p className="text-neon-yellow font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
              Calibrando la experiencia global
            </p>
          </div>
        </motion.header>

        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-12">
          <div className="bg-black border border-white/10 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -left-10 w-60 h-60 bg-neon-blue/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-center gap-14 relative z-10 text-center flex-wrap">
              <div className="relative group/score">
                <div className="w-40 h-40 rounded-full border-8 border-neon-blue/10 flex items-center justify-center shadow-[0_0_80px_rgba(89,180,255,0.15)] bg-black transition-transform group-hover/score:scale-110 duration-500">
                  <div className="text-center">
                    <div className="text-6xl font-header font-black text-neon-blue drop-shadow-neon-blue italic -mb-2">
                      {averageWithGhost.toFixed(1)}
                    </div>
                    <div className="text-[12px] text-neon-blue font-black uppercase tracking-[0.3em] opacity-40">
                      / 5.0
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-neon-yellow text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,217,0,0.5)] border-4 border-black group-hover/score:rotate-12 transition-transform">
                  <div className="w-6 h-6">{I.check}</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 transform hover:scale-125 transition-transform text-neon-yellow">
                      {I.star('good')}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-0.5 w-12 bg-neon-blue/20" />
                  <p className="text-[12px] text-white font-black tracking-[0.4em] uppercase opacity-40">
                    {hasRealReviews ? 'Satisfaction Protocol v2.1.0' : 'Sin reseñas · Baseline 5.0'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="w-full">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`w-16 h-16 rounded-[2rem] font-header font-black text-xl transition-all shadow-2xl border-2 ${p === 1 ? 'bg-neon-blue text-black border-neon-blue scale-110' : 'bg-black border-white/5 hover:border-white/20'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="grid grid-cols-1 gap-10">
          <AnimatePresence mode="popLayout">
            {reviews.map((rev) => (
              <motion.div
                key={rev.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative p-14 bg-black border-2 border-white/5 rounded-[5rem] hover:border-neon-blue/30 transition-all duration-1000 shadow-2xl flex flex-col md:flex-row gap-16 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-neon-blue/20 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 rounded-full blur-[120px]" />

                <div className="flex flex-col items-center gap-8 flex-shrink-0 min-w-[220px] relative z-10">
                  <div className="relative group/avatar cursor-pointer">
                    <div className="w-40 h-40 rounded-full border-4 border-neon-blue/10 p-2 transition-all duration-1000 group-hover/avatar:scale-110 shadow-2xl bg-black relative">
                      <div className="absolute inset-0 rounded-full border-2 border-neon-blue/30 animate-pulse" />
                      <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center font-header font-black text-5xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-20" style={{ backgroundImage: 'linear-gradient(to bottom right, #59b4ff, transparent)' }} />
                        <span className="relative z-10 text-neon-blue">{rev.author.charAt(0)}</span>
                      </div>
                    </div>
                    {rev.is_verified && (
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-black border-4 border-neon-blue rounded-full flex items-center justify-center shadow-2xl scale-100 transition-transform duration-700 text-neon-blue">
                        <div className="w-6 h-6">{I.check}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-header font-black text-white uppercase tracking-widest">{rev.author}</h4>
                    <p className="text-xs font-black uppercase tracking-[0.4em] opacity-30 text-neon-blue">@{rev.author.toLowerCase().replace(/\s/g, '')}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-10 relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-8">
                    <div className="flex items-center gap-10">
                      <div className="space-y-3">
                        <div className="flex gap-2 h-8">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="w-8 h-8 transition-all duration-500 text-neon-yellow drop-shadow-neon-blue">
                              {I.star('good')}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm font-header font-black tracking-[0.2em] italic text-neon-yellow">
                          {rev.rating.toFixed(1)} <span className="opacity-30">/ 5.0</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-blue/30 text-neon-blue font-header font-black text-sm uppercase tracking-widest">
                        {rev.platform}
                      </div>
                      {rev.is_verified && (
                        <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-cyan/30 text-neon-cyan font-header font-black text-sm uppercase tracking-widest">
                          Verificado
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative group/text">
                    <div className="absolute -left-8 top-0 w-1.5 h-full rounded-full bg-white/5 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-b opacity-50" style={{ backgroundImage: 'linear-gradient(to bottom, #59b4ff, transparent)' }} />
                    </div>
                    <p className="text-white font-header font-bold text-3xl md:text-5xl uppercase leading-[1.1] italic tracking-tight group-hover/text:translate-x-3 transition-transform duration-700">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-10 pt-4">
                    <div className="h-8 w-px bg-white/5" />
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-neon-blue/50" />
                      <span className="text-[11px] text-white/10 font-black uppercase tracking-[0.5em] italic">Transmisión Cifrada v2.1</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.section>

        <QuickDocks />

        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-12 pt-12">
          <div className="p-8 rounded-[3rem] bg-gradient-to-br from-neon-blue/10 via-transparent to-transparent border border-neon-blue/25 text-center">
            <h2 className="text-2xl font-header font-black text-white mb-2 uppercase tracking-tight">Confianza y Verificación</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              Verifica nuestra reputación en plataformas independientes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-green/30 text-neon-green font-header font-black text-sm uppercase tracking-widest">
                Trustpilot
              </div>
              <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-blue/30 text-neon-blue font-header font-black text-sm uppercase tracking-widest">
                Google Reviews
              </div>
              <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-purple/30 text-neon-purple font-header font-black text-sm uppercase tracking-widest">
                Discord Server
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
        </motion.section>
        <Script src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" strategy="lazyOnload" />
      </div>
    </div>
  );
}
