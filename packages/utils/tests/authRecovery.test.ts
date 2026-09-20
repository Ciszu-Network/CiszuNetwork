import { describe, expect, it } from 'vitest';
import {
  RECOVERY_LINK_TTL_MS,
  RECOVERY_MAX_REQUESTS,
  RECOVERY_ONE_USE_NOTICE,
  RECOVERY_REQUEST_COOLDOWN_MS,
  evaluateRecoveryLink,
  evaluateRecoveryRequest,
  validateNewPassword,
} from '../src/authRecovery';
import { describeDuration } from '../src/duration';

describe('evaluateRecoveryLink', () => {
  const now = 10_000_000;

  it('verifica cuando Supabase ya entregó la sesión de recuperación', () => {
    const s = evaluateRecoveryLink({ hasToken: true, hasSession: true, now });
    expect(s.state).toBe('verified');
    expect(s.canSetPassword).toBe(true);
  });

  it('NO declara inválido un enlace ya verificado que se remonta (bug del panel que cambiaba a inválido)', () => {
    const s = evaluateRecoveryLink({
      hasToken: false,
      hasSession: false,
      sessionMarker: { at: now - 1000 },
      now,
    });
    expect(s.state).toBe('verified');
    expect(s.canSetPassword).toBe(true);
  });

  it('ignora una marca caducada', () => {
    const s = evaluateRecoveryLink({
      hasToken: false,
      hasSession: false,
      sessionMarker: { at: now - RECOVERY_LINK_TTL_MS - 1 },
      now,
    });
    expect(s.canSetPassword).toBe(false);
  });

  it('marca expirado y dice desde cuándo', () => {
    const issuedAt = now - RECOVERY_LINK_TTL_MS - 5 * 60_000;
    const s = evaluateRecoveryLink({ hasToken: true, hasSession: false, issuedAt, now });
    expect(s.state).toBe('expired');
    expect(s.invalidSince).toBe(issuedAt + RECOVERY_LINK_TTL_MS);
    expect(s.invalidFor).toBe(describeDuration(5 * 60_000));
  });

  it('marca usado (un solo uso)', () => {
    const s = evaluateRecoveryLink({ hasToken: true, hasSession: false, usedAt: now - 60_000, now });
    expect(s.state).toBe('used');
    expect(s.invalidFor).toBe(describeDuration(60_000));
  });

  it('marca sustituido cuando se pidió un enlace más nuevo', () => {
    const s = evaluateRecoveryLink({ hasToken: true, hasSession: false, supersededAt: now - 30_000, now });
    expect(s.state).toBe('superseded');
  });

  it('marca inválido si no hay token', () => {
    const s = evaluateRecoveryLink({ hasToken: false, hasSession: false, now });
    expect(s.state).toBe('invalid');
    expect(s.canSetPassword).toBe(false);
  });

  it('siempre usa severidad de ADVERTENCIA, nunca de error', () => {
    for (const input of [
      { hasToken: false, hasSession: false },
      { hasToken: true, hasSession: false, usedAt: now },
      { hasToken: true, hasSession: false, reason: 'expired' as const, issuedAt: now - RECOVERY_LINK_TTL_MS - 1 },
    ]) {
      expect(evaluateRecoveryLink({ ...input, now }).severity).toBe('warning');
    }
  });

  it('expone el recordatorio de un solo uso', () => {
    expect(RECOVERY_ONE_USE_NOTICE).toContain('un solo uso');
  });
});

describe('evaluateRecoveryRequest (12 horas)', () => {
  const now = 20_000_000;

  it('permite las primeras peticiones', () => {
    const r = evaluateRecoveryRequest({ timestamps: [now - 1000], now });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(RECOVERY_MAX_REQUESTS - 1);
  });

  it('bloquea 12 horas al superar el máximo en la ventana', () => {
    const timestamps = Array.from({ length: RECOVERY_MAX_REQUESTS }, (_, i) => now - i * 1000);
    const r = evaluateRecoveryRequest({ timestamps, now });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('rate-limited');
    expect(r.waitMs).toBe(RECOVERY_REQUEST_COOLDOWN_MS);
  });

  it('ignora peticiones antiguas', () => {
    const timestamps = Array.from({ length: 5 }, (_, i) => now - RECOVERY_REQUEST_COOLDOWN_MS - i * 1000);
    const r = evaluateRecoveryRequest({ timestamps, now });
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(RECOVERY_MAX_REQUESTS);
  });
});

describe('validateNewPassword', () => {
  it('acepta una contraseña nueva válida', () => {
    const r = validateNewPassword({ next: 'NuevaClave123!', confirm: 'NuevaClave123!', previous: 'ViejaClave123!' });
    expect(r.ok).toBe(true);
  });

  it('rechaza reutilizar la contraseña anterior', () => {
    const r = validateNewPassword({ next: 'MismaClave123!', confirm: 'MismaClave123!', previous: 'MismaClave123!' });
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toContain('no puede ser igual a la anterior');
  });

  it('rechaza longitudes cortas y confirmaciones distintas', () => {
    const r = validateNewPassword({ next: 'corta', confirm: 'otra' });
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBe(2);
  });
});
