# BACKEND_SYSTEM — Sistema de Backend de los Proyectos (Ciszu Network)

Versión: 1.1.0
Actualización: 2026-08-14
Identificador: BACKEND_SYSTEM_V1.1.0_2026_08_14_ciszunetwork

> **Definición**: sistema que documenta el **backend** (lado servidor: base de datos, APIs,
> auth, storage, autenticación) de los proyectos de Ciszu Network: qué servicios se usan,
> cómo están organizados los esquemas, cómo se protege el acceso (RLS), cómo se consumen
> desde las webs/bot y qué explorar en ORM/frameworks.

---

## 1. Visión general del backend

| Capa | Tecnología | Descripción |
|---|---|---|
| **Base de datos** | PostgreSQL (Supabase) | Almacenamiento relacional |
| **Capa de datos** | Sin ORM — `@supabase/supabase-js` + SQL | Acceso directo a tablas/RPC (ver §18) |
| **API REST** | PostgREST (Supabase) | Acceso a tablas vía HTTP |
| **API serverless** | Next.js API routes | Lógica de las webs (ver §6) |
| **RPC / funciones** | Funciones Postgres | Lógica de BD expuesta |
| **Auth** | Supabase Auth | Usuarios y sesiones |
| **Storage** | Supabase Storage | Assets (CDN `ciszu-cdn`) |
| **Webhooks/IPN** | HTTP callbacks | Pagos NOWPayments, votos bot (top.gg/DBL) |

## 2. Proyectos Supabase

| Aspecto | Valor |
|---|---|
| **Proyecto** | `obwzzmbvkrcscqwptlqo` (ref: `obwzzmbvkrcscqwptlqo.supabase.co`) |
| **Servicio** | PostgreSQL + Auth + Storage |
| **Acceso** | via URL + API keys (anon/service_role) |
| **CDN bucket** | `ciszu-cdn` |

## 3. Esquemas (schemas) de base de datos

| Schema | Uso |
|---|---|
| `ciszubot` | Bot: `bot_status`, votos, guilds, comandos |
| `muzicmania` | Juego: scores, perfiles, skins |
| `ciszu` | Compartido: cache, counters |
| `auth` / `storage` | Gestionados por Supabase |

### 3.1 Tablas principales

| Tabla | Schema | Propósito |
|---|---|---|
| `bot_status` | `ciszubot` | Heartbeat del bot (online, guilds) |
| `scores` | `muzicmania` | Puntuaciones de jugadores |
| `profiles` | `muzicmania` | Perfiles de usuario |
| `cache` | `ciszu` | Caché multi-tienda |
| `counters` | `ciszu` | Contadores (votos, etc.) |

## 4. Seguridad: RLS (Row Level Security)

- **Todas las tablas** habilitan RLS (28/28 tablas, migración 16).
- Cada tabla define **policies por comando** (`SELECT`/`INSERT`/`UPDATE`/`DELETE`).

```sql
ALTER TABLE ciszubot.bot_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bot_status_select_anon"
ON ciszubot.bot_status FOR SELECT
USING (true);
```

- Reglas de RLS en `SECURITY_PROTOCOLS.md` (secciones de RLS).
- Los clientes usan la **anon key** + JWT; el servidor (bots/scripts) usa `service_role`.

## 5. Consumo desde las apps

### 5.1 Desde las webs (Next.js)

```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data } = await supabase.from('ciszubot.bot_status').select('*').single()
```

- En client: usar `anon key` (pública).
- En server components/API: usar `service_role` (secreto) solo server-side.

### 5.2 RPC (funciones)

```ts
const { data } = await supabase.rpc('vote_now', { command_id })
```

- Las funciones RPC encapsulan lógica y aplican seguridad en BD.

### 5.3 Desde el bot (Node)

```js
const supabase = createClient(URL, SERVICE_KEY)
await supabase.from('ciszubot.bot_status').upsert({ ... })
```

## 6. API Routes (Next.js)

