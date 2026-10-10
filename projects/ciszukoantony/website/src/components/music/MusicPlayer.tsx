'use client';

import React from 'react';
import { useDict } from '@/components/providers/I18nProvider';
import { Icon, captureEvent } from '@ciszu/ui';
import MusicCover from '@/components/music/MusicCover';
import MusicLinkPill from '@/components/music/MusicLinkPill';
import type { MusicQueueItem } from '@/data/music';
import type { MusicPlayerStatus } from '@/components/music/useMusicPlayer';

const I = {
  prev: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" aria-hidden="true">
      <path d="M6 5h2v14H6zM20 5v14L9 12z" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" aria-hidden="true">
      <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" aria-hidden="true">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
  volume: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  unavailable: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="13" />
      <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
    </svg>
  ),
};

const SOURCE_LABEL: Record<MusicQueueItem['album']['source'], string> = {
  musicboard: 'Obra propia',
  muzicmania: 'MuzicMania',
};

function formatTime(time: number): string {
  if (!Number.isFinite(time) || time <= 0) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export type MusicPlayerProps = {
  item: MusicQueueItem | undefined;
  status: MusicPlayerStatus;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (fraction: number) => void;
  onVolume: (value: number) => void;
};

/**
 * Reproductor del musicboard: portada, título, progreso, play/pause,
 * siguiente/anterior y volumen. El estado real de cada pista lo pone
 * `useMusicPlayer`; aquí solo se pinta, incluido el aviso honesto de
 * "audio no disponible localmente" con los enlaces oficiales de escucha.
 */
export default function MusicPlayer({
  item,
  status,
  isPlaying,
  currentTime,
  duration,
  volume,
  onToggle,
  onNext,
  onPrev,
  onSeek,
  onVolume,
}: MusicPlayerProps) {
  const dict = useDict();
  if (!item) return null;

  const { track, album } = item;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const canPlay = status !== 'unavailable';
  const links = [...track.links, ...album.links].filter(
    (link, indexPosition, all) =>
      all.findIndex((candidate) => candidate.href === link.href) === indexPosition,
  );

  return (
    <aside className="lg:sticky lg:top-24">
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/[0.06] border border-neon-cyan/30 shadow-[0_0_45px_rgba(104,207,255,0.12)]">
        <div className="relative mx-auto w-full max-w-[300px]">
          <MusicCover
            src={track.cover}
            alt={`Portada de ${track.title}`}
            width={420}
            height={420}
            className="w-full aspect-square object-cover rounded-[2rem] border border-white/10 shadow-[0_0_45px_rgba(255,51,204,0.22)]"
          />
          {isPlaying ? (
            <span className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-neon-cyan/50 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-cyan" />
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-neon-cyan">Sonando</span>
            </span>
          ) : null}
        </div>

        <div className="text-center mt-6">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 text-[9px] font-black uppercase tracking-widest text-neon-cyan">
              {SOURCE_LABEL[album.source]}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
              {album.kind} · {album.year}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-header font-black uppercase italic tracking-tight text-white leading-tight">
            {track.title}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-pink mt-2">
            {album.title} · {album.artist}
          </p>
          {track.note ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">{track.note}</p>
          ) : null}
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{status === 'loading' ? 'Cargando…' : formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            disabled={status !== 'ready'}
            onChange={(event) => onSeek(Number(event.target.value) / 100)}
            aria-label={dict.music.trackProgress}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-cyan disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={onPrev}
            aria-label={dict.music.prevTrack}
            className="w-12 h-12 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-neon-cyan/15 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
          >
            {I.prev}
          </button>
          <button
            type="button"
            onClick={onToggle}
            disabled={!canPlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center transition-all shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-neon-pink text-white scale-105 shadow-neon-pink/40'
                : 'bg-white text-black hover:scale-105 active:scale-95'
            }`}
          >
            <span className="w-8 h-8">{isPlaying ? I.pause : I.play}</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={dict.music.nextTrack}
            className="w-12 h-12 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-neon-cyan/15 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
          >
            {I.next}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <span className="w-5 h-5 text-gray-500 shrink-0">{I.volume}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => onVolume(Number(event.target.value))}
            aria-label="Volumen"
            className="w-40 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-cyan"
          />
        </div>

        {status === 'unavailable' ? (
          <div className="mt-6 p-4 rounded-2xl bg-neon-pink/5 border border-neon-pink/30">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neon-pink">
              <span className="w-4 h-4 shrink-0">{I.unavailable}</span>
              {dict.music.audioUnavailable}
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed mt-2">
              {dict.music.audioUnavailableDesc}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {links.map((link) => (
            <MusicLinkPill
              key={link.href + link.label}
              link={link}
              compact
              onOpen={() =>
                captureEvent('musicboard_track_link', {
                  track: track.id,
                  album: album.id,
                  target: link.label,
                })
              }
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
