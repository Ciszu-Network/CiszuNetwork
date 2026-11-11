# Historial del Proyecto MuzicMania

Este documento registra los hitos importantes, correcciones y evoluciones del proyecto.

## 10 de Noviembre, 2026

### Documentación legal, anticheat y reglas de contenido

- **Legal**: reescritos los términos, la política de privacidad, las directrices, las reglas y la licencia de MuzicMania para reflejar MZP/NOWPayments, compras 18+, reembolsos y retiros con revisión manual, promociones, notificaciones, CISZU ID/OAuth, datos del anticheat y retención.
- **Contenido de usuario**: nuevas reglas para subida de niveles/charts, límites técnicos, fotos de perfil (JPEG/PNG/WebP ≤5 MB), canciones con copyright y reclamaciones de titularidad.
- **Anticheat**: sección de transparencia en `/information` y `/about`; se aclaró que el análisis es servidor-side, no instala drivers de kernel ni escanea archivos/procesos, y que las sanciones automáticas se apelan con revisión humana.
- **Navegación legal**: componente compartido en `/terms`, `/policy`, `/guidelines`, `/rules` y `/license`; fechas y metadatos del portal actualizados al 10 nov 2026.
- **Auditoría documental**: fechas de revisión refrescadas en la documentación de MuzicMania, Ciszu Network, Ciszubot y CiszukoAntony.

## 9 de Noviembre, 2026

### Launcher, notificaciones, rangos y finanzas

- **Launcher**: auto-instalación de updates con cuenta atrás, toast nativo al finalizar, botón manual de anclaje a taskbar y navegación de sesión CISZU ID.
- **Release**: `muzicmania-v2.1.1` publicado para Windows 10/11; instalador NSIS 2.3.1 y desinstalador 2.1.0.
- **Economía y perfiles**: facturación en `/profile/billing`, reembolsos/retiros como solicitudes, códigos promocionales, regalos, rangos y badges, leaderboard por periodos.
- **Notificaciones**: campana, página `/notifications`, amistades y avisos automáticos de logros, sanciones y comercio.
- **STAFFCON**: bandeja `MUZICMANIA FINANZAS` con acceso restringido; devcon retiró la opción.

## 31 de Enero, 2026

### Reparacion Masiva de Encoding UTF-8
- **Problema Critico**: Los archivos HTML mostraban caracteres corruptos (mojibake) al ejecutar en localhost.
- **Causa**: Archivos guardados con BOM UTF-8 interpretados incorrectamente multiples veces.
- **Solucion Implementada**:
  - Se crearon backups de los 17 archivos HTML.
  - Se desarrollaron scripts de reparacion (`repair_scripts/fix_encoding_final.py`).
  - Se repararon **todos los 17 archivos HTML** del proyecto.
- **Verificacion**: Se confirmo que no quedan patrones de encoding corrupto en ningun archivo.

### Refactorizacion de Navegacion y Quick Dock
- **Quick Access Dock**: Sistema unificado de accesos rapidos para paginas de informacion inyectado via `layout.js`.
- **Navegacion**: Reordenacion de menus siguiendo una jerarquia logica de secciones.

---

## 1 de Febrero, 2026

### Refinamiento de Layout y Escala (Optimizacion de Zoom)
- **Alineacion Horizontal de Identidad**: Logo y titulo ahora residen en una disposicion horizontal, creando una marca unificada y ahorrando espacio vertical critico.
- **Optimizacion Radical de Escala (Zoom 100%)**:
    - Ajustado el tamano del logo a **150px**.
    - Reduccion de paddings del Hero a **3.5rem** (Superior) y **7rem** (Inferior).
    - Titulo reescalado con `clamp` mas compacto para asegurar visibilidad total "Above the Fold".
- **Scroll Indicator Circular**: Implementado icono de desplazamiento con un **contorno circular neon** y mayor separacion vertical.

### Home Hero y Acceso Directo a Juego
- Hero ahora con enlace directo a `/play` con boton "ACCEDER AL JUEGO".
- Animaciones de entrada en el Hero con Framer Motion.

---

## 3 de Febrero, 2026

