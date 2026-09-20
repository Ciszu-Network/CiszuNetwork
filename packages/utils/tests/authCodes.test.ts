import { describe, expect, it } from 'vitest';
import {
  AUTH_CODE_MAX_ATTEMPTS,
  AUTH_CODE_MAX_RESENDS,
  AUTH_CODE_RESEND_COOLDOWN_MS,
  AUTH_CODE_SUSPENSION_MS,
  AUTH_CODE_TTL_MS,
  authCodesMatch,
  evaluateAuthCode,
  evaluateResend,
  generateAuthCode,
  isValidAuthCode,
  normalizeAuthCode,
  shouldSuspend,
} from '../src/authCodes';
import { describeDuration } from '../src/duration';

describe('formato de la clave 2FA (C-123 434)', () => {
  it('genera exactamente el formato oficial', () => {
    const code = generateAuthCode(() => 0.123456);
    expect(code).toMatch(/^C-\d{3} \d{3}$/);
    expect(isValidAuthCode(code)).toBe(true);
  });

  it('rellena con ceros a la izquierda', () => {
    const code = generateAuthCode(() => 0.004);
    expect(code).toBe('C-004 004');
  });

  it('normaliza entradas escritas de cualquier forma', () => {
    expect(normalizeAuthCode('c-123434')).toBe('C-123 434');
    expect(normalizeAuthCode('C123434')).toBe('C-123 434');
    expect(normalizeAuthCode('123 434')).toBe('C-123 434');
    expect(normalizeAuthCode('  C-123   434 ')).toBe('C-123 434');
  });

  it('rechaza formatos incompletos', () => {
    expect(isValidAuthCode('C-123')).toBe(false);
    expect(isValidAuthCode('C-12 434')).toBe(false);
    expect(isValidAuthCode('')).toBe(false);
    expect(isValidAuthCode('C-1234 345')).toBe(false);
  });

  it('compara códigos ignorando el formato', () => {
    expect(authCodesMatch('c-123434', 'C-123 434')).toBe(true);
    expect(authCodesMatch('C-123 434', 'C-123 435')).toBe(false);
  });
});

describe('evaluateAuthCode', () => {
  const created = 1_000_000;
  const base = { createdAt: created };

  it('está válido dentro de las 3 horas', () => {
    const s = evaluateAuthCode({ ...base, now: created + AUTH_CODE_TTL_MS - 1000 });
    expect(s.state).toBe('valid');
    expect(s.msLeft).toBe(1000);
  });

  it('expira pasadas las 3 horas', () => {
    const s = evaluateAuthCode({ ...base, now: created + AUTH_CODE_TTL_MS });
    expect(s.state).toBe('expired');
    expect(s.msLeft).toBe(0);
    expect(s.reason).toBe('expired');
  });

  it('detecta un código ya usado (un solo uso)', () => {
    const s = evaluateAuthCode({ ...base, used: true, now: created + 1000 });
    expect(s.state).toBe('used');
    expect(s.message).toContain('ya se usó');
  });

  it('suspende al agotar los intentos', () => {
    const s = evaluateAuthCode({ ...base, attempts: AUTH_CODE_MAX_ATTEMPTS, now: created + 1000 });
    expect(s.state).toBe('suspended');
    expect(s.reason).toBe('too-many-attempts');
  });

  it('respeta una suspensión activa y avisa cuánto falta', () => {
    const now = created + 1000;
    const s = evaluateAuthCode({ ...base, now, suspendedUntil: now + AUTH_CODE_SUSPENSION_MS });
    expect(s.state).toBe('suspended');
    expect(s.message).toContain(describeDuration(AUTH_CODE_SUSPENSION_MS));
  });

  it('informa cuando no hay código emitido para esa web', () => {
    const s = evaluateAuthCode({ ...base, exists: false });
    expect(s.state).toBe('no-code');
  });
});

describe('evaluateResend', () => {
  const now = 5_000_000;

  it('permite reenviar tras el enfriamiento', () => {
    const r = evaluateResend({ resends: 0, lastSentAt: now - AUTH_CODE_RESEND_COOLDOWN_MS, now });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(AUTH_CODE_MAX_RESENDS);
  });

  it('bloquea durante el enfriamiento', () => {
    const r = evaluateResend({ resends: 0, lastSentAt: now - 1000, now });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('cooldown');
    expect(r.waitMs).toBe(AUTH_CODE_RESEND_COOLDOWN_MS - 1000);
  });

  it('bloquea al agotar los reenvíos', () => {
    const r = evaluateResend({ resends: AUTH_CODE_MAX_RESENDS, lastSentAt: now - 10 * AUTH_CODE_RESEND_COOLDOWN_MS, now });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('max-resends');
    expect(r.remaining).toBe(0);
  });

  it('shouldSuspend solo con 3 o más intentos', () => {
    expect(shouldSuspend(2)).toBe(false);
    expect(shouldSuspend(3)).toBe(true);
  });
});

describe('describeDuration', () => {
  it('formatea segundos, minutos, horas y días', () => {
    expect(describeDuration(45_000)).toBe('45 s');
    expect(describeDuration(12 * 60_000)).toBe('12 min');
    expect(describeDuration(3 * 60 * 60_000)).toBe('3 h');
    expect(describeDuration(3 * 60 * 60_000 + 20 * 60_000)).toBe('3 h 20 min');
    expect(describeDuration(28 * 60 * 60_000)).toBe('1 d 4 h');
  });
});
