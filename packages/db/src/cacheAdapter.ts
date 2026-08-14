import { eq, sql } from 'drizzle-orm';
import { cache, counters } from './schemas/ciszu';
import type { DB } from './client';

/**
 * Adaptador que expone la interfaz `CacheDbLike` de `@ciszunetwork/utils` (usada por
 * `CacheStore`/`bumpCounter`) implementada sobre Drizzle y el schema `ciszu`.
 *
 * La tienda de caché espera un cliente tipo PostgREST mínimo (`from`/`rpc`); este
 * adaptador traduce esas llamadas a queries Drizzle reales para la tabla
 * `ciszu.cache` y el contador atómico `ciszu.counters`.
 */

export interface CacheRow {
  key: string;
  value: unknown;
  expires_at: string | null;
}

type CacheResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;

class CacheQueryBuilder {
  constructor(private readonly db: DB, private readonly keyFilter: string | null = null) {}

  maybeSingle(): CacheResult<CacheRow> {
    if (this.keyFilter == null) return Promise.resolve({ data: null, error: null });
    return this.db
      .select({ key: cache.key, value: cache.value, expires_at: cache.expiresAt })
      .from(cache)
      .where(eq(cache.key, this.keyFilter))
      .limit(1)
      .then((rows) => {
        const row = rows[0];
        if (!row) return { data: null, error: null };
        return {
          data: {
            key: row.key,
            value: row.value,
            expires_at: row.expires_at ? row.expires_at.toISOString() : null,
          },
          error: null,
        };
      })
      .catch((err: unknown) => ({ data: null, error: { message: String(err) } }));
  }

  select(_columns: string): CacheQueryBuilder {
    return this;
  }

  eq(_column: string, value: string): CacheQueryBuilder {
    return new CacheQueryBuilder(this.db, value);
  }

  upsert(
    values: { key: string; value: unknown; expires_at: string | null },
    _opts?: { onConflict?: string }
  ): CacheResult<null> {
    const expiresAt = values.expires_at ? new Date(values.expires_at) : null;
    return this.db
      .insert(cache)
      .values({
        key: values.key,
        value: values.value as never,
        expiresAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: cache.key,
        set: {
          value: values.value as never,
          expiresAt,
          updatedAt: new Date(),
        },
      })
      .then(() => ({ data: null, error: null }))
      .catch((err: unknown) => ({ data: null, error: { message: String(err) } }));
  }

  delete(): CacheResult<null> {
    if (this.keyFilter == null) return Promise.resolve({ data: null, error: null });
    return this.db
      .delete(cache)
      .where(eq(cache.key, this.keyFilter))
      .then(() => ({ data: null, error: null }))
      .catch((err: unknown) => ({ data: null, error: { message: String(err) } }));
  }
}

/**
 * Cliente compatible con `CacheDbLike` (CacheStore de `@ciszunetwork/utils`).
 * `rpc('bump_counter', { p_key })` realiza el INCR atómico sobre `ciszu.counters`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createCacheDb(db: DB): any {
  return {
    from(table: string) {
      if (table !== 'cache') {
        throw new Error(`CacheDb: tabla no soportada '${table}'`);
      }
      return new CacheQueryBuilder(db);
    },
    rpc(fn: string, args?: Record<string, unknown>) {
      if (fn !== 'bump_counter') {
        return Promise.resolve({ data: null, error: { message: `RPC no soportada: ${fn}` } });
      }
      const pKey = String(args?.p_key ?? '');
      if (!pKey) return Promise.resolve({ data: null, error: { message: 'p_key requerido' } });
      return db
        .insert(counters)
        .values({ key: pKey, value: 1, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: counters.key,
          set: {
            value: sql`${counters.value} + 1`,
            updatedAt: new Date(),
          },
        })
        .returning({ value: counters.value })
        .then((rows) => ({ data: rows[0]?.value ?? 0, error: null }))
        .catch((err: unknown) => ({ data: null, error: { message: String(err) } }));
    },
  };
}