# GLOBAL_COMPONENTS_SYSTEM — Sistemas y Componentes Globales de las Webs (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-24
Identificador: GLOBAL_COMPONENTS_SYSTEM_V1.0.0_2026_08_24_ciszunetwork

> **Definición**: documenta los **sistemas y componentes globales** que todas las webs de Ciszu
> Network comparten (o deberían compartir): disclaimers, notificaciones/toasts, botones
> flotantes, navbuttons (goTop/goDown), theme, lenguaje, navbar, footer, zoom, island, headers,
> menú hamburguesa, sidebar y auth. Explica dónde vive cada uno (`@ciszu/ui` vs por-web), cómo
> se montan, cómo se usan y las diferencias reales entre webs.

---

## 1. Visión general: compartido vs por-web

El ecosistema usa un patrón híbrido: **los sistemas de comportamiento global viven en
`@ciszu/ui`** (paquete compartido), mientras que **los contenedores de layout (Navbar, Footer,
banners) son locales por web** pero siguen el mismo contrato visual y de comportamiento.

| Capa                         | Ubicación                                                       | Qué contiene                                                                                                              |
| ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Sistemas globales**        | `@ciszu/ui` (`packages/ui/src/`)                                | Disclaimer, ZoomWarning, FabStack, CloudflareGuard, SmartImage, PWA/PDWA, PostHog, BetaDisclaimer, Modal, auth components |
| **Stores de comportamiento** | `@ciszu/ui` (`zoomStore.ts`) + por-web (`store/useAppStore.ts`) | Zoom (global), theme/language/menu (por-web)                                                                              |
| **Layout por web**           | `projects/<web>/src/components/layout/`                         | Navbar, Footer, CookiesBanner, FeedbackFab                                                                                |
| **Config por web**           | `projects/<web>/src/config/`                                    | Navegación, idiomas (`LANGS`), links, iconos                                                                              |

**Regla de oro**: si el comportamiento es idéntico entre webs y no depende de datos de la app,
debe vivir en `@ciszu/ui`. Si es el "esqueleto" de la web (nav, footer, contenido), vive local
pero replicando el mismo patrón visual. Ver `UI_COMPONENTS_SYSTEM.md` y `PACKAGES_SYSTEM.md`.

---

## 2. Montaje global (el "esqueleto" común)

Todas las webs montan los sistemas en `src/app/layout.tsx` en un orden casi idéntico.
Referencia (ciszu, la más completa):

```
<html lang="es" (script anti-FOUC de tema en <head>)>
  <body>
    <AuthProvider>                      // sesión CISZU ID + hidratación de preferencias
      <ToastProvider>                   // sistema de toasts unificado (@ciszu/ui)
      <DisclaimerProvider>              // contexto del stack de disclaimers (@ciszu/ui)
        <CloudflareGuard ...>           // guard Turnstile (@ciszu/ui), envuelve el contenido
          {!isEdit && <ZoomWarning />}          // aviso global de zoom (@ciszu/ui)
          {!isEdit && <BetaDisclaimer ... />}   // aviso BETA (@ciszu/ui)
          {!isEdit && <Navbar />}               // header + hamburguesa + sidebar (por-web)
          {!isEdit && <DisclaimerStack headerHeight={64} />}  // posiciona avisos bajo el header
          <main className="flex-grow">{children}</main>
          {!isEdit && <Footer />}               // footer + ScrollNavButton + theme/lang
          {!isEdit && <CookiesBanner />}
        </CloudflareGuard>
      </DisclaimerProvider>
      </ToastProvider>
    </AuthProvider>
    <PwaRegister />                      // SW (@ciszu/ui)
    <FabStackProvider>                   // coordina FABs apilados (@ciszu/ui)
      <InstallPdwaButton ... />          // botón instalar PDWA (@ciszu/ui)
      <FeedbackFab />                    // reportar problema (por-web, usa Sentry)
    </FabStackProvider>
    <PostHogAnalytics app="<web>" />     // analytics (@ciszu/ui)
    <script beacon de Cloudflare>        // solo producción
  </body>
</html>
```

**Diferencias entre webs en el montaje**:

- **ciszu**: `<main>` sin padding propio.
- **muzicmania**: `<CloudflareGuard>` local (adaptador del de `@ciszu/ui` con Tauri); añade
  `<ConnectivityBanner>` y `<NuqsAdapter>`; `<main>` con `pt-20`.
