/**
 * Estado en el navegador del flujo de recuperación de contraseña.
 *
 * QUÉ RESUELVE: antes, cuando el enlace de recuperación fallaba, la página solo
 * decía "Enlace inválido" sin motivo. No sabíamos POR QUÉ había fallado porque
 * Supabase comunica el motivo en el hash de la URL (`#error=access_denied&
 * error_code=otp_expired`) y nadie lo leía. Tampoco se sabía "desde cuándo"
 * estaba inválido, así que no se podía informar de eso al usuario.
 *
 * Aquí:
 *   - `parseRecoveryHash` traduce el hash de Supabase a un motivo estable.
 *   - La marca de sesión evita el falso "inválido" al remontar la página
 *     (React StrictMode ejecuta el efecto dos veces y la segunda vez el hash ya
 *     no está — ese era el bug reportado: "cambio la contraseña y de repente
 *     dice inválido").
 *   - Se recuerda cuándo se pidió el enlace para poder calcular cuándo caducó.
 *
 * Todas las funciones de almacenamiento toleran entornos sin `sessionStorage`
 * (SSR, modo privado estricto) y nunca lanzan.
 */

import { RECOVERY_LINK_TTL_MS } from './authRecovery';

export const RECOVERY_SESSION_MARKER_KEY = 'ciszu:recovery-session';
export const RECOVERY_REQUESTED_AT_KEY = 'ciszu:recovery-requested-at';
export const RECOVERY_REQUESTS_KEY = 'ciszu:recovery-requests';
export const RECOVERY_INVALID_SINCE_KEY = 'ciszu:recovery-invalid-since';

/** Motivos que Supabase comunica en el hash del enlace de recuperación. */
export type SupabaseRecoveryReason = 'expired' | 'used' | 'invalid' | null;

export interface ParsedRecoveryHash {
  /** Hay un token utilizable (`access_token` o `code`). */
  hasToken: boolean;
  /** Motivo traducido, listo para `evaluateRecoveryLink`. */
  reason: SupabaseRecoveryReason;
  /** Código crudo de Supabase (`otp_expired`, `access_denied`...). */
  errorCode: string | null;
  errorDescription: string | null;
  /** Token encontrado, si lo hay. */
  token: string | null;
  /** Tipo de token (`recovery`, `signup`...). */
  type: string | null;
}

/**
 * Lee el hash de la URL.
 *
 * Ojo: `window.location.hash` (con `#`) NO llega al servidor, así que esto es
 * necesariamente cliente. El hash puede contener a la vez el token y un error.
 */
export function parseRecoveryHash(hash: string): ParsedRecoveryHash {
  const raw = (hash ?? '').startsWith('#') ? hash.slice(1) : (hash ?? '');
  const params = new URLSearchParams(raw);

  const accessToken = params.get('access_token');
  const code = params.get('code');
  const token = accessToken ?? code;
  const errorCode = params.get('error_code') ?? params.get('error');
  const errorDescription = params.get('error_description');

  let reason: SupabaseRecoveryReason = null;
  if (errorCode === 'otp_expired') reason = 'expired';
  else if (errorCode === 'access_denied') reason = 'used';
  else if (errorCode) reason = 'invalid';

  return {
    hasToken: Boolean(token),
    reason,
    errorCode: errorCode ?? null,
    errorDescription: errorDescription ? errorDescription.replace(/\+/g, ' ') : null,
    token: token ?? null,
    type: params.get('type'),
  };
}

function safeSession(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Marca de "esta pestaña ya tenía sesión de recuperación válida". */
export function writeSessionMarker(at: number = Date.now()): void {
  safeSession()?.setItem(RECOVERY_SESSION_MARKER_KEY, String(at));
}

export function readSessionMarker(): { at: number } | null {
  const raw = safeSession()?.getItem(RECOVERY_SESSION_MARKER_KEY);
  if (!raw) return null;
  const at = Number(raw);
  return Number.isFinite(at) ? { at } : null;
}

/** Cuándo se pidió el último enlace (para calcular la caducidad exacta). */
export function writeRequestedAt(at: number = Date.now()): void {
  safeSession()?.setItem(RECOVERY_REQUESTED_AT_KEY, String(at));
}

export function readRequestedAt(): number | null {
  const raw = safeSession()?.getItem(RECOVERY_REQUESTED_AT_KEY);
  if (!raw) return null;
  const at = Number(raw);
  return Number.isFinite(at) ? at : null;
}

/** Historial de peticiones para el límite de 12 horas. */
export function readRequestTimestamps(): number[] {
  const raw = safeSession()?.getItem(RECOVERY_REQUESTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
  } catch {
    return [];
  }
}

/** Registra una petición nueva y devuelve el historial actualizado. */
export function recordRecoveryRequest(at: number = Date.now()): number[] {
  const next = [...readRequestTimestamps(), at];
  try {
    safeSession()?.setItem(RECOVERY_REQUESTS_KEY, JSON.stringify(next));
  } catch {
    /* sin almacenamiento: el límite se aplicará solo por servidor */
  }
  return next;
}

/**
 * Instante en que el enlace pasó a ser inválido, si se puede deducir.
 *
 * Si se sabe cuándo se pidió, el enlace caducó exactamente
 * `requestedAt + RECOVERY_LINK_TTL_MS` (el TTL de Supabase, 1 hora). Si no, se
 * usa el primer momento en que detectamos el fallo en esta pestaña.
 */
export function resolveInvalidSince(
  now: number = Date.now(),
  requestedAt: number | null = readRequestedAt(),
): number | null {
  const stored = safeSession()?.getItem(RECOVERY_INVALID_SINCE_KEY);
  const storedMs = stored ? Number(stored) : NaN;

  const candidate =
    requestedAt !== null && Number.isFinite(requestedAt)
      ? requestedAt + RECOVERY_LINK_TTL_MS
      : Number.isFinite(storedMs)
        ? storedMs
        : now;

  if (!Number.isFinite(storedMs)) {
    try {
      safeSession()?.setItem(RECOVERY_INVALID_SINCE_KEY, String(candidate));
    } catch {
      /* ignorado */
    }
  }

  return Math.min(candidate, now);
}

/** Limpia las marcas del flujo (tras cambiar la contraseña con éxito). */
export function clearRecoveryMarkers(): void {
  const storage = safeSession();
  if (!storage) return;
  for (const key of [
    RECOVERY_SESSION_MARKER_KEY,
    RECOVERY_REQUESTED_AT_KEY,
    RECOVERY_REQUESTS_KEY,
    RECOVERY_INVALID_SINCE_KEY,
  ]) {
    try {
      storage.removeItem(key);
    } catch {
      /* ignorado */
    }
  }
}
