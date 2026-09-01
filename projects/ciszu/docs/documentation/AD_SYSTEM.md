# AD_SYSTEM — Sistema de Anuncios de Ciszu Network

Versión: 2.0.0
Actualización: 2026-08-26
Identificador: AD_SYSTEM_V2.0.0_2026_08_26_ciszunetwork

> **Definición**: sistema de anuncios compartido de Ciszu Network para las 4 webs. Define los
> **4 tipos** (intrusivos, particulares, de recompensa y opcionales), sus **4 formatos**
> (patrocinado, imagen, vídeo, carrusel) con **temporizador visible**, reglas de aparición,
> cierre y recompensa (incluida la advertencia al cerrar recompensas), **cooldown global 1h**,
> balance **25% patrocinado / 75% terceros**, **no auto-propagación**, mini aviso "Próximo
> anuncio en", isotipos reales vía CDN, el **catálogo**, la integración con **Google Analytics 4**
> para medir impresiones/clics/cierres y la investigación de Google AdSense. Tarea `TODO.md #5`.

---

## 1. Visión general

Ciszu Network monetiza con anuncios **propios** (promoción del ecosistema) respaldados por
**Google Analytics 4** para la medición. Los anuncios viven en `@ciszu/ui` (componente
`Ads.tsx` + `GoogleAnalytics.tsx`) y se montan una vez en cada layout; el contenido se define por
**catálogo** y la mecánica es idéntica en las 4 webs.

Principios:
1. **Todo anuncio se puede cerrar salvo que se declare no-closable** (`closable: false`).
2. **Nunca se incrustan en el layout**: son *overlays* flotantes (modal centrado, esquinas,
   píldora inferior) para no romper el estilo/diseño de ninguna web.
3. **Respetan al usuario**: los temporales/periodicos exigen espera para la recompensa (la mitad);
   los opcionales se cierran en cualquier momento.
4. **Medibles**: cada impresión, clic y cierre se registra en GA4 (y en el futuro en AdSense).

---

## 2. Tipos de anuncio

| Tipo | Cuándo aparece | Cómo se ve | Cierre |
|---|---|---|---|
| **Intrusivo** | SIEMPRE tras una acción explícita del usuario (hoy: fin de partida de MuzicMania). NUNCA en navegación normal | Modal centrado con blur | X (si lleva recompensa: avisa de la pérdida; si no, cierra directo) |
| **Recompensa** | Tras una acción con recompensa (ej. partida) | Modal centrado con contador y botón Reclamar | X avisa de que perderás la recompensa (la mitad) |
| **Particulares** | Pasivos, programados (esquina flotante), con cooldown global largo | Flotante de esquina | X = *snooze* (respeta su intervalo) |
| **Opcional** | Pasivos, programados (banner inferior) | Píldora inferior | X (se despide permanentemente) |

### 2.1 Formatos y temporizador visible (TODOS los anuncios)

Todo anuncio muestra una **barra amarilla + contador de segundos** de auto-cierre. La duración
depende del formato y del tipo:

| Formato | Duración pasivo | Duración intrusivo/recompensa (el DOBLE) |
|---|---|---|
| **Patrocinado** (Ciszu Network) | 10s | 20s |
| **Imagen** (terceros) | 30s | 60s |
| **Vídeo** (terceros) | duración + mitad (1.5x): 1ª reproducción completa + 2ª con contador de la mitad | duración + duración (2x) |
| **Carrusel** | máx. 4 anuncios en cadena (15s cada uno) | — (no se usa intrusivo) |

### 2.2 Reglas de recompensa

- `rewardWaitSec` (por defecto 30s): hasta que pasa el tiempo, "Reclamar" está deshabilitado.
- Recompensa = **la mitad** de la estándar.
- **Cerrar un anuncio de recompensa muestra una advertencia** ("vas a perder la recompensa") con
  confirmar/cancelar. Los intrusivos SIN recompensa simplemente se cierran.
- **Pérdida por abandono**: si el usuario recarga/cierra la pestaña con un anuncio de recompensa
  activo SIN reclamar, la recompensa se pierde (se marca como vista/consumida para no reclamarla
  en la siguiente visita sin verlo de nuevo). Se registra el evento `ad_reward_lost`.

### 2.3 Frecuencia y cooldown (5-10 minutos)

- **Intervalo entre anuncios periódicos/opcionales: 5 min mínimo / 10 min máximo** (ya no 1 hora).
  `periodicInterval()` elige un valor aleatorio en ese rango para cada siguiente anuncio.
- `minIntervalSec` por anuncio (420s-540s) vía `localStorage` (`ciszu_ads_<site>_seen`).
- **Un solo flotante a la vez**: la esquina (particulares) y el banner inferior (opcional)
  comparten `floatingActive`; si uno se muestra, el otro espera. Ambos (esquina Y banner)
  reintentan con `periodicInterval()` para que el banner inferior aparezca igual que la esquina.
- **Primer show**: esquina a 15s (inactivo) / 5-10 min (activo); banner inferior a 30s (inactivo)
  / 5-10 min (activo).
