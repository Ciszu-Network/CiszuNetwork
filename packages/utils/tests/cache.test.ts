import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createInMemoryStore, createVercelKvStore, CacheStore, createRateLimiter } from '../index';
import type { CacheDbLike, KVStore } from '../index';

describe('createInMemoryStore', () => {
  const store = createInMemoryStore(2);

  beforeEach(async () => store.clear());

  it('set/get roundtrip', async () => {
    await store.set('a', '{"x":1}');
    expect(await store.get('a')).toBe('{"x":1}');
  });

  it('devuelve null en miss', async () => {
    expect(await store.get('nope')).toBeNull();
  });

  it('expira por TTL', async () => {
    await store.set('a', '1', 20);
    expect(await store.get('a')).toBe('1');
    await new Promise((r) => setTimeout(r, 40));
    expect(await store.get('a')).toBeNull();
  });

  it('evicta por tamaño max (LRU)', async () => {
    for (let i = 0; i < 15; i++) await store.set(`k${i}`, String(i));
    expect(store.size()).toBe(2);
    expect(await store.get('k0')).toBeNull();
    expect(await store.get('k14')).toBe('14');
  });

  it('del borra', async () => {
    await store.set('a', '1');
    await store.del('a');
    expect(await store.get('a')).toBeNull();
  });
});

describe('createVercelKvStore (sin env → null)', () => {
  const saved = { url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN };

  afterEach(() => {
    if (saved.url) process.env.KV_REST_API_URL = saved.url; else delete process.env.KV_REST_API_URL;
    if (saved.token) process.env.KV_REST_API_TOKEN = saved.token; else delete process.env.KV_REST_API_TOKEN;
  });

  it('devuelve null sin configuración', () => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    expect(createVercelKvStore()).toBeNull();
  });
});

describe('CacheStore', () => {
  let store: CacheStore;

  afterEach(() => {
    store?.clearMemory();
    vi.restoreAllMocks();
  });

  function makeKv(): KVStore {
    const m = new Map<string, string>();
    return {
      name: 'test-kv',
      get: async (k) => m.get(k) ?? null,
      set: async (k, v) => void m.set(k, v),
      del: async (k) => void m.delete(k),
    };
  }

  describe('memoria', () => {
    beforeEach(() => {
      store = new CacheStore();
    });

    it('set/get TTL default 60s', async () => {
      await store!.set('a', { ok: true });
      expect(await store!.get('a')).toEqual({ ok: true });
    });

    it('getOrSet popula y acerta la segunda vez (loader 1 sola ejecución)', async () => {
      let calls = 0;
      const loader = async () => {
        calls++;
        return { n: calls };
      };
      const a = await store!.getOrSet('x', 60_000, loader);
      expect(a).toEqual({ n: 1 });
      const b = await store!.getOrSet('x', 60_000, loader);
      expect(b).toEqual({ n: 1 });
      expect(calls).toBe(1);
    });

    it('getOrSet vueve a cargar tras caducidad', async () => {
      let calls = 0;
      const loader = async () => {
        calls++;
        return `v${calls}`;
      };
      await store!.getOrSet('x', 10, loader);
      await new Promise((r) => setTimeout(r, 30));
      await store!.getOrSet('x', 10, loader);
      expect(calls).toBe(2);
    });

    it('del invalida', async () => {
      await store!.set('a', 1);
      await store!.del('a');
      expect(await store!.get('a')).toBeNull();
    });
  });

  describe('capa KV', () => {
    it('get cae al KV tras miss de memoria y puebla hit', async () => {
      const kv = makeKv();
      await kv.set('x', '{"from":"kv"}');
      store = new CacheStore({ kv });
      expect(await store.get('x')).toEqual({ from: 'kv' });
      expect(await store.get('x')).toEqual({ from: 'kv' });
    });

    it('set escribe también al KV', async () => {
      const kv = makeKv();
      store = new CacheStore({ kv });
      await store.set('a', 'v', 1000);
      expect(await kv.get('a')).toBe(JSON.stringify('v'));
    });

    it('falso positivo del KV (no disponible) no rompe el loader', async () => {
      const brokenKv: KVStore = {
        name: 'broken',
        get: async () => {
          throw new Error('down');
        },
        set: async () => undefined,
        del: async () => undefined,
      };
      store = new CacheStore({ kv: brokenKv });
      const loader = vi.fn(async () => 'val');
      expect(await store!.getOrSet('y', 1000, loader)).toBe('val');
      expect(loader).toHaveBeenCalledOnce();
    });
  });

  describe('capa BD (CacheDbLike)', () => {
    it('en frío: loader → set → BD; segunda llamada hit por BD', async () => {
      const rows = new Map<string, { v: object; exp: string }>();
      const db: CacheDbLike = {
        from: () => {
          return {
            select: () => ({
              eq: (col, val) => ({
                maybeSingle: async () => {
                  if (col !== 'key') throw new Error('col rara');
                  const row = rows.get(val as string);
                  return { data: row ?? null, error: null };
                },
              }),
            }),
            upsert: async (row: any, _opts: any) => {
              rows.set(row.key, { v: row.value, expires: row.expires_at ?? null });
              return { error: null };
            },
            delete: () => ({
              eq: async (_col: string, v: string) => {
                rows.delete(v);
                return { error: null };
              },
            }),
          };
        },
      };
      store = new CacheStore({ db });
      let calls = 0;
      const loader = async () => {
        calls++;
        return { leaderboard: [1, 2] };
      };
      const first = await store!.getOrSet('lb:1', 60_000, loader);
      expect(first).toEqual({ leaderboard: [1, 2] });
      expect(await store!.get<{ leaderboard: number[] }>('lb:1')).toEqual({ leaderboard: [1, 2] });
      expect(calls).toBe(1);
    });

    it('bumpCounter usa la RPC de BD devolviendo valor atómico', async () => {
      const db: CacheDbLike = {
        rpc: vi.fn(async (fn: string, args: { p_key: string }) => {
          return { data: 7, error: null };
        }),
      } as unknown as CacheDbLike;
      store = new CacheStore({ db });
      const n = await store!.bumpCounter('topgg_votes');
      expect(n).toBe(7);
      expect(db.rpc).toHaveBeenCalledWith('bump_counter', { p_key: 'topgg_votes' });
    });
  });
});

describe('createRateLimiter', () => {
  it('permite hasta max y bloquea después', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
    expect(limiter.allow('1.2.3.4').allowed).toBe(true);
    expect(limiter.allow('1.2.3.4').allowed).toBe(true);
    expect(limiter.allow('1.2.3.4').allowed).toBe(true);
    const blocked = limiter.allow('1.2.3.4');
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(limiter.allow('5.6.7.8').allowed).toBe(true); // otra IP libre
  });

  it('reinicia ventana tras el windowMs', async () => {
    const limiter = createRateLimiter({ windowMs: 20, max: 1 });
    expect(limiter.allow('ip').allowed).toBe(true);
    expect(limiter.allow('ip').allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 40));
    expect(limiter.allow('ip').allowed).toBe(true);
  });

  it('reset libera la clave', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
    limiter.allow('ip');
    expect(limiter.allow('ip').allowed).toBe(false);
    limiter.reset('ip');
    expect(limiter.allow('ip').allowed).toBe(true);
  });
});