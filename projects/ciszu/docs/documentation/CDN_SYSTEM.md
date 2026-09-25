# CDN_SYSTEM — Sistema de CDN y Cloudflare (Ciszu Network)

Versión: 2.0.1
Actualización: 2026-08-17
Identificador: CDN_SYSTEM_V2.0.1_2026_08_17_ciszunetwork

> **Definición**: este documento define el **sistema completo de distribución de contenido**
> de Ciszu Network: nuestro CDN propio (Supabase Storage `ciszu-cdn` + resolver
> `@ciszunetwork/cdn`) **y** los servicios de Cloudflare que lo protegen y potencian
> (Web Analytics, Turnstile, DNS/proxy, R2, Workers...). Sustituye a `CDN_MIGRATIONS` y
> `CLOUDFLARE_SYSTEM` (fusionados el 13 ago 2026).

---

## 1. Arquitectura general del sistema de contenido

```
                    ┌────────────────────────────────────────────────────┐
                    │           SISTEMA CDN CISZU NETWORK               │
                    └────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────────┐
        ▼                           ▼                               ▼
  CDN PROPIO                  RESOLVER                       CLOUDFLARE
  Supabase Storage           @ciszunetwork/cdn               (capa externa)
  bucket ciszu-cdn           assetResolver.resolve()         ├─ Turnstile (guard)
  - 7.353 objetos            resolveIcon()                   ├─ Web Analytics (beacon)
  - 160.6 MB (16% cuota)     deliveryVariants()              ├─ DNS/proxy (futuro)
  - avif/webp/opus           cache edge (Supabase)           ├─ R2 (fallback, bloqueado)
                                                             ├─ Workers (opcional)
                                                             └─ Email Routing (futuro)
```

**Política de implementación** (regla del proyecto):
1. **Gratis primero, pago a futuro.** Nada de pago hasta que el servicio gratis demuestre
   necesidad real (tráfico, límites alcanzados).
2. **Las "capas extras" NO se consideran opcionales** salvo que **pisen con otro sistema**:
   si una capa no daña nada y es gratis, se implementa. Solo se descarta cuando duplica una
   solución ya activa (p.ej. rate limiting en código ya existente).
3. Sin dominio propio aún: solo aplican las herramientas **standalone** de Cloudflare (§3).

---

## 2. CDN PROPIO — Supabase Storage (`ciszu-cdn`)

### 2.1 Historia y problema original

El repo contenía (o referenciaba) assets multimedia pesados: GIFs, videos (MP4/WEBM),
imágenes grandes (PNG/JPG), música (MP3/OGG/WAV) e instaladores EXE (MuzicMania).
Aunque `.gitignore` excluía la mayoría, el código usaba rutas locales (`public/`,
`content/`), lo que impedía servir assets optimizados, mantener el repo liviano,
sincronizar assets entre versiones y escalar la distribución.

### 2.2 Solución: Supabase Storage como CDN

| Aspecto | Valor |
|---|---|
| Bucket | `ciszu-cdn` (en proyecto `obwzzmbvkrcscqwptlqo`) |
| Estado | ✅ Activo — 7.353 objetos / 160.6 MB (10 ago 2026) |
| Cuota Free | 1 GB — usada ~16% |
| Bucket legacy | `ciszu-assets` (1.44 GB) ELIMINADO 10 ago 2026 |
| Coste | Incluido en plan Supabase |
| Cache | Edge de Supabase |
| Fallback | `asset-config.json` → `providers.fallback: cloudflare-r2` (inactivo, ver §3) |

**Ventajas**: URLs públicas desde cualquier proyecto, integración directa con el resolver,
cache edge automático, sin límite de ancho de banda significativo para nuestro volumen.

### 2.3 Resolver — `@ciszunetwork/cdn` (packages/cdn)

```ts
resolveIcon(name, style, format)      // → URL de icono SVG
assetResolver.resolve(path)           // → URL de cualquier asset (CDN-first)
deliveryVariants(asset)               // → variantes avif/webp/opus
```