Cada web tiene `src/app/api/*` para lógica serverless:

| API | Función |
|---|---|
| `/api/verify-turnstile` | Verificar Turnstile (protegido con rate limit) |
| `/api/votes` | Recibir votos de top.gg/DBL (HMAC) |

- Todas las API mutantes llevan rate limit (ver `SECURITY_PROTOCOLS.md`).

## 7. Auth

- **Supabase Auth** para MuzicMania (usuarios, scores por usuario).
- **Discord OAuth** para dashboard del bot.
- Sessión via JWT; refresh management en el cliente.

## 8. Storage / CDN

- Bucket `ciszu-cdn` sirve assets (imágenes, skins, audio).
- Resolver: `@ciszunetwork/cdn` (`assetResolver`).
- Ver `CDN_SYSTEM.md` y `MEDIA_FORMATS_SYSTEM.md`.

## 9. Backend del bot (CiszuBot)

- El bot Node se conecta a Supabase (heartbeat, comandos).
- No expone BD directamente; usa service key solo en el proceso del bot.
- Panel de dashboard (opcional) usa RPC protegido.

### 9.1 `statsServer.ts` (Express, único uso en el monorepo)

`projects/ciszubot/discord-bot/src/services/statsServer.ts` arranca un servidor HTTP con
**Express ^4.21.2** para el estado en vivo del bot (`:5000`). Rutas:

| Ruta | Método | Función |
|---|---|---|
| `/` (estáticos `discord-bot/public`) | GET | Assets del panel |
| `/api/stats` | GET | Estado del bot (`online`, `guilds`, `users`, `uptime`, etc.) |
| `/api/update-stats` | POST | Actualizar métricas desde el proceso del bot |
| `/api/votes` | POST | Webhook top.gg — recompensa 500 monedas por voto (rate limit) |
| `/api/votes/dbl` | POST | Webhook DiscordBotList — idéntico, auth por `authorization` header |

- **Rate limit** propio para votos (`createRateLimiter`, máx. 10/IP/hora) y auth simple por
  header en `/api/votes/dbl`; top.gg no usa firma aquí (mitigado con rate limit).
- Devuelve el `http.Server` para poder cerrarlo en tests.
- Ver evaluación de reemplazo (Fastify/http nativo) en §19.

## 10. Herramientas de acceso a la BD

| Herramienta | Uso |
|---|---|
| **Supabase Studio** | Consola web (tablas, SQL) |
| **dbvr** | Consola SQL portable para scripts |
| **`apply-migration-*.js`** | Migraciones versionadas |
| **psql** | Cliente de línea de comandos |

## 11. Reglas del backend

| Regla | Descripción |
|---|---|
| **RLS siempre** | Toda tabla nueva: RLS + policies en la misma migración |
| **Policies por comando** | No `FOR ALL`; separar SELECT/INSERT/UPDATE/DELETE |
| **Secrets server-only** | `service_role` nunca en el cliente |
| **Rate limit en mutaciones** | Toda API que escriba: rate limit |
| **Migraciones numeradas** | `apply-migration-NN.js` secuenciales |
| **RPC para lógica** | No exponer tablas crudas si hay reglas de negocio |
| **Verificación externa** | `dbvr` + curl a producción tras cambios |

## 12. Checklist de implementación backend

- [ ] Migración numerada creada (no editar tablas a mano en prod).
- [ ] RLS + policies por comando incluidas.
- [ ] Índices para queries frecuentes.
- [ ] Función RPC `SECURITY INVOKER` + `search_path` fijo.
- [ ] API route con rate limit.
- [ ] Secretos en `.env`, nunca en código.
- [ ] Verificado con `dbvr` / curl.

## 13. Conceptos backend (contexto informático)

