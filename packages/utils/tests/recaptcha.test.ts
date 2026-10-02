import { describe, expect, it, vi } from 'vitest';
import {
  RECAPTCHA_DEFAULT_MIN_SCORE,
  verifyEnterpriseAssessment,
  verifyRecaptchaPair,
  verifyRecaptchaToken,
} from '../src/recaptcha';

/** Respuesta falsa de Google. */
function googleResponse(body: Record<string, unknown>) {
  return (async () => ({
    json: async () => body,
  })) as unknown as typeof fetch;
}

const ok = (extra: Record<string, unknown> = {}) => ({ success: true, ...extra });

describe('verifyRecaptchaToken', () => {
  it('acepta v2 con success=true', async () => {
    const res = await verifyRecaptchaToken('tok', 'secret', {
      fetchImpl: googleResponse(ok({ hostname: 'ciszunetwork.com' })),
    });
    expect(res.success).toBe(true);
    expect(res.reason).toBe('ok');
  });

  it('rechaza sin token o sin secreto con motivo explícito', async () => {
    expect((await verifyRecaptchaToken('', 'secret')).reason).toBe('missing-token');
    expect((await verifyRecaptchaToken('tok', '')).reason).toBe('missing-secret');
  });

  it('traduce timeout-or-duplicate a código de expiración', async () => {
    const res = await verifyRecaptchaToken('tok', 'secret', {
      fetchImpl: googleResponse({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
    });
    expect(res.reason).toBe('expired');
    expect(res.message).toMatch(/caducó/);
  });

  it('exige score mínimo en v3', async () => {
    const low = await verifyRecaptchaToken('tok', 'secret', {
      fetchImpl: googleResponse(ok({ score: 0.1, action: 'register' })),
    });
    expect(low.success).toBe(false);
    expect(low.reason).toBe('low-score');

    const high = await verifyRecaptchaToken('tok', 'secret', {
      fetchImpl: googleResponse(ok({ score: 0.9, action: 'register' })),
    });
    expect(high.success).toBe(true);
    expect(high.score).toBe(0.9);
  });

  it('respeta minScore configurable', async () => {
    const res = await verifyRecaptchaToken('tok', 'secret', {
      minScore: 0.1,
      fetchImpl: googleResponse(ok({ score: 0.2 })),
    });
    expect(res.success).toBe(true);
  });

  it('rechaza action distinta a la esperada', async () => {
    const res = await verifyRecaptchaToken('tok', 'secret', {
      expectedAction: 'register',
      fetchImpl: googleResponse(ok({ score: 0.9, action: 'login' })),
    });
    expect(res.reason).toBe('bad-action');
  });

  it('rechaza hostname no autorizado', async () => {
    const res = await verifyRecaptchaToken('tok', 'secret', {
      allowedHostnames: ['ciszunetwork.com'],
      fetchImpl: googleResponse(ok({ hostname: 'atacante.example' })),
    });
    expect(res.reason).toBe('bad-hostname');
  });

  it('informa de fallo de red sin lanzar', async () => {
    const res = await verifyRecaptchaToken('tok', 'secret', {
      fetchImpl: vi.fn(async () => {
        throw new Error('offline');
      }) as unknown as typeof fetch,
    });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('network-error');
  });

  it('expone RECAPTCHA_DEFAULT_MIN_SCORE = 0.5', () => {
    expect(RECAPTCHA_DEFAULT_MIN_SCORE).toBe(0.5);
  });
});

describe('verifyRecaptchaPair', () => {
  it('exige al menos un token', async () => {
    const res = await verifyRecaptchaPair({});
    expect(res.success).toBe(false);
    expect(res.checked).toEqual([]);
  });

  it('valida los dos cuando llegan los dos', async () => {
    const secrets: string[] = [];
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      secrets.push(String((init.body as FormData).get('secret')));
      return { json: async () => ({ success: true, score: 0.9, action: 'register' }) };
    }) as unknown as typeof fetch;

    const res = await verifyRecaptchaPair({
      v2Token: 'a',
      v2Secret: 'secret-v2',
      v3Token: 'b',
      v3Secret: 'secret-v3',
      expectedAction: 'register',
      fetchImpl,
    });
    expect(res.success).toBe(true);
    expect(res.checked).toEqual(['v2', 'v3']);
    expect(secrets).toEqual(['secret-v2', 'secret-v3']);
  });

  it('corta en v2 inválido sin llamar a v3', async () => {
    const calls: string[] = [];
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      calls.push(String((init.body as FormData).get('secret')));
      return { json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }) };
    }) as unknown as typeof fetch;

    const res = await verifyRecaptchaPair({
      v2Token: 'bad',
      v2Secret: 's2',
      v3Token: 'tok3',
      v3Secret: 's3',
      fetchImpl,
    });
    expect(res.success).toBe(false);
    expect(res.checked).toEqual(['v2']);
    expect(calls).toHaveLength(1);
  });

  it('deja pasar si el v3 tiene score bajo pero el v2 fue válido', async () => {
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      const body = init.body as FormData;
      const secret = body.get('secret');
      return {
        json: async () =>
          secret === 's3'
            ? { success: true, score: 0.1, action: 'register' }
            : { success: true, hostname: 'ciszunetwork.com' },
      };
    }) as unknown as typeof fetch;

    const res = await verifyRecaptchaPair({
      v2Token: 'good',
      v2Secret: 's2',
      v3Token: 'tok3',
      v3Secret: 's3',
      expectedAction: 'register',
      fetchImpl,
    });
    expect(res.success).toBe(true);
    expect(res.checked).toEqual(['v2', 'v3']);
    expect(res.details.v3?.reason).toBe('low-score');
  });

  it('rechaza si v3 falla y no hay v2', async () => {
    const fetchImpl = (async () => ({
      json: async () => ({ success: true, score: 0.1 }),
    })) as unknown as typeof fetch;

    const res = await verifyRecaptchaPair({ v3Token: 'tok3', v3Secret: 's3', fetchImpl });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('low-score');
  });
});

