export type LevelDifficulty = 'Easy' | 'Normal' | 'Hard' | 'Expert';
export type NoteType = 'tap' | 'hold' | 'mine';
export type ArrowSkinId = string;

export interface LevelFileRefs {
  audio: string;
  banner: string;
  disc: string;
}

export interface LevelColors {
  primary: string;
  secondary: string;
  background: string;
  gradient: string;
}

export interface LevelStats {
  plays: number;
  downloads: number;
  likes: number;
  globalRecordScore: number;
  globalRecordUser: string;
}

export interface LevelConfig {
  formatVersion: string;
  id: string;
  title: string;
  artist: string;
  album: string;
  uploadedBy: string;
  uploadedById: string;
  verified: boolean;
  description: string;
  copyright: string;
  releaseDate: string;
  durationSec: number;
  bpm: number;
  offset: number;
  difficulty: LevelDifficulty;
  difficultyRating: number;
  safeForWork: boolean;
  colors: LevelColors;
  files: LevelFileRefs;
  stats: LevelStats;
  songs?: string[];
}

export interface ChartNote {
  time: number;
  lane: number;
  type: NoteType;
  endTime?: number;
}

export interface ChartData {
  formatVersion: string;
  offset: number;
  notes: ChartNote[];
}

export type EventType =
  | 'scene_change'
  | 'background_change'
  | 'note_skin_change'
  | 'bpm_change'
  | 'shader'
  | 'bump'
  | 'speed_change'
  | 'volume_change'
  | 'particle_effect'
  | 'flash';

export interface LevelEvent {
  time: number;
  type: EventType;
  data: string | number;
  duration?: number;
  easing?: 'linear' | 'ease_in' | 'ease_out';
}

export interface EventsData {
  formatVersion: string;
  events: LevelEvent[];
}

export interface LevelPack {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songIds: string[];
}

export interface LevelManifest {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  bpm: number;
  difficulty: LevelDifficulty;
  difficultyRating: number;
  uploadedBy: string;
  verified: boolean;
  safeForWork: boolean;
  colors: LevelColors;
  coverUrl: string;
}

export const LEVEL_FORMAT_VERSION = '1.0';
