# TOOLS_EVALUATION_PLAN — Evaluación de servicios y herramientas candidatas (ago 2026)

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: TOOLS_EVALUATION_PLAN_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: investigación comparativa de 22 servicios/herramientas candidatas a
> infraestructura backend/db, evaluando gratuidad (sin tarjeta), solapamiento con el stack
> actual, compatibilidad y veredicto preliminar. Sin implementación: solo información.

> **Problema**: apareció una lista extensa y diversa de herramientas y es necesario decidir
> cuáles merecen implementarse. Antes de tocar nada hay que saber: ¿son gratis de verdad (sin
> tarjeta)?, ¿duplican algo que ya usamos?, ¿encajan con Next.js 15 + Supabase + bot Docker?,
> ¿están vivas o son humo? Este doc responde eso para cada una de forma comparable, con el
> estado del stack real del monorepo (verificado en código) como referencia.

## Resumen ejecutivo (la respuesta corta)

| Herramienta | Gratis sin tarjeta | Solapamiento con el stack | Veredicto |
|---|---|---|---|
| **Logtail** | Sí (pero ya no existe como marca) | Total (absorbido por Better Stack) | ❌ Descartar — muerto |
| **Better Stack** | ✅ Sí (3 GB logs/mes, 3 días) | Alto (Sentry, PostHog, UptimeRobot, ntfy) | ⚠️ Útil solo para logs; duplica todo lo demás |
| **Datadog** | ❌ No (solo trial 14 días) | Casi total + APM | ❌ Redundante / caro |
| **Turbopack** | ✅ Sí (incluido en Next.js) | Ninguno (es el motor de Next 15/16) | ✅ Usarlo (build) |
| **Rolldown** | ✅ Sí (OSS) | Ninguno (Vite 8 ya lo usa transitivamente) | ⚪ Redundante instalar a mano |
| **SWC** | ✅ Sí (embebido) | Actual (ya dentro de Next) | ⚪ Redundante como dependencia |
| **tku** | No existe | — | ❌ Descartar (no existe como toolchain) |
| **Larvitar** | No existe (es lib DICOM) | — | ❌ Descartar (probable alucinación) |
| **TypeBox** | ✅ Sí (MIT, OSS) | Ninguno (zod ya cubre validación) | ⚠️ Solo si se necesita JSON Schema |
| **ArkType** | ✅ Sí (MIT, OSS) | Ninguno (reemplazaría/coexistiría con zod) | ⚠️ Alternativa técnica; **zod gana hoy** por ecosistema |
| **PocketHost** | ❌ No (free tier eliminado) | Alto (es un Supabase en pequeño) | ❌ Redundante |
| **Coolify** | ✅ Self-host gratis (cloud $5/mes) | Bajo (complementa el VPS del bot) | ⏸️ **Skipped** — se documenta al ejecutar `VPS_PLAN` |
| **Miniflare** | ✅ Sí (npm, MIT) | Nulo (no se usan Cloudflare Workers) | ⚪ Innecesario hoy |
| **Directus** | ✅ Self-host Core $0 (cloud $89+/mes) | Medio (solapa con Supabase + Studio) | ⚠️ Solo si hay editores de contenido |
| **Temporal** | ❌ Cloud sin free tier sin tarjeta; self-host gratis pero operarlo cuesta | Alto (cron/queues ligeros ya existen) | ❌ Sobredimensionado |
| **Effect TS** | ✅ Sí (MIT, OSS) | Ninguno funcionLocal (aporta paradigma nuevo) | ⚠️ Útil solo acotado a módulos complejos |
| **Husky + Lint-Staged** | ✅ Sí (MIT, OSS) | Actual: hook git crudo no versionado | ✅ Útil (versionar hooks + lint en staged) |
| **Changesets** | ✅ Sí (MIT, OSS) | Ninguno (nada se publica a npm) | ⚪ Solo cuando haya publicaciones |
| **Release Please** | ✅ Sí (Apache-2.0, Action gratis) | Ninguno + requiere conventional commits | ⚪ Solo si se versiona + se adopta convención |
| **Auto** | ✅ Sí (MIT) | Ninguno + GitHub-lock-in y semi-abandonado | ❌ Descartar |
| **Nuqs** | ✅ Sí (MIT, OSS) | Parcial: muzicmania ya hace lo mismo a mano | ✅ Útil (estado de URL tipado) |
| **MSW** | ✅ Sí (MIT) | Ya integrado en Storybook (solo falta ampliar) | ✅ Útil extender a tests Vitest |
| **SeaORM** | ✅ Sí (MIT/Apache, OSS) | Alto en concepto (duplicaría a Drizzle) si se usa | ⚪ Solo si Tauri necesita SQL directo |
| **Joy UI** | ✅ Sí (MIT, beta) | Alto (reemplazaría toda la capa UI propia) | ❌ Redundante / demasiado cambio |
| **Radix UI** | ✅ Sí (MIT) | Bajo (complementa: aporta primitives faltantes) | ✅ Útil incremental |

**Consideración clave**: de los 25 candidatos, **solo 6 tienen valor real inmediato** (Turbopack,
Better Stack para logs, Husky+Lint-Staged, Nuqs, MSW-en-testing, Radix UI). Coolify está **skipped** (se activará
con el `VPS_PLAN`). El resto o está muerto/inexistente (Logtail, tku, Larvitar, Auto), o es redundante con lo que  
ya
existe (Datadog, PocketHost, Directus, Joy UI, Temporal), o solo vale cuando cambie una condición
(Changesets/Release Please si se publican paquetes, SeaORM si Tauri toca SQL, Effect/ArkType/TypeBox
según requisitos futuros).

