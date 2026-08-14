import {
  pgSchema,
  bigint,
  index,
  jsonb,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Schema `ciszu` — infraestructura central: caché KV y contadores atómicos.
 * Sin RLS: tabla de servidor accesible solo vía service_role (revoked a anon/authenticated).
 */
export const ciszu = pgSchema('ciszu');

export const cache = ciszu.table(
  'cache',
  {
    key: text('key').primaryKey(),
    value: jsonb('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('cache_expires_at_idx').on(t.expiresAt)]
);

export const counters = ciszu.table(
  'counters',
  {
    key: text('key').primaryKey(),
    value: bigint('value', { mode: 'number' }).notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);