import { describe, expect, it, vi } from 'vitest';
import {
  EMAIL_MAINTENANCE_USER_ERROR,
  isGmailDailyLimit,
  publishEmailMaintenanceAdvisor,
  userErrorForEmailFailure,
} from '../src/emailErrors';

describe('isGmailDailyLimit', () => {
  it('detecta el rechazo por cupo diario de Gmail', () => {
    expect(isGmailDailyLimit('550 5.4.5 Daily user sending limit exceeded. abc123 - gsmtp')).toBe(true);
    expect(isGmailDailyLimit('421 4.7.0 Try again later, quota exceeded')).toBe(true);
  });

  it('no confunde otros rechazos con el cupo diario', () => {
    expect(isGmailDailyLimit('550 5.1.1 The email account that you tried to reach does not exist')).toBe(false);
    expect(isGmailDailyLimit('535 5.7.8 Username and Password not accepted')).toBe(false);
  });
});

describe('userErrorForEmailFailure', () => {
  it('devuelve el mensaje GENÉRICO para caídas de email (sin detalle técnico)', () => {
    expect(userErrorForEmailFailure('550 5.4.5 Daily user sending limit exceeded')).toBe(EMAIL_MAINTENANCE_USER_ERROR);
    expect(EMAIL_MAINTENANCE_USER_ERROR).toBe('Email en mantenimiento. Inténtalo de nuevo más tarde.');
  });

  it('no tapa otros errores (se muestran tal cual)', () => {
    expect(userErrorForEmailFailure('550 5.1.1 mailbox unavailable')).toBeNull();
  });
});

describe('publishEmailMaintenanceAdvisor', () => {
  it('no publica si ya hay un aviso vigente (dedupe por source)', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => [{ id: 1 }] })) as unknown as typeof fetch;
    await publishEmailMaintenanceAdvisor({ url: 'https://x.supabase.co', serviceKey: 'k', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('publica el aviso kind=error global cuando no existe', async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchImpl = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      if (!init || !init.method) return { ok: true, json: async () => [] };
      return { ok: true, json: async () => ({}) };
    }) as unknown as typeof fetch;

    await publishEmailMaintenanceAdvisor({ url: 'https://x.supabase.co', serviceKey: 'k', fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const body = JSON.parse(String(calls[1].init?.body)) as Record<string, unknown>;
    expect(body.kind).toBe('error');
    expect(body.target).toBe('global');
    expect(body.source).toBe('email-transport');
    expect(String(body.message)).toContain('Email en mantenimiento');
    expect(new Date(String(body.expires_at)).getTime()).toBeGreaterThan(Date.now());
  });

  it('nunca lanza si la red falla (fire-and-forget)', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('net');
    }) as unknown as typeof fetch;
    await expect(
      publishEmailMaintenanceAdvisor({ url: 'https://x', serviceKey: 'k', fetchImpl }),
    ).resolves.toBeUndefined();
  });
});
