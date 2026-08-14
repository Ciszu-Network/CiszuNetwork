# ANALYTICS_SYSTEM — Sistema Global de Analíticas (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: ANALYTICS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: el sistema global de analíticas es la arquitectura completa que captura,
> procesa y expone datos de comportamiento, tráfico, rendimiento y errores de todo el
> ecosistema (4 webs + bot + juego). **PostHog es una herramienta dentro del sistema**,
> no el sistema en sí. Cada pieza mide UNA responsabilidad sin solaparse (regla
> anti-solapamiento, §4).

---

## 1. Arquitectura general del sistema

```
Fuentes de datos                    Ingestion                   Almacenamiento              Exposición
─────────────────────────────────    ───────────────────────     ─────────────────────      ─────────────────────
4 websites (Next.js 15)        →    Beacon Cloudflare (1KB)  →  Cloudflare dashboard   →   Web Analytics UI
Bot Discord (heartbeat)        →    SDK PostHog (~68KB)      →  PostHog Cloud (US)     →   PostHog dashboard
Supabase (BD + edge functions) →    /api/verify-turnstile    →  Supabase Postgres      →   Supabase Studio
MuzicMania juego (Tauri)       →    Vercel Speed Insights    →  Vercel analytics       →   Speed Insights UI
UptimeRobot monitors           →    API v3 UptimeRobot       →  UptimeRobot storage    →   UptimeRobot dashboard
ntfy watcher (GH Actions)      →    webhook ntfy.sh          →  topic público          →   push móvil
Sentry SDKs (×5: 4 webs + bot) →    Sentry ingest            →  Sentry (free tier)     →   Sentry.io
```

### 1.1 Capas del sistema

| Capa | Función | Herramienta |
|---|---|---|
| **Tráfico / marketing** | Pageviews, referrers, países, device | Cloudflare Web Analytics |
| **Producto / comportamiento** | Eventos, embudos, retención, cohortes | PostHog Product Analytics |
| **Rendimiento real (CWV)** | LCP, CLS, INP, FCP en producción | Vercel Speed Insights |
| **Disponibilidad / uptime** | Estado 24/7 de webs, API y BD | UptimeRobot + ntfy |
| **Errores runtime** | Excepciones cliente/servidor | Sentry |
| **Errores de producto (opcional)** | Error tracking con contexto de producto | PostHog Error Tracking |
| **Métricas de negocio** | Votos, scores, guilds, contadores | Supabase (tables `ciszu.counters`, `scores`, `bot_status`) |

### 1.2 Regla de oro

> **No pises**: cada herramienta tiene UN ámbito. Si dos herramientas miden lo mismo,
> se elige una y la otra se desactiva. Ver tabla anti-solapamiento en §4.

---

## 2. Herramienta nº1 — Cloudflare Web Analytics (tráfico)

- **Qué mide**: pageviews, sesiones, referrers, países, top pages. Beacon estático ~1KB.
- **Estado**: ✅ Activo en las 4 webs (10 ago 2026). Site único, token `2fcf0eab...`.
- **Integración**: script beacon en los 4 layouts (`<script defer src=...>`), sin deps npm.
- **Privacidad**: sin cookies, sin PII, GDPR-friendly.
- **Por qué esta y no otra**: gratis sin tarjeta, 0 impacto CWV, ya cubre el "¿cuánto tráfico tengo?".
- **No mide**: comportamiento de usuario (funnels), errores, sesiones grabadas.

## 3. Herramienta nº2 — PostHog (producto y comportamiento)

**PostHog Cloud free tier** es el motor de **product analytics** del sistema. NO sustituye a
Cloudflare Web Analytics: son complementarios.

### 3.1 Por qué PostHog en el sistema

1. Las webs son **productos**, no blogs: MuzicMania (login/scores/descargas), ciszubot (dashboard OAuth).
2. Embudos tipo registro→login→score, no solo contadores.
3. Gratis **sin tarjeta** (verificado en posthog.com/pricing, 10 ago 2026: "No credit card required").
4. Encaja sin pisar lo ya activo (regla anti-solapamiento, §4).

### 3.2 Free tier mensual (verificado 10 ago 2026)

