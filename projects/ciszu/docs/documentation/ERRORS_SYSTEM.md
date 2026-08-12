# ERRORS_SYSTEM — Manejo de errores con Sentry

**Estado (11 ago 2026)**: ✅ **ACTIVADO** — cuenta creada (org `ciszu-network`), 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot), DSNs en `.env.local` ×4 + vault + Vercel ×4, source maps activos, **todas las características encendidas**: errores + **tracing 100%** + **replays** (10% sesiones / 100% en error) + **widget de feedback** en las webs + bot con traces 10%.

## 0. Estado de la integración (11 ago 2026)

| ítem | Estado |
| --- | --- |
| Organización `ciszu-network` | ✅ creada (id `4511894887989248`) |
| 5 proyectos Sentry | ✅ `ciszunetwork`, `ciszukoantony`, `muzicmania`, `ciszubot`, `ciszubot-bot` (team `ciszu-network`) |
| DSNs en `.env.local` ×4 | ✅ `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` |
| DSN bot | ✅ `projects/ciszubot/discord-bot/.env` → `SENTRY_DSN` |
| Vault `services/supabase/.env` | ✅ `SENTRY_ORG`, `SENTRY_ORG_TOKEN`, `SENTRY_PERSONAL_TOKEN`, `SENTRY_DSN_*` (cifrado con age) |
| Vercel ×4 | ✅ `SENTRY_DSN`+`NEXT_PUBLIC_SENTRY_DSN` (production+preview+development) + `SENTRY_AUTH_TOKEN` (solo production) |
| Source maps | ✅ habilitados (`sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN }`) — se suben en los builds de Vercel production |
| SDK configs | ✅ client: tracing 1.0 + replays (0.1 / onerror 1.0) + `feedbackIntegration` (widget "Reportar un problema"); server/edge: tracing 1.0; bot: tracing 0.1 |
| Builds | ✅ 5/5 OK (4 webs + bot) con todo activo |

**Tokens** (solo en vault cifrado, nunca en git): `SENTRY_ORG_TOKEN` (`sntrys_…`, se usa como `SENTRY_AUTH_TOKEN` en Vercel) y `SENTRY_PERSONAL_TOKEN` (`sntryu_…`, gestión vía API `/api/0/`).

**Para verificar en vivo**: forzar un error (`Sentry.captureException`) en una ruta de prueba → debe aparecer en `sentry.io/organizations/ciszu-network/`. Source maps cargados → stack traces legibles.

## 1. Decisión: ¿por qué Sentry?

Comparación verificada (ago 2026), priorizando **free sin tarjeta** (regla de financiación de Ciszu Network):

| Herramienta | Free tier (verificado ago 2026) | Retención | Notas |
| --- | --- | --- | --- |
| **Sentry** ✅ | Developer: 5.000 errores + 10.000 transacciones + 50 replays/mes, 1 usuario | 30 días | SDK Next.js 15 App Router completo (client/server/edge), 1-click en Vercel, source maps |
| Rollbar | 5.000 eventos + 1.000 replays/mes, usuarios ilimitados | 30 días | SDK más simple pero menos integrado con Next |
| Bugsnag | 7.500 eventos/mes, 1 usuario | **7 días** (muy corto) | Caro al crecer |
| Airbrake | Sin free (trial 30 días) | — | $19/mes |
| GlitchTip | Hosted: 1.000/mes free; self-hosted: gratis ilimitado | la tuya | SDKs de Sentry (compatible); requiere VPS 24/7 |
| PostHog Error Tracking | 100k errores/mes gratis | 7 días | **DESCARTADO para errores**: PostHog queda SOLO como analítica de producto (§3) |

**Sentry gana por**: integración nativa con Next.js 15 App Router y Vercel (source maps automáticos), ecosistema y roadmap. Migración futura: Sentry Team ($26/mes, 50k errores) o GlitchTip self-hosted en el VPS del plan `VPS_247.md` si se supera el free.

## 2. Configuración activa (moduleada 11 ago 2026)

