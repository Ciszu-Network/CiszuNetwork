# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Frontend — estructura y diseño de páginas (frontend task del 12 ago 2026)

**Fase 1 — Títulos de páginas** ✅ HECHA (`a3bb82d`): formato `SITE | SECCIÓN` en las 4 webs (metadata server en ciszunetwork/ciszubot, hook `usePageTitle` en ciszukoantony/muzicmania).

**Fase 2 — Modificaciones visuales (PENDIENTE)**
- Rediseñar el header y footer de **ciszukoantony** y **ciszunetwork** para adoptar el estilo de muzicmania/ciszubot (los 2 tipos de diseño actuales deben quedar en 1: el de muzicmania).
- Implementar en ciszubot las **animaciones reactivas** que ya tiene muzicmania.
- Cada web debe tener: logo maestro, separador, nav, menú hamburguesa, buscador, zona de cuentas, iconos, animaciones fluidas, footer cargado con copyright, botones de idioma y tema.

**Fase 3 — PWA (Descargas) + Feedback (PENDIENTE)**
- En las 4 webs: añadir una sección **Descargas (PDWA)** y una **página Feedback** completa.
- Cambiar el estilo de los botones "reportar un problema" para que se integren con el botón flotante del PDWA, colocándolo debajo/al lado y con su X de cerrar.
- Al cerrar con la X, mostrar una advertencia que recuerde que se puede navegar a las páginas (descarga/feedback) para reactivar el botón flotante.

**Fase 4 — Logos y errores visuales** ✅ HECHA (13 ago 2026)
- ciszukoantony home: el isotipo del hero ahora va a la IZQUIERDA del título, la imagen del canal de YouTube a la derecha (`content/assets/youtube_canal.png`, avatar real del canal `@CiszukoAntony`), y el favicon = icono del canal.
- ciszunetwork: reemplazadas las 6 referencias al isotipo/logotipo de ciszukoantony por los de Ciszu Network (`ciszu_logo_isotipo_outline_zcolor_ccolor.svg` en layout/Navbar/Footer/about + `ciszu_logotipo_outline_zcolor_cwhite_full.png` en el hero), título HTML de ciszu network convertido a `sr-only` (lo muestra el logotipo) y tagline "Bright Future Promised" ampliado y más visible.