| Producto | Free tier |
|---|---|
| Product Analytics (eventos, embudos, retención, cohortes, paths, SQL) | 1.000.000 eventos |
| Session Replay (con masking) | 5.000 grabaciones |
| Feature Flags (rollouts, segmentos) | 1.000.000 requests |
| Error Tracking | 100.000 excepciones |
| Surveys | 1.500 respuestas |
| Logs | 10 GB |
| PostHog AI | 500 créditos |

- 1 proyecto (las 4 webs se separan con la propiedad `app`), retención 1 año, miembros ilimitados.
- Si se supera un límite **sin tarjeta**: PostHog **deja de ingestar** ese producto hasta el
  siguiente mes (no corta, no cobra).

### 3.3 Implementación (código entregado 10 ago 2026)

- `packages/ui/src/PostHogAnalytics.tsx` — client component sin deps npm (patrón CloudflareGuard).
  Carga `array.js` y usa la API global `window.posthog`.
- Init: `capture_pageview: false` + trackeo manual `$pageview` (usePathname + useSearchParams)
  porque App Router no recarga en navegación SPA.
- **Fix 11 ago 2026**: `capture_pageleave: true` (bounce rate/session duration exactos) +
  `capture_performance: { web_vitals: true, network_timing: false }` (`$web_vitals` LCP/CLS/FCP/INP).
- Prop `app` (nombre corto de la web) en cada evento → separa las 4 webs en el único proyecto free.
- Exporta `captureEvent(event, properties)` para eventos custom (fase 2).
- Envuelto en `<Suspense>` (requisito Next 15 para `useSearchParams` en prerender estático).
- Degradación segura: sin `NEXT_PUBLIC_POSTHOG_KEY` no carga nada (no rompe producción).

### 3.4 Tests

- `packages/ui/tests/PostHogAnalytics.test.tsx` — 7 tests (degradación, carga array.js, init
  flags, `$pageview` con app+path, `captureEvent`). Suite UI 30/30 OK, completa 121/121 OK.

### 3.5 Eventos a capturar

| Fase | Eventos |
|---|---|
| 1 (auto) | `$pageview` en cada navegación con `{ app, path }` |
| 2 (custom) | muzicmania: `sign_up`, `login`, `logout`, `submit_score`, `play_session_start/end`, `download_launcher`, `like_track`, `create_level` · ciszubot: `invite_click`, `dashboard_login`, `guild_config_save`, `vote` · ciszukoantony: `contact_form_submit`, `social_click`, `download_media` · ciszunetwork: `ecosystem_click`, `contact_submit`, `nav_click` |
| 3 (features) | `identify` con `user_id` de Supabase (MuzicMania auth) · Feature flags (beta/debug) · Error Tracking SDK |

### 3.6 Costos PostHog

- **Corto plazo: $0/mes indefinidamente** (tráfico actual = decenas de miles de eventos/mes vs 1M free).
- Tarifas públicas tras el free tier: eventos sin props custom $0.00005 · **con props custom
  ⚠️ $0.000248 (~5x) — limitar props custom** · replay ~$0.0001/min · errores $0.00035/evento.
- Billing limits configurables por producto (nunca factura sorpresa).
- ⚠️ **Gotcha**: eventos CON propiedades custom cuestan ~5x — acotar `properties` en `captureEvent`.

---

## 4. Tabla anti-solapamiento — quién mide qué (OBLIGATORIA)

| Herramienta | Responsabilidad (ÚNICA) | Estado |
|---|---|---|
| **Cloudflare Web Analytics** | Tráfico/marketing: pageviews, referrers, países. Beacon ~1KB | ✅ Activo (4 webs, token `2fcf0eab...`) |
| **Vercel Speed Insights** | Core Web Vitals reales (LCP/CLS/INP) | ✅ Activo (solo MuzicMania) |
| **UptimeRobot** | Disponibilidad 24/7 (5 monitores) + alertas email/push + watcher ntfy | ✅ Activo |
| **PostHog Product Analytics** | Eventos de producto, embudos, retención, session replay, feature flags | ✅ Implementado (activo 11 ago 2026) |
| **PostHog Error Tracking** | Errores con contexto de producto (alternativa a Sentry, NO ambos a la vez) | Fase 2 |
| **Sentry** | Errores runtime ×4 webs + bot (free tier, 5k errores/mes) | ✅ Activo |
| **ntfy** | Notificaciones push (alarmas UptimeRobot, avisos de tareas/errores) | ✅ Activo |

