# Sistema Cloudflare de Ciszu Network

**Documento de plan maestro — investigado: 10 ago 2026** (límites verificados contra docs
oficiales de Cloudflare, jul-ago 2026). Define qué herramientas de Cloudflare usamos, cuáles
implementaremos (gratis primero, pago a futuro) y cuáles descartamos por sobreingeniería.

> **Política de implementación** (regla del proyecto):
> 1. **Gratis primero, pago a futuro.** Nada de pago hasta que el servicio gratis demuestre
>    necesidad real (tráfico, límites alcanzados).
> 2. **Las "capas extras" NO se consideran opcionales** salvo que **pisen con otro sistema**:
>    si una capa Cloudflare no daña nada y es gratis, se implementa. Solo se descarta cuando
>    duplica una solución ya activa (p.ej. rate limiting en código ya existente).
> 3. Sin dominio propio aún: solo aplican las herramientas **standalone** (ver §2).

---

## 1. Concepto clave — 2 capas de Cloudflare

| Capa | Cómo funciona | ¿Funciona HOY sin dominio propio? |
| --- | --- | --- |
| **Nivel DNS/proxy** (WAF, DDoS, CDN, SSL, Email Routing, Uptime, rate limiting edge) | El tráfico pasa por la red de Cloudflare (proxy "naranja") — se configura en el dashboard | ❌ **NO** — requiere un dominio propio proxeado |
| **Standalone** (Turnstile, Web Analytics, R2, Workers, Pages) | API/script/SDK independientes, no necesitan proxy | ✅ **SÍ** — funcionan en `*.vercel.app` |

**Consecuencia práctica**: hoy (todo en `*.vercel.app`) podemos usar Turnstile, Web Analytics
y R2. Cuando compremos dominios (ver `DOMINIOS_SISTEMA.md`) y los proxeemos por Cloudflare,
se desbloquea de golpe la capa de protección completa.

## 2. Estado actual — qué está implementado y dónde (10 ago 2026)

| Servicio | MuzicMania | CiszuNetwork | CiszukoAntony | CiszuBot web | Bot Discord | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| **Turnstile** (guard de acceso) | ✅ `CloudflareGuard.tsx` + `/api/verify-turnstile` | ✅ | ✅ | ✅ | — | **IMPLEMENTADO 10 ago 2026 en las 4 webs** — MuzicMania con su componente propio; las otras 3 usan `CloudflareGuard` compartido de `packages/ui` (widget **GLOBAL** único, 1 par de keys para los 4 dominios) |
| **Challenge web** (proxy CF a nivel red) | ✅ (blocking challenge en el dominio) | ❌ | ❌ | ❌ | — | Solo MuzicMania (activado en dashboard CF sobre muzicmania.vercel.app) |
| **R2** | ⚠️ configurado como *fallback* del CDN | idem | idem | idem | — | **INACTIVO — BLOQUEADO**: Cloudflare exige **tarjeta** para activar R2 aunque sea gratis → descartado hasta tener tarjeta (`asset-config.json` → `providers.fallback: cloudflare-r2`) |
| **Web Analytics** | ✅ | ✅ | ✅ | ✅ | — | **IMPLEMENTADO 10 ago 2026**: beacon en los 4 layouts (token `2fcf0eab...`, 1 solo site cubre las 4 webs) |
| **Email Routing** | — | — | — | — | — | No aplica aún (requiere dominio) |
| **Rate limiting** | ✅ propio en `packages/utils` (`createRateLimiter`) + bot `statsServer` | — | — | — | ✅ `/api/votes` 10/h | En código, no de Cloudflare |
| **Uptime** | ⚠️ vía web del bot (heartbeat Supabase) | — | — | — | ✅ heartbeat 60s → `ciszubot.bot_status` | Sistema propio, funciona |

**⚠️ Hallazgo de seguridad (Turnstile)**: las claves de **MuzicMania** están **hardcodeadas como
fallback** en el código además de en `.env.local`:
- `projects/muzicmania/website/src/components/layout/CloudflareGuard.tsx:149` — siteKey (pública, poco riesgo)
- `projects/muzicmania/website/src/app/api/verify-turnstile/route.ts:11` — **secretKey (¡está en git!)** — pendiente: rotar el widget en el dashboard y quitar el fallback (lanzar error si falta la env var).
- Las 3 webs nuevas **NO tienen fallback** (error 500 claro si falta la env var) — solo queda sanear MuzicMania.

