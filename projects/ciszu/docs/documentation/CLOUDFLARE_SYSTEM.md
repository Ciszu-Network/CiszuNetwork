# CLOUDFLARE_SYSTEM — Guard de Turnstile (CloudflareGuard)

Versión: 1.1.0
Actualización: 2026-09-05
Identificador: CLOUDFLARE_SYSTEM_V1.1.0_2026_09_05_ciszunetwork

> **Definición**: sistema de verificación de acceso con Cloudflare Turnstile
> compartido entre las 4 webs (`packages/ui/src/CloudflareGuard.tsx` + route
> `/api/verify-turnstile` de cada app). Bloquea bots antes del contenido.

---

## 1. Diagnóstico: "el guard tarda ~5 minutos en arrancar tras un deploy"

### Síntoma reportado (2026-09-05)

> "Cuando haces push y las páginas reciben el deploy, el guard de Cloudflare
> Turnstile se tarda un poco más en iniciar. Alrededor de 5 minutos (demasiado
> para un usuario normal)."

### ¿Bug, caché o problema técnico? → **Bug de código (3 causas), NO caché**

Las webs viven en `*.vercel.app` (DNS de Vercel, no proxied por Cloudflare),
así que **no hay caché de Cloudflare delante de las páginas** que pueda
"propagar" el deploy. El `api.js` de Turnstile se sirve desde el CDN propio de
Cloudflare (`challenges.cloudflare.com`), siempre caliente e inmutable.

Las causas reales están en el código del guard:

| # | Causa | Efecto |
|---|-------|--------|
| 1 | `tryRender()` sondeaba `window.turnstile` cada 200ms **sin timeout** | Si `api.js` tardaba o fallaba (red, rate limit, arranque tras deploy), el usuario veía un **hueco vacío eterno**: sin error, sin botón, "Verificando…" para siempre. |
| 2 | Backoff de auto-retry de solo 3s/8s/20s (**~31s total**) | El plan **free** de Turnstile tiene rate limit por IP (`ratelimited: global`) con ventana de **minutos**. Tras un deploy, bots + las 4 webs desde la misma IP disparan el límite; el guard se rendía a los 31s, antes de que la ventana pasara. |
| 3 | Turnstile dispara `error-callback` **varias veces por el mismo fallo** (documentado por Cloudflare) | El contador de reintentos se quemaba en la primera ráfaga de callbacks y agotaba el backoff al instante. |
| 4 | Sin preconnect/dns-prefetch a `challenges.cloudflare.com` | El guard **bloquea la página**: cada ms de DNS/TLS del widget se paga en la pantalla de verificación. |

El "~5 minutos" coincide además con la **expiración del token de Turnstile
(300s)**: si el widget resolvía pero la verificación server-side tardaba (cold
start del deploy), el token moría a los 5 min y había que repetir.

## 2. Fix aplicado (2026-09-05, `CloudflareGuard.tsx` v1.1.0)

1. **Timeout de carga de 10s** (`SCRIPT_LOAD_TIMEOUT_MS`): si `window.turnstile`
   no inicializa en 10s → estado `error` con botón **REINTENTAR**. Nunca más un
   hueco vacío infinito.
2. **Backoff extendido a ~6 min** `[3s, 8s, 20s, 45s, 90s, 180s]`: cubre la
   ventana de rate limit del plan free y cruza la ventana SOLO (sin interacción
   del usuario).
3. **Dedupe de `error-callback`** (`retryPendingRef`): solo se programa un
   reintento nuevo si no hay uno pendiente, ignorando la ráfaga de callbacks
   del mismo fallo.
4. **preconnect + dns-prefetch** a `challenges.cloudflare.com` antes del
   script: DNS/TLS en paralelo con el resto de la página → el widget arranca
   lo antes posible (el guard bloquea la página).
5. `onerror` en el `<script>` de api.js → error inmediato si no se pudo
   descargar (red/extensiones), sin esperar al timeout.

## 3. Arquitectura actual

- **Componente**: `packages/ui/src/CloudflareGuard.tsx` (sin dependencias npm,
  carga la API global de Turnstile; CSS inline).
- **Uso**: envuelve TODO el contenido en el `layout.tsx` de cada web con su
  `siteKey` y `storageKey` propios (`cf_verified_*`).
- **Verificación server-side**: `POST /api/verify-turnstile` por app
  (rate limit 30/min por IP; valida con `TURNSTILE_SECRET_KEY` contra
  `challenges.cloudflare.com/turnstile/v0/siteverify`).
- **Persistencia**: `sessionStorage[storageKey] = 'true'` → no re-pregunta
  entre páginas hasta cerrar el navegador.
- **Degradación segura**: sin `siteKey`, en dev, en localhost o con
  `?cf_bypass=1` → no bloquea (renderiza children directo).
- **Rate limit free por IP**: entre webs (verificar en ciszunetwork y fallar en
  ciszubot) — NO se elimina con código; el backoff extendido ahora lo cruza
  solo.

## 4. Operación

- **Probar tras un deploy**: el guard debe arrancar en <2s (script + widget).
  Si tarda, mirar la consola del navegador: error-callback con
  `ratelimited: global` = ventana de rate limit (esperar y reintentar solo);
  `1101xx` = sitekey no coincide con el hostname.
- **Token expiry = 300s**: si la verificación server-side tarda más de 5 min
  (cold start extremo), el token expira. El timeout de carga + REINTENTAR
  cubre el caso.
- **No tocar** `retryDelays` por defecto: están calibrados para cruzar la
  ventana del plan free. En tests se inyectan delays cortos vía prop.
- **Si algún día se paga Turnstile** (sin rate limit), se pueden acortar los
  delays de nuevo.