# ERRORS_SYSTEM — Manejo de errores con Sentry

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: ERRORS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema de manejo de errores del ecosistema con Sentry: integración en las
> 4 webs + bot, configs (tracing, replays, feedback), env vars, uso en código y mejora futura.

**Estado (11 ago 2026)**: ✅ **ACTIVADO** — cuenta creada (org `ciszu-network`), 5 proyectos (ciszunetwork, ciszukoantony, muzicmania, ciszubot, ciszubot-bot), DSNs en `.env.local` ×4 + vault + Vercel ×4, source maps activos, **todas las características encendidas**: errores + **tracing 100%** + **replays** (10% sesiones / 100% en error) + **widget de feedback** en las webs + bot con traces 10%.

## 0. Estado de la integración (11 ago 2026)

| ítem                          | Estado                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organización`ciszu-network`   | ✅ creada (id`4511894887989248`)                                                                                                                        |
| 5 proyectos Sentry            | ✅`ciszunetwork`, `ciszukoantony`, `muzicmania`, `ciszubot`, `ciszubot-bot` (team `ciszu-network`)                                                      |
| DSNs en`.env.local` ×4        | ✅`SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`                                                                                                               |
| DSN bot                       | ✅`projects/ciszubot/discord-bot/.env` → `SENTRY_DSN`                                                                                                   |
| Vault`services/supabase/.env` | ✅`SENTRY_ORG`, `SENTRY_ORG_TOKEN`, `SENTRY_PERSONAL_TOKEN`, `SENTRY_DSN_*` (cifrado con age)                                                           |
| Vercel ×4                     | ✅`SENTRY_DSN`+`NEXT_PUBLIC_SENTRY_DSN` (production+preview+development) + `SENTRY_AUTH_TOKEN` (solo production)                                        |
| Source maps                   | ✅ habilitados (`sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN }`) — se suben en los builds de Vercel production                                |
| SDK configs                   | ✅ client: tracing 1.0 + replays (0.1 / onerror 1.0) +`feedbackIntegration` (widget "Reportar un problema"); server/edge: tracing 1.0; bot: tracing 0.1 |
| Builds                        | ✅ 5/5 OK (4 webs + bot) con todo activo                                                                                                                |

**Tokens** (solo en vault cifrado, nunca en git): `SENTRY_ORG_TOKEN` (`sntrys_…`, se usa como `SENTRY_AUTH_TOKEN` en Vercel) y `SENTRY_PERSONAL_TOKEN` (`sntryu_…`, gestión vía API `/api/0/`).

**Para verificar en vivo**: forzar un error (`Sentry.captureException`) en una ruta de prueba → debe aparecer en `sentry.io/organizations/ciszu-network/`. Source maps cargados → stack traces legibles.

## 1. Decisión: ¿por qué Sentry?

Comparación verificada (ago 2026), priorizando **free sin tarjeta** (regla de financiación de Ciszu Network):

| Herramienta            | Free tier (verificado ago 2026)                                             | Retención              | Notas                                                                                   |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| **Sentry** ✅          | Developer: 5.000 errores + 10.000 transacciones + 50 replays/mes, 1 usuario | 30 días                | SDK Next.js 15 App Router completo (client/server/edge), 1-click en Vercel, source maps |
| Rollbar                | 5.000 eventos + 1.000 replays/mes, usuarios ilimitados                      | 30 días                | SDK más simple pero menos integrado con Next                                            |
| Bugsnag                | 7.500 eventos/mes, 1 usuario                                                | **7 días** (muy corto) | Caro al crecer                                                                          |
| Airbrake               | Sin free (trial 30 días)                                                    | —                      | $19/mes                                                                                 |
| GlitchTip              | Hosted: 1.000/mes free; self-hosted: gratis ilimitado                       | la tuya                | SDKs de Sentry (compatible); requiere VPS 24/7                                          |
| PostHog Error Tracking | 100k errores/mes gratis                                                     | 7 días                 | **DESCARTADO para errores**: PostHog queda SOLO como analítica de producto (§3)         |