- **Estrategia de resolución**: CDN → local → oculto (con fallbacks en cascada).
- **Dev local offline (17 ago 2026)**: cada web tiene `NEXT_PUBLIC_CDN_URL=http://localhost:8788`
  en `.env.local` (gitignored); el puerto 8788 lo sirve `scripts/serve-cdn.js`, un servidor
  estático sin deps que **espeja la raíz del monorepo** (rutas 1:1 como Supabase Storage).
  Así logos/medios se cargan del disco sin internet. La consola dev lo arranca al encender
  webs y lo detiene al salir (`pnpm cdn:serve` para manual). Sin servidor, los assets 404.
- **Fallback offline histórico ELIMINADO (11 ago 2026)**: `copy-assets.js` borrado; en dev sin
  `NEXT_PUBLIC_CDN_URL` el resolver devuelve rutas locales relativas (que solo sirven si existen
  en `public/`, p. ej. `shared/icons` copiados).
- Los assets se sirven vía resolver/CDN sin mirrors en `public/`.

### 2.4 Inventario de assets por proyecto

| Proyecto | Rutas |
|---|---|
| **CiszuNetwork** (`projects/ciszu/website`) | `public/images/` (banners, fondos, logos) · `public/icons/` · `public/logos/` |
| **Ciszuko Antony** (`projects/ciszukoantony/website`) | `public/images/` (perfil, proyectos, galería) · `public/logos/` |
| **MuzicMania** (`projects/muzicmania`) | `content/music/` (genesis_neon) · `content/logos/` · `content/arrowskins/` (384 SVGs) · `content/particleskins/` · `public/downloads/` (EXE v2.0.1) · `public/images/` · `public/fonts/` |
| **CiszuBot** (`projects/ciszubot`) | `website/public/images/` · `website/public/icons/` |
| **CiszuGamens** (`ciszugamens/`) | Multimedia de comunidad — pendiente de crear |

### 2.5 Operación del CDN (comandos)

```bash
pnpm cdn:upload        # Sube a Supabase Storage (ciszu-cdn), espeja el repo
pnpm cdn:verify        # Revisa mimetypes (check-cdn-mimes.js) — 0 malos en 9.055 obj (8 ago 2026)
node scripts/upload-cdn.js --prune     # Borra del bucket lo que no existe localmente
node scripts/fix-cdn-mimes.js          # Re-subir solo objetos con mimetype malo
node scripts/delete-storage-bucket.js  # Borrado masivo PROTEGIDO (dry-run primero)
```

### 2.6 Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Supabase Storage caído | No hay fallback offline desde 11 ago 2026; en dev sin CDN_URL el resolver usa rutas locales |
| URLs de CDN cambian | `assetResolver.resolve()` abstrae la URL — solo cambiar en un lugar |
| Ancho de banda excedido | Bucket 50 MB de límite → monitorear uso; R2 es el destino futuro (egress $0) |

### 2.7 Formato de media (sistema de formatos)

- avif/webp (imágenes) + opus (audio) — `deliveryVariants()`. Ver `MEDIA_FORMATS_SYSTEM.md`.
- **SmartImage** en las webs (componente que sirve variantes optimizadas).

---

## 3. CLOUDFLARE — servicios y estado (10 ago 2026)

### 3.1 Concepto clave — 2 capas de Cloudflare

| Capa | Cómo funciona | ¿Funciona HOY sin dominio propio? |
|---|---|---|
| **Nivel DNS/proxy** (WAF, DDoS, CDN, SSL, Email Routing, Uptime, rate limiting edge) | El tráfico pasa por la red de Cloudflare (proxy "naranja") — config en dashboard | ❌ **NO** — requiere dominio propio proxeado |
| **Standalone** (Turnstile, Web Analytics, R2, Workers, Pages) | API/script/SDK independientes, no necesitan proxy | ✅ **SÍ** — funcionan en `*.vercel.app` |

