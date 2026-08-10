# ERRORES_SISTEMA — Manejo de errores con Sentry

**Estado (11 ago 2026)**: SDK integrado en las 4 webs + bot de Discord. Pendiente del usuario: crear cuenta, 5 proyectos y las DSNs (ver §6). Doc plan: `ANALYTICS_POSTHOG.md` para analítica; este doc es SOLO errores.

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

## 2. Guardrails (reglas de uso)

1. **Tracing OFF** (`tracesSampleRate: 0`): las transacciones de Vercel Speed Insights (Core Web Vitals) son la fuente de rendimiento; Sentry NO debe duplicarlas ni consumir su cuota.
2. **Replays OFF** (`replaysSessionSampleRate: 0` y `replaysOnErrorSampleRate: 0`): los 5k replays/mes de PostHog cubren sesiones de usuario; Sentry replays solo darían 50/mes.
3. **PostHog queda SOLO analítica de producto/errores de negocio** (eventos custom `captureEvent`, flags). Las excepciones de código van a Sentry.
4. **NUNCA enviar datos personales a Sentry**: los scope extras deben ser ids/categorías, no emails/contraseñas/usuarios.
5. **No hardcodear DSNs**: solo `process.env.SENTRY_DSN` / `process.env.NEXT_PUBLIC_SENTRY_DSN` (sin fallbacks en código — lección turnstile).

## 3. Arquitectura (App Router + bot)

| Capa | Archivo | Qué captura |
| --- | --- | --- |
| Client | `src/sentry.client.config.ts` (en `src/` de cada web) | Errores de navegador (componentes cliente). DSN: `NEXT_PUBLIC_SENTRY_DSN` |
| Server (Node) | `src/sentry.server.config.ts` + `src/instrumentation.ts` (`register()`) | Route handlers, server components, fetch a Supabase. DSN: `SENTRY_DSN` |
| Edge | `src/sentry.edge.config.ts` | Middleware / edge runtime |
| Error boundary raíz | `src/app/global-error.tsx` | Errores de render que rompen el layout raíz (`Sentry.captureException`) |
| Request errors | `src/instrumentation.ts` → `onRequestError` + `Sentry.captureRequestError(err, request, context)` | Errores de request (API routes) — requerido por el SDK v10 |
| Build | `next.config.ts` → `withSentryConfig({ org: 'ciszu-network', project: <app>, silent: true, sourcemaps: { disable: true } })` | Inyección automática; source maps DESACTIVADOS hasta tener `SENTRY_AUTH_TOKEN` (entonces cambiar a `sourcemaps: { filesToDeleteAfterUpload: ['.next/static/**/*.map'] }`) |
| Bot Discord | `projects/ciszubot/discord-bot/src/services/sentry.ts` (`initErrorTracking`, `captureError`) | `unhandledRejection`, `uncaughtException` y errores de comandos (slash + prefijo); se activa solo con `SENTRY_DSN` |

> **Lección de implementación**: con `src/` los configs deben vivir en `src/` (el `instrumentation.ts` resuelve `./sentry.server.config` relativo a sí mismo), NO en la raíz del proyecto. En SDK v10: `hideSourceMaps` ya no existe (usar `sourcemaps.disable`), `disableLogger` está deprecado y `captureRequestError` espera `{path, method, headers}` + contexto `{routerKind, routePath, routeType}`. MuzicMania no puede usar `NextError` de `next/error` (shim legacy `types/declarations.d.ts`) → su `global-error.tsx` es HTML mínimo.

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

## 6. Tareas del usuario (para activar)

1. Crear cuenta en `sentry.io` con **fplayersoffcial@gmail.com** (Developer free, sin tarjeta).
2. Crear la organización (nombre sugerido: **ciszu-network**) y los 5 proyectos de §3.
3. Copiar cada DSN a la env correspondiente (Vercel: production+preview+development las webs; `SENTRY_DSN` del bot en su `.env` del PC/vault).
4. Generar `SENTRY_AUTH_TOKEN` en Settings → Auth Tokens (scope `project:releases` + `org:read`) y ponerlo en Vercel production ×4 (sin `NEXT_PUBLIC_`).
5. Desplegar y verificar: forzar un error (p.ej. `Sentry.captureException` en una ruta de prueba) y comprobar que llega al dashboard con source maps.
6. Configurar alertas de email (por defecto Sentry avisa a los admins) y, si se quiere, integración con Discord vía webhook de Sentry.

## 7. Verificación de la integración (ya hecha)

- `@sentry/nextjs@10.69.0` instalado en las 4 webs (package.json) y `@sentry/node@10.69.0` en el bot.
- Configs creados en las 5 apps (en `src/`) + `global-error.tsx` + `instrumentation.ts` (register + onRequestError) + `withSentryConfig`.
- **Builds 4/4 OK** (ciszunetwork, ciszukoantony, muzicmania, ciszubot) con el SDK activo y `pnpm-workspace.yaml` con `@sentry/cli` aprobado (build script habilitado para el futuro upload de source maps).
- Bot: `pnpm --filter ciszubot build` OK (incluye `services/sentry.ts`).
- Tests unitarios 137/137 (121 previos + 16 nuevos de email/payments).
- Sin DSNs el SDK es no-op: los builds y el runtime no dependen de la cuenta Sentry.