**Sentry gana por**: integración nativa con Next.js 15 App Router y Vercel (source maps automáticos), ecosistema y roadmap. Migración futura: Sentry Team ($26/mes, 50k errores) o GlitchTip self-hosted en el VPS del plan `VPS_PLAN.md` si se supera el free.

## 2. Configuración activa (moduleada 11 ago 2026)

> ⚠️ **Cambio de guardrails**: en la activación se pidieron TODAS las características encendidas, así que el tracing ya no está a 0. Regla de uso ajustada: las transacciones de Sentry conviven con Vercel Speed Insights (Speed Insights mide CWV, Sentry mide trazas de request); los replays de Sentry conviven con los de PostHog (Sentry orientado a errores, PostHog a producto).

1. **Tracing activo**: client/server/edge `tracesSampleRate: 1` (bot: `0.1`). Consume las 10k transacciones/mes del plan Developer — revisar en `sentry.io/organizations/ciszu-network/settings/projects/…/performance`.
2. **Replays activos**: `replaysSessionSampleRate: 0.1` + `replaysOnErrorSampleRate: 1` + `Sentry.replayIntegration()` (client). Límite free: 50 replays/mes.
3. **Feedback activo**: `Sentry.feedbackIntegration({ showBranding: false, triggerLabel: 'Reportar un problema', formTitle, messagePlaceholder })` → widget flotante en las webs.
4. **PostHog queda SOLO analítica de producto** (eventos custom `captureEvent`, flags). Las excepciones de código van a Sentry.
5. **NUNCA enviar datos personales a Sentry**: los scope extras deben ser ids/categorías, no emails/contraseñas/usuarios.
6. **No hardcodear DSNs**: solo `process.env.SENTRY_DSN` / `process.env.NEXT_PUBLIC_SENTRY_DSN` (sin fallbacks en código — lección turnstile).

## 3. Arquitectura (App Router + bot)

| Capa                | Archivo                                                                                                                                                                                                     | Qué captura                                                                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client              | `src/instrumentation-client.ts` (en `src/` de cada web)                                                                                                                                                     | Errores de navegador (componentes cliente) +**widget feedback** + replays. DSN: `NEXT_PUBLIC_SENTRY_DSN`. Añade `export const onRouterTransitionStart = Sentry.captureRouterTransitionStart` (instrumenta navegaciones del App Router) |
| Server (Node)       | `src/sentry.server.config.ts` + `src/instrumentation.ts` (`register()`)                                                                                                                                     | Route handlers, server components, fetch a Supabase. DSN:`SENTRY_DSN`                                                                                                                                                                  |
| Edge                | `src/sentry.edge.config.ts`                                                                                                                                                                                 | Middleware / edge runtime                                                                                                                                                                                                              |
| Error boundary raíz | `src/app/global-error.tsx`                                                                                                                                                                                  | Errores de render que rompen el layout raíz (`Sentry.captureException`)                                                                                                                                                                |
| Request errors      | `src/instrumentation.ts` → `onRequestError` + `Sentry.captureRequestError(err, request, context)`                                                                                                           | Errores de request (API routes) — requerido por el SDK v10                                                                                                                                                                             |
| Build               | `next.config.ts` → `withSentryConfig({ org: 'ciszu-network', project: <app>, silent: true, sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN, filesToDeleteAfterUpload: ['.next/static/**/*.map'] } })` | Inyección automática; source maps se suben en Vercel production (tiene`SENTRY_AUTH_TOKEN`) y se borran los `.map` del artefacto tras el upload                                                                                         |
| Bot Discord         | `projects/ciszubot/discord-bot/src/services/sentry.ts` (`initErrorTracking`, `captureError`)                                                                                                                | `unhandledRejection`, `uncaughtException` y errores de comandos (slash + prefijo); se activa solo con `SENTRY_DSN`                                                                                                                     |

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

| Variable                 | Dónde                                                           | Obligatoria                           |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------- |
| `SENTRY_DSN`             | server/edge + bot                                               | Cuando exista la cuenta (server-only) |
| `NEXT_PUBLIC_SENTRY_DSN` | client (build-time)                                             | Idem                                  |
| `SENTRY_AUTH_TOKEN`      | **SOLO Vercel production** (nunca previews; secret sin prefijo) | Solo para subir source maps en build  |

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

