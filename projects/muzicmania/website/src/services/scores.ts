import { supabase } from '@/config/supabase';
import { UserProfile, ScoreEntry } from '@/types';

export const ScoreService = {
  async getLeaderboard(limit = 10) {
    const { data: scores, error } = await supabase
      .from('scores')
      .select('id, user_id, score, accuracy, track_id, created_at')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const rows = (scores || []) as Array<Pick<ScoreEntry, 'id' | 'user_id' | 'score' | 'accuracy' | 'track_id' | 'created_at'>>;
    const userIds = [...new Set(rows.map((s) => s.user_id).filter(Boolean))];
    let profiles: Record<string, Partial<UserProfile>> = {};
    if (userIds.length > 0) {
      const { data: profs, error: profError } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .in('id', userIds);
      if (!profError && profs) {
        profiles = Object.fromEntries(
          (profs as Array<Pick<UserProfile, 'id' | 'username' | 'display_name'>>).map((p) => [p.id, p])
        );
      }
    }

    return rows.map((s) => ({ ...s, profiles: profiles[s.user_id] }));
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
