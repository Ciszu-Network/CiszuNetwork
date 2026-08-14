import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as ciszubot from './schemas/ciszubot';
import * as muzicmania from './schemas/muzicmania';
import * as ciszunetwork from './schemas/ciszunetwork';
import * as ciszu from './schemas/ciszu';

export * as ciszubotSchema from './schemas/ciszubot';
export * as muzicmaniaSchema from './schemas/muzicmania';
export * as ciszunetworkSchema from './schemas/ciszunetwork';
export * as ciszuSchema from './schemas/ciszu';
export { createCacheDb } from './cacheAdapter';

export type DB = NodePgDatabase<{
  ciszubot: typeof ciszubot;
  muzicmania: typeof muzicmania;
  ciszunetwork: typeof ciszunetwork;
  ciszu: typeof ciszu;
}>;

let pool: Pool | undefined;
let current: DB | undefined;

/**
 * Cliente Postgres compartido (server-only). Lazy de verdad: la conexión se crea
 * en el PRIMER query, nunca al importar (builds de Next no fallan sin DATABASE_URL).
 * La connection string sale de `DATABASE_URL` (pooler de Supabase; ej.
 * `postgres://postgres.xxxx:pass@aws-0-xx.pooler.supabase.com:6543/postgres`).
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL no está definida. Configúrala en el entorno server (pooler de Supabase).'
      );
    }
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

function buildDb(): DB {
  if (current) return current;
  current = drizzle(getPool(), {
    schema: { ciszubot, muzicmania, ciszunetwork, ciszu },
    logger: false,
    casing: 'snake_case',
  });
  return current;
}

function buildProxy(): DB {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new Proxy({} as unknown as DB, {
    get(_target, prop: string | symbol) {
      const real = buildDb();
      return Reflect.get(real, prop, real);
    },
  });
}

/**
 * Clientes Drizzle compartidos (server-only). Seguros para importar en cualquier
 * entorno: lanzan el error de DATABASE_URL solo si se ejecuta un query sin ella.
 */
export const db: DB = buildProxy();

/** Cierre del pool (para tests/scripts). */
export async function endPool(): Promise<void> {
  await pool?.end();
  pool = undefined;
  current = undefined;
}