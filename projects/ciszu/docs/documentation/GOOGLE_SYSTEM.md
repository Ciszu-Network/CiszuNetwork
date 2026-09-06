# GOOGLE_SYSTEM — Negocio de Google y reseñas de Google de Ciszu Network

Versión: 1.0.0
Actualización: 2026-08-17
Identificador: GOOGLE_SYSTEM_V1.0.0_2026_08_17_ciszunetwork

> **Definición**: perfil de negocio de Google (Google Business Profile) de Ciszu Network,
> sus identificadores, el enlace público de reseñas de Google y la integración de ambos en la
> web principal. Complementa a `REVIEWS_SYSTEM.md` (todas las plataformas de valoración) y a
> `PAYMENTS_SYSTEM.md` (monetización); es **un sistema propio** porque Google Business es la
> única plataforma que da reputación local (negocio físico) con verificación directa.

**Estado (17 ago 2026)**: perfil de negocio en Google Business Profile **enlazado con la cuenta
del usuario** (misma cuenta Google que UptimeRobot/Supabase). El enlace de reseñas
`https://g.page/r/CTGLyn7UrVHPEAE/review` está publicado en el bloque "Reseñas" de la página
`/support` de `ciszunetwork.vercel.app`, junto a los datos públicos del negocio. Todos los
identificadores quedaron guardados en el vault (`services/supabase/.env`, claves `GOOGLE_*`).

## 1. Objetivo

Centralizar y documentar la presencia de Ciszu Network en **Google Business Profile** y en
**Google Reviews**, de modo que:

1. El negocio tenga un perfil local verificable (dirección `98J5+WQ Coro, Falcón`).
2. Los usuarios puedan dejar una reseña de Google desde la web con un solo clic.
3. Los identificadores (ID de negocio, código de tienda, conexión, link) estén respaldados en
   el vault y documentados, sin depender de la memoria de nadie.

## 2. Datos del negocio en Google

### 2.1 Identificadores

| Campo | Valor | Vault key | Dónde se muestra en la web |
| --- | --- | --- | --- |
| **ID de negocio** | `12451554180623658502` | `GOOGLE_BUSINESS_ID` | Bloque Reseñas de `/support` |
| **Código de tienda** | `15916715880116624592` | `GOOGLE_STORE_CODE` | Bloque Reseñas de `/support` |
| **Conexión** | `om-4449155801906919160` | `GOOGLE_BUSINESS_CONNECTION` | Bloque Reseñas de `/support` |
| **Enlace del negocio** | `https://share.google/i2XMvOrh6y3ap0sBq` | `GOOGLE_BUSINESS_LINK` | Bloque Reseñas de `/support` |
| **Dirección (código plus)** | `98J5+WQ Coro, Falcón` | `GOOGLE_BUSINESS_ADDRESS` | Bloque Reseñas de `/support` |
| **Enlace de reseñas** | `https://g.page/r/CTGLyn7UrVHPEAE/review` | `GOOGLE_REVIEWS_URL` | Bloque Reseñas de `/support` |

### 2.2 Naturaleza de los datos

- Son **datos públicos de negocio** (dirección, enlaces, IDs de perfil público), no secretos.
- Aun así, por decisión de Ciszuko Antony, se **respaldan en el vault** (`services/supabase/.env`,
  claves `GOOGLE_*`) como referencia única y fuente de verdad para re-sincronizar la web.
- En el código de la web principal se duplican como constante pública `GOOGLE_BUSINESS`
  (`projects/ciszu/website/src/app/support/page.tsx`), porque son públicos por diseño.

## 3. Enlace de reseñas de Google

### 3.1 Qué es

`https://g.page/r/CTGLyn7UrVHPEAE/review` abre directamente el cuadro "Deja tu opinión" del
perfil de Google Business de Ciszu Network, sin pasar por el buscador.

### 3.2 Reglas de uso

- Es el **único** enlace oficial de reseñas de Google del ecosistema. No inventar otros.
- Solo se usa en la web principal (`/support`, bloque "Reseñas") salvo que Ciszuko Antony indique
  lo contrario.
- Si el enlace dejara de funcionar (perfil movido/reclamado de nuevo), regenerarlo desde el
  perfil (Compartir reseña) y actualizar **a la vez**: `support/page.tsx`, vault y este doc.

## 4. Integración técnica

### 4.1 En la web principal (`ciszunetwork.vercel.app`)

Archivo: `projects/ciszu/website/src/app/support/page.tsx`.