- **ciszubot**: `<QueryProvider>` (React Query) en la raíz; `<main>` con `pt-[60px]`; idioma
  server-side (`getDict`).
- **ciszukoantony**: sin `<QueryProvider>`; `<main>` sin padding (header transparente al no
  hacer scroll); `generateMetadata` por pathname (header `x-pathname`).

---

## 3. Sistema de Disclaimers (avisos globales apilables)

**Vive en**: `@ciszu/ui` → `packages/ui/src/Disclaimer.tsx`.
**Sustituye**: los banners sueltos (BetaDisclaimer, ZoomWarning) por un stack global.

### 3.1 API

| Export                    | Tipo       | Descripción                                                                                                       |
| ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `DisclaimerProvider`      | Componente | Contexto que registra los avisos activos. Se monta una vez en el layout.                                          |
| `DisclaimerStack`         | Componente | Renderiza los avisos apilados; se adapta al modo del header (full/island). Prop`headerHeight`.                    |
| `useDisclaimer()`         | Hook       | Para productores:`push(item)` / `remove(id)`. `item = { id, kind: 'info'\|'beta'\|'warning', message, onClose }`. |
| `useHeaderMode()`         | Hook       | Lee el modo actual del header (`'full' \| 'island'`).                                                             |
| `publishHeaderMode(mode)` | Función    | El Navbar publica su modo para que el stack se posicione bien.                                                    |

### 3.2 Cómo funciona

1. El **Navbar** calcula si está en modo `island` (flotante) o `full` (pegado arriba) según
   scroll/búsqueda/menú/zoom, y lo publica con `publishHeaderMode()`.
2. El **DisclaimerStack** reacciona: en header `full`, el aviso se ancla DEBAJO del header en
   banda de extremo a extremo; en `island`, pasa a tarjeta flotante con los mismos márgenes.
3. Los productores (`BetaDisclaimer`, `ZoomWarning`) publican avisos con `useDisclaimer().push()`,
   y el stack los apila sin solaparse, con un botón X común.

### 3.3 Productores actuales

| Componente                                   | Tipo de aviso | Cuándo aparece                                             |
| -------------------------------------------- | ------------- | ---------------------------------------------------------- |
| `BetaDisclaimer` (`@ciszu/ui`)               | `beta`        | Banner BETA descartable con X, persistido por`storageKey`. |
| `ZoomWarning` (`@ciszu/ui` + `zoomStore.ts`) | `warning`     | Cuando el zoom del navegador sale del rango normal.        |

> **Cómo crear un disclaimer nuevo** (ej: "descuento X"): dentro de un componente montado bajo
> `DisclaimerProvider`, llamar `useDisclaimer().push({ id, kind, message, onClose })`. El stack
> lo muestra automáticamente en la posición correcta. No hay que tocar Navbar/Footer.

---

## 4. Sistema de Zoom

**Vive en**: `@ciszu/ui` → `packages/ui/src/zoomStore.ts` + `ZoomWarning.tsx`.
**Concepto**: dos zooms distintos pero coordinados:

1. **Zoom del navegador** (Ctrl+/Ctrl−): detectado por `useZoomStatus()`; dispara el aviso global.
2. **Zoom de preferencia del usuario** (80–140%): ajusta `font-size` del root; persistido en
   preferencias locales por-web.

### 4.1 API (`zoomStore.ts`)

| Export                       | Descripción                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| `useZoomStatus(): ZoomState` | Estado del zoom del navegador (`status`, `dismissed`, etc.). |
| `dismissZoomWarning()`       | Descarta el aviso manualmente.                               |
| `isZoomWarningActive(state)` | True si hay que mostrar el aviso.                            |
| `useZoomWarningActive()`     | Hook booleano (usa el store).                                |

### 4.2 Integración con el header y el stack

- El Navbar usa `useZoomStatus()`: si hay aviso activo, desplaza el header (`mt-8`) y **desactiva
  el modo island** (para que el aviso no choque con el header flotante).
- El zoom de preferencia se ajusta desde `PreferencesPanel` (barra −/+ 80-140%) y se aplica con
  `applyZoom()` (por-web, `lib/preferences.ts`).

---

## 5. Sistema de FABs (Botones Flotantes Apilados)

**Vive en**: `@ciszu/ui` → `packages/ui/src/FabStack.tsx` + `FabDismissHint.tsx`.

### 5.1 API