## 8. Mejora futura — widget feedback a página dedicada (12 ago 2026)

**Pendiente documentado en `projects/ciszu/docs/documentation/TODO.md` (sección "Errores (Sentry) — MEJORA FUTURA") y en los TODO de las 4 webs.** En el futuro el widget de feedback **dejará de ser botón flotante** y pasará a una **página dedicada por sitio**.

**Motivo**: el botón flotante "Reportar un problema" a veces tapa elementos de la UI en ciertas páginas/secciones.

**Requisitos de la mejora**:

- **Página dedicada por sitio** (p.ej. `/feedback` o sección en la página de ayuda/instalación), con **estética propia por sitio** (neon cian/rosa por web — ya es configurable vía `FeedbackTextConfiguration` + `FeedbackThemeConfiguration` en `feedbackIntegration` de cada `src/instrumentation-client.ts`).
- **Traducciones**: hoy los ~34 textos del widget son configurables (`triggerLabel`, `formTitle`, `messagePlaceholder`, botones, errores…) pero **sin i18n automático** — los internos de marca (logo Sentry, screen-shot tools) quedan en inglés salvo override. La página dedicada debe plantear soporte multi-idioma.
- **`autoInject: false`**: para quitar el botón flotante se desactiva la auto-inyección del widget y se abre el diálogo programáticamente desde la página (`Sentry.getFeedback().openDialog()`); opcionalmente `attachTo` en el contenedor de la página. Callbacks disponibles: `onFormOpen`, `onSubmitSuccess`, `onSubmitError`, `onFormSubmitted`.
- **Sin datos personales**: mantener la regla §2.5 (ids/categorías, nunca emails/contraseñas en scope extras).

**Relacionado (mismo ciclo futuro)**: mover el botón "Instalar PDWA" (fab flotante) a una página dedicada — ver PDWA en AGENTS.md. Ambos widgets flotantes migrarán juntos a páginas de "Instalar/Ayuda" por web cuando se decida.

## Errores (Sentry) — MEJORA FUTURA (página dedicada)

- [ ] **Mover el widget de feedback de Sentry a una página dedicada por sitio** (hoy es botón flotante "Reportar un problema"). Razón: a veces tapa elementos de la UI. La página debe tener estética propia por sitio (neon por web, ya configurables los textos/tema en `feedbackIntegration`) y soportar **traducciones** (hoy textos configurables sin i18n automático). Ver `ERRORS_SYSTEM.md` §8.
- [ ] **Mover el botón "Instalar PDWA" a una página dedicada** (hoy es fab flotante inferior-izquierda en los 4 layouts). Depende: decidir por sitio. Se combina con el futuro de los widgets (Sentry feedback + PDWA en una página de "Instalar/Ayuda" por web).
- [ ] Evaluar bajada de `replaysSessionSampleRate` de 1.0 (temporal para pruebas) a 0.1 en los 4 `src/instrumentation-client.ts` cuando se termine de probar. Y verificar el checklist "Beyond the Basics" de sentry.io (Unminify + notifications) tras un deploy con eventos frescos.

## Conceptos de errores (contexto informático)

| Término | Definición |
|---|---|
| **DSN** | URL del proyecto Sentry a la que se envían eventos |
| **Evento/Issue** | Error reportado (agrupado) |
| **StackTrace** | Pila de llamadas del error |
| **Source maps** | Mapeo minificado → código original (para stack legible) |
| **Tracing/Transaction** | Traza de una petición completa |
| **Replay** | Grabación de la sesión del navegador |
| **Sample rate** | Fracción de tráfico muestreado (0.1 = 10%) |
| **Ingest** | Punto de ingesta de eventos de Sentry |
| **Feedback widget** | Botón flotante "Reportar un problema" |
| **Global error boundary** | Componente que captura errores de render raíz |

## Buenas prácticas de errores