- **Usuario inactivo** (>60s sin pointer/teclado/scroll) = más propenso: el primer show se adelanta.
- **Periodo de gracia**: 10s sin anuncios desde que se entra a cualquier página (independiente del rango).
  **Se ignora cuando el debug local (devcon) está activo**: los anuncios forzados salen al instante.
- **Mini aviso "Próximo anuncio en Xs"**: siempre visible antes de un anuncio periódico/opcional,
  con icono de **flecha doble a la derecha parpadeante**. NUNCA para anuncios de acción/interacción
  ni no-closables.

### 2.4 Balance 25/75 y no auto-propagación

- La selección pasiva elige **25% patrocinados de Ciszu Network / 75% terceros** (AdSense/real),
  con rotación para no repetir el mismo seguido.
- **Ninguna web se patrocina a sí misma**: el catálogo se filtra por `content.source !== site`
  (los intrusivos/recompensa, que son tras acción, se mantienen siempre).
- **En debug local (devcon) se anula el filtro de auto-propagación**: se puede forzar cualquier
  marca oficial (ciszunetwork/ciszukoantony/ciszubot/muzicmania/ciszugamens), incluida la propia
  web, para depurar logos visualmente. El devcon pide la **marca específica** al elegir "oficiales".

### 2.5 Usuarios autenticados y premium

- `AdsProvider` acepta `authenticated` y `premium` (props opcionales).
- **Premium** (`premium: true`): sin anuncios (se quitan todos).
- **Autenticado** (`authenticated: true`, sin premium): se quitan los anuncios de footer/opcionales
  (menos anuncios); se mantienen esquina y los de tras-acción (intrusivo/recompensa).
- En los anuncios se indica "Regístrate para ver menos anuncios" (CTA en el pie de los anuncios).

### 2.6 Registro de impresiones en BD

- Cada anuncio mostrado se registra en `ciszu-network.ads_impressions` (migración
  `20260831000026_ads_impressions.sql`) con: `site`, `ad_id`, `ad_type`, `ad_source`
  (patrocinado de Ciszu Network vs `external`), y `user_id` (si el usuario está autenticado).
- El front llama a `POST /api/ads/impression` (endpoint en ciszu) con RLS: cualquiera inserta,
  solo `service_role` lee. Esto permite reportes de "anuncios vistos por usuario".

### 2.7 No-closable y legal

- Un anuncio puede declararse **no-closable** (`closable: false`): no se muestra la X.
- Todos los modales/flotantes muestran al pie el enlace a **Términos y condiciones → sección
  anuncios** de la web que lo muestra (`/policies#anuncios`, `/terminos#anuncios`,
  `/terms#anuncios` según la web).
- Los anuncios van SIEMPRE por detrás de los overlays de UI (goToUp/goToDown, toasts, FAB):
  `z-[30]`, a nivel de body; el modal centrado intrusivo usa `z-[1050]` (debajo de
  GlobalAdvisor `z-[1100]`).

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

- Prop `site` (ciszunetwork | ciszukoantony | muzicmania | ciszubot | **ciszugamens**): aísla el `localStorage`
  y etiqueta los eventos GA4 por web.
- Prop `catalog` (opcional; default `DEFAULT_AD_CATALOG`).
- API vía `useAds()`:
  - `show(id)` → muestra un anuncio respetando cierres e intervalo.
  - `trigger(type, placement)` → elige un anuncio del catálogo por tipo+placement y lo muestra.
  - `dismiss()` → cierra el actual (marca "dismissed" si es opcional; *snooze* si es particular).
  - `rewardStatus(ad)` → `{ canClaim, remainingSec }`.
  - `claimReward(ad)` → reclama la recompensa si ya se puede (marca `claimed`).
  - `isInactive()` → `true` si usuario > 60s sin interactuar (adelanta anuncios pasivos).
  - `passiveHint` → `{ surface, at }` para mini "Próximo anuncio en Xs".
  - `registerSurface('float'|'pill')` / `unregisterSurface()` → registro de superficies pasivas.

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

- **ciszu** (`app="ciszunetwork"`), **ciszukoantony**, **ciszubot**, **muzicmania** y **ciszugamens**: montados.
- **MuzicMania — intrusivo tras la partida**: `AfterGameAd` (en `components/ads/`) se monta en la
  fase de resultados de `/play` y llama `trigger('intrusive', 'game_end')` (respaldo
  `trigger('reward', 'game_end')`).
- Futuros *intrusivos*: tras compra en tienda (`shop_checkout`), etc. — basta añadir un trigger.

---

## 6. Tracking con Google (GA4 + GTM + AdSense)

`GoogleScripts.tsx` (SSR estático) + `GoogleAnalytics.tsx` (tracking client):

