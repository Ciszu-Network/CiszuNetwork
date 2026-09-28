/**
 * Fuente única de la música de Ciszuko Antony.
 *
 * Reúne, por orden de prioridad, la obra propia publicada en el musicboard del
 * proyecto (`projects/ciszukoantony/musicboard/`) y el repertorio producido
 * para MuzicMania (álbum Genesis Neon). La usan la home (`/`) y la página
 * `/musicboard`, para no duplicar datos entre ambas.
 *
 * ENLACES: solo URLs reales ya publicadas — el perfil de SoundCloud del artista
 * (`https://soundcloud.com/ciszukoantony`, SIN guion), su canal de YouTube, su
 * canal de YouTube Music (con el podcast y la playlist de FL Studio), el perfil
 * de Spotify (solo perfil: las canciones aún no están subidas) y la biblioteca
 * de MuzicMania. Solo se usa URL por canción cuando el slug está verificado
 * (`/restless-thoughts`); el resto de pistas enlazan al perfil, sin inventar.
 *
 * AUDIO: las pistas del musicboard se sirven desde el CDN con la ruta espejo
 * del repo (`projects/ciszukoantony/musicboard/albums/...`, la misma que usa el
 * servidor de assets local en dev). Genesis Neon usa su audio real del CDN
 * (`.ogg` con fallback `.mp3`). El reproductor prueba los candidatos en orden y,
 * si ninguno carga, muestra un estado honesto de "no disponible localmente".
 *
 * PORTADAS: las de musicboard se sirven en local desde
 * `website/public/musicboard/covers/` (el musicboard no está subido al CDN);
 * las de MuzicMania usan el CDN normal (`projects/muzicmania/content/...`).
 */

import { resolveAssetPath } from '@ciszunetwork/cdn';

export type MusicKind = 'Álbum' | 'Banda sonora' | 'Playlist';
export type MusicSource = 'musicboard' | 'muzicmania';
export type MusicLinkIcon = 'music' | 'play' | 'globe' | 'external' | 'gamepad' | 'headset' | 'heart';

export type MusicLink = {
  label: string;
  href: string;
  icon: MusicLinkIcon;
  external?: boolean;
};

export type MusicTrack = {
  id: string;
  title: string;
  cover: string;
  /** Nota corta y verificable sobre la pista (versión, origen). */
  note?: string;
  links: MusicLink[];
  /**
   * Candidatos de audio en orden de preferencia (CDN primero). Vacío = sin
   * audio local: el reproductor muestra el estado "no disponible" y enlaza a
   * los canales oficiales.
   */
  audio?: string[];
};

export type MusicAlbum = {
  id: string;
  title: string;
  artist: string;
  year: string;
  kind: MusicKind;
  source: MusicSource;
  cover: string;
  description: string;
  tracks: MusicTrack[];
  links: MusicLink[];
};

/** Playlist/podcast externo real (YouTube Music) mostrado como sección propia. */
export type MusicPlaylist = {
  id: string;
  title: string;
  platform: string;
  kind: 'Podcast' | 'Playlist';
  href: string;
  icon: MusicLinkIcon;
  description: string;
};

/** Canales y plataformas musicales reales del artista. */
export const MUSIC_PLATFORMS = {
  soundcloud: 'https://soundcloud.com/ciszukoantony',
  youtube: 'https://www.youtube.com/@CiszukoAntony',
  ytmusic: 'https://music.youtube.com/@CiszukoAntony',
  ytmusicPodcast:
    'https://music.youtube.com/playlist?list=RDATjuUCvVoTzHHb5NaV4dl4tg7L9w&playnext=1&si=4u1ED93YWxQjNJfB',
  ytmusicPractice: 'https://music.youtube.com/playlist?list=PL2AoILA-50-onfuMVtItXataVPnmeliZb',
  spotify: 'https://open.spotify.com/user/317nxlvcrrlwfxjogyirixsqjmfi?si=50c43b75eb6e47db',
  muzicmania: 'https://muzicmania.vercel.app/library',
} as const;

const SOUNDCLOUD_LINK: MusicLink = {
  label: 'SoundCloud',
  href: MUSIC_PLATFORMS.soundcloud,
  icon: 'music',
  external: true,
};

/** Pista concreta en SoundCloud (solo slugs verificados). */
const soundcloudTrack = (slug: string): MusicLink => ({
  label: 'SoundCloud',
  href: `${MUSIC_PLATFORMS.soundcloud}/${slug}`,
  icon: 'music',
  external: true,
});

const YOUTUBE_LINK: MusicLink = {
  label: 'YouTube',
  href: MUSIC_PLATFORMS.youtube,
  icon: 'play',
  external: true,
};