1. **Sin datos personales** en scope extras (solo ids/categorías).
2. **Sin DSNs hardcodeados** — siempre `process.env.*` (sin fallbacks).
3. Errores esperados (validación) no se reportan; solo excepciones reales.
4. Usar `captureException` en catch y error boundaries; no tragar errores.
5. Verificar en vivo tras cada cambio de config (forzar un error de prueba).

## Mapa de archivos (resumen)

| Capa | Archivo |
|---|---|
| Client | `src/instrumentation-client.ts` (widget, replays, trazas client) |
| Server | `src/sentry.server.config.ts` + `src/instrumentation.ts` |
| Edge | `src/sentry.edge.config.ts` |
| Error boundary | `src/app/global-error.tsx` |
| Bot | `projects/ciszubot/discord-bot/src/services/sentry.ts` |

## Preguntas frecuentes

**¿Cuánto consume el free de Sentry?** 5.000 errores + 10.000 transacciones + 50 replays/mes, 30 días de retención.

**¿PostHog también captura errores?** No — queda SOLO como analítica de producto; las excepciones van a Sentry.

**¿Qué pasa sin DSN?** El SDK es no-op seguro (builds OK, warn en consola).

**¿Por qué el widget a veces tapa la UI?** Por eso el plan §8: moverlo a página dedicada por sitio.

## Integración con el resto de observabilidad

| Señal | Herramienta | Complementariedad |
|---|---|---|
| Error/Exception | Sentry (`ERRORS_SYSTEM.md`) | Detalle de la excepción y stack trace legible |
| Caída de servicio | UptimeRobot (`MONITORING_SYSTEM.md`) | "El servicio no responde" (disponibilidad 24/7) |
| Producto/eventos | PostHog (`ANALYTICS_SYSTEM.md`) | Qué hacen los usuarios (no errores) |
| Rendimiento/CWV | Vercel Speed Insights | Métricas de experiencia real del usuario |

Sentry y UptimeRobot se complementan: Sentry explica por qué explota una request o un
componente; UptimeRobot avisa cuando el servicio deja de responder estando fuera del PC.

## Troubleshooting de la integración

| Síntoma | Causa probable | Solución |
|---|---|---|
| `window.__SENTRY === false` en el navegador | Falta `src/instrumentation-client.ts` (el plugin solo auto-detecta `sentry.client.config.ts` en la raíz) | Crear el client en `src/` (§3) |
| 0 requests al ingest | DSN no inyectado o bloqueado por CSP | Verificar `NEXT_PUBLIC_SENTRY_DSN` y el host del ingest en la CSP |
| Stack traces minificados | Source maps no subidos | Chequear `SENTRY_AUTH_TOKEN` en Vercel production y `sourcemaps` en `next.config.ts` |
| Límite free alcanzado | 5k errores / 10k transacciones / 50 replays | Revisar sample rates (§2) o migrar a plan de pago/GlitchTip |
| Alertas silenciosas | Notificaciones sin configurar o email en spam | Configurar alertas de proyecto en sentry.io |

## Buenas prácticas de sample rates

- En producción `tracesSampleRate: 1` está justificado mientras el volumen de transacciones
  esté muy por debajo de las 10k/mes; si se acerca, bajar a 0.5-0.1 conservando el 100% en errores.
- Los replays en error (`replaysOnErrorSampleRate: 1`) son más baratos que los de sesión:
  subir los de error antes que los de sesión si se quiere más contexto por evento.
- El bot con `0.1` (10%) es razonable: un comando fallido se reporta siempre, pero las trazas
  de paso a paso se muestrean para no gastar cuota.

## Pregunta frecuente adicional

**¿Un error de validación de usuario debe reportarse a Sentry?** No: solo excepciones reales y
no esperadas (ver "Buenas prácticas de errores"). Los `try/catch` de control de flujo no se
reportan.

_Última revisión: 13 ago 2026._ Relacionado: `MONITORING_SYSTEM.md`, `ANALYTICS_SYSTEM.md`,
`DEVSECOPS_SYSTEM.md`, `VAULT_SYSTEM.md`.
