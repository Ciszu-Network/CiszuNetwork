/**
 * Sistema de caché de Ciszu Network (implementado 9 ago 2026 — plan completo Fase 1-3).
 *
 * Multi-tienda por orden de prioridad:
 *   1. Memoria (LRU con TTL)          — siempre disponible, cero latencia.
 *   2. Vercel KV / Upstash (REST)     — si KV_REST_API_URL y KV_REST_API_TOKEN existen.
 *   3. Postgres (schema ciszu)        — tabla `cache` / `counters` (Fase 3), vía cliente tipo Supabase.
 *
 * Reglas del plan: la caché SIEMPRE es regenerable desde la BD, TTL cortos (por defecto 60s),
 * invalidación manual con `del()`, y el store NUNCA rompe la app (errores de capa = miss/ignorar).
 *
 * El cliente de BD se inyecta (structural typing, sin importar @supabase/supabase-js):
 * basta con el interfaz mínimo CacheDbLike (from/rpc) que cualquier SupabaseClient cumple.
 */

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Almacén clave-valor plano (serializado JSON). Implement: Vercel KV, memoria, mock tests. */
export interface KVStore {
  name: string;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
}

/** Superficie mínima de un cliente Supabase/PostgREST usada por la capa de BD. */
export interface CacheDbLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rpc?(fn: string, args?: Record<string, unknown>): any;
}

export interface CacheStoreOptions {
  /** Cliente PostgREST/Supabase (schema ciszu) para la tabla `cache` — Fase 3. */
  db?: CacheDbLike | null;
  /** Almacén KV externo (Vercel KV/Upstash) — Fase 2. */
  kv?: KVStore | null;
  /** Firma con la tabla de caché (sin esquema). */
  table?: string;
  /** Para el SCHEDULE SQL no hace falta; el cliente ya apunta al schema correcto. */
  maxMemory?: number;
  /** Logger opcional para avisos de capa; por defecto console.debug silencioso. */
  onWarn?: (msg: string) => void;
  /** Nombre de la función RPC para contadores atómicos. */
  counterRpc?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  writes: number;
  dels: number;
  memSize: number;
  kv: boolean;
  db: boolean;
}

const NOOP = () => void 0;

function isExpired(expiresAt: number | null | undefined): boolean {
  if (expiresAt == null) return false;
  return expiresAt < Date.now();
}

/**
 * Implementación de referencia que mantiene cadenas (JSON) con TTL.
 * Utilizada como capa de memoria del CacheStore y como fallback si no hay KV/BD.
 */
export function createInMemoryStore(max = 500): KVStore & { size(): number; clear(): void } {
  const map = new Map<string, { v: string; exp: number | null }>();
  return {
    name: 'memoria',
    async get(key) {
      const hit = map.get(key);
      if (!hit) return null;
      if (hit.exp != null && hit.exp < Date.now()) {
        map.delete(key);
        return null;
      }
      return hit.v;
    },
    async set(key, value, ttlMs) {
      if (map.size >= max && !map.has(key)) {
        const oldest = map.keys().next().value;
        if (oldest !== undefined) map.delete(oldest);
      }
      map.set(key, { v: value, exp: ttlMs == null ? null : Date.now() + ttlMs });
    },
    async del(key) {
      map.delete(key);
    },
    size: () => map.size,
    clear: () => map.clear(),
  };
}

/**
 * Store Vercel KV (Upstash REST compatible) SIN dependencias: fetch plano.
 * Devuelve `null` si no hay env vars KV_REST_API_URL/KV_REST_API_TOKEN (activa en Vercel).
 */
