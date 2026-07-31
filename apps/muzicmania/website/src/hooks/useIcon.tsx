'use client';

import { useState, useEffect } from 'react';
import { resolveIcon, type IconStyle, type IconFormat } from '@ciszunetwork/cdn';
import { Icon, iconUtils } from '@ciszu/ui';

export function useIcon(config: { name: string; style?: IconStyle; format?: IconFormat; size?: number }) {
  const [iconUrl, setIconUrl] = useState<string>('');

  useEffect(() => {
    setIconUrl(resolveIcon(config.name, config.style || 'outline', config.format || 'svg'));
  }, [config]);

  return { iconUrl, source: iconUrl.startsWith('http') ? 'cdn' as const : 'local' as const };
}

export function useIconList() {
  return iconUtils.getAvailableIcons();
}

export function IconComponent({
  name, style = 'outline', format = 'svg', size = 24, className = '', alt = '', inline = false
}: {
  name: string; style?: IconStyle; format?: IconFormat;
  size?: number; className?: string; alt?: string; inline?: boolean;
}) {
  return (
    <Icon
      name={name}
      style={style}
      format={format}
      size={size}
      inline={inline}
      className={`icon icon-${style}${format === 'png' ? ' icon-png' : ''} ${className}`}
      aria-label={alt || `${name} icon`}
    />
  );
}