| Export                                                 | Descripción                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `FabStackProvider`                                     | Provider que calcula la posición vertical de cada FAB apilado.  |
| `useFabStack(id, slot)`                                | Hook para que un FAB reserve su posición (arriba del anterior). |
| `FAB_BASE_BOTTOM` (16) / `FAB_GAP` (8)                 | Constantes de posición.                                         |
| `restoreFabButtons()` / `useFabRestore` / `FabRestore` | Reactivan FABs descartados (flag`ciszu:fabs-restore`).          |
| `FabDismissHint`                                       | Aviso de 3s al cerrar un FAB con opción de reactivar.           |

### 5.2 FABs actuales (montados en `FabStackProvider`)

| FAB                               | Ubicación                      | Esquina             | Acción                                        |
| --------------------------------- | ------------------------------ | ------------------- | --------------------------------------------- |
| `InstallPdwaButton` (`@ciszu/ui`) | inferior-izquierda             | Primero en el stack | Instalar PDWA                                 |
| `FeedbackFab` (por-web)           | inferior-izquierda, sobre PDWA | Segundo             | Abrir widget de Sentry "Reportar un problema" |

> **Cómo crear un FAB nuevo** (ej: "confeti"): montar el componente bajo `FabStackProvider` y usar
> `useFabStack('confeti', visible ? { order, height } : null)` para que se apile. Se posiciona
> automáticamente sobre los existentes.

---

## 6. Navbuttons: goTop / goDown (scroll flotante)

**Componente compartido**: `ScrollNavButton` (`@ciszu/ui`, `ScrollNavButton.tsx`) — flechas
flotantes en esquina inferior-derecha (`fixed bottom-8 right-8`) con scroll suave al tope/final.
Colores por props (`accent`/`accentAlt`) para adaptarse a la marca de cada web; `hidden` para
ocultar (p.ej. `/play`).

Uso en los 4 footers:

| Web           | Invocación                                                        |
| ------------- | ----------------------------------------------------------------- |
| ciszu         | `<ScrollNavButton accent="#3a6bf0" accentAlt="#4a7dff" />`        |
| muzicmania    | `<ScrollNavButton accent="#00f0ff" accentAlt="#ff33cc" className="[.is-fullscreen_&]:hidden" hidden={pathname==='/play'} />` |
| ciszubot      | `<ScrollNavButton accent="#00d4ff" accentAlt="#ff33cc" />`        |
| ciszukoantony | `<ScrollNavButton accent="#3d6adf" accentAlt="#ff33cc" />`        |

> **Cómo crear un navbutton nuevo** (ej: "goMiddle"): extender `ScrollNavButton` o replicar su
> patrón con `window.scrollTo({ top: <destino>, behavior: 'smooth' })`.

---

## 7. Theme (dark/light)

**No hay store global compartido** — cada web implementa su persistencia, pero el mecanismo
visual es el mismo: togglear una clase en `<html>` + script anti-FOUC en el `<head>`.

| Web           | Mecanismo                            | Clase    | Persistencia                     |
| ------------- | ------------------------------------ | -------- | -------------------------------- |
| ciszu         | Store Zustand`setTheme`              | `.light` | `localStorage ciszu_preferences` |
| muzicmania    | Store Zustand`setDarkMode`           | `.light` | `localStorage ciszu_preferences` |
| ciszubot      | Toggle local + script anti-FOUC      | `.dark`  | `localStorage ciszu_preferences` |
| ciszukoantony | Store Zustand`setTheme`              | `.light` | `localStorage ciszu_preferences` |

**Puntos de entrada del toggle**:

- **Navbar sidebar** (cabecera del menú hamburguesa): botón sol/luna.
- **Footer** (barra inferior): toggle funcional en las 4 webs.
- **PreferencesPanel** (modal de preferencias locales): toggle.

> **Unificado**: las 4 webs persisten el tema en `localStorage ciszu_preferences` con script
> anti-FOUC inline. ciszubot mantiene la clase `.dark` (claro por defecto en `:root`); las demás
> usan `.light` (oscuro por defecto). La semántica de clases difiere por diseño de CSS, pero la
> persistencia y el comportamiento del toggle son los mismos.

---

## 8. Idioma / Lenguaje

**Selector**: mismo patrón en las 4 webs — botón en la cabecera del sidebar que abre la vista
`'lang'` con la lista de banderas; botón "LANG" en el Footer abre el mismo sidebar.

