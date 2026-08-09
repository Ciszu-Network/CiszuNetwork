import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase de servidor (service_role). Uso exclusivo server-side.
 * El schema se elige por llamada: 'ciszubot' (datos del bot) o 'ciszu' (caché).
 */
export function supabaseAdmin(schema: string = 'ciszubot') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://obwzzmbvkrcscqwptlqo.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient(url, serviceKey, { db: { schema }, auth: { persistSession: false } });
}

export default supabaseAdmin;