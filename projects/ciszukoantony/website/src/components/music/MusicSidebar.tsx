'use client';

import React from 'react';
import { Icon, captureEvent } from '@ciszu/ui';
import MusicCover from '@/components/music/MusicCover';
import MusicLinkPill from '@/components/music/MusicLinkPill';
import { MUSIC_PLATFORMS, type MusicAlbum, type MusicPlaylist, type MusicTrack } from '@/data/music';
import type { MusicPlayerStatus } from '@/components/music/useMusicPlayer';

const SOURCE_META: Record<
  MusicAlbum['source'],
  { label: string; badge: string }
> = {
  musicboard: {
    label: 'Obra propia',
    badge: 'bg-neon-pink/10 border-neon-pink/40 text-neon-pink',
  },
  muzicmania: {
    label: 'MuzicMania',
    badge: 'bg-neon-purple/10 border-neon-purple/40 text-neon-purple',
  },
};

/** Indicador de estado de una fila: suena, carga, no disponible o play. */
function TrackIndicator({
  active,
  isPlaying,
  status,
}: {
  active: boolean;
  isPlaying: boolean;
  status: MusicPlayerStatus;
}) {
  if (!active) {
    return <Icon name="play" size={12} className="text-gray-600 group-hover:text-neon-cyan transition-colors" />;
  }
  if (isPlaying) {
    return (
      <span className="flex items-end gap-[3px] h-3.5" aria-hidden="true">
        <span className="w-[3px] h-2 bg-neon-cyan rounded-full animate-pulse" />
        <span className="w-[3px] h-3.5 bg-neon-cyan rounded-full animate-pulse [animation-delay:150ms]" />
        <span className="w-[3px] h-2.5 bg-neon-cyan rounded-full animate-pulse [animation-delay:300ms]" />
      </span>
    );
  }
  if (status === 'unavailable') {
    return <Icon name="warning" size={13} className="text-neon-pink" />;
  }
  return <Icon name="pause" size={12} className="text-neon-cyan" />;
}

/** True si la pista tiene URL propia verificada en SoundCloud (no el perfil). */
const hasOwnSoundcloud = (track: MusicTrack): boolean =>
  track.links.some((link) => link.href.startsWith(`${MUSIC_PLATFORMS.soundcloud}/`));

export type MusicSidebarProps = {
  albums: MusicAlbum[];
  playlists: MusicPlaylist[];
  currentTrackId: string;
  isPlaying: boolean;
  status: MusicPlayerStatus;
  onSelectTrack: (track: MusicTrack, album: MusicAlbum) => void;
};

/**
 * Panel lateral de la biblioteca del musicboard: álbumes con sus pistas
 * (seleccionables para el reproductor), enlaces reales por álbum y el bloque
 * de podcast/playlists externas de YouTube Music.
 */
export default function MusicSidebar({
  albums,
  playlists,
  currentTrackId,
  isPlaying,
  status,
  onSelectTrack,
}: MusicSidebarProps) {
  const trackCount = albums.reduce((total, album) => total + album.tracks.length, 0);

  return (
    <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-cyan">
          <Icon name="music" size={15} />
          Biblioteca
        </h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {albums.length} álbumes · {trackCount} pistas
        </p>
      </header>

      <div className="space-y-8">
        {albums.map((album) => {
          const source = SOURCE_META[album.source];
          return (
            <section key={album.id}>
              <div className="flex flex-col sm:flex-row gap-4">
                <MusicCover
                  src={album.cover}
                  alt={`Portada de ${album.title}`}
                  width={112}
                  height={112}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover border border-white/10 shadow-[0_0_25px_rgba(128,0,255,0.2)]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${source.badge}`}>
                      {source.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-400">
                      {album.kind} · {album.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-header font-black uppercase italic tracking-tight text-white leading-tight">
                    {album.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mt-1 line-clamp-2">{album.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {album.links.map((link) => (
                      <MusicLinkPill
                        key={link.href + link.label}
                        link={link}
                        compact
                        onOpen={() =>
                          captureEvent('musicboard_album_link', { album: album.id, target: link.label })
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5">
                {album.tracks.map((track, trackIndex) => {
                  const active = track.id === currentTrackId;
                  return (
                    <li key={track.id}>
                      <button
                        type="button"
                        onClick={() => onSelectTrack(track, album)}
                        aria-current={active ? 'true' : undefined}
                        className={`group w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                          active
                            ? 'bg-neon-cyan/10 border-neon-cyan/40'
                            : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/40'
                        }`}
                      >
                        <span className="relative shrink-0">
                          <MusicCover
                            src={track.cover}
                            alt={`Portada de ${track.title}`}
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-xl object-cover border border-white/10"
                          />
                          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 opacity-90">
                            <span className="w-3.5 h-3.5 flex items-center justify-center">
                              <TrackIndicator active={active} isPlaying={isPlaying} status={status} />
                            </span>
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm font-header font-black truncate transition-colors ${
                              active ? 'text-neon-cyan' : 'text-white group-hover:text-neon-cyan'
                            }`}
                          >
                            {track.title}
                          </span>
                          {track.note ? (
                            <span className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 truncate">
                              {track.note}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 flex items-center gap-2">
                          {hasOwnSoundcloud(track) ? (
                            <a
                              href={track.links.find((link) => link.href.startsWith(`${MUSIC_PLATFORMS.soundcloud}/`))?.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => {
                                event.stopPropagation();
                                captureEvent('musicboard_track_open', { album: album.id, track: track.id });
                              }}
                              aria-label={`Abrir ${track.title} en SoundCloud`}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-orange-400 hover:bg-white/5 transition-colors"
                            >
                              <Icon name="external" size={12} />
                            </a>
                          ) : null}
                          <span className="text-[10px] font-black font-mono text-gray-600">
                            {String(trackIndex + 1).padStart(2, '0')}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="mt-10 pt-8 border-t border-white/10">
        <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-4">
          <Icon name="headset" size={15} />
          Podcast y playlists
        </h2>
        <ul className="space-y-2">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <a
                href={playlist.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => captureEvent('musicboard_playlist_open', { playlist: playlist.id })}
                className="group flex items-center gap-3 p-3 rounded-2xl bg-black/30 border border-white/5 hover:border-neon-purple/40 transition-all"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple group-hover:scale-110 transition-transform">
                  <Icon name={playlist.icon} size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-header font-black text-white truncate">{playlist.title}</span>
                  <span className="block text-[9px] font-black uppercase tracking-widest text-gray-500">
                    {playlist.kind} · {playlist.platform}
                  </span>
                </span>
                <Icon name="external" size={12} className="text-gray-500 group-hover:text-neon-purple transition-colors" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
