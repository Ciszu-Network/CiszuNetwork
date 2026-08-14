export * from './src/client';
export * as ciszubotSchema from './src/schemas/ciszubot';
export * as muzicmaniaSchema from './src/schemas/muzicmania';
export * as ciszunetworkSchema from './src/schemas/ciszunetwork';
export * as ciszuSchema from './src/schemas/ciszu';

// Helpers de query re-exportados para que los consumidores NO necesiten depender
// de drizzle-orm directamente (el paquete es la única capa de datos server-side).
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  and,
  or,
  not,
  asc,
  desc,
  count,
  sum,
  avg,
  min,
  max,
  ilike,
  like,
  isNull,
  isNotNull,
  inArray,
  sql,
} from 'drizzle-orm';