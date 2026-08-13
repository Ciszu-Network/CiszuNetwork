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

**Fase 5 — Botones flotantes apilados (animación de entrada/salida)**
- Implementar un sistema de botones flotantes inferiores con **entradas y salidas apiladas**: al cerrar uno con la X, el que queda por encima baja/flecha con animación suave; al añadir un botón nuevo (por cualquier motivo), entra con su animación de aparición. Comportamiento inverso simétrico y simple.
- Añadir una **sección/botón de reactivación**: si el usuario descarta el botón flotante con la X, darle una opción (con aviso) para volver a mostrar el botón flotante (preferencia del usuario), que re-dispare el botón con su animación de entrada.

**Fase 6 — Página Descargas PDWA (aclarar soporte por navegador)**
- Especificar visiblemente que la PDWA es **nativa para Chrome/Chromium y Edge**; **Opera NO** instala PDWA de forma nativa y debe mostrar un método alternativo no-PDWA (acceso directo con `--app=URL`). Comportamiento por navegador: cada uno funciona distinto (Firefox → usar Edge/Chrome, Safari → Añadir al Dock, iOS → pantalla de inicio).

**Fase 7 — Footer de ciszubot (estilo MuzicMania)**
- Rediseñar el footer de **ciszubot** al estilo del footer de MuzicMania (es el único sitio con un footer de diseño diferente/disperso).

**Fase 8 — Footer de ciszukoantony (redes propias + botones amplios)**
- En el footer de ciszukoantony usar **solo redes de ciszukoantony** (nunca de ciszunetwork).
- Quitar la sección de redes **duplicada** en el navbar del footer.
- Los números de WhatsApp y el servidor de Discord → **botón más amplio estilo MuzicMania**. Replicar el mismo patrón de botones amplios en la página/site de ciszunetwork pero con las redes de ciszunetwork.

**Fase 9 — "Ciszu Network" (nombre + enlace) en footers**
- Corregir los footers que dicen **"ciszuko network"** → **"Ciszu Network"**.
- Añadir **hipervínculo** a `https://ciszunetwork.vercel.app` donde se mencione Ciszu Network.

**Fase 10 — Logo header/footer de ciszunetwork (Z blanca + logotipo simple)**
- En el header y footer de ciszunetwork, cambiar el **isotipo con la Z azul** por el de la **Z blanca**.
- En lugar de colorear el texto HTML "Ciszu Network", usar el **logotipo simple** (imagen del logotipo).

**Fase 11 — Paridad de navegación (hamburguesa, idioma, tema, buscador, auth)**
- **ciszunetwork**: falta el **menú hamburguesa** — dentro va el toggle de tema e idioma (guiarse por cómo lo tiene ciszukoantony).
- **ciszukoantony**: quitar de las secciones de información las páginas **feedback, descargas, contacto y certificaciones** (no deseadas).
- **ciszubot**: falta el **menú hamburguesa**, el **buscador**, el **sistema de idiomas** (el que usa muzicmania/ciszunetwork) y el **icono de autenticación** (desplegador con opción Discord por ahora, más adelante otros) + el **botón de invitar como icono desplegable** al lado.
- El footer de ciszunetwork es la referencia deseada: **replicar los patrones correctivos del footer de ciszunetwork a ciszukoantony**.
- Cada página de ciszunetwork debe tener un **icono** en el header (el navbar del footer lo cumple; en el header no, especialmente en las secciones).

**Fase 12 — Botones/detalles de UI faltantes**
- **ciszukoantony**: faltan los botones **gotoUp y gotoDown** (los tienen las demás webs).
- **ciszunetwork y ciszukoantony**: falta el **icono de cambiar página/reload verde** (lo tienen muzicmania y ciszubot).
- **ciszukoantony**: falta el **separador logo-navbar** en el header (lo tienen todas las demás).

**Fase 13 — Secciones de páginas fuera de los navbars**
- En ciszunetwork y ciszukoantony, las páginas de secciones (downloads, descargas, soporte, etc.) deben estar **fuera/visibles en los navbars** (ambos), y lo mismo aplica en los **menús hamburguesa**.