| Web           | Mecanismo                                             | Idiomas activos                | Persistencia                     |
| ------------- | ----------------------------------------------------- | ------------------------------ | -------------------------------- |
| ciszu         | Store`setLanguage` + `usePageTitle`                   | es/en (resto toast beta)       | `localStorage ciszu_preferences` |
| muzicmania    | Store`setLang` + `usePageTitle`                       | es/en (resto toast beta)       | `localStorage ciszu_preferences` |
| ciszubot      | **i18n server-side** (`getDict`) + `router.refresh()` | ES-LA/EN-US (resto toast beta) | cookie`ciszubot_lang`            |
| ciszukoantony | Store`setLanguage` (mapea a 'EN'/'ES')                | EN-US/ES-LA (resto toast beta) | `localStorage ciszu_preferences` |

**Diferencia clave**: ciszubot hace i18n **real server-side** (diccionarios `lib/i18n.ts`) y usa
`router.refresh()` para re-renderizar RSC sin recargar. Las otras 3 solo cambian el título/flag
(store), sin traducir contenido real. **Decisión (24 ago 2026)**: cada web conserva su motor de
i18n (server-side ciszubot; store es/en las demás); se unifica la **UX del selector** en las 4.

**Componente compartido**: `LanguagesModal` (`@ciszu/ui`, `auth/LanguagesModal.tsx`) — selector
en modal centrado con botón atrás; usado por ciszu y ciszukoantony (PreferencesPanel). muzicmania
y ciszubot usan la lista inline del sidebar, con el mismo gating.

> **Regla unificada**: los 4 regionales `es-la`, `es-es`, `en-us`, `en-uk` son seleccionables
> (mapeados a es/en en ciszu/antony, individuales en muzicmania, es/en en ciszubot). El resto
> (pt/fr/it/de/ru/ja/ko) se muestra **bloqueado con badge "Beta"** y toast de no disponible.

---

## 9. Navbar, Header y Menú Hamburguesa

### 9.1 Navbar (por-web, mismo patrón)

Cada web tiene su `Navbar.tsx` local. El patrón es idéntico: **header fijo + botón hamburguesa
siempre visible + sidebar contextual slide-right de 320px + buscador full-width + dropdown de
cuenta**.

| Web           | Archivo                                         | Detalle                                                       |
| ------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| ciszu         | `src/components/layout/Navbar.tsx` (753 líneas) | Dropdowns desktop con hover timer; loader verde de navegación |
| muzicmania    | `src/components/layout/Navbar.tsx` (681 líneas) | `PreferencesModal` con panel; audio global                    |
| ciszubot      | `src/components/layout/Navbar.tsx` (780 líneas) | `PreferencesModal` + panel local; botón Invitar Discord       |
| ciszukoantony | `src/components/layout/Navbar.tsx` (556 líneas) | Header transparente sin scroll; dropdown "Info" con submenú   |

**De `@ciszu/ui`** que usa el Navbar (todas): `useZoomStatus`, `publishHeaderMode`,
`PreferencesModal`, `useToast`, `SmartImage`, `Icon`. El resto (iconos, links, LANGS, buscador)
es local.

### 9.2 Menú hamburguesa + Sidebar (sliderbar)

- **Botón**: hamburguesa (`Menu`/`X`) siempre visible, junto al buscador.
- **Sidebar**: panel fijo derecho de **320px** con animación slide-right, dos vistas:
    - `sidebarView: 'main'` — navegación + info/soporte + cuenta.
    - `sidebarView: 'lang'` — selector de idiomas (banderas).
- El estado vive en el store por-web (`isMenuOpen`, `sidebarView`).
- El **Footer** puede abrir el sidebar en vista idioma (`setIsMenuOpen(true); setSidebarView('lang')`).

> **Cómo abrir el sidebar desde cualquier componente**: `useAppStore()` → `setIsMenuOpen(true)` +
> `setSidebarView('main' | 'lang')`.

### 9.3 Island system (header flotante vs full)

El Navbar publica su modo al sistema de disclaimers:

- `floating = scrolled && !isSearchOpen && !isMenuOpen && !isZoomWarning` (varía levemente por web).
- Si `floating` → modo `island` (pill flotante `top-3 inset-x-3`, altura ~14) vía
  `publishHeaderMode('island')`.
- Si no → modo `full` (pegado arriba, altura 64/60px) vía `publishHeaderMode('full')`.
- El `DisclaimerStack` usa ese modo para posicionar los avisos sin solaparse.

