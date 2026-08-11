# Sistema de Caché de Ciszu Network

**Implementado: 9 ago 2026** — cierra la última tarea pendiente del toDo de ciszunetwork
("Sistema de caché con Redis — evaluado, diferido hasta métricas"). No se usa Redis:
en su lugar, **caché multi-tienda** con la infraestructura ya existente.

> ⚠️ **TODO el detalle técnico de APIs vive en `packages/utils/src/cache.ts`** (codigo fuente
> documentado). Este documento explica el *qué*, *para qué* y *cómo* del sistema completo.

---

## 1. Problema que resuelve

Requisitos de datos repetidos en el ecosistema que golpean Supabase/PostgREST (y Discord API)
sin necesidad:

1. **Leaderboard de MuzicMania** — todos los visitantes repiten la misma query por página.
2. **Dashboard de CiszuBot** — cada admin repite `GET /users/@me/guilds` y
   `GET /applications/@me/guilds` en cada carga.
3. **Webhook de votos top.gg (`POST /api/votes`)** — endpoint **sin autenticación**: cualquiera
   puede inundarlo y recompensar monedas falsas.
4. **Stats de votos** — no existía contador persistente de votos recibidos.

## 2. Arquitectura (qué hay)

**Paquete `@ciszunetwork/utils`** (`packages/utils/`, nuevo, **cero dependencias**):

- `src/cache.ts` — `CacheStore` multi-tienda *cache-aside* con prioridad:
  1. **Memoria LRU** (TTL, cap ~512 claves) — siempre disponible, latencia 0.
  2. **Vercel KV / Upstash (REST)** — activa automáticamente si existen las env vars
     `KV_REST_API_URL` + `KV_REST_API_TOKEN` (solo en Vercel cuando el usuario las cree).
  3. **Postgres `ciszu.cache`** — vía cliente Supabase `service_role` con `db: { schema: 'ciszu' }`.
- `src/rateLimit.ts` — `createRateLimiter` (ventana fija en memoria) para el webhook de votos.

**Reglas del sistema (del plan original del toDo):**

- La caché es **siempre regenerable desde la BD** (un error de capa = *miss*, nunca una página rota).
- **TTL cortos**: 60s (dashboard/leaderboard). Nunca datos stale durante horas.
- **Invalidación**: no se necesita invalidación activa con TTL 60s; si algún día se escribe
  sobre un dato cacheado, `store.del(key)` lo borra en todas las capas.
- **Nada de datos sensibles**: las claves del dashboard incluyen `user.id` y los arrays
  `DiscordGuild` NO meten tokens de acceso.

## 3. Capa Postgres (Fase 3) — migración 15 (`20260809000015_cache_system.sql`)

Schema **`ciszu`** (nuevo, NO expuesto en el Dashboard REST):

```sql
ciszu.cache    (key text PK, value jsonb, expires_at timestamptz, updated_at)
ciszu.counters (key text PK, value bigint, updated_at)
ciszu.bump_counter(p_key text) → bigint   -- INCR atómico (upsert con retorno)
```

- **RLS desactivado** (infra de servidor, no datos de usuario) + `REVOKE ALL` a anon/authenticated:
  solo `service_role` (bypass RLS) puede tocar estas tablas.
- **¿Por qué RLS off y no genera Advisory warnings?** El advisor `table_rls_disabled` del
Dashboard solo evalúa tablas **expuestas vía PostgREST** (schemas expuestos:
  `muzicmania, ciszubot, ciszunetwork`). El schema `ciszu` **no está expuesto** y los
  grants están revocados a anon/authenticated: nadie llega a esas tablas por REST. El
  RLS sería fricción sin beneficio (service_role lo bypasea igualmente). Si algún día
  se expone `ciszu` en el Dashboard, habría que habilitar RLS antes.
- La función `bump_counter` es **SECURITY INVOKER con `search_path=''`** (reglas anti-advisor del repo).
- Aplicada con `dbvr` — verified en vivo (smoke test 3→4).

## 4. Dónde se aplicó (casos del plan)

| Caso | App | Cambio |
| ---- | --- | ------ |
| 1. Leaderboard | `projects/muzicmania/website` | Nueva API route `src/app/api/leaderboard/route.ts` (server-only): loader usa la misma query PostgREST (service o anon), cache TTL 60s con clave `leaderboard:v1:page:pageSize:sortBy:sortDir:search`. La página `src/app/leaderboard/page.tsx` **ya no consulta Supabase desde el navegador**: hace `fetch('/api/leaderboard?...')` con `cache: 'no-store'`. Fallback: si el cache falla, la ruta hace la query directa. |
| 2. Dashboard | `projects/ciszubot/website/src/lib/auth.ts` | `getGuildsForUser` → `cacheStore.getOrSet('discord:guilds:'+userId, 60s, loader)`; `getBotGuildIds` → `'discord:bot-guilds'` 60s (almacena array, devuelve `Set`). La caché es **por usuario** (nunca global). |
| 3. Rate limit | `projects/ciszubot/discord-bot/src/services/statsServer.ts` | `createRateLimiter({ windowMs: 1h, max: 10 })` por IP en `POST /api/votes` **y** `/api/votes/dbl` (429 + `retryAfterMs`). |
| 4. Contador | mismo statsServer | `bumpCounter('topgg_votes')` / `bumpCounter('dbl_votes')` — INCR atómico persistente en `ciszu.counters` (fallback: memoria si no hay supabase). |

