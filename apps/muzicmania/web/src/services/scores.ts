import { supabase } from '@/config/supabase';
import { UserProfile, ScoreEntry } from '@/types';

export const ScoreService = {
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('scores')
      .select('*, profiles(*)')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ScoreEntry[];
  },

  async saveScore(score: Omit<ScoreEntry, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('scores')
      .insert(score)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