**Consecuencia práctica**: hoy (todo en `*.vercel.app`) podemos usar Turnstile, Web Analytics
y R2. Cuando compremos dominios (ver `DOMAINS_SYSTEM.md`) y los proxeemos por Cloudflare,
se desbloquea la capa de protección completa.

### 3.2 Estado actual por servicio (10 ago 2026)

| Servicio | MuzicMania | CiszuNetwork | CiszukoAntony | CiszuBot web | Bot Discord | Estado |
|---|---|---|---|---|---|---|
| **Turnstile** (guard de acceso) | ✅ `CloudflareGuard.tsx` + `/api/verify-turnstile` | ✅ | ✅ | ✅ | — | **IMPLEMENTADO en las 4 webs** (widget GLOBAL único, 1 par de keys, 4 hostnames). MuzicMania wrapper fino (Tauri skip + store sync), migrado 11 ago 2026 desde `@marsidev/react-turnstile` |
| **Challenge web** (proxy CF) | ✅ (blocking challenge) | ❌ | ❌ | ❌ | — | Solo MuzicMania (activado en dashboard sobre muzicmania.vercel.app) |
| **R2** | ⚠️ fallback del CDN | idem | idem | idem | — | **INACTIVO — BLOQUEADO**: Cloudflare exige **tarjeta** para activar R2 (aunque gratis) → descartado hasta tener tarjeta (`asset-config.json` → `providers.fallback: cloudflare-r2`) |
| **Web Analytics** | ✅ | ✅ | ✅ | ✅ | — | **IMPLEMENTADO**: beacon en los 4 layouts (token `2fcf0eab...`, 1 site cubre las 4 webs) |
| **Email Routing** | — | — | — | — | — | No aplica aún (requiere dominio) |
| **Rate limiting** | ✅ propio en `packages/utils` (`createRateLimiter`) | — | — | — | ✅ `/api/votes` 10/h | En código, no de Cloudflare |
| **Uptime** | ⚠️ vía web del bot (heartbeat Supabase) | — | — | — | ✅ heartbeat 60s → `ciszubot.bot_status` | Sistema propio (UptimeRobot) — ver `MONITORING_SYSTEM.md` |

**⚠️ Hallazgo de seguridad (Turnstile)**: las keys de MuzicMania están **hardcodeadas como
fallback** en código además de `.env.local`:
- `projects/muzicmania/website/src/components/layout/CloudflareGuard.tsx:22` — siteKey fallback (pública, poco riesgo)
- `projects/muzicmania/website/src/app/api/verify-turnstile/route.ts:11` — **secretKey (¡en git!)** — pendiente eliminar al rotar
- Las 3 webs nuevas NO tienen fallback (error 500 claro si falta la env var).

**Decisión usuario (12 ago 2026)**: las keys NO se rotan aún (repo privado); se rotarán
cuando GitHub sea público. Al rotar: regenerar secret → actualizar envs ×4 → eliminar fallbacks.

### 3.3 Inventario de servicios Cloudflare — gratis, necesidad y prioridad

Límites verificados (jul-ago 2026, docs oficiales):

