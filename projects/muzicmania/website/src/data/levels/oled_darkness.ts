import { LevelConfig, ChartData, EventsData, LevelEvent } from '@/types/level';
import { assetResolver } from '@ciszunetwork/cdn';

export const config: LevelConfig = {
  formatVersion: '1.0',
  id: 'oled_darkness',
  title: 'OLED Darkness',
  artist: 'CiszukoAntony',
  album: 'Genesis Neon',
  uploadedBy: 'MuzicMania',
  uploadedById: 'muzicmania_official',
  verified: true,
  description: 'Texturas atmosféricas y líneas de bajo profundas.',
  copyright: '© 2026 CiszukoAntony Music',
  releaseDate: '2026-01-25',
  durationSec: 301,
  bpm: 110,
  offset: 0.0,
  difficulty: 'Easy',
  difficultyRating: 2,
  safeForWork: true,
  colors: {
    primary: '#59b4ff',
    secondary: '#68cfff',
    background: '#000a1a',
    gradient: 'from-neon-blue to-neon-cyan',
  },
  files: {
    audio: assetResolver.resolve('projects/muzicmania/content/music/albums/genesis_neon/oled_darkness/oled_darkness.ogg'),
    banner: assetResolver.resolve('projects/muzicmania/content/music/albums/genesis_neon/oled_darkness/banner.png'),
    disc: assetResolver.resolve('projects/muzicmania/content/music/albums/genesis_neon/oled_darkness/disc.svg'),
  },
  stats: {
    plays: 750,
    downloads: 120,
    likes: 0,
    globalRecordScore: 1250000,
    globalRecordUser: 'CiszuMaster',
  },
};

export const events: LevelEvent[] = [
  { time: 0, type: 'scene_change', data: 'intro' },
  { time: 8, type: 'scene_change', data: 'main' },
  { time: 16, type: 'bump', data: 1.2 },
  { time: 30, type: 'background_change', data: 'dark_cyber' },
  { time: 45, type: 'bump', data: 1.5 },
  { time: 60, type: 'background_change', data: 'neon_grid' },
  { time: 90, type: 'bump', data: 1.8 },
  { time: 120, type: 'background_change', data: 'deep_space' },
  { time: 150, type: 'bump', data: 2.0 },
  { time: 180, type: 'background_change', data: 'digital_rain' },
  { time: 210, type: 'bump', data: 1.5 },
  { time: 240, type: 'background_change', data: 'neon_grid' },
  { time: 270, type: 'bump', data: 1.2 },
  { time: 285, type: 'background_change', data: 'dark_cyber' },
  { time: 295, type: 'scene_change', data: 'outro' },
];