---

## Sección 1. Logging / Observabilidad

### 1.1 Logtail

- **Qué es**: plataforma de gestión de logs basada en ClickHouse con consultas SQL en tiempo real.
- **Estado 2026**: marca **retirada**. Fue absorbida por Better Stack en 2022 y su nombre desapareció
  en 2025. `logtail.com` redirige a `betterstack.com`; los SDK siguen publicándose como `@logtail/*`.
- **Licencia**: clientes open source (ISC/MIT); la plataforma es SaaS propietario.
- **Gratis sin tarjeta**: como marca propia ya no existe; hereda el plan free de Better Stack (ver §1.2).
- **Solapamiento**: total como producto con el resto del stack de observabilidad.
- **Veredicto**: ❌ **Inútil como opción separada**. Elegir "Logtail" hoy = elegir Better Stack.

### 1.2 Better Stack (Logs / Telemetry)

- **Qué es**: suite all-in-one de observabilidad SaaS: logging SQL (ex-Logtail), tracing OTel, métricas,
  error tracking, session replay, uptime, status pages.
- **Licencia**: SaaS propietario; clientes open source.
- **Gratis sin tarjeta**: ✅ **Sí**. Plan free: 3 GB logs/mes retenidos 3 días + 3 GB traces, 30 GB métricas,
  100 000 excepciones/mes, 10 monitores de uptime, 1 status page, equipos ilimitados. Al superar el cupo
  simplemente no entra contenido (sin cobros sorpresa). Subir a pago: desde ~$25/mes.
- **Compatibilidad**: oficial en Next.js/Vercel (⚠️ la integración automática de Vercel exige **Vercel Pro**;
  sin pagar se usa el SDK `@logtail/next`/`@logtail/pino`/`@logtail/bunyan`); Supabase log drain exige plan de
  pago de Supabase; Docker (bot) soportado vía fluentd/GELF o Vector.
- **Solapamiento**: alto. Duplica *de facto* a **Sentry** (error tracking free 100K), **PostHog** (web events),
  **UptimeRobot** (10 monitores) y **ntfy** (alertas). Su único valor añadido neto es el **logging centralizado
  buscable con SQL** — la única carencia real de nuestro stack (hoy no tenemos recolección de logs estructurados).
- **Veredicto**: ⚠️ **Útil pero con duplicación masiva**. Como "logging dedicado" es la vía más barata ($0, sin
  tarjeta) a logs buscables. Como suite intenta reemplazar a todo lo que ya usamos; si se adoptara solo para logs,
  no hay conflicto: Sentry/PostHog/UptimeRobot/ntfy siguen igual.

### 1.3 Datadog

- **Qué es**: la plataforma enterprise de observabilidad (infra, APM, logs, RUM, sintéticos, security).
- **Licencia**: SaaS propietario puro; sin open source.
- **Gratis sin tarjeta**: ❌ **No de forma útil**. Trial de 14 días sin tarjeta (todo el producto). Después, solo
  *Infrastructure Monitoring* gratis: 5 hosts, métricas retenidas **1 día**, **sin logs, sin APM, sin RUM**. Los logs
  son de pago ($0.10/GB ingest + $1.70/M eventos indexados), y el uso del trial puede migrar a facturación.
- **Compatibilidad**: Next 15.3+/Vercel (drains facturados por Vercel), Supabase, Docker (Agent), Node 20.
- **Solapamiento**: casi total con Sentry + PostHog + UptimeRobot + ntfy **y además métricas**. Su diferencial
  (APM profundo, continuous profiling, infra del host) no compensa en 4 webs serverless + un bot Docker.
- **Veredicto**: ❌ **Redundante / económicamente injustificable** para esta escala. Riesgo real de facturación
  inesperada (prima +50% on-demand sobre compromisos).

---

## Sección 2. Bundlers y toolchains nativas

### 2.1 Turbopack

- **Qué es**: bundler incremental en Rust de Vercel, integrado en Next.js.
- **Estado 2026**: **estable y DEFAULT**. Next 16 (oct 2025) lo usa por defecto para dev **y** producción;
  en Next 15 es estable para dev y beta para build (`--turbopack`).
- **Gratis sin tarjeta**: ✅ incluido en Next.js (licencia MIT). No instala nada.
- **Compatibilidad**: bindings nativos para Windows x64/ARM64; Tailwind 4 + PostCSS funcionan sin cambios
  (procesa CSS con Lightning CSS y JS/TS con SWC bajo el capó).
- **Solapamiento**: ninguno — es el motor de build/dev del proyecto.
- **Estado actual en el repo**: sólo `projects/muzicmania/website/next.config.ts` toca la clave `turbopack`
  (root). El resto usa el default de Next 15 (dev con Turbopack, build sin `--turbopack`).
- **Veredicto**: ✅ **Usarlo**. En Next 15 activar `--turbopack` en build (o planificar Next 16 donde es default).
  Cero coste, cero riesgo, beneficio de build.

### 2.2 Rolldown (rolldown-vite, oxc)