| Servicio | Gratis | Límites free | ¿Necesario? | Cuándo | Alternativa |
|---|---|---|---|---|---|
| **Turnstile** (CAPTCHA invisible) | ✅ ilimitado | — | ✅ **SÍ** | **Implementado en las 4 webs** (widget global) | hCaptcha, reCAPTCHA |
| **Web Analytics** | ✅ ilimitado | — | ✅ **SÍ — nº 1** | **Implementado YA** (beacon JS, sin dominio) | PostHog, Vercel Analytics, Umami |
| **DNS + proxy** (CDN/DDoS/WAF básico/SSL) | ✅ | DDoS ilimitado; WAF solo reglas gestionadas; 3 Page Rules | ✅ **SÍ** | **Con dominio propio** (§4 Fase B) | Vercel (CDN propio), CloudFront |
| **R2** (storage S3) | ✅ | 10 GB-mes, 1M ops Clase A, 10M Clase B, **egress $0** | ✅ **SÍ (futuro CDN)** | Cuando Supabase estrangule | Supabase Storage (actual), R2 |
| **Email Routing** (recibir) | ✅ **ilimitado** | 200 reglas/dominio, 200 destinos/cuenta, 25 MiB | ✅ **SÍ** | Con dominio | Zoho Mail (5 gratis), forwarding Porkbun |
| **Uptime / Health checks** | ✅ | app del dashboard | ⚠️ **Sí si no pisa** | Con dominio, o UptimeRobot ya mismo | UptimeRobot, BetterStack |
| **Rate limiting (edge)** | ✅ | 4 reglas / ~10k req-mes | ⚠️ **Opcional — PISA con sistema propio** | Con dominio, solo si el rate en código no basta | `createRateLimiter` (ya implementado) |
| **Workers + Cron** | ✅ | 100k req/día, 10 ms CPU, 5 cron/account, 100 Workers, 64 env vars | ⚠️ **Opcional** | Solo si hace falta serverless propio | Vercel Functions, Supabase Edge Functions |
| **Workers KV** | ✅ | ~100k reads/día, 1k writes/día | ⚠️ Opcional | Ya hay caché multi-tienda | Vercel KV (ya planificado) |
| **Tunnel** (exponer local) | ✅ | ilimitado | ❌ Sobreingeniería | — | Tailscale (**ya activo**) |
| **Pages** (hosting estático) | ✅ | 500 builds/mes | ❌ Sobreingeniería | — | Vercel (**ya activo**) |
| **Vectorize** (BD vectorial) | ✅ | ~5M vectores | ❌ Sobreingeniería | Solo si MuzicMania usa IA | Pinecone, pgvector (Supabase) |
| **Workers AI** (inferencia) | ✅ | ~10k neuronas/día | ❌ Sobreingeniería | — | Gemini API (**ya usado**) |
| **D1 / Queues / Durable Objects** | ✅ (límites bajos) | — | ❌ Sobreingeniería | — | Supabase Postgres (ya), Vercel |
| **Access / Zero Trust** | ✅ (50 users) | — | ❌ Sobreingeniería (1 persona) | — | Tailscale |
| **Imágenes / Stream** (media) | ❌ pago | — | ❌ | — | CDN actual (Supabase + avif/webp) |
| **Argo / Load Balancing / Bot Management avanzado / Cache Reserve** | ❌ pago | — | ❌ | — | — |
| **Email Sending** (enviar) | ❌ (solo Workers Paid, 3k/mes) | — | ❌ pago → alternativa gratis | Fase C | **Resend** (100/día gratis), Zoho, SendGrid |

---

## 4. Plan de implementación por fases

### Fase A — HOY (sin dominio, todo gratis, standalone)

1. ✅ **Web Analytics en las 4 webs** — site creado, beacon en los 4 layouts (token `2fcf0eab...`). **HECHO 10 ago 2026**.
2. ✅ **Turnstile en las 4 webs** — widget **GLOBAL único** (1 par de keys, 4 hostnames permitidos),
   `CloudflareGuard` compartido (`packages/ui/src/CloudflareGuard.tsx`, sin deps npm, CSS inline,
   sessionStorage por app); MuzicMania wrapper fino (Tauri skip + store sync) desde 11 ago 2026
   (migrado desde `@marsidev/react-turnstile`, eliminado). + `/api/verify-turnstile` por app.
   Envs en `.env.local` (×4) y Vercel (production+preview+development vía API). **HECHO 10 ago 2026**.
   - ⚡ **Fix rendimiento SSR (12 ago 2026)**: antes el guard devolvía `null` durante SSR → FCP/LCP
     esperaban a la verificación Turnstile (LCP 10.5s, RES 52). Ahora renderiza siempre `{children}`
     DETRÁS del overlay fijo (z-index 9999, fondo, `inert`+`aria-hidden`): gate cubre y bloquea,
     pero el navegador pinta la página desde el primer byte. Cambios: `packages/ui/src/CloudflareGuard.tsx`,
     `projects/muzicmania/website/src/components/layout/CloudflareGuard.tsx`.
   - ⚡ **Rediseño visual del gate (12 ago 2026, 2º fix)**:
     - **Fondo = la página desenfocada** (`backdrop-filter: blur(14px)` + humo `rgba(2,4,12,0.55)`),
       NO negro sólido → FCP/LCP reales (los children se pintan desde el primer HTML).
     - **Bloqueo total mientras está activo**: `inert` (React 19), `pointer-events:none`,
       `overflow:hidden` + listeners que cancelan `Ctrl+C/X/P/S/F/U/A`, `contextmenu`, `copy`,
       `cut`, `selectstart` (capture phase).
     - **Salida animada**: `leaving` → fundido `opacity→0` (0.6s ease), se sueltan bloqueos, se desmonta.
     - **Siempre por encima** (z-index 9999, `position:fixed inset:0`).
     - **Una vez verificado**: sessionStorage + estado interno evitan re-preguntar.
     - El wrapper de MuzicMania ya no hace gate rápido por store: `onVerified` solo sincroniza
       `setIsCloudflareVerified(true)`. Tests: 11 en `packages/ui/tests/CloudflareGuard.test.tsx`.
       Suite 164/164 OK.
