import { describe, expect, it } from 'vitest';

import {
  REVIEWS_MAX_DOTS,
  REVIEWS_PAGE_SIZE,
  averageRating,
  buildPageWindow,
  deriveReviewTags,
  filterReviews,
  formatRating,
  isReviewVerified,
  paginateReviews,
  popularityScore,
  ratingBreakdown,
  relevanceScore,
  reviewAgeInDays,
  sortReviews,
  type ReviewRecord,
} from '../src/reviews';

const DAY = 86_400_000;
const NOW = Date.parse('2026-09-17T12:00:00.000Z');

const review = (overrides: Partial<ReviewRecord> = {}): ReviewRecord => ({
  id: 'r-1',
  user_id: 'u-1',
  rating: 4.5,
  comment: 'Excelente experiencia',
  is_anonymous: false,
  is_verified: false,
  likes_count: 0,
  is_edited: false,
  created_at: new Date(NOW - 2 * DAY).toISOString(),
  user_profile: { display_name: 'Ana', username: 'ana', avatar_url: null },
  ...overrides,
});

describe('reviewAgeInDays', () => {
  it('calcula días transcurridos', () => {
    expect(reviewAgeInDays(new Date(NOW - 3 * DAY).toISOString(), NOW)).toBeCloseTo(3);
  });

  it('devuelve 0 con fechas inválidas o futuras', () => {
    expect(reviewAgeInDays('no-es-fecha', NOW)).toBe(0);
    expect(reviewAgeInDays(new Date(NOW + 5 * DAY).toISOString(), NOW)).toBe(0);
  });
});

describe('isReviewVerified', () => {
  it('respeta el flag manual', () => {
    expect(isReviewVerified(review({ is_verified: true }), NOW)).toBe(true);
  });

  it('exige antigüedad Y likes', () => {
    const old = new Date(NOW - 40 * DAY).toISOString();
    expect(isReviewVerified(review({ created_at: old, likes_count: 6 }), NOW)).toBe(true);
    expect(isReviewVerified(review({ created_at: old, likes_count: 1 }), NOW)).toBe(false);
    expect(isReviewVerified(review({ created_at: new Date(NOW - 2 * DAY).toISOString(), likes_count: 50 }), NOW)).toBe(false);
  });
});

describe('deriveReviewTags', () => {
  it('positivo para 3.5 o más y negativo por debajo', () => {
    expect(deriveReviewTags(review({ rating: 3.5 }), NOW)).toEqual(['positive']);
    expect(deriveReviewTags(review({ rating: 3.4 }), NOW)).toEqual(['negative']);
  });

  it('añade verificado cuando aplica', () => {
    const tags = deriveReviewTags(review({ rating: 5, is_verified: true }), NOW);
    expect(tags).toContain('verified');
    expect(tags).toContain('positive');
  });
});

describe('filterReviews', () => {
  const list = [
    review({ id: 'a', comment: 'Música increíble', user_profile: { display_name: 'Ana', username: 'ana' }, rating: 5, likes_count: 3 }),
    review({ id: 'b', comment: 'Pésimo soporte', user_profile: { display_name: 'Beto', username: 'beto' }, rating: 1, likes_count: 0 }),
    review({ id: 'c', comment: 'Normal', user_profile: { display_name: 'Ana María', username: 'anam' }, rating: 3, likes_count: 0, user_id: 'u-9' }),
  ];

  it('busca sin acentos ni mayúsculas', () => {
    expect(filterReviews(list, { query: 'MUSICA' }).map((r) => r.id)).toEqual(['a']);
    expect(filterReviews(list, { query: 'ana' }).map((r) => r.id)).toEqual(['a', 'c']);
    expect(filterReviews(list, { query: '@beto' }).map((r) => r.id)).toEqual(['b']);
  });

  it('filtra por rango de estrellas', () => {
    expect(filterReviews(list, { minRating: 3 }).map((r) => r.id)).toEqual(['a', 'c']);
    expect(filterReviews(list, { maxRating: 1 }).map((r) => r.id)).toEqual(['b']);
  });

  it('filtra por tags (OR)', () => {
    expect(filterReviews(list, { tags: ['positive'] }).map((r) => r.id)).toEqual(['a']);
    expect(filterReviews(list, { tags: ['negative'] }).map((r) => r.id)).toEqual(['b', 'c']);
  });

  it('filtra solo las mías y solo con likes', () => {
    expect(filterReviews(list, { onlyMine: true }, { userId: 'u-9' }).map((r) => r.id)).toEqual(['c']);
    expect(filterReviews(list, { onlyMine: true }, { userId: null })).toEqual([]);
    expect(filterReviews(list, { onlyWithLikes: true }).map((r) => r.id)).toEqual(['a']);
  });

  it('combina filtros', () => {
    expect(filterReviews(list, { query: 'ana', minRating: 4 }).map((r) => r.id)).toEqual(['a']);
  });
});

