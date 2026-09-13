import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
import { LevelConfig, ChartData, ChartNote, LevelEvent, ArrowSkinId } from '@/types/level';
import { useEventsEngine, EventsState } from './useEventsEngine';
import { getArrowSkin, getArrowTrailSkin, ArrowSkin, ArrowState } from '@/lib/arrowSkins';
import { getParticleSkin, ensureParticleSkin, ParticleSkin, ParticleSprite } from '@/lib/particleSkins';
import { useAppStore } from '@/store/useAppStore';
import { createTrackAudio } from '@/utils/musicAssets';
import { usePixiRenderer, PixiGameRenderer } from './usePixiRenderer';

export interface GameNote {
  time: number;
  lane: number;
  type: 'tap' | 'hold' | 'mine';
  hit?: boolean;
  missed?: boolean;
  active?: boolean;
  y?: number;
  id: string;
  endTime?: number;
}

export type JudgmentKey = 'perfect' | 'great' | 'good' | 'meh' | 'bad' | 'veryBad' | 'miss';

export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
  maxPotentialScore: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
  kps: number;
  mistakes: number;
  progress: number;
  notesHit: number;
  totalNotes: number;
  timeRemaining: number;
  trackDuration: number;
  life: number;
  deaths: number;
  hits: Record<JudgmentKey, number>;
}

export const GAME_CONFIG = {
  lanes: 4,
  hitZoneY: 780,
  scrollSpeed: 480,
  inputBufferMs: 30,
  laneColors: ['#ff33cc', '#68cfff', '#b400ff', '#59b4ff'],
  missFadeDuration: 200,
};

export const HIT_TOLERANCES = {
  perfect: 45,
  great: 80,
  good: 120,
  meh: 165,
  bad: 215,
  veryBad: 265,
  miss: 320,
};

export const SCORE_VALUES: Record<JudgmentKey, number> = {
  perfect: 300,
  great: 200,
  good: 100,
  meh: 50,
  bad: 10,
  veryBad: -50,
  miss: -100,
};

export const JUDGMENT_COLORS: Record<JudgmentKey, string> = {
  perfect: '#68cfff',
  great: '#b400ff',
  good: '#00ff88',
  meh: '#ffd900',
  bad: '#ff6600',
  veryBad: '#ff2244',
  miss: '#ff4444',
};

export const JUDGMENT_LABELS: Record<JudgmentKey, string> = {
  perfect: 'PERFECT',
  great: 'GREAT',
  good: 'GOOD',
  meh: 'MEH',
  bad: 'BAD',
  veryBad: 'VERY BAD',
  miss: 'MISS',
};

export const CHORD_NAMES: Record<number, string> = {
  2: 'DUET',
  3: 'TRIPLE',
  4: 'RAINBOW MAX',
};

function hslToString(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function getComboColor(combo: number): string {
  if (combo >= 1000) return hslToString((Date.now() / 10) % 360, 100, 65);
  if (combo >= 500) return hslToString(280 + (combo - 500) * 0.2, 100, 60);
  if (combo >= 250) return hslToString(220 + (combo - 250) * 0.3, 100, 55);
  if (combo >= 100) return hslToString(180 + (combo - 100) * 0.4, 90, 50);
  if (combo >= 50) return hslToString(140 + (combo - 50) * 0.8, 80, 50);
  if (combo >= 10) return hslToString(100 + combo * 0.6, 70, 50);
  return '#ffffff';
}

export function getKpsColor(kps: number): string {
  if (kps >= 15) return hslToString((Date.now() / 15) % 360, 100, 65);
  if (kps >= 12) return '#ff8800';
  if (kps >= 10) return '#ffcc00';
  if (kps >= 7) return '#b400ff';
  if (kps >= 5) return '#68cfff';
  return '#888888';
}

export function getMistakesColor(mistakes: number): string {
  const t = Math.min(1, mistakes / 200);
  const r = 255;
  const g = Math.round(255 * (1 - t));
  const b = Math.round(255 * (1 - t));
  return `rgb(${r}, ${g}, ${b})`;
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 99) return hslToString((Date.now() / 20) % 360, 100, 65);
  if (accuracy >= 95) return '#68cfff';
  if (accuracy >= 85) return '#00ff88';
  if (accuracy >= 70) return '#ffd900';
  if (accuracy >= 50) return '#ff6600';
  return '#ff2244';
}

