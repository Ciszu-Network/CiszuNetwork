/**
 * Códigos de verificación de dos pasos (2FA) de CISZU ID.
 *
 * Formato oficial de la clave de Ciszu Network: `C-123 434`
 *   - `C`     letra fija (Ciszu)
 *   - `-`     guion obligatorio
 *   - `123`   tres dígitos
 *   - ` `     un espacio
 *   - `434`   tres dígitos
 *
 * Propiedades del código:
 *   - TEMPORAL: expira a las 3 horas (`AUTH_CODE_TTL_MS`).
 *   - ÚNICO POR WEBSITE: el mismo código solo sirve para la web que lo emitió
 *     (`website` forma parte de la clave).
 *   - REENVIABLE con límites: el reenvío tiene enfriamiento y tope; al superar
 *     el tope se suspende temporalmente el acceso.
 *   - SUSPENSIÓN LOCAL: tras `AUTH_CODE_MAX_ATTEMPTS` intentos fallidos se
 *     bloquea localmente por `AUTH_CODE_SUSPENSION_MS` (el usuario no logró
 *     iniciar sesión, así que no se le deja seguir intentando en bucle).
 *
 * Módulo PURO (sin dependencias, sin I/O): la persistencia y el envío de email
 * viven en las rutas de API; aquí solo está la lógica verificable por tests.
 */

import { describeDuration } from './duration';

/** Prefijo oficial de la clave. */
export const AUTH_CODE_PREFIX = 'C';

/** Vigencia del código: 3 horas. */
export const AUTH_CODE_TTL_MS = 3 * 60 * 60 * 1000;

/** Intentos de verificación fallidos antes de suspender. */
export const AUTH_CODE_MAX_ATTEMPTS = 3;

/** Reenvíos permitidos (sin contar el envío inicial). */
export const AUTH_CODE_MAX_RESENDS = 2;

/** Suspensión temporal cuando se agotan los intentos o los reenvíos. */
export const AUTH_CODE_SUSPENSION_MS = 30 * 60 * 1000;

/** Enfriamiento mínimo entre reenvíos. */
export const AUTH_CODE_RESEND_COOLDOWN_MS = 60 * 1000;

const pad3 = (n: number) => String(n).padStart(3, '0').slice(-3);

/** Genera un código aleatorio con el formato oficial `C-123 434`. */
export function generateAuthCode(random: () => number = Math.random): string {
  const a = Math.floor(random() * 1000);
  const b = Math.floor(random() * 1000);
  return `${AUTH_CODE_PREFIX}-${pad3(a)} ${pad3(b)}`;
}