> ⚠️ **Cambio de guardrails**: en la activación se pidieron TODAS las características encendidas, así que el tracing ya no está a 0. Regla de uso ajustada: las transacciones de Sentry conviven con Vercel Speed Insights (Speed Insights mide CWV, Sentry mide trazas de request); los replays de Sentry conviven con los de PostHog (Sentry orientado a errores, PostHog a producto).

1. **Tracing activo**: client/server/edge `tracesSampleRate: 1` (bot: `0.1`). Consume las 10k transacciones/mes del plan Developer — revisar en `sentry.io/organizations/ciszu-network/settings/projects/…/performance`.
2. **Replays activos**: `replaysSessionSampleRate: 0.1` + `replaysOnErrorSampleRate: 1` + `Sentry.replayIntegration()` (client). Límite free: 50 replays/mes.
3. **Feedback activo**: `Sentry.feedbackIntegration({ showBranding: false, triggerLabel: 'Reportar un problema', formTitle, messagePlaceholder })` → widget flotante en las webs.
4. **PostHog queda SOLO analítica de producto** (eventos custom `captureEvent`, flags). Las excepciones de código van a Sentry.
5. **NUNCA enviar datos personales a Sentry**: los scope extras deben ser ids/categorías, no emails/contraseñas/usuarios.
6. **No hardcodear DSNs**: solo `process.env.SENTRY_DSN` / `process.env.NEXT_PUBLIC_SENTRY_DSN` (sin fallbacks en código — lección turnstile).

## 3. Arquitectura (App Router + bot)

| Capa | Archivo | Qué captura |
| --- | --- | --- |
| Client | `src/instrumentation-client.ts` (en `src/` de cada web) | Errores de navegador (componentes cliente) + **widget feedback** + replays. DSN: `NEXT_PUBLIC_SENTRY_DSN`. Añade `export const onRouterTransitionStart = Sentry.captureRouterTransitionStart` (instrumenta navegaciones del App Router) |
| Server (Node) | `src/sentry.server.config.ts` + `src/instrumentation.ts` (`register()`) | Route handlers, server components, fetch a Supabase. DSN: `SENTRY_DSN` |
| Edge | `src/sentry.edge.config.ts` | Middleware / edge runtime |
| Error boundary raíz | `src/app/global-error.tsx` | Errores de render que rompen el layout raíz (`Sentry.captureException`) |
| Request errors | `src/instrumentation.ts` → `onRequestError` + `Sentry.captureRequestError(err, request, context)` | Errores de request (API routes) — requerido por el SDK v10 |
| Build | `next.config.ts` → `withSentryConfig({ org: 'ciszu-network', project: <app>, silent: true, sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN, filesToDeleteAfterUpload: ['.next/static/**/*.map'] } })` | Inyección automática; source maps se suben en Vercel production (tiene `SENTRY_AUTH_TOKEN`) y se borran los `.map` del artefacto tras el upload |
| Bot Discord | `projects/ciszubot/discord-bot/src/services/sentry.ts` (`initErrorTracking`, `captureError`) | `unhandledRejection`, `uncaughtException` y errores de comandos (slash + prefijo); se activa solo con `SENTRY_DSN` |

> **Lección de implementación**: con `src/` los configs deben vivir en `src/` (el `instrumentation.ts` resuelve `./sentry.server.config` relativo a sí mismo), NO en la raíz del proyecto. En SDK v10: `hideSourceMaps` ya no existe (usar `sourcemaps.disable`), `disableLogger` está deprecado y `captureRequestError` espera `{path, method, headers}` + contexto `{routerKind, routePath, routeType}`. MuzicMania no puede usar `NextError` de `next/error` (shim legacy `types/declarations.d.ts`) → su `global-error.tsx` es HTML mínimo.
>
> **⚠️ Client SDK en v10 (lección 11 ago 2026)**: el plugin webpack de `@sentry/nextjs` **solo auto-detecta `sentry.client.config.ts` en la RAÍZ del proyecto** — si viven en `src/`, el SDK client **nunca se inyecta** (no widget, no replays, no trazas client; el server sí porque `instrumentation.ts` lo importa explícito). La convención soportada en `src/` es `instrumentation-client.ts`, que además permite `onRouterTransitionStart`. Verificado con Playwright: sin él `window.__SENTRY__ === false` y 0 requests al ingest; con él el widget "Reportar un problema" aparece en el DOM. Nombre del archivo client: `src/instrumentation-client.ts` (no confundir con `src/instrumentation.ts` del server).