- **Qué es**: bundler en Rust con API compatible con Rollup; de VoidZero (Evan You). Es el motor de Vite 8+,
  y acarrea el parser Oxc.
- **Estado 2026**: estable (`rolldown` 1.2.x, bindings Windows x64/arm64, Node ^20.19||>=22.12). Vite 8 ya
  buildea con Rolldown de forma nativa. **Next.js NO usa Rolldown** y no hay evidencia de que lo vaya a usar
  (Vercel va con Turbopack; se trata de ecosistemas paralelos).
- **Gratis sin tarjeta**: ✅ OSS (MIT/Apache dual).
- **Solapamiento**: en este repo Vite solo aparece para Storybook de `@ciszu/ui` (que ya tira de rolldown/oxc
  transitivamente via Vite 7). Instalarlo de mano en las webs **no afecta al build de Next**.
- **Veredicto**: ⚪ **Redundante como dependencia directa**. Solo tendría sentido si buildeamos librerías con
  Vite/tsdown (entonces ya viene gratis).

### 2.3 SWC (Speedy Web Compiler)

- **Qué es**: compilador/transpilador/minificador en Rust, **embebido por defecto en Next.js** desde Next 12.
- **Estado actual en el repo**: `@swc/core` está en el lockfile solo como transitiva de Next/ESLint. Ninguna web
  lo declara.
- **Gratis sin tarjeta**: ✅ OSS.
- **Solapamiento**: total — es el que ya usa Next para compilar y minificar en ambos modos (webpack y Turbopack).
- **Veredicto**: ⚪ **Redundante instalar aparte**. Añadir `@swc/core`/`@swc/cli` no cambia el build de Next; solo
  valdría para transpilar scripts o paquetes fuera de Next.

### 2.4 tku

- **Qué es**: no existe como bundler/toolchain.
- **Evidencia**: en npm lo más cercano es `@kt3k/tku` (contador de tokens con tiktoken) y en GitHub
  `franzos/tku` (toolkit de costes para agentes de IA). Ninguno es un compilador.
- **Diagnóstico**: ❌ **Descartar**. Posible typo/alucinación de tsup, tsdown o turbo (no confirmable con fuentes).

### 2.5 Larvitar

- **Qué es**: no existe como toolchain.
- **Evidencia**: en npm hay una biblioteca DICOM de imagen médica llamada `larvitar` (dvisionlab). Nada de compilación.
- **Diagnóstico**: ❌ **Descartar**. Probable alucinación o nombre de Pokemon → biblioteca de imagen médica, sin
  relación con el build.

---

## Sección 3. Validación de schemas runtime

### 3.1 Contexto actual

- El proyecto **ya usa zod** (`^4.4.3`) en ciszubot website (API dashboard), muzicmania website (resolve-username)
  y packages/utils. `ciszukoantony` y packages db/ui/email/payments/cdn no tienen librería de validación.
- No hay tRPC, Fastify ni Hono en el stack.

### 3.2 TypeBox

- **Qué es**: constructor de tipos JSON Schema con resolución estática (los schemas SON JSON Schema reales).
- **Licencia**: MIT. **Gratis**: ✅ OSS puro, sin SaaS.
- **Compatibilidad**: split de versiones en 2026 — `1.x` necesita **TS 6+** y es solo ESM; `0.x` (LTS) soporta
  TS 5.0–6.0. Node 20 OK; edge/Workers OK (fallback dinámico cuando no hay JIT).
- **Rendimiento**: ~7x más rápido que zod v4 compilado (en benchmarks 2026); por debajo de ArkType.
- **Solapamiento**: sería la única lib de validación si se adoptara (reemplaza el rol de zod en los puntos que ya
  valida, además de cubrir los packages sin validación).
- **Veredicto**: ⚠️ **Redundante para Next.js 15 puro sin tRPC**. Solo recomendable si aparece la necesidad de
  **JSON Schema nativo** (OpenAPI, ai tool calling, validación compartida con SQL/Supabase). No transforma valores
  y su sintaxis es más verbosa que zod.

### 3.3 ArkType

- **Qué es**: validador "1:1 de TypeScript": escribes sintaxis de tipos TS como strings y compila validadores.
- **Licencia**: MIT, financiado via sponsors. **Gratis**: ✅ OSS.
- **Compatibilidad**: TS >=5.1 (+ `strict`), Node 20, edge/Workers OK (bundle ~20 KB gzip, el mayor del grupo).
- **Rendimiento**: el más rápido de la categoría (~15–20x zod v4; 12ms vs 25ms TypeBox vs 180ms zod v4 en un
  benchmark de 100k objetos).
- **Integraciones**: co-autor de **Standard Schema** (interop con tRPC/Hono/RHF/TanStack), hay `drizzle-arktype`
  (genera tipos desde tablas Drizzle — encaja con `@ciszunetwork/db`), `toJsonSchema()`.
