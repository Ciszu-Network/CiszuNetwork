'use client';

/**
 * Likes del Changelog (cliente)
 *
 * El registro de cambios es contenido estático, así que el "me gusta" se
 * resuelve 100% en el navegador: el usuario marca/desmarca su voto y queda
 * guardado en `localStorage`, de modo que el contador es real al recargar.
 *
 * El HTML del servidor y el primer render del cliente usan SIEMPRE el valor
 * base (`item.likes`); el voto local se aplica después de hidratar (`ready`),
 * evitando desajustes de hidratación.
 */

import { useCallback, useEffect, useState } from 'react';

export interface UseChangelogLikesResult {
  /** `true` cuando ya se leyó `localStorage` (tras hidratar). */
  ready: boolean;
  /** Contador efectivo: base + voto local. */
  getLikes: (id: string, base?: number) => number;
  /** Si el usuario ya votó esta entrada. */
  isLiked: (id: string) => boolean;
  /** Marca o desmarca el voto y lo persiste. */
  toggleLike: (id: string) => void;
  /** Borra todos los votos locales (limpieza de la clave). */
  reset: () => void;
}

export const CHANGELOG_LIKES_KEY = 'ciszu:changelog-likes:v1';

function readLiked(storageKey: string): Record<string, true> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const liked: Record<string, true> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value) liked[id] = true;
    }
    return liked;
  } catch {
    // localStorage puede estar bloqueado (modo privado, políticas) o corrupto.
    return {};
  }
}

function writeLiked(storageKey: string, liked: Record<string, true>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(liked));
  } catch {
    // Sin persistencia disponible: el estado en memoria sigue funcionando.
  }
}

export function useChangelogLikes(storageKey: string = CHANGELOG_LIKES_KEY): UseChangelogLikesResult {
  const [liked, setLiked] = useState<Record<string, true>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLiked(readLiked(storageKey));
    setReady(true);
  }, [storageKey]);

  const getLikes = useCallback(
    (id: string, base = 0) => (base || 0) + (liked[id] ? 1 : 0),
    [liked],
  );

  const isLiked = useCallback((id: string) => Boolean(liked[id]), [liked]);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      writeLiked(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setLiked({});
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // ignorar
      }
    }
  }, [storageKey]);

  return { ready, getLikes, isLiked, toggleLike, reset };
}
