import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Cliente Supabase para la web ciszubot (CISZU ID — opción alternativa al
 * login obligatorio con Discord). Trabaja sobre el schema `ciszubot`.
 * La persistencia de sesión está activa para que la sesión CISZU ID
 * sobreviva a recargas (el AuthProvider la recupera en cada montaje).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'ciszubot' } as const,
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});