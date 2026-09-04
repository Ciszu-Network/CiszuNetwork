import { resolveAssetPath } from '@ciszunetwork/cdn';

const GENESIS_NEON = 'projects/muzicmania/content/music/albums/genesis_neon';

export function musicAsset(trackId: string, file: string): string {
  return resolveAssetPath(`${GENESIS_NEON}/${trackId}/${file}`);
}

export function trackAudio(trackId: string): string {
  return musicAsset(trackId, `${trackId}.ogg`);
}

export function trackCover(trackId: string): string {
  return musicAsset(trackId, 'cover.png');
}

export function trackDisc(trackId: string): string {
  return musicAsset(trackId, 'disc.svg');
}

export function trackBanner(trackId: string): string {
  return musicAsset(trackId, 'banner.png');
}

/**
 * Candidatos de audio para un track, de más a menos preferente:
 *   1. CDN `.ogg`  — `resolveAssetPath` (Supabase Storage en prod; servidor
 *                    local 8788 en dev). Es la entrega oficial: el CDN sirve
 *                    los 4 niveles en `.ogg`/`.opus`/`.mp3` (200, audio/*).
 *   2. CDN `.opus` — misma ruta con la derivada `.opus` (menos peso), por si
 *                    algún día el `.ogg` del CDN falta (también audio/*).
 *   3. Pública `.ogg` — `/music/albums/...` copia local de DEV (`public/music`
 *                    está gitignored para `.ogg` y NO llega al deploy).
 * El CDN puede fallar (CSP antigua sin Supabase en media-src, servidor 8788
 * apagado o red lenta); el fallback local de dev garantiza que la música se
 * reproduzca igualmente al trabajar sin el servidor de assets.
 *
 * ⚠️ NO usar la copia pública `.opus` como fallback: Vercel/Next la sirven como
 * `application/octet-stream` (+ `X-Content-Type-Options: nosniff` del middleware)
 * y los navegadores se niegan a decodificarla. El `.opus` SOLO funciona desde el
 * CDN, que responde `audio/opus`. Por eso el `.opus` del repo en `public/music/`
 * es solo el origen de subida al CDN, no una fuente de reproducción.
 */
export function trackAudioCandidates(trackId: string): string[] {
  return [
    trackAudio(trackId),
    musicAsset(trackId, `${trackId}.opus`),
    `/music/albums/genesis_neon/${trackId}/${trackId}.ogg`,
  ];
}

/**
 * Crea un elemento `<audio>` que reproduce un track con FALLBACK automático:
 * prueba cada candidato en orden (CDN .ogg → CDN .opus → public .ogg local) y
 * usa el primero que cargue correctamente. Detección de fallo:
 *   - evento `error` (404, códec, red o CSP que bloquea la carga),
 *   - timeout de red: si en `timeoutMs` no llega `loadeddata`/`canplay`,
 *     se pasa al siguiente candidato.
 * Devuelve el elemento listo; `used()` indica qué fuente se usó.
 */
export function createTrackAudio(
  trackId: string,
  opts?: { volume?: number; loop?: boolean; preload?: 'auto' | 'metadata' | 'none'; timeoutMs?: number; crossOrigin?: string }
): { audio: HTMLAudioElement; used: () => string } {
  const candidates = trackAudioCandidates(trackId);
  const timeoutMs = opts?.timeoutMs ?? 8000;
  const audio = new Audio();
  audio.preload = opts?.preload ?? 'auto';
  if (typeof opts?.volume === 'number') audio.volume = opts.volume;
  if (opts?.loop) audio.loop = true;
  // crossOrigin 'anonymous' SOLO donde hace falta (el audio del store se enruta
  // por Web Audio API con createMediaElementSource, que exige medios CORS-clean;
  // sin él el CDN cruza dominios y el analyser queda mudo). Debe fijarse ANTES
  // de empezar a cargar candidatos. El CDN (Supabase en prod, 8788 en dev) envía
  // Access-Control-Allow-Origin; el fallback local /music es same-origin.
  if (opts?.crossOrigin) audio.crossOrigin = opts.crossOrigin;

  let idx = 0;
  let settled = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
  };

  const loadCandidate = (i: number) => {
    if (i >= candidates.length || settled) return;
    idx = i + 1;
    audio.src = candidates[i];
    clearTimer();
    // Si no carga en el timeout, probamos el siguiente candidato.
    timeoutId = setTimeout(() => {
      if (!settled) loadCandidate(idx);
    }, timeoutMs);
  };

  const onOk = () => { settled = true; clearTimer(); };
  audio.addEventListener('loadeddata', onOk);
  audio.addEventListener('canplay', onOk);
  audio.addEventListener('error', () => {
    if (!settled) loadCandidate(idx);
  });

  loadCandidate(0);
  return {
    audio,
    used: () => candidates[idx - 1] ?? candidates[0],
  };
}