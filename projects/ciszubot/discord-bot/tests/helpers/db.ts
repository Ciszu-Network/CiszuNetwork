import { vi } from 'vitest';

/**
 * Crea un mock encadenable de Supabase (estilo query builder).
 *
 * - Los métodos intermedios (select/eq/order/limit/update) devuelven un thenable
 *   que también expone el builder, permitiendo encadenar y a la vez `await` el
 *   resultado final.
 * - maybeSingle/upsert/insert devuelven promesas directas.
 *
 * Uso: getSupabase.mockReturnValue(db); builder.maybeSingle.mockResolvedValueOnce(...)
 */
export function createDb(data: unknown = null, error: unknown = null) {
  const resolveValue = { data, error };

  const builder: Record<string, ReturnType<typeof vi.fn>> & {
    maybeSingle: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
  } = {
    maybeSingle: vi.fn(() => Promise.resolve(resolveValue)),
    upsert: vi.fn(() => Promise.resolve({ error: null })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
  };

  for (const m of ['select', 'eq', 'order', 'limit', 'update']) {
    (builder as unknown as Record<string, unknown>)[m] = vi.fn(() =>
      Object.assign(Promise.resolve(resolveValue), builder)
    );
  }

  const db = { from: vi.fn(() => builder) };
  return { db, builder };
}

export type SupabaseDb = ReturnType<typeof createDb>['db'];
export type SupabaseBuilder = ReturnType<typeof createDb>['builder'];
