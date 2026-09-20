/**
 * Estado de los enlaces de recuperación de contraseña (CISZU ID).
 *
 * Reglas de negocio que este módulo hace verificables:
 *   - El enlace de recuperación es de UN SOLO USO y caduca (`RECOVERY_LINK_TTL_MS`).
 *   - NUNCA se inicia sesión si el enlace no es válido: primero se verifica.
 *   - Si el enlace falla se explica el MOTIVO y desde cuándo está inválido.
 *   - Al pedir un enlace nuevo, los anteriores quedan SUSTITUIDOS (no pueden
 *     usarse dos enlaces a la vez).
 *   - Pedir enlaces repetidamente en poco tiempo obliga a esperar 12 horas.
 *   - La contraseña nueva no puede ser igual a la anterior.
 *   - La sesión de recuperación es TEMPORAL: al cambiarla se cierra sola.
 *
 * Módulo PURO (sin dependencias, sin I/O). La persistencia vive en las rutas de
 * API y el estado de la sesión en el cliente.
 */

import { describeDuration } from './duration';

/** Vigencia de un enlace de recuperación (1 hora, igual que Supabase). */
export const RECOVERY_LINK_TTL_MS = 60 * 60 * 1000;

/** Ventana de espera cuando se piden demasiados enlaces seguidos. */
export const RECOVERY_REQUEST_COOLDOWN_MS = 12 * 60 * 60 * 1000;

/** Peticiones permitidas dentro de la ventana antes de bloquear 12 h. */
export const RECOVERY_MAX_REQUESTS = 3;

/** Ventana en la que se cuentan las peticiones. */
export const RECOVERY_REQUEST_WINDOW_MS = 60 * 60 * 1000;

/** Longitud mínima de la contraseña nueva. */
export const RECOVERY_MIN_PASSWORD_LENGTH = 8;

export type RecoveryLinkState = 'verified' | 'expired' | 'used' | 'superseded' | 'invalid' | 'missing';

export type RecoverySeverity = 'warning' | 'info';

export interface RecoveryLinkInput {
  /** ¿Hay token en la URL (`code`, `token_hash` o `#access_token`)? */
  hasToken: boolean;
  /** ¿Supabase ya entregó una sesión de recuperación? */
  hasSession: boolean;
  /** Marca en sessionStorage de una montura previa (evita el falso "inválido"). */
  sessionMarker?: { at: number } | null;
  now?: number;
  /** Estado reportado por el servidor/emisión, si se conoce. */
  issuedAt?: string | number | null;
  usedAt?: string | number | null;
  supersededAt?: string | number | null;
  reason?: 'expired' | 'used' | 'superseded' | 'invalid' | 'missing' | null;
}

export interface RecoveryLinkStatus {
  state: RecoveryLinkState;
  /** El usuario ya puede escribir su contraseña nueva. */
  canSetPassword: boolean;
  severity: RecoverySeverity;
  title: string;
  message: string;
  /** Desde cuándo el enlace no sirve (epoch ms), si se conoce. */
  invalidSince: number | null;
  /** Texto legible del tiempo que lleva inválido ("2 h 15 min"). */
  invalidFor: string | null;
}

const toMs = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined) return null;
  const ms = typeof v === 'number' ? v : new Date(v).getTime();
  return Number.isFinite(ms) ? ms : null;
};

/**
 * Decide el estado del enlace de recuperación.
 *
 * Importante: si hubo sesión de recuperación antes (marca en sessionStorage) el
 * enlace NO se considera inválido aunque el hash ya haya sido consumido por
 * supabase-js. Ese era el bug que hacía que un enlace válido pasara a "inválido"
 * al remontar la página (React StrictMode ejecuta el efecto dos veces y la
 * segunda vez el hash ya no está).
 */
