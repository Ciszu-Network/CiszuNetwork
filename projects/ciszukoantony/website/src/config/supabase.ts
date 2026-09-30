import { createClient } from '@supabase/supabase-js';
import { createRememberStorage } from '@ciszu/ui';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'ciszukoantony' } as const,
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: createRememberStorage('ciszukoantony'),
  },
});