## 3. Inventario de servicios Cloudflare — gratis, necesidad y prioridad

Límites verificados (jul-ago 2026, docs oficiales):

| Servicio | Gratis | Límites free | ¿Necesario? | Cuándo | Alternativa |
| --- | --- | --- | --- | --- | --- |
| **Turnstile** (CAPTCHA invisible) | ✅ ilimitado | — | ✅ **SÍ** | **Implementar en las 4 webs** (por app) | hCaptcha, reCAPTCHA |
| **Web Analytics** (privacidad, sin cookies) | ✅ ilimitado | — | ✅ **SÍ — nº 1** | **Implementar YA** (beacon JS, funciona sin dominio) | PostHog (1M eventos/mes), Vercel Analytics, Umami |
| **DNS + proxy (CDN/DDoS/WAF básico/SSL)** | ✅ | DDoS ilimitado; WAF solo reglas gestionadas; 3 Page Rules | ✅ **SÍ** | **Con dominio propio** (§4 Fase B) | Vercel (ya tiene CDN propio), CloudFront |
| **R2** (storage S3) | ✅ | 10 GB-mes, 1M ops Clase A, 10M Clase B, **egress $0** | ✅ **SÍ (futuro CDN)** | Cuando Supabase estrangule (hoy 1 GB cuota, ya topamos) | Supabase Storage (actual), Cloudflare R2 |
| **Email Routing** (recibir) | ✅ **ilimitado** | 200 reglas/dominio, 200 destinos/cuenta, 25 MiB | ✅ **SÍ** | Con dominio (cubre toDo de emails para RECIBIR) | Zoho Mail (5 cuentas gratis), forwarding de Porkbun |
| **Uptime / Health checks** | ✅ | app del dashboard (verificar límites al activar) | ⚠️ **Sí si no pisa** | Con dominio, o UptimeRobot ya mismo (50 checks/5 min gratis) | UptimeRobot, BetterStack |
| **Rate limiting (edge)** | ✅ | 4 reglas / ~10k req-mes (free, verificar dashboard) | ⚠️ **Opcional — PISA con sistema propio** | Con dominio, solo si el rate en código no basta | `packages/utils/createRateLimiter` (**ya implementado**) |
| **Workers + Cron** | ✅ | 100k req/día, 10 ms CPU, 5 cron/account, 100 Workers, 64 env vars | ⚠️ **Opcional** | Solo si hace falta serverless propio (hoy Vercel cubre) | Vercel Functions, Supabase Edge Functions |
| **Workers KV** | ✅ | ~100k reads/día, 1k writes/día | ⚠️ Opcional | Ya hay caché multi-tienda (`packages/utils` → Vercel KV/Postgres) | **Vercel KV (ya planificado)** |
| **Tunnel** (exponer local) | ✅ | ilimitado | ❌ Sobreingeniería | — | Tailscale (**ya activo** para control remoto) |
| **Pages** (hosting estático) | ✅ | 500 builds/mes, estáticos ilimitados | ❌ Sobreingeniería | — | Vercel (**ya activo**, 4 apps) |
| **Vectorize** (BD vectorial) | ✅ | ~5M vectores | ❌ Sobreingeniería | Solo si MuzicMania usa IA (toDo Pinecone) | Pinecone, pgvector (Supabase) |
| **Workers AI** (inferencia) | ✅ | ~10k neuronas/día | ❌ Sobreingeniería | — | Gemini API (**ya usado** en voz/art) |
| **D1 / Queues / Durable Objects** | ✅ (límites bajos) | — | ❌ Sobreingeniería | — | Supabase Postgres (ya), Vercel |
| **Access / Zero Trust** | ✅ (50 users) | — | ❌ Sobreingeniería (1 persona) | — | Tailscale |
| **Imágenes / Stream** (media) | ❌ pago | — | ❌ | — | CDN actual (Supabase + avif/webp) |
| **Argo / Load Balancing / Bot Management avanzado / Cache Reserve** | ❌ pago | — | ❌ | — | — |
| **Email Sending** (enviar) | ❌ (solo Workers Paid, 3k/mes) | — | ❌ pago → alternativa gratis | Fase C | **Resend** (100/día gratis), Zoho, SendGrid |

