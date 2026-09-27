import React from 'react';
import { SocialIcon } from '@ciszu/ui';
import type { SocialEntry } from '@/data/socials';

/**
 * Tinta de marca legible de una red.
 *
 * X, TikTok y GitHub tienen marcas que son casi negras: sobre el fondo oscuro
 * del portfolio desaparecían. Cada entrada de `src/data/socials.ts` declara su
 * variante oscura y clara, y aquí se resuelve con `color-mix` + la variable
 * `--social-dark-mix` (100% en oscuro, 0% en claro, definida en globals.scss).
 *
 * Se resuelve en CSS —no con el store de tema— para que el HTML del servidor y
 * el del cliente coincidan siempre y no haya errores de hidratación.
 */
export function socialTone(social: SocialEntry): string {
  return `color-mix(in srgb, ${social.ink.dark} var(--social-dark-mix, 100%), ${social.ink.light})`;
}

interface SocialGlyphProps {
  social: SocialEntry;
  size?: number;
  className?: string;
  /** 'social' = tinta de red según tema (por defecto); 'mono' = hereda color. */
  tone?: 'social' | 'mono';
}

/** Icono oficial de una red: usa SocialIcon de @ciszu/ui cuando existe. */
export default function SocialGlyph({ social, size = 22, className = '', tone = 'social' }: SocialGlyphProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={tone === 'social' ? { color: socialTone(social) } : undefined}
      aria-hidden="true"
    >
      {social.ui ? (
        <SocialIcon platform={social.ui} size={size} colored={false} />
      ) : (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
          <path d={social.path} />
        </svg>
      )}
    </span>
  );
}
