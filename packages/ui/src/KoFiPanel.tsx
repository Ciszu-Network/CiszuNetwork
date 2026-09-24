'use client';

/**
 * Panel de donación Ko-fi con el widget iframe OFICIAL.
 *
 * Usa `KoFiEmbed` (obligatorio): el iframe con los parámetros
 * `hidefeed=true&widget=true&embed=true&preview=true`, que es el único que
 * Ko-fi autoriza para incrustar. El perfil a secas (`https://ko-fi.com/<user>`)
 * responde con `X-Frame-Options: SAMEORIGIN` → `ERR_BLOCKED_BY_RESPONSE`.
 *
 * Se mantiene como respaldo un enlace directo ("Abrir Ko-fi") y el botón de
 * copiar enlace, para navegadores/extractor que no carguen el iframe.
 */
import React from 'react';
import { Icon } from './Icon';
import CopyWithButton from './CopyWithButton';
import KoFiEmbed from './KoFiEmbed';

export interface KoFiPanelProps {
  /** Usuario de Ko-fi sin la barra (p. ej. `ciszubot`). */
  handle: string;
  /** Color de marca de Ko-fi. */
  brandColor?: string;
  /** Título visible. */
  title?: string;
  /** Texto explicativo bajo el título. */
  description?: string;
  /** Etiqueta del botón principal. */
  actionLabel?: string;
  /** Etiqueta del botón de copiar enlace. */
  copyLabel?: string;
  /** Nombre del proyecto para el `aria-label` del icono. */
  projectName?: string;
  /** Alto del widget iframe. */
  height?: number;
  className?: string;
}

export default function KoFiPanel({
  handle,
  brandColor = '#FF5E5B',
  title = 'Apoya en Ko-fi',
  description = 'Dona directamente con el widget oficial de Ko-fi. También puedes abrir el perfil en una pestaña nueva.',
  actionLabel = 'Abrir Ko-fi',
  copyLabel = 'Copiar enlace',
  projectName = handle,
  height = 712,
  className = '',
}: KoFiPanelProps) {
  const href = `https://ko-fi.com/${handle}`;

  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
      style={{
        borderColor: `${brandColor}55`,
        background: `linear-gradient(135deg, ${brandColor}1f, transparent 65%)`,
      }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <span
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shrink-0"
          style={{ background: `${brandColor}22`, color: brandColor }}
        >
          <Icon name="kofi" style="brand" size={30} />
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="font-header font-bold text-base text-white">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/60">{description}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: brandColor }}
              aria-label={`${actionLabel} — ${projectName}`}
            >
              <Icon name="kofi" style="filled" color="#ffffff" size={14} />
              {actionLabel}
            </a>
            <CopyWithButton value={href} label={copyLabel} size="sm">
              <span className="text-[11px] font-mono break-all text-white/60">{href}</span>
            </CopyWithButton>
          </div>
        </div>
      </div>

      {/* Widget iframe oficial de Ko-fi (único embed soportado). */}
      <div className="mt-5 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10">
        <KoFiEmbed handle={handle} height={height} />
      </div>
    </div>
  );
}
