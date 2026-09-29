'use client';

import React from 'react';
import Link from 'next/link';
import { Icon, InfoHero, captureEvent, type InfoTheme } from '@ciszu/ui';
import {
  MUSIC_ALBUMS,
  MUSIC_PLATFORMS,
  MUSIC_PLAYLISTS,
  MUSIC_PLATFORM_LINKS,
  MUSIC_QUEUE,
  MUSIC_TRACK_COUNT,
} from '@/data/music';
import MusicCover from '@/components/music/MusicCover';
import MusicSidebar from '@/components/music/MusicSidebar';
import MusicPlayer from '@/components/music/MusicPlayer';
import { useMusicPlayer } from '@/components/music/useMusicPlayer';
import QuickDocks from '@/components/molecules/QuickDocks';
import PageAmbience from '@/components/layout/PageAmbience';
import PageReveal from '@/components/layout/PageReveal';
import { usePageTitle } from '@/lib/usePageTitle';

const THEME: InfoTheme = {
  accent: 'text-neon-cyan',
  accentBg: 'bg-neon-cyan/10',
  accentBorder: 'border-neon-cyan/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-neon-cyan to-neon-purple',
};

const podcast = MUSIC_PLAYLISTS.find((playlist) => playlist.kind === 'Podcast');
const playlists = MUSIC_PLAYLISTS.filter((playlist) => playlist.kind !== 'Podcast');

/** Tarjeta de una lista externa real (podcast o playlist de YouTube Music). */
function PlaylistCard({
  title,
  kind,
  platform,
  href,
  description,
  icon,
  onOpen,
}: {
  title: string;
  kind: string;
  platform: string;
  href: string;
  description: string;
  icon: string;
  onOpen: () => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOpen}
      className="group flex flex-col h-full p-6 md:p-7 rounded-[2rem] bg-white/5 border border-white/10 hover:border-neon-purple/50 hover:-translate-y-1 transition-all"
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple group-hover:scale-110 transition-transform">
          <Icon name={icon} size={20} />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-header font-black uppercase italic text-white truncate">{title}</h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
            {kind} · {platform}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed flex-1">{description}</p>
      <span className="inline-flex items-center gap-2 mt-5 text-[10px] font-header font-black uppercase tracking-widest text-neon-purple">
        Abrir en YouTube Music
        <Icon name="external" size={11} />
      </span>
    </a>
  );
}

/**
 * `/musicboard` — la sección de música de Ciszuko Antony: reproductor integrado
 * con panel lateral navegable (álbumes, pistas y playlists) al estilo de la
 * biblioteca de MuzicMania, la obra propia del estudio (FL Studio Track
 * Practice 2024) y el repertorio de MuzicMania. Los datos y las URLs reales
 * salen de `src/data/music.ts`; el audio se reproduce desde el CDN del
 * ecosistema y, si una pista no carga, el reproductor lo dice sin inventar.
 */
