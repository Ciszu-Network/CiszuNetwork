import { useEffect, useRef, useCallback } from 'react';
import { Application, Graphics, Text, Container, TextStyle } from 'pixi.js';
import { GameNote, GAME_CONFIG, HIT_TOLERANCES } from '@/hooks/useGameEngine';
import { getArrowSkin, getArrowTrailSkin, ArrowSkin, ArrowState } from '@/lib/arrowSkins';
import { getParticleSkin, ensureParticleSkin, ParticleSkin, ParticleSprite } from '@/lib/particleSkins';
import { LevelConfig, ArrowSkinId } from '@/types/level';

export interface PixiGameRendererOptions {
  container: HTMLDivElement | null;
  width: number;
  height: number;
  levelConfig: LevelConfig | null;
  onReady?: (app: Application) => void;
}

export interface PixiGameRenderer {
  app: Application | null;
  start: (notes: GameNote[]) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setArrowSkin: (skinId: ArrowSkinId) => void;
  setParticleSkin: (skinId: string) => void;
  setShowHitZones: (show: boolean) => void;
  setScrollSpeed: (speed: number) => void;
  setAudioOffset: (offset: number) => void;
  setJudgment: (judgment: { text: string; color: string; time: number; lane: number; timeDistMs?: number } | null) => void;
  setChordFlash: (chord: { name: string; time: number } | null) => void;
  addPressEffect: (effect: { lane: number; time: number }) => void;
  addMissAnimation: (miss: { note: GameNote; startTime: number }) => void;
  destroy: () => void;
}