3. ⚠️ **Fix seguridad Turnstile (pendiente)**: rotar widget de MuzicMania y eliminar fallbacks
   hardcodeados de `CloudflareGuard.tsx:149` y `route.ts:11`. **Aplazado por decisión del usuario**
   (repo privado; se rotará cuando GitHub sea público).
4. ❌ **R2**: **BLOQUEADO — exige tarjeta** para activarlo (incluso gratis). Mantener Supabase
   Storage como CDN activo; `asset-config.json` fallback R2 se queda tal cual.
5. ✅ **Uptime**: UptimeRobot (gratis, sin dominio) para las 4 webs + bot + supabase-bot-status.
   Checks exactos en `MONITORING_SYSTEM.md`.

### Fase B — Con dominio propio (todo gratis, desbloqueado por el proxy)

1. Dominios en **Porkbun (PayPal)** o Cloudflare Registrar (tarjeta) — ver `DOMAINS_SYSTEM.md`.
2. Mover nameservers a **Cloudflare** (gratis) y proxear (naranja) los 4 dominios:
   - DDoS ilimitado + WAF gestionado + SSL universal automáticos.
   - **Email Routing**: `hola@ciszunetwork.com` → Gmail (gratis, ilimitado).
   - **Rate limiting edge** (4 reglas) si el rate en código se queda corto.
   - **Uptime** del dashboard para las 4 webs.
3. Web Analytics ya funcionará con los dominios propios sin tocar el beacon.

### Fase C — Pago futuro (solo cuando haya necesidad real probada)

| Qué | Cuándo pagar | Coste |
|---|---|---|
| R2 más de 10 GB | CDN supere 10 GB (Supabase tiene 1 GB y ya topamos — R2 es el destino) | $0.015/GB-mes + ops |
| Workers Paid | Necesitemos cron/edge serverless propio | $5/mes |
| Email sending | Volumen real de emails transaccionales | Resend gratis 100/día; después ~$20/mes |
| Cloudflare Pro ($20/mes) | Solo si necesitamos WAF custom/Imágenes — **hoy NO** | $20/mes |
| Zoho Mail free (5 cuentas) | Alternativa sin tarjeta al email corporativo | $0 |

---

## 5. Integración con Turbomonorepo

La migración a CDN es el primer paso hacia la reestructuración Turbomonorepo:

- Proyectos más livianos y compilación más rápida.
- Build cache de Turborepo más efectivo.
- Configuraciones compartidas centralizadas (TS, Tailwind, ESLint).
- Pipeline CI/CD más liviano.

Pasos: 1. ✅ CDN migration · 2. `packages/config/` · 3. `packages/ui/` (✅ hecho) ·
4. Unificar build pipeline con remote caching · 5. Centralizar esquemas Supabase.

## 6. Centralización de Supabase (futuro)

Unificar esquemas en un proyecto central, migraciones compartidas, RLS unificadas, un solo
conjunto de credenciales.

