'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactNode,
} from 'react';
import { resolveDelivery } from '@ciszunetwork/cdn';

export interface SmartImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError' | 'alt'> {
  /** Texto alternativo de la imagen. */
  alt?: string;
  /** Ruta de Capa 3 (PNG/JPG/GIF). Las variantes de Entrega (avif/webp) se
   *  prueban en cadena y se cae al original si fallan. */
  src: string;
  /** Candidatos extra (ya resueltos) a probar antes del original. */
  variants?: string[];
  fallback?: ReactNode;
  style?: CSSProperties;
}

/**
 * SmartImage: imagen del Sistema de Formatos (Ciszu Network).
 *
 * Capa 4 primero (avif -> webp), Capa 3 como último recurso. En cada error
 * onError baja un escalón; cuando el <img> real carga bien, la cadena para.
 * SSR renderiza la 1ª variante disponible (defensa mínima: navegador moderno).
 */
export default function SmartImage({ src, variants, alt = '', fallback = null, ...rest }: SmartImageProps) {
  const candidates = useMemo(
    () => [variants ?? [], resolveDelivery(src)].flat(),
    [src, variants]
  );
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);
  const idxRef = useRef(idx);
  idxRef.current = idx;

  const onError = useCallback(() => {
    const next = idxRef.current + 1;
    if (next < candidates.length) {
      idxRef.current = next;
      setIdx(next);
    } else {
      setBroken(true);
    }
  }, [candidates.length]);

  if (broken || candidates.length === 0) return fallback;
  const current = candidates[Math.min(idx, candidates.length - 1)];
  return <img src={current} alt={alt} onError={onError} {...rest} />;
}