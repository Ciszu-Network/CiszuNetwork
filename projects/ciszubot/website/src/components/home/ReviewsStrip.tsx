'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@ciszu/ui';
import { supabase } from '@/config/supabase';
import { averageRating, formatRating, type ReviewRecord } from '@ciszunetwork/utils/reviews';
import { isEsLang, type Dict, type Lang } from '@/lib/i18n';
import Reveal from './Reveal';
import { track } from './track';

interface ReviewsStripProps {
  dict: Dict;
  lang: Lang;
}

/** Baseline documentado (legales): media con reseña fantasma 5.0. */
const GHOST_RATING = 5.0;

interface ReviewRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_anonymous: boolean | null;
  likes_count: number | null;
  created_at: string;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  username: string | null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${formatRating(rating)} / 5.0`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          width={16}
          height={16}
          fill={rating >= star - 0.5 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.8}
          className={rating >= star - 0.5 ? 'text-warn' : 'text-faint'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Reseñas REALES desde Supabase (misma tabla `reviews` de `/reviews`).
 * La media pública aplica el baseline 5.0 documentado en los términos; si no
 * hay reseñas se indica explícitamente (nunca se inventan opiniones).
 */
export default function ReviewsStrip({ dict, lang }: ReviewsStripProps) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('id, user_id, rating, comment, is_anonymous, likes_count, created_at')
          .order('created_at', { ascending: false })
          .limit(3);
        if (error) throw error;

        const rows = (Array.isArray(data) ? data : []) as ReviewRow[];
        const ids = Array.from(new Set(rows.map((row) => row.user_id))).filter(Boolean);
        const profiles: Record<string, ProfileRow> = {};
        if (ids.length > 0) {
          const { data: profileRows } = await supabase
            .from('profiles')
            .select('id, display_name, username')
            .in('id', ids);
          (Array.isArray(profileRows) ? (profileRows as ProfileRow[]) : []).forEach((profile) => {
            profiles[profile.id] = profile;
          });
        }

        if (!cancelled) {
          setReviews(rows.map((row) => ({ ...row, user_profile: profiles[row.user_id] ?? null })));
        }
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = reviews.length;
  const average = averageRating(reviews);
  const averageWithGhost =
    average === null ? GHOST_RATING : (average * total + GHOST_RATING) / (total + 1);
  const locale = isEsLang(lang) ? 'es-ES' : 'en-US';

  const nameOf = (review: ReviewRecord) => {
    if (review.is_anonymous) return 'ANON';
    return review.user_profile?.display_name?.trim() || review.user_profile?.username?.trim() || '—';
  };

  return (
    <section id="resenas" className="relative scroll-mt-20 py-16 border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        <Reveal className="text-center mb-10">
          <p className="text-neon-pink font-semibold uppercase tracking-[0.25em] text-xs mb-3">
            {dict.reviewsPage.subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-header font-bold text-ink">
            {dict.reviewsPage.title}
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="mx-auto max-w-5xl">
            {/* Resumen real (media + baseline) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 rounded-3xl border border-border bg-card p-8 mb-8">
              <div className="text-center">
                <div className="font-header text-5xl font-black italic text-neon-pink">
                  {formatRating(averageWithGhost)}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-faint mt-1">/ 5.0</div>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <Stars rating={averageWithGhost} />
                <p className="text-xs font-black uppercase tracking-widest text-muted">
                  <span className="text-ink tabular-nums">{total}</span> {dict.nav.reviews} · BASELINE 5.0
                </p>
                <Link
                  href="/reviews"
                  onClick={() => track('reviews_page_click', { from: 'home' })}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neon-pink hover:gap-3 transition-all"
                >
                  {dict.nav.reviews}
                  <Icon name="chevronRight" size={14} />
                </Link>
              </div>
            </div>

            {/* Últimas reseñas reales */}
            {loading ? (
              <p className="py-10 text-center text-xs font-black uppercase tracking-[0.3em] text-faint">
                {dict.reviewsPage.title}…
              </p>
            ) :
              total === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center">
                <Icon name="star" size={28} className="mx-auto mb-3 text-warn" />
                <p className="text-sm font-bold text-muted">
                  0 {dict.nav.reviews} · BASELINE 5.0
                </p>
                <Link
                  href="/reviews"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-neon-pink px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-105"
                >
                  <Icon name="edit" size={14} />
                  {dict.nav.reviews}
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neon-pink/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Stars rating={review.rating} />
                      <span className="font-header text-sm font-black text-neon-pink">
                        {formatRating(review.rating)}
                      </span>
                    </div>
                    <p className="flex-1 text-sm text-muted italic leading-relaxed mb-4 line-clamp-4">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <div className="flex items-center justify-between border-t border-border pt-3 text-[10px] font-black uppercase tracking-widest text-faint">
                      <span className="text-ink truncate max-w-[60%]">{nameOf(review)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="heart" size={11} className="text-neon-pink" />
                        <span className="tabular-nums">{review.likes_count ?? 0}</span>
                      </span>
                    </div>
                    <time className="mt-2 text-[9px] font-bold uppercase tracking-widest text-faint">
                      {new Date(review.created_at).toLocaleDateString(locale, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </article>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