export function getScoreGradient(progress: number): string[] {
  if (progress >= 95) return ['#68cfff', '#b400ff', '#ff33cc'];
  if (progress >= 75) return ['#00ff88', '#68cfff'];
  if (progress >= 50) return ['#ffd900', '#ff6600'];
  if (progress >= 25) return ['#ff6600', '#ff2244'];
  return ['#ff2244', '#ff4444'];
}

export function getJudgmentFromTime(timeDistMs: number): JudgmentKey {
  if (timeDistMs <= HIT_TOLERANCES.perfect) return 'perfect';
  if (timeDistMs <= HIT_TOLERANCES.great) return 'great';
  if (timeDistMs <= HIT_TOLERANCES.good) return 'good';
  if (timeDistMs <= HIT_TOLERANCES.meh) return 'meh';
  if (timeDistMs <= HIT_TOLERANCES.bad) return 'bad';
  if (timeDistMs <= HIT_TOLERANCES.veryBad) return 'veryBad';
  return 'miss';
}

function playHitSound(sfxVol: number = 100): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const vol = Math.max(0, Math.min(1, sfxVol / 100));
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2 * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * vol, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

function createMissSound(sfxVol: number = 100): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const vol = Math.max(0, Math.min(1, sfxVol / 100));
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3 * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01 * vol, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function calculateMaxPotentialScore(notes: GameNote[]): number {
  if (notes.length === 0) return 0;
  const sorted = [...notes].sort((a, b) => a.time - b.time);
  let combo = 0;
  let total = 0;
  let i = 0;
  while (i < sorted.length) {
    const groupTime = sorted[i].time;
    let count = 0;
    while (i + count < sorted.length && Math.abs(sorted[i + count].time - groupTime) < 0.01) {
      count++;
    }
    const flowMul = count >= 4 ? 4 : count >= 3 ? 3 : count >= 2 ? 2 : 1;
    const bonus = Math.floor(combo / 10) * 10;
    const noteScore = (SCORE_VALUES.perfect + bonus) * flowMul;
    total += noteScore * count;
    combo += count;
    i += count;
  }
  return total;
}

