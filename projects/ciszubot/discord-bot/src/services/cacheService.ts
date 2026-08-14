import { db, createCacheDb } from '@ciszunetwork/db';
import { createCacheStore } from '@ciszunetwork/utils';
import { logger } from './logger';

/**
 * Caché compartida del bot (Fase 1-3 del plan, 9 ago 2026).
 * Memoria (LRU) → Vercel KV (si env vars) → Postgres ciszu.cache.
 * Además expone bumpCounter (INCR atómico) para stats persistentes (votos, etc.).
 * Capa Postgres vía Drizzle (adaptador CacheDbLike sobre ciszu.cache/counters).
 */

export const cacheStore = createCacheStore({
  db: createCacheDb(db),
  onWarn: (msg) => logger.warn(`[cache] ${msg}`),
});

/** Contador atómico persistente (INCR en Postgres; fallback memoria sin BD). */
export async function bumpCounter(key: string): Promise<number> {
  return cacheStore.bumpCounter(key);
}