describe('sortReviews', () => {
  const list = [
    review({ id: 'a', rating: 1, likes_count: 50, created_at: new Date(NOW - 1 * DAY).toISOString() }),
    review({ id: 'b', rating: 5, likes_count: 0, created_at: new Date(NOW - 10 * DAY).toISOString() }),
    review({ id: 'c', rating: 3, likes_count: 10, created_at: new Date(NOW - 5 * DAY).toISOString() }),
  ];

  it('ordena por likes descendente', () => {
    expect(sortReviews(list, 'likes', 'desc', NOW).map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });

  it('ordena por estrellas ascendente', () => {
    expect(sortReviews(list, 'rating', 'asc', NOW).map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });

  it('ordena por fecha descendente', () => {
    expect(sortReviews(list, 'recent', 'desc', NOW).map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });

  it('es determinista ante empates', () => {
    const tie = [review({ id: 'z', rating: 4 }), review({ id: 'y', rating: 4 })];
    const once = sortReviews(tie, 'rating', 'desc', NOW).map((r) => r.id);
    const twice = sortReviews([...tie].reverse(), 'rating', 'desc', NOW).map((r) => r.id);
    expect(once).toEqual(twice);
  });

  it('no muta la lista original', () => {
    const copy = [...list];
    sortReviews(list, 'likes', 'asc', NOW);
    expect(list).toEqual(copy);
  });
});

describe('scores', () => {
  it('popularity premia likes recientes', () => {
    const fresh = popularityScore(review({ likes_count: 10, created_at: new Date(NOW - DAY).toISOString() }), NOW);
    const old = popularityScore(review({ likes_count: 10, created_at: new Date(NOW - 400 * DAY).toISOString() }), NOW);
    expect(fresh).toBeGreaterThan(old);
  });

  it('relevance devuelve un número finito', () => {
    expect(Number.isFinite(relevanceScore(review(), NOW))).toBe(true);
  });
});

describe('paginateReviews', () => {
  const list = Array.from({ length: 23 }, (_, i) => ({ id: i }));

  it('usa 10 por página', () => {
    expect(REVIEWS_PAGE_SIZE).toBe(10);
    expect(paginateReviews(list, 0).items.length).toBe(10);
    expect(paginateReviews(list, 2).items.length).toBe(3);
  });

  it('calcula el rango visible', () => {
    const page = paginateReviews(list, 1);
    expect(page.from).toBe(11);
    expect(page.to).toBe(20);
    expect(page.totalPages).toBe(3);
  });

  it('acota páginas fuera de rango', () => {
    expect(paginateReviews(list, 99).page).toBe(2);
    expect(paginateReviews(list, -5).page).toBe(0);
  });

  it('con lista vacía devuelve una sola página', () => {
    const empty = paginateReviews([], 0);
    expect(empty.totalPages).toBe(1);
    expect(empty.items).toEqual([]);
    expect(empty.from).toBe(0);
  });
});

describe('buildPageWindow', () => {
  it('con 1 sola página no muestra atajos', () => {
    const w = buildPageWindow(0, 1);
    expect(w.pages).toEqual([0]);
    expect(w.showFirst).toBe(false);
    expect(w.showLast).toBe(false);
    expect(w.hasPrev).toBe(false);
    expect(w.hasNext).toBe(false);
  });

  it('con 3 páginas las muestra todas', () => {
    expect(buildPageWindow(1, 3).pages).toEqual([0, 1, 2]);
  });

  it('nunca muestra más de maxDots bolitas', () => {
    const w = buildPageWindow(25, 100);
    expect(w.pages.length).toBe(REVIEWS_MAX_DOTS);
    expect(w.pages).toContain(25);
    expect(w.showFirst).toBe(true);
    expect(w.showLast).toBe(true);
  });

  it('centra la ventana en la página actual', () => {
    const w = buildPageWindow(50, 100);
    expect(w.pages[0]).toBe(45);
    expect(w.pages[w.pages.length - 1]).toBe(54);
  });

  it('acota la ventana al principio y al final', () => {
    expect(buildPageWindow(0, 100).pages[0]).toBe(0);
    expect(buildPageWindow(0, 100).showFirst).toBe(false);
    expect(buildPageWindow(99, 100).pages[REVIEWS_MAX_DOTS - 1]).toBe(99);
    expect(buildPageWindow(99, 100).showLast).toBe(false);
  });

  it('total inválido se trata como 1 página', () => {
    expect(buildPageWindow(0, 0).totalPages).toBe(1);
  });
});

describe('averageRating / ratingBreakdown / formatRating', () => {
  it('devuelve null sin reseñas (no se inventan datos)', () => {
    expect(averageRating([])).toBeNull();
  });

  it('promedia las notas reales', () => {
    expect(averageRating([review({ rating: 5 }), review({ rating: 2 })])).toBe(3.5);
  });

  it('calcula la distribución', () => {
    const b = ratingBreakdown([review({ rating: 5 }), review({ rating: 5 }), review({ rating: 1 })]);
    expect(b.total).toBe(3);
    expect(b.distribution[5]).toBe(67);
    expect(b.distribution[1]).toBe(33);
  });

  it('formatea con un decimal', () => {
    expect(formatRating(2.5)).toBe('2.5');
    expect(formatRating(4)).toBe('4.0');
    expect(formatRating(Number.NaN)).toBe('0.0');
  });
});