const YOUTUBE_MUSIC_LINK: MusicLink = {
  label: 'YouTube Music',
  href: MUSIC_PLATFORMS.ytmusic,
  icon: 'headset',
  external: true,
};

const SPOTIFY_LINK: MusicLink = {
  label: 'Spotify',
  href: MUSIC_PLATFORMS.spotify,
  icon: 'headset',
  external: true,
};

const MUZICMANIA_LINK: MusicLink = {
  label: 'MuzicMania',
  href: MUSIC_PLATFORMS.muzicmania,
  icon: 'gamepad',
  external: true,
};

/** Pista pública en la biblioteca de MuzicMania (misma URL que usa la home). */
const muzicmaniaTrack = (trackId: string): MusicLink => ({
  label: 'Escuchar en MuzicMania',
  href: `${MUSIC_PLATFORMS.muzicmania}?track=${trackId}`,
  icon: 'play',
  external: true,
});

/** Plataformas de escucha, en orden de publicación de la obra propia. */
export const MUSIC_PLATFORM_LINKS: MusicLink[] = [
  SOUNDCLOUD_LINK,
  YOUTUBE_LINK,
  YOUTUBE_MUSIC_LINK,
  SPOTIFY_LINK,
  MUZICMANIA_LINK,
];

/**
 * Podcast y playlists oficiales de YouTube Music. Son listas externas reales:
 * el reproductor de la web no las descarga, pero se muestran como secciones
 * propias del musicboard con su enlace directo.
 */
export const MUSIC_PLAYLISTS: MusicPlaylist[] = [
  {
    id: 'podcast',
    title: 'Podcast',
    platform: 'YouTube Music',
    kind: 'Podcast',
    href: MUSIC_PLATFORMS.ytmusicPodcast,
    icon: 'headset',
    description:
      'Lista oficial del podcast de Ciszuko Antony en YouTube Music: episodios y avisos del ecosistema en formato de audio.',
  },
  {
    id: 'fl-studio-track-practice',
    title: 'FL Studio Track Practice',
    platform: 'YouTube Music',
    kind: 'Playlist',
    href: MUSIC_PLATFORMS.ytmusicPractice,
    icon: 'music',
    description:
      'Playlist oficial del álbum de práctica FL Studio Track Practice 2024: las mismas pistas del musicboard en YouTube Music.',
  },
];

/** Directorio real de la obra propia dentro del repo (espejo en el CDN). */
const MUSICBOARD_ALBUM_DIR = 'projects/ciszukoantony/musicboard/albums/FL Studio Track Practice 2024';

/** Candidato de audio de una pista del musicboard (ruta espejo en el CDN). */
const musicboardAudio = (folder: string, file: string): string =>
  resolveAssetPath(`${MUSICBOARD_ALBUM_DIR}/${folder}/${file}`);

/** Álbum Genesis Neon en el CDN: `.ogg` oficial con fallback `.mp3`. */
const genesisAudio = (trackId: string): string[] => {
  const base = `projects/muzicmania/content/music/albums/genesis_neon/${trackId}/${trackId}`;
  return [resolveAssetPath(`${base}.ogg`), resolveAssetPath(`${base}.mp3`)];
};

/**
 * Obra propia (musicboard): álbum de práctica de estudio 2024 con las pistas
 * maestras en FL Studio, sus portadas reales y sus visuales en vídeo.
 */
export const REAL_ALBUMS: MusicAlbum[] = [
  {
    id: 'fl-studio-track-practice-2024',
    title: 'FL Studio Track Practice 2024',
    artist: 'Ciszuko Antony',
    year: '2024',
    kind: 'Álbum',
    source: 'musicboard',
    cover: '/musicboard/covers/fl-studio-track-practice-2024.png',
    description:
      'Álbum de práctica de estudio de Ciszuko Antony: cuatro pistas compuestas y producidas en FL Studio durante 2024, cada una con su portada y su visual en vídeo. Es la obra propia que abre el catálogo, antes del repertorio de MuzicMania.',
    tracks: [
      {
        id: 'changing-tranquility',
        title: 'Changing Tranquility',
        cover: '/musicboard/covers/changing-tranquility.png',
        note: 'Versión 1.0 · 2024',
        links: [SOUNDCLOUD_LINK, YOUTUBE_LINK],
        audio: [musicboardAudio('Changing Tranquility', 'Changing Tranquility v1.0.mp3')],
      },
      {
        id: 'really-epiphanic',
        title: 'Really Epiphanic (Changing Tranquility v2.0)',
        cover: '/musicboard/covers/really-epiphanic.png',
        note: 'Reinterpretación de Changing Tranquility · 2024',
        links: [SOUNDCLOUD_LINK, YOUTUBE_LINK],
        audio: [
          musicboardAudio('Changing Tranquility', 'Really Epiphanic (Changing Tranquility v2.0).mp3'),
        ],
      },
      {
        id: 'glare-between-keys',
        title: 'Glare Between-keys',
        cover: '/musicboard/covers/glare-between-keys.png',
        note: 'Pista con visual propio · 2024',
        links: [SOUNDCLOUD_LINK, YOUTUBE_LINK],
        audio: [musicboardAudio('Glare Between-keys', 'Glare Between-keys.mp3')],
      },
      {
        id: 'restless-thoughts',
        title: 'Restless Thoughts',
        cover: '/musicboard/covers/restless-thoughts.png',
        note: 'Pista de estudio · 2024',
        // Único slug de SoundCloud verificado en el repo además del perfil.
        links: [soundcloudTrack('restless-thoughts'), YOUTUBE_LINK],
        audio: [musicboardAudio('Restless Thoughts', 'Restless thoughts.mp3')],
      },
    ],
    links: [
      SOUNDCLOUD_LINK,
      YOUTUBE_LINK,
      {
        label: 'Playlist en YouTube Music',
        href: MUSIC_PLATFORMS.ytmusicPractice,
        icon: 'headset',
        external: true,
      },
    ],
  },
];

