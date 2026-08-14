# ORM_SYSTEM — Drizzle ORM (capa de datos server-side)

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: ORM_SYSTEM_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: documenta el ORM oficial de Ciszu Network (**Drizzle ORM** vía `@ciszunetwork/db`),
> cómo se definen los schemas, cómo se usa el cliente server-only y la frontera con
> Supabase/PostgREST. Complementa a `DB_SYSTEM.md` (consultas SQL) y `PACKAGES_SYSTEM.md` §8.1.

Drizzle ORM es la capa de datos server-side del ecosistema. Reemplaza el acceso a base de datos
directo con `@supabase/supabase-js` en servidores (API routes, React Server Components, bot de
Discord y scripts), manteniendo Supabase (auth, Storage, RLS) para el navegador.

---

## 1. Resumen ejecutivo

| Aspecto | Decisión |
|---|---|
| ORM | **Drizzle ORM** (`drizzle-orm`) |
| Driver | `pg` (node-postgres), server-only |
| Cliente | `@ciszunetwork/db` → `db`, `createDb()`, `endPool()` |
| Esquemas | 4: `ciszubot`, `muzicmania`, `ciszunetwork`, `ciszu` |
| Casing | `snake_case` en BD → propiedades camelCase en TS (`db` proxy configurado) |
| Navegador | NUNCA importa `@ciszunetwork/db`; usa Supabase anon key + PostgREST + RLS |
| Extras | `createCacheDb()` para adaptar la caché a `CacheDbLike` |

Fecha de adopción: **14 ago 2026** (plan F1, aprobado).

---

## 2. Por qué Drizzle (y no otro ORM)

| Candidato | Decisión | Motivo |
|---|---|---|
| **Drizzle ORM** | **Elegido** | Tipado first-class, sin magic, SQL nativo fiel, funciona con `pg` (sin binarios nativos), migraciones simples y con Supabase (pooler). |
| Prisma | No | Genera binarios/engines (peso, compatibilidad con Vercel serverless y Docker del bot). |
| Kysely | No | Query builder sin capa de migración integrada; define poco schema. |
| raw `pg` / `postgres` | No | Tipos y migraciones a mano; más superficie de error. |

Drizzle cubre el vacío real: tipar los 4 esquemas y el acceso server-side sin perder fidelidad
al SQL real de producción (verificado con `dbvr` contra Supabase).

---

## 3. Paquete `@ciszunetwork/db`

Ubicación: `packages/db/`.

```
packages/db/
├── index.ts                 # Re-export público: db, createDb, schemas, createCacheDb
├── src/
│   ├── client.ts            # Pool pg (lazy) + proxy Drizzle (casing snake_case)
│   ├── cacheAdapter.ts      # createCacheDb(): adaptador CacheDbLike para la caché
│   └── schemas/
│       ├── ciszubot.ts      # Schema ciszubot (bot de Discord)
│       ├── muzicmania.ts    # Schema muzicmania (juego de ritmo)
│       ├── ciszunetwork.ts  # Schema ciszunetwork (landing principal)
│       └── ciszu.ts         # Schema ciszu (marca/ecosistema)
```

Dependencias runtime: `drizzle-orm`, `pg`. Server-only por convención (nunca se re-exporta al
navegador).

---

## 4. Cliente (server-only, lazy de verdad)

En `src/client.ts`:

- **Pool perezoso**: la conexión se crea en el PRIMER query, nunca al importar. Esto permite
  importar el paquete en builds de Next sin `DATABASE_URL` presente y solo fallar cuando un
  server component / API route ejecuta un query sin la env.
- **Proxy `db`**: singleton de broker (`buildProxy`) que resuelve `buildDb()` en el primer
  acceso de propiedad. Seguro para imports en cualquier entorno.
- **`endPool()`**: cierre del pool (tests y scripts de corta vida).
- La connection string sale de `DATABASE_URL` (pooler transaccional de Supabase, puerto 6543).

Ejemplo:

```ts
import { db, ciszubotSchema, eq } from '@ciszunetwork/db';

const rows = await db
  .select({ prefix: ciszubotSchema.guildConfigs.prefix })
  .from(ciszubotSchema.guildConfigs)
  .where(eq(ciszubotSchema.guildConfigs.guildId, guildId))
  .limit(1);
```

---

## 5. Esquemas por schema (14 ago 2026)

Todos fieles a los esquemas reales de Supabase (verificados por `dbvr`). Se usa
`pgSchema('<schema>')` del `drizzle-orm/pg-core` para definir cada schema.

### 5.1 `ciszubot` (`ciszubot.ts`)

Tablas del bot de Discord:

