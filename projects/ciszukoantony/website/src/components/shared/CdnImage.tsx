'use client';

import React from 'react';
import { SmartImage } from '@ciszu/ui';
import { assetResolver } from '@ciszunetwork/cdn';

type BrandImageProps = React.ComponentProps<typeof SmartImage>;

/**
 * Imagen del CDN con el PNG original como PRIMER candidato.
 *
 * Muchos assets del repo aún no tienen derivada `.webp` en el CDN; pedirla
 * devuelve un 400 que el navegador bloquea con ORB. En SSR/hidratación ese
 * error puede perderse antes de que React enganche `onError` y la imagen queda
 * rota. Aquí el PNG resuelto (CDN o local) va primero y la cadena normal de
 * `resolveDelivery` (webp → original) queda como respaldo.
 */
export default function BrandImage({ src, variants, ...rest }: BrandImageProps) {
  return <SmartImage src={src} variants={[assetResolver.resolve(src), ...(variants ?? [])]} {...rest} />;
}