- **Solapamiento**: reemplazaría el rol de zod (migración) y cubriría el resto de packages sin validación.
- **Veredicto (revisado, ago 2026)**: ⚠️ **Alternativa superior técnicamente pero NO recomendada de migrar hoy**.
  **Zod gana por goleada por razones prácticas**: ecosistema estándar (~15-20M descargas/sem vs ~433K), conectores
  de primera clase (RHF, tRPC, Drizzle), y bundle menor (~14KB vs ~20KB gzip de ArkType). La ventaja de velocidad
  (~15x en benchmarks) es imperceptible en producción — validar un POST no es el cuello de botella de ninguna web.
  `drizzle-arktype` **no reemplaza a ArkType** (es un puente que genera schemas desde tablas Drizzle; ArkType sigue
  siendo la lib de validación). Ambas implementan **Standard Schema**, por lo que pueden coexistir en un monorepo
  (un módulo con zod y otro con ArkType) sin puentes, pero NO se mezclan dentro del mismo módulo. Regla práctica:
  1 librería de validación por módulo. ArkType queda para **re-evaluar solo si** en el futuro importa rendimiento
  extremo o fidelidad 1:1 de tipos en APIs críticas.

---

## Sección 4. Hosting / infraestructura / PaaS

### 4.1 PocketHost (hosting de PocketBase)

- **Qué es**: PaaS multitenant que aloja instancias de PocketBase (backend Go en un binario: SQLite + Auth +
  Storage + Realtime + Admin).
- **Gratis sin tarjeta**: ❌ **No**. Hasta ~2024 hubo free tier "super generoso"; en 2025-2026 el free tier
  **desapareció** y pasó a pago: $9.99/mes por slot (o $59.99/año, $149.99 lifetime), solo 7 días de prueba con tarjeta.
- **Solapamiento**: **alto** — PocketBase cubre DB+Auth+Storage+Realtime, exactamente lo que ya da **Supabase**.
  Sería un backend paralelo entero. Además sin Postgres/RLS (requisito de `SECURITY_PROTOCOLS.md`).
- **Veredicto**: ❌ **Redundante**. Retroceso frente a Supabase con coste mensual.

### 4.2 Coolify

- **Qué es**: PaaS **self-hosted** open source para desplegar apps/DBs/servicios Docker en tu propio servidor
  (Apache 2.0). "Self-hosting con superpoderes".
- **Gratis sin tarjeta**: ✅ **Sí, self-hosted** (100% gratis forever, sin límites por feature). El **Cloud**
  (app.coolify.io) **no es gratis**: $5/mes base + $3/mes por servidor, y además traes tus propios servidores.
- **Compatibilidad**: solo corre en **Linux** (VPS/RPi), no en Windows nativo (Docker Desktop no vale; WSL2 posible
  pero no oficial).
- **Solapamiento**: **bajo** — orquestador complementario. No reemplaza a Vercel (aunque puede) ni a Supabase;
  sería la capa que convierte el **VPS del bot** (ver `VPS_PLAN.md`) en un mini-Heroku: gestionar el contenedor
  Docker del bot, utilidades y DBs secundarias con deploys desde git y SSL automático.
- **Veredicto**: ✅ **Útil (condicional)**. Encaja con el roadmap del VPS. Coste real = el VPS (desde ~$4-6/mes).
- **Estado**: ⏸️ **SKIPPED por hoy**. No se implementa hasta **ejecutar `VPS_PLAN`** (al desplegar el bot en Docker
  en el VPS). Cuando ocurra, se documentará en `VPS_PLAN.md` como la capa de orquestación del servidor (deploy del
  contenedor `ciszu-bot`, SSL automático, backups S3, utilidades y DBs secundarias). Hasta entonces queda fuera del
  roadmap activo de infraestructura.

### 4.3 Miniflare

- **Qué es**: simulador local de Cloudflare Workers que corre el runtime `workerd` en Node.
- **Gratis sin tarjeta**: ✅ librería npm MIT, sin cuenta.
- **Compatibilidad**: corre en Windows sin Docker (Node >=22, bindings `workerd` win32-x64).
- **Solapamiento**: **nulo** en este stack — no usamos Cloudflare Workers. `wrangler dev` ya lo usa internamente.
- **Veredicto**: ⚪ **Innecesario hoy**. Solo sería útil como entorno de testing si algún día se escribe una
  función edge compatible con Workers. Sin caso de uso actual.

### 4.4 Directus

- **Qué es**: headless CMS / data platform: un Studio admin + API REST/GraphQL + automatizaciones (Flows) **encima
  de una BD SQL existente**.
- **Licencia 2026**: cambió a **MSCL-1.0-GPL** (source-available, no OSI; auto-conversión a GPL-3.0 a los 4 años).
- **Gratis sin tarjeta**: ✅ **Self-hosted Core $0** (límites de software: 3 seats, 25 collections, 5 Flows,
  community support). ❌ **Cloud de pago** ($89-99/mes; el antiguo Community Cloud gratuito fue descontinuado).
- **Compatibilidad**: self-host en Docker (Linux/VPS); puede apuntar al **Postgres de Supabase** ya existente.
- **Solapamiento**: **parcial pero de plano distinto**. Supabase = backend (DB+Auth+RLS+Storage). Directus = capa
  de gestión/contenido encima de una BD. Como el panel de edición ya lo da **Supabase Studio**, Directus solo
  aportaría cuando haya **editores de contenido no técnicos / flujo editorial**.
- **Veredicto**: ⚠️ **Redundante salvo caso CMS real** (panel editorial sobre el Postgres actual). Si no hay
  editores, no aporta infraestructura y añade un servicio a operar.

---

## Sección 5. Orquestación / workflows / programación funcional

### 5.1 Temporal

- **Qué es**: plataforma de "durable execution": workflows y activities como código con retries, timers, estado
  y resumen tras fallos.