export const usePixiGameEngine = (
  pixiContainer: RefObject<HTMLDivElement | null>,
  levelConfig: LevelConfig | null,
  chartData: ChartData | null,
  eventsData: LevelEvent[],
  audioVolume: number = 1
) => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false, isPaused: false, isGameOver: false,
    score: 0, maxPotentialScore: 0,
    combo: 0, maxCombo: 0, accuracy: 100,
    kps: 0, mistakes: 0, progress: 0, notesHit: 0, totalNotes: 0,
    timeRemaining: 0, trackDuration: 0,
    life: 100, deaths: 0,
    hits: { perfect: 0, great: 0, good: 0, meh: 0, bad: 0, veryBad: 0, miss: 0 },
  });

  const gameStateRef = useRef<GameState>({
    isPlaying: false, isPaused: false, isGameOver: false,
    score: 0, maxPotentialScore: 0,
    combo: 0, maxCombo: 0, accuracy: 100,
    kps: 0, mistakes: 0, progress: 0, notesHit: 0, totalNotes: 0,
    timeRemaining: 0, trackDuration: 0,
    life: 100, deaths: 0,
    hits: { perfect: 0, great: 0, good: 0, meh: 0, bad: 0, veryBad: 0, miss: 0 },
  });
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const renderer = usePixiRenderer({
    container: pixiContainer.current,
    width: 1920,
    height: 1080,
    levelConfig,
    onReady: (app) => {
      console.log('Pixi.js renderer ready', app);
    },
  });

  const notesRef = useRef<GameNote[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const totalPausedRef = useRef<number>(0);
  const inputBufferRef = useRef<{ lane: number; timestamp: number }[]>([]);
  const kpsWindowRef = useRef<number[]>([]);
  const laneFlashRef = useRef<number[]>([0, 0, 0, 0]);
  const chordFlashRef = useRef<{ name: string; time: number } | null>(null);
  const judgmentFlashRef = useRef<{ text: string; color: string; time: number; lane: number; timeDistMs?: number } | null>(null);
  const pressEffectRef = useRef<Array<{ lane: number; time: number }> | null>(null);
  const selectedArrowSkinRef = useRef<ArrowSkinId>('default');
  const selectedParticleSkinRef = useRef<string>('default');
  const currentSkinRef = useRef<ArrowSkin>(getArrowSkin('default'));
  const trailSkinRef = useRef<ArrowSkin>(getArrowTrailSkin(getArrowSkin('default')));
  const particleSkinRef = useRef<ParticleSkin>(ensureParticleSkin(getParticleSkin('default')));
  const missAnimRef = useRef<Array<{ note: GameNote; startTime: number }>>([]);
  const pendingMissCountRef = useRef(0);
  const particlesRef = useRef<ParticleSprite[]>([]);
  const showHitZonesRef = useRef(false);
  const showEarlyLateRef = useRef(true);
  const msPrecisionRef = useRef(false);
  const scrollSpeedRef = useRef(GAME_CONFIG.scrollSpeed);
  const audioOffsetRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioDurationRef = useRef<number>(0);
  const elapsedAtLastFrameRef = useRef(0);
  const audioRetryTimerRef = useRef<number | null>(null);
  const audioCanPlayHandlerRef = useRef<(() => void) | null>(null);

  const cancelPendingAudioPlay = useCallback(() => {
    if (audioRetryTimerRef.current) {
      clearTimeout(audioRetryTimerRef.current);
      audioRetryTimerRef.current = null;
    }
    if (audioCanPlayHandlerRef.current && audioRef.current) {
      audioRef.current.removeEventListener('canplay', audioCanPlayHandlerRef.current);
    }
    audioCanPlayHandlerRef.current = null;
  }, []);

  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const isGameOverRef = useRef<boolean>(false);
  const lastTimeRemainingRef = useRef<number>(-1);
  const notesHitRef = useRef(0);
  const notesPctRef = useRef(0);

  const { eventsStateRef, processEvents, resetEvents } = useEventsEngine(
    eventsData,
    levelConfig?.bpm ?? 120,
    { current: null },
    undefined,
    (skinId) => {
      const skin = getArrowSkin(skinId);
      currentSkinRef.current = skin;
      trailSkinRef.current = getArrowTrailSkin(skin);
    }
  );

  const totalNotesRef = useRef(0);
  const remainingNotesRef = useRef(0);
  const nextScanIdxRef = useRef(0);
  const scanStartIdxRef = useRef(0);
  const drawStartIdxRef = useRef(0);
  const notesByLaneRef = useRef<GameNote[][]>([[], [], [], []]);
  const lanePtrRef = useRef<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    if (!levelConfig || typeof window === 'undefined') return;
    const trackId = levelConfig.id || (levelConfig.files.audio.split('/').pop() || '').replace(/\.(ogg|mp3|opus)$/, '');
    const { audio } = createTrackAudio(trackId, { volume: audioVolume, preload: 'auto' });
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration && isFinite(audio.duration)) {
        audioDurationRef.current = audio.duration;
      }
    });
    audioRef.current = audio;
    return () => {
      cancelPendingAudioPlay();
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [levelConfig?.files.audio, cancelPendingAudioPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, audioVolume));
    }
  }, [audioVolume]);

  const getElapsed = useCallback(() => {
    const offset = (audioOffsetRef.current ?? 0) / 1000;
    if (audioRef.current && audioRef.current.currentTime > 0) return audioRef.current.currentTime + offset;
    const base = startTimeRef.current > 0 ? startTimeRef.current : 0;
    if (base > 0) {
      const wall = (Date.now() - base) / 1000 - totalPausedRef.current / 1000;
      return wall > 0 ? wall + offset : 0;
    }
    return 0;
  }, []);

  const registerHitGroup = useCallback((judgments: JudgmentKey[], hitCount: number) => {
    let hitCountInGroup = 0;
    setGameState(prev => {
      let newScore = prev.score;
      const newHits = { ...prev.hits };

      let groupMistakes = 0;
      let hasComboBreak = false;
      let lifeDelta = 0;

      judgments.forEach(judg => {
        newHits[judg]++;
        const base = SCORE_VALUES[judg];

        if (['meh', 'bad', 'veryBad', 'miss'].includes(judg)) {
          groupMistakes++;
          hasComboBreak = true;
        }

        if (judg === 'perfect') lifeDelta += 3;
        else if (judg === 'great') lifeDelta += 1;
        else if (judg === 'good') lifeDelta += 0;
        else if (judg === 'meh') lifeDelta -= 1;
        else if (judg === 'bad') lifeDelta -= 2;
        else if (judg === 'veryBad') lifeDelta -= 4;
        else if (judg === 'miss') lifeDelta -= 6;

        const bonus = hasComboBreak ? 0 : Math.floor(prev.combo / 10) * 10;
        const flowMultiplier = hitCount >= 4 ? 4 : hitCount >= 3 ? 3 : hitCount >= 2 ? 2 : 1;
        const raw = (base + (hasComboBreak ? 0 : bonus)) * flowMultiplier;
        newScore += raw;
        if (judg !== 'miss') hitCountInGroup++;
      });

      const newLife = Math.max(0, Math.min(100, prev.life + lifeDelta));
      const newDeaths = newLife <= 0 && prev.life > 0 ? prev.deaths + 1 : prev.deaths;

      const newCombo = hasComboBreak ? 0 : prev.combo + hitCount;
      const newMaxCombo = Math.max(prev.maxCombo, newCombo);
      const newMistakes = prev.mistakes + groupMistakes;

      const total = Object.values(newHits).reduce((a, b) => a + b, 0);
      const weightMap: Record<JudgmentKey, number> = { perfect: 1, great: 0.8, good: 0.6, meh: 0.4, bad: 0.2, veryBad: 0.1, miss: 0 };
      const totalWeight = Object.entries(newHits).reduce((sum, [k, c]) => sum + c * (weightMap[k as JudgmentKey] ?? 0), 0);
      const newAcc = total > 0 ? Math.max(0, Math.round((totalWeight / total) * 1000) / 10) : 100;

      const elapsed = getElapsed();
      notesHitRef.current += hitCountInGroup;
      const totalNotes = totalNotesRef.current;
      const rawProgress = totalNotes > 0 ? Math.min(100, Math.round((notesHitRef.current / totalNotes) * 100)) : 0;
      if (rawProgress > notesPctRef.current) notesPctRef.current = rawProgress;
      const newProgress = Math.max(prev.progress, notesPctRef.current);
      const duration = audioDurationRef.current > 0 ? audioDurationRef.current : (levelConfig?.durationSec ?? 240);
      const newTimeRemaining = Math.max(0, duration - elapsed);

      const now = Date.now();
      kpsWindowRef.current.push(now);
      kpsWindowRef.current = kpsWindowRef.current.filter(t => now - t < 1000);
      const newKps = kpsWindowRef.current.length;

      const allNotesPassed = remainingNotesRef.current <= 0;
      const audioEnded = audioRef.current ? audioRef.current.ended : false;
      const isGameOver = (newLife <= 0) || (allNotesPassed && elapsed > 2) || (newTimeRemaining <= 0) || audioEnded;

      if (isGameOver) {
        isPlayingRef.current = false;
        isGameOverRef.current = true;
      }

      return {
        ...prev,
        score: newScore,
        maxPotentialScore: prev.maxPotentialScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        hits: newHits,
        accuracy: newAcc,
        flowMultiplier: hasComboBreak ? 1 : (hitCount >= 4 ? 4 : hitCount >= 3 ? 3 : hitCount >= 2 ? 2 : 1),
        mistakes: newMistakes,
        kps: newKps,
        life: newLife,
        deaths: newDeaths,
        progress: newProgress,
        notesHit: notesHitRef.current,
        totalNotes: totalNotesRef.current,
        timeRemaining: Math.round(newTimeRemaining * 10) / 10,
        isPlaying: isGameOver ? false : prev.isPlaying,
        isGameOver,
      };
    });
  }, [getElapsed, levelConfig?.durationSec]);

  const processInputBuffer = useCallback(() => {
    const inputs = [...inputBufferRef.current];
    inputBufferRef.current = [];
    if (inputs.length === 0) return;

    const judgments: JudgmentKey[] = [];
    let hitCount = 0;
    let bestJudgment: JudgmentKey = 'miss';
    let lastTimeDist = 0;
    const now = Date.now();
    const currentElapsed = getElapsed();

    inputs.forEach(input => {
      const inputAge = (now - input.timestamp) / 1000;
      const elapsedAtPress = currentElapsed - inputAge;

      let closest: GameNote | null = null;
      let bestDist = Infinity;

      const laneNotes = notesByLaneRef.current[input.lane] ?? [];
      const windowStart = elapsedAtPress - HIT_TOLERANCES.veryBad / 1000;
      const windowEnd = elapsedAtPress + HIT_TOLERANCES.veryBad / 1000;
      for (let i = lanePtrRef.current[input.lane]; i < laneNotes.length; i++) {
        const note = laneNotes[i];
        const t = note.time;
        if (note.hit || note.missed || t < windowStart) {
          lanePtrRef.current[input.lane] = i + 1;
          continue;
        }
        if (!note.active) continue;
        if (t > windowEnd) break;
        const diffMs = (note.time - elapsedAtPress) * 1000;
        const absDist = Math.abs(diffMs);
        if (absDist < bestDist) {
          bestDist = absDist;
          lastTimeDist = diffMs;
          closest = note;
        }
      }

      if (closest && bestDist < Infinity) {
        const judg = getJudgmentFromTime(Math.abs(lastTimeDist));
        (closest as GameNote).hit = true;
        remainingNotesRef.current--;
        laneFlashRef.current = [...laneFlashRef.current];
        laneFlashRef.current[input.lane] = Date.now();

        if (pressEffectRef.current) {
          pressEffectRef.current.push({ lane: input.lane, time: Date.now() });
          renderer.addPressEffect({ lane: input.lane, time: Date.now() });
        }

        judgments.push(judg);
        hitCount++;
        if (judg !== 'miss') {
          bestJudgment = judg;
        }
      } else {
        judgments.push('miss');
        hitCount++;
      }
    });

    if (judgments.length > 0) {
      const hasHit = judgments.some(j => j !== 'miss');
      const showJudg = judgments.find(j => j !== 'miss') || 'miss';
      const isPerf = showJudg === 'perfect';

      judgmentFlashRef.current = {
        text: isPerf ? 'PERFECT' : JUDGMENT_LABELS[showJudg],
        color: isPerf ? '#68cfff' : JUDGMENT_COLORS[showJudg],
        time: Date.now(),
        lane: inputs[0].lane,
        timeDistMs: lastTimeDist,
      };
      renderer.setJudgment({
        text: isPerf ? 'PERFECT' : JUDGMENT_LABELS[showJudg],
        color: isPerf ? '#68cfff' : JUDGMENT_COLORS[showJudg],
        time: Date.now(),
        lane: inputs[0].lane,
        timeDistMs: lastTimeDist,
      });

      if (hitCount >= 2 && CHORD_NAMES[hitCount]) {
        chordFlashRef.current = { name: CHORD_NAMES[hitCount], time: Date.now() };
        renderer.setChordFlash({ name: CHORD_NAMES[hitCount], time: Date.now() });
      }

      if (!hasHit) {
        try { createMissSound(useAppStore.getState().sfxVol); } catch {}
      } else if (useAppStore.getState().hitSound) {
        try { playHitSound(useAppStore.getState().sfxVol); } catch {}
      }

      registerHitGroup(judgments, hitCount);
    }
  }, [registerHitGroup, getElapsed]);

  const handleInput = useCallback((lane: number) => {
    setGameState(state => {
      if (!isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return state;
      inputBufferRef.current.push({ lane, timestamp: Date.now() });
      setTimeout(processInputBuffer, GAME_CONFIG.inputBufferMs);
      return state;
    });
  }, [processInputBuffer]);

  const togglePause = useCallback(() => {
    setGameState(prev => {
      if (!isPlayingRef.current) return prev;
      const nowPaused = !prev.isPaused;
      isPausedRef.current = nowPaused;
      if (nowPaused) {
        if (audioRef.current) audioRef.current.pause();
        pausedTimeRef.current = Date.now();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        renderer.pause();
      } else {
        if (audioRef.current) audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
        totalPausedRef.current += Date.now() - pausedTimeRef.current;
        renderer.resume();
      }
      return { ...prev, isPaused: nowPaused };
    });
  }, [renderer]);

  const startGame = useCallback((notes: GameNote[]) => {
    isPlayingRef.current = true;
    isPausedRef.current = false;
    isGameOverRef.current = false;
    lastTimeRemainingRef.current = -1;

    if (audioRef.current) {
      const a = audioRef.current;
      a.currentTime = 0;
      cancelPendingAudioPlay();
      const tryPlay = () => {
        if (!isPlayingRef.current || isGameOverRef.current) return;
        a.play().catch((e) => console.error('Error playing audio:', e));
      };
      if (a.readyState >= 3) {
        tryPlay();
      } else {
        const onCan = () => { audioCanPlayHandlerRef.current = null; a.removeEventListener('canplay', onCan); tryPlay(); };
        audioCanPlayHandlerRef.current = onCan;
        a.addEventListener('canplay', onCan);
        audioRetryTimerRef.current = window.setTimeout(() => {
          audioRetryTimerRef.current = null;
          a.removeEventListener('canplay', onCan);
          audioCanPlayHandlerRef.current = null;
          tryPlay();
        }, 6000);
      }
    }

    const sortedNotes = [...notes].sort((a, b) => a.time - b.time);
    notesRef.current = sortedNotes;
    totalNotesRef.current = sortedNotes.length;
    remainingNotesRef.current = sortedNotes.length;
    nextScanIdxRef.current = 0;
    scanStartIdxRef.current = 0;
    drawStartIdxRef.current = 0;
    notesByLaneRef.current = [[], [], [], []];
    for (const n of sortedNotes) {
      if (n.lane >= 0 && n.lane < 4) notesByLaneRef.current[n.lane].push(n);
    }
    lanePtrRef.current = [0, 0, 0, 0];
    startTimeRef.current = Date.now();
    totalPausedRef.current = 0;
    inputBufferRef.current = [];
    kpsWindowRef.current = [];
    laneFlashRef.current = [0, 0, 0, 0];
    chordFlashRef.current = null;
    judgmentFlashRef.current = null;
    pressEffectRef.current = [];
    particlesRef.current = [];
    missAnimRef.current = [];
    notesHitRef.current = 0;
    notesPctRef.current = 0;
    resetEvents();
    const arrowSkin = getArrowSkin(selectedArrowSkinRef.current);
    currentSkinRef.current = arrowSkin;
    trailSkinRef.current = getArrowTrailSkin(arrowSkin);
    particleSkinRef.current = ensureParticleSkin(getParticleSkin(selectedParticleSkinRef.current));
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
    renderer.start(sortedNotes);
  }, [cancelPendingAudioPlay, resetEvents, levelConfig?.durationSec, renderer]);

  const stopGame = useCallback(() => {
    isPlayingRef.current = false;
    isPausedRef.current = false;
    isGameOverRef.current = false;
    cancelPendingAudioPlay();
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    renderer.stop();
    setGameState(prev => ({ ...prev, isPlaying: false, isPaused: false, isGameOver: false }));
  }, [cancelPendingAudioPlay, renderer]);

  const setShowHitZones = useCallback((show: boolean) => {
    showHitZonesRef.current = show;
  }, []);

  const setShowEarlyLate = useCallback((show: boolean) => {
    showEarlyLateRef.current = show;
  }, []);

  const setMsPrecision = useCallback((show: boolean) => {
    msPrecisionRef.current = show;
  }, []);

  const setArrowSkin = useCallback((id: ArrowSkinId) => {
    selectedArrowSkinRef.current = id;
  }, []);

  const setParticleSkin = useCallback((id: string) => {
    selectedParticleSkinRef.current = id;
  }, []);

  const setScrollSpeed = useCallback((speed: number) => {
    scrollSpeedRef.current = Math.max(100, Math.min(1200, speed));
  }, []);

  const setAudioOffset = useCallback((offsetMs: number) => {
    audioOffsetRef.current = Math.max(-500, Math.min(500, offsetMs));
  }, []);

  return {
    gameState,
    startGame,
    stopGame,
    togglePause,
    handleInput,
    setShowHitZones,
    setShowEarlyLate,
    setMsPrecision,
    setArrowSkin,
    setParticleSkin,
    setScrollSpeed,
    setAudioOffset,
  };
};