### Paleta de Colores Neon y Saturacion Global
- **Aumento de Saturacion**: Incremento de saturacion en todos los elementos clave de la UI con colores mas vivos:
  - `#00D4FF` (Neon Cyan) -> `#00E5FF`
  - `#FF006E` (Neon Pink) -> `#FF007F`
  - `#7000FF` (Neon Purple) -> `#8A2BE2`
  - `#00FF88` (Neon Green) -> `#00FFA3`
- **Ajuste de Brillo**: Se elevaron los valores de brillo en fondos, bordes, sombras y gradientes.
- **Mejora de Contraste**: Botones, tarjetas y textos criticos recibieron mayor peso visual y contraste contra fondos oscuros.

---

## 5 de Febrero, 2026

### Arquitectura de Layout y Navegacion
- **MainLayout**: Implementado layout unificado para el Home y paginas secundarias.
- **Navbar**: Barra de navegacion responsiva con menu movil.
- **Footer**: Pie de pagina con enlaces a redes sociales y licencias.
- **QuickDocks**: Componente de docks de acceso rapido implementado.

---

## 22 de Mayo, 2026

### Migracion Total a Next.js 15
- **Migracion**: Proyecto migrado de HTML/CSS/JS vanilla a Next.js 15 con App Router.
- **TypeScript**: Todos los archivos migrados a TypeScript estricto.
- **Tailwind**: Sistema de estilos migrado a Tailwind CSS v4.
- **Componentes**: Arquitectura de componentes basada en Atomic Design.

---

## 23 de Mayo, 2026

### Integracion Tauri y Build de Escritorio
- **Tauri**: Integracion de Tauri 2 para builds nativos de Windows.
- **Build**: Primer build exitoso de instalador MSI/NSIS.
- **Iconos**: Personalizacion de iconos del instalador con isotipo de MuzicMania.

### Correcciones CI/CD
- **Vercel**: Fix header X-Frame-Options para preview en dashboard.
- **Audio**: Fix AudioContext para politicas de autoplay en navegadores.
- **UI**: Fix desbordamiento de logotipo en pagina de informacion.

---

## 29 de Julio, 2026

### CDN Unificado y Seguridad de Base de Datos
- **@ciszunetwork/cdn**: Integrado `resolveIcon()` y `AssetResolver` en el website.
- **Iconos**: `utils/icons.ts` reescrito como adapter thin que llama a `resolveIcon()`.
- **Hook**: `hooks/useIcon.ts` renombrado a `.tsx` con import React para build correcto.
- **Changelog visual**: Añadida entrada `PATCH V2.4.0` con los cambios CDN/DB/seguridad.
- **Supabase**: Migraciones 08-10 aplicadas con fixes de seguridad y performance.
- **Build**: Lint pasa correctamente.

---

## 10 de Junio, 2026

### Correcciones Tauri y Descargas
- **Centro de Descargas**: Se elimino Windows 11 x86 de AVAILABLE (no compilado). El overlay de descarga ahora muestra "HAZ CLIC EN CUALQUIER PARTE PARA CERRAR". Se elimino el toast rojo duplicado.
- **Metadatos de Instalador**: Se agrego Ciszu Network como publisher y Ciszuko Antony como autor en configuracion de Tauri. Cargo.toml actualizado.
- **Titlebar**: Se agrego manejo de errores (try/catch) a los botones de min/max/close. La barra ahora siempre esta visible al tope de la ventana via MainLayout.
- **Bloqueo de Atajos**: Se agrego bloqueo de F3, F5, F11, F12, Ctrl+P, Ctrl+S, Ctrl+U, menu contextual y arrastre de imagenes en DesktopGuard.
- **Audio del Menu**: Se corrigio la reanudacion de la musica global al volver al menu despues de una partida. Tambien se reanuda al abortar partida.
- **Licencias**: Actualizadas LICENSE.txt del instalador y root LICENSE con Ciszu Network.
- **BUILD.bat**: Se creo script de build automatizado para Windows.

_Última revisión: 10 nov 2026._ Relacionado: `PROJECT_STATE.md`, `CHANGELOG_SYSTEM.md`.
