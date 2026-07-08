import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // Nota: Estas variables deben estar en .env.local
  // Si ejecutas con: npx tsx --env-file=.env.local src/scripts/devConsole.ts funcionará.
}

export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');
