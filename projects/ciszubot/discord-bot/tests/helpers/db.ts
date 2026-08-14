import { vi } from 'vitest';

/**
 * Mock encadenable de Drizzle (estilo query builder).
 *
 * Reemplaza al antiguo mock de Supabase (`getSupabase().from(...)`): los
 * servicios hoy usan `db.select().from().where().orderBy().limit()` (select),
 * `db.insert().values().onConflictDoUpdate()` / `db.update().set().where()` /
 * `db.delete().where()` (escrituras).
 *
 * La tabla destino se captura en `db.select/insert/update/delete` para las
 * aserciones; el builder devuelve el dato configurado (`data`) al llegar a una
 * llamada terminal (`.limit()`) o como thenable en el resto.
 *
 * Uso en cada test:
 *   vi.mock('@ciszunetwork/db', async (importOriginal) => {
 *     const actual = await importOriginal<typeof import('@ciszunetwork/db')>();
 *     const mockDb = createDbProxy();
 *     return { ...actual, db: mockDb };
 *   });
 *   beforeEach(() => { dbState.set(createDb(data).db); });
 */
export type MockDb = ReturnType<typeof createDb>['db'];

// Estado mutable compartido: `dbState.set(mock)` en cada test cambia a qué
// builder redirige el Proxy que expone el mock del paquete.
export const dbState: {
  current: { select: unknown; insert: unknown; update: unknown; delete: unknown } | null;
  set(v: unknown): void;
  get(): unknown;
} = {
  current: null,
  set(v) {
    this.current = v as never;
  },
  get() {
    return this.current;
  },
};

/** Proxy que redirige cada acceso a `db` hacia el builder activo (dbState). */
export function createDbProxy<T>(): T {
  return new Proxy({} as T, {
    get: (_t, prop) => {
      const cur = dbState.get() as Record<string, unknown> | null;
      const v = cur?.[prop as string];
      return typeof v === 'function' ? v.bind(cur) : v;
    },
  });
}

export function createDb(data: unknown = null, error: unknown = null) {
  const resolveValue = { data, error };
  const rows = () => {
    if (error) throw error;
    if (Array.isArray(data)) return data;
    return data === null ? [] : [data];
  };

  // Query de SELECT encadenable + thenable (terminal en .limit())
  const query = () => {
    const q: Record<string, ReturnType<typeof vi.fn>> & { limit: ReturnType<typeof vi.fn> } = {
      limit: vi.fn((_n: number) => Promise.resolve(rows())),
    };
    for (const m of ['from', 'where', 'orderBy', 'offset']) {
      (q as Record<string, unknown>)[m] = vi.fn(() => q);
    }
    return Object.assign(Promise.resolve(rows()), q);
  };

  // Insert: insert(tabla) → values() → onConflictDoUpdate() | await directo
  const insert = () => {
    const ins: Record<string, unknown> = {
      values: vi.fn(() => {
        const res: Record<string, unknown> = {
          onConflictDoUpdate: vi.fn(() => Promise.resolve({ error: null })),
        };
        return Object.assign(Promise.resolve({ error: null }), res);
      }),
    };
    return Object.assign(Promise.resolve(resolveValue), ins);
  };

  // Update: update(tabla) → set() → where()
  const update = () => {
    const upd: Record<string, unknown> = {
      set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ error: null })) })),
    };
    return Object.assign(Promise.resolve(resolveValue), upd);
  };

  // Delete: delete(tabla) → where()
  const del = () => {
    const d: Record<string, unknown> = {
      where: vi.fn(() => Promise.resolve({ error: null })),
    };
    return Object.assign(Promise.resolve(resolveValue), d);
  };

  const db = {
    select: vi.fn(() => query()),
    insert: vi.fn(() => insert()),
    update: vi.fn(() => update()),
    delete: vi.fn(() => del()),
  };

  return { db, resolveValue, rows };
}

export type SupabaseDb = never;
export type SupabaseBuilder = never;