| Tabla | Descripción |
|---|---|
| `guild_config` | Config legacy del guild (mod/admin roles) |
| `guild_configs` | Config principal del panel (prefijo, niveles, bienvenidas, tickets, automod) |
| `command_logs` | Historial de ejecución de comandos |
| `bot_status` | Estado en vivo (online, version, guilds, commands_total) |
| `wallets` | Economía: balance + banco por user/guild |
| `transactions` | Movimientos de economía |
| `shop_items` | Tienda por guild |
| `inventory` | Inventario de items por user/guild |
| `levels` | XP y niveles por user/guild |
| `warns` | Advertencias de moderación |
| `tickets` | Tickets abiertos/cerrados |
| `giveaways` | Sorteos activos/terminados |
| `afk` | Estado AFK de usuarios |
| `alliances` | Alianzas entre guilds |
| `discord_users` | Usuarios OAuth de Discord (tokens) |
| `snipes` | Mensajes borrados (snipe) |
| `audit_log` | Auditoría de acciones del panel |

RLS: la mayoría deny-all para anon/authenticated (solo service_role). El acceso del panel pasa
por el server (API route de `ciszubot-website`), no por PostgREST del navegador.

### 5.2 `muzicmania` (`muzicmania.ts`)

Tablas del juego de ritmo: perfiles, scores/leaderboards, auth de cuentas. Ver `DB_SYSTEM.md`.

### 5.3 `ciszunetwork` (`ciszunetwork.ts`)

Tablas de la landing principal / reviews del ecosistema.

### 5.4 `ciszu` (`ciszu.ts`)

Tablas de marca / contenido del ecosistema.

---

## 6. Frontera con Supabase (importante)

- **Navegador**: se mantiene `@supabase/supabase-js` + PostgREST + RLS (anon key). El cliente
  del navegador NUNCA importa `@ciszunetwork/db`.
- **Servidor**: API routes, RSC server components y el bot usan Drizzle con `DATABASE_URL`
  (service-role vía pooler). Las policies RLS siguen siendo obligatorias (defensa en profundidad).
- **Auth**: la verificación de sesión sigue en Supabase (server); Drizzle solo accede a datos
  ya autorizados por la capa de auth/RLS del servidor.

**Regla de oro**: Drizzle nunca se expone al cliente. Si se necesita acceso desde el navegador,
se expone una API route limitada (rate limit + Zod) que a su vez consulta Drizzle en el server.

---

## 7. Reglas de uso

1. **Server-only**: importar `@ciszunetwork/db` solo en server components, API routes, bot y
   scripts. Si se importa en el cliente, es un bug.
2. **Nunca concatenar strings SQL**: usar las helpers de Drizzle (`eq`, `and`, `or`, ...)
   parametrizadas (previene SQL injection — ver `SECURITY_PROTOCOLS.md`).
3. **Casing**: escribir propiedades en camelCase; Drizzle mapea a snake_case (config del proxy).
4. **Lazy**: no tocar `db` en tiempo de módulo de webs (sin queries en top-level de layouts
   que no lo necesiten); los builds de Next no deben requerir `DATABASE_URL`.
5. **RLS**: las tablas nuevas siguen exigiendo `ENABLE ROW LEVEL SECURITY` + policy explícita
   en la migración (independiente de Drizzle).
6. **drizzle-zod**: al validar inputs que llegan a tablas, se puede derivar el schema Zod desde
   el schema Drizzle (`drizzle-zod`) en lugar de escribirla a mano.
7. **Cache**: `createCacheDb()` adapta la tabla de caché a la interfaz `CacheDbLike` de
   `@ciszunetwork/utils` (para `CacheStore`). No duplicar lógica de caché en cada web.

---

## 8. Operación y verificación

- Verificar esquemas contra la BD real: `dbvr sql -ds=supabase "SELECT ..."`.
- Tests de servicios del bot usan `tests/helpers/db.ts` con un pool de test (no producción).
- `pnpm --filter @ciszunetwork/db lint` (tsc) valida los schemas.

---

## 9. Historial de la migración (F1)

- [x] Crear `packages/db/` con `drizzle-orm` + `pg` (server-only).
- [x] Schemas TS de los 4 esquemas verificados contra la BD.
- [x] Migrar servidor: API routes y RSC de webs a Drizzle.
- [x] Migrar bot: `src/services/supabase.ts` → Drizzle; commands y listeners.
- [x] Eliminar `@supabase/supabase-js` del bot (las webs lo mantienen para el navegador).
- [x] `createCacheDb()` para la caché (CacheStore del bot y webs).
- [x] Limpiar clientes supabase obsoletos (`supabaseServer.ts`, `supabaseAdmin.ts` de cada web).

**Pendiente**: la migración completa de `ciszunetwork-website` y `ciszukoantony-website` cuando
tengan queries server-side que lo ameriten (hoy usan Supabase para contenido público RLS).

---

_Última revisión: 14 ago 2026._ Relacionado: `DB_SYSTEM.md`, `PACKAGES_SYSTEM.md`,
`BACKEND_SYSTEM.md`, `FULL_STACK_SYSTEM.md`, `SECURITY_PROTOCOLS.md`.