import 'server-only';
import { db, ciszubotSchema, createCacheDb } from '@ciszunetwork/db';

/**
 * Capa de datos server-side del dashboard de CiszuBot (Drizzle ORM).
 * - `db`: cliente Drizzle con los 4 schemas (server-only).
 * - `cacheStore`: ver `./cacheStore`.
 *
 * Reemplaza el acceso server de @supabase/supabase-js (`supabaseAdmin.ts`).
 */
export { db, ciszubotSchema, createCacheDb };
export { eq } from '@ciszunetwork/db';