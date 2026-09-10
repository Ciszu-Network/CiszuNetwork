'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@ciszu/ui';
import Script from 'next/script';
import QuickDocks from '@/components/molecules/QuickDocks';
import { usePageTitle } from '@/lib/usePageTitle';
import Link from 'next/link';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import { useAppStore } from '@/store';

const GHOST_RATING = 5.0;
const PAGE_SIZE = 10;

const STATIC_REVIEWS = [
  {
    id: 'antony-1',
    platform: 'Trustpilot',
    rating: 5.0,
    text: 'El portfolio de Ciszuko Antony es impresionante. Gran atención al detalle y profesionalismo.',
    author: 'Cliente verificado',
    is_verified: true,
    created_at: '2026-08-01T12:00:00.000Z',
    likes: 0,
    liked: false,
  },
  {
    id: 'antony-2',
    platform: 'Discord',
    rating: 5.0,
    text: 'Comunidad increíble y contenido de alta calidad. Muy recomendado.',
    author: 'Miembro activo',
    is_verified: false,
    created_at: '2026-08-10T12:00:00.000Z',
    likes: 0,
    liked: false,
  },
  {
    id: 'antony-3',
    platform: 'Google Reviews',
    rating: 4.5,
    text: 'Excelente trabajo en multimedia y branding. Totalmente recomendado.',
    author: 'Usuario web',
    is_verified: true,
    created_at: '2026-08-15T12:00:00.000Z',
    likes: 0,
    liked: false,
  },
];