/**
 * Repertorio producido para MuzicMania: el álbum Genesis Neon da banda sonora
 * al juego de ritmo del ecosistema. Los enlaces por pista abren la biblioteca
 * del juego con la pista seleccionada.
 */
export const MUZICMANIA_ALBUMS: MusicAlbum[] = [
  {
    id: 'genesis-neon',
    title: 'Genesis Neon',
    artist: 'Ciszuko Antony',
    year: '2026',
    kind: 'Banda sonora',
    source: 'muzicmania',
    cover: 'projects/muzicmania/content/music/albums/genesis_neon/cover.png',
    description:
      'Álbum original de MuzicMania: cuatro pistas con arte propio que dan banda sonora al juego de ritmo del ecosistema, jugables con puntuación y progresión en la biblioteca del juego.',
    tracks: [
      {
        id: 'cyber_beat',
        title: 'Cyber Beat',
        cover: 'projects/muzicmania/content/music/albums/genesis_neon/cyber_beat/cover.png',
        note: 'Expert · 140 BPM',
        links: [muzicmaniaTrack('cyber_beat')],
        audio: genesisAudio('cyber_beat'),
      },
      {
        id: 'digital_soul',
        title: 'Digital Soul',
        cover: 'projects/muzicmania/content/music/albums/genesis_neon/digital_soul/cover.png',
        note: 'Hard · 128 BPM',
        links: [muzicmaniaTrack('digital_soul')],
        audio: genesisAudio('digital_soul'),
      },
      {
        id: 'neon_dreams',
        title: 'Neon Dreams',
        cover: 'projects/muzicmania/content/music/albums/genesis_neon/neon_dreams/cover.png',
        note: 'Normal · 124 BPM',
        links: [muzicmaniaTrack('neon_dreams')],
        audio: genesisAudio('neon_dreams'),
      },
      {
        id: 'oled_darkness',
        title: 'OLED Darkness',
        cover: 'projects/muzicmania/content/music/albums/genesis_neon/oled_darkness/cover.png',
        note: 'Easy · 110 BPM',
        links: [muzicmaniaTrack('oled_darkness')],
        audio: genesisAudio('oled_darkness'),
      },
    ],
    links: [MUZICMANIA_LINK, SPOTIFY_LINK],
  },
];

/** Catálogo completo: obra propia primero, repertorio de MuzicMania después. */
export const MUSIC_ALBUMS: MusicAlbum[] = [...REAL_ALBUMS, ...MUZICMANIA_ALBUMS];

export const MUSIC_TRACK_COUNT = MUSIC_ALBUMS.reduce((total, album) => total + album.tracks.length, 0);

/** Pista + álbum al que pertenece (cola del reproductor del musicboard). */
export type MusicQueueItem = { track: MusicTrack; album: MusicAlbum };

/** Cola reproducible completa, en el orden del catálogo. */
export const MUSIC_QUEUE: MusicQueueItem[] = MUSIC_ALBUMS.flatMap((album) =>
  album.tracks.map((track) => ({ track, album })),
);

export const getMusicAlbum = (id: string): MusicAlbum | undefined =>
  MUSIC_ALBUMS.find((album) => album.id === id);

/**
 * Página interna de la obra propia dentro del sitio (siempre `/musicboard`);
 * las plataformas externas abren en pestaña nueva.
 */
export const isMusicCoverLocal = (cover: string): boolean => cover.startsWith('/');