export default function MusicboardPage() {
  usePageTitle('MUSICBOARD');
  const player = useMusicPlayer(MUSIC_QUEUE);
  const realCount = MUSIC_ALBUMS.find((album) => album.source === 'musicboard')?.tracks.length ?? 0;

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="music"
          title="Musicboard"
          subtitle="La música de Ciszuko Antony en un solo lugar: reproductor integrado con la obra propia del estudio (FL Studio Track Practice 2024) y el repertorio que da banda sonora a MuzicMania, con panel lateral navegable, SoundCloud, YouTube, YouTube Music, Spotify y el podcast y las playlists oficiales."
          kicker={`${MUSIC_ALBUMS.length} álbumes · ${MUSIC_TRACK_COUNT} pistas · ${MUSIC_PLAYLISTS.length} listas`}
          theme={THEME}
        />

        {/* Plataformas musicales reales */}
        <section className="mb-12">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-cyan mb-4">
            <Icon name="headset" size={15} />
            Dónde escuchar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MUSIC_PLATFORM_LINKS.map((platform) => (
              <a
                key={platform.href}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => captureEvent('musicboard_platform_open', { target: platform.label })}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:-translate-y-0.5 transition-all"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-neon-cyan group-hover:scale-110 transition-transform">
                  <Icon name={platform.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-header font-black text-white truncate">{platform.label}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    Canal oficial
                  </span>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Reproductor + biblioteca lateral */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <MusicSidebar
              albums={MUSIC_ALBUMS}
              playlists={MUSIC_PLAYLISTS}
              currentTrackId={player.item?.track.id ?? ''}
              isPlaying={player.isPlaying}
              status={player.status}
              onSelectTrack={(track, album) => {
                player.select(track.id);
                captureEvent('musicboard_track_select', { track: track.id, album: album.id });
              }}
            />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <MusicPlayer
              item={player.item}
              status={player.status}
              isPlaying={player.isPlaying}
              currentTime={player.currentTime}
              duration={player.duration}
              volume={player.volume}
              onToggle={() => {
                captureEvent(player.isPlaying ? 'musicboard_pause' : 'musicboard_play', {
                  track: player.item?.track.id,
                });
                player.toggle();
              }}
              onNext={() => {
                captureEvent('musicboard_next', { from: player.item?.track.id });
                player.next();
              }}
              onPrev={() => {
                captureEvent('musicboard_prev', { from: player.item?.track.id });
                player.prev();
              }}
              onSeek={(fraction) => player.seek(fraction)}
              onVolume={(value) => player.setVolume(value)}
            />
          </div>
        </section>

        {/* Podcast: lista propia en YouTube Music */}
        {podcast ? (
          <section id="podcast" className="mt-16">
            <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-pink mb-4">
              <Icon name="headset" size={15} />
              Podcast
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlaylistCard
                title={podcast.title}
                kind={podcast.kind}
                platform={podcast.platform}
                href={podcast.href}
                description={podcast.description}
                icon={podcast.icon}
                onOpen={() => captureEvent('musicboard_playlist_open', { playlist: podcast.id })}
              />
              <div className="p-6 md:p-7 rounded-[2rem] bg-neon-pink/[0.06] border border-neon-pink/20">
                <h3 className="text-sm font-header font-black uppercase italic text-white">
                  {realCount} pistas de estudio · 2024
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  El podcast y las listas viven en YouTube Music; la obra propia del estudio y el repertorio de
                  MuzicMania se reproducen aquí mismo, desde el CDN del ecosistema, con su portada y sus enlaces
                  reales.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Playlists oficiales: enlaces reales, no inventados */}
        <section id="playlists" className="mt-12">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-purple mb-4">
            <Icon name="music" size={15} />
            Playlists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                title={playlist.title}
                kind={playlist.kind}
                platform={playlist.platform}
                href={playlist.href}
                description={playlist.description}
                icon={playlist.icon}
                onOpen={() => captureEvent('musicboard_playlist_open', { playlist: playlist.id })}
              />
            ))}
            <a
              href={MUSIC_PLATFORMS.muzicmania}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => captureEvent('musicboard_project_open', { project: 'muzicmania' })}
              className="group flex flex-col h-full p-6 md:p-7 rounded-[2rem] bg-white/5 border border-white/10 hover:border-neon-purple/50 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple group-hover:scale-110 transition-transform">
                  <Icon name="gamepad" size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-header font-black uppercase italic text-white truncate">
                    Biblioteca MuzicMania
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    Playlist interactiva · juego de ritmo
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed flex-1">
                Las pistas de Genesis Neon también son jugables con puntuación y progresión en la biblioteca del
                juego.
              </p>
              <span className="inline-flex items-center gap-2 mt-5 text-[10px] font-header font-black uppercase tracking-widest text-neon-purple">
                Ir al juego
                <Icon name="chevronRight" size={11} />
              </span>
            </a>
          </div>
        </section>

        {/* Vuelta al ecosistema musical */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href={MUSIC_PLATFORMS.muzicmania}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => captureEvent('musicboard_project_open', { project: 'muzicmania' })}
            className="group p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-neon-purple/50 hover:-translate-y-1 transition-all"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple mb-4 group-hover:scale-110 transition-transform">
              <Icon name="gamepad" size={20} />
            </span>
            <h3 className="text-sm font-header font-black uppercase italic text-white">MuzicMania</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-1">
              El juego de ritmo del ecosistema y su álbum Genesis Neon, jugable en la biblioteca.
            </p>
          </a>
          <Link
            href="/socials"
            onClick={() => captureEvent('musicboard_socials_index')}
            className="group p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-neon-pink/50 hover:-translate-y-1 transition-all"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-pink/10 border border-neon-pink/30 text-neon-pink mb-4 group-hover:scale-110 transition-transform">
              <Icon name="share" size={20} />
            </span>
            <h3 className="text-sm font-header font-black uppercase italic text-white">Redes</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-1">
              El índice completo de redes oficiales, con una página por plataforma y su enlace directo.
            </p>
          </Link>
          <Link
            href="/socials/spotify"
            onClick={() => captureEvent('musicboard_social_page', { platform: 'spotify' })}
            className="group p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-neon-green/50 hover:-translate-y-1 transition-all"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon-green/10 border border-neon-green/30 text-neon-green mb-4 group-hover:scale-110 transition-transform">
              <Icon name="headset" size={20} />
            </span>
            <h3 className="text-sm font-header font-black uppercase italic text-white">Spotify</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-1">
              El perfil oficial en Spotify: las canciones aún no están publicadas allí, así que de momento enlaza
              solo al perfil; la escucha completa vive en SoundCloud, YouTube Music y este musicboard.
            </p>
          </Link>
        </section>

        {/* Nota de escucha */}
        <section className="mt-12 p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
              <Icon name="headset" size={22} />
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-header font-black uppercase italic text-white">
                Audio desde el CDN del ecosistema
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                Las pistas se reproducen desde el CDN propio; si alguna no está disponible, el reproductor lo
                indica y ofrece los canales oficiales. Las pistas maestras del estudio siguen viviendo en el
                musicboard del proyecto y en los canales de streaming.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href="/socials/youtube"
                onClick={() => captureEvent('musicboard_social_page', { platform: 'youtube' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-header font-black uppercase tracking-widest hover:border-neon-red/50 transition-all"
              >
                <Icon name="play" size={13} />
                YouTube
              </Link>
              <Link
                href="/socials/spotify"
                onClick={() => captureEvent('musicboard_social_page', { platform: 'spotify' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-header font-black uppercase tracking-widest hover:border-neon-green/50 transition-all"
              >
                <Icon name="headset" size={13} />
                Spotify
              </Link>
            </div>
          </div>
        </section>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
