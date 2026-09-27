'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon, InfoHero, captureEvent, type InfoTheme } from '@ciszu/ui';
import {
  MUSIC_ALBUMS,
  MUSIC_PLATFORM_LINKS,
  MUSIC_TRACK_COUNT,
  type MusicAlbum,
  type MusicLink,
  type MusicTrack,
} from '@/data/music';
import MusicCover from '@/components/music/MusicCover';
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

const SOURCE_META: Record<
  MusicAlbum['source'],
  { label: string; tone: string; badge: string }
> = {
  musicboard: {
    label: 'Obra propia',
    tone: 'text-neon-pink',
    badge: 'bg-neon-pink/10 border-neon-pink/40 text-neon-pink',
  },
  muzicmania: {
    label: 'MuzicMania',
    tone: 'text-neon-purple',
    badge: 'bg-neon-purple/10 border-neon-purple/40 text-neon-purple',
  },
};

function LinkPill({
  link,
  onTrack,
  variant = 'ghost',
}: {
  link: MusicLink;
  onTrack?: () => void;
  variant?: 'solid' | 'ghost';
}) {
  const cls =
    variant === 'solid'
      ? 'bg-neon-cyan/15 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan hover:text-black'
      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30';
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onTrack}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-header font-black uppercase tracking-widest text-[10px] transition-all ${cls}`}
    >
      <Icon name={link.icon} size={13} />
      {link.label}
      <Icon name="external" size={11} className="opacity-60" />
    </a>
  );
}

function TrackRow({ track, onOpen }: { track: MusicTrack; onOpen: () => void }) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-[1.5rem] bg-black/30 border border-white/10 hover:border-neon-cyan/40 transition-all">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <MusicCover
          src={track.cover}
          alt={`Portada de ${track.title}`}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
        />
        <div className="min-w-0">
          <p className="text-sm font-header font-black text-white truncate group-hover:text-neon-cyan transition-colors">
            {track.title}
          </p>
          {track.note ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">{track.note}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {track.links.map((link) => (
          <a
            key={link.href + link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpen}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-neon-cyan hover:text-black hover:border-neon-cyan transition-all"
          >
            <Icon name={link.icon} size={12} />
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function AlbumPanel({
  album,
  selected,
  onSelect,
}: {
  album: MusicAlbum;
  selected: boolean;
  onSelect: () => void;
}) {
  const source = SOURCE_META[album.source];
  return (
    <div
      className={`flex flex-col gap-6 p-6 md:p-8 rounded-[2.5rem] border transition-all ${
        selected ? 'bg-white/[0.07] border-neon-cyan/50 shadow-[0_0_35px_rgba(104,207,255,0.15)]' : 'bg-white/5 border-white/10'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <button
          type="button"
          onClick={onSelect}
          className="shrink-0 group/cover relative active:scale-95 transition-transform"
          aria-label={`Seleccionar ${album.title}`}
        >
          <MusicCover
            src={album.cover}
            alt={`Portada de ${album.title}`}
            width={160}
            height={160}
            className="h-40 w-40 rounded-3xl object-cover border border-white/10 shadow-[0_0_35px_rgba(128,0,255,0.25)]"
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${source.badge}`}>
              {source.label}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
              {album.kind} · {album.year}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-header font-black uppercase italic tracking-tight text-white">
            {album.title}
          </h3>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-1 ${source.tone}`}>{album.artist}</p>
          <p className="text-sm text-gray-400 leading-relaxed mt-3">{album.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {album.links.map((link, index) => (
              <LinkPill
                key={link.href + link.label}
                link={link}
                variant={index === 0 ? 'solid' : 'ghost'}
                onTrack={() => captureEvent('musicboard_album_link', { album: album.id, target: link.label })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          <Icon name="music" size={13} />
          {album.tracks.length} pistas
        </p>
        {album.tracks.map((track) => (
          <TrackRow
            key={track.id}
            track={track}
            onOpen={() => captureEvent('musicboard_track_open', { album: album.id, track: track.id })}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * `/musicboard` — la sección de música de Ciszuko Antony: obra propia publicada
 * desde el musicboard del proyecto (primero) y el repertorio de MuzicMania,
 * con las portadas y los enlaces reales a SoundCloud, YouTube, Spotify y la
 * biblioteca del juego. Los datos salen de `src/data/music.ts`.
 */
export default function MusicboardPage() {
  usePageTitle('MUSICBOARD');
  const [selectedId, setSelectedId] = useState(MUSIC_ALBUMS[0]?.id ?? '');
  const selected = MUSIC_ALBUMS.find((album) => album.id === selectedId) ?? MUSIC_ALBUMS[0];
  const realCount = MUSIC_ALBUMS.find((album) => album.source === 'musicboard')?.tracks.length ?? 0;

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4">
      <PageAmbience />
      <PageReveal className="relative mx-auto max-w-screen-xl">
        <InfoHero
          icon="music"
          title="Musicboard"
          subtitle="La música de Ciszuko Antony en un solo lugar: la obra propia del estudio (FL Studio Track Practice 2024) primero, y después el repertorio que da banda sonora a MuzicMania, con enlaces directos a SoundCloud, YouTube, Spotify y la biblioteca del juego."
          kicker={`${MUSIC_ALBUMS.length} álbumes · ${MUSIC_TRACK_COUNT} pistas`}
          theme={THEME}
        />

        {/* Plataformas musicales reales */}
        <section className="mb-12">
          <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-cyan mb-4">
            <Icon name="headset" size={15} />
            Dónde escuchar
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

        {/* Obra propia primero, repertorio del juego después */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-neon-pink">
              <Icon name="star" size={15} />
              Obra propia · musicboard
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {realCount} pistas de estudio · 2024
            </p>
          </div>

          {MUSIC_ALBUMS.map((album) => (
            <AlbumPanel
              key={album.id}
              album={album}
              selected={selected?.id === album.id}
              onSelect={() => {
                setSelectedId(album.id);
                captureEvent('musicboard_album_select', { album: album.id });
              }}
            />
          ))}
        </section>

        {/* Nota de escucha: el audio maestro vive en el musicboard del proyecto */}
        <section className="mt-12 p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
              <Icon name="headset" size={22} />
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-header font-black uppercase italic text-white">
                Reproductor completo en los canales oficiales
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                Las pistas maestras del musicboard no se publican en la web (solo en los canales oficiales); los temas
                de MuzicMania se reproducen y se juegan en su biblioteca. Usa los enlaces para escuchar la obra completa.
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

        {/* Vuelta al ecosistema musical */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/projects/muzicmania"
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
          </Link>
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
              El perfil de streaming donde se publica la música del ecosistema, con los álbumes y las listas del estudio.
            </p>
          </Link>
        </section>
      </PageReveal>

      <QuickDocks />
    </div>
  );
}
