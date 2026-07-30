import React from 'react';
import { resolveIcon, assetResolver } from '@ciszunetwork/cdn';

export type IconStyle = 'outline' | 'filled' | 'flag';
export type IconFormat = 'svg' | 'png';

export interface IconConfig {
  style: IconStyle;
  name: string;
  format?: IconFormat;
  size?: number;
  useCDN?: boolean;
}

export interface IconResult {
  url: string;
  source: 'local' | 'cdn';
  metadata: {
    style: IconStyle;
    name: string;
    format: IconFormat;
    size?: number;
  };
}

export function resolveContentAsset(path: string): string {
  return assetResolver.resolve(`apps/ciszubot/${path}`);
}

class IconSystem {
  getIcon(config: IconConfig): Promise<IconResult> {
    const format = config.format || 'svg';
    const forceCdn = config.useCDN !== false;
    const url = resolveIcon(config.name, config.style, format, forceCdn ? undefined : { forceLocal: true });
    return Promise.resolve({
      url,
      source: url.startsWith('http') ? 'cdn' : 'local',
      metadata: { style: config.style, name: config.name, format }
    });
  }

  setMode() { return this; }
  setCdnBase() { return this; }
}

export function iconPath(style: IconStyle, name: string, format: IconFormat = 'svg'): string {
  return resolveIcon(name, style, format, { forceLocal: true });
}

export function cdnIconUrl(style: IconStyle, name: string, format: IconFormat = 'svg'): string {
  return resolveIcon(name, style, format, { forceCdn: true });
}

export const icons = new IconSystem();

export function useIcon(config: IconConfig) {
  const [iconUrl, setIconUrl] = React.useState<string>('');
  const [source, setSource] = React.useState<'local' | 'cdn'>('local');

  React.useEffect(() => {
    icons.getIcon(config).then(result => {
      setIconUrl(result.url);
      setSource(result.source);
    });
  }, [config]);

  return { iconUrl, source };
}

export default IconSystem;