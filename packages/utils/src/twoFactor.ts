/**
 * Servicio de códigos 2FA por email (CISZU ID).
 *
 * SIN ESTE MÓDULO: cada web tenía su propia copia de las rutas
 * `/api/auth/2fa/*` y todas compartían tres defectos:
 *   1. `if (!rateLimiter.allow(ip))` — `allow` devuelve un OBJETO, siempre
 *      verdadero, así que el límite de peticiones NUNCA se aplicaba.
 *   2. El código se generaba pero no se enviaba a nadie (había un `TODO` y un
 *      `console.log`), así que el 2FA era inutilizable.
 *   3. No había control de intentos ni de reenvíos: se podía probar códigos
 *      indefinidamente.
 *
 * Aquí está el comportamiento completo y verificable. La persistencia y el
 * envío se inyectan (`TwoFactorStore`, `TwoFactorMailer`) para que el servicio
 * sea comprobable y para no acoplar este paquete a Supabase ni a un proveedor
 * de email concreto.
 */

import {
  AUTH_CODE_MAX_ATTEMPTS,
  AUTH_CODE_MAX_RESENDS,
  AUTH_CODE_PREFIX,
  AUTH_CODE_RESEND_COOLDOWN_MS,
  AUTH_CODE_SUSPENSION_MS,
  AUTH_CODE_TTL_MS,
  authCodesMatch,
  evaluateAuthCode,
  evaluateResend,
  generateAuthCode,
  isValidAuthCode,
  normalizeAuthCode,
  type AuthCodeStatus,
} from './authCodes';

export interface TwoFactorRecord {
  id: string;
  code: string;
  createdAt: number;
  used: boolean;
  attempts: number;
  resends: number;
  lastSentAt: number;
  suspendedUntil: number;
}

/** Persistencia mínima que debe implementar cada web. */
export interface TwoFactorStore {
  /** Último código emitido para (user, site), o null. */
  findLatest(userId: string, site: string): Promise<TwoFactorRecord | null>;
  /**
   * Crea el código nuevo. `resends` se arrastra a propósito: el tope de
   * reenvíos cuenta por sesión de verificación, no por fila, y si cada fila
   * empezara en 0 el límite nunca se alcanzaría.
   */
  create(input: {
    userId: string;
    site: string;
    code: string;
    expiresAt: number;
    resends: number;
    sentAt: number;
  }): Promise<TwoFactorRecord>;
  /** Suma un intento fallido y devuelve el total acumulado. */
  incrementAttempts(id: string): Promise<number>;
  markUsed(id: string): Promise<void>;
  suspend(id: string, until: number): Promise<void>;
  clearSuspension(id: string): Promise<void>;
}

export interface TwoFactorMailer {
  send(args: {
    to: string;
    code: string;
    site: string;
    siteName: string;
    expiresAt: number;
  }): Promise<{ sent: boolean; error?: string; previewOnly?: boolean }>;
}

export interface TwoFactorServiceOptions {
  site: string;
  siteName: string;
  store: TwoFactorStore;
  mailer: TwoFactorMailer;
  now?: () => number;
  random?: () => number;
}

export interface TwoFactorResult {
  status: number;
  body: Record<string, unknown>;
}

const MS_PER_MINUTE = 60_000;

const minutes = (ms: number) => Math.max(1, Math.ceil(ms / MS_PER_MINUTE));

/**
 * Servicio 2FA. Se instancia una vez por web (la `site` forma parte de la clave
 * del código: un código emitido en Ciszuko Antony no vale en MuzicMania).
 */