- Constante `GOOGLE_BUSINESS` con los 6 valores (sección 2.1).
- Bloque "Reseñas" (gradiente verde, tras el widget de Trustpilot):
  - Botón **"Opiniones en Google"** → `GOOGLE_BUSINESS.reviewsUrl` (nueva pestaña, `rel="noopener noreferrer"`).
  - Cuadrícula 2×2 con: Dirección (enlazada al `GOOGLE_BUSINESS.link`), Código de tienda,
    ID de negocio y Conexión.

### 4.2 En el vault

Archivo: `services/supabase/.env` (gitignored; gestión con `scripts/vault.ps1`).

```
GOOGLE_REVIEWS_URL=https://g.page/r/CTGLyn7UrVHPEAE/review
GOOGLE_BUSINESS_ID=12451554180623658502
GOOGLE_STORE_CODE=15916715880116624592
GOOGLE_BUSINESS_CONNECTION=om-4449155801906919160
GOOGLE_BUSINESS_LINK=https://share.google/i2XMvOrh6y3ap0sBq
GOOGLE_BUSINESS_ADDRESS=98J5+WQ Coro, Falcón
```

- No se usan como `process.env` en runtime (son datos de página pública); viven en el vault como
  **respaldo documental**.
- Ver `VAULT_SYSTEM.md` para el ciclo cifrado/backup/verify.

### 4.3 En las webs hermanas

- **MuzicMania / CiszukoAntony / CiszuBot**: sin perfil Google por ahora. Si en el futuro se
  crean, cada negocio tendrá su propio ID y se documentará aquí la matriz.

## 5. Flujo de una reseña de Google

1. Usuario visita `/support` de `ciszunetwork.vercel.app`.
2. Pulsa "Opiniones en Google".
3. Google abre el cuadro de reseña del perfil del negocio (requiere cuenta Google).
4. La reseña aparece pública en el perfil; desde el Dashboard se gestiona (responder, reportar).

## 6. Verificación (QA)

- [x] `curl -I https://g.page/r/CTGLyn7UrVHPEAE/review` → sigue redirección y termina en el
      cuadro de reseña del perfil.
- [x] `https://share.google/i2XMvOrh6y3ap0sBq` → abre el perfil del negocio.
- [x] Claves `GOOGLE_*` presentes en `services/supabase/.env`.
- [x] `/support` renderiza el botón de reseñas + la cuadrícula con los 4 datos del negocio.

## 7. Google Analytics 4, Tag Manager y AdSense (ago 2026 — ACTIVO)

Ciszuko creó las propiedades de Google del ecosistema. **Implementación real** en las 4 webs
(componente `GoogleScripts` de `@ciszu/ui` renderiza GTM + GA4 + AdSense en el **HTML estático
SSR**; `GoogleAnalytics` hace el tracking client). Config por env (Vercel/`.env.local`):

### 7.1 Inventario por web

| Web | GTM (container) | GA4 (measurement ID) | GA4 (data stream) | AdSense client |
|---|---|---|---|---|
| ciszunetwork | `GTM-N7Q8DGX5` | `G-TQH12LRZK6` | `15503788796` | `ca-pub-3471969072198962` |
| ciszukoantony | `GTM-WNDXGD63` | `G-V6E1QC7GQM` | `15503832664` | `ca-pub-3471969072198962` |
| ciszubot | `GTM-T9LG9N6C` | `G-Y3X7RSM2J3` | `15503892170` | `ca-pub-3471969072198962` |
| muzicmania | `GTM-N2SXL2FN` | `G-GQ197GD1RH` | `15503882473` | `ca-pub-3471969072198962` |

- **Cuenta de Google Marketing Platform**: `zu-yPXlmRS2MReYKOuKMJw` (ID de cuenta).
- **Looker Studio** (antes Data Studio): cuenta creada para dashboards de GA4/AdSense.
- **Google Ads**: requiere crear una primera campaña para desbloquear (pendiente de Ciszuko).
- Los IDs de GTM/GA4/AdSense aparecen en el HTML público (por diseño). La cuenta de Marketing
  Platform y los data streams son **internos** → viven en el vault (`services/supabase/.env`,
  claves `GOOGLE_*`) y Bitwarden.

### 7.2 Componentes (código)

- `packages/ui/src/GoogleScripts.tsx` — renderiza GTM + GA4 + AdSense en el HTML estático (SSR),
  imprescindible para que la **verificación de AdSense** detecte el script.
- `packages/ui/src/GoogleAnalytics.tsx` — tracking client (page_view + `trackEvent`).
- Montados en los 4 layouts junto a `PostHogAnalytics`.

### 7.3 Verificación (QA)

- Env vars añadidas a **Vercel** (CLI, production + preview) en los 4 proyectos
  (`ciszunetworkpage`, `ciszukoantonypage`, `ciszubot`, `muzicmania`):
  `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_ADSENSE_CLIENT`
  (verificadas con `vercel env ls production`).
