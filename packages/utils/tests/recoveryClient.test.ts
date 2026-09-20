import { describe, expect, it } from 'vitest';
import { parseRecoveryHash } from '../src/recoveryClient';

describe('parseRecoveryHash', () => {
  it('detecta el token de un enlace válido', () => {
    const parsed = parseRecoveryHash('#access_token=abc123&type=recovery&expires_in=3600');
    expect(parsed.hasToken).toBe(true);
    expect(parsed.reason).toBeNull();
    expect(parsed.token).toBe('abc123');
    expect(parsed.type).toBe('recovery');
  });

  it('detecta el código PKCE', () => {
    const parsed = parseRecoveryHash('?code=pkce-code');
    expect(parsed.hasToken).toBe(true);
    expect(parsed.token).toBe('pkce-code');
  });

  it('traduce otp_expired a "expired"', () => {
    const parsed = parseRecoveryHash(
      '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
    );
    expect(parsed.hasToken).toBe(false);
    expect(parsed.reason).toBe('expired');
    expect(parsed.errorCode).toBe('otp_expired');
    expect(parsed.errorDescription).toBe('Email link is invalid or has expired');
  });

  it('traduce access_denied sin otp_expired a "used"', () => {
    const parsed = parseRecoveryHash('#error=access_denied&error_code=access_denied');
    expect(parsed.reason).toBe('used');
  });

  it('cualquier otro error cae en "invalid"', () => {
    const parsed = parseRecoveryHash('#error=server_error&error_code=unexpected_failure');
    expect(parsed.reason).toBe('invalid');
  });

  it('hash vacío no tiene token ni motivo', () => {
    const parsed = parseRecoveryHash('');
    expect(parsed.hasToken).toBe(false);
    expect(parsed.reason).toBeNull();
    expect(parsed.token).toBeNull();
  });

  it('acepta el hash sin la almohadilla', () => {
    expect(parseRecoveryHash('access_token=tok').hasToken).toBe(true);
  });

  it('no confunde parámetros de plantilla', () => {
    const parsed = parseRecoveryHash('#token_hash=tok&type=recovery&redirect_to=/reset-password');
    expect(parsed.hasToken).toBe(false);
    expect(parsed.reason).toBeNull();
    expect(parsed.token).toBeNull();
  });
});
