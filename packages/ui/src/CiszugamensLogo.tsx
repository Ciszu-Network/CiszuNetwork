'use client';

/**
 * CiszugamensLogo — isotipo oficial de Ciszugamens (C morada + Z azul, degradado,
 * outline) para usar junto a los botones "Discord Server" / comunidad en las webs.
 * Se resuelve por CDN con fallback local. Tamaño por defecto 24px (w/h).
 */
import { assetResolver } from '@ciszunetwork/cdn';

export interface CiszugamensLogoProps {
  size?: number;
  className?: string;
}

export function CiszugamensLogo({ size = 24, className }: CiszugamensLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetResolver.resolve('projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_degradado_outline_color_cpurple_zblue.svg')}
      alt="Ciszugamens"
      width={size}
      height={size}
      className={className ?? ''}
      style={{ objectFit: 'contain' }}
    />
  );
}

export default CiszugamensLogo;