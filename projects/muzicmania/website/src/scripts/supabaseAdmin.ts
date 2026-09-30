import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // Estas variables deben estar en .env.local
  // npx tsx --env-file=.env.local src/scripts/devConsole.ts
}

// createClient acepta el 3.er parametro de opciones (shim de declarations.d.ts ya lo declara).
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  db: { schema: 'muzicmania' },
});