| Concepto | Definición |
|---|---|
| **Base de datos relacional** | Datos en tablas con relaciones (claves) |
| **Schema** | Colección de tablas con un espacio de nombres |
| **Tabla** | Estructura de filas/columnas |
| **Fila/Registro** | Una entrada de datos |
| **Query/Consulta** | Petición de datos a la BD |
| **Índice** | Estructura para acelerar consultas |
| **Clave primaria** | Identificador único de fila |
| **FOREIGN KEY** | Relación entre tablas |
| **JOIN** | Combinar datos de dos tablas |
| **View** | Consulta guardada que se puede consultar |
| **Function/RPC** | Lógica ejecutada en la BD |
| **Trigger** | Función lanzada ante un evento |
| **Transaction** | Bloque de operaciones atómicas |
| **Backup** | Copia de seguridad de los datos |
| **Seed** | Datos iniciales |
| **Connection pool** | Reutilización de conexiones |
| **Rate limit** | Límite de peticiones |
| **Idempotencia** | Ejecutar lo mismo produce el mismo resultado |

## 14. API REST vs RPC en Supabase

| Criterio | REST (tablas) | RPC (funciones) |
|---|---|---|
| Uso | CRUD simple | Lógica de negocio |
| Seguridad | RLS por fila | Reglas en la función |
| Complejidad | Baja | Media/alta |
| Ejemplo | `from('scores').select()` | `rpc('get_top_scores')` |
| Cuándo | Listar/insertar simple | Validar + calcular + escribir |

## 15. Respuesta y códigos HTTP

| Código | Significado en Supabase |
|---|---|
| 200 | OK (select/upsert) |
| 201 | Creado (insert) |
| 204 | Sin contenido (delete) |
| 401 | No autenticado (JWT inválido) |
| 403 | RLS/policy denegó el acceso |
| 404 | Recurso/relación no encontrada |
| 422 | Error de validación |
| 500 | Error de servidor |
| 429 | Rate limit superado (api routes propias) |

## 16. Monitoreo y observabilidad del backend

| Fuente | Qué vigilar |
|---|---|
| Supabase dashboard | Logs, uso de BD, REST y Edge Functions |
| dbvr / scripts | Migraciones correctas |
| uptime-watch | Disponibilidad (cron GH Actions → ntfy) |
| Sentry | Errores en las webs (solo código front/edge) |
| PostHog | Eventos de producto (no errores técnicos) |

## 17. Resumen ejecutivo

- Backend = **Supabase** (Postgres + Auth + Storage) con **RLS en todas las tablas**.
- Acceso desde webs/bot vía **supabase-js** con la key adecuada según contexto.
- Lógica compleja en **RPC**; CRUD simple con consultas REST.
- Toda mutación pasa por **rate limit** y verificación server-side.
- Las migraciones se versionan (`apply-migration-NN.js`) y se verifican externamente.

## 18. Capa de datos: ORM — decisión

> Estado: **decidido (14 ago 2026): Drizzle ORM como capa server-side.** El navegador mantiene
> `@supabase/supabase-js` + PostgREST + RLS. Fuente: investigación web ago 2026 + criterio del
> proyecto (RLS obligatorio, serverless/edge, monorepo).

### 18.1 Situación actual

- Las webs y el bot consultan Supabase con `@supabase/supabase-js` (REST/PostgREST + RPC).
- Migraciones SQL versionadas en `services/supabase/migrations/` (ver `DB_SYSTEM.md`).
- No hay capa de tipado de tablas compartida entre proyectos (cada query es string o builder).

### 18.2 Candidatos