- `GoogleScripts` renderiza en el HTML inicial (SSR) las etiquetas de GTM + GA4 + AdSense:
  - contenedor GTM con `NEXT_PUBLIC_GTM_ID` (por web).
  - gtag.js GA4 con `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (por web).
  - script de AdSense con `NEXT_PUBLIC_ADSENSE_CLIENT` (por web). Estático = la
    **verificación de AdSense** funciona (los crawlers ven el script).
- `page_view` manual por ruta (App Router no recarga).

**IDs reales (ago 2026)**:

| Web | GA4 | GTM | AdSense |
|---|---|---|---|
| ciszunetwork | `G-TQH12LRZK6` | `GTM-N7Q8DGX5` | `ca-pub-3471969072198962` |
| ciszukoantony | `G-V6E1QC7GQM` | `GTM-WNDXGD63` | `ca-pub-3471969072198962` |
| ciszubot | `G-Y3X7RSM2J3` | `GTM-T9LG9N6C` | `ca-pub-3471969072198962` |
| muzicmania | `G-GQ197GD1RH` | `GTM-N2SXL2FN` | `ca-pub-3471969072198962` |
| **ciszugamens** | *(por crear)* | *(por crear)* | *(por crear)* |

Eventos de anuncios (vía `trackEvent` de `@ciszu/ui`):

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

## 8. Catálogo por defecto (promo ecosistema + huecos reales)

| id | tipo | placement | formato | contenido |
|---|---|---|---|---|
| `ciszunetwork_corner` | particulares | `corner` (7200s) | patrocinado 10s | Crear cuenta CISZU ID → /register (azul) |
| `muzicmania_corner` | particulares | `corner` (7200s) | patrocinado 10s | Jugar → /play (morado-rosado) |
| `ciszubot_corner` | particulares | `corner` (7200s) | patrocinado 10s | Bot oficial de Discord (celeste) |
| `ciszukoantony_corner` | particulares | `corner` (7200s) | patrocinado 10s | Portfolio de Ciszuko Antony (morado) |
| `ciszugamens_corner` | particulares | `corner` (7200s) | patrocinado 10s | Unirse al servidor de Discord (cian) |
| `real_image_corner` | particulares | `corner` (3600s) | imagen 30s | Hueco AdSense real ("Próximamente") |
| `real_video_corner` | particulares | `corner` (3600s) | vídeo 1.5x | Hueco vídeo real |
| `real_carousel_corner` | particulares | `corner` (3600s) | carrusel máx 4 | Hueco carrusel real |
| `real_image_pill` | opcional | `body` (3600s) | imagen 30s | Hueco AdSense real |
| `real_carousel_pill` | opcional | `body` (3600s) | carrusel máx 4 | Hueco carrusel real |
| `ciszunetwork_pill` | opcional | `body` (7200s) | patrocinado 10s | Crear cuenta CISZU ID |
| `muzicmania_after_game` | intrusivo | `game_end` | patrocinado 20s | "¿Disfrutaste la partida?" → /play |
| `reward_score` | recompensa | `game_end` (600s, 30s espera) | imagen 60s | Mitad de puntos extra |

Cada patrocinado usa el **isotipo/logotipo real** de la marca vía `AssetResolver` del CDN.
Los huecos reales muestran placeholder "Próximamente" hasta que se active AdSense; entonces el
catálogo puede apuntar a esa red sin tocar la mecánica.

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

### 9.2 Google AdSense (anuncios de terceros) — ACTIVO

- **Realidad desde ago 2026**: Ciszuko está registrado en AdSense y el publisher ID
  `ca-pub-3471969072198962` está implementado en las 4 webs (`GoogleScripts`, SSR estático).
**No es futuro**.
- Gratis; la integración es un tag de script (`adsbygoogle.js?client=ca-pub-...`). El script se
  carga, pero **las unidades de anuncio** (slots) se sirven vía AdSense cuando el sitio pasa la
  revisión/consentimiento. Mientras tanto el sistema de ads propios (`Ads.tsx`) sigue activo.
- **Google Ads** requiere crear una **primera campaña** para desbloquear la cuenta (pendiente).
- **Looker Studio**: cuenta creada para dashboards de GA4/AdSense.
- No hay API de aprobación; sí *Management API* (unidades/reportes).

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

## 9B. Guards de navegación (complementan los anuncios)

Sistemas de aviso que protegen al usuario al navegar, integrados en las 4 webs (paquete
`@ciszu/ui` → `BehaviorGuards.tsx`):

- **RedirectGuard (aviso AZUL)**: al hacer clic en un hipervínculo que sale a OTRA website
  (dominio distinto; NO aplica al mismo dominio), muestra "Redirigiendo a <host> en 3s..." con
  opción de **cancelar**. Se usa para redireccionar anuncios/links oficiales o no oficiales y
  enlaces de footers/páginas/headers a otras webs, dándole tiempo al usuario a cancelar.
  Preferencia local `redirectGuard` (default activo).
- **ActivityGuard (aviso ROJO)**: si hay una acción **no recuperable** en curso (jugar un nivel,
  registro/login, edición de perfil, anuncio obligatorio no opcional) y el usuario intenta
  navegar/cerrar, muestra un aviso rojo con 2 opciones "Seguir" / "Quedarme" (sin contador).
  Pausa la actividad (`onPause`). Preferencia local `activityGuard` (default activo).

Ambas se desactivan desde las preferencias locales (`ciszu_preferences`). Ver
`GLOBAL_COMPONENTS_SYSTEM.md` y el código de `BehaviorGuards.tsx`.

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