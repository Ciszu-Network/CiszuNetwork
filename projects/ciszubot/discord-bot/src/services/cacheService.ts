import { createClient } from '@supabase/supabase-js';
import { createCacheStore } from '@ciszunetwork/utils';
import { logger } from './logger';

/**
 * Caché compartida del bot (Fase 1-3 del plan, 9 ago 2026).
 * Memoria (LRU) → Vercel KV (si env vars) → Postgres ciszu.cache.
 * Además expone bumpCounter (INCR atómico) para stats persistentes (votos, etc.).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cacheDb: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCacheDb(): any {
  if (!cacheDb) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    cacheDb = createClient(url, key, {
      db: { schema: 'ciszu' },
      auth: { persistSession: false },
    });
  }
  return cacheDb;
}

export const cacheStore = createCacheStore({
  db: getCacheDb(),
  onWarn: (msg) => logger.warn(`[cache] ${msg}`),
});

/** Contador atómico persistente (INCR en Postgres; fallback memoria sin BD). */
export async function bumpCounter(key: string): Promise<number> {
  return cacheStore.bumpCounter(key);
}