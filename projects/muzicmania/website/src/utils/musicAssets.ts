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