/** Normaliza cualquier entrada del usuario al formato canónico `C-123 434`. */
export function normalizeAuthCode(input: string): string {
  const raw = (input ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Se acepta con o sin la letra inicial (`123434` o `C123434`).
  const digits = raw.startsWith(AUTH_CODE_PREFIX) ? raw.slice(1) : raw;
  if (digits.length !== 6 || !/^\d{6}$/.test(digits)) return (input ?? '').trim().toUpperCase();
  return `${AUTH_CODE_PREFIX}-${digits.slice(0, 3)} ${digits.slice(3)}`;
}

/** ¿La entrada (ya normalizada o no) tiene el formato exacto de la clave? */
export function isValidAuthCode(input: string): boolean {
  return new RegExp(`^${AUTH_CODE_PREFIX}-\\d{3} \\d{3}$`).test(normalizeAuthCode(input));
}

/** Compara dos códigos ignorando formato (espacios, guion, mayúsculas). */
export function authCodesMatch(a: string, b: string): boolean {
  return normalizeAuthCode(a) === normalizeAuthCode(b);
}

export type AuthCodeState = 'valid' | 'expired' | 'used' | 'suspended' | 'no-code';

export interface AuthCodeStatusInput {
  /** Cuándo se emitió el código (ISO o epoch ms). */
  createdAt: string | number;
  /** Ahora (epoch ms). Por defecto Date.now(). */
  now?: number;
  /** Si el código ya se usó (los códigos son de UN SOLO USO). */
  used?: boolean;
  /** Intentos fallidos acumulados. */
  attempts?: number;
  /** Hasta cuándo dura la suspensión local (epoch ms). */
  suspendedUntil?: number;
  /** Si no hay código emitido para esta web. */
  exists?: boolean;
}

export interface AuthCodeStatus {
  state: AuthCodeState;
  /** ms que le quedan al código (0 si ya no sirve). */
  msLeft: number;
  /** epoch ms de expiración. */
  expiresAt: number;
  /** Código de motivo estable (i18n-friendly). */
  reason: string;
  /** Mensaje listo para mostrar. */
  message: string;
}

const toMs = (v: string | number): number => (typeof v === 'number' ? v : new Date(v).getTime());

/** Estado del código para una web concreta. */
export function evaluateAuthCode(input: AuthCodeStatusInput): AuthCodeStatus {
  const now = input.now ?? Date.now();
  const createdAt = toMs(input.createdAt);
  const expiresAt = createdAt + AUTH_CODE_TTL_MS;
  const base = { msLeft: Math.max(0, expiresAt - now), expiresAt };

  if (input.exists === false) {
    return { ...base, msLeft: 0, state: 'no-code', reason: 'no-code', message: 'No hay ningún código activo. Solicita uno nuevo.' };
  }
  if ((input.suspendedUntil ?? 0) > now) {
    return {
      ...base,
      msLeft: 0,
      state: 'suspended',
      reason: 'suspended',
      message: `Acceso suspendido temporalmente. Podrás volver a intentarlo en ${describeDuration((input.suspendedUntil ?? 0) - now)}.`,
    };
  }
  if (input.used) {
    return { ...base, msLeft: 0, state: 'used', reason: 'used', message: 'Este código ya se usó. Solicita uno nuevo.' };
  }
  if ((input.attempts ?? 0) >= AUTH_CODE_MAX_ATTEMPTS) {
    return {
      ...base,
      msLeft: 0,
      state: 'suspended',
      reason: 'too-many-attempts',
      message: `Demasiados intentos fallidos. Por seguridad suspendimos el acceso ${describeDuration(AUTH_CODE_SUSPENSION_MS)}.`,
    };
  }
  if (now >= expiresAt) {
    return { ...base, msLeft: 0, state: 'expired', reason: 'expired', message: 'El código expiró (dura 3 horas). Solicita uno nuevo.' };
  }
  return { ...base, state: 'valid', reason: 'valid', message: 'Código válido.' };
}

export interface ResendPolicyInput {
  /** Reenvíos ya realizados (el envío inicial no cuenta). */
  resends: number;
  /** Cuándo se envió el último código (ISO o epoch ms). */
  lastSentAt: string | number;
  now?: number;
  cooldownMs?: number;
  maxResends?: number;
}

export interface ResendPolicy {
  allowed: boolean;
  reason: 'allowed' | 'cooldown' | 'max-resends';
  /** ms de espera obligatoria (0 si se puede reenviar ya). */
  waitMs: number;
  remaining: number;
}

/** ¿Se puede reenviar otro código a esta web? */
export function evaluateResend(input: ResendPolicyInput): ResendPolicy {
  const now = input.now ?? Date.now();
  const cooldown = input.cooldownMs ?? AUTH_CODE_RESEND_COOLDOWN_MS;
  const maxResends = input.maxResends ?? AUTH_CODE_MAX_RESENDS;
  const remaining = Math.max(0, maxResends - input.resends);

  if (input.resends >= maxResends) {
    return { allowed: false, reason: 'max-resends', waitMs: 0, remaining: 0 };
  }
  const elapsed = now - toMs(input.lastSentAt);
  if (elapsed < cooldown) {
    return { allowed: false, reason: 'cooldown', waitMs: cooldown - elapsed, remaining };
  }
  return { allowed: true, reason: 'allowed', waitMs: 0, remaining };
}

/** ¿Corresponde suspender el acceso por intentos fallidos acumulados? */
export function shouldSuspend(attempts: number): boolean {
  return attempts >= AUTH_CODE_MAX_ATTEMPTS;
}