- **Licencia**: server + SDK MIT (open source). **Temporal Cloud** propietario.
- **Gratis sin tarjeta**: ❌ **Cloud sin free tier**: tarjeta obligatoria para darse de alta (solo dan ~$1.000 de
  crédito que expira a los 90 días; Essentials desde **$100/mes**). **Self-hosted gratis** en software pero operarlo
  cuesta (~$480-790/mes en AWS realista; dev server local sin límites).
- **Compatibilidad**: Node 20/22/24, CLI nativo Windows, dev server en Windows o Docker. ⚠️ **Los Workers NO corren
  en Vercel/serverless** (exige un proceso persistente: EC2, DO, Render...). El bot Discord YA es un proceso
  persistente, pero añadir Temporal implica un servidor extra o $100/mes.
- **Solapamiento**: cubre el espacio de cron/queues que hoy resuelven sustitutos ligeros ya disponibles
  (Vercel Cron y **Vercel Workflow** en GA desde abr 2026, Inngest, Trigger.dev, BullMQ). Para cron simple del bot
  y las webs es sobredimensionado.
- **Veredicto**: ❌ **Sobredimensionado** para este ecosistema. Solo tendría sentido con workflows de larga duración
  multi-paso con estado que deba sobrevivir a crashes (onboarding, sagas de pago) — requisito que hoy no existe.

### 5.2 Effect TS

- **Qué es**: librería/ecosistema "effect system" para TS (paradigma ZIO/Haskell): `Effect<Success, Error,
  Reqs>` con errores tipados, DI por Layers, concurrencia estructurada, scheduling y OpenTelemetry built-in.
- **Licencia**: MIT. **Gratis**: ✅ solo librería, coste $0.
- **Compatibilidad**: Node 20 OK (algunos integradores `@effect/sql-*` piden 22.16+), Windows OK, Next/Vercel
  compatible (~15 KB gzip tree-shakeado). v3 estable; **v4 en RC/beta 2026**; exige TS>=5.9.
- **Solapamiento**: no sustituye a cron/colas; cambia cómo se estructura el código (retry-libs, DI, validación
  via Effect Schema, streams). En el reposo el código es imperativo (async/await + try/catch, NestJS en el bot).
- **Veredicto**: ⚠️ **Útil solo como apuesta acotada** a módulos concretos (error handling complejo con reintentos),
  **sobredimensionado como estándar global**. Curva de aprendizaje de semanas, bus-factor real (único dev),
  riesgo de churn con v4. No hay deuda técnica hoy que lo exija.

---

## Sección 6. Calidad de vida / DX / git

### 6.1 Husky + Lint-Staged

- **Qué es**: Husky gestiona git hooks "nativos" versionados en el repo; Lint-Staged ejecuta lint/format solo sobre
  archivos staged.
- **Licencia/precio**: MIT, gratis, sin tier de pago. Versiones 2026: **Husky 9.1.7**, **Lint-Staged 17.3.0**.
- **Compatibilidad**: pnpm OK (`prepare` script auto-instala), **Windows OK** (usa `core.hooksPath` + git-bash,
  sin el problema de PATH de Husky 4). Lint-Staged resuelve `.bin` por paquete → ideal para monorepo.
- **Solapamiento / estado actual**: el repo **no usa husky ni lint-staged**. El pre-commit real es un **script
  crudo en `.git/hooks/pre-commit` NO versionado**, con rutas de usuario hardcodeadas
  (`C:/Users/fplay/AppData/.../secretlint`, gitleaks.exe). En CI solo hay gitleaks de diff, sin secretlint.
- **Aporta**: (a) hooks **versionados** y auto-instalables en cualquier clon (`pnpm install`); (b) portar la lógica
  actual de secretlint+gitleaks a `.husky/pre-commit`; (c) opcionalmente lint/format/tsc sobre staged.
- **Precaución de migración**: Husky setea `core.hooksPath` → el `.git/hooks/pre-commit` actual quedaría huérfano;
  hay que portar la lógica (bsiclo: reescribir rutas a secretlint/gitleaks o usar comandos con PATH global).
- **Veredicto**: ✅ **Útil**. Corrige una debilidad real: el hook de seguridad actual es local y no se replica.
  No es crítico (hoy funciona), pero es la mejora DX más sólida de la sección.

### 6.2 Changesets

- **Qué es**: gestión de versionado/changelogs para monorepos via archivos `.changeset` por cambio.
- **Licencia/precio**: MIT, gratis. Versión 2026: **`@changesets/cli` 3.0.0** (major este año), Node ^22.11||^24||>=26.
- **Compatibilidad**: ✅ soporta **pnpm >=10** oficialmente; Windows OK.
- **Solapamiento / estado actual**: `packages/*` son todos `private: true`, versión 1.0.0, `workspace:*`, y **nada
  se publica a npm**. No existe `.changeset/`.
- **Veredicto**: ⚪ **Inútil hoy, necesaria cuando se publiquen paquetes** (`@ciszu/ui`, `@ciszunetwork/utils`, etc.).
  De las opciones de versionado, es la que mejor encaja con workspaces pnpm y la única que no exige conventional commits.

### 6.3 Release Please

