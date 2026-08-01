import { supabase } from '@/config/supabase';

export const AuthService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return { ...user, profile };
  },

  async signOut() {
    await supabase.auth.signOut();
  }
};
