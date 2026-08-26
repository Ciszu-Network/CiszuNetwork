# AD_SYSTEM — Sistema de Anuncios de Ciszu Network

Versión: 1.0.0
Actualización: 2026-08-26
Identificador: AD_SYSTEM_V1.0.0_2026_08_26_ciszunetwork

> **Definición**: sistema de anuncios compartido de Ciszu Network para las 4 webs. Define **4 tipos
> de anuncio** (intrusivos, particulares, de recompensa y opcionales), sus reglas de aparición,
> cierre y recompensa, el **catálogo** de anuncios propios, la integración con **Google Analytics 4**
> para medir impresiones/clics/cierres y la investigación de Google AdSense y alternativas. Tarea
> `TODO.md #5`.

---

## 1. Visión general

Ciszu Network monetiza con anuncios **propios** (promoción del ecosistema) respaldados por
**Google Analytics 4** para la medición. Los anuncios viven en `@ciszu/ui` (componente
`Ads.tsx` + `GoogleAnalytics.tsx`) y se montan una vez en cada layout; el contenido se define por
**catálogo** y la mecánica es idéntica en las 4 webs.

Principios:
1. **Todo anuncio se puede cerrar** (obligatorio).
2. **Nunca se incrustan en el layout**: son *overlays* flotantes (modal centrado, esquinas,
   píldora inferior) para no romper el estilo/diseño de ninguna web.
3. **Respetan al usuario**: los temporales/periodicos exigen espera para la recompensa (la mitad);
   los opcionales se cierran en cualquier momento.
4. **Medibles**: cada impresión, clic y cierre se registra en GA4 (y en el futuro en AdSense).

---

## 2. Tipos de anuncio

| Tipo | Cuándo aparece | Cómo se ve | Cierre |
|---|---|---|---|
| **Intrusivo** | Siempre tras una acción del usuario (fin de partida, compra futura, etc.) | Modal centrado con blur de fondo y animación fluida | X en cualquier momento (vuelve en la siguiente acción) |
| **Particulares** | De vez en cuando, en ciertos lugares (esquinas flotantes) | Flotante de esquina pequeño | X = *snooze*: respeta su intervalo para reaparecer |
| **Recompensa** | Periódico/temporal (ej. tras una partida, con intervalo) | Modal centrado con contador | X sin reclamar; para reclamar hay que esperar el tiempo (recompensa = **la mitad**) |
| **Opcional** | En lugares prescindibles, aparece sin molestar | Píldora flotante inferior | X en cualquier momento (se despide permanentemente) |

### 2.1 Reglas de recompensa (periódicos/temporales)

- Un anuncio de recompensa muestra un **temporizador** (`rewardWaitSec`, por defecto 30s).
- Hasta que no pasa el tiempo, el botón "Reclamar" está deshabilitado.
- La recompensa otorgada es **la mitad** de la recompensa estándar (por eso es "periódico/temporal":
  se puede ver muchas veces, pero cada recompensa individual vale la mitad).
- Cerrar el anuncio = no reclamar (se pierde esa oportunidad).

### 2.2 Frecuencia (particulares / recompensa)

Cada anuncio puede definir `minIntervalSec` (mínimo entre impresiones). Se respeta vía
`localStorage` (`ciszu_ads_<site>_seen`), de modo que un "de vez en cuando" nunca spamea.

---

## 3. Regla de diseño: SOLO flotantes

Para evitar imprevistos visuales y no alterar el diseño de las webs, **ningún anuncio se
incrusta en el flujo de la página**. Todo es overlay:

| Componente | Posición | Tipo |
|---|---|---|
| `AdModal` (interno del provider) | Centrado, con backdrop blur | intrusivo / recompensa |
| `AdFloat` | Esquina inferior (izq/der) | particulares |
| `AdPill` | Inferior o superior centrada | opcional |

Ninguno mueve el `main` ni los layouts: usan `createPortal` a `document.body` con `position:
fixed` y `z-index` alto.

---

