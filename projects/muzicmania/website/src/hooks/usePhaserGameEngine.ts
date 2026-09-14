import { useState, useCallback, useRef, useEffect } from 'react';
import { LevelConfig, ChartData, ChartNote, LevelEvent, ArrowSkinId } from '@/types/level';
import { useEventsEngine } from './useEventsEngine';
import { getArrowSkin, getArrowTrailSkin, ArrowSkin, ArrowState } from '@/lib/arrowSkins';
import { getParticleSkin, ensureParticleSkin, ParticleSkin, ParticleSprite } from '@/lib/particleSkins';
import { useAppStore } from '@/store/useAppStore';
import { createTrackAudio } from '@/utils/musicAssets';
import { GameNote, GameState, GAME_CONFIG, HIT_TOLERANCES, SCORE_VALUES, JUDGMENT_COLORS, JUDGMENT_LABELS, CHORD_NAMES, calculateMaxPotentialScore, getJudgmentFromTime } from './useGameEngine';

export interface PhaserGameEngineOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  levelConfig: LevelConfig | null;
  chart: ChartData | null;
  events: LevelEvent[];
  sfxVol: number;
}

export interface PhaserGameEngine {
  gameState: GameState;
  startGame: () => void;
  stopGame: () => void;
  togglePause: () => void;
  handleInput: (lane: number) => void;
  setShowHitZones: (show: boolean) => void;
  setArrowSkin: (skinId: ArrowSkinId) => void;
  setParticleSkin: (skinId: string) => void;
  setScrollSpeed: (speed: number) => void;
  setAudioOffset: (offset: number) => void;
  setShowEarlyLate: (show: boolean) => void;
  setMsPrecision: (ms: number) => void;
  destroy: () => void;
}