type Review = typeof STATIC_REVIEWS[number];

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const I = {
  star: (fillType = 'good') => (
    <div className="w-full h-full relative">
      <svg viewBox="0 0 24 24" className="w-full h-full" stroke="none">
        <defs>
          <linearGradient id="grad-good" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4800ff" />
            <stop offset="100%" stopColor="#8000ff" />
          </linearGradient>
          <linearGradient id="half-good" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#4800ff" />
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
  const { user } = useAppStore();
  const [reviews] = useState<Review[]>(() => STATIC_REVIEWS);
  const [page, setPage] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState('');
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageReviews = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return reviews.slice(start, start + PAGE_SIZE);
  }, [reviews, currentPage]);
  const reviewsCount = reviews.length;
  const averageWithGhost = reviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) + GHOST_RATING) / (reviewsCount + 1)
    : GHOST_RATING;
  const hasRealReviews = reviewsCount > 0;

  const handleActionRequiresAuth = useCallback((actionName: string) => {
    setAuthAction(actionName);
    setShowAuthModal(true);
  }, []);

  const handleLike = useCallback((reviewId: string) => {
    if (!user) {
      handleActionRequiresAuth('like');
      return;
    }
  }, [handleActionRequiresAuth, user]);

  const buildDots = () => {
    const total = totalPages;
    const current = currentPage;
    const pages: (number | 'left-more' | 'right-more')[] = [];
    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      pages.push(0);
      if (current > 3) pages.push('left-more');
      const start = Math.max(1, current - 1);
      const end = Math.min(total - 2, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 4) pages.push('right-more');
      pages.push(total - 1);
    }
    return pages;
  };

  const goTo = (idx: number) => setPage(idx);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-purple/5 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-neon-purple to-brand-200 bg-clip-text text-transparent mb-4">
            REVIEWS
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">
            Reseñas y valoraciones / Reviews and ratings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-[3rem] bg-gradient-to-br from-neon-purple/10 via-transparent to-transparent border border-neon-purple/25 text-center mb-8 relative overflow-hidden group"
        >
          <div className="absolute -top-10 -left-10 w-60 h-60 bg-neon-purple/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-neon-purple/10 flex items-center justify-center shadow-[0_0_80px_rgba(128,0,255,0.15)] bg-black transition-transform group-hover:scale-110 duration-500">
                <div className="text-center">
                  <div className="text-5xl font-header font-black text-neon-purple drop-shadow-neon-purple italic -mb-2">
                    {averageWithGhost.toFixed(1)}
                  </div>
                  <div className="text-[12px] text-neon-purple font-black uppercase tracking-[0.3em] opacity-40">
                    / 5.0
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-neon-yellow text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,217,0,0.5)] border-4 border-black group-hover:rotate-12 transition-transform">
                <div className="w-6 h-6">{I.check}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 text-neon-yellow drop-shadow-neon-purple">
                  {I.star('good')}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/40 font-black uppercase tracking-[0.4em]">
              {hasRealReviews ? 'Satisfaction Protocol v2.1.0' : 'Sin reseñas · Baseline 5.0'}
            </p>
            <p className="text-xs text-white/20">
              {hasRealReviews
                ? `Baseline + ${reviewsCount} review${reviewsCount !== 1 ? 's' : ''}`
                : 'No user reviews to analyze — showing baseline 5.0'}
            </p>
            <Link href="/reviews/new" className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-header font-black uppercase tracking-widest text-xs shadow-lg hover:scale-105 active:scale-95 transition-all">
              Escribir reseña
            </Link>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={sectionVariants} className="grid grid-cols-1 gap-10">
          <AnimatePresence mode="popLayout">
            {pageReviews.map((rev, i) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-10 bg-black border-2 border-white/5 rounded-[4rem] hover:border-neon-purple/30 transition-all duration-1000 shadow-2xl flex flex-col gap-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-neon-purple/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="w-6 h-6 text-neon-yellow drop-shadow-neon-purple">
                          {I.star('good')}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-header font-black text-neon-purple italic">
                      {rev.rating.toFixed(1)} <span className="opacity-30">/ 5.0</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-5 py-2 rounded-2xl bg-black border-2 border-neon-purple/30 text-neon-purple font-header font-black text-xs uppercase tracking-widest">
                      {rev.platform}
                    </div>
                    {rev.is_verified && (
                      <div className="px-5 py-2 rounded-2xl bg-black border-2 border-neon-cyan/30 text-neon-cyan font-header font-black text-xs uppercase tracking-widest">
                        Verificado
                      </div>
                    )}
                    <button
                      onClick={() => handleLike(rev.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[11px] font-header font-black uppercase tracking-widest transition-all bg-white/5 border-white/10 text-white/70 hover:border-neon-purple/30 hover:text-neon-purple"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {rev.likes ?? 0}
                    </button>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="absolute -left-4 top-0 w-1.5 h-full rounded-full bg-neon-purple/30 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-b from-neon-purple to-transparent opacity-50" />
                  </div>
                  <p className="text-white font-header font-bold text-2xl md:text-3xl uppercase leading-[1.1] italic tracking-tight pl-4">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-6">
                  <p className="text-sm font-black text-white/60 uppercase tracking-widest">{rev.author}</p>
                  <div className="h-4 w-px bg-white/5" />
                  <p className="text-xs text-white/20 font-black uppercase tracking-[0.5em] italic">
                    Ciszuko Antony
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10 mb-12">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 0}
            className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white/70 hover:border-neon-purple/30 hover:text-neon-purple disabled:opacity-30 flex items-center justify-center transition-all"
          >
            ‹
          </button>
          {buildDots().map((p, idx) => {
            if (p === 'left-more' || p === 'right-more') {
              return <span key={`${p}-${idx}`} className="text-[10px] text-white/30 font-black tracking-widest px-1">…</span>;
            }
            const pageIdx = p as number;
            const isActive = pageIdx === currentPage;
            return (
              <button
                key={pageIdx}
                onClick={() => goTo(pageIdx)}
                className={`h-10 min-w-[40px] rounded-full border text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-neon-purple text-white border-neon-purple' : 'bg-white/5 border-white/10 text-white/70 hover:border-neon-purple/30 hover:text-neon-purple'}`}
              >
                {pageIdx + 1}
              </button>
            );
          })}
          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white/70 hover:border-neon-purple/30 hover:text-neon-purple disabled:opacity-30 flex items-center justify-center transition-all"
          >
            ›
          </button>
        </div>

        <QuickDocks />

        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-12 pt-12">
          <div className="p-8 rounded-[3rem] bg-gradient-to-br from-neon-purple/10 via-transparent to-transparent border border-neon-purple/25 text-center">
            <h2 className="text-2xl font-header font-black text-white mb-2 uppercase tracking-tight">Confianza y Verificación</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
              Verifica la reputación de Ciszuko Antony en plataformas independientes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="px-6 py-3 rounded-2xl bg-black border-2 border-neon-green/30 text-neon-green font-header font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(74,222,128,0.15)]">
                Trustpilot
              </div>
              <div className="px-6 py-3 rounded-2xl bg-black border-2 border-[#5865F2]/30 text-[#5865F2] font-header font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(88,101,242,0.15)]">
                Discord Server
              </div>
            </div>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-6">
              Verified by community · Trusted by creators · Powered by Ciszuko Antony
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

      {showAuthModal && (
        <AuthWarningModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} message={`Necesitas una cuenta para ${authAction || 'interactuar en esta sección'}.`} />
      )}
    </div>
  );
}