export function createTwoFactorService(opts: TwoFactorServiceOptions) {
  const now = opts.now ?? (() => Date.now());
  const random = opts.random ?? Math.random;

  /** Emite un código nuevo (primer envío o reenvío). */
  async function issue(args: {
    userId: string;
    email: string;
    isResend: boolean;
  }): Promise<TwoFactorResult> {
    const at = now();
    const existing = await opts.store.findLatest(args.userId, opts.site);

    if (existing) {
      const status = evaluateAuthCode({
        createdAt: existing.createdAt,
        now: at,
        used: existing.used,
        attempts: existing.attempts,
        suspendedUntil: existing.suspendedUntil,
      });

      // Solo se bloquea si la suspensión SIGUE vigente. Si ya venció, el
      // registro es inservible (intentos agotados) pero el usuario tiene que
      // poder pedir uno nuevo: si no, quedaría bloqueado para siempre.
      if (existing.suspendedUntil > at) {
        return {
          status: 429,
          body: {
            success: false,
            state: 'suspended',
            suspendedForMs: existing.suspendedUntil - at,
            error: `Acceso suspendido temporalmente. Podrás volver a intentarlo en ${minutes(existing.suspendedUntil - at)} min.`,
          },
        };
      }

      if (args.isResend) {
        const policy = evaluateResend({
          resends: existing.resends,
          lastSentAt: existing.lastSentAt,
          now: at,
        });
        if (!policy.allowed) {
          if (policy.reason === 'max-resends') {
            // Agotar los reenvíos suspende temporalmente, igual que agotar los intentos.
            const until = at + AUTH_CODE_SUSPENSION_MS;
            await opts.store.suspend(existing.id, until);
            return {
              status: 429,
              body: {
                success: false,
                state: 'suspended',
                suspendedForMs: AUTH_CODE_SUSPENSION_MS,
                error: `Agotaste los reenvíos (${AUTH_CODE_MAX_RESENDS}). Podrás volver a intentarlo en ${minutes(AUTH_CODE_SUSPENSION_MS)} min.`,
              },
            };
          }
          return {
            status: 429,
            body: {
              success: false,
              state: 'cooldown',
              waitMs: policy.waitMs,
              error: `Espera ${Math.ceil(policy.waitMs / 1000)} s antes de pedir otro código.`,
            },
          };
        }
      } else if (status.state === 'valid') {
        // Ya hay un código vigente: se reutiliza en vez de emitir otro (así el
        // usuario no invalida el correo que acaba de recibir).
        return {
          status: 200,
          body: {
            success: true,
            reused: true,
            expiresAt: existing.createdAt + AUTH_CODE_TTL_MS,
            expiresInMs: Math.max(0, existing.createdAt + AUTH_CODE_TTL_MS - at),
            resendsRemaining: Math.max(0, AUTH_CODE_MAX_RESENDS - existing.resends),
          },
        };
      }
    }

    const code = generateAuthCode(random);

    // Un reenvío invalida el código anterior (un solo código vigente a la vez)
    // y arrastra el contador de reenvíos.
    if (existing) await opts.store.markUsed(existing.id);

    const record = await opts.store.create({
      userId: args.userId,
      site: opts.site,
      code,
      expiresAt: at + AUTH_CODE_TTL_MS,
      resends: args.isResend && existing ? existing.resends + 1 : 0,
      sentAt: at,
    });

    const delivery = await opts.mailer.send({
      to: args.email,
      code,
      site: opts.site,
      siteName: opts.siteName,
      expiresAt: at + AUTH_CODE_TTL_MS,
    });

    if (!delivery.sent) {
      return {
        status: 502,
        body: {
          success: false,
          state: 'delivery-failed',
          error: 'No pudimos enviar el código por email. Intenta de nuevo en un momento.',
          detail: delivery.error,
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        expiresAt: at + AUTH_CODE_TTL_MS,
        expiresInMs: AUTH_CODE_TTL_MS,
        expiresInMinutes: minutes(AUTH_CODE_TTL_MS),
        resendsRemaining: Math.max(0, AUTH_CODE_MAX_RESENDS - record.resends),
        previewOnly: delivery.previewOnly ?? false,
      },
    };
  }

  return {
    /** Primer envío del código al iniciar sesión con 2FA activo. */
    async request(args: { userId: string; email: string }): Promise<TwoFactorResult> {
      return issue({ ...args, isResend: false });
    },

    /** Reenvío con enfriamiento y tope. */
    async resend(args: { userId: string; email: string }): Promise<TwoFactorResult> {
      return issue({ ...args, isResend: true });
    },

    /** Verificación: consume el código o acumula intento/suspensión. */
    async verify(args: { userId: string; code: string }): Promise<TwoFactorResult> {
      const at = now();
      const provided = normalizeAuthCode(args.code);
      if (!isValidAuthCode(provided)) {
        return {
          status: 400,
          body: {
            success: false,
            state: 'invalid-format',
            error: `El código tiene que tener el formato ${AUTH_CODE_PREFIX}-123 434.`,
          },
        };
      }

      const record = await opts.store.findLatest(args.userId, opts.site);
      if (!record) {
        return {
          status: 404,
          body: { success: false, state: 'no-code', error: 'No hay ningún código activo. Solicita uno nuevo.' },
        };
      }

      const status = evaluateAuthCode({
        createdAt: record.createdAt,
        now: at,
        used: record.used,
        attempts: record.attempts,
        suspendedUntil: record.suspendedUntil,
      });

      if (status.state !== 'valid') {
        return {
          status: 400,
          body: {
            success: false,
            state: status.state,
            expiresAt: status.expiresAt,
            error: status.message,
          },
        };
      }

      if (!authCodesMatch(record.code, provided)) {
        const attempts = await opts.store.incrementAttempts(record.id);
        const exhausted = attempts >= AUTH_CODE_MAX_ATTEMPTS;
        if (exhausted) {
          const until = at + AUTH_CODE_SUSPENSION_MS;
          await opts.store.suspend(record.id, until);
          return {
            status: 429,
            body: {
              success: false,
              state: 'suspended',
              attempts,
              suspendedForMs: AUTH_CODE_SUSPENSION_MS,
              error: `Demasiados intentos fallidos. Acceso suspendido ${minutes(AUTH_CODE_SUSPENSION_MS)} min.`,
            },
          };
        }
        return {
          status: 400,
          body: {
            success: false,
            state: 'wrong-code',
            attempts,
            attemptsRemaining: Math.max(0, AUTH_CODE_MAX_ATTEMPTS - attempts),
            error: `Código incorrecto. Te quedan ${Math.max(0, AUTH_CODE_MAX_ATTEMPTS - attempts)} intentos.`,
          },
        };
      }

      await opts.store.markUsed(record.id);
      return { status: 200, body: { success: true, state: 'valid' } };
    },

    /** Estado del código para esta web (para pintar la pantalla). */
    async status(args: { userId: string }): Promise<TwoFactorResult> {
      const at = now();
      const record = await opts.store.findLatest(args.userId, opts.site);
      if (!record) {
        return {
          status: 200,
          body: { success: true, active: false, state: 'no-code' satisfies AuthCodeStatus['state'] },
        };
      }

      const status = evaluateAuthCode({
        createdAt: record.createdAt,
        now: at,
        used: record.used,
        attempts: record.attempts,
        suspendedUntil: record.suspendedUntil,
      });

      const resend = evaluateResend({
        resends: record.resends,
        lastSentAt: record.lastSentAt,
        now: at,
      });

      return {
        status: 200,
        body: {
          success: true,
          active: status.state === 'valid',
          state: status.state,
          message: status.message,
          expiresAt: status.expiresAt,
          expiresInMs: status.msLeft,
          attempts: record.attempts,
          attemptsRemaining: Math.max(0, AUTH_CODE_MAX_ATTEMPTS - record.attempts),
          resendsRemaining: resend.remaining,
          resendAllowed: resend.allowed,
          resendWaitMs: resend.waitMs,
          suspendedUntil: record.suspendedUntil > at ? record.suspendedUntil : null,
          cooldownMs: AUTH_CODE_RESEND_COOLDOWN_MS,
        },
      };
    },
  };
}

export type TwoFactorService = ReturnType<typeof createTwoFactorService>;
