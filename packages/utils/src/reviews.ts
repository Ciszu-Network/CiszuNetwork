/**
 * Lógica pura del sistema de reseñas (REVIEWS) compartida por todas las
 * webs de Ciszu Network.
 *
 * No depende de React ni de Supabase: recibe filas planas y devuelve
 * listas transformadas. Así cada web puede renderizar su propio tema
 * mientras comparte exactamente el mismo comportamiento (filtros,
 * orden, paginación inteligente, tags).
 */

export type ReviewTag = 'verified' | 'positive' | 'negative';

export interface ReviewProfile {
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

/** Fila cruda de `reviews` con el perfil embebido. */
export interface ReviewRecord {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_anonymous?: boolean | null;
  is_verified?: boolean | null;
  likes_count?: number | null;
  is_edited?: boolean | null;
  created_at: string;
  updated_at?: string | null;
  user_profile?: ReviewProfile | null;
}

export type ReviewSortKey = 'relevance' | 'recent' | 'rating' | 'likes' | 'popularity';
export type SortOrder = 'asc' | 'desc';

/** 10 reseñas por página, como pidió el usuario. */
export const REVIEWS_PAGE_SIZE = 10;
/** Máximo de bolitas numeradas en la paginación. */
export const REVIEWS_MAX_DOTS = 10;
/** Una reseña pasa a "verificada" cuando lleva en línea este tiempo… */
export const VERIFIED_MIN_DAYS = 30;
/** …o cuando acumula suficientes reacciones. */
export const VERIFIED_MIN_LIKES = 5;

export const REVIEW_SORT_OPTIONS: { value: ReviewSortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'recent', label: 'Recientes' },
  { value: 'rating', label: 'Estrellas' },
  { value: 'likes', label: 'Likes' },
  { value: 'popularity', label: 'Popularidad' },
];

/** Edad en días de una reseña (0 si la fecha es inválida o futura). */
export function reviewAgeInDays(createdAt: string, now: number = Date.now()): number {
  const ts = Date.parse(createdAt);
  if (!Number.isFinite(ts)) return 0;
  const diff = now - ts;
  if (diff <= 0) return 0;
  return diff / 86_400_000;
}

/**
 * Una reseña está "verificada" cuando lleva tiempo en línea y parece
 * confiable (más de 30 días) o cuando ya acumuló reacciones de la
 * comunidad. El flag manual `is_verified` de la base de datos siempre
 * gana.
 */
export function isReviewVerified(review: ReviewRecord, now: number = Date.now()): boolean {
  if (review.is_verified) return true;
  const likes = review.likes_count ?? 0;
  return reviewAgeInDays(review.created_at, now) >= VERIFIED_MIN_DAYS && likes >= VERIFIED_MIN_LIKES;
}

/** Tags derivados de una reseña: verificado + sentimiento por estrellas. */
export function deriveReviewTags(review: ReviewRecord, now: number = Date.now()): ReviewTag[] {
  const tags: ReviewTag[] = [];
  if (isReviewVerified(review, now)) tags.push('verified');
  tags.push(review.rating >= 3.5 ? 'positive' : 'negative');
  return tags;
}

/** Puntuación de popularidad: likes ponderados por frescura. */
export function popularityScore(review: ReviewRecord, now: number = Date.now()): number {
  const likes = review.likes_count ?? 0;
  const age = reviewAgeInDays(review.created_at, now);
  // Decaimiento suave: una reseña pierde la mitad de su peso cada ~90 días.
  const decay = 1 / (1 + age / 90);
  return likes * decay + review.rating;
}

/** Puntuación de relevancia: estrellas + engagement + frescura. */
export function relevanceScore(review: ReviewRecord, now: number = Date.now()): number {
  const likes = review.likes_count ?? 0;
  const age = reviewAgeInDays(review.created_at, now);
  const decay = 1 / (1 + age / 60);
  return review.rating * 2 + Math.log1p(likes) * 1.5 + decay * 2;
}

export interface ReviewFilters {
  /** Texto libre: comentario, display name o @username. */
  query?: string;
  /** Tags requeridos (OR). Vacío = sin filtro de tag. */
  tags?: ReviewTag[];
  /** Rango de estrellas (inclusive). */
  minRating?: number | null;
  maxRating?: number | null;
  /** Solo la reseña del usuario actual. */
  onlyMine?: boolean;
  /** Solo reseñas con al menos una reacción. */
  onlyWithLikes?: boolean;
}

/** Normaliza texto para búsqueda sin acentos ni mayúsculas. */
export function normalizeReviewText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchReviews(list: ReviewRecord[], query: string): ReviewRecord[] {
  // Se permite buscar "@usuario" igual que "usuario".
  const needle = normalizeReviewText(query ?? '').replace(/^@+/, '');
  if (!needle) return list;
  return list.filter((review) => {
    const haystack = [
      review.comment,
      review.user_profile?.display_name ?? '',
      review.user_profile?.username ?? '',
    ]
      .map((part) => normalizeReviewText(String(part ?? '')))
      .join(' ');
    return haystack.includes(needle);
  });
}

export interface FilterContext {
  userId?: string | null;
  now?: number;
}

