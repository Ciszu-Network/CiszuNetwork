'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicQueueItem } from '@/data/music';

/** Estado de carga del audio de la pista seleccionada. */
export type MusicPlayerStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

/** Tiempo máximo por candidato antes de probar el siguiente (ms). */
const LOAD_TIMEOUT_MS = 8000;

export type MusicPlayerState = {
  /** Pista + álbum seleccionados (cola en orden de catálogo). */
  item: MusicQueueItem | undefined;
  index: number;
  isPlaying: boolean;
  status: MusicPlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  /** Selecciona una pista de la cola (si estaba sonando, sigue sonando). */
  select: (trackId: string) => void;
  /** Play/pause de la pista actual. */
  toggle: () => void;
  next: () => void;
  prev: () => void;
  /** Salto por fracción (0..1) de la pista. */
  seek: (fraction: number) => void;
  setVolume: (value: number) => void;
};

/**
 * Reproductor del musicboard, al estilo de la biblioteca de MuzicMania:
 * un único elemento `<audio>` persistente que cambia de fuente al cambiar de
 * pista (la reproducción no se corta al pasar de canción). Los candidatos se
 * prueban en orden (CDN `.ogg` → `.mp3`…) con timeout; si todos fallan, el
 * estado queda en `unavailable` y la UI lo dice sin inventar audio.
 */
export function useMusicPlayer(queue: MusicQueueItem[]): MusicPlayerState {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<MusicPlayerStatus>('idle');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume);
  const indexRef = useRef(index);
  const playIntentRef = useRef(false);
  const endedRef = useRef<(() => void) | null>(null);

  const item = queue[index];

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const select = useCallback(
    (trackId: string) => {
      const target = queue.findIndex((entry) => entry.track.id === trackId);
      if (target === -1 || target === indexRef.current) return;
      indexRef.current = target;
      setIndex(target);
    },
    [queue],
  );

  const step = useCallback(
    (delta: number, keepPlaying: boolean) => {
      if (queue.length === 0) return;
      if (keepPlaying) playIntentRef.current = true;
      const target = (indexRef.current + delta + queue.length) % queue.length;
      indexRef.current = target;
      setIndex(target);
    },
    [queue.length],
  );

  const next = useCallback(() => step(1, playIntentRef.current), [step]);
  const prev = useCallback(() => step(-1, playIntentRef.current), [step]);

  useEffect(() => {
    endedRef.current = () => step(1, true);
  }, [step]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || status === 'unavailable') return;
    if (audio.paused) {
      playIntentRef.current = true;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      playIntentRef.current = false;
      audio.pause();
      setIsPlaying(false);
    }
  }, [status]);

  const seek = useCallback((fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const clamped = Math.min(Math.max(fraction, 0), 1);
    audio.currentTime = clamped * audio.duration;
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(Math.max(value, 0), 1));
  }, []);

  // Carga de la pista seleccionada: candidatos en orden, timeout por candidato.
  useEffect(() => {
    const candidates = queue[index]?.track.audio ?? [];
    if (candidates.length === 0) {
      setStatus('unavailable');
      setIsPlaying(false);
      playIntentRef.current = false;
      return;
    }

    let disposed = false;
    let candidateIndex = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    setStatus('loading');
    setCurrentTime(0);
    setDuration(0);

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const tryCandidate = () => {
      if (disposed) return;
      if (candidateIndex >= candidates.length) {
        clearTimer();
        setStatus('unavailable');
        setIsPlaying(false);
        playIntentRef.current = false;
        return;
      }
      audio.src = candidates[candidateIndex++];
      clearTimer();
      timer = setTimeout(tryCandidate, LOAD_TIMEOUT_MS);
    };

    const handleReady = () => {
      if (disposed) return;
      clearTimer();
      setStatus('ready');
      if (playIntentRef.current) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    };
    const handleError = () => {
      if (!disposed) tryCandidate();
    };
    const handleTimeUpdate = () => {
      if (!disposed) setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      if (!disposed && Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const handleEnded = () => {
      if (!disposed) endedRef.current?.();
    };

    audio.addEventListener('loadeddata', handleReady);
    audio.addEventListener('canplay', handleReady);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    tryCandidate();

    return () => {
      disposed = true;
      clearTimer();
      audio.removeEventListener('loadeddata', handleReady);
      audio.removeEventListener('canplay', handleReady);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [index, queue]);

  return {
    item,
    index,
    isPlaying,
    status,
    currentTime,
    duration,
    volume,
    select,
    toggle,
    next,
    prev,
    seek,
    setVolume,
  };
}
