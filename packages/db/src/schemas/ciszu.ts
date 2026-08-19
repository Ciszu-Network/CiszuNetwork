import {
  pgSchema,
  bigint,
  index,
  jsonb,
  primaryKey,
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

export const puckPages = ciszu.table(
  'puck_pages',
  {
    app: text('app').notNull().default('ciszunetwork'),
    path: text('path').notNull(),
    data: jsonb('data').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.app, t.path] }),
    index('puck_pages_app_idx').on(t.app),
  ]
);