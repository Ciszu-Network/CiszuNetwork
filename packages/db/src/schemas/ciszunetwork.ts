import {
  pgSchema,
  bigint,
  boolean,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Schema `ciszunetwork` — web principal. Contacto de la página.
 * RLS: cualquiera inserta, solo admins leen.
 */
export const ciszunetwork = pgSchema('ciszunetwork');

export const messages = ciszunetwork.table(
  'messages',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull().default('General'),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
);