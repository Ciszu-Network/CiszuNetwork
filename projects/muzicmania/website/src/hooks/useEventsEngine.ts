import { useRef, useCallback, RefObject } from 'react';
import { LevelEvent, ArrowSkinId } from '@/types/level';
import { getArrowSkin } from '@/lib/arrowSkins';

export interface EventsState {
  currentBpm: number;
  currentSpeed: number;
  currentSkin: ArrowSkinId;
  currentVolume: number;
  bumps: Array<{ intensity: number; decayStart: number }>;
  activeShader: string | null;
  scene: string;
  background: string | null;
}

export interface EventsEngineResult {
  eventsStateRef: React.MutableRefObject<EventsState>;
  processEvents: (elapsed: number) => void;
  resetEvents: () => void;
  getEffectiveBpm: () => number;
}

export function useEventsEngine(
  events: LevelEvent[],
  initialBpm: number,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  onBackgroundChange?: (bg: string) => void,
  onSkinChange?: (skinId: ArrowSkinId) => void
): EventsEngineResult {
  const eventsStateRef = useRef<EventsState>({
    currentBpm: initialBpm,
    currentSpeed: 1,
    currentSkin: 'default',
    currentVolume: 1,
    bumps: [],
    activeShader: null,
    scene: 'default',
    background: null,
  });

  const processedIndexRef = useRef(0);
  const sortedEventsRef = useRef<LevelEvent[]>(
    [...events].sort((a, b) => a.time - b.time)
  );

  const processEvents = useCallback((elapsed: number) => {
    const list = sortedEventsRef.current;
    const state = eventsStateRef.current;

    for (let i = processedIndexRef.current; i < list.length; i++) {
      const ev = list[i];
      if (ev.time > elapsed) break;
      processedIndexRef.current = i + 1;

      switch (ev.type) {
        case 'bpm_change':
          state.currentBpm = ev.data as number;
          break;
        case 'speed_change':
          state.currentSpeed = ev.data as number;
          break;
        case 'note_skin_change':
          state.currentSkin = ev.data as ArrowSkinId;
          onSkinChange?.(ev.data as ArrowSkinId);
          break;
        case 'volume_change':
          state.currentVolume = Math.max(0, Math.min(1, ev.data as number));
          break;
        case 'bump':
          state.bumps.push({
            intensity: ev.data as number,
            decayStart: elapsed,
          });
          break;
        case 'shader':
          state.activeShader = ev.data as string;
          break;
        case 'scene_change':
          state.scene = ev.data as string;
          break;
        case 'background_change':
          state.background = ev.data as string;
          onBackgroundChange?.(ev.data as string);
          break;
        case 'flash':
          break;
        case 'particle_effect':
          break;
      }
    }

    const aliveBumps = state.bumps.filter(b => {
      const age = elapsed - b.decayStart;
      return age < 0.5;
    });
    if (aliveBumps.length !== state.bumps.length) {
      state.bumps = aliveBumps;
    }
  }, [onBackgroundChange, onSkinChange]);

  const resetEvents = useCallback(() => {
    eventsStateRef.current = {
      currentBpm: initialBpm,
      currentSpeed: 1,
      currentSkin: 'default',
      currentVolume: 1,
      bumps: [],
      activeShader: null,
      scene: 'default',
      background: null,
    };
    processedIndexRef.current = 0;
  }, [initialBpm]);

  const getEffectiveBpm = useCallback(() => {
    return eventsStateRef.current.currentBpm;
  }, []);

  return { eventsStateRef, processEvents, resetEvents, getEffectiveBpm };
}