export function createVercelKvStore(): KVStore | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const base = url.replace(/\/+$/, '');
  return {
    name: 'vercel-kv',
    async get(key) {
      const res = await fetch(`${base}/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(2500),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`KV GET ${res.status}`);
      return await res.text();
    },
    async set(key, value, ttlMs) {
      const query = ttlMs != null ? `?ex=${Math.max(1, Math.floor(ttlMs / 1000))}` : '';
      const res = await fetch(`${base}/${encodeURIComponent(key)}${query}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' },
        body: value,
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) throw new Error(`KV SET ${res.status}`);
    },
    async del(key) {
      const res = await fetch(`${base}/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(2500),
      });
      if (res.status !== 404 && !res.ok) throw new Error(`KV DEL ${res.status}`);
    },
  };
}

/**
 * Almacén de caché multi-tienda (cache-aside).
 */
export class CacheStore {
  private readonly db?: CacheDbLike | null;
  private readonly kv?: KVStore | null;
  private readonly memory: ReturnType<typeof createInMemoryStore>;
  private readonly counterRpc: string;
  private readonly warn: (msg: string) => void;
  private stats = { hits: 0, misses: 0, writes: 0, dels: 0 };

  constructor(opts: CacheStoreOptions = {}) {
    this.db = opts.db ?? null;
    this.kv = opts.kv ?? null;
    this.memory = createInMemoryStore(opts.maxMemory ?? 512);
    this.counterRpc = opts.counterRpc ?? 'bump_counter';
    this.warn = opts.onWarn ?? NOOP;
  }

  /**
   * Lectura cache-aspirante siguiendo el orden memoria → KV → BD.
   * Devuelve el valor parseado (JSON) o null si miss/expirado/error (la capa mala NO rompe).
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const mem = await this.memory.get(key).catch(() => null);
    if (mem != null) {
      this.stats.hits++;
      return JSON.parse(mem) as T;
    }
    if (this.kv) {
      try {
        const raw = await this.kv.get(key);
        if (raw != null) {
          this.stats.hits++;
          await this.memory.set(key, raw).catch(NOOP);
          return JSON.parse(raw) as T;
        }
      } catch (err) {
        this.warn(`KV get(${key}): ${err}`);
      }
    }
    if (this.db) {
      try {
        const raw = await this.dbGet(key);
        if (raw != null) {
          this.stats.hits++;
          await this.memory.set(key, JSON.stringify(raw)).catch(NOOP);
          return raw as T;
        }
      } catch (err) {
        this.warn(`BD cache get(${key}): ${err}`);
      }
    }
    this.stats.misses++;
    return null;
  }

  /** Escritura best-effort: falla una capa, tolera; memoria siempre primero. */
  async set(key: string, value: unknown, ttlMs = 60_000): Promise<void> {
    const raw = JSON.stringify(value);
    await this.memory.set(key, raw, ttlMs).catch(NOOP);
    this.stats.writes++;
    if (this.kv) {
      this.kv.set(key, raw, ttlMs).catch((err) => this.warn(`KV store set(${key}): ${err}`));
    }
    if (this.db) {
      this.dbSet(key, raw, ttlMs).catch((err) => this.warn(`cache set(${key}): ${err}`));
    }
  }

  /** Cache-aside clásico: si no hay hit ejecuta loader, guarda el resultado y lo devuelve. */
  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit != null) return hit;
    const value = await loader();
    if (value != null) {
      await this.set(key, value, ttlMs);
    }
    return value;
  }

  /** Invalida la clave en todas las capas. */
  async del(key: string): Promise<void> {
    this.stats.dels++;
    await this.memory.del(key).catch(NOOP);
    if (this.kv) this.kv.del(key).catch((err) => this.warn(`KV store del(${key}): ${err}`));
    if (this.db) this.dbDel(key).catch((err) => this.warn(`cache del(${key}): ${err}`));
  }

  /** Contador atómico persistente (INCR) vía RPC de BD — usado para votos, stats, etc.
   *  Si no hay fauna de BD, revuelve a memoria volatile (solo proceso). */
  async bumpCounter(key: string, by = 1): Promise<number> {
    if (this.db?.rpc) {
      try {
        const { data, error } = await this.db.rpc(this.counterRpc, { p_key: key });
        if (error) throw new Error(String(error?.message ?? error));
        return typeof data === 'number' ? data : 0;
      } catch (err) {
        this.warn(`RPC ${this.counterRpc}(${key}): ${err}`);
      }
    }
    const mem = await this.memory.get(key).catch(() => null);
    const next = (mem ? Number(JSON.parse(mem)) : 0) + by;
    await this.memory.set(key, JSON.stringify(next)).catch(NOOP);
    return next;
  }

  /** Métricas de uso (para el "medir antes de invertir" del plan). */
  statsSnapshot(): CacheStats {
    return { ...this.stats, memSize: this.memory.size(), kv: !!this.kv, db: !!this.db };
  }

  clearMemory(): void {
    this.memory.clear();
  }

  private async dbGet<T>(key: string): Promise<T | null> {
    const { data, error } = await this.db!.from('cache').select('value, expires_at').eq('key', key).maybeSingle();
    if (error) throw new Error(String(error?.message ?? error));
    if (!data) return null;
    const row = data as { value?: string | object; expires_at?: string | null };
    if (isExpired(row.expires_at ? new Date(row.expires_at).getTime() : null)) {
      return null;
    }
    return typeof row.value === 'string' ? (JSON.parse(row.value) as T) : (row.value as T);
  }

  private async dbSet(key: string, raw: string, ttlMs: number): Promise<void> {
    await this.db!.from('cache').upsert(
      {
        key,
        value: JSON.parse(raw),
        expires_at: ttlMs > 0 ? new Date(Date.now() + ttlMs).toISOString() : null,
      },
      { onConflict: 'key' }
    );
  }

  private async dbDel(key: string): Promise<void> {
    await this.db!.from('cache').delete().eq('key', key);
  }
}

/**
 * Se genera el store concreto según lo disponible. Helper por defecto:
 * crea KV desde env Vercel y/o BD desde el parámetro.
 */
export function createCacheStore(opts: Partial<CacheStoreOptions> & { db?: CacheDbLike | null; kv?: KVStore | null } = {}): CacheStore {
  return new CacheStore({ kv: opts.kv ?? createVercelKvStore(), ...opts });
}

export type CacheStoreLike = Pick<CacheStore, 'get' | 'set' | 'getOrSet' | 'del' | 'bumpCounter' | 'statsSnapshot'>;