export function usePhaserGameEngine({
  containerRef,
  levelConfig,
  chart,
  events,
  sfxVol,
}: PhaserGameEngineOptions): PhaserGameEngine {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    isPaused: false,
    score: 0,
    maxPotentialScore: chart ? calculateMaxPotentialScore(chart.notes as GameNote[]) : 0,
    combo: 0,
    maxCombo: 0,
    accuracy: 100,
    kps: 0,
    mistakes: 0,
    progress: 0,
    notesHit: 0,
    totalNotes: chart?.notes.length ?? 0,
    timeRemaining: levelConfig?.durationSec ?? 0,
    trackDuration: levelConfig?.durationSec ?? 0,
    life: 100,
    deaths: 0,
    hits: { perfect: 0, great: 0, good: 0, meh: 0, bad: 0, veryBad: 0, miss: 0 },
  });

  const { eventsStateRef, processEvents, resetEvents } = useEventsEngine(
    events,
    levelConfig?.bpm ?? 120,
    { current: null },
    undefined,
    (skinId) => {
      arrowSkinIdRef.current = skinId;
    }
  );
  const notesRef = useRef<GameNote[]>([]);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isGameOverRef = useRef(false);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const totalPausedRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioDurationRef = useRef(0);
  const pendingInputsRef = useRef<Array<{ lane: number; time: number }>>([]);
  const currentLevelRef = useRef<{ config: LevelConfig | null; chart: ChartData | null }>({ config: levelConfig, chart });
  const showHitZonesRef = useRef(false);
  const scrollSpeedRef = useRef(GAME_CONFIG.scrollSpeed);
  const audioOffsetRef = useRef(0);
  const arrowSkinIdRef = useRef<ArrowSkinId>('default');
  const particleSkinIdRef = useRef<string>('default');
  const laneFlashRef = useRef<number[]>([0, 0, 0, 0]);

  // Reset events and state when level changes
  useEffect(() => {
    notesRef.current = [];
    isPlayingRef.current = false;
    isPausedRef.current = false;
    isGameOverRef.current = false;
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    totalPausedRef.current = 0;
    pendingInputsRef.current = [];
    currentLevelRef.current = { config: levelConfig, chart };
    showHitZonesRef.current = false;
    scrollSpeedRef.current = GAME_CONFIG.scrollSpeed;
    audioOffsetRef.current = 0;
    arrowSkinIdRef.current = 'default';
    particleSkinIdRef.current = 'default';
    laneFlashRef.current = [0, 0, 0, 0];
  }, [levelConfig, chart]);

  // Load audio when chart changes
  useEffect(() => {
    if (!levelConfig?.files?.audio) {
      audioRef.current = null;
      audioDurationRef.current = 0;
      return;
    }
    let cancelled = false;
    const trackId = levelConfig.id || (levelConfig.files.audio.split('/').pop() || '').replace(/\.(ogg|mp3|opus)$/, '');
    const { audio } = createTrackAudio(trackId, { preload: 'auto' });
    audio.addEventListener('loadedmetadata', () => {
      if (!cancelled) {
        audioDurationRef.current = audio.duration * 1000;
      }
    });
    audio.addEventListener('error', () => {
      if (!cancelled) {
        audioDurationRef.current = levelConfig?.durationSec ?? 0;
      }
    });
    audioRef.current = audio;
    return () => {
      cancelled = true;
      audio.pause();
      audio.src = '';
    };
  }, [levelConfig?.files?.audio, levelConfig?.id, levelConfig?.durationSec]);

  const startGame = useCallback(() => {
    if (!chart || isPlayingRef.current) return;

    const notes: GameNote[] = chart.notes.map((n, i) => ({
      time: n.time,
      lane: n.lane,
      type: n.type,
      id: `${n.time}-${n.lane}-${i}`,
      endTime: n.endTime,
    }));

    notesRef.current = notes;

    const trackDuration = audioDurationRef.current > 0 ? audioDurationRef.current : (levelConfig?.durationSec ?? 0);
    setGameState({
      isPlaying: true, isPaused: false, isGameOver: false,
      score: 0, maxPotentialScore: calculateMaxPotentialScore(notes),
      combo: 0, maxCombo: 0,
      accuracy: 100, kps: 0, mistakes: 0, progress: 0, notesHit: 0, totalNotes: notes.length,
      timeRemaining: trackDuration,
      life: 100, deaths: 0, trackDuration,
      hits: { perfect: 0, great: 0, good: 0, meh: 0, bad: 0, veryBad: 0, miss: 0 },
    });

    resetEvents();
    startTimeRef.current = Date.now();
    totalPausedRef.current = 0;
    isPlayingRef.current = true;
    isGameOverRef.current = false;
    pendingInputsRef.current = [];
    laneFlashRef.current = [0, 0, 0, 0];

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [chart, levelConfig?.durationSec, resetEvents]);

  const stopGame = useCallback(() => {
    isPlayingRef.current = false;
    isPausedRef.current = false;
    isGameOverRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setGameState(prev => ({ ...prev, isPlaying: false, isPaused: false, isGameOver: false }));
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => {
      if (!isPlayingRef.current) return prev;
      const nowPaused = !prev.isPaused;
      isPausedRef.current = nowPaused;
      if (nowPaused) {
        if (audioRef.current) audioRef.current.pause();
        pausedTimeRef.current = Date.now();
      } else {
        if (audioRef.current) audioRef.current.play().catch(() => {});
        totalPausedRef.current += Date.now() - pausedTimeRef.current;
      }
      return { ...prev, isPaused: nowPaused };
    });
  }, []);

  const handleInput = useCallback((lane: number) => {
    if (!isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;
    pendingInputsRef.current.push({ lane, time: Date.now() });
  }, []);

  const setShowHitZones = useCallback((show: boolean) => {
    showHitZonesRef.current = show;
  }, []);

  const setArrowSkin = useCallback((skinId: ArrowSkinId) => {
    arrowSkinIdRef.current = skinId;
  }, []);

  const setParticleSkin = useCallback((skinId: string) => {
    particleSkinIdRef.current = skinId;
  }, []);

  const setScrollSpeed = useCallback((speed: number) => {
    scrollSpeedRef.current = speed;
  }, []);

  const setAudioOffset = useCallback((offset: number) => {
    audioOffsetRef.current = offset;
  }, []);

  const setShowEarlyLate = useCallback((show: boolean) => {
    // Phaser engine placeholder
  }, []);

  const setMsPrecision = useCallback((ms: number) => {
    // Phaser engine placeholder
  }, []);

  const destroy = useCallback(() => {
    stopGame();
    notesRef.current = [];
    pendingInputsRef.current = [];
  }, [stopGame]);

  return {
    gameState,
    startGame,
    stopGame,
    togglePause,
    handleInput,
    setShowHitZones,
    setArrowSkin,
    setParticleSkin,
    setScrollSpeed,
    setAudioOffset,
    setShowEarlyLate,
    setMsPrecision,
    destroy,
  };
}
