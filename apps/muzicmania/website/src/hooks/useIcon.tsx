'use client';

import { useState, useEffect } from 'react';
import { resolveIcon } from '@ciszunetwork/cdn';

export function useIcon(config: { name: string; style?: 'outline' | 'filled' | 'flag'; format?: 'svg' | 'png'; size?: number }) {
  const [iconUrl, setIconUrl] = useState('');

  useEffect(() => {
    setIconUrl(resolveIcon(config.name, config.style || 'outline', config.format || 'svg'));
  }, [config]);

  return { iconUrl, source: iconUrl.startsWith('http') ? ('cdn' as const) : ('local' as const) };
}

export function useIconList() {
  return [];
}

export function IconComponent({
  name, style = 'outline', format = 'svg', size, className = '', alt = ''
}: {
  name: string; style?: 'outline' | 'filled' | 'flag'; format?: 'svg' | 'png';
  size?: number; className?: string; alt?: string;
}) {
  const { iconUrl, source } = useIcon({ name, style, format, size });

  return (
    <img
      src={iconUrl}
      alt={alt || `${name} icon`}
      className={`icon icon-${style}${format === 'png' ? ' icon-png' : ''} ${className}`}
      data-source={source}
      width={format === 'png' ? size : undefined}
      height={format === 'png' ? size : undefined}
    />
  );
}