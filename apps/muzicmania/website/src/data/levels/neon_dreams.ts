import { LevelConfig, LevelEvent } from '@/types/level';
import { assetResolver } from '@ciszunetwork/cdn';

export const config: LevelConfig = {
  formatVersion: '1.0',
  id: 'neon_dreams',
  title: 'Neon Dreams',
  artist: 'CiszukoAntony',
  album: 'Genesis Neon',
  uploadedBy: 'MuzicMania',
  uploadedById: 'muzicmania_official',
  verified: true,
  description: 'Una odisea synthwave profunda a través de una metrópolis digital.',
  copyright: '© 2026 CiszukoAntony Music',
  releaseDate: '2026-01-10',
  durationSec: 225,
  bpm: 124,
  offset: 0.0,
  difficulty: 'Normal',
  difficultyRating: 5,
  safeForWork: true,
  colors: {
    primary: '#68cfff',
    secondary: '#4800ff',
    background: '#00101a',
    gradient: 'from-neon-blue to-neon-purple',
  },
  files: {
    audio: assetResolver.resolve('apps/muzicmania/content/music/albums/genesis_neon/neon_dreams/neon_dreams.ogg'),
    banner: assetResolver.resolve('apps/muzicmania/content/music/albums/genesis_neon/neon_dreams/banner.png'),
    disc: assetResolver.resolve('apps/muzicmania/content/music/albums/genesis_neon/neon_dreams/disc.svg'),
  },
  stats: {
    plays: 1250,
    downloads: 450,
    likes: 0,
    globalRecordScore: 2450000,
    globalRecordUser: 'NeonRider',
  },
};

export const events: LevelEvent[] = [
  { time: 0, type: 'scene_change', data: 'intro' },
  { time: 4, type: 'scene_change', data: 'main' },
  { time: 8, type: 'bump', data: 1.0 },
  { time: 16, type: 'background_change', data: 'city_night' },
  { time: 32, type: 'bump', data: 1.3 },
  { time: 48, type: 'note_skin_change', data: 'shiny' },
  { time: 64, type: 'background_change', data: 'synth_grid' },
  { time: 80, type: 'bump', data: 1.6 },
  { time: 100, type: 'background_change', data: 'digital_rain' },
  { time: 120, type: 'bump', data: 1.8 },
  { time: 140, type: 'background_change', data: 'city_night' },
  { time: 160, type: 'bump', data: 1.4 },
  { time: 180, type: 'note_skin_change', data: 'default' },
  { time: 200, type: 'background_change', data: 'synth_grid' },
  { time: 215, type: 'scene_change', data: 'outro' },
];
