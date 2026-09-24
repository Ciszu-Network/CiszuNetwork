'use client';

/**
 * KoFiEmbed — widget iframe OFICIAL de Ko-fi (el que Ko-fi permite incrustar).
 *
 * POR QUÉ ESTE IFRAME SÍ FUNCIONA Y EL DEL PERFIL NO:
 *   - `https://ko-fi.com/<usuario>` (perfil a secas) responde con
 *     `X-Frame-Options: SAMEORIGIN` + `frame-ancestors 'self'` → el navegador lo
 *     bloquea con `ERR_BLOCKED_BY_RESPONSE` ("ko-fi.com rechazó la conexión").
 *     Ninguna web puede saltarse eso: es política de Ko-fi, no CORS ni nuestra CSP.
 *   - El generador oficial de Ko-fi produce un iframe con los parámetros
 *     `hidefeed=true&widget=true&embed=true&preview=true`, y ESOS parámetros son
 *     los que Ko-fi autoriza para incrustar. Es el mismo markup que ofrece
 *     Ko-fi en "Embed your page" y el único soportado.
 *
 * No hay fetch cross-origin nuestro, así que no hay problema de CORS: el iframe
 * carga contenido de ko-fi.com bajo su propio origen. La CSP de las 4 webs ya
 * incluye `https://ko-fi.com` en `frame-src`.
 */

import React from 'react';

export interface KoFiEmbedProps {
  /** Usuario de Ko-fi sin la barra (p. ej. `ciszukoantony`). */
  handle: string;
  /** Alto del iframe en px (Ko-fi recomienda ~712). */
  height?: number;
  /** Título accesible del iframe. */
  title?: string;
  /** Color de fondo del marco (el widget oficial usa #f9f9f9). */
  background?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function KoFiEmbed({
  handle,
  height = 712,
  title,
  background = '#f9f9f9',
  className = '',
  style,
}: KoFiEmbedProps) {
  const src = `https://ko-fi.com/${handle}/?hidefeed=true&widget=true&embed=true&preview=true`;

  return (
    <iframe
      id={`kofiframe-${handle}`}
      src={src}
      title={title ?? `Apoya a ${handle} en Ko-fi`}
      height={height}
      loading="lazy"
      allow="payment"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      className={className}
      style={{
        border: 'none',
        width: '100%',
        padding: 4,
        background,
        borderRadius: 16,
        ...style,
      }}
    />
  );
}
