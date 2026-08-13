# Sistema de Analíticas — PostHog (Ciszu Network)

> **Estado**: implementado en código (10 ago 2026). Pendiente de activación: cuenta + key + envs (ver §8).
> Relacionado: `CLOUDFLARE_SYSTEM.md`, `CACHING_SYSTEM.md`, `UPTIMEROBOT` (AGENTS.md).

## 1. Decisión

**PostHog Cloud (free tier)** como sistema de analíticas de producto para las 4 webs de Ciszu Network. **Híbrido con Cloudflare Web Analytics** (ya activo) — no se pisan: uno mide tráfico, el otro mide producto.

- **Corto plazo: 100% gratis, sin tarjeta de crédito** (verificado en posthog.com/pricing el 10 ago 2026: "No credit card required", free forever).
- **Largo plazo: $0 mientras no se superen los límites mensuales del free tier** (poco probable al tráfico actual). Si se superan: pay-as-you-go con tarifas públicas y billing limits configurables (ver §5).

## 2. Qué es PostHog

Plataforma open-source (MIT, $1.4B valoración, 2025) de **product analytics** todo-en-uno:

| Producto                                                              | Free tier mensual   |
| --------------------------------------------------------------------- | ------------------- |
| Product Analytics (eventos, embudos, retención, cohortes, paths, SQL) | 1.000.000 eventos   |
| Session Replay (grabaciones de sesión con masking)                    | 5.000 grabaciones   |
| Feature Flags (rollouts, segmentos)                                   | 1.000.000 requests  |
| Error Tracking (captura de errores cliente/servidor)                  | 100.000 excepciones |
| Surveys (encuestas in-producto)                                       | 1.500 respuestas    |
| Logs                                                                  | 10 GB               |
| PostHog AI                                                            | 500 créditos        |

Un solo proyecto, miembros del equipo ilimitados, retención 1 año, sin límite de proyectos extra en free (1 proyecto).

## 3. Por qué PostHog para Ciszu Network

1. **Las 4 webs son productos, no blogs**: MuzicMania tiene login/scores/descargas, ciszubot tiene dashboard OAuth. Necesitamos embudos (registro→login→score), no solo contadores de visitas.
2. **Cubre 2 tareas del toDo a la vez**: analíticas **y** errores (su Error Tracking de 100k/mes gratis es la "alternativa mejor" a Sentry de la tarea 4).
3. **Gratis sin tarjeta**: no depende de identidad legal ni de tarjeta (igual que Turnstile/Cloudflare — bloqueo actual del plan legal no aplica).
4. **Un ecosistema, cero solapamientos**: encaja sin pisar lo ya activo (ver §4).
5. **Feature flags** (fase 2): útiles para el debug/beta testing del toDo de MuzicMania (whitelist, beta tags).
6. **Privacidad**: cookieless opcional, sin PII por diseño, GDPR-friendly, hosting EU (eu.i.posthog.com) o US.

## 4. Ecosistema híbrido de monitoreo — quién mide qué (no se pisan)

| Herramienta                     | Responsabilidad (ÚNICA)                                                                   | Estado                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| **Cloudflare Web Analytics**    | Tráfico/marketing: pageviews, referrers, países. Beacon ~1KB, sin impacto Core Web Vitals | ✅ Activo (4 webs, token`2fcf0eab...`) |
| **Vercel Speed Insights**       | Core Web Vitals reales (LCP/CLS/INP) en producción                                        | ✅ Activo (solo MuzicMania)            |
| **UptimeRobot**                 | Disponibilidad 24/7 (5 monitores) + alertas email/push + watcher ntfy                     | ✅ Activo                              |
| **PostHog — Product Analytics** | **ESTE SISTEMA**: eventos de producto, embudos, retención, session replay, feature flags  | 🆕 Implementado (activación pendiente) |
| **PostHog — Error Tracking**    | Errores de cliente/servidor (sustituye la tarea Sentry del toDo)                          | 🆕 Fase 2                              |
| **ntfy**                        | Notificaciones push (alarmas UptimeRobot, avisos de tareas/errores)                       | ✅ Activo                              |

### Reglas anti-solapamiento (obligatorias)

