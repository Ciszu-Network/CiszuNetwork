/**
 * Handler HTTP de reCAPTCHA compartido por las 4 webs.
 *
 * Vive aquí y no en cada `route.ts` porque las cuatro copias habían divergido
 * (una exigía score v3 y otra no, una tenía rate-limit y otra no). Este módulo
 * NO importa `next/server` a propósito: `@ciszunetwork/utils` también se usa en
 * cliente, y arrastrar Next al bundle del navegador lo rompe. Devuelve una
 * respuesta plana `{ status, body, headers }` y el `route.ts` de cada web la
 * envuelve con `NextResponse.json`.
 */

import { createRateLimiter } from './rateLimit';
import {
  verifyEnterpriseAssessment,
  verifyRecaptchaPair,
  type RecaptchaPairResult,
} from './recaptcha';

export interface RecaptchaHandlerOptions {
  /** Modo Enterprise (actual). Site key de reCAPTCHA Enterprise de la web. */
  siteKey?: string;
  /** Modo Enterprise. API key del proyecto (restringida a recaptchaenterprise). */
  apiKey?: string;
  /** Modo Enterprise. ID del proyecto GCP. */
  projectId?: string;
  /** Secreto de reCAPTCHA v2 (checkbox). Solo modo clásico. */
  v2Secret?: string;
  /** Secreto de reCAPTCHA v3 (invisible). Solo modo clásico. */
  v3Secret?: string;
  /** Acción esperada del token (`register`, `login`, `contact`...). */
  expectedAction?: string;
  /** Score mínimo exigido. Por defecto 0.5. */
  minScore?: number;
  /** Hostnames admitidos. Con lista vacía no se comprueba. */
  allowedHostnames?: string[];
  windowMs?: number;
  max?: number;
  /** Inyectable en tests. */
  fetchImpl?: typeof fetch;
}

export interface RecaptchaHttpResponse {
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
}

/** Payload aceptado: formato nuevo (v2/v3 explícitos) o el legado (`token`). */
export interface RecaptchaPayload {
  v2Token?: string;
  v3Token?: string;
  /** Legado: token único. */
  token?: string;
  /** Legado: versión del token único. */
  version?: string;
  /** Legado: site key enviada por el cliente (no se usa para elegir secreto). */
  siteKey?: string;
  /** Acción declarada por el cliente; se contrasta con `expectedAction`. */
  action?: string;
}

const MAX_PAYLOAD_CHARS = 4096;

/** Crea el handler; el resultado es seguro de reutilizar entre peticiones. */
export function createRecaptchaHandler(opts: RecaptchaHandlerOptions) {
  const limiter = createRateLimiter({ windowMs: opts.windowMs ?? 60_000, max: opts.max ?? 30 });

  return async function handleRecaptcha(
    payload: RecaptchaPayload,
    ip: string,
  ): Promise<RecaptchaHttpResponse> {
    const rl = limiter.allow(ip);
    if (!rl.allowed) {
      return {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) },
        body: { success: false, reason: 'rate-limited', error: 'Demasiados intentos. Espera un minuto.' },
      };
    }

    const v2Token = (payload.v2Token ?? (payload.version === 'v2' ? payload.token : '')) || '';
    const v3Token = (payload.v3Token ?? (payload.version === 'v3' ? payload.token : '')) || '';
    const expectedAction = payload.action ?? opts.expectedAction;
    const token = payload.token || v3Token || v2Token;

    if (!v2Token && !v3Token && !token) {
      return {
        status: 400,
        body: { success: false, reason: 'missing-token', error: 'Falta el token de reCAPTCHA.' },
      };
    }
    if (v2Token.length > MAX_PAYLOAD_CHARS || v3Token.length > MAX_PAYLOAD_CHARS || token.length > MAX_PAYLOAD_CHARS) {
      return { status: 400, body: { success: false, reason: 'invalid', error: 'Token inválido.' } };
    }

    // Modo Enterprise: un solo token validado vía assessments (API key, sin secretos).
    if (opts.siteKey && opts.apiKey && opts.projectId) {
      const enterpriseResult = await verifyEnterpriseAssessment(token, {
        siteKey: opts.siteKey,
        apiKey: opts.apiKey,
        projectId: opts.projectId,
        expectedAction,
        minScore: opts.minScore,
        allowedHostnames: opts.allowedHostnames,
        fetchImpl: opts.fetchImpl,
      });

      if (!enterpriseResult.success) {
        const status = enterpriseResult.reason.startsWith('missing-secret') ? 500 : 403;
        return {
          status,
          body: {
            success: false,
            reason: enterpriseResult.reason,
            error: enterpriseResult.message,
            score: enterpriseResult.score,
          },
        };
      }

      return {
        status: 200,
        body: {
          success: true,
          score: enterpriseResult.score,
          checked: ['v3'],
          risk: enterpriseResult.reason === 'low-score' ? 'low-score' : 'ok',
        },
      };
    }

    const result: RecaptchaPairResult = await verifyRecaptchaPair({
      v2Token: v2Token || undefined,
      v2Secret: opts.v2Secret,
      v3Token: v3Token || undefined,
      v3Secret: opts.v3Secret,
      expectedAction,
      minScore: opts.minScore,
      allowedHostnames: opts.allowedHostnames,
      fetchImpl: opts.fetchImpl,
    });

    if (!result.success) {
      // 403 para rechazos de verificación, 500 sólo si es configuración nuestra.
      const status = result.reason.startsWith('missing-secret') ? 500 : 403;
      return {
        status,
        body: {
          success: false,
          reason: result.reason,
          error: result.message,
          score: result.score,
          checked: result.checked,
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        score: result.score,
        checked: result.checked,
        // Señal registrable: v2 válido + v3 con score bajo.
        risk: result.details.v3?.reason === 'low-score' ? 'low-score' : 'ok',
      },
    };
  };
}

/**
 * Hostnames admitidos a partir del site URL de la web.
 *
 * Se incluyen `localhost` y `127.0.0.1` porque en desarrollo el widget corre
 * ahí y de lo contrario la verificación fallaría solo en local (el fallo más
 * difícil de diagnosticar). `extra` permite sumar dominios de preview.
 */
export function allowedHostnamesFromSiteUrl(siteUrl: string | undefined, extra: string[] = []): string[] {
  const hosts = new Set<string>(['localhost', '127.0.0.1', ...extra]);
  if (siteUrl) {
    try {
      hosts.add(new URL(siteUrl).hostname);
    } catch {
      /* site url mal formada: se ignora */
    }
  }
  return [...hosts];
}