**Conexión BD por app** (cada una crea su propio cliente al schema `ciszu`):

- MuzicMania: `src/lib/supabaseServer.ts` (`supabaseCacheDb`) + `src/lib/cacheStore.ts`.
- CiszuBot web: `src/lib/supabaseAdmin.ts` (factory con schema parametrizado) + `src/lib/cacheStore.ts`.
- Bot: `src/services/cacheService.ts` (cliente schema `ciszu` + `cacheStore` + `bumpCounter`).

## 5. Fase 2 — Vercel KV (ACTIVA — 10 ago 2026)

El código está preparado: si existen `KV_REST_API_URL` / `KV_REST_API_TOKEN` en las env vars de
Vercel (o `.env.local`), la capa KV se intercala entre memoria y Postgres **automáticamente**
(`createVercelKvStore()` en `createCacheStore()`).

### Estado (10 ago 2026): ✅ ACTIVA

- Store **`upstash-kv-ciszunetwork`** (`store_uQn3aF9kaFanqfMc`) conectado a **todos** los
  proyectos Vercel (creado por el usuario desde el dashboard de Vercel → Storage).
- Env vars `KV_REST_API_URL` + `KV_REST_API_TOKEN` presentes en `muzicmania` y `ciszubot`
  con targets `preview,production` (verificado vía API y con `scripts/vercel-kv-setup.js`:
  "ya existe — ok" en los 2).
- Redespliegues hechos (10 ago 2026) con `vercel redeploy` - sin push:
  `https://muzicmania-qak852w9q-ciszunetwork.vercel.app` - alias `muzicmania.vercel.app` 
  `https://ciszubot-b0naagztl-ciszunetwork.vercel.app` - alias `ciszubot.vercel.app`
- **Token API Vercel rotado (10 ago 2026)** por el usuario — `VERCEL_TOKEN` en `.env.local` (raíz)
  y GH secret `VERCEL_TOKEN` actualizado con el mismo valor. **No volver a rotar este token** (ya
  está documentado; solo tiene scope de deploys/env, guardado solo en `.env.local` gitignored).
- Opcional: bot Docker → mismo par en su `.env` (para que el webhook de votos cuente en KV).

### Checklist de activación (referencia histórica)

**Alternativa automatizada (script):** `node scripts/vercel-kv-setup.js` (requiere
`$env:VERCEL_TOKEN="vcp_..."`; flags `--store <nombre>`, `--dry-run`, `--show-values`).
El script busca el store, salta proyectos ya configurados y **replica los valores** del
proyecto que los tenga a los demás (la API no devuelve los secrets de un store recién
creado: la PRIMERA conexión es en el dashboard, el resto la hace el script).

**1. Crear el KV Store**

1. Vercel → proyecto (p.ej. `muzicmania`) → pestaña **Storage** → **Create Database** →
   **KV** → nombre `ciszu-kv` → Create. (Free tier de Upstash, sin tarjeta, ~10k ops/día.)
2. En el panel del store → **Settings** → copiar **`KV_REST_API_URL`** (típico
   `https://…-kv.upstash.io/…)`) y **`KV_REST_API_TOKEN`**.

**2. Añadir las env vars** — Vercel → **Settings → Environment Variables** (Production, y
Development si quieres probar local):

- Proyecto `muzicmania` → `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- Proyecto `ciszubot` (web del dashboard) → iguales
- Opcional: bot Docker → mismo par en su `.env` (para que el webhook de votos cuente también
  en KV)

**3. Redesplegar** — Vercel → Deployments → **Redeploy** del último deploy (botón, sin push).

**4. Verificar que la capa KV entró en juego:**

```sql
select key, updated_at from ciszu.cache order by updated_at desc limit 5;
```

Si hay filas recientes (leaderboard/dashboard), fluye. `statsSnapshot()` de CacheStore
reporta `kv: true` para logs de diagnóstico si se desea.

> Sin esos secrets nada se rompe: memoria + Postgres siguen cubriendo (comportamiento actual).

## 6. Cómo se prueba

```bash
pnpm test   # 18 tests nuevos de packages/utils (memoria, KV, BD mock, rate limit)
pnpm --filter ciszubot typecheck
pnpm --filter muzicmania-website build   # y ciszubot-website
```

## 7. Herramientas / comandos útiles

- Migración aplicada con: `dbvr sql -ds=supabase -in="<archivo>.sql"` (⚠️ PowerShell pipe
  rompe con el watchdog de dbvr; usar `-in`).
- Ver el estado de la caché escrita: `dbvr sql -ds=supabase "select * from ciszu.cache order by updated_at desc limit 20;"`
- Contadores: `select * from ciszu.counters;`

## 8. Estado y próximos pasos

- ✅ Fase 1 (caché en la app / server): leaderboard MuzicMania + dashboard CiszuBot.
- ✅ Fase 2 (KV REST): **ACTIVA desde 10 ago 2026** (store upstash-kv-ciszunetwork + env vars verificadas + redespliegues - ver seccion 5).
- ✅ Fase 3 (tabla Postgres): migración 15 aplicada + verificada.
- ✅ Case 3 (rate limit) + case 4 (contadores votos).
- ❌ Fase 4 (Redis self-host): descartada por el plan (no aporta vs. KV/Postgres).
- ✅ Par KV añadido al `.env` del bot Docker (10 ago 2026) — el webhook de votos también cuenta en KV.