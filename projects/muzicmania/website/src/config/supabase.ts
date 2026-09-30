import { createClient } from '@supabase/supabase-js';
import { createRememberStorage } from '@ciszu/ui';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// @ts-expect-error - createClient accepts 3rd options param, but TS version is strict
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'muzicmania' } as const,
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: createRememberStorage('muzicmania'),
  },
});
