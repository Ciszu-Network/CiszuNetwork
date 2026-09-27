'use client';

import React from 'react';
import CdnImage from '@/components/shared/CdnImage';
import { isMusicCoverLocal } from '@/data/music';

interface MusicCoverProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * Portada musical: las del musicboard viven en `public/musicboard/covers/`
 * (no están en el CDN) y se sirven como imagen local; las de MuzicMania usan
 * SmartImage con el CDN normal.
 */
export default function MusicCover({ src, alt, width, height, className = '' }: MusicCoverProps) {
  if (isMusicCoverLocal(src)) {
    return <img src={src} alt={alt} width={width} height={height} className={className} loading="lazy" />;
  }
  return <CdnImage src={src} alt={alt} width={width} height={height} className={className} />;
}
