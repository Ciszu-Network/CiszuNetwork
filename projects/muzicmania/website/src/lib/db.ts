import 'server-only';
import { db, createCacheDb } from '@ciszunetwork/db';
import { createCacheStore } from '@ciszunetwork/utils';

/**
 * Capa de datos server-side de MuzicMania (Drizzle ORM).
 * - `db`: cliente Drizzle con los 4 schemas (server-only).
 * - `cacheStore`: CacheStore multi-tienda (memoria→KV→Postgres ciszu.cache) con
 *   adaptador Drizzle. NUNCA se importa desde el navegador.
 *
 * Reemplaza el acceso server de @supabase/supabase-js (`supabaseServer.ts`).
 */
export const dbClient = db;

export { db };

export const cacheStore = createCacheStore({
  db: createCacheDb(db),
  onWarn: (msg) => console.error(`[cache] ${msg}`),
});