export function evaluateRecoveryLink(input: RecoveryLinkInput): RecoveryLinkStatus {
  const now = input.now ?? Date.now();

  const verified = (): RecoveryLinkStatus => ({
    state: 'verified',
    canSetPassword: true,
    severity: 'info',
    title: 'Enlace verificado',
    message: 'Establece tu contraseña nueva. El enlace es de un solo uso y la sesión se cerrará al guardarla.',
    invalidSince: null,
    invalidFor: null,
  });

  if (input.hasSession) return verified();

  // Sin hash ni sesión, pero con marca previa: el enlace YA funcionó en esta
  // pestaña. Se continúa el proceso en vez de declararlo inválido.
  if (input.sessionMarker && now - input.sessionMarker.at < RECOVERY_LINK_TTL_MS) return verified();

  const fail = (
    state: RecoveryLinkState,
    title: string,
    message: string,
    since: number | null,
  ): RecoveryLinkStatus => ({
    state,
    canSetPassword: false,
    severity: 'warning',
    title,
    message,
    invalidSince: since,
    invalidFor: since === null ? null : describeDuration(now - since),
  });

  const supersededAt = toMs(input.supersededAt);
  if (supersededAt !== null) {
    return fail('superseded', 'Enlace reemplazado', 'Pediste un enlace más reciente, así que este quedó anulado. Usa el último correo o solicita uno nuevo.', supersededAt);
  }

  const usedAt = toMs(input.usedAt);
  if (usedAt !== null) {
    return fail('used', 'Enlace ya utilizado', 'Este enlace es de un solo uso y ya se usó. Por seguridad solicita uno nuevo.', usedAt);
  }

  const issuedAt = toMs(input.issuedAt);
  if (issuedAt !== null && now - issuedAt >= RECOVERY_LINK_TTL_MS) {
    return fail('expired', 'Enlace expirado', 'El enlace de recuperación caducó. Solicita uno nuevo: tardarás menos de un minuto.', issuedAt + RECOVERY_LINK_TTL_MS);
  }

  if (input.reason === 'invalid' || !input.hasToken) {
    return fail(
      'invalid',
      'Enlace inválido',
      'No pudimos validar este enlace: está incompleto, fue copiado a medias o pertenece a otra web. Revisa el último correo o solicita uno nuevo.',
      null,
    );
  }

  return fail('missing', 'Falta el enlace', 'Abre el enlace completo del correo de recuperación o solicita uno nuevo.', null);
}

export interface RecoveryRequestInput {
  /** Timestamps (epoch ms o ISO) de las peticiones recientes. */
  timestamps: Array<string | number>;
  now?: number;
  windowMs?: number;
  maxRequests?: number;
  cooldownMs?: number;
}

export interface RecoveryRequestPolicy {
  allowed: boolean;
  reason: 'allowed' | 'rate-limited';
  /** ms que debe esperar antes de volver a pedir. */
  waitMs: number;
  retryAt: number | null;
  remaining: number;
}

/** ¿Puede pedir otro enlace de recuperación, o debe esperar 12 horas? */
export function evaluateRecoveryRequest(input: RecoveryRequestInput): RecoveryRequestPolicy {
  const now = input.now ?? Date.now();
  const windowMs = input.windowMs ?? RECOVERY_REQUEST_WINDOW_MS;
  const maxRequests = input.maxRequests ?? RECOVERY_MAX_REQUESTS;
  const cooldownMs = input.cooldownMs ?? RECOVERY_REQUEST_COOLDOWN_MS;

  const recent = input.timestamps
    .map((t) => toMs(t))
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);

  const inWindow = recent.filter((t) => now - t < windowMs);
  const remaining = Math.max(0, maxRequests - inWindow.length);

  if (remaining > 0) {
    return { allowed: true, reason: 'allowed', waitMs: 0, retryAt: null, remaining };
  }

  // Se bloquea 12 h desde la última petición.
  const last = inWindow[inWindow.length - 1] ?? now;
  const retryAt = last + cooldownMs;
  return {
    allowed: false,
    reason: 'rate-limited',
    waitMs: Math.max(0, retryAt - now),
    retryAt,
    remaining: 0,
  };
}

export interface NewPasswordInput {
  next: string;
  confirm: string;
  /** Contraseña actual (para impedir reutilizarla). */
  previous?: string | null;
  minLength?: number;
}

export interface NewPasswordResult {
  ok: boolean;
  errors: string[];
}

/** Valida la contraseña nueva: longitud, confirmación y NO reutilización. */
export function validateNewPassword(input: NewPasswordInput): NewPasswordResult {
  const minLength = input.minLength ?? RECOVERY_MIN_PASSWORD_LENGTH;
  const errors: string[] = [];
  const next = input.next ?? '';

  if (next.length < minLength) errors.push(`La contraseña debe tener al menos ${minLength} caracteres.`);
  if (next !== (input.confirm ?? '')) errors.push('Las contraseñas no coinciden.');
  if (input.previous && next.length > 0 && next === input.previous) {
    errors.push('La contraseña nueva no puede ser igual a la anterior.');
  }

  return { ok: errors.length === 0, errors };
}

/** Recordatorio permanente del contrato del enlace. */
export const RECOVERY_ONE_USE_NOTICE =
  'El enlace de recuperación es de un solo uso y caduca en 1 hora. Mientras no lo uses, tu contraseña actual sigue activa.';
