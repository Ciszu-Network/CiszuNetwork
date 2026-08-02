import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(url, anonKey, {
  db: { schema: 'ciszubot' },
  auth: { persistSession: false },
});