- `curl -I https://www.googletagmanager.com/gtm.js?id=GTM-N7Q8DGX5` → 200.
- `curl -I https://www.googletagmanager.com/gtag/js?id=G-TQH12LRZK6` → 200.
- `curl -I "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3471969072198962"` → 200.
- En el navegador: `window.dataLayer` presente y `dataLayer.push` funcionando (GTM).
- **Deploy de `main` pendiente**: al pushear, el CI despliega las 4 webs con el stack Google
  (GA4 + GTM + AdSense) y las env vars se activan en producción.

### 7.4 Pendientes de verificación (tras deploys en verde)

- [x] **`ads.txt` creado** en `public/` de las 4 webs con
      `google.com,ca-pub-3471969072198962,DIRECT,f08c47fec0942fa0` — método de verificación
      de AdSense alternativo al código (01 sep 2026).
- [ ] **Testear las 4 webs**: carga sin errores de consola; `window.dataLayer`/`gtag` presentes;
      anuncios propios visibles (píldora ~2s, flotante ~8s, modal MuzicMania tras partida).
- [ ] **GA4** (`analytics.google.com`): Realtime muestra los page_views por web.
- [ ] **GTM** (`tagmanager.google.com`): contenedores publicados (N7Q8DGX5 / WNDXGD63 / T9LG9N6C /
      N2SXL2FN). Opcional: crear tag GA4 dentro del contenedor.
- [ ] **AdSense** (`adsense.google.com`): estado de la **revisión** del sitio (aprobación pendiente);
      crear unidades de anuncio cuando aprueben.
- [ ] **Looker Studio**: conectar cada propiedad GA4 como fuente de datos.

## 8. Relaciones

- `REVIEWS_SYSTEM.md` — todas las plataformas de valoración (Trustpilot, top.gg, DBL, Google).
- `VAULT_SYSTEM.md` — dónde y cómo se respaldan las claves `GOOGLE_*`.
- `PAYMENTS_SYSTEM.md` — monetización; Google Business es reputación, no pago.
- `AD_SYSTEM.md` — sistema de anuncios (GA4 + GTM + AdSense reales).
- `ANALYTICS_SYSTEM.md` — analíticas (GA4 + GTM son capas).
- `ONLINE_SERVICES_SYSTEM.md` — servicios online gestionados de la cuenta del usuario.
- `BUSINESS_SYSTEM.md` — identidad corporativa de Ciszu Network.

_Última revisión: 26 ago 2026._ Relacionados: `REVIEWS_SYSTEM.md` · `VAULT_SYSTEM.md` · `AD_SYSTEM.md` · `ANALYTICS_SYSTEM.md` · `SEO_PLAN.md` · `TOOLS_SYSTEM.md`.

## 9. Herramientas SEO de Google (Alertas, Trends, Keyword Planner) — AGOSTO 2026

Complementan a `SEO_PLAN.md` §2.3. Son **gratuitas** (Alerts, Trends) o **requieren cuenta Ads** (Keyword Planner) que ya existe en el ecosistema (`ca-pub-3471969072198962`).

### 9.1 Google Alerts
- **URL**: https://www.google.com/alerts
- **Alertas configuradas**: 5 términos de marca (Ciszu Network, Ciszuko Antony, MuzicMania, CiszuBot, Francisco Garcia).
- **Frecuencia**: diario; entrega por email a la cuenta Google del usuario.
- **Doc**: `SEO_PLAN.md` §2.3.1.

### 9.2 Google Trends
- **URL**: https://trends.google.com
- **Uso**: comparar interés de búsqueda (ej. "juego ritmo" vs "rhythm game", "bot Discord" vs "Discord bot").
- **Export**: CSV manual → `projects/<web>/website/seo/audits/google-trends/`.
- **Doc**: `SEO_PLAN.md` §2.3.2.

### 9.3 Google Keyword Planner
- **URL**: https://ads.google.com/aw/keywordplanner
- **Cuenta Ads**: `ca-pub-3471969072198962` (la misma de AdSense/GA4/GTM).
- **Export**: CSV → `projects/<web>/website/seo/audits/keyword-planner/`.
- **Doc**: `SEO_PLAN.md` §2.3.3.

### 9.4 Vault (claves relacionadas)
```
GOOGLE_ADS_CUSTOMER_ID=...          # ID de cliente Ads (si se usa API)
GOOGLE_ADS_DEVELOPER_TOKEN=...      # Developer token (si se usa API)
```
Actualmente no se usa API; todo es manual/CSV. Ver `VAULT_SYSTEM.md`.
