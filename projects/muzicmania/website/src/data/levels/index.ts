import { LevelConfig, ChartData, ChartNote, LevelManifest, EventsData, NoteType } from '@/types/level';
import { generateChart } from '@/data/charts';

type LevelModule = {
  config: LevelConfig;
  events: import('@/types/level').LevelEvent[];
};

export interface LoadedLevel {
  config: LevelConfig;
  chart: ChartData;
  events: EventsData;
}

import * as oledDarkness from './oled_darkness';
import * as neonDreams from './neon_dreams';
import * as digitalSoul from './digital_soul';
import * as cyberBeat from './cyber_beat';

const levelModules: Record<string, LevelModule> = {
  'oled_darkness': oledDarkness as unknown as LevelModule,
  'neon_dreams': neonDreams as unknown as LevelModule,
  'digital_soul': digitalSoul as unknown as LevelModule,
  'cyber_beat': cyberBeat as unknown as LevelModule,
};

function generateNotes(levelId: string, durationSec: number, bpm: number, difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert'): ChartNote[] {
  const procedural = generateChart(levelId, durationSec, bpm, difficulty);
  
  // Semilla estable pseudoaleatoria basada en el ID del nivel
  const seed = Array.from(levelId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const notes: ChartNote[] = procedural.events.map((e, index) => {
    let type: NoteType = 'tap';
    let endTime: number | undefined = undefined;

    // 15% de probabilidad de hold notes en Normal, Hard, Expert
    if (difficulty !== 'Easy' && seededRandom(seed + index) < 0.15) {
      type = 'hold';
      // duración sostenida entre 0.5s y 1.5s
      const duration = 0.5 + seededRandom(seed + index + 999) * 1.0;
      endTime = Math.round((e.time + duration) * 100) / 100;
    }

    return {
      time: Math.round(e.time * 100) / 100,
      lane: e.lane,
      type,
      endTime,
    };
  });

  // Fallback si por alguna razón la lista queda vacía
  if (notes.length === 0) {
    const bps = bpm / 60;
    const beatInterval = 1 / bps;
    for (let t = 3; t < durationSec - 2; t += beatInterval * 2) {
      const idx = Math.floor(t * 10);
      notes.push({
        time: Math.round(t * 100) / 100,
        lane: Math.floor(seededRandom(seed + idx) * 4),
        type: 'tap',
        endTime: undefined,
      });
    }
  }

  return notes;
}

export function getLevel(levelId: string): LoadedLevel | null {
  const mod = levelModules[levelId];
  if (!mod) return null;

  const cfg = mod.config;
  const notes = generateNotes(cfg.id, cfg.durationSec, cfg.bpm, cfg.difficulty);

  return {
    config: cfg,
    chart: {
      formatVersion: '1.0',
      offset: cfg.offset,
      notes,
    },
    events: {
      formatVersion: '1.0',
      events: mod.events,
    },
  };
}

export function getAllLevels(): LevelManifest[] {
  return Object.values(levelModules).map(mod => ({
    id: mod.config.id,
    title: mod.config.title,
    artist: mod.config.artist,
    album: mod.config.album,
    durationSec: mod.config.durationSec,
    bpm: mod.config.bpm,
    difficulty: mod.config.difficulty,
    difficultyRating: mod.config.difficultyRating,
    uploadedBy: mod.config.uploadedBy,
    verified: mod.config.verified,
    safeForWork: mod.config.safeForWork,
    colors: mod.config.colors,
    coverUrl: mod.config.files.disc,
  }));
}

export function getLevelsByAlbum(album: string): LevelManifest[] {
  return getAllLevels().filter(l => l.album === album);
}

export function getAlbums(): string[] {
  const albums = new Set<string>();
  Object.values(levelModules).forEach(mod => albums.add(mod.config.album));
  return Array.from(albums);
}
