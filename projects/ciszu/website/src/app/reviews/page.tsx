'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import QuickDocks from '@/components/molecules/QuickDocks';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import { useAppStore } from '@/store';
import { supabase } from '@/config/supabase';
import {
  REVIEWS_PAGE_SIZE,
  averageRating,
  buildPageWindow,
  deriveReviewTags,
  filterReviews,
  formatRating,
  paginateReviews,
  sortReviews,
  type ReviewRecord,
  type ReviewSortKey,
  type ReviewTag,
  type SortOrder,
} from '@ciszunetwork/utils/reviews';

/* ============================================================
 * CONFIGURACIÓN DEL SITIO
 * ------------------------------------------------------------
 * Este es el ÚNICO bloque que cambia entre webs. Los demás
 * archivos los genera `scripts/apply-reviews-pages.js` a partir
 * de este, así que mantén la forma exacta del objeto.
 * ============================================================ */
const SITE = {
  entity: 'Ciszunetwork',
  subtitle: 'Calibrando la experiencia global',
  domain: 'ciszunetwork.vercel.app',
  /** Ruta base del perfil público ('' = esta web no tiene perfiles). */
  profileBase: '',
  /** Color de acento propio de la web. */
  accent: '#59b4ff',
  accentSoft: '#00d4ff',
};

const GHOST_RATING = 5.0;
const DISCORD_INVITE = 'https://discord.gg/W3kMtMMj6E';
const TRUSTPILOT_BUSINESS_UNIT = '6a7be8beb27b048803166c8f';
const TRUSTPILOT_TOKEN = '62a9715c-b305-4cb7-a9cf-629a5cc67f63';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PLATFORMS: { label: string; href: string; accent: string }[] = [
  {
    label: 'Trustpilot',
    href: `https://www.trustpilot.com/review/${SITE.domain}`,
    accent: '#00b67a',
  },
  {
    label: 'Google Reviews',
    href: `https://www.google.com/search?q=${encodeURIComponent(`${SITE.entity} Ciszuko Antony reseñas`)}`,
    accent: '#4285f4',
  },
  { label: 'Discord', href: DISCORD_INVITE, accent: '#5865f2' },
];

interface ReviewRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_anonymous: boolean | null;
  is_verified: boolean | null;
  likes_count: number | null;
  is_edited: boolean | null;
  created_at: string;
  updated_at: string | null;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

type SessionUser = { id?: string | null; role?: string | null } | null;

/* ------------------------------------------------------------
 * Helpers de presentación
 * ---------------------------------------------------------- */

/** Color de las estrellas según la nota (sube de brillo con la nota). */
function ratingColor(rating: number): string {
  if (rating >= 4.5) return '#ffd900';
  if (rating >= 3.5) return '#00e08a';
  if (rating >= 2.5) return '#ff8a00';
  return '#ff3b57';
}

function displayNameOf(review: ReviewRecord): string {
  if (review.is_anonymous) return 'CIUDADANO ANÓNIMO';
  return review.user_profile?.display_name?.trim() || 'USUARIO ANÓNIMO';
}

function usernameOf(review: ReviewRecord): string | null {
  if (review.is_anonymous) return null;
  const username = review.user_profile?.username?.trim();
  return username ? `@${username}` : null;
}

function profileHrefOf(review: ReviewRecord): string | null {
  if (!SITE.profileBase || review.is_anonymous) return null;
  const username = review.user_profile?.username?.trim();
  if (!username) return null;
  return `${SITE.profileBase}/${encodeURIComponent(username)}`;
}