describe('verifyEnterpriseAssessment', () => {
  const base = {
    siteKey: 'enterprise-site-key',
    apiKey: 'apikey',
    projectId: 'ciszunetwork',
  };

  /** Respuesta falsa de la API de assessments. */
  function enterpriseResponse(body: Record<string, unknown>) {
    return (async () => ({
      json: async () => body,
    })) as unknown as typeof fetch;
  }

  it('acepta un token válido con score suficiente', async () => {
    const res = await verifyEnterpriseAssessment('tok', {
      ...base,
      fetchImpl: enterpriseResponse({
        tokenProperties: { valid: true, hostname: 'ciszunetwork.vercel.app', action: 'login' },
        riskAnalysis: { score: 0.9 },
      }),
    });
    expect(res.success).toBe(true);
    expect(res.score).toBe(0.9);
  });

  it('rechaza sin token o sin credenciales', async () => {
    expect((await verifyEnterpriseAssessment('')).reason).toBe('missing-token');
    expect((await verifyEnterpriseAssessment('t', { apiKey: '', projectId: 'x', siteKey: 'y' })).reason).toBe(
      'missing-secret',
    );
    expect((await verifyEnterpriseAssessment('t', { apiKey: 'k', projectId: '', siteKey: 'y' })).reason).toBe(
      'missing-secret',
    );
  });

  it('rechaza token inválido y traduce expiración', async () => {
    const invalid = await verifyEnterpriseAssessment('t', {
      ...base,
      fetchImpl: enterpriseResponse({ tokenProperties: { valid: false, invalidReason: 'MISSING' } }),
    });
    expect(invalid.reason).toBe('invalid');

    const expired = await verifyEnterpriseAssessment('t', {
      ...base,
      fetchImpl: enterpriseResponse({ tokenProperties: { valid: false, invalidReason: 'EXPIRED' } }),
    });
    expect(expired.reason).toBe('expired');
    expect(expired.message).toMatch(/caducó/);
  });

  it('exige score mínimo', async () => {
    const res = await verifyEnterpriseAssessment('t', {
      ...base,
      fetchImpl: enterpriseResponse({
        tokenProperties: { valid: true, hostname: 'ciszunetwork.vercel.app', action: 'login' },
        riskAnalysis: { score: 0.1 },
      }),
    });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('low-score');
  });

  it('rechaza acción distinta a la esperada', async () => {
    const res = await verifyEnterpriseAssessment('t', {
      ...base,
      expectedAction: 'login',
      fetchImpl: enterpriseResponse({
        tokenProperties: { valid: true, hostname: 'ciszunetwork.vercel.app', action: 'register' },
        riskAnalysis: { score: 0.9 },
      }),
    });
    expect(res.reason).toBe('bad-action');
  });

  it('rechaza hostname no autorizado', async () => {
    const res = await verifyEnterpriseAssessment('t', {
      ...base,
      allowedHostnames: ['ciszunetwork.vercel.app'],
      fetchImpl: enterpriseResponse({
        tokenProperties: { valid: true, hostname: 'atacante.example', action: 'login' },
        riskAnalysis: { score: 0.9 },
      }),
    });
    expect(res.reason).toBe('bad-hostname');
  });

  it('informa de error de API y de fallo de red', async () => {
    const apiErr = await verifyEnterpriseAssessment('t', {
      ...base,
      fetchImpl: enterpriseResponse({ error: { code: 400, status: 'INVALID_ARGUMENT', message: 'bad' } }),
    });
    expect(apiErr.reason).toBe('api-error');

    const netErr = await verifyEnterpriseAssessment('t', {
      ...base,
      fetchImpl: vi.fn(async () => {
        throw new Error('offline');
      }) as unknown as typeof fetch,
    });
    expect(netErr.reason).toBe('network-error');
  });
});
