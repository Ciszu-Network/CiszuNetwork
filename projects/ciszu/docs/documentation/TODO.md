# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Frontend — estructura y diseño de páginas (frontend task del 12 ago 2026)

**Fase 1 — Títulos de páginas** ✅ HECHA (`a3bb82d`): formato `SITE | SECCIÓN` en las 4 webs (metadata server en ciszunetwork/ciszubot, hook `usePageTitle` en ciszukoantony/muzicmania).

**Fase 2 — Modificaciones visuales** ✅ HECHA (`2b79b0c`)
- Rediseñar el header y footer de **ciszukoantony** y **ciszunetwork** para adoptar el estilo de muzicmania/ciszubot (los 2 tipos de diseño actuales deben quedar en 1: el de muzicmania). ✅ header/footer al estilo MuzicMania en ciszu y ciszukoantony
- Implementar en ciszubot las **animaciones reactivas** que ya tiene muzicmania. ✅
- Cada web debe tener: logo maestro, separador, nav, menú hamburguesa, buscador, zona de cuentas, iconos, animaciones fluidas, footer cargado con copyright, botones de idioma y tema. ✅

**Fase 3 — PWA (Descargas) + Feedback** ✅ HECHA (`5f3554d`)
- En las 4 webs: añadir una sección **Descargas (PDWA)** y una **página Feedback** completa. ✅ (verificado: `src/app/feedback` en las 4 webs + `InstallPdwaButton` en los 4 layouts)
- Cambiar el estilo de los botones "reportar un problema" para que se integren con el botón flotante del PDWA, colocándolo debajo/al lado y con su X de cerrar. ✅ (autoInject off, fab de reportar integrado junto al de PDWA)
- Al cerrar con la X, mostrar una advertencia que recuerde que se puede navegar a las páginas (descarga/feedback) para reactivar el botón flotante. ✅ (fab con dismiss y aviso)

**Fase 4 — Logos y errores visuales** ✅ HECHA (13 ago 2026)
- ciszukoantony home: el isotipo del hero ahora va a la IZQUIERDA del título, la imagen del canal de YouTube a la derecha (`content/assets/youtube_canal.png`, avatar real del canal `@CiszukoAntony`), y el favicon = icono del canal.
- ciszunetwork: reemplazadas las 6 referencias al isotipo/logotipo de ciszukoantony por los de Ciszu Network (`ciszu_logo_isotipo_outline_zcolor_ccolor.svg` en layout/Navbar/Footer/about + `ciszu_logotipo_outline_zcolor_cwhite_full.png` en el hero), título HTML de ciszu network convertido a `sr-only` (lo muestra el logotipo) y tagline "Bright Future Promised" ampliado y más visible.

**Fase 5 — Botones flotantes apilados (animación de entrada/salida)** ✅ HECHA (`aab9432`)
- Implementar un sistema de botones flotantes inferiores con **entradas y salidas apiladas**: al cerrar uno con la X, el que queda por encima baja/flecha con animación suave; al añadir un botón nuevo (por cualquier motivo), entra con su animación de aparición. Comportamiento inverso simétrico y simple. ✅ (FabStack en `packages/ui` con `register`/`unregister`, tests 48/48)
- Añadir una **sección/botón de reactivación**: si el usuario descarta el botón flotante con la X, darle una opción (con aviso) para volver a mostrar el botón flotante (preferencia del usuario), que re-dispare el botón con su animación de entrada. ✅

**Fase 6 — Página Descargas PDWA (aclarar soporte por navegador)** ✅ HECHA (`aab9432`)
- Especificar visiblemente que la PDWA es **nativa para Chrome/Chromium y Edge**; **Opera NO** instala PDWA de forma nativa y debe mostrar un método alternativo no-PDWA (acceso directo con `--app=URL`). Comportamiento por navegador: cada uno funciona distinto (Firefox → usar Edge/Chrome, Safari → Añadir al Dock, iOS → pantalla de inicio). ✅ (disclaimers por navegador en `InstallPdwaButton`)

