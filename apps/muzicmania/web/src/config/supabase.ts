import { createClient } from '@supabase/supabase-js';

// Validar que las variables de entorno existan (Ciszuko pondrá las suyas luego en .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tu-anon-key';

/**
 * Cliente Global de Supabase.
 * Reemplaza totalmente la antigua arquitectura de Prisma.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
