import { describe, expect, it } from 'vitest';
import { assertAdultProfile, readPaymentFlags } from '../../src/lib/economy/server';

describe('economy server helpers', () => {
  it('rejects minors', () => {
    expect(() => assertAdultProfile({ birth_date: '2010-01-01' })).toThrow('adult_required');
  });

  it('accepts adults', () => {
    expect(assertAdultProfile({ birth_date: '2000-01-01' })).toBe(true);
  });

  it('reads flags as booleans', () => {
    const flags = readPaymentFlags({ PAYMENTS_CRYPTO_ENABLED: 'true', PAYMENTS_CARD_ENABLED: 'false' } as unknown as NodeJS.ProcessEnv);
    expect(flags).toEqual({ crypto: true, card: false, paypal: false });
  });
});