function formatReviewDate(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return '—';
  return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TAG_LABELS: Record<ReviewTag, string> = {
  verified: 'Verificada',
  positive: 'Sentimiento positivo',
  negative: 'Sentimiento negativo',
};

/* ------------------------------------------------------------
 * Piezas de UI
 * ---------------------------------------------------------- */

function Star({
  fill,
  color,
  size = 20,
  dim = false,
}: {
  fill: number;
  color: string;
  size?: number;
  dim?: boolean;
}) {
  const rawId = React.useId();
  const gradientId = `star-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const pct = Math.round(Math.min(1, Math.max(0, fill)) * 100);
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="100%" y2="0">
          <stop offset={`${pct}%`} stopColor={color} />
          <stop offset={`${pct}%`} stopColor="rgba(255,255,255,0.12)" />
        </linearGradient>
      </defs>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={`url(#${gradientId})`}
        style={{ filter: dim ? 'none' : `drop-shadow(0 0 5px ${color}55)` }}
      />
    </svg>
  );
}

function StarRow({ rating, size = 18 }: { rating: number; size?: number }) {
  const color = ratingColor(rating);
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${formatRating(rating)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          fill={rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0}
          color={color}
          size={size}
          dim={rating < star - 0.5}
        />
      ))}
    </div>
  );
}

function RatingPicker({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const color = ratingColor(value);
  const pick = (star: number, clientX: number, rect: DOMRect) => {
    const pct = rect.width > 0 ? (clientX - rect.left) / rect.width : 1;
    const next = star - 1 + (pct > 0.5 ? 1 : 0.5);
    onChange(Math.max(0, Math.min(5, next)));
  };
  return (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
          onMouseMove={(event) => pick(star, event.clientX, event.currentTarget.getBoundingClientRect())}
          onClick={(event) => pick(star, event.clientX, event.currentTarget.getBoundingClientRect())}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onChange(star);
            }
          }}
          className="rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <Star
            fill={value >= star ? 1 : value >= star - 0.5 ? 0.5 : 0}
            color={color}
            size={34}
            dim={value < star - 0.5}
          />
        </button>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
      style={{
        borderColor: active ? accent : 'rgba(255,255,255,0.12)',
        color: active ? accent : 'rgba(255,255,255,0.55)',
        background: active ? `${accent}1f` : 'rgba(255,255,255,0.03)',
      }}
    >
      {children}
    </button>
  );
}

/** Wrapper de página (uno por web). */
function Shell({ children }: { children: React.ReactNode }) {
  return <div className="relative min-h-screen px-4 pb-24 pt-28">{children}</div>;
}

/* ------------------------------------------------------------
 * Página
 * ---------------------------------------------------------- */