### Reglas anti-solapamiento (obligatorias)

1. **NO activar el "Web Analytics" de PostHog** (`capture_pageview: false`): duplicaría Cloudflare.
   PostHog solo recibe `$pageview` como evento de producto con `app` + `path`.
2. **NO correr Sentry + PostHog Error Tracking a la vez**: misma ingestión duplicada del mismo error.
3. **UptimeRobot se queda como está**: mide disponibilidad, no comportamiento.
4. **Session replay**: solo en páginas de producto (MuzicMania play/dashboard), nunca con datos
   sensibles; PostHog enmascara inputs por defecto.
5. **Script PostHog pesado (~68KB)**: `async` y solo cuando `NEXT_PUBLIC_POSTHOG_KEY` existe;
   Cloudflare (1KB) sigue siendo la capa de tráfico con 0 impacto.

---

## 5. Herramienta nº3 — Vercel Speed Insights (CWV)

- **Qué mide**: Core Web Vitals reales de usuarios (LCP, CLS, INP, FCP, TTFB).
- **Estado**: ✅ Activo solo en MuzicMania.
- **Por qué**: datos de rendimiento real de campo (campo RUM) vs lab (Lighthouse).
- **Ampliar**: activar en las otras 3 webs si se requiere medición de CWV en todas.
- **Complementa**: `MEDIA_FORMATS_SYSTEM.md` (avif/webp/opus) y `CACHING_SYSTEM.md` reducen estos números.

## 6. Herramienta nº4 — UptimeRobot + ntfy (disponibilidad)

- **UptimeRobot**: 5 monitores KEYWORD UP (ciszunetwork, ciszukoantony, muzicmania, ciszubot,
  supabase-bot-status). Cuenta `fplayersoffcial@gmail.com`. API v3.
- **ntfy.sh**: topic público `ciszu-1a41fa89...`, watcher `scripts/uptime-watch.js` cada 5 min
  (cron GH Actions) → notifica cambios de estado por push móvil.
- **Heartbeat del bot**: cada 60s → `ciszubot.bot_status` (online/last_seen/version/guilds).
- Configuración detallada: `MONITORING_SYSTEM.md`.

## 7. Herramienta nº5 — Sentry (errores runtime)

- **Qué mide**: excepciones de cliente y servidor en las 4 webs + bot.
- **Estado**: ✅ Activo. Free tier: error monitoring + tracing (5k errores/mes).
- **Integración**: SDK en las 4 webs (`sentry.io/organizations/ciszu-network`).
- **Alternativa futura**: PostHog Error Tracking (100k/mes free) — decidir en Fase 2 si se
  sustituye Sentry para unificar producto+errores en PostHog.
- Detalles: `ERRORS_SYSTEM.md`.

## 8. Métricas de negocio (Supabase)

| Métrica | Tabla | Frecuencia |
|---|---|---|
| Votos del bot (top.gg / discordbotlist) | `ciszu.counters` | cada 30 min (auto-post) |
| Récords/scores de MuzicMania | `muzicmania.scores` | por partida |
| Crecimiento de servidores del bot | `ciszubot.bot_status.guilds` | heartbeat 60s |
| Comandos del bot | `ciszubot.command_logs` | por comando |
| Caché/counters | `ciszu.cache` | tiempo real |

- Se consultan vía SQL (`dbvr sql -ds=supabase`) o RPC. Ver `DB_SYSTEM.md`.
- Estas métricas alimentan `STATISTICS_SYSTEM.md` (cifras verificables) y dashboards.

---

## 9. Implementación y activación (registro cronológico)

1. ✅ **10 ago 2026** — Cuenta PostHog creada (gratis, sin tarjeta), proyecto "Ciszu Network"
   (id `550383`, org `019fe9e4-ca36-0000-c909-958aa3caa3cd`).
2. ✅ **10 ago 2026** — Project API Key `phc_...` verificada con capture de prueba aceptado;
   Personal API Key (`phx_`) verificada contra API de proyectos.
