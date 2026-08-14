# DB_SYSTEM — Base de datos Supabase (consultas y administración)

Versión: 2.1.0
Actualización: 2026-08-14
Identificador: DB_SYSTEM_V2.1.0_2026_08_14_ciszunetwork

> **Definición**: guía de la base de datos de Ciszu Network: esquemas, consultas de
> operación por schema, infraestructura a no tocar, buenas prácticas y la decisión ORM.
> Solo SELECT si no estás seguro.

Guía de la base de datos de Ciszu Network: esquemas, consultas de operación por schema, infraestructura a no tocar y buenas prácticas. **Siempre con datos reales de producción — solo SELECT si no estás seguro.**

Acceso:
- **DBeaver GUI**: clic derecho en conexión `supabase` → SQL Editor → pegar → Ctrl+Enter
- **CLI (dbvr)**: `dbvr sql -ds=supabase "SELECT ..."`

## 🐝 ciszubot — bot de Discord

```sql
-- Estado del bot en vivo (lo usa la web)
SELECT online, last_seen, version, guilds, commands_total, prefix FROM ciszubot.bot_status;

-- Economía: top 10 wallets por balance
SELECT user_id, guild_id, balance, bank FROM ciszubot.wallets ORDER BY balance DESC LIMIT 10;

-- Últimas transacciones
SELECT id, guild_id, user_id, amount, type, note, created_at FROM ciszubot.transactions ORDER BY created_at DESC LIMIT 20;

-- Niveles: top 10 XP
SELECT user_id, guild_id, xp FROM ciszubot.levels ORDER BY xp DESC LIMIT 10;

-- Comandos más usados (últimos 7 días)
SELECT command, count(*) AS veces FROM ciszubot.command_logs WHERE executed_at > now() - interval '7 days' GROUP BY command ORDER BY veces DESC LIMIT 15;

-- Tickets abiertos
SELECT id, guild_id, channel_id, user_id, topic FROM ciszubot.tickets WHERE open = true;

-- Giveaways activos
SELECT id, guild_id, prize, winners, ends_at FROM ciszubot.giveaways WHERE ended = false ORDER BY ends_at;

-- Warns recientes
SELECT id, guild_id, user_id, moderator, reason, created_at FROM ciszubot.warns ORDER BY created_at DESC LIMIT 20;

-- Usuarios con AFK activo
SELECT user_id, guild_id, reason, since FROM ciszubot.afk;

-- Config de un servidor (por guild_id)
SELECT * FROM ciszubot.guild_configs WHERE guild_id = 'TU_GUILD_ID';

-- Snipes recientes
SELECT id, channel_id, user_id, content, deleted_at FROM ciszubot.snipes ORDER BY deleted_at DESC LIMIT 10;

-- Tienda de un servidor
SELECT id, name, price, emoji FROM ciszubot.shop_items WHERE guild_id = 'TU_GUILD_ID' ORDER BY price;
```

## 🎵 muzicmania — juego de música

```sql
-- Top 10 leaderboard global (scores)
SELECT id, user_id, track_id, score, accuracy, created_at FROM muzicmania.scores ORDER BY score DESC LIMIT 10;

-- Mejor score de un jugador
SELECT * FROM muzicmania.scores WHERE user_id = 'UUID' ORDER BY score DESC LIMIT 5;

-- Perfil de un usuario (por username)
SELECT id, username, display_name, high_score, level, xp, role, country FROM muzicmania.profiles WHERE username = 'nombre';

-- Usuarios totales y admins
SELECT count(*) AS total FROM muzicmania.profiles;
SELECT username, is_admin FROM muzicmania.profiles WHERE is_admin = true;

-- Estadísticas de una canción
SELECT track_id, play_count, like_count FROM muzicmania.track_stats ORDER BY play_count DESC LIMIT 10;

-- Reviews recientes con likes
SELECT id, user_id, rating, likes_count, created_at FROM muzicmania.reviews ORDER BY created_at DESC LIMIT 10;

-- Cuentas eliminadas
SELECT id, username, deleted_at, reason FROM muzicmania.deleted_accounts ORDER BY deleted_at DESC LIMIT 10;

-- Métricas globales del juego
SELECT * FROM muzicmania.global_metrics ORDER BY snapshot_date DESC LIMIT 1;

-- Tickets de soporte abiertos
SELECT id, user_id, title, status, priority, created_at FROM muzicmania.support_tickets WHERE status = 'open' ORDER BY created_at;
```

## 🌐 ciszunetwork — web principal