## 4. Plan de implementación por fases

### Fase A — HOY (sin dominio, todo gratis, standalone)

1. ✅ **Web Analytics en las 4 webs** — site creado en dashboard CF, beacon script en los 4
   layouts (token `2fcf0eab...`, un solo site cubre las 4 webs). **HECHO 10 ago 2026**.
2. ✅ **Turnstile en las 4 webs** — decidido: **widget GLOBAL único** (1 par de keys, 4
   hostnames permitidos). MuzicMania con su componente propio; las otras 3 usan
   `CloudflareGuard` compartido (`packages/ui/src/CloudflareGuard.tsx`, sin deps npm, CSS
   inline, sessionStorage por app) + `/api/verify-turnstile` por app **sin fallbacks**.
   Envs en `.env.local` (×4) y Vercel (production+preview+development vía API) — **HECHO 10 ago 2026**.
3. ⚠️ **Fix seguridad Turnstile (pendiente)**: rotar el widget de MuzicMania (nuevas keys en
   dashboard) y **eliminar los fallbacks hardcodeados** de `CloudflareGuard.tsx:149` y
   `route.ts:11` (error si falta env var). Actualizar envs Vercel de MuzicMania (production).
   Decisión usuario: las keys **NO se rotan aún** (se mantienen mientras el repo sea privado;
   se rotarán cuando GitHub sea público).
4. ❌ **R2**: **BLOQUEADO — Cloudflare exige tarjeta de crédito** para activar R2 aunque sea
   gratis. El usuario no tiene tarjeta → descartado (mantener Supabase Storage como CDN
   activo; `asset-config.json` fallback R2 se queda tal cual).
5. **Uptime**: evaluar UptimeRobot (gratis, sin dominio) para las 4 webs + bot — solo si
   aporta algo al heartbeat de `ciszubot.bot_status` que ya tenemos.

### Fase B — Con dominio propio (todo gratis, desbloqueado por el proxy)

1. Dominios en **Porkbun (PayPal)** o Cloudflare Registrar (tarjeta) — ver `DOMINIOS_SISTEMA.md`.
2. Mover nameservers a **Cloudflare** (gratis) y proxear (naranja) los 4 dominios:
   - DDoS ilimitado + WAF gestionado + SSL universal automáticos.
   - **Email Routing**: `hola@ciszunetwork.com` → Gmail (gratis, ilimitado).
   - **Rate limiting edge** (4 reglas) si el rate en código se queda corto.
   - **Uptime** del dashboard para las 4 webs.
3. Web Analytics ya funcionará con los dominios propios sin tocar el beacon.

### Fase C — Pago futuro (solo cuando haya necesidad real probada)

| Qué | Cuándo pagar | Coste |
| --- | --- | --- |
| R2 más de 10 GB | CDN supere 10 GB (hoy Supabase tiene 1 GB y ya topamos — R2 es el destino) | $0.015/GB-mes + ops |
| Workers Paid | Necesitemos cron/edge serverless propio | $5/mes |
| Email sending | Volumen real de emails transaccionales | Resend gratis 100/día; después ~$20/mes |
| Cloudflare Pro ($20/mes) | Solo si necesitamos WAF custom/Imágenes — **hoy NO** | $20/mes |
| Zoho Mail free (5 cuentas) | Alternativa sin tarjeta al email corporativo | $0 |

## 5. Decisiones pendientes (blockers)

- [x] ¿Turnstile: widget por app (4) o uno compartido con 4 hostnames permitidos? → **DECIDIDO (10 ago 2026): widget GLOBAL único** (el de MuzicMania renombrado, 4 hostnames permitidos, 1 par de keys). El usuario lo creó/editó en el dashboard.
- [x] ¿Web Analytics: beacon script clásico o `@cloudflare/web-analytics` SDK? → **beacon script** (1 línea, sin deps npm) — HECHO.
- [x] ¿Mantener Supabase como CDN activo y R2 solo fallback? → **Sí por ahora** (R2 bloqueado sin tarjeta).
- [ ] ¿Rotar el widget de Turnstile de MuzicMania? → **DECIDIDO: NO rotar aún** (repo privado; se rotará cuando GitHub sea público). Queda pendiente eliminar el fallback del secret de `route.ts:11` al rotar.

