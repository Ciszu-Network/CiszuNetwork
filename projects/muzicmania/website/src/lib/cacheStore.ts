import { createCacheStore } from '@ciszunetwork/utils';
import { supabaseCacheDb } from './supabaseServer';

/**
 * Store de caché compartido de MuzicMania (Fase 1-3 del plan).
 * Memoria (LRU) → Vercel KV (si env vars en producción) → Postgres ciszu.cache.
 * TTL por defecto 60s; errores de capa jamás rompen la request.
 */
export const cacheStore = createCacheStore({
  db: supabaseCacheDb,
  onWarn: (msg) => console.error(`[cache] ${msg}`),
});