- **Qué es**: automatiza releases generando PRs de versión/changelog desde commits convencionales (Google).
- **Licencia/precio**: Apache-2.0, Action oficial gratis. Requiere token GitHub `contents: write`.
- **Bloqueo**: depende de **conventional commits** (`feat:`, `fix:`) — el repo **usa commits en español descriptivos
  sin convención** y no hay commitlint. Sin convención, haría bumps `patch` genéricos.
- **Veredicto**: ⚪ **Solo si se versiona y se adopta conventional commits primero**. Hoy inútil.

### 6.4 Auto (+ semantic-release)

- **Qué es**: CLI de release basada en **labels de PR** de GitHub (Intuit); semantic-release usa conventional commits.
- **Estado**: `auto 11.3.6` mantenimiento **lento** (último publish nov 2025) y GitHub-lock-in. `semantic-release`
  25.x es single-package orientado, **malo para monorepo**.
- **Veredicto**: ❌ **Ambos descartables**. Auto semi-abandonado; semantic-release inadecuado para el monorepo
  (cada paquete = run independiente; multiSemanticRelease comunitario e inestable).

### 6.5 Nuqs

- **Qué es**: state manager **type-safe de search params** de React ("useState pero en la URL").
- **Licencia/precio**: MIT, gratis. Versión 2026: **2.9.5** (la reescritura multiplataforma "v3" aterrizó como v2.9.x).
- **Compatibilidad**: Next >=14.2, React 18.2/19, pnpm/Windows OK, ~4.5-6 KB, util `nuqs/testing`.
- **Solapamiento / estado actual**: no está instalado, pero **muzicmania ya implementa a mano exactamente este
  patrón**: `useSearchParams` + `searchParams.get('track')` (play/page.tsx, library/page.tsx, Navbar.tsx) y
  construcción manual de `URLSearchParams`.
- **Veredicto**: ✅ **Útil**. El gap ya está probado en código real; bajo coste, tipado, `useQueryStates` para
  multi-params y tests incluidos. Es la única "feature DX" de la lista sin infraestructura detrás.

### 6.6 Mock Service Worker (MSW)

- **Qué es**: mockeo de APIs a nivel de red en browser (Service Worker) y Node (`setupServer`).
- **Licencia/precio**: MIT, gratis. Versión 2026: **2.15.0** (v1 EOL); `msw-storybook-addon 3.0.0`.
- **Estado actual en el repo**: **ya integrado en `@ciszu/ui`** (devDeps `msw ^2.15.0` + addon ^3.0.0; `mswLoader()`
  en `.storybook/preview.ts`, worker en `.storybook/public`). **Pero**: no hay ningún `handlers/mocks` definido
  (cableado vacío), y los tests Vitest raíz no usan `msw/node`.
- **Valor añadido**: (a) `setupServer` (`msw/node`) en tests unitarios/integración Vitest reutilizando handlers de
  Storybook (sustituye `vi.mock(fetch)` ad-hoc); (b) mock browser en dev de las webs. Limitación Next 15: MSW browser
  solo intercepta **cliente**; el `fetch` de Server Components/route handlers no pasa por MSW.
- **Veredicto**: ✅ **Útil extender** (bajo esfuerzo, simetría de handlers entre Storybook y Vitest). El coste ya
  está pagado; solo falta definir handlers y usarlo en tests.

---

## Sección 7. ORM Rust (SeaQL / SeaORM) — contexto Tauri

### 7.1 SeaORM

- **Qué es**: ORM relacional asíncrono de Rust ("el Active Record de Rust"), sobre sqlx; backend-generic
  (Postgres/MySQL/SQLite). De SeaQL.
- **Licencia/precio**: **MIT OR Apache-2.0**, coste 0. No existe servicio cloud de SeaQL; `SeaORM Pro` (panel admin)
  es gratuito; `SeaORM X` (solo SQL Server) es comercial y no aplica.
- **Compatibilidad**: edition 2024, **MSRV Rust 1.94** (toolchain reciente; el PC tiene rustc 1.96.1 ✅). Windows ✅
  (recommendado `runtime-tokio-rustls`, sin OpenSSL/libpq). Supabase Postgres ✅ (sqlx-postgres, pgvector). **Tauri ✅**:
  async puro tokio corre directo en `#[tauri::command]`, sin `spawn_blocking`.
- **Solapamiento / contexto**: toda la capa de datos es **TS con Drizzle** (`packages/db`, server-only). Rust solo
  vive en MuzicMania (Tauri). Meter SeaORM implicaría **doble definición de esquema** (drift Drizzle↔SeaORM), dos
  toolchains y, si se conecta desde el desktop, **credenciales de BD en el binario** (choca con `SECURITY_PROTOCOLS`:
  RLS pensado para Supabase, no para un binario con service_role).
- **Alternativas Rust**: `sqlx` crudo (más ligero), `Diesel` (síncrono, mala opción en Tauri async y con deps nativas
  en Windows), `rusqlite`/`sea-orm-sync` (solo datos locales offline del juego).
- **Veredicto**: ⚪ **Solo si la app Tauri necesita SQL directo a Supabase Postgres o capa de datos local**. Para el
  caso actual (scores servidos por la web + RLS), **no** introducir: la vía correcta es el API Next.js existente.
  Si MuzicMania necesitara datos locales, `sqlx-sqlite`/`rusqlite` cubrirían sin tocar Postgres.

---

## Sección 8. UI components

### 8.1 Joy UI (MUI)