## 6. Lo que necesito del usuario (dashboard, no automatizable sin tokens)

**Estado 10 ago 2026 — casi todo entregado por el usuario:**

1. ✅ **Web Analytics** — site creado, token del beacon entregado (`2fcf0eab...`), beacon en los 4 layouts.
2. ✅ **Widget de Turnstile GLOBAL** — el usuario renombró el de MuzicMania y añadió los 4 dominios (`ciszunetwork.vercel.app`, `ciszukoantony.vercel.app`, `muzicmania.vercel.app`, `ciszubot.vercel.app`). Un solo par de keys (site + secret) compartido por las 4 webs — **valores solo en `.env.local` de cada app + Vercel (no repetir aquí)**.
3. ⏳ **Rotar el widget de MuzicMania**: **aplazado por decisión del usuario** (repo privado por ahora). Al rotar: regenerar el secret en el dashboard → actualizar `.env.local` + Vercel de las 4 apps → **eliminar los fallbacks hardcodeados** de `CloudflareGuard.tsx:149` y `route.ts:11` de MuzicMania.
4. ❌ **R2**: descartado — Cloudflare pide tarjeta para activarlo (incluso gratis). Cuando haya tarjeta: crear API token R2 y bucket `ciszu-cdn-r2`.
5. ✅ **API token de Cloudflare** — el usuario ya lo editó/renombró con permisos ampliados (para automatización futura; guardar en `services/supabase/.env` cuando se use).

> Sin dominio propio NO se puede automatizar nada más vía API que afecte DNS/WAF — esa capa
> espera a la Fase B (comprar dominios).

## 7. Checklist de activación (Fase A)

- [x] Cuenta Cloudflare creada (gratis, sin tarjeta)
- [x] Web Analytics: site creado + beacon en los 4 layouts
- [x] Turnstile: widget global + keys en `.env.local` (×4) + Vercel (3 proyectos vía API)
- [x] CloudflareGuard compartido (`packages/ui`) en las 3 webs + `/api/verify-turnstile` por app (sin fallbacks)
- [ ] Fallbacks hardcodeados eliminados de MuzicMania (al rotar las keys — aplazado, repo privado)
- [x] Envs Vercel actualizadas (production + preview + development) + `.env.local`
- [ ] R2: BLOQUEADO (requiere tarjeta) — bucket de prueba cuando haya tarjeta
- [x] Actualizar AGENTS.md y este documento con fechas reales

## 8. Referencias y fuentes (verificadas 10 ago 2026)

- Cloudflare Pricing: cloudflare.com/plans — R2: developers.cloudflare.com/r2/pricing
  (free 10 GB, egress $0) · Workers: developers.cloudflare.com/workers/platform/pricing
  (free 100k req/día) · Limits: developers.cloudflare.com/workers/platform/limits
  (5 cron triggers free) · Email Routing: developers.cloudflare.com/email-routing/limits
  (inbound ilimitado, 200 reglas/dominio) · Email Service: developers.cloudflare.com/email-service/platform/pricing
  (sending solo Workers Paid 3k/mes) · Pages free: 500 builds/mes (dev.to, ago 2026).
- Internas: `DOMINIOS_SISTEMA.md` (dominios), `asset-config.json` (fallback R2),
  `AGENTS.md` (CDN strategy, caché multi-tienda), `toDo.md` (emails/analítica/uptime).

## 9. Archivos relacionados

- `DOMINIOS_SISTEMA.md` — cuándo y dónde comprar los dominios (Porkbun/Cloudflare).
- `projects/muzicmania/website/src/components/layout/CloudflareGuard.tsx` — patrón Turnstile actual.
- `projects/muzicmania/website/src/app/api/verify-turnstile/route.ts` — patrón de verificación.
- `asset-config.json` — `providers.fallback: cloudflare-r2` (R2 como fallback del CDN).