---

## 10. Footer (por-web, mismo patrón)

| Web           | Archivo                                  | Detalles                                                                              |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| ciszu         | `src/components/layout/Footer.tsx`       | 3 columnas de links, social glows, WhatsApp/Discord, GitHub Open Source, tech credits |
| muzicmania    | `src/components/layout/Footer.tsx`       | 7 iconos sociales, WhatsApp/Discord, Open Source                                       |
| ciszubot      | `src/components/layout/Footer.tsx`       | 6 iconos sociales, Invitar Discord, texto vía i18n                                    |
| ciszukoantony | `src/components/layout/Footer.tsx`       | WhatsApp (teléfono real), Discord, badge trademark                                    |

**Elementos comunes**: logo, iconos sociales con glow, enlace Open Source/GitHub, botones
WhatsApp/Discord, **`ScrollNavButton`** (esquina inf-derecha), **theme toggle** y **botón LANG**
(abre sidebar en idiomas).

---

## 11. Notificaciones / Toasts

**Sistema unificado en `@ciszu/ui`**: `ToastProvider` + `useToast` (`Toast.tsx`). El provider se
monta en los 4 layouts y renderiza un **stack centrado inferior** (`fixed bottom-10`, z-1000) con
píldoras oscuras, punto pulsante, auto-ocultado (3.5s) y **colores por tipo** (25 ago 2026):
`info` = **azul** · `success` = **verde** · `warning` = **ámbar** · `error` = **rojo**.
`toast('msg')` (info) · `toast('msg', 'success'|'warning'|'error')`.

```tsx
// layout: envolver la app
<ToastProvider>...</ToastProvider>

// cualquier componente cliente
const { toast } = useToast();
toast('Listo', 'success');
```

| Web           | Consumo                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| ciszu         | `useToast` en Navbar/Footer/PreferencesPanel/AuthMenu/login/register            |
| muzicmania    | `useToast` en Navbar/Footer/PreferencesPanel/páginas (incl. support con tipos)  |
| ciszubot      | `useToast` en Navbar/login/register                                             |
| ciszukoantony | `useToast` en Navbar/Footer/PreferencesPanel/login/register                     |

**Otras capas de notificación**: `GlobalAdvisor` (anuncios del admin, bottom-14 z-1100, por
encima del toast) y `BetaDisclaimer`/`DisclaimerStack` (banners superiores).

> El sistema antiguo por-web (GlobalToast, store `showToast`, toasts abajo-derecha de
> ciszukoantony) fue **eliminado el 24 ago 2026**.

---

## 12. Auth (botón/cuenta global)

Ver `AUTH_SYSTEM.md` para la estrategia general (Supabase-first, N1 hoy). Aquí el **contrato de
UI**:

- **Dropdown de cuenta** en el Navbar (todas las webs): muestra avatar + nombre o botón
  `Login/Register`. Incluye invitado (`GuestXXXXXX`) y Discord (ciszubot).
- **`AuthMenu`** (ciszu, ciszukoantony): componente local de dropdown auth con exclusividad
  mutua con el menú hamburguesa.
- **Componentes compartidos de `@ciszu/ui`** (`auth/`): `AuthField`, `PasswordStrengthBar`,
  `OAuthProviders` (Google/Microsoft/Discord), `CiszuIdBrand`, `AuthSecondaryActions`,
  `PreferencesModal`, `LanguagesModal`. Detalle: `LOGIN_REGISTER_PROTOCOLS.md`.
- **Páginas**: `/login` y `/register` en las 4 webs (App Router), con guard Cloudflare + auth
  Supabase.

> **Diferencias**: ciszubot usa auth Discord manual + sesión HMAC (SSR `lib/auth.ts`);
> muzicmania usa Supabase Auth (login por `@username`, reCAPTCHA). Ver `AUTH_SYSTEM.md` §2.

---

## 13. Otros sistemas globales de `@ciszu/ui`

