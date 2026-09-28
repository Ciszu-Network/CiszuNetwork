'use client';

import React from 'react';
import { Icon } from '@ciszu/ui';
import type { MusicLink } from '@/data/music';

/**
 * Pastilla de enlace musical externo (SoundCloud, YouTube, YouTube Music,
 * Spotify, MuzicMania…) con el icono real del catálogo. Se usa en el
 * reproductor y en el lateral del musicboard para no duplicar markup.
 */
export default function MusicLinkPill({
  link,
  compact = false,
  onOpen,
}: {
  link: MusicLink;
  /** Versión pequeña para filas del lateral. */
  compact?: boolean;
  onOpen?: () => void;
}) {
  const size = compact
    ? 'px-3 py-2 rounded-lg text-[9px] gap-1.5'
    : 'px-4 py-2.5 rounded-xl text-[10px] gap-2';
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onOpen}
      className={`inline-flex items-center border font-header font-black uppercase tracking-widest transition-all bg-white/5 border-white/10 text-white hover:bg-neon-cyan/15 hover:border-neon-cyan/50 hover:text-neon-cyan ${size}`}
    >
      <Icon name={link.icon} size={compact ? 11 : 13} />
      {link.label}
      <Icon name="external" size={compact ? 9 : 11} className="opacity-60" />
    </a>
  );
}