1. **NO activar el "Web Analytics" de PostHog** (`capture_pageview: false` en el init): duplicaría Cloudflare. PostHog solo recibe eventos `$pageview` como eventos de producto con `app` + `path`.
2. **NO correr Sentry + PostHog Error Tracking a la vez**: misma ingestión duplicada del mismo error.
3. **UptimeRobot se queda como está**: mide disponibilidad del servicio, no comportamiento (no compite con PostHog).
4. **Session replay**: activar solo en páginas de producto (MuzicMania play/dashboard), nunca en páginas con datos sensibles; PostHog enmascara inputs por defecto.
5. **Script de PostHog pesado (~68KB)**: cargado con `async` y solo cuando `NEXT_PUBLIC_POSTHOG_KEY` existe; Cloudflare (1KB) sigue siendo la capa de tráfico con 0 impacto.

## 5. Costos (verificado 10 ago 2026 en posthog.com/pricing)

### Corto plazo — GRATIS, sin tarjeta de crédito

- Registro con email únicamente (sin tarjeta, sin trial, sin "free for 14 days").
- Límites mensuales: 1M eventos analítica + 5k replays + 1M flags + 100k errores + 1.500 surveys + 10 GB logs.
- Si se supera un límite **sin tarjeta**: PostHog **deja de ingestar** ese producto hasta el siguiente mes (no corta, no cobra).
- 1 proyecto (suficiente: las 4 webs se separan con la propiedad `app`).
- Retención 1 año. Miembros ilimitados. Soporte community.

### Largo plazo — pago documentado (solo si se superan los límites)

Tarifas públicas por uso (tras el free tier mensual de cada producto):

| Producto                                     | Tarifa tras free tier                                                |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Product Analytics (eventos sin props custom) | $0.00005/evento                                                      |
| **Eventos CON propiedades custom** ⚠️        | **$0.000248/evento (~5x)** — gotcha: limitar props custom por evento |
| Session Replay                               | ~$0.0001/min grabado (aprox.)                                        |
| Error Tracking                               | $0.00035/evento tras 100k                                            |
| AI Observability                             | $0.00035/evento tras 100k                                            |

- **Billing limits configurables por producto** (nunca factura de sorpresa; al llegar al límite, deja de ingestar).
- Con tarjeta: 6 proyectos + retención 7 años + soporte email.
- **Estimación Ciszu Network**: tráfico actual (miles de pageviews/mes entre las 4 webs) → decenas de miles de eventos/mes → **$0/mes indefinidamente**. El umbral real de pago serían ~1M de eventos/mes (≈ un juego con miles de jugadores diarios).

## 6. Comparativa de alternativas (2026)

|                   | PostHog                   | Plausible  | Umami                     | Fathom     | Matomo       | Mixpanel     | Clarity (MS) |
| ----------------- | ------------------------- | ---------- | ------------------------- | ---------- | ------------ | ------------ | ------------ | --- | --- |
| Free tier         | ✅ 1M ev/mes, sin tarjeta | ❌ $9/mo   | ✅ 100k cloud / self-host | ❌ $15/mo  | ✅ self-host | ✅ 1M ev/mes | ✅ ilimitado |     |     |
| Session replay    | ✅                        | ❌         | ❌                        | ❌         | plugin pago  | ❌           | ✅           |
| Feature flags     | ✅                        | ❌         | ❌                        | ❌         | ❌           | ✅           | ❌           |
| Error tracking    | ✅                        | ❌         | ❌                        | ❌         | ❌           | ❌           | ❌           |
| Embudos/retención | ✅                        | solo goals | básico                    | ❌         | ✅           | ✅           | ❌           |
| Script            | ~68KB                     | 2.5KB      | ~2KB                      | 2.1KB      | pesado       | pesado       | ~50KB        |
| Self-host         | pesado (4vCPU/16GB)       | ligero     | ligero                    | abandonado | ligero       | ❌           | ❌           |

**Conclusión**: PostHog es el único gratis-sin-tarjeta que cubre analítica + errores + replay + flags en una herramienta. Plausible/Umami/Fathom son solo tráfico (y Plausible/Fathom cuestan); Matomo self-host requiere VPS (el VPS es tarea futura del bot, no del analytics); Mixpanel no tiene replay gratis; Clarity no tiene flags ni errores. **Híbrido final: Cloudflare (tráfico) + PostHog (producto/errores) — sin VPS, sin tarjeta, $0.**