**Fase 7 — Footer de ciszubot (estilo MuzicMania)** ✅ HECHA (`aab9432`)
- Rediseñar el footer de **ciszubot** al estilo del footer de MuzicMania (es el único sitio con un footer de diseño diferente/disperso). ✅

**Fase 8 — Footer de ciszukoantony (redes propias + botones amplios)** ✅ HECHA (`aab9432`)
- En el footer de ciszukoantony usar **solo redes de ciszukoantony** (nunca de ciszunetwork). ✅
- Quitar la sección de redes **duplicada** en el navbar del footer. ✅
- Los números de WhatsApp y el servidor de Discord → **botón más amplio estilo MuzicMania**. Replicar el mismo patrón de botones amplios en la página/site de ciszunetwork pero con las redes de ciszunetwork. ✅

**Fase 9 — "Ciszu Network" (nombre + enlace) en footers** ✅ HECHA (`aab9432`)
- Corregir los footers que dicen **"ciszuko network"** → **"Ciszu Network"**.
- Añadir **hipervínculo** a `https://ciszunetwork.vercel.app` donde se mencione Ciszu Network.

**Fase 10 — Logo header/footer/favicon de ciszunetwork (Z blanca + logotipo simple)** ✅ HECHA (`8835060`)
- En el header, footer y **favicon** de ciszunetwork, cambiar el **isotipo con la Z azul** por el de la **Z blanca**. ✅ (isotipo `zwhite_ccolor` en Navbar líneas ~300-316 y Footer ~143-161, favicon Z blanca en `app/layout.tsx`)
- En lugar de colorear el texto HTML "Ciszu Network", usar el **logotipo simple** (imagen del logotipo). ✅ (logotipo simple `logotipo_outline_zwhite_cwhite_simple` en header/footer)

**Fase 11 — Paridad de navegación (hamburguesa, idioma, tema, buscador, auth)** ✅ HECHA (`8835060`)
- **ciszunetwork**: falta el **menú hamburguesa** — dentro va el toggle de tema e idioma (guiarse por cómo lo tiene ciszukoantony). ✅ (hamburguesa siempre visible con tema+idioma dentro; sub-links del dropdown Información/Proyectos con iconos por página)
- **ciszukoantony**: quitar de las secciones de información las páginas **feedback, descargas, contacto y certificaciones** (no deseadas). ✅ (dropdown Info de NAV_MAIN sin las 4; ALL_PAGES íntegro para sidebar/buscador/footer)
- **ciszubot**: falta el **menú hamburguesa**, el **buscador**, el **sistema de idiomas** (el que usa muzicmania/ciszunetwork) y el **icono de autenticación** (desplegador con opción Discord por ahora, más adelante otros) + el **botón de invitar como icono desplegable** al lado. ✅ (buscador SEARCH_PAGES, auth icon → "Iniciar sesión con Discord", invite icon desplegable, toggles sincronizados)
- El footer de ciszunetwork es la referencia deseada: **replicar los patrones correctivos del footer de ciszunetwork a ciszukoantony**. ✅ (footer ciszukantony con pills/navegación estilo ciszunetwork)
- Cada página de ciszunetwork debe tener un **icono** en el header (el navbar del footer lo cumple; en el header no, especialmente en las secciones). ✅ (NavSubLink con `icon` en dropdown Información/Proyectos)

**Fase 12 — Botones/detalles de UI faltantes** ✅ HECHA (`8835060`)
- **ciszukoantony**: faltan los botones **gotoUp y gotoDown** (los tienen las demás webs). ✅ (IcoUp/IcoDown flotantes en Footer.tsx)
- **ciszunetwork y ciszukoantony**: falta el **icono de cambiar página/reload verde** (lo tienen muzicmania y ciszubot). ✅ (loader verde isNavigating en ambos Navbars)
- **ciszukoantony**: falta el **separador logo-navbar** en el header (lo tienen todas las demás). ✅ (divider vertical tras el Link del logo)
- **ciszukoantony**: en el header, al igual que en el hero del home, añadir el **icono del canal circular** al lado derecho del logotipo. ✅ (youtube_canal.png circular con ring)