| ORM | Veredicto clinic (2026) | Encaje en Ciszu |
|---|---|---|
| **Drizzle** | SQL-native: query builder tipado en TS pegado a SQL puro, sin codegen de binarios, recorre el pool de Supabase respetando RLS y `set local request.jwt.claims`. Estándar de facto en Supabase/Turso/Vercel edge y monorepos. | **Alto (recomendado)**: encaja con RLS de Supabase, cero binarios, ideal serverless/edge y monorepo pnpm. |
| **Prisma 7** | Desde 2025-2026 sin motor Rust por defecto: query engine en TypeScript. Bundle ~1.6 MB, cold starts 40-80 ms, typecheck ~70% más rápido, DX excelente para CRUD + migraciones. | **Medio**: gran DX, pero su modelo de conexión por pool encaja peor con RLS/`auth.uid()` de Supabase y arrastra generación de cliente. |
| **Seguir sin ORM** | Supabase auto-genera tipos SQL en el cliente; para este volumen (<30 tablas) KISS puede bastar. | Medio: cero dependencias, pero sin scheme checking en repos locales. |

### 18.3 Decisión (criterio del proyecto)

- **Adoptar Drizzle ORM** como capa de datos **server-side** (API routes, bot, scripts) para
  tipado de SQL sin binarios. Motivo principal: **RLS de Supabase** — Drizzle, al ser un query
  builder, se ejecuta sobre el pool estándar de Postgres y respeta policies y
  `request.jwt.claims`; Prisma se conecta con su propio pool/cliente y complica el RLS.
- **El navegador NO habla con el ORM**: mantiene `@supabase/supabase-js` + PostgREST + RLS con
  la anon key (seguridad de `SECURITY_PROTOCOLS.md`). Drizzle queda para server components,
  API routes, bot y scripts con la key adecuada según contexto.
- Prisma 7 queda **descartado** para Ciszu: gran DX, pero fricción con RLS/`auth.uid()` y
  generación de cliente que no aporta aquí. "Seguir sin ORM" queda como fallback KISS si un
  proyecto puntual lo justifica (YAGNI — ver `CODE_PRINCIPLES_PROTOCOLS.md`).
- **Implementación pendiente** (TODO): schema centralizado en un package `packages/db/`
  (Drizzle + `pg`), tipados por proyecto, `ORM_SYSTEM.md` con la convención y ampliar
  `DB_SYSTEM.md`.

## 19. Frameworks backend Node.js — decisión

> Estado: **decidido (14 ago 2026)**. Webs: backend en Next.js (sin framework adicional).
> Bot: **NestJS + adaptador Fastify** reemplaza Express en su microservicio HTTP; lo no-Discord
> migra a `ciszubot-website` (Next.js). Investigación web ago 2026 + criterio del proyecto.

### 19.1 Conclusión por capa

| Capa | Necesita framework? | Decisión |
|---|---|---|
| **Webs (API routes)** | No | Next.js serverless cubre rutas, auth, rate limit y middleware. Meter Express/Nest/Fastify **dentro** de Next no aporta y complica el deploy en Vercel. |
| **Bot (statsServer)** | Sí (reemplazo planificado) | `statsServer.ts` (Express ^4) migra a **NestJS + Fastify** como microservicio del bot; lo no-Discord.js pasa a `ciszubot-website` (Next.js). |

### 19.2 Comparativa y veredicto

| Framework | Fortaleza | Veredicto Ciszu |
|---|---|---|
| **Express v5** | Simple, maduro, sin opiniones, ecosistema enorme | Se **migra** en el bot (F2): será reemplazado por NestJS+Fastify y eliminada la dependencia. |
| **Fastify** | Máximo throughput, validación de schemas nativa | **Motor HTTP del bot** vía adaptador de NestJS (NestJS+Fastify = arquitectura modular + velocidad). |
| **NestJS + adaptador Fastify** | Híbrido: DI, módulos, guards, interceptors + velocidad Fastify | **Elegido para el microservicio HTTP del bot** (stats + webhooks). Base futura si el panel crece. |
| **Next.js (ciszubot-website)** | Backend web del proyecto | **Recibe todo lo no-Discord.js** del bot: estado/panel (desde `ciszubot.bot_status`) y webhooks como API routes. |
| **Node `http` nativo** | Cero dependencias | Descartado: más código a mano sin beneficio. |

### 19.3 Decisión y regla futura

- **Webs**: backend en Next.js serverless, sin frameworks adicionales (RSC + Server Actions +
  API routes para webhooks) — correcto para Vercel.
