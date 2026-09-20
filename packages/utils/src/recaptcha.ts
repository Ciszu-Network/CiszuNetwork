/**
 * Verificación de reCAPTCHA v2 + v3 en el servidor.
 *
 * POR QUÉ EXISTE ESTE MÓDULO: cada web tenía su propia copia de la ruta
 * `/api/verify-recaptcha` con el site key→secret hardcodeado y su propio
 * rate-limiter. Las copias divergían (una aceptaba v3 y otra la rechazaba por
 * score) y el diagnostico era imposible. Aquí está la única implementación.
 *
 * REGLAS:
 *  - v2: basta con `success: true` de Google (el usuario resolvió el reto).
 *  - v3: además exige `action` esperada y `score >= minScore`.
 *  - Si un token no se envía, se informa el motivo en vez de fallar en silencio.
 *  - `hostname` de la respuesta se comprueba contra los dominios permitidos
 *    cuando se pasan, para que una site key filtrada no sirva desde otro sitio.
 */

export const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/** Score mínimo por defecto para v3 (Google recomienda 0.5 como umbral). */
export const RECAPTCHA_DEFAULT_MIN_SCORE = 0.5;

export interface RecaptchaVerifyOptions {
  /** Actúas esperada para v3 (p. ej. `register`, `login`, `support`). */
  expectedAction?: string;
  /** Score mínimo para v3. */
  minScore?: number;
  /** Hostnames admitidos en la respuesta de Google. */
  allowedHostnames?: string[];
  /** Inyectable para tests. */
  fetchImpl?: typeof fetch;
  /** Inyectable para tests. */
  now?: () => number;
}

export interface RecaptchaVerifyResult {
  success: boolean;
  /** Código estable para i18n y para logs (no cambia el mensaje visible). */
  reason: string;
  /** Mensaje listo para mostrar al usuario en español. */
  message: string;
  score?: number;
  action?: string;
  hostname?: string;
  /** Códigos crudos de Google, para diagnóstico. */
  errorCodes?: string[];
}

interface GoogleResponse {
  success?: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  'error-codes'?: string[];
}

function fail(reason: string, message: string, extra: Partial<RecaptchaVerifyResult> = {}): RecaptchaVerifyResult {
  return { success: false, reason, message, ...extra };
}

/**
 * Verifica UN token. No asume la versión: si la respuesta trae `score` es v3 y
 * se aplican sus reglas; si no, es v2.
 */
export async function verifyRecaptchaToken(
  token: string,
  secret: string,
  opts: RecaptchaVerifyOptions = {},
): Promise<RecaptchaVerifyResult> {
  if (!token) return fail('missing-token', 'Falta el token de reCAPTCHA.');
  if (!secret) return fail('missing-secret', 'reCAPTCHA sin configurar en el servidor.');

  const doFetch = opts.fetchImpl ?? fetch;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);

  let data: GoogleResponse;
  try {
    const res = await doFetch(RECAPTCHA_VERIFY_URL, { method: 'POST', body: form });
    data = (await res.json()) as GoogleResponse;
  } catch {
    return fail('network-error', 'No pudimos contactar con reCAPTCHA. Intenta de nuevo.');
  }

  const errorCodes = Array.isArray(data['error-codes']) ? data['error-codes'] : [];

  if (!data.success) {
    if (errorCodes.includes('timeout-or-duplicate')) {
      return fail(
        'expired',
        'El reCAPTCHA caducó o ya se usó. Vuelve a completarlo.',
        { errorCodes },
      );
    }
    if (errorCodes.includes('invalid-input-secret') || errorCodes.includes('missing-input-secret')) {
      return fail('bad-secret', 'reCAPTCHA mal configurado en el servidor (clave secreta).', {
        errorCodes,
      });
    }
    if (errorCodes.includes('invalid-input-response')) {
      return fail('invalid', 'El reCAPTCHA no es válido. Complétalo otra vez.', { errorCodes });
    }
    return fail('failed', 'La verificación de reCAPTCHA falló.', { errorCodes });
  }

  if (opts.allowedHostnames && opts.allowedHostnames.length > 0 && data.hostname) {
    if (!opts.allowedHostnames.includes(data.hostname)) {
      return fail('bad-hostname', 'El reCAPTCHA se resolvió desde un dominio no autorizado.', {
        errorCodes,
        hostname: data.hostname,
      });
    }
  }

  const isV3 = typeof data.score === 'number';

  if (isV3) {
    const minScore = opts.minScore ?? RECAPTCHA_DEFAULT_MIN_SCORE;
    if (opts.expectedAction && data.action && data.action !== opts.expectedAction) {
      return fail(
        'bad-action',
        'El reCAPTCHA corresponde a otra acción.',
        { score: data.score, action: data.action, errorCodes },
      );
    }
    if ((data.score ?? 0) < minScore) {
      return fail(
        'low-score',
        'La verificación automática no pudo confirmar que eres humano. Vuelve a intentarlo o resuelve el reto visible.',
        { score: data.score, action: data.action, errorCodes },
      );
    }
  }

  return {
    success: true,
    reason: 'ok',
    message: 'Verificado.',
    score: data.score,
    action: data.action,
    hostname: data.hostname,
    errorCodes,
  };
}