## 7. Implementación (código ya entregado, 10 ago 2026)

### Componente compartido — `packages/ui/src/PostHogAnalytics.tsx`

- Client component, **sin dependencias npm** (patrón CloudflareGuard): carga `array.js` de PostHog y usa la API global `window.posthog`.
- **Degradación segura**: sin `NEXT_PUBLIC_POSTHOG_KEY` no carga nada (no rompe producción).
- Init con `capture_pageview: false` + trackeo manual de `$pageview` (usePathname + useSearchParams) porque App Router no recarga en navegación SPA. **Fix 11 ago 2026 (recomendaciones del dashboard)**: `capture_pageleave: true` (con pageview:false el default `'if_capture_pageview'` silencia los pageleaves → bounce rate/session duration inexactos) + `capture_performance: { web_vitals: true, network_timing: false }` (`$web_vitals` LCP/CLS/FCP/INP; network_timing solo lo usa session replay, OFF por política).
- Prop `app` (nombre corto de la web) → se envía como propiedad en cada evento para separar las 4 webs en el único proyecto free.
- Exporta `captureEvent(event, properties)` para eventos custom desde cualquier componente client (fase 2).
- Envuelto en `<Suspense>` (requisito de Next 15 para `useSearchParams` en prerender estático).

### Integración en las 4 webs (layouts)

```tsx
// junto a <PwaRegister />, antes de </body>
<PostHogAnalytics app="ciszunetwork" />   // projects/ciszu/website
<PostHogAnalytics app="ciszukoantony" />  // projects/ciszukoantony/website
<PostHogAnalytics app="muzicmania" />     // projects/muzicmania/website
<PostHogAnalytics app="ciszubot" />       // projects/ciszubot/website
```

### Tests

- `packages/ui/tests/PostHogAnalytics.test.tsx` — 7 tests: degradación sin key, carga de array.js (host default y custom), init con `capture_pageview:false`, `$pageview` con `app`+`path`, `captureEvent` con/sin PostHog.
- `vitest.config.mts`: alias `next/navigation` → `packages/ui/tests/mocks/next-navigation.ts` (next no está en la raíz del monorepo).
- `packages/ui/tsconfig.json`: `paths` al mismo stub para el typecheck del paquete (las apps resuelven el real por node_modules).
- `next@^15.5.22` añadido como devDependency de `@ciszu/ui` (patrón react/react-dom): sin él, el tsc de las apps no resuelve `next/navigation` desde `packages/ui/src` (next solo vive en los node_modules de cada app).
- ⚠️ MuzicMania: su shim legacy `src/types/declarations.d.ts` re-declara `module 'react'` con types laxos — añadir ahí todo export de react que packages/ui importe (lección 10 ago: `Suspense`).
- Resultado: suite UI 30/30 OK, suite completa 121/121 OK, typecheck de los 4 paquetes-website OK.

## 8. Activación — realizada 10 ago 2026 (verificada)

> Código + credenciales + envs ya completados. Solo falta el deploy (push) para ver los
> primeros eventos reales.

1. ✅ **Cuenta creada** por el usuario en https://app.posthog.com (gratis, sin tarjeta) — US Cloud.
2. ✅ **Proyecto "Ciszu Network"** (id `550383`, org `019fe9e4-ca36-0000-c909-958aa3caa3cd`).
3. ✅ **Project API Key** `phc_rSAcA8jCP68APVdcZ5FLEc5sayYj7JVqJ2SKgHNySLuT` verificada con un `capture` de prueba aceptado ("event submitted without a distinct*id"). La **Personal API Key** (`phx*`) verificada contra la API de proyectos.
4. ✅ **Envs locales**: `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` añadidas a `.env.local` de las 4 apps (gitignored).
5. ✅ **Vercel**: las 2 vars (production+preview+development) creadas vía API en los 4 proyectos (`ciszunetworkpage`, `ciszukoantonypage`, `muzicmania`, `ciszubot`).
6. ✅ **Authorized URLs** (Installation Health): 4 dominios (`https://ciszunetwork.vercel.app`, `https://ciszukoantony.vercel.app`, `https://muzicmania.vercel.app`, `https://ciszubot.vercel.app`) configurados vía `PATCH /api/projects/550383/` con el campo **`app_urls`** (⚠️ el campo `authorized_uris` NO existe en la API; el update de proyecto NO acepta `phs_`, solo `phx_`).
7. ⏳ **Deploy**: pendiente del push del usuario — los workflows de GitHub Actions desplegarán las 4 webs y los `$pageview` llegarán a PostHog.
8. ⏳ **Marcar la tarea** en el toDo (ya marcada por Ciszuko Antony el 10 ago 2026).