3. ✅ **10 ago 2026** — Envs `.env.local` (×4) + Vercel (production+preview+development, ×4)
   con `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`.
4. ✅ **10 ago 2026** — Authorized URLs (4 dominios) vía `PATCH /api/projects/550383/` con
   `app_urls` (⚠️ `authorized_uris` NO existe en la API; update de proyecto NO acepta `phs_`,
   solo `phx_`).
5. ✅ **11 ago 2026** — Deploy → `$pageview` fluyendo. Fix `capture_pageleave` y
   `capture_performance.web_vitals`.
6. ⚠️ **Reverse proxy** — NO es un fallo: mejora la precisión con ad-blockers. Sin dominio
   propio: Cloudflare Worker en `*.workers.dev` (`tools/posthog-proxy/worker.js`). Pendiente.
7. ✅ **Secret API Key (`phs_`)** — rotada por el usuario 10 ago 2026, guardada en vault
   `POSTHOG_SECRET_API_KEY`. Solo válida para endpoints que la aceptan (no `/api/projects/*`).

### Installation Health (10 ago 2026)

- ✅ `$pageview` fluyendo (deploy 11 ago 2026) · ✅ `$pageleave` (fix 11 ago) · ✅ Scroll depth
- ✅ `$web_vitals` (fix 11 ago) · ✅ Authorized URLs · ⚠️ Reverse proxy (opcional, worker listo)

---

## 10. Privacidad del sistema

- **Sin PII por diseño**: `distinct_id` anónimo por defecto; no enviar emails/nombres como
  propiedades (solo `user_id` internos si aplica).
- **Session replay** con masking de inputs por defecto; no grabar páginas sensibles.
- **Cookieless opcional** (`persistence: 'memory'`) si se requiere; hoy `localStorage+cookie`
  (mismo host).
- **Data pipeline EU** (eu.i.posthog.com) disponible si se necesita residencia europea.
- Cloudflare Web Analytics: sin cookies. UptimeRobot: solo estados. ntfy: topic público sin PII.

---

## 11. Comparativa de alternativas (2026)

| | PostHog | Plausible | Umami | Fathom | Matomo | Mixpanel | Clarity (MS) |
|---|---|---|---|---|---|---|---|
| Free tier | ✅ 1M ev/mes, sin tarjeta | ❌ $9/mo | ✅ 100k cloud / self-host | ❌ $15/mo | ✅ self-host | ✅ 1M ev/mes | ✅ ilimitado |
| Session replay | ✅ | ❌ | ❌ | ❌ | plugin pago | ❌ | ✅ |
| Feature flags | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Error tracking | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Embudos/retención | ✅ | solo goals | básico | ❌ | ✅ | ✅ | ❌ |
| Script | ~68KB | 2.5KB | ~2KB | 2.1KB | pesado | pesado | ~50KB |
| Self-host | pesado (4vCPU/16GB) | ligero | ligero | abandonado | ligero | ❌ | ❌ |

**Conclusión**: PostHog es el único gratis-sin-tarjeta que cubre analítica + errores + replay +
flags en una herramienta. El **sistema global** resultante es: **Cloudflare (tráfico) +
PostHog (producto) + Sentry (errores) + Vercel SI (CWV) + UptimeRobot (uptime) + Supabase
(negocio) — sin VPS, sin tarjeta, $0.**

---

## 12. Checklist de operación

- [ ] Revisar `$pageview` en PostHog tras cada deploy.
- [ ] No activar el Web Analytics de PostHog ni Sentry+PH Error Tracking a la vez.
- [ ] Acotar `properties` en `captureEvent` (props custom = ~5x costo).
- [ ] Sesión replay solo en páginas de producto.
- [ ] Actualizar `STATISTICS_SYSTEM.md` con cifras reales cuando haya histórico.
- [ ] Evaluar reverse proxy (Worker) cuando el tráfico/privacidad lo exija.

_Última revisión: 13 ago 2026._ Relacionado: `CLOUDFLARE_SYSTEM` → `CDN_SYSTEM.md`,
`MONITORING_SYSTEM.md`, `ERRORS_SYSTEM.md`, `CACHING_SYSTEM.md`, `STATISTICS_SYSTEM.md`.