export interface RecaptchaPairInput {
  /** Token del widget v2 (checkbox). */
  v2Token?: string | null;
  /** Secreto de v2. */
  v2Secret?: string | null;
  /** Token invisible de v3. */
  v3Token?: string | null;
  /** Secreto de v3. */
  v3Secret?: string | null;
  expectedAction?: string;
  minScore?: number;
  allowedHostnames?: string[];
  fetchImpl?: typeof fetch;
}

export interface RecaptchaPairResult extends RecaptchaVerifyResult {
  /** Qué comprobaciones se ejecutaron realmente. */
  checked: Array<'v2' | 'v3'>;
  /** Detalle por versión, útil para logs y para la UI de error. */
  details: { v2?: RecaptchaVerifyResult; v3?: RecaptchaVerifyResult };
}

/**
 * Verifica el par v2 + v3.
 *
 * Política: si el cliente envía un token v2, ese es el requisito duro (el
 * usuario resolvió el reto). El v3 aporta señal adicional y se RECHAZA si su
 * score es sospechosamente bajo, pero no se exige cuando la web no tiene v3
 * configurado. Así el formulario nunca se queda sin salida si Google no
 * devuelve score.
 */
export async function verifyRecaptchaPair(
  input: RecaptchaPairInput,
): Promise<RecaptchaPairResult> {
  const checked: Array<'v2' | 'v3'> = [];
  const details: { v2?: RecaptchaVerifyResult; v3?: RecaptchaVerifyResult } = {};

  let v2: RecaptchaVerifyResult | undefined;
  if (input.v2Token) {
    if (!input.v2Secret) {
      v2 = fail('missing-secret', 'reCAPTCHA v2 sin configurar en el servidor.');
    } else {
      checked.push('v2');
      v2 = await verifyRecaptchaToken(input.v2Token, input.v2Secret, {
        fetchImpl: input.fetchImpl,
        allowedHostnames: input.allowedHostnames,
      });
    }
    details.v2 = v2;
    if (!v2.success) {
      return { ...v2, checked, details };
    }
  }

  let v3: RecaptchaVerifyResult | undefined;
  if (input.v3Token) {
    if (!input.v3Secret) {
      v3 = fail('missing-secret', 'reCAPTCHA v3 sin configurar en el servidor.');
    } else {
      checked.push('v3');
      v3 = await verifyRecaptchaToken(input.v3Token, input.v3Secret, {
        expectedAction: input.expectedAction,
        minScore: input.minScore,
        allowedHostnames: input.allowedHostnames,
        fetchImpl: input.fetchImpl,
      });
    }
    details.v3 = v3;
    if (!v3.success) {
      // Un score bajo en v3 no basta para frenar al usuario si ya resolvió el
      // v2; en ese caso se deja pasar y se registra la señal.
      if (v3.reason !== 'low-score' || !v2?.success) {
        return { ...v3, checked, details };
      }
    }
  }

  if (checked.length === 0) {
    return {
      ...fail('missing-token', 'Debes completar el reCAPTCHA.'),
      checked,
      details,
    };
  }

  return {
    success: true,
    reason: 'ok',
    message: 'Verificado.',
    score: v3?.score ?? v2?.score,
    errorCodes: [...(v2?.errorCodes ?? []), ...(v3?.errorCodes ?? [])],
    checked,
    details,
  };
}