```sql
-- Mensajes del formulario de contacto
SELECT * FROM ciszunetwork.messages ORDER BY created_at DESC LIMIT 20;
```

## ⚠️ NUNCA tocar (infraestructura Supabase)

- `auth.*` (111 tablas: usuarios, sesiones, tokens) — solo lectura si acaso
- `storage.*` (buckets `ciszu-cdn`, `avatars`) — gestionar por Dashboard/CLI, no SQL directo
- `realtime`, `vault`, `supabase_migrations`, `extensions` — internos

## Verificaciones de seguridad (RLS, grants, funciones)

```sql
-- Tablas sin RLS (deben ser 0 en muzicmania/ciszubot/ciszunetwork/public)
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname IN ('muzicmania','ciszubot','ciszunetwork','public') ORDER BY 1,2;

-- Grants de anon (solo lo necesario, NUNCA ALL en tablas de datos)
SELECT grantee, table_schema, table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee='anon' ORDER BY 1,2;

-- ¿Ejecuta una función como anon?
SELECT has_function_privilege('anon','<schema>.<fn>(<signature>)'::regprocedure,'EXECUTE');
```

Detalle y protocolos completos: `SECURITY_PROTOCOLS.md`.

## Buenas prácticas (novato DBeaver)

- Doble clic en `supabase` → conectar; doble clic en `Schemas` → `ciszubot` → doble clic en tabla → pestaña **Data**.
- **SELECT** es seguro. **INSERT/UPDATE/DELETE** en DBeaver modifican la BD real al instante — son cambios de producción.
- Pestaña **ER Diagram** de una tabla → relaciones con otras.
- Para probar SQL sin riesgo: `SELECT ... WHERE 1=0;` no devuelve filas pero valida sintaxis.

## Estructura general

| Schema | Propósito | Tablas principales |
|---|---|---|
| `ciszubot` | Bot de Discord | bot_status, wallets, transactions, levels, command_logs, tickets, giveaways, warns, afk, guild_configs, snipes, shop_items |
| `muzicmania` | Juego de música | scores, profiles, track_stats, reviews, deleted_accounts, global_metrics, support_tickets |
| `ciszunetwork` | Web principal | messages (contacto) |
| `ciszu` | Infra compartida (NO REST) | cache, counters |
| `auth` / `storage` | Supabase (NO tocar) | users, sessions, buckets |

## Cómo consultar desde las apps

```ts
// cliente server (service_role) — solo server
import { createClient } from '@supabase/supabase-js'
const admin = createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// esquema específico en consulta REST
const { data } = await supabase.from('ciszubot.bot_status').select('*').single()

// o con db schema en el cliente
const cache = createClient(URL, KEY, { db: { schema: 'ciszu' } })
```

> Regla: el `service_role` NUNCA se usa en el navegador (ver `SECURITY_PROTOCOLS.md` y
> `BACKEND_SYSTEM.md`).

## Conceptos de BD (contexto informático)

| Término | Definición |
|---|---|
| **Schema** | Espacio de nombres de tablas |
| **Tabla** | Conjunto de filas/columnas |
| **Fila/Registro** | Entrada de datos |
| **Clave primaria** | Identificador único |
| **FOREIGN KEY** | Referencia a otra tabla |
| **Índice** | Acelerador de consultas |
| **RLS** | Filtro de filas por usuario |
| **Policy** | Regla de acceso de RLS |
| **View** | Consulta guardada |
| **Function/RPC** | Lógica en BD |
| **Interval** | Rango temporal (Postgres) |
| **jsonb** | Tipo JSON binario |

## Buenas prácticas de consultas

- Siempre `LIMIT` en consultas de listado.
- Usar índices en `WHERE`/`ORDER BY` frecuentes (user_id, guild_id).
- Fecha: usar `now()` / `now() - interval '7 days'`.
- Para agregados usar `GROUP BY` con alias (`AS veces`).
- No escribir en producción sin confirmar con el usuario (solo SELECT por defecto).
- Verificar RLS y grants tras tocar policies (ver sección de seguridad arriba).

## Errores comunes

| Error | Causa | Solución |
|---|---|---|
| `permission denied for table` | Falta policy RLS / grant | Añadir policy; verificar grants anon |
| 401 en REST | JWT inválido/expirado | Renovar sesión |
| Consulta lenta | Falta índice o sin LIMIT | Añadir índice y limitar |
| `duplicate key value` | PK duplicada | Usar upsert o gen_random_uuid() |
| Tabla sin RLS en advisor | Tabla expuesta sin RLS | Habilitar RLS + policies |

