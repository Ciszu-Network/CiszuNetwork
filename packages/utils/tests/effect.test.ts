import { describe, it, expect } from 'vitest';
import { RetryError, withRetries } from '@ciszunetwork/utils/effect';
import { Effect } from 'effect';

describe('effect (withRetries)', () => {
  it('retry hasta agotar intentos y envuelve en RetryError', async () => {
    let attempts = 0;
    const flaky = Effect.tryPromise(async () => {
      attempts += 1;
      throw new Error('boom');
    });
    const result = await Effect.runPromise(
      Effect.either(withRetries(flaky, { attempts: 2, baseDelayMillis: 5 }))
    );
    expect(result._tag).toBe('Left');
    expect((result as { left: unknown }).left).toBeInstanceOf(RetryError);
    expect(attempts).toBe(3);
  });

  it('devuelve el valor si tiene éxito', async () => {
    const ok = Effect.succeed(42);
    const result = await Effect.runPromise(withRetries(ok, { attempts: 2 }));
    expect(result).toBe(42);
  });
});