const LANE_COLORS = ['#ff33cc', '#68cfff', '#b400ff', '#59b4ff'];
const HIT_ZONE_Y = GAME_CONFIG.hitZoneY;
const PLAYFIELD_WIDTH = 640;
const LANE_WIDTH = PLAYFIELD_WIDTH / 4;
const ARROW_SIZE = 50;
const NOTE_ACTIVATE_WINDOW = 2.5;

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function usePixiRenderer(options: PixiGameRendererOptions): PixiGameRenderer {
  const { container, width, height, levelConfig, onReady } = options;
  const appRef = useRef<Application | null>(null);
  const bgRef = useRef<Graphics | null>(null);
  const lanesContainerRef = useRef<Container | null>(null);
  const notesContainerRef = useRef<Container | null>(null);
  const effectsContainerRef = useRef<Container | null>(null);
  const uiContainerRef = useRef<Container | null>(null);
  const notesRef = useRef<GameNote[]>([]);
  const arrowSkinRef = useRef<ArrowSkin>(getArrowSkin('default'));
  const trailSkinRef = useRef<ArrowSkin>(getArrowTrailSkin(getArrowSkin('default')));
  const particleSkinRef = useRef<ParticleSkin>(ensureParticleSkin(getParticleSkin('default')));
  const showHitZonesRef = useRef(false);
  const scrollSpeedRef = useRef(GAME_CONFIG.scrollSpeed);
  const audioOffsetRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isGameOverRef = useRef(false);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const totalPausedRef = useRef(0);
  const remainingNotesRef = useRef(0);
  const nextScanIdxRef = useRef(0);
  const scanStartIdxRef = useRef(0);
  const drawStartIdxRef = useRef(0);
  const notesByLaneRef = useRef<GameNote[][]>([[], [], [], []]);
  const lanePtrRef = useRef<number[]>([0, 0, 0, 0]);
  const laneFlashRef = useRef<number[]>([0, 0, 0, 0]);
  const chordFlashRef = useRef<{ name: string; time: number } | null>(null);
  const judgmentFlashRef = useRef<{ text: string; color: string; time: number; lane: number; timeDistMs?: number } | null>(null);
  const pressEffectRef = useRef<Array<{ lane: number; time: number }> | null>(null);
  const particlesRef = useRef<ParticleSprite[]>([]);
  const missAnimRef = useRef<Array<{ note: GameNote; startTime: number }>>([]);
  const pendingMissCountRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const hitZoneRef = useRef(HIT_ZONE_Y);

  const getElapsed = useCallback(() => {
    const offset = (audioOffsetRef.current ?? 0) / 1000;
    const base = startTimeRef.current > 0 ? startTimeRef.current : 0;
    if (base > 0) {
      const wall = (Date.now() - base) / 1000 - totalPausedRef.current / 1000;
      return wall > 0 ? wall + offset : 0;
    }
    return 0;
  }, []);

  const initPixi = useCallback(async () => {
    if (!container || appRef.current) return;

    const app = new Application();
    await app.init({
      width,
      height,
      backgroundColor: 0x000a1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(app.canvas as HTMLCanvasElement);
    appRef.current = app;

    const startX = (width - PLAYFIELD_WIDTH) / 2;
    startXRef.current = startX;
    hitZoneRef.current = HIT_ZONE_Y;

    bgRef.current = new Graphics();
    app.stage.addChild(bgRef.current);

    lanesContainerRef.current = new Container();
    app.stage.addChild(lanesContainerRef.current);

    notesContainerRef.current = new Container();
    app.stage.addChild(notesContainerRef.current);

    effectsContainerRef.current = new Container();
    app.stage.addChild(effectsContainerRef.current);

    uiContainerRef.current = new Container();
    app.stage.addChild(uiContainerRef.current);

    onReady?.(app);
  }, [container, width, height, onReady]);

  const drawBackground = useCallback(() => {
    if (!bgRef.current) return;
    bgRef.current.clear();
    const bgColor = levelConfig?.colors.background ?? '#000a1a';
    bgRef.current.rect(0, 0, width, height);
    bgRef.current.fill({ color: hexToNumber(bgColor) });
  }, [width, height, levelConfig]);

  const drawLanes = useCallback(() => {
    if (!lanesContainerRef.current) return;
    lanesContainerRef.current.removeChildren();
    const startX = startXRef.current;
    const hitZone = hitZoneRef.current;

    for (let i = 0; i <= 4; i++) {
      const x = startX + i * LANE_WIDTH;
      const g = new Graphics();
      g.moveTo(x, 0);
      g.lineTo(x, height);
      g.stroke({ width: i === 0 || i === 4 ? 3 : 1.5, color: 0xffffff, alpha: i === 0 || i === 4 ? 0.25 : 0.08 });
      lanesContainerRef.current.addChild(g);
    }

    if (showHitZonesRef.current) {
      const zones = [
        { ms: HIT_TOLERANCES.perfect, color: 0x68cfff, alpha: 0.08 },
        { ms: HIT_TOLERANCES.great, color: 0xb400ff, alpha: 0.06 },
        { ms: HIT_TOLERANCES.good, color: 0x00ff88, alpha: 0.05 },
        { ms: HIT_TOLERANCES.meh, color: 0xffd900, alpha: 0.04 },
        { ms: HIT_TOLERANCES.bad, color: 0xff6600, alpha: 0.03 },
        { ms: HIT_TOLERANCES.veryBad, color: 0xff2244, alpha: 0.03 },
      ];
      zones.forEach(zone => {
        const px = (zone.ms / 1000) * scrollSpeedRef.current;
        const g = new Graphics();
        g.rect(startX, hitZone - px, PLAYFIELD_WIDTH, px * 2);
        g.fill({ color: zone.color, alpha: zone.alpha });
        lanesContainerRef.current!.addChild(g);
      });
    }
  }, [height]);

  const drawHitZoneLine = useCallback(() => {
    if (!lanesContainerRef.current) return;
    const existing = lanesContainerRef.current.getChildByName('hitZoneLine');
    if (existing) existing.destroy();

    const g = new Graphics();
    g.name = 'hitZoneLine';
    const startX = startXRef.current;
    const hitZone = hitZoneRef.current;
    g.moveTo(startX, hitZone);
    g.lineTo(startX + PLAYFIELD_WIDTH, hitZone);
    g.stroke({ width: 3, color: 0x68cfff, alpha: 0.6 });
    lanesContainerRef.current.addChild(g);
  }, []);

  const drawArrowShape = useCallback((g: Graphics, x: number, y: number, size: number, lane: number, color: string, state: ArrowState) => {
    const colorNum = hexToNumber(color);
    const halfSize = size / 2;

    g.clear();
    g.moveTo(x, y - halfSize);
    g.lineTo(x + halfSize, y);
    g.lineTo(x, y + halfSize);
    g.lineTo(x - halfSize, y);
    g.closePath();
    g.fill({ color: colorNum, alpha: state === 'fail' ? 0.6 : 1 });
    g.stroke({ width: 2, color: 0xffffff, alpha: state === 'fail' ? 0.3 : 0.8 });
  }, []);

  const drawNote = useCallback((note: GameNote, elapsed: number) => {
    if (!notesContainerRef.current) return;
    const hitZone = hitZoneRef.current;
    const effectiveScrollSpeed = scrollSpeedRef.current;
    const timeToHit = note.time - elapsed;
    const y = hitZone - timeToHit * effectiveScrollSpeed;

    if (y > height + 120) return;

    const color = LANE_COLORS[note.lane];
    const cx = startXRef.current + note.lane * LANE_WIDTH + LANE_WIDTH / 2;

    if (note.type === 'hold' && note.endTime) {
      const headY = note.hit ? hitZone : y;
      const tailEndY = hitZone - (note.endTime - elapsed) * effectiveScrollSpeed;

      if (tailEndY < headY) {
        const g = new Graphics();
        g.rect(cx - 18, tailEndY, 36, headY - tailEndY);
        g.fill({ color: hexToNumber(color), alpha: 0.2 });
        g.rect(cx - 18, tailEndY - 4, 36, 8);
        g.fill({ color: hexToNumber(color), alpha: 0.5 });
        notesContainerRef.current.addChild(g);
      }
    }

    if (note.hit) return;

    const nearMiss = Math.abs(timeToHit * 1000) <= HIT_TOLERANCES.miss;
    const fadeAlpha = !nearMiss && timeToHit < 0 ? 0.3 : 1;

    const arrowG = new Graphics();
    arrowG.alpha = fadeAlpha;
    drawArrowShape(arrowG, cx, y, ARROW_SIZE, note.lane, color, 'normal');
    notesContainerRef.current.addChild(arrowG);
  }, [height, drawArrowShape]);

  const drawMissAnimation = useCallback((miss: { note: GameNote; startTime: number }, now: number) => {
    if (!effectsContainerRef.current) return;
    const age = now - miss.startTime;
    const alpha = 1 - age / GAME_CONFIG.missFadeDuration;
    const color = LANE_COLORS[miss.note.lane];
    const cx = startXRef.current + miss.note.lane * LANE_WIDTH + LANE_WIDTH / 2;
    const ny = miss.note.y ?? hitZoneRef.current;

    const g = new Graphics();
    g.alpha = alpha * 0.7;
    drawArrowShape(g, cx, ny, 50, miss.note.lane, color, 'fail');
    effectsContainerRef.current.addChild(g);

    const text = new Text({
      text: 'MISS',
      style: {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xff4444,
        align: 'center',
      } as TextStyle
    });
    text.anchor.set(0.5);
    text.x = cx;
    text.y = ny - 45;
    text.alpha = alpha * 0.5;
    effectsContainerRef.current.addChild(text);
  }, [drawArrowShape]);

  const drawParticles = useCallback(() => {
    if (!effectsContainerRef.current) return;
    particlesRef.current = particlesRef.current.filter(p => p.life > 0).map(p =>
      particleSkinRef.current.updateParticle(p, 16)
    );
    particlesRef.current.forEach(p => {
      const g = new Graphics();
      g.circle(p.x, p.y, p.size);
      g.fill({ color: hexToNumber(p.color), alpha: p.life / p.maxLife });
      effectsContainerRef.current!.addChild(g);
    });
  }, []);

  const drawJudgment = useCallback((now: number) => {
    if (!uiContainerRef.current || !judgmentFlashRef.current) return;
    const { text, color, time, lane, timeDistMs } = judgmentFlashRef.current;
    const age = now - time;
    const cx = startXRef.current + lane * LANE_WIDTH + LANE_WIDTH / 2;

    if (age < 600) {
      const alpha = age < 100 ? age / 100 : 1 - (age - 100) / 500;
      const yOff = hitZoneRef.current - 80 - age * 0.1;

      const judgmentText = new Text({
        text: text === 'PERFECT' ? 'PERFECT' : text,
        style: {
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 36,
          fontWeight: 'bold',
          fill: text === 'PERFECT' ? 0x68cfff : hexToNumber(color),
          align: 'center',
        } as TextStyle
      });
      judgmentText.anchor.set(0.5);
      judgmentText.x = cx;
      judgmentText.y = yOff;
      judgmentText.alpha = alpha;
      uiContainerRef.current.addChild(judgmentText);

      if (timeDistMs !== undefined) {
        const earlyLateText = new Text({
          text: timeDistMs > 0 ? 'LATE' : 'EARLY',
          style: {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 18,
            fontWeight: 'bold',
            fill: 0xffffff,
            align: 'center',
          } as TextStyle
        });
        earlyLateText.anchor.set(0.5);
        earlyLateText.x = cx - 70;
        earlyLateText.y = yOff + 28;
        earlyLateText.alpha = alpha;
        uiContainerRef.current.addChild(earlyLateText);
      }
    }

    const msExpired = age >= 3000;
    if (age >= 600 && msExpired) {
      judgmentFlashRef.current = null;
    }
  }, []);

  const drawChordFlash = useCallback((now: number) => {
    if (!uiContainerRef.current || !chordFlashRef.current) return;
    const { name, time } = chordFlashRef.current;
    const age = now - time;

    if (age < 800) {
      const alpha = age < 200 ? age / 200 : 1 - (age - 200) / 600;
      const primaryColor = levelConfig?.colors.primary ?? '#68cfff';

      const text = new Text({
        text: name,
        style: {
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 48,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fill: hexToNumber(primaryColor),
          align: 'center',
        } as TextStyle
      });
      text.anchor.set(0.5);
      text.x = width / 2;
      text.y = hitZoneRef.current - 180;
      text.alpha = alpha;
      uiContainerRef.current.addChild(text);
    } else {
      chordFlashRef.current = null;
    }
  }, [width, levelConfig]);

  const drawPressEffects = useCallback((now: number) => {
    if (!effectsContainerRef.current || !pressEffectRef.current) return;
    pressEffectRef.current = pressEffectRef.current.filter(p => now - p.time < 200);
    pressEffectRef.current.forEach(p => {
      const age = now - p.time;
      const alpha = 1 - age / 200;
      const cx = startXRef.current + p.lane * LANE_WIDTH + LANE_WIDTH / 2;
      const radius = 20 + age * 0.8;

      const g = new Graphics();
      g.alpha = alpha * 0.4;
      g.circle(cx, hitZoneRef.current, radius);
      g.stroke({ width: 3, color: hexToNumber(LANE_COLORS[p.lane]) });
      effectsContainerRef.current!.addChild(g);

      const innerG = new Graphics();
      innerG.alpha = alpha * 0.2;
      innerG.circle(cx, hitZoneRef.current, radius * 0.6);
      innerG.fill({ color: hexToNumber(LANE_COLORS[p.lane]) });
      effectsContainerRef.current!.addChild(innerG);
    });
  }, []);

  const clearFrame = useCallback(() => {
    if (notesContainerRef.current) notesContainerRef.current.removeChildren();
    if (effectsContainerRef.current) effectsContainerRef.current.removeChildren();
    if (uiContainerRef.current) uiContainerRef.current.removeChildren();
  }, []);

  const draw = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;
    if (!appRef.current) return;

    const elapsed = getElapsed();
    const now = Date.now();
    const notes = notesRef.current;
    const total = notes.length;

    clearFrame();
    drawBackground();
    drawLanes();
    drawHitZoneLine();

    let nextScan = nextScanIdxRef.current;
    while (nextScan < total && notes[nextScan].time <= elapsed + NOTE_ACTIVATE_WINDOW) {
      notes[nextScan].active = true;
      nextScan++;
    }
    nextScanIdxRef.current = nextScan;

    let hasMiss = false;
    for (let i = scanStartIdxRef.current; i < nextScan; i++) {
      const note = notes[i];
      if (note.hit || note.missed) continue;
      const timeToHit = note.time - elapsed;
      const missMs = timeToHit * 1000;
      if (timeToHit < 0 && Math.abs(missMs) > HIT_TOLERANCES.miss) {
        note.missed = true;
        note.hit = true;
        remainingNotesRef.current--;
        const effectiveScrollSpeed = scrollSpeedRef.current;
        note.y = hitZoneRef.current - timeToHit * effectiveScrollSpeed;
        missAnimRef.current.push({ note: { ...note }, startTime: Date.now() });
        hasMiss = true;
        pendingMissCountRef.current++;
      }
    }

    let scanStart = scanStartIdxRef.current;
    while (scanStart < nextScan && (notes[scanStart].hit || notes[scanStart].missed)) scanStart++;
    scanStartIdxRef.current = scanStart;

    if (hasMiss) {
      const count = pendingMissCountRef.current;
      pendingMissCountRef.current = 0;
    }

    for (let ni = drawStartIdxRef.current; ni < nextScan; ni++) {
      const note = notes[ni];
      if (!note.active) continue;
      const isCurrentlyHolding = note.type === 'hold' && note.hit && !note.missed && note.endTime && elapsed < note.endTime;
      if ((note.hit && !isCurrentlyHolding) || note.missed) continue;
      drawNote(note, elapsed);
    }

    let drawStart = drawStartIdxRef.current;
    while (drawStart < nextScan) {
      const n = notes[drawStart];
      const isHolding = n.type === 'hold' && n.endTime && elapsed < n.endTime;
      if (n.missed || (n.hit && !isHolding)) drawStart++;
      else break;
    }
    drawStartIdxRef.current = drawStart;

    missAnimRef.current = missAnimRef.current.filter(m => now - m.startTime < GAME_CONFIG.missFadeDuration);
    missAnimRef.current.forEach(m => drawMissAnimation(m, now));

    drawParticles();
    drawJudgment(now);
    drawChordFlash(now);
    drawPressEffects(now);

    const duration = levelConfig?.durationSec ?? 240;
    const newTimeRemaining = Math.max(0, duration - elapsed);
    const allNotesPassed = remainingNotesRef.current <= 0;
    const isGameOver = isGameOverRef.current;

    if (isGameOver) {
      isPlayingRef.current = false;
      isGameOverRef.current = true;
    }

    if (isPlayingRef.current && !isPausedRef.current && !isGameOverRef.current) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  }, [getElapsed, drawBackground, drawLanes, drawHitZoneLine, drawNote, drawMissAnimation, drawParticles, drawJudgment, drawChordFlash, drawPressEffects, clearFrame, levelConfig]);

  const start = useCallback((notes: GameNote[]) => {
    if (!appRef.current) return;
    notesRef.current = notes;
    remainingNotesRef.current = notes.length;
    nextScanIdxRef.current = 0;
    scanStartIdxRef.current = 0;
    drawStartIdxRef.current = 0;
    notesByLaneRef.current = notes.reduce((acc, note) => {
      acc[note.lane].push(note);
      return acc;
    }, [[], [], [], []] as GameNote[][]);
    lanePtrRef.current = [0, 0, 0, 0];
    isPlayingRef.current = true;
    isPausedRef.current = false;
    isGameOverRef.current = false;
    startTimeRef.current = Date.now();
    totalPausedRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [draw]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    isGameOverRef.current = true;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    pausedTimeRef.current = Date.now();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
    totalPausedRef.current += Date.now() - pausedTimeRef.current;
    animationFrameRef.current = requestAnimationFrame(draw);
  }, [draw]);

  const setArrowSkin = useCallback((skinId: ArrowSkinId) => {
    arrowSkinRef.current = getArrowSkin(skinId);
    trailSkinRef.current = getArrowTrailSkin(arrowSkinRef.current);
  }, []);

  const setParticleSkin = useCallback((skinId: string) => {
    particleSkinRef.current = ensureParticleSkin(getParticleSkin(skinId));
  }, []);

  const setShowHitZones = useCallback((show: boolean) => {
    showHitZonesRef.current = show;
  }, []);

  const setScrollSpeed = useCallback((speed: number) => {
    scrollSpeedRef.current = speed;
  }, []);

  const setAudioOffset = useCallback((offset: number) => {
    audioOffsetRef.current = offset;
  }, []);

  const setJudgment = useCallback((judgment: { text: string; color: string; time: number; lane: number; timeDistMs?: number } | null) => {
    judgmentFlashRef.current = judgment;
  }, []);

  const setChordFlash = useCallback((chord: { name: string; time: number } | null) => {
    chordFlashRef.current = chord;
  }, []);

  const addPressEffect = useCallback((effect: { lane: number; time: number }) => {
    pressEffectRef.current = [...(pressEffectRef.current || []), effect];
  }, []);

  const addMissAnimation = useCallback((miss: { note: GameNote; startTime: number }) => {
    missAnimRef.current = [...missAnimRef.current, miss];
  }, []);

  const destroy = useCallback(() => {
    stop();
    if (appRef.current) {
      appRef.current.destroy(true);
      appRef.current = null;
    }
  }, [stop]);

  useEffect(() => {
    initPixi();
    return () => {
      destroy();
    };
  }, [initPixi, destroy]);

  return {
    app: appRef.current,
    start,
    stop,
    pause,
    resume,
    setArrowSkin,
    setParticleSkin,
    setShowHitZones,
    setScrollSpeed,
    setAudioOffset,
    setJudgment,
    setChordFlash,
    addPressEffect,
    addMissAnimation,
    destroy,
  };
}