- **Qué es**: biblioteca estilizada de MUI con su propio "Joy Design", base **Emotion (CSS-in-JS)**.
- **Licencia/precio**: MIT, gratuita (los productos de pago de MUI son MUI X y Toolpad). ⚠️ **Sigue en beta**
  (`5.0.0-beta.51`) y las docs de 2026 dicen que su desarrollo está **"on hold"** — recomiendan Material UI.
- **Compatibilidad**: React 19 sí (desde beta.51). **Tailwind 4**: conflicto real de especificidad
  (Emotion style tags vs utilidades Tailwind); exige configuración de capas.
- **Solapamiento**: reemplazaría toda la capa estilizada propia de `@ciszu/ui` (Button, RichText...) y duplicaría el
  motor CSS (Tailwind + Emotion), cambiando el flujo de tokens por utilidades a un theme JS.
- **Veredicto**: ❌ **Redundante / demasiado cambio**. Beta con desarrollo en pausa + segundo motor CSS + reescritura
  del sistema actual para ganancia marginal.

### 8.2 Radix UI Primitives (`@radix-ui/react-*` / `radix-ui`)

- **Qué es**: primitives **headless, accesibles y sin estilos** (comportamiento + ARIA + foco + teclado), de WorkOS.
- **Licencia/precio**: MIT, gratis (Radix vende Themes aparte, pero Primitives es 100% OSS).
- **Compatibilidad**: React 19 ✅ (compatibilidad total desde 6/2024; **fijar versiones recientes de 2026** tras bugs
  de bucle de re-render por `Slot`/`compose-refs` con React 19.2). **Tailwind 4: encaje perfecto** (es la base de
  shadcn/ui; se estilan con clases y `data-[state=...]`, conservando tokens).
- **Solapamiento**: **complementa**, no reemplaza. `@ciszu/ui` no tiene primitives interactivos accesibles (no hay
  Dialog, Select, Menu, Tooltip, Tabs, Accordion propios). Radix aporta esa capa sin estilar → se envuelve con las
  clases Tailwind actuales (mismo patrón del Button existente). a11y WCAG 2.1 AA gratis; `@storybook/addon-a11y` ya
  sigue validando. Esfuerzo bajo por pieza, adopción incremental.
- **Veredicto**: ✅ **Útil (incremental)**. La opción coherente con Tailwind 4 y el sistema actual, sin tocar lo que
  ya funciona. Vigilar: versiones recientes y ~40 KB + dependencias transitivas según piezas.

---

## Sección 9. Decisiones y comparaciones resueltas

### 9.1 Logging: Logtail vs Better Stack vs Datadog vs pino self-host

- **Opción ganadora**: **Better Stack** (≡ Logtail) solo para logs, en plan free. Datadog queda fuera por coste
  (logs no libres fuera del trial). pino solo emite; el gestor mejor gestionado que auto-held (Loki/Grafana) en un
  stack serverless sin servidor que mantener.

### 9.2 Toolchain nativa: Turbopack vs Rolldown vs SWC

- **Ganador**: Turbopack (default de Next). Rolldown/SWC ya están transitivamente/Vía Vite y embebido → no se
  instalan. tku y Larvitar no existen.

### 9.3 Validación: zod vs TypeBox vs ArkType

- **Veredicto (revisado)**: **zod gana y se mantiene.** Es el estándar (~15-20M descargas/sem), con conectores de
  primera clase (RHF, tRPC, Drizzle), bundle menor (~14KB vs ~20KB de ArkType) y ya está en el repo (`^4.4.3`). La
  ventaja de velocidad de ArkType (~15x) es imperceptible en producción. `drizzle-arktype` NO reemplaza a ArkType:
  es un puente que genera schemas desde las tablas Drizzle. Ambas usan Standard Schema → pueden coexistir en el
  monorepo pero **no se mezclan en el mismo módulo** (1 lib de validación por módulo). ArkType/TypeBox quedan para
  re-evaluar solo si en el futuro importa JSON Schema nativo (OpenAPI/AI tools → TypeBox) o rendimiento/fidelidad
  1:1 extremos (ArkType). Decisión de política, no deuda técnica.

### 9.4 Hosting/infra: PocketHost vs Coolify vs Miniflare vs Directus

- **Ganador**: Coolify **self-hosted sobre el VPS** ⏸️ (skipped: se detalla en `VPS_PLAN` al desplegar el bot en
  Docker; no se implementa hoy). PocketHost descartado (pega con Supabase, sin free tier). Miniflare sin caso de
  uso de momento. Directus solo con editores de contenido. Miniflare/Directus quedan como 📦 únicamente si
  aparece el requisito.

### 9.5 Workflows: Temporal vs Effect vs sustitutos ligeros

- **Ganador**: ninguno hoy. Cron/Workflow de Vercel, Inngest, Trigger.dev o BullMQ cubren si aparece un requisito
  real; volver a evaluar solo ante workflows durables multi-paso (Temporal) o módulos complejos (Effect acotado).

### 9.6 Versionado: Changesets vs Release Please vs Auto vs semantic-release

- **Ganador (cuando toque)**: **Changesets** (fit pnpm, no exige conventional commits, changelogs por paquete).
  Release Please en segundo plano (requiere convención previa). Auto: descartar. Semantic-release: descartar para monorepo.

### 9.7 UI: Joy UI vs Radix vs seguir con lo propio