## 4. Arquitectura

```
@ciszu/ui
├── GoogleAnalytics.tsx     GA4 (gtag.js) + trackEvent() — page_view + eventos custom
├── Ads.tsx                 Sistema de anuncios:
│   ├── AdsProvider         Contexto + catálogo + cierre/recompensa/intervalo (localStorage)
│   ├── AdModalInner        Modal centrado con blur (intrusivo/recompensa)
│   ├── AdFloat             Flotante de esquina (particulares)
│   └── AdPill              Píldora flotante (opcional)
└── index.ts                Exports: GoogleAnalytics, trackEvent, AdsProvider, useAds,
                            AdFloat, AdPill, DEFAULT_AD_CATALOG (+ tipos)
```

### 4.1 `AdsProvider`

- Prop `site` (ciszunetwork | ciszukoantony | muzicmania | ciszubot): aísla el `localStorage`
  y etiqueta los eventos GA4 por web.
- Prop `catalog` (opcional; default `DEFAULT_AD_CATALOG`).
- API vía `useAds()`:
  - `show(id)` → muestra un anuncio respetando cierres e intervalo.
  - `trigger(type, placement)` → elige un anuncio del catálogo por tipo+placement y lo muestra.
  - `dismiss()` → cierra el actual (marca "dismissed" si es opcional; *snooze* si es particular).
  - `rewardStatus(ad)` → `{ canClaim, remainingSec }`.
  - `claimReward(ad)` → reclama la recompensa si ya se puede (marca `claimed`).

### 4.2 Persistencia (`localStorage`)

| Clave | Contenido |
|---|---|
| `ciszu_ads_<site>_dismissed` | anuncios opcionales cerrados permanentemente |
| `ciszu_ads_<site>_seen` | timestamp de la última impresión (frecuencia + recompensa) |
| `ciszu_ads_<site>_claimed` | timestamp de la última recompensa reclamada |

---

## 5. Integración en las webs

Cada layout raíz monta una vez:

```tsx
import { GoogleAnalytics, AdsProvider, AdFloat, AdPill } from '@ciszu/ui';
...
<ToastProvider>
  <AdsProvider site="ciszunetwork"> ... </AdsProvider>
</ToastProvider>
<GoogleAnalytics app="ciszunetwork" />
<AdFloat placement="corner" side="bottom-right" />
<AdPill placement="body" />
```

- **ciszu** (`app="ciszunetwork"`), **ciszukoantony**, **ciszubot** y **muzicmania**: montados.
- **MuzicMania — intrusivo tras la partida**: `AfterGameAd` (en `components/ads/`) se monta en la
  fase de resultados de `/play` y llama `trigger('intrusive', 'game_end')` (respaldo
  `trigger('reward', 'game_end')`).
- Futuros *intrusivos*: tras compra en tienda (`shop_checkout`), etc. — basta añadir un trigger.

---

## 6. Tracking con Google Analytics 4

`GoogleAnalytics.tsx` (espejo de `PostHogAnalytics`):

- Carga `gtag.js` con `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (por web). Sin ID → no carga nada
  (degradación segura; no rompe la web).
- `page_view` manual por ruta (App Router no recarga).
- Eventos de anuncios (vía `trackEvent` de `@ciszu/ui`):

| Evento | Props |
|---|---|
| `ad_impression` | `ad_id`, `ad_type`, `placement`, `site` |
| `ad_click` | `ad_id`, `ad_type`, `href`, `site` |
| `ad_dismiss` | `ad_id`, `ad_type`, `site` |
| `ad_reward_claimed` | `ad_id`, `site` |

---

## 7. Privacidad

- Los datos de ads se unen a GA4 (cookies propias de Google, sujetas a la política de
  privacidad actualizada — ver `#6` del TODO y las páginas legales).
- El `localStorage` de ads es **local** y no contiene datos personales.
- El usuario siempre puede cerrar el anuncio; los opcionales se despiden de forma permanente.

---

## 8. Catálogo por defecto (promo Ciszu Network)

