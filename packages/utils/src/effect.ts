import { Data, Duration, Effect, Schedule } from 'effect';

/**
 * Utilidades de Effect (programación funcional tipada).
 *
 * Política (TOOLS_EVALUATION_PLAN §5/§9.5): Effect es ⚠️ condicional — se usa
 * SOLO en módulos donde haga falta tipar errores y reintentos complejos;
 * no es el patrón general del monorepo. Este módulo expone helpers acotados.
 */

/** Tag de error tipado para reintentos con backoff. */
export class RetryError extends Data.TaggedError('RetryError')<{
  readonly cause: string;
}> {}

/**
 * Ejecuta un effect con N reintentos y backoff exponencial, envolviendo el
 * error en un RetryError tipado si agota los intentos.
 */
export function withRetries<A, E>(
  effect: Effect.Effect<A, E>,
  options: { attempts?: number; baseDelayMillis?: number } = {}
): Effect.Effect<A, RetryError> {
  const { attempts = 3, baseDelayMillis = 200 } = options;
  const policy = Schedule.exponential(Duration.millis(baseDelayMillis), 2);
  return effect.pipe(
    Effect.retry({ schedule: policy, times: attempts }),
    Effect.catchAll((e) =>
      new RetryError({ cause: `Request failed after ${attempts + 1} attempts: ${String(e)}` })
    )
  );
}

/**
 * Helper supervisor: ejecuta efectos en paralelo devolviendo un array de resultados.
 * Útil para llamadas independientes (múltiples APIs externas).
 */
export function parallelAll<A, E>(effects: readonly Effect.Effect<A, E>[]) {
  return Effect.all(effects, { concurrency: 'unbounded' });
}

// Re-export conveniente para no mezclar path imports en el consumidor.
export { pipe } from 'effect';