- **Ganador**: seguir con la librería propia + **Radix Primitives** bajo demanda para piezas interactivas.
  Joy UI descartado.

---

## Sección 10. Qué hacer con cada candidato (mapa de acción)

### 10.1 Tabla final (12 herramientas activas, otra 2026-08-14)

Estado resueltos: ArkType retirado del cuadro (zod gana por ecosistema, ver §3.3/§9.3) y Coolify **skipped**
(⏸️ solo al ejecutar `VPS_PLAN`, ver §4.2) — ambos documentados, no descartados.

| # | Herramienta | Veredicto | Por qué usarlo | Posibles descartes / errores | Preparación |
|---|---|---|---|---|---|
| 1 | Husky | ✅ Usar | Versionar hooks; hoy el pre-commit es local sin versionar | Migrar lógica a `.husky/` (core.hooksPath) | Instalar ya |
| 2 | Lint-Staged | ✅ Usar | Lint/tsc solo sobre staged en pre-commit | Requiere Husky | Instalar con Husky |
| 3 | Nuqs | ✅ Usar | Search params tipados; muzicmania ya lo hace a mano | Ninguno relevante | Instalar en páginas con estado de URL |
| 4 | Radix UI | ✅ Usar | Primitives accesibles bajo demanda, tokens intactos | Fijar versiones recientes (bugs React 19.2) | Adoptar por pieza nueva |
| 5 | Better Stack | ⚠️ Condicional | Logs SQL buscables, free sin tarjeta | Duplica Sentry/PostHog/Uptime/ntfy; Vercel Pro | Preparar emisión de logs (pino/bunyan) |
| 6 | TypeBox | ⚠️ Condicional | JSON Schema nativo (OpenAPI/AI tools) | Verboso, sin transforms, 1.x pide TS6+ | Preparar al generar OpenAPI/schemas |
| 7 | Miniflare | ⚠️ Condicional | Simular Workers localmente (runtime workerd) | Requiere Node>=22 | Preparar workers (wrangler/edge) |
| 8 | Effect TS | ⚠️ Condicional | Errores tipados + retry en módulos complejos | Curva alta, bus-factor, v4 en transición | Preparar módulos con reintentos complejos |
| 9 | Changesets | ⚠️ Condicional | Versionado/changelog pnpm al publicar | Todo private hoy | Preparar config al primer publish |
| 10 | Release Please | ⚠️ Condicional | PRs de versión automáticos | Requiere conventional commits | Preparar convención de commits |
| 11 | SeaORM | ⚠️ Condicional | Tauri con SQL directo/local | Doble esquema Drizzle+Rust; credenciales en binario | Preparar capa de datos local Tauri (sqlx/rusqlite) |
| 12 | Directus | ⚠️ Condicional | Panel editorial sobre Postgres de Supabase | Solapa con Studio; licencia no OSI | Preparar stack de contenido si hay editores |

### 10.2 Resumen por categoría de acción

| Acción | Herramientas |
|---|---|
| ✅ **Adoptar ya (cero coste)** | Turbopack (`--turbopack` build/planificar Next 16) · MSW en tests Vitest (`msw/node` + handlers compartidos) · Husky + Lint-Staged (versionar hooks de secretlint/gitleaks) |
| ✅ **Adoptar cuando haya requisito** | Nuqs (donde haya estado de URL) · Radix UI (primitives interactivas nuevas) · Better Stack logs (si falta trazabilidad de logs) · Changesets (publicar paquetes) |
| ⏸️ **Skipped por hoy** | **Coolify** (solo al ejecutar `VPS_PLAN`) |
| ⚠️ **Bajo demanda / condicional** | ArkType o TypeBox (política de validación — hoy **zod gana** por ecosistema, ver §3.2/§3.3) · Effect TS (módulo complejo) · Directus (editores de contenido) · SeaORM (Tauri con SQL local/directo) · Miniflare (si se usan Workers) · Release Please (si se adopta conventional commits) |
| ⚪ **Innecesario hoy** | Rolldown, SWC |
| ❌ **Descartar** | Logtail, Datadog, tku, Larvitar, PocketHost, Temporal, Auto, Joy UI |

---

## Sección 11. Referencias cruzadas

- Stack y testing actual: `FULL_STACK_SYSTEM.md`, `FRONTEND_SYSTEM.md`, `TESTING_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md`.
- Observabilidad actual: `MONITORING_SYSTEM.md`, `ERRORS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`, `ONLINE_SERVICES_SYSTEM.md`.
- Datos y ORM: `DB_SYSTEM.md`, `ORM_SYSTEM.md`, `PACKAGES_SYSTEM.md`.
- Seguridad y RLS: `SECURITY_PROTOCOLS.md`.
- Hosting del bot: `DOCKER_SYSTEM.md`, `VPS_PLAN.md`.
- Tooling y operación: `TOOLS_SYSTEM.md`, `WORKFLOW_SYSTEM.md`.
- Viabilidad comercial (por qué no contratar clouds de pago aún): `BUSINESS_SYSTEM.md`, `TAX_PLAN.md`, `PAYMENTS_SYSTEM.md`.

_Última revisión: 14 ago 2026._ Relacionado: `FULL_STACK_SYSTEM.md`, `TESTING_SYSTEM.md`, `MONITORING_SYSTEM.md`, `VPS_PLAN.md`, `UI_COMPONENTS_SYSTEM.md`.