## Buenas prácticas de índices

- Índices en columnas usadas en `WHERE`/`JOIN`/`ORDER BY` frecuentes: `user_id`, `guild_id`,
  `created_at` (típico de búsquedas temporales).
- Preferir índices compuestos si el filtro combina varias columnas (p.ej. `user_id + created_at`).
- Para ordenaciones frecuentes, el índice en la columna del `ORDER BY` evita sorts costosos
  en tablas grandes.
- Verificar el plan con `EXPLAIN` en consultas lentas antes de añadir índices — un índice mal
  elegido ocupa espacio y ralentiza las escrituras.
- El orden de columnas importa: filtrar primero por la columna de mayor cardinalidad.
- No indexar columnas de baja cardinalidad (booleans) salvo que combine con otra.

## Capa de datos y ORM (decisión: Drizzle)

- Hoy las apps consultan con `@supabase/supabase-js` (REST/PostgREST + RPC), sin ORM.
- **Decisión (14 ago 2026): Drizzle ORM** como capa **server-side** (API routes, bot, scripts).
  Motivo: respeta el **RLS de Supabase** (se ejecuta sobre el pool estándar y las policies /
  `request.jwt.claims` funcionan), es SQL tipado sin binarios y encaja en monorepo pnpm.
- **El navegador no usa el ORM**: mantiene anon key + PostgREST + RLS. Prisma quedó descartado
  (fricción con RLS/`auth.uid()` y generación de cliente).
- Implementación pendiente (TODO): schema en `packages/db/`, crear `ORM_SYSTEM.md`.
- Detalle: `BACKEND_SYSTEM.md` §18 (ORM) y §19 (frameworks).

## Relación con otros sistemas

- `SECURITY_PROTOCOLS.md` — RLS en toda tabla nueva, policies por comando y verificación con
  `dbvr` tras cada migración; complementa la sección "Verificaciones de seguridad" de aquí.
- `BACKEND_SYSTEM.md` — cómo las apps consumen la BD (clientes `@supabase/supabase-js`,
  regla del `service_role` solo en server).
- `CACHING_SYSTEM.md` — el schema `ciszu.cache` guarda caché compartida; las consultas pesadas
  pueden servirse desde ahí en vez de pegar a Postgres en cada request.
- `AUTH_SYSTEM.md` — el schema `auth.*` (no tocar) y el flujo de sesiones/JWT que alimenta
  `(SELECT auth.uid())` en las policies.
- `CDN_MIGRATIONS.md` — los buckets de `storage.*` y la gestión de assets vía Dashboard/CLI.
- `MIGRATION_HANDOVER.md` — estado de las migraciones y su aplicación entre sesiones.

## Preguntas frecuentes

**¿Puedo hacer INSERT/UPDATE/DELETE desde DBeaver?** Técnicamente sí, pero modifican la BD de
producción al instante — por defecto solo SELECT, y confirmar siempre antes con el usuario.

**¿Cómo pruebo una consulta sin tocar datos?** `SELECT ... WHERE 1=0;` valida la sintaxis sin
devolver filas, o trabaja sobre el Supabase local (`DOCKER_SYSTEM.md`) que replica el schema.

**¿Por qué una tabla devuelve "permission denied"?** Falta policy RLS o grant para el rol
(generalmente `anon` o `authenticated`) — ver la tabla de errores comunes y
`SECURITY_PROTOCOLS.md`.

**¿Dónde está la contraseña de la BD?** En el vault (`VAULT_SYSTEM.md`); la conexión de
DBeaver reutiliza las credenciales de `services/supabase/.env`.

**¿Cómo consulto otro esquema?** Especificándolo en la cadena: `ciszubot.bot_status`, o con
`db: { schema: 'X' }` en el cliente de las apps.

## Checklist de una nueva consulta

- [ ] `LIMIT` en listados (evitar traer tablas enteras).
- [ ] Índice en las columnas del `WHERE`/`ORDER BY` si la consulta es frecuente.
- [ ] Alias descriptivos en agregados (`AS veces`).
- [ ] RLS y grants comprobados si se usa desde el cliente REST.
- [ ] Probar primero en Supabase local o con `WHERE 1=0` si es INSERT/UPDATE/DELETE.

_Última revisión: 13 ago 2026._ Relacionado: `BACKEND_SYSTEM.md`, `CACHING_SYSTEM.md`,
`SECURITY_PROTOCOLS.md`, `TOOLS_SYSTEM.md`.