export default function ReviewsPage() {
  const storeUser = useAppStore((state: { user?: unknown }) => state.user) as unknown as SessionUser;
  const userId = storeUser?.id && UUID_RE.test(storeUser.id) ? storeUser.id : null;
  const isAdmin = String(storeUser?.role ?? '').toLowerCase() === 'admin';

  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [myReview, setMyReview] = useState<ReviewRow | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());

  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxRating, setMaxRating] = useState<number | null>(null);
  const [onlyLikes, setOnlyLikes] = useState(false);
  const [onlyMine, setOnlyMine] = useState(false);
  const [sortKey, setSortKey] = useState<ReviewSortKey>('recent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formAnon, setFormAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [authAction, setAuthAction] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const requireAuth = useCallback((action: string) => {
    setAuthAction(action);
    setIsAuthOpen(true);
  }, []);

  /* ---------------- carga de datos ---------------- */

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (fetchError) throw fetchError;

      const rows = (Array.isArray(data) ? data : []) as ReviewRow[];
      const ids = Array.from(new Set(rows.map((row) => row.user_id))).filter(Boolean);

      const profiles: Record<string, ProfileRow> = {};
      if (ids.length > 0) {
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url')
          .in('id', ids);
        (Array.isArray(profileRows) ? (profileRows as ProfileRow[]) : []).forEach((profile) => {
          profiles[profile.id] = profile;
        });
      }

      setReviews(rows.map((row) => ({ ...row, user_profile: profiles[row.user_id] ?? null })));
      setError(null);
    } catch (fetchError) {
      setReviews([]);
      setError(
        fetchError instanceof Error && fetchError.message
          ? fetchError.message
          : 'No se pudieron cargar las reseñas. Inténtalo de nuevo.',
      );
    } finally {
      setNow(Date.now());
      setLoading(false);
    }
  }, []);

  const loadMine = useCallback(async (id: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('user_id', id).maybeSingle();
    setMyReview((data as ReviewRow | null) ?? null);
    const { data: likes } = await supabase.from('review_likes').select('review_id').eq('user_id', id);
    setLikedIds(new Set((Array.isArray(likes) ? likes : []).map((row: { review_id: string }) => row.review_id)));
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (userId) void loadMine(userId);
    else {
      setMyReview(null);
      setLikedIds(new Set());
    }
  }, [userId, loadMine]);

  useEffect(() => {
    if (myReview) {
      setFormRating(Number(myReview.rating) || 5);
      setFormComment(myReview.comment ?? '');
      setFormAnon(!!myReview.is_anonymous);
    } else {
      setFormRating(5);
      setFormComment('');
      setFormAnon(false);
    }
  }, [myReview]);

  /* ---------------- filtros / orden / paginación ---------------- */

  const filtered = useMemo(
    () =>
      filterReviews(
        reviews,
        { query, tags, minRating, maxRating, onlyWithLikes: onlyLikes, onlyMine },
        { userId, now },
      ),
    [reviews, query, tags, minRating, maxRating, onlyLikes, onlyMine, userId, now],
  );

  const sorted = useMemo(() => sortReviews(filtered, sortKey, sortOrder, now), [filtered, sortKey, sortOrder, now]);

  const paged = useMemo(() => paginateReviews(sorted, page, REVIEWS_PAGE_SIZE), [sorted, page]);

  const pageWindow = useMemo(
    () => buildPageWindow(paged.page, paged.totalPages),
    [paged.page, paged.totalPages],
  );

  useEffect(() => {
    setPage(0);
  }, [query, tags, minRating, maxRating, onlyLikes, onlyMine, sortKey, sortOrder]);

  const totalReviews = reviews.length;
  const average = averageRating(reviews);
  const averageWithGhost =
    average === null ? GHOST_RATING : (average * totalReviews + GHOST_RATING) / (totalReviews + 1);
  const hasRealReviews = totalReviews > 0;

  const activeFilters =
    (query.trim() ? 1 : 0) +
    tags.length +
    (minRating !== null || maxRating !== null ? 1 : 0) +
    (onlyLikes ? 1 : 0) +
    (onlyMine ? 1 : 0);

  const clearFilters = () => {
    setQuery('');
    setTags([]);
    setMinRating(null);
    setMaxRating(null);
    setOnlyLikes(false);
    setOnlyMine(false);
  };

  const toggleTag = (tag: ReviewTag) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));

  const toggleStarFilter = (value: number) => {
    if (minRating === value && maxRating === null) {
      setMinRating(null);
      return;
    }
    setMinRating(value);
    setMaxRating(null);
  };

  /* ---------------- acciones ---------------- */

  const handleLike = useCallback(
    async (reviewId: string) => {
      if (!userId) {
        requireAuth('dar me gusta a una reseña');
        return;
      }
      setActionError(null);
      const alreadyLiked = likedIds.has(reviewId);
      const { error: likeError } = alreadyLiked
        ? await supabase.from('review_likes').delete().eq('user_id', userId).eq('review_id', reviewId)
        : await supabase.from('review_likes').insert({ user_id: userId, review_id: reviewId });
      if (likeError) {
        setActionError(likeError.message);
        return;
      }
      await loadReviews();
      await loadMine(userId);
    },
    [userId, likedIds, requireAuth, loadReviews, loadMine],
  );

  const handleDelete = useCallback(
    async (reviewId: string) => {
      if (!userId) {
        requireAuth('eliminar una reseña');
        return;
      }
      setActionError(null);
      const { error: deleteError } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (deleteError) {
        setActionError(deleteError.message);
        return;
      }
      setConfirmDeleteId(null);
      await loadReviews();
      await loadMine(userId);
    },
    [userId, requireAuth, loadReviews, loadMine],
  );

  const handleSubmit = useCallback(async () => {
    if (!userId) {
      setIsModalOpen(false);
      requireAuth('publicar una reseña');
      return;
    }
    if (formComment.trim().length < 10) {
      setFormError('El comentario debe tener al menos 10 caracteres.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const payload = {
      user_id: userId,
      rating: Number(formRating.toFixed(1)),
      comment: formComment.trim(),
      is_anonymous: formAnon,
      updated_at: new Date().toISOString(),
    };
    const result = myReview
      ? await supabase.from('reviews').update(payload).eq('id', myReview.id)
      : await supabase.from('reviews').insert(payload);
    setSubmitting(false);
    if (result.error) {
      setFormError(result.error.message);
      return;
    }
    setIsModalOpen(false);
    await loadReviews();
    await loadMine(userId);
  }, [userId, formComment, formRating, formAnon, myReview, requireAuth, loadReviews, loadMine]);

  const openComposer = () => {
    if (!userId) {
      requireAuth('publicar una reseña');
      return;
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const canDelete = (review: ReviewRecord) => isAdmin || (!!userId && review.user_id === userId);

  /* ---------------- render ---------------- */

  return (
    <Shell>
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full blur-[220px]"
        style={{ background: `${SITE.accent}14` }}
      />

      <div className="mx-auto max-w-5xl space-y-10">
        {/* HERO */}
        <header className="space-y-3 pt-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="h-10 w-10">
              <Star fill={1} color={SITE.accent} size={40} />
            </div>
            <h1
              className="bg-clip-text font-header text-4xl font-black uppercase leading-none tracking-tighter text-transparent md:text-6xl"
              style={{ backgroundImage: `linear-gradient(to right, ${SITE.accent}, #ffffff)` }}
            >
              RESEÑAS
            </h1>
          </div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.4em] md:text-xs"
            style={{ color: SITE.accent }}
          >
            {SITE.subtitle}
          </p>
        </header>

        {/* RESUMEN */}
        <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-black p-10">
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full blur-[90px]"
            style={{ background: `${SITE.accent}22` }}
          />
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-12 text-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border-8 bg-black" style={{ borderColor: `${SITE.accent}22` }}>
              <div className="text-center">
                <div className="font-header text-5xl font-black italic" style={{ color: SITE.accent }}>
                  {formatRating(averageWithGhost)}
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">/ 5.0</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {(hasRealReviews ? [1, 2, 3, 4, 5].map(() => averageWithGhost) : [5, 5, 5, 5, 5]).map((value, index) => (
                  <Star key={index} fill={hasRealReviews ? Math.min(1, Math.max(0.5, value / 5)) : 1} color={hasRealReviews ? ratingColor(averageWithGhost) : SITE.accent} size={26} />
                ))}
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/45">
                {hasRealReviews
                  ? `Baseline 5.0 + ${totalReviews} ${totalReviews === 1 ? 'reseña real' : 'reseñas reales'}`
                  : 'Sin reseñas todavía · Baseline 5.0'}
              </p>
              <p className="mx-auto max-w-md text-xs text-white/35">
                Solo mostramos reseñas reales de usuarios registrados. No generamos ni publicamos reseñas de ejemplo.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={openComposer}
                className="rounded-2xl border-2 px-8 py-4 font-header text-sm font-black uppercase tracking-[0.2em] transition-transform hover:scale-105 active:scale-95"
                style={{ borderColor: `${SITE.accent}66`, color: SITE.accent, background: '#000' }}
              >
                {myReview ? 'Editar mi reseña' : 'Escribir reseña'}
              </button>
            </div>
          </div>
        </section>

        {/* CONTROLES */}
        <section className="space-y-5 rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por comentario, nombre o @usuario…"
              aria-label="Buscar reseñas"
              className="h-11 min-w-[240px] flex-1 rounded-2xl border border-white/10 bg-black px-4 text-sm text-white placeholder:text-white/25 focus:border-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-black px-4 text-[11px] font-black uppercase tracking-widest text-white/60 transition-colors hover:text-white"
              title={sortOrder === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={sortOrder === 'desc' ? '' : 'rotate-180'}>
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
              {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Orden</span>
            {(  [
              { key: 'relevance', label: 'Relevancia' },
              { key: 'recent', label: 'Recientes' },
              { key: 'rating', label: 'Estrellas' },
              { key: 'likes', label: 'Likes' },
              { key: 'popularity', label: 'Popularidad' },
            ] as { key: ReviewSortKey; label: string }[]
            ).map((option) => (
              <Chip key={option.key} active={sortKey === option.key} onClick={() => setSortKey(option.key)} accent={SITE.accent}>
                {option.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Filtros</span>
            {(Object.keys(TAG_LABELS) as ReviewTag[]).map((tag) => (
              <Chip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)} accent={SITE.accent}>
                {TAG_LABELS[tag]}
              </Chip>
            ))}
            {[
              { value: 5, label: '5★' },
              { value: 4, label: '4★ o más' },
              { value: 3, label: '3★ o más' },
            ].map((option) => (
              <Chip key={option.value} active={minRating === option.value} onClick={() => toggleStarFilter(option.value)} accent={SITE.accent}>
                {option.label}
              </Chip>
            ))}
            <Chip active={maxRating === 2} onClick={() => { setMinRating(null); setMaxRating(maxRating === 2 ? null : 2); }} accent={SITE.accent}>
              2★ o menos
            </Chip>
            <Chip active={onlyLikes} onClick={() => setOnlyLikes((prev) => !prev)} accent={SITE.accent}>
              Con likes
            </Chip>
            {userId && (
              <Chip active={onlyMine} onClick={() => setOnlyMine((prev) => !prev)} accent={SITE.accent}>
                Solo las mías
              </Chip>
            )}
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 transition-colors hover:text-white"
              >
                Limpiar todo ({activeFilters})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">
              {loading
                ? 'Cargando reseñas…'
                : sorted.length === 0
                  ? 'Sin resultados'
                  : `Mostrando ${paged.from}–${paged.to} de ${paged.totalItems}`}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
              {paged.totalPages} {paged.totalPages === 1 ? 'página' : 'páginas'} · 10 por página
            </p>
          </div>
        </section>

        {/* ERROR DE ACCIÓN */}
        {actionError && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-red-300">
            {actionError}
          </p>
        )}

        {/* LISTA */}
        <section className="space-y-6">
          {loading ? (
            <div className="py-24 text-center text-sm font-black uppercase tracking-[0.4em] text-white/40">
              Sincronizando reseñas…
            </div>
          ) : error ? (
            <div className="rounded-[3rem] border-2 border-dashed border-amber-400/30 bg-black p-12 text-center">
              <h2 className="font-header text-2xl font-black uppercase tracking-tight text-white">
                No se pudieron cargar las reseñas
              </h2>
              <p className="mt-3 text-sm text-white/45">{error}</p>
              <button
                type="button"
                onClick={() => void loadReviews()}
                className="mt-6 rounded-2xl border-2 px-6 py-3 text-xs font-black uppercase tracking-widest"
                style={{ borderColor: `${SITE.accent}66`, color: SITE.accent }}
              >
                Reintentar
              </button>
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-[3rem] border-2 border-dashed border-white/15 bg-black p-12 text-center">
              <div className="mx-auto mb-5 h-14 w-14">
                <Star fill={1} color={`${SITE.accent}80`} size={56} />
              </div>
              <h2 className="font-header text-2xl font-black uppercase tracking-tight text-white">
                {totalReviews === 0 ? 'Ninguna reseña subida aún' : 'Ninguna reseña coincide con los filtros'}
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-white/45">
                {totalReviews === 0
                  ? `Sé el primero en reseñar ${SITE.entity}.`
                  : 'Prueba a limpiar los filtros o cambiar la búsqueda.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={openComposer}
                  className="rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-black"
                  style={{ background: SITE.accent }}
                >
                  {totalReviews === 0 ? 'Escribir la primera reseña' : 'Escribir reseña'}
                </button>
                {activeFilters > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-2xl border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-widest text-white/60"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          ) : (
            paged.items.map((review) => {
              const color = ratingColor(review.rating);
              const reviewTags = deriveReviewTags(review, now);
              const href = profileHrefOf(review);
              const liked = likedIds.has(review.id);
              const anonymous = !!review.is_anonymous;
              const name = displayNameOf(review);
              const username = usernameOf(review);

              const avatar = (
                <div
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 bg-black font-header text-xl font-black"
                  style={{ borderColor: `${color}55`, color }}
                >
                  {!anonymous && review.user_profile?.avatar_url ? (
                    <img
                      src={review.user_profile.avatar_url}
                      alt={name}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span>{anonymous ? '?' : name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              );

              return (
                <article
                  key={review.id}
                  className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black p-7 transition-colors hover:border-white/20"
                >
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex shrink-0 flex-col items-center gap-3 md:w-44">
                      {href ? (
                        <Link href={href} className="transition-transform hover:scale-105" aria-label={`Ver perfil de ${name}`}>
                          {avatar}
                        </Link>
                      ) : (
                        avatar
                      )}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <h3 className="font-header text-sm font-black uppercase tracking-widest text-white">{name}</h3>
                          {(review.is_verified || reviewTags.includes('verified')) && (
                            <span
                              title="Reseña verificada"
                              aria-label="Reseña verificada"
                              className="inline-flex h-4 w-4 items-center justify-center rounded-full"
                              style={{ background: '#00b67a' }}
                            >
                              <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="#000" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          )}
                        </div>
                        {username && <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-white/35">{username}</p>}
                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
                          {formatReviewDate(review.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <StarRow rating={review.rating} />
                        <span className="font-header text-sm font-black italic" style={{ color }}>
                          {formatRating(review.rating)} <span className="text-white/30">/ 5.0</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {reviewTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest"
                              style={{
                                borderColor: tag === 'verified' ? '#00b67a66' : tag === 'positive' ? '#00e08a55' : '#ff3b5755',
                                color: tag === 'verified' ? '#00b67a' : tag === 'positive' ? '#00e08a' : '#ff3b57',
                              }}
                            >
                              {TAG_LABELS[tag]}
                            </span>
                          ))}
                          {review.is_edited && (
                            <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white/35">
                              Editada
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="border-l-2 pl-4 font-header text-lg font-bold italic leading-snug text-white/90" style={{ borderColor: `${color}66` }}>
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <button
                          type="button"
                          onClick={() => void handleLike(review.id)}
                          aria-pressed={liked}
                          className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
                          style={{
                            borderColor: liked ? `${SITE.accentSoft}88` : 'rgba(255,255,255,0.12)',
                            color: liked ? SITE.accentSoft : 'rgba(255,255,255,0.5)',
                            background: liked ? `${SITE.accentSoft}1a` : 'transparent',
                          }}
                        >
                          <svg viewBox="0 0 24 24" width={14} height={14} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {review.likes_count ?? 0} likes
                        </button>

                        {canDelete(review) &&
                          (confirmDeleteId === review.id ? (
                            <span className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void handleDelete(review.id)}
                                className="rounded-2xl border border-red-500/50 bg-red-500/15 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-300"
                              >
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-2xl border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/40"
                              >
                                Cancelar
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(review.id)}
                              className="rounded-2xl border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/35 transition-colors hover:border-red-500/40 hover:text-red-300"
                            >
                              {isAdmin && review.user_id !== userId ? 'Eliminar (admin)' : 'Eliminar'}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* PAGINACIÓN (abajo, estilo índice) */}
        {!loading && !error && (
          <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Paginación de reseñas">
            {pageWindow.showFirst && (
              <button
                type="button"
                onClick={() => setPage(0)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:text-white"
                aria-label="Primera página"
                title="Primera página"
              >
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m11 17-5-5 5-5" />
                  <path d="m18 17-5-5 5-5" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={!pageWindow.hasPrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:text-white disabled:opacity-25"
              aria-label="Página anterior"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {pageWindow.pages.map((pageIndex) => {
              const active = pageIndex === pageWindow.page;
              return (
                <button
                  key={pageIndex}
                  type="button"
                  onClick={() => setPage(pageIndex)}
                  aria-current={active ? 'page' : undefined}
                  className="h-10 min-w-[40px] rounded-full border text-xs font-black transition-all"
                  style={{
                    borderColor: active ? SITE.accent : 'rgba(255,255,255,0.1)',
                    background: active ? SITE.accent : 'rgba(255,255,255,0.03)',
                    color: active ? '#000' : 'rgba(255,255,255,0.55)',
                  }}
                >
                  {pageIndex + 1}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(pageWindow.totalPages - 1, prev + 1))}
              disabled={!pageWindow.hasNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:text-white disabled:opacity-25"
              aria-label="Página siguiente"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            {pageWindow.showLast && (
              <button
                type="button"
                onClick={() => setPage(pageWindow.totalPages - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/50 transition-colors hover:text-white"
                aria-label="Última página"
                title="Última página"
              >
                <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m13 17 5-5-5-5" />
                  <path d="m6 17 5-5-5-5" />
                </svg>
              </button>
            )}
          </nav>
        )}

        <QuickDocks />

        {/* CONFIANZA Y VERIFICACIÓN */}
        <section className="space-y-6 rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-10 text-center">
          <div className="space-y-2">
            <h2 className="font-header text-2xl font-black uppercase tracking-tight text-white">
              Confianza y Verificación
            </h2>
            <p className="mx-auto max-w-xl text-sm text-white/45">
              {SITE.entity} forma parte de Ciszu Network. Verifica nuestra reputación en plataformas independientes:
              los botones abren el perfil real de cada plataforma.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {PLATFORMS.map((platform) => (
              <a
                key={platform.label}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border-2 bg-black px-6 py-3 font-header text-sm font-black uppercase tracking-widest transition-transform hover:scale-105"
                style={{ borderColor: `${platform.accent}55`, color: platform.accent }}
              >
                {platform.label}
              </a>
            ))}
          </div>

          <div className="flex justify-center">
            <div
              className="trustpilot-widget"
              data-locale="es-ES"
              data-template-id="56278e9abfbbba0bdcd568bc"
              data-businessunit-id={TRUSTPILOT_BUSINESS_UNIT}
              data-style-height="52px"
              data-style-width="100%"
              data-theme="dark"
              data-token={TRUSTPILOT_TOKEN}
            >
              <a href={`https://www.trustpilot.com/review/${SITE.domain}`} target="_blank" rel="noopener noreferrer">
                Trustpilot
              </a>
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
            Verified by community · Trusted by users · Powered by Ciszuko Antony
          </p>
        </section>
      </div>

      {/* MODAL DE RESEÑA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={myReview ? 'Editar reseña' : 'Nueva reseña'}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2.5rem] border-2 border-white/10 bg-black p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-header text-2xl font-black uppercase italic tracking-tight text-white">
                  {myReview ? 'Actualizar reseña' : 'Nueva reseña'}
                </h2>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                  Solo se permite una reseña por usuario
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Cerrar"
                className="rounded-xl border border-white/10 p-2 text-white/40 transition-colors hover:text-white"
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/35">Calificación final</p>
                <p className="font-header text-3xl font-black italic" style={{ color: ratingColor(formRating) }}>
                  {formatRating(formRating)} <span className="text-lg text-white/25">/ 5.0</span>
                </p>
                <RatingPicker value={formRating} onChange={setFormRating} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
                  Puedes elegir medias estrellas (2.5, 3.5, 4.5…)
                </p>
              </div>

              <textarea
                value={formComment}
                onChange={(event) => setFormComment(event.target.value)}
                placeholder="Cuenta tu experiencia con el proyecto…"
                rows={6}
                className="w-full resize-none rounded-[2rem] border-2 border-white/10 bg-white/[0.02] p-6 text-sm text-white placeholder:text-white/20 focus:border-white/25 focus:outline-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setFormAnon((prev) => !prev)}
                  aria-pressed={formAnon}
                  className="rounded-2xl border-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
                  style={{
                    borderColor: formAnon ? SITE.accent : 'rgba(255,255,255,0.12)',
                    color: formAnon ? SITE.accent : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {formAnon ? 'Publicando como anónimo' : 'Publicar como anónimo'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={submitting || formComment.trim().length < 10}
                  className="rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-widest text-black transition-transform hover:scale-105 disabled:opacity-40"
                  style={{ background: SITE.accent }}
                >
                  {submitting ? 'Guardando…' : myReview ? 'Guardar cambios' : 'Publicar reseña'}
                </button>
              </div>

              {formError && (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-300">
                  {formError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthWarningModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        message={`Necesitas una cuenta CISZU ID para ${authAction || 'interactuar en esta sección'}.`}
      />

      <Script src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" strategy="lazyOnload" />
    </Shell>
  );
}