**Fase 13 — Secciones de páginas fuera de los navbars** ✅ HECHA (`8835060`)
- En ciszunetwork y ciszukoantony, las páginas de secciones (downloads, descargas, soporte, etc.) deben estar **fuera/visibles en los navbars** (ambos), y lo mismo aplica en los **menús hamburguesa**. ✅ (ciszunetwork: dropdown Información del header + sidebar hamburguesa con Descargas/Soporte/Feedback y panel siempre visible; ciszukantony: sidebar hamburguesa + footer usan ALL_PAGES completo con Descargas/Feedback/Contact)

**Fase 14 — Hipervínculos de marca (copyright y menciones de proyectos)** ✅ HECHA (`8835060`)
- En los footers que usan la página de X (Twitter) como hipervínculo del copyright, corregirlo: el copyright debe llevar a la **página propia del proyecto** (no a X). ✅ (ciszunetwork: copyright "CISZU NETWORK" ahora apunta a `EXTERNAL_LINKS.ciszunetwork` en vez de X; ciszukantony, ciszubot y muzicmania ya apuntaban a las webs propias)
- **Regla general**: siempre que se mencione uno de nuestros proyectos (Ciszu Network, Ciszuko Antony, MuzicMania, CiszuBot) en cualquier footer/página, debe llevar un **hipervínculo a la página del proyecto** (p. ej. `ciszunetwork.vercel.app`, `ciszukoantony.vercel.app`, etc.). ✅ (verificado en los 4 footers)

**Fase 15 — Footer de MuzicMania desactualizado (menciones con disclaimer)** ✅ HECHA (`8835060`)
- El footer de muzicmania está desactualizado: en el copyright y en varias páginas (contacto, soporte, tema y otras) dice que las páginas de **ciszunetwork y ciszukantony no existen** (error controlado con disclaimer). ✅ (copyright "CISZU NETWORK" ahora es hipervínculo real a `ciszunetwork.vercel.app`; eliminados `handleCiszuClick` del Footer y los disclaimers `handleNoLink` muertos de contact/support y los inline de team)
- **Quitar los disclaimers** de páginas inexistentes y **agregar los hipervínculos reales** a ciszunetwork y ciszukantony. ✅
- Verificar también los hipervínculos/menciones del footer en las **demás webs**. ✅ (ciszunetwork copyright → propia web; ciszukantony/ciszubot ya correctos)

**Fase 16 — Copyrights centrados en los footers** ✅ HECHA (`8835060`)
- En **todos los footers de todas las webs**, el copyright debe quedar **centrado** en el footer. ✅ (quitado `md:text-right` en ciszu/muzicmania y centralizado el bloque en ciszubot; ciszukantony ya centrado)
- Motivo: los botones flotantes laterales los tapan; al centrarlo se deja más espacio debajo del footer para que los **botones flotantes no estorben**. ✅

**Fase 17 — Hover de logos de ciszukantony (header y footer)** ✅ HECHA (`8835060`)
- Los logos del header y footer de ciszukantony tienen **animaciones de hover diferentes entre sí** y no cumplen con el diseño de animaciones de las otras 3 webs. ✅ (quitados `hover:opacity-90`/`hover:scale-105`; aplicado `group-hover:drop-shadow-[0_0_15px_rgba(61,106,223,0.8)]` glow del color de marca en drop-shadow en isotipo + logotipo, consistente en header y footer)
- Aplicar el patrón de las demás: **glow desde atrás llamativo en el color de la marca** (hover consistente en header y footer). ✅