| Sistema                                                               | Archivo                                     | Descripción                                                                                                                                     |
| --------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **CloudflareGuard**                                                   | `CloudflareGuard.tsx`                       | Guard de acceso con Turnstile (widget global, 4 hostnames). Props:`siteKey`, `logo`, `title`, `subtitle`, `accent`, `storageKey`, `verifyPath`. |
| **SmartImage**                                                        | `SmartImage.tsx`                            | Imagen Capa 4→3 con fallback en cadena (`resolveDelivery`: `[webp, original]`).                                                                 |
| **PwaRegister / InstallPdwaButton**                                   | `PwaRegister.tsx` / `InstallPdwaButton.tsx` | Service worker / botón instalación PDWA.                                                                                                        |
| **PostHogAnalytics**                                                  | `PostHogAnalytics.tsx`                      | Analytics (no pisa Cloudflare Web Analytics).                                                                                                   |
| **Modal**                                                             | `Modal.tsx`                                 | Dialog accesible Radix (focus trap + teclado).                                                                                                  |
| **Button / RichText / VinylDisc / ScrollSpy / FlagIcon / SocialIcon** | `src/*.tsx`                                 | Atoms portados desde los proyectos.                                                                                                             |
| **CopyWithButton**                                                    | `CopyWithButton.tsx`                        | Botón copiar (sistema anti-copy).                                                                                                               |

---

## 14. Diferencias por web (resumen para estandarizar)

| Sistema           | ciszu                      | muzicmania                  | ciszubot                  | ciszukoantony                              |
| ----------------- | -------------------------- | --------------------------- | ------------------------- | ------------------------------------------ |
| Theme             | store+localStorage`.light` | store+localStorage`.light`  | cookie`.dark`             | store+localStorage`.light`                 |
| Idioma            | store (es/en)              | store (es/en)               | **i18n server** + refresh | store (ES/EN)                              |
| Toast             | GlobalToast bottom         | Footer bottom-center        | pill Navbar bottom        | Navbar bottom-center + Footer bottom-right |
| CloudflareGuard   | `@ciszu/ui`                | **local**                   | `@ciszu/ui`               | `@ciszu/ui`                                |
| QueryProvider     | no                         | no                          | **sí (React Query)**      | no                                         |
| Header sin scroll | full                       | full                        | full                      | **transparente**                           |
| main padding      | none                       | `pt-20`                     | `pt-[60px]`               | none                                       |
| Metadata SEO      | layout fijo                | `generateMetadata` por ruta | layout fijo               | `generateMetadata` por ruta                |

---

## 15. Cómo extender los sistemas (guías rápidas)

### Crear un disclaimer nuevo (p.ej. "descuento X")

```tsx
// Componente montado bajo <DisclaimerProvider>
const { push } = useDisclaimer();
push({ id: 'descuento-x', kind: 'info', message: '¡Descuento X activo!', onClose: () => {} });
```

### Crear un botón flotante nuevo (p.ej. "confeti")

```tsx
// Montar bajo <FabStackProvider>
const bottom = useFabStack('confeti', visible ? { order: 2, height: 36 } : null);
// <button style={{ position: 'fixed', bottom, left: 16 }} onClick={celebrar} />
```

### Crear un navbutton (p.ej. "goMiddle")

```tsx
// En el Footer de cada web, junto a goTop/goDown:
<button
    onClick={() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })}
>
    {IcoMiddle}
</button>
```

### Abrir el sidebar / selector de idioma desde cualquier componente

```tsx
const { setIsMenuOpen, setSidebarView } = useAppStore();
setIsMenuOpen(true);
setSidebarView('lang'); // o 'main'
```

### Publicar el modo del header (para que los disclaimers se posicionen)

```tsx
import { publishHeaderMode } from '@ciszu/ui';
publishHeaderMode('island' | 'full');
```

---

## 16. Referencias

- `UI_COMPONENTS_SYSTEM.md` — ecosistema de componentes de `@ciszu/ui` (Storybook, tests, publicación).
- `STYLES_SYSTEM.md` — tokens, temas (dark/light), Tailwind.
- `AUTH_SYSTEM.md` — estrategia de autenticación (Supabase-first).
- `LOGIN_REGISTER_PROTOCOLS.md` — UI/branding/reglas de CISZU ID.
- `PACKAGES_SYSTEM.md` — paquetes compartidos (contratos de `@ciszu/ui`, `@ciszunetwork/cdn`).
- `GLOBAL_ADVISOR_SYSTEM.md` — sistema de mensajes globales del admin (anuncios en las webs).
- `TODO.md` — tareas pendientes de estandarización.

---

_Última revisión: 24 ago 2026. Mantener este documento vivo._
_Relacionados: UI_COMPONENTS_SYSTEM · STYLES_SYSTEM · AUTH_SYSTEM · PACKAGES_SYSTEM · GLOBAL_ADVISOR_SYSTEM · TODO.md_
