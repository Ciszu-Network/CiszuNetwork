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
  /** Ruta local (public/) como fallback final si CDN falla persistentemente. */
  fallbackLocal?: string;
  style?: CSSProperties;
}

/**
 * SmartImage: imagen del Sistema de Formatos (Ciszu Network).
 *
 * Capa 4 primero (webp), Capa 3 como último recurso. En cada error
 * onError baja un escalón; cuando el <img> real carga bien, la cadena para.
 * SSR renderiza la 1ª variante disponible (defensa mínima: navegador moderno).
 *
 * Fix: reintento transitorio del último candidato (rate-limit flaky de CDN).
 * Si el último candidato falla, reintenta 3 veces con backoff (500/1500/5000ms)
 * añadiendo ?retry=N para forzar cache-bust. Si persiste, usa fallbackLocal
 * (ruta /public/) si se proporcionó, o muestra fallback.
 */
export default function SmartImage({ src, variants, alt = '', fallback = null, fallbackLocal, style, ...rest }: SmartImageProps) {
  const candidates = useMemo(
    () => [variants ?? [], resolveDelivery(src)].flat(),
    [src, variants]
  );
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const idxRef = useRef(idx);
  const retryRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  idxRef.current = idx;
  retryRef.current = retryCount;

  const RETRY_DELAYS = [500, 1500, 5000];
  const isLastCandidate = idxRef.current >= candidates.length - 1;

  const onError = useCallback(() => {
    const next = idxRef.current + 1;
    if (next < candidates.length) {
      idxRef.current = next;
      setIdx(next);
      setRetryCount(0);
    } else if (isLastCandidate && retryRef.current < RETRY_DELAYS.length) {
      // Último candidato: reintento transitorio con cache-bust
      const attempt = retryRef.current;
      const delay = RETRY_DELAYS[attempt];
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setRetryCount(attempt + 1);
        // Forzar recarga del mismo candidato con query única
        setIdx(idxRef.current);
      }, delay);
    } else {
      // Agotados reintentos: probar fallbackLocal si existe
      if (fallbackLocal && !src.startsWith('http') && !src.startsWith('//')) {
        setBroken(true);
      } else {
        setBroken(true);
      }
    }
  }, [candidates.length, fallbackLocal, src]);

  if (broken || candidates.length === 0) {
    if (fallbackLocal) {
      return <img src={fallbackLocal} alt={alt} style={style} {...rest} />;
    }
    return fallback;
  }

  const current = candidates[Math.min(idx, candidates.length - 1)];
  const retryQuery = retryCount > 0 && isLastCandidate ? `?retry=${retryCount}&t=${Date.now()}` : '';
  return <img src={current + retryQuery} alt={alt} onError={onError} style={style} {...rest} />;
}