'use client';

/**
 * Panel de donación Ko-fi (embebido que SÍ funciona).
 *
 * POR QUÉ NO HAY <iframe>:
 * ko-fi.com responde a la página de perfil con
 *   X-Frame-Options: SAMEORIGIN
 *   Content-Security-Policy: frame-ancestors 'self'
 * por lo que cualquier <iframe src="https://ko-fi.com/<usuario>"> es rechazado
 * por el navegador con `ERR_BLOCKED_BY_RESPONSE`. No es un problema de nuestra
 * CSP ni del CDN: es una decisión de Ko-fi y no se puede evitar desde el
 * cliente.
 *
 * La forma soportada de integrarlo es un botón/enlace (el "Ko-fi button"
 * oficial de Ko-fi también es exactamente esto: un enlace con estilo). Aquí se
 * dibuja con el SVG real del CDN de Ciszu Network, sin scripts de terceros, sin
 * CSS remoto y sin imágenes externas.
 */
import React from 'react';
import { Icon } from './Icon';
import CopyWithButton from './CopyWithButton';

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
  className?: string;
}

export default function KoFiPanel({
  handle,
  brandColor = '#FF5E5B',
  title = 'Apoya en Ko-fi',
  description = 'El panel de Ko-fi no se puede incrustar: Ko-fi envía X-Frame-Options SAMEORIGIN y bloquea los iframes. Usa el botón para abrir el perfil y donar en un clic.',
  actionLabel = 'Abrir Ko-fi',
  copyLabel = 'Copiar enlace',
  projectName = handle,
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
    </div>
  );
}
