import { createCacheStore } from '@ciszunetwork/utils';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Store de caché compartido del dashboard de CiszuBot (Fase 1-3 del plan).
 * Memoria (LRU) → Vercel KV (si env vars en producción) → Postgres ciszu.cache.
 * TTL corto (60s) y claves por usuario: la caché nunca filtra datos entre cuentas.
 */
export const cacheStore = createCacheStore({
  db: supabaseAdmin('ciszu'),
  onWarn: (msg) => console.error(`[cache] ${msg}`),
});