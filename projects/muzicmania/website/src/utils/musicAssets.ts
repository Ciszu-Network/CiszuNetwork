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
 *   1. URL del CDN (resolveAssetPath → Supabase Storage / CDN local en dev).
 *   2. Ruta pública local `/music/albums/...` (copiada a public/music/).
 * El CDN puede fallar en local si el servidor de assets (8788) no está activo;
 * el fallback local garantiza que la música SIEMPRE se reproduzca.
 */
export function trackAudioCandidates(trackId: string): string[] {
  return [
    trackAudio(trackId),
    `/music/albums/genesis_neon/${trackId}/${trackId}.ogg`,
  ];
}

/**
 * Crea un elemento `<audio>` que reproduce un track con FALLBACK automático:
 * prueba cada candidato en orden (CDN → public/music) y usa el primero que
 * cargue correctamente (.ogg). Detección de fallo:
 *   - evento `error` (404, códec, red),
 *   - timeout de red: si en `timeoutMs` no llega `loadeddata`/`canplay`,
 *     se pasa al siguiente candidato.
 * Devuelve el elemento listo; `used()` indica qué fuente se usó.
 */
export function createTrackAudio(
  trackId: string,
  opts?: { volume?: number; loop?: boolean; preload?: 'auto' | 'metadata' | 'none'; timeoutMs?: number }
): { audio: HTMLAudioElement; used: () => string } {
  const candidates = trackAudioCandidates(trackId);
  const timeoutMs = opts?.timeoutMs ?? 8000;
  const audio = new Audio();
  audio.preload = opts?.preload ?? 'auto';
  if (typeof opts?.volume === 'number') audio.volume = opts.volume;
  if (opts?.loop) audio.loop = true;

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