### Installation Health (10 ago 2026)

- ✅ `$pageview` — eventos fluyendo correctamente tras el deploy 11 ago 2026.
- ✅ `$pageleave` — **fix 11 ago 2026**: con `capture_pageview:false` el SDK silencia los pageleaves (default `'if_capture_pageview'`) → ahora `capture_pageleave: true` explícito en el init.
- ✅ `Scroll depth` — OK por defecto del SDK.
- ✅ `$web_vitals` (LCP/CLS/FCP/INP) — **fix 11 ago 2026**: `capture_performance: { web_vitals: true, network_timing: false }` (sin el flag cae al remote config, desactivado).
- ✅ **Authorized URLs** — resuelto (paso 6).
- ⚠️ **Reverse proxy** — NO es un fallo: mejora la precisión con usuarios que usan ad-blockers (bloquean `us.i.posthog.com`). Sin dominio propio NO se puede configurar en el dashboard; **solución gratis sin dominio: Cloudflare Worker en `*.workers.dev`** (worker listo en `tools/posthog-proxy/worker.js`): pegar en Workers & Pages → Create → Deploy → usar la URL como `NEXT_PUBLIC_POSTHOG_HOST` (Vercel ×4 + `.env.local` ×4) → marcar Reverse proxy en Project Settings → Web Analytics. El check se resuelve tras marcar el toggle.
- **Secret API Key (`phs_`)**: NO se usa para el tracking. Es una **Project Secret API Key (PSAK)** (server-to-server, con scopes) válida SOLO para endpoints que la aceptan (`endpoint:run`, etc.); en `/api/projects/*` devuelve 401 ("invalid personal API key" — esperado, esos endpoints solo aceptan `phx_`). Rotada por el usuario 10 ago 2026; guardada en vault `POSTHOG_SECRET_API_KEY`. Para gestión de keys se usa la `phx_` (`GET/POST/PATCH/DELETE /api/projects/550383/project_secret_api_keys/`).

## 9. Eventos a capturar

### Fase 1 (automática, ya en el componente)

- `$pageview` en cada navegación con `{ app, path }`.

### Fase 2 (eventos custom con `captureEvent` de `@ciszu/ui`)

| App               | Eventos propuestos                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **muzicmania**    | `sign_up`, `login`, `logout`, `submit_score` (con score/track_id), `play_session_start/end`, `download_launcher`, `like_track`, `create_level` |
| **ciszubot**      | `invite_click`, `dashboard_login`, `guild_config_save`, `vote`                                                                                 |
| **ciszukoantony** | `contact_form_submit`, `social_click`, `download_media`                                                                                        |
| **ciszunetwork**  | `ecosystem_click`, `contact_submit`, `nav_click`                                                                                               |

### Fase 3 (features PostHog)

- **identify** con `user_id` de Supabase (MuzicMania auth) → embudos por usuario real.
- **Feature flags**: beta testing/debug del toDo de MuzicMania (whitelist por usuario).
- **Error Tracking**: activar el SDK de errores (cubre tarea Sentry del toDo).

## 10. Privacidad

- Sin PII por diseño: `distinct_id` anónimo por defecto; no enviar emails/nombres como propiedades (solo `user_id` internos si aplica).
- Session replay con masking de inputs por defecto; no grabar páginas con datos sensibles.
- Opción cookieless (`persistence: 'memory'`) si algún día se requiere; hoy se usa `localStorage+cookie` para no perder la identidad del visitante entre páginas (mismo host).
- Data pipeline EU (eu.i.posthog.com) disponible si se necesita residencia europea.
