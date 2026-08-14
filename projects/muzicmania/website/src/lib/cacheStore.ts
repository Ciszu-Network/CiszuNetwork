import { createCacheStore } from '@ciszunetwork/utils';
import { db, createCacheDb } from '@ciszunetwork/db';

/**
 * Store de caché compartido de MuzicMania (Fase 1-3 del plan).
 * Memoria (LRU) → Vercel KV (si env vars en producción) → Postgres ciszu.cache.
 * TTL por defecto 60s; errores de capa jamás rompen la request.
 * Capa Postgres vía Drizzle (adaptador CacheDbLike).
 */
export const cacheStore = createCacheStore({
  db: createCacheDb(db),
  onWarn: (msg) => console.error(`[cache] ${msg}`),
});