| id | tipo | placement | contenido |
|---|---|---|---|
| `muzicmania_after_game` | intrusivo | `game_end` | "¿Disfrutaste la partida?" → /play |
| `discord_community` | particulares | `corner` (180s) | Discord oficial |
| `reward_score` | recompensa | `game_end` (600s, 30s espera) | Mitad de puntos extra |
| `ecosystem_body` | opcional | `body` | Explora el ecosistema → ciszunetwork |

Se puede ampliar sin tocar la mecánica: añadir un `AdConfig` al catálogo (o cambiar el provider
de contenido a AdSense/otra red cuando se active).

---

## 9. Investigación de proveedores

### 9.1 Google Analytics 4 (GA4)

- **Gratis**: las propiedades GA4 *standard* son gratuitas (hasta ciertos límites de eventos por
  usuario/mes). GA4 360 es de pago (enterprise).
- **gtag.js**: script oficial, sin librería npm (como PostHog). Ya integrado.
- **Measurement Protocol**: API HTTP gratuita para enviar eventos desde servidor (backend/edge) —
  útil para medir acciones que no pasan por el navegador (ej. el bot de Discord).
- **Data API**: acceso a reportes por API (cuota gratuita) para dashboards propios.
- **Requisito**: una propiedad GA4 por web (o una sola con la prop `app` separando webs).
  Ciszuko debe crear las propiedades y pasar los **Measurement IDs** (`G-XXXX`) para
  `NEXT_PUBLIC_GA4_MEASUREMENT_ID` en cada `.env.local`.

### 9.2 Google AdSense (anuncios de terceros)

- **Gratis de unirse**, pero requiere **aprobación manual** del sitio (contenido suficiente,
  política de privacidad, páginas "About"). Sitios con poco contenido (juegos/apps) pueden ser
  rechazados en la primera revisión.
- **No tiene API de "servir anuncios" directa para aprobación**; la integración es un tag de
  script en las páginas (hay componente oficial `GoogleAdSense` en `@next/third-parties`).
  Sí tiene *Management API* para gestionar unidades/reportes, no para la aprobación.
- **Conclusión**: por ahora el sistema usa anuncios **propios** (promo del ecosistema); AdSense
  es un proveedor de contenido futuro sin cambiar la mecánica.

### 9.3 Alternativas (para futuro, si se quiere publicidad de terceros)

| Red | Modelo | Notas |
|---|---|---|
| **Carbon Ads** | Ads de desarrolladores (CPA/CPM) | Requiere aprobación, público dev |
| **EthicalAds** | Ads éticos/privacy-first | Público técnico, aprobación por contenido |
| **Media.net** | Contextual (Bing) | Requiere tráfico |
| **Adsterra / PropellerAds** | Variado (pop/display) | Menos exigente, calidad más baja |
| **Own network (actual)** | Promo del propio ecosistema | Sin aprobación, sin cookies de terceros |

La decisión actual: **red propia + GA4**, migrable a AdSense/otra red cambiando solo el
contenido del catálogo.

---

## 10. Referencias

- `MONETIZATION_PROTOCOLS.md` — modelo de monetización completo.
- `ANALYTICS_SYSTEM.md` — sistema de analíticas (GA4 es una capa más).
- `GOOGLE_SYSTEM.md` — presencia de Google (Business Profile, reseñas; GA/AdSense ahora).
- `GLOBAL_COMPONENTS_SYSTEM.md` — componentes globales del ecosistema.
- `FRONTEND_SYSTEM.md` / `UI_COMPONENTS_SYSTEM.md` — frontend y UI.
- `SECURITY_PROTOCOLS.md` — seguridad (sin secretos en el repo; los Measurement IDs son
  `NEXT_PUBLIC_`, seguros para client).

---

_Última revisión: 26 ago 2026._ Relacionado: `MONETIZATION_PROTOCOLS.md`, `ANALYTICS_SYSTEM.md`, `GOOGLE_SYSTEM.md`.