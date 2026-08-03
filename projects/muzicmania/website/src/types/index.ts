export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  high_score: number;
  max_combo: number;
  accuracy: number;
  games_played: number;
  play_time: number;
  updated_at: string;
}

export interface ScoreEntry {
  id: string;
  user_id: string;
  score: number;
  accuracy: number;
  max_combo: number;
  track_id: string;
  created_at: string;
  profiles?: UserProfile;
}

export interface Song {
  id: string;
  title: string;
  difficulty: string;
  bpm: number;
  duration: number;
}