export function filterReviews(
  list: ReviewRecord[],
  filters: ReviewFilters = {},
  context: FilterContext = {},
): ReviewRecord[] {
  const now = context.now ?? Date.now();
  let result = list;

  if (filters.onlyMine) {
    result = result.filter((review) => !!context.userId && review.user_id === context.userId);
  }

  if (filters.query && filters.query.trim()) {
    result = searchReviews(result, filters.query);
  }

  if (typeof filters.minRating === 'number') {
    result = result.filter((review) => review.rating >= (filters.minRating as number));
  }

  if (typeof filters.maxRating === 'number') {
    result = result.filter((review) => review.rating <= (filters.maxRating as number));
  }

  if (filters.onlyWithLikes) {
    result = result.filter((review) => (review.likes_count ?? 0) > 0);
  }

  const tags = filters.tags ?? [];
  if (tags.length > 0) {
    result = result.filter((review) => {
      const own = deriveReviewTags(review, now);
      return tags.some((tag) => own.includes(tag));
    });
  }

  return result;
}

/** Orden estable: nunca depende del orden de entrada. */
export function sortReviews(
  list: ReviewRecord[],
  sortKey: ReviewSortKey = 'recent',
  order: SortOrder = 'desc',
  now: number = Date.now(),
): ReviewRecord[] {
  const dir = order === 'asc' ? 1 : -1;
  const withIndex = list.map((review, index) => ({ review, index }));

  const score = (review: ReviewRecord): number => {
    switch (sortKey) {
      case 'rating':
        return review.rating;
      case 'likes':
        return review.likes_count ?? 0;
      case 'popularity':
        return popularityScore(review, now);
      case 'relevance':
        return relevanceScore(review, now);
      case 'recent':
      default: {
        const ts = Date.parse(review.created_at);
        return Number.isFinite(ts) ? ts : 0;
      }
    }
  };

  withIndex.sort((a, b) => {
    const diff = score(a.review) - score(b.review);
    if (diff !== 0) return diff * dir;
    // Desempate determinista por fecha y luego por id.
    const ta = Date.parse(a.review.created_at) || 0;
    const tb = Date.parse(b.review.created_at) || 0;
    if (ta !== tb) return (ta - tb) * dir;
    return a.review.id.localeCompare(b.review.id) || a.index - b.index;
  });

  return withIndex.map((entry) => entry.review);
}

export interface PaginatedReviews<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  from: number;
  to: number;
}

/** Paginación blindada: nunca devuelve una página fuera de rango. */
export function paginateReviews<T>(list: T[], page: number, pageSize: number = REVIEWS_PAGE_SIZE): PaginatedReviews<T> {
  const size = Math.max(1, Math.floor(pageSize));
  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const safePage = Math.min(Math.max(0, Math.floor(page) || 0), totalPages - 1);
  const start = safePage * size;
  const items = list.slice(start, start + size);
  return {
    items,
    page: safePage,
    totalPages,
    totalItems,
    from: totalItems === 0 ? 0 : start + 1,
    to: start + items.length,
  };
}

export interface PageWindow {
  /** Índices de página (0-based) que se muestran como bolitas numeradas. */
  pages: number[];
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  /** Mostrar acceso rápido a la primera página (extremo izquierdo). */
  showFirst: boolean;
  /** Mostrar acceso rápido a la última página (extremo derecho). */
  showLast: boolean;
}

/**
 * Ventana de paginación "estilo buscador":
 * - máximo `maxDots` bolitas numeradas, centradas en la página actual
 *   (≈5 anteriores y 5 posteriores);
 * - flags para los atajos de primera/última página en los extremos;
 * - nunca promete páginas que no existen.
 */
export function buildPageWindow(
  current: number,
  total: number,
  maxDots: number = REVIEWS_MAX_DOTS,
): PageWindow {
  const totalPages = Math.max(1, Math.floor(total) || 1);
  const dots = Math.max(1, Math.floor(maxDots) || REVIEWS_MAX_DOTS);
  const page = Math.min(Math.max(0, Math.floor(current) || 0), totalPages - 1);

  if (totalPages <= dots) {
    return {
      pages: Array.from({ length: totalPages }, (_, i) => i),
      page,
      totalPages,
      hasPrev: page > 0,
      hasNext: page < totalPages - 1,
      showFirst: false,
      showLast: false,
    };
  }

  const half = Math.floor(dots / 2);
  const start = Math.min(Math.max(0, page - half), totalPages - dots);
  return {
    pages: Array.from({ length: dots }, (_, i) => start + i),
    page,
    totalPages,
    hasPrev: page > 0,
    hasNext: page < totalPages - 1,
    showFirst: start > 0,
    showLast: start + dots < totalPages,
  };
}

export interface RatingBreakdown {
  average: number;
  total: number;
  /** porcentaje 0..100 por cada valor 1..5 (redondeado). */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

/**
 * Media de las reseñas visibles. Devuelve `null` cuando no hay ninguna,
 * para que cada web decida su baseline (hoy 5.0) sin inventar datos.
 */
export function averageRating(list: ReviewRecord[]): number | null {
  if (list.length === 0) return null;
  const sum = list.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
  return sum / list.length;
}

export function ratingBreakdown(list: ReviewRecord[]): RatingBreakdown {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (list.length === 0) {
    return { average: 0, total: 0, distribution };
  }
  let sum = 0;
  let counted = 0;
  for (const review of list) {
    const rating = Number(review.rating);
    if (!Number.isFinite(rating)) continue;
    sum += rating;
    counted += 1;
    const bucket = Math.min(5, Math.max(1, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[bucket] += 1;
  }
  if (counted === 0) return { average: 0, total: 0, distribution };
  Object.keys(distribution).forEach((key) => {
    const k = Number(key) as 1 | 2 | 3 | 4 | 5;
    distribution[k] = Math.round((distribution[k] / counted) * 100);
  });
  return { average: sum / counted, total: counted, distribution };
}

/** Formatea una nota con un decimal (2.5 → "2.5"). */
export function formatRating(value: number): string {
  if (!Number.isFinite(value)) return '0.0';
  return value.toFixed(1);
}
