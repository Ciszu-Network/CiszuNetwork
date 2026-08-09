/**
 * Rate limiter de ventana fija en memoria (caso 3 del plan de caché, 9 ago 2026):
 * usado en el bot (webhook POST /api/votes) para limitar abusos por IP.
 *
 * Ventana por clave (IP). Límite configurable. Sin dependencias.
 */

export interface RateLimiterOptions {
  /** Duración de la ventana en ms. */
  windowMs?: number;
  /** Máximo de hits permitidos por ventana y clave. */
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** ms restantes hasta que se reinicie la ventana. */
  resetInMs: number;
}

/**
 * Fixed-window rate limiter en memoria. `allow()` registra el hit y devuelve
 * si se permite; las ventanas viejas se limpian perezosamente al tocar la clave.
 */
export function createRateLimiter(opts: RateLimiterOptions) {
  const windowMs = opts.windowMs ?? 60_000;
  const { max } = opts;
  const windows = new Map<string, { count: number; startedAt: number }>();

  function prune(key: string, now: number): void {
    const entry = windows.get(key);
    if (entry && now - entry.startedAt >= windowMs) windows.delete(key);
    if (windows.size > 10_000) {
      // saneamiento global ocasional
      for (const [k, e] of windows) {
        if (now - e.startedAt >= windowMs) windows.delete(k);
      }
    }
  }

  function allow(key: string): RateLimitResult {
    const now = Date.now();
    prune(key, now);
    const entry = windows.get(key) ?? { count: 0, startedAt: now };
    if (entry.count >= max) {
      return { allowed: false, remaining: 0, resetInMs: windowMs - (now - entry.startedAt) };
    }
    entry.count += 1;
    windows.set(key, entry);
    return { allowed: true, remaining: max - entry.count, resetInMs: windowMs - (now - entry.startedAt) };
  }

  function reset(key: string): void {
    windows.delete(key);
  }

  return { allow, reset, size: () => windows.size };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;