import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Cliente de servidor (no exponer nunca desde el cliente).
 * - supabaseAdmin: llega con service_role sobre schema muzicmania (lectura de perfiles,
 *   lib formato de migraciones del bot/página de usuario).
 * - supabaseCache: service_role sobre schema ciszu (tabla cache/counters del sistema
 *   de caché Fase 3). Si no hay key (por ejemplo, Vercel sin la env configurada), es
 *   null y el CacheStore funciona sin capa de BD (memoria + KV).
 */
export const supabaseAdmin = serviceRoleKey
  ? // @ts-expect-error - createClient accepts 3rd options param, but TS version is strict
    createClient(supabaseUrl, serviceRoleKey, { db: { schema: 'muzicmania' } as const, auth: { persistSession: false } })
  : null;

export const supabaseCacheDb = serviceRoleKey
  ? // @ts-expect-error - createClient accepts 3rd options param, but TS version is strict
    createClient(supabaseUrl, serviceRoleKey, { db: { schema: 'ciszu' } as const, auth: { persistSession: false } })
  : null;