---

## 7. Decisiones pendientes (blockers)

- [x] ¿Turnstile por app o widget compartido? → **GLOBAL único** (4 hostnames, 1 par de keys). DECIDIDO 10 ago 2026.
- [x] ¿Beacon script o SDK `@cloudflare/web-analytics`? → **beacon script** (1 línea, sin deps). HECHO.
- [x] ¿Supabase CDN activo + R2 solo fallback? → **Sí por ahora** (R2 bloqueado sin tarjeta).
- [ ] ¿Rotar widget Turnstile de MuzicMania? → **DECIDIDO: NO aún** (repo privado); pendiente eliminar fallback de `route.ts:11`.

## 8. Lo que necesita el usuario (dashboard, no automatizable sin tokens)

1. ✅ **Web Analytics** — site + token beacon entregados.
2. ✅ **Widget Turnstile GLOBAL** — creado/renombrado con los 4 dominios (valores solo en `.env.local` + Vercel).
3. ⏳ **Rotar widget MuzicMania** — aplazado (repo privado).
4. ❌ **R2** — descartado sin tarjeta; bucket `ciszu-cdn-r2` cuando haya.
5. ✅ **API token de Cloudflare** — permisos ampliados (automatización futura; guardar en `services/supabase/.env`).

> Sin dominio propio NO se puede automatizar vía API nada que afecte DNS/WAF — esa capa espera a la Fase B.

## 9. Checklist de activación (Fase A)

- [x] Cuenta Cloudflare creada (gratis, sin tarjeta)
- [x] Web Analytics: site + beacon en los 4 layouts
- [x] Turnstile: widget global + keys en `.env.local` (×4) + Vercel (3 proyectos vía API)
- [x] CloudflareGuard compartido (`packages/ui`) en las 4 webs + `/api/verify-turnstile` por app
- [ ] Fallbacks hardcodeados eliminados de MuzicMania (al rotar — aplazado, repo privado)
- [x] Envs Vercel actualizadas (production + preview + development) + `.env.local`
- [ ] R2: BLOQUEADO (requiere tarjeta) — bucket de prueba cuando haya
- [x] CDN propio: bucket `ciszu-cdn` operativo, resolver integrado, legacy `ciszu-assets` eliminado
- [x] Actualizar AGENTS.md y este documento con fechas reales

## 10. Referencias y fuentes (verificadas 10 ago 2026)

- Cloudflare Pricing: cloudflare.com/plans · R2: developers.cloudflare.com/r2/pricing
  (free 10 GB, egress $0) · Workers: developers.cloudflare.com/workers/platform/pricing
  · Limits: developers.cloudflare.com/workers/platform/limits (5 cron free)
  · Email Routing: developers.cloudflare.com/email-routing/limits · Pages free: 500 builds/mes.
- Internas: `DOMAINS_SYSTEM.md` (dominios), `asset-config.json` (fallback R2),
  `MONITORING_SYSTEM.md` (uptime), `MEDIA_FORMATS_SYSTEM.md` (avif/webp/opus),
  `ANALYTICS_SYSTEM.md` (analítica global).

## 11. Archivos relacionados

- `DOMAINS_SYSTEM.md` — cuándo/dónde comprar dominios (Porkbun/Cloudflare).
- `projects/muzicmania/website/src/components/layout/CloudflareGuard.tsx` — wrapper fino del guard.
- `projects/muzicmania/website/src/app/api/verify-turnstile/route.ts` — patrón de verificación.
- `asset-config.json` — `providers.fallback: cloudflare-r2`.
- `packages/cdn/index.ts` — resolver de assets (`resolveIcon`, `assetResolver`, `deliveryVariants`).
- `scripts/upload-cdn.js` — subida a Supabase Storage.

_Última revisión: 17 ago 2026._ Relacionado: `MEDIA_FORMATS_SYSTEM.md`, `CACHING_SYSTEM.md`,
`MONITORING_SYSTEM.md`, `DOMAINS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`.