- **Bot**: el proceso Discord.js se mantiene en Docker; su microservicio HTTP migra de Express a
  **NestJS + Fastify** (F2). Todo lo no-Discord.js (panel, estado, webhooks) vive en
  `ciszubot-website` (Next.js), que lee `ciszubot.bot_status` de Supabase y expone webhooks
  como API routes con rate limit + Zod.
- **Regla futura**: NestJS+Fastify queda como capa HTTP de servicios standalone del ecosistema
  si nacen más; el resto del backend sigue en Next.js.
- Actualizar `FULL_STACK_SYSTEM.md` (tabla de stack) cuando se complete F2.

## 20. Herramientas cliente/validación — decisión (todos los proyectos)

> Estado: **decidido (14 ago 2026)**. Evaluación de Zod, tRPC, GraphQL, Storybook, TanStack
> Query y Server Actions. Solo se instala lo que cubre un vacío real; el resto queda
> documentado con disparador futuro. Fuente: investigación ago 2026 + criterio del proyecto.

| Herramienta | Estado | Decisión / motivo |
|---|---|---|
| **Zod** | **Integrado** (`@ciszunetwork/utils` `validation.ts`) | Valida el borde de entrada (reglas de seguridad). Completado en todo API route que mute (`dashboard`, `resolve-username`, `invoice`, `verify-turnstile`). |
| **RSC (React Server Components)** | Ya en uso | Base de lecturas en servidor; sin capa API intermedia. |
| **Server Actions** | **Decidido (14 ago 2026) — YAGNI por ahora** | Evaluado en F3: los formularios actuales (feedback/soporte) son `mailto:` cliente sin servidor y el dashboard ya valida con Zod en su API route. No hay vacío real que requiera `'use server'` hoy. Adoptar sólo en formularios nuevos que reporten a servidor. |
| **Storybook** | **Añadido (F3, dev-only)** en `@ciszu/ui` (v10.5.8, `storybook` + `@storybook/react-vite`) | Documenta los componentes compartidos (Icon, SmartImage) con visual regression. Scripts `storybook`/`build-storybook`. Sin runtime en prod. |
| **Chromatic** | **Añadido (F4, dev-only)** en `@ciszu/ui` (`chromatic` CLI 18.2) | Visual testing de Storybook. Build 1 publicado (14 ago 2026, 5 stories/2 componentes). Token `CHROMATIC_PROJECT_TOKEN` en vault; script `chromatic`. appId `6a7f722e2641a24bc6249782`. |
| **TanStack Query** | **Añadido (F3)** en `ciszubot-website` (`@tanstack/react-query`) | Caché/refetch de datos client dinámicos. `QueryProvider` en el layout; dashboard usa `useQuery`/`useMutation`. Se extiende a las demás webs cuando lo requieran. |
| **tRPC** | **No instalar** | Solapa con RSC + Server Actions; añadir es una tercera capa sobre PostgREST/RPC de Supabase. Tiene disparador: servicio standalone grande consumido por varios clientes. |
| **GraphQL** | **No instalar** | PostgREST ya da selectividad de campos; `pg_graphql` nativo si algún día se necesita. Tiene disparador: API pública para devs/partners o multi-cliente. |

- **Regla**: nada se instala "de base por si acaso" (deuda/superficie). Se instala cuando el
  problema existe; los descartados NO bloquean el futuro (transición limpia si aplican).
- Detalle de investigación de cada herramienta en `FRONTEND_SYSTEM.md` §7.3 y `BACKEND_SYSTEM.md` §19-20.

_Última revisión: 14 ago 2026._ Relacionado: `DB_SYSTEM.md`, `CDN_SYSTEM.md`,
`AUTH_SYSTEM.md`, `SECURITY_PROTOCOLS.md`, `FRAMEWORKS_SYSTEM.md`, `FULL_STACK_SYSTEM.md`.