Apps y proyectos Sentry (nombrar así en sentry.io):
- `projects/ciszu/website` → proyecto **ciszunetwork**
- `projects/ciszukoantony/website` → proyecto **ciszukoantony**
- `projects/muzicmania/website` → proyecto **muzicmania**
- `projects/ciszubot/website` → proyecto **ciszubot** (web)
- `projects/ciszubot/discord-bot` → proyecto **ciszubot-bot** (Node)

## 4. Env vars (por app Vercel + `.env.local`)

| Variable | Dónde | Obligatoria |
| --- | --- | --- |
| `SENTRY_DSN` | server/edge + bot | Cuando exista la cuenta (server-only) |
| `NEXT_PUBLIC_SENTRY_DSN` | client (build-time) | Idem |
| `SENTRY_AUTH_TOKEN` | **SOLO Vercel production** (nunca previews; secret sin prefijo) | Solo para subir source maps en build |

Sin DSN el SDK es **no-op seguro** (warn en consola, builds OK) — el código ya está en producción sin romper nada.

## 5. Uso en código

```ts
// Server route handler / server component:
import * as Sentry from '@sentry/nextjs';
Sentry.captureException(new Error('...'));

// Bot:
import { captureError } from '../services/sentry';
captureError(err, { context: 'comando', command: 'economia' });
```

## 6. Activación (HECHO — 11 ago 2026)

Todo esto quedó aplicado vía API de Sentry + Vercel por el agente (los tokens del usuario se cargaron en el vault):

1. ✅ Cuenta sentry.io creada (**fplayersoffcial@gmail.com**, Developer free sin tarjeta).
2. ✅ Organización **ciszu-network** + 5 proyectos: `ciszunetwork`, `ciszukoantony`, `muzicmania`, `ciszubot`, `ciszubot-bot` (team `ciszu-network`; creados los 4 restantes vía `/api/0/teams/…/projects/` y renombrado `javascript-nextjs` → `ciszunetwork`).
3. ✅ DSNs en `.env.local` ×4 (`SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`), `.env` del bot, y Vercel ×4 (production+preview+development).
4. ✅ `SENTRY_AUTH_TOKEN` (= `SENTRY_ORG_TOKEN` `sntrys_…`) en Vercel production ×4 (sin `NEXT_PUBLIC_`).
5. ✅ Source maps habilitados en los 4 `next.config.ts` (`sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN, filesToDeleteAfterUpload: […] }`) — se suben en los builds de Vercel.
6. ✅ Alertas: por defecto los admins reciben email. Integración Discord con webhook de Sentry queda opcional (pedir al agente).

**Pendiente de verificación en vivo**: forzar un error de prueba y confirmar que llega al dashboard con source maps legibles.

## 7. Verificación de la integración (ya hecha)

- `@sentry/nextjs@10.69.0` instalado en las 4 webs (package.json) y `@sentry/node@10.69.0` en el bot.
- Configs creados en las 5 apps (en `src/`) + `global-error.tsx` + `instrumentation.ts` (register + onRequestError) + `withSentryConfig`.
- **Builds 4/4 OK** (ciszunetwork, ciszukoantony, muzicmania, ciszubot) con el SDK activo y `pnpm-workspace.yaml` con `@sentry/cli` aprobado (build script habilitado para el futuro upload de source maps).
- Bot: `pnpm --filter ciszubot build` OK (incluye `services/sentry.ts`).
- Tests unitarios 137/137 (121 previos + 16 nuevos de email/payments).
- Sin DSNs el SDK es no-op: los builds y el runtime no dependen de la cuenta Sentry.
