# Estado del Proyecto MuzicMania 2.1.1 (Next.js Edition)

**Última actualización:** 2026-11-10
**Autor y Propietario:** Ciszuko Antony (Francisco Garcia)
**Stack:** Next.js 15 + TypeScript + Tailwind CSS v4 + Supabase + Tauri

## Tienda y economía MuziPoints (4 Nov 2026)

- Fase 1 implementada: wallet/ledger, catálogo de cosméticos, compra/equipamiento, paquetes MZP, invoice NOWPayments, webhook firmado, estado de orden y gate 18+.
- La edad de compra vive en `muzicmania.purchase_credentials` (privada); no se exponen términos ni fecha de nacimiento en el perfil público.
- La tienda está integrada en `/play` y las skins premium `prism`, `ember` y `void` requieren compra; las skins clásicas siguen gratis.
- NOWPayments cripto está activo en producción (`PAYMENTS_CRYPTO_ENABLED=true`); se validó invoice real e idempotencia. Tarjetas y PayPal siguen bloqueados.
- Fases 2–3 implementadas: login diario, rachas, tareas, XP, recompensas por publicar niveles/likes, regalos de MZP, donaciones a creadores y código de creador (5% de MZP base).
- Fase 4 pendiente por bloqueo externo: tarjetas/PayPal requieren proveedor MoR aprobado y mayoría de edad; la UI muestra “próximamente” y los flags están en false.
- Documentación: `STORE_ECONOMY_PLAN.md` y `STORE_ECONOMY_PHASE1_IMPLEMENTATION_PLAN.md`.

## 🛠️ Pendientes Próximos (Prioridad Alta)

1. **Desbloqueo de Vercel**: la plataforma está pausada por fair use hasta el 7 de diciembre de 2026; hasta entonces no hay deploy ni validación online de OAuth, economía o notificaciones.
2. **Payout/refund real**: los reembolsos y retiros son solicitudes con revisión manual; falta integración automática con el proveedor de pagos.
3. **Taskbar automática**: `TaskbarManager` funciona, pero el anclaje automático de Windows 11 requiere un escritorio interactivo; el botón manual del hub es el fallback.
4. **App móvil nativa**: solo existe el plan (`MOBILE_LAUNCHER_PLAN.md`); Android Studio/Xcode y firma siguen bloqueados.
5. **Recaptcha v3 / Turnstile**: revisar protección de formularios y eliminar cualquier fallback hardcodeado al rotar claves.

## 📄 Documentación legal y transparencia (10 Nov 2026)

- Actualizados `terms`, `policy`, `guidelines`, `rules` y `license` con MZP/NOWPayments, reembolsos y retiros manuales, promociones, notificaciones, contenido de usuario, copyright, avatares y anticheat.
- Añadida navegación legal compartida en todas las páginas legales y sección de transparencia del anticheat en `/information` y `/about`.
- Reglas nuevas para subida de niveles/charts, fotos de perfil y canciones con copyright; límites técnicos alineados con `/api/levels` y `/api/profile/avatar`.
- `ANTICHEAT_SYSTEM.md` (ciszu) sigue siendo la fuente técnica: señales ponderadas, umbrales, strikes, sanciones y apelaciones.

## 🔐 Auditoría de seguridad (10 Nov 2026)

- `muzicmania.profiles` ya no expone `email`, `phone` ni `birth_date` a anon; la escritura propia se limita a columnas de perfil/preferencias y `role/is_admin/xp/level` quedan server-only.
- `muzicmania.scores` perdió INSERT/UPDATE/DELETE directo; la única vía es `submit_game_score` como `SECURITY DEFINER` con validación de usuario.
- **Bug de puntuaciones corregido**: el RPC insertaba `combo`/`grade`/`perfect`/`great`/`good`/`miss`, columnas que faltaban en `muzicmania.scores`; se restauraron y el guardado volvió a funcionar (probado en transacción).
- `custom_levels`, `multiplayer_rooms`, `multiplayer_room_players`, `chat_messages`, `friend_requests` y `notifications` usan service_role desde sus APIs; no aceptan DML directo del navegador.
- `public.sanctions` dejó de exponer IP y motivo a anon; 2FA, elevaciones staff, IP bans y auditoría de moderación quedaron server-only.
- Migraciones aplicadas localmente (gitignored): `20261110000001_security_hardening_public_tables.sql`, `20261110000002_security_hardening_public_sensitive.sql`, `20261110000003_security_hardening_sanctions_actor.sql`, `20261110000004_security_hardening_user_roles_columns.sql` y `20261110000005_scores_restore_columns.sql`.

## 🚀 Logros Recientes

### 🏗️ Arquitectura y Layout
- ✅ **MainLayout** unificado con Navbar y Footer.
- ✅ **Navegación Centralizada**: `src/config/navigation.tsx` como fuente única de verdad.
- ✅ **Refactorización Global**: Navbar y Footer eliminaron +200 líneas de código duplicado.

### 🛡️ Seguridad y Base de Datos (Auditoría Completada)
- ✅ **Supply Chain**: Migración de npm a `pnpm` (ignore-scripts=true) para bloquear exploits de dependencias.
- ✅ **Anti-XSS**: Verificación total de renderizado nativo React. Prohibido el uso de `dangerouslySetInnerHTML`. Documentado en protocolos IA.
- ✅ **Migración DB Local**: Implementación de la CLI de Supabase (`supabase db push/reset`). Código SQL unificado en `/supabase/migrations`.
- ✅ **Score Seguro (RPC)**: Creación de la función `submit_game_score` ejecutada en backend para evitar manipulación de puntajes desde cliente.

### 📄 Páginas Implementadas
- ✅ **`credits/page.tsx`** — Rediseño cinematográfico estilo End Credits.
- ✅ **`page.tsx` (Home)** — Rediseño integral completado con módulo premium de descargas.
- ✅ **`download/page.tsx`** — Centro de descargas avanzado con verificador del compilador de Windows.
- ✅ **`library/page.tsx`** — Librería de tracks con reproductor, favoritos, Supabase likes.
- ✅ **`changelog/page.tsx`** — Sistema de changelogs con tags, likes, estadísticas.
- ✅ **`stats/page.tsx`** — Página `/stats` leyendo métricas reales desde `muzicmania_stats` (Supabase).
- ✅ **`support/page.tsx`** — Página `/support` con sistema de tickets (tabla `muzicmania_tickets`) y AuthWarningModal.
- ✅ **`contact/page.tsx`** — Actualizada con datos de contacto reales.
- ✅ **`forum/page.tsx`** — Actualizada con embed de Discord.
- ✅ **`reviews/page.tsx`** — Actualizada con sistema de reseñas.

### 🎮 Página de Juego `/play` — Rework (En Progreso)
- ✅ **`src/data/tracks.ts`** — 6 canciones con: `bgColor`, `hexColor`, `hexColor2`, `colorKey`, `getStarColor()`, `TRACK_COLOR_MAP` estático.
- ✅ **`src/data/charts.ts`** — Generador algorítmico de charteo basado en BPM y dificultad (seeded random).
- ✅ **`src/hooks/useGameEngine.ts`** — Motor reescrito con:
  - Flechas estilo FNF dibujadas en Canvas (contorno blanco, fill neon).
  - Flash visual por carril al presionar tecla.
  - Nombres de acordes: DUET (x2), TRIPLE (x3), RAINBOW MAX (x4).
  - Contador KPS (teclas por segundo), mistakes, barra de progreso en Canvas.
  - Fondo único por canción (usando `bgColor`/`hexColor`/`hexColor2`).
  - Judgment flash animado (PERFECT/GREAT/GOOD/MISS) sobre notas.
- ⚠️ **`src/app/play/page.tsx`** — Página multi-fase rediseñada y optimizada:
  - Fases: Disclaimer → Tutorial → Menú → Juego → Resultados ✅
  - ✅ Selector de tracks avanzado con scroll, buscador de texto y filtros dinámicos (Dificultad, Favoritos, Recientes).
  - ✅ Info de track en tiempo real: BPM, duración, dificultad con estrellas reactivas y estadísticas de última partida.
  - ✅ Rediseño cinematográfico de la fase 'welcome' con imagotipo completo (isotipo + logotipo) y efectos neon hero.
  - ✅ Corrección del selector 'Custom' en la fase de introducción con mapeo WASD por defecto.
  - ✅ Mejora crítica de legibilidad en el menú de pausa con overlays densos y botones de alto contraste.
  - ✅ Corrección de centrado del countdown (1, 2, 3) en gameplay.
  - ✅ KPS/mistakes/progreso sincronizados en tiempo real.

### 🎨 Sistema de Estilos
- ✅ **`globals.css`**: Tokens de color neon, animaciones, scrollbar custom.
- ✅ **Icon System**: Librería `I` de SVGs nativos para rendimiento máximo.

### 🔧 Correcciones de Build
- ✅ `.color` → `.colorKey` en `play/page.tsx`, `library/page.tsx`, `page.tsx`.
- ✅ `React.Suspense` en lugar de `Suspense` named export.
- ✅ Llamada a `useGameEngine` actualizada con 5 parámetros (canvasRef + 4 colores/duración).
- ✅ `canvasRef` tipado como `RefObject<HTMLCanvasElement | null>`.

### 🚨 Correcciones Post-Deploy (Producción)
- ✅ **Fix Vercel 403:** Se eliminó la cabecera `X-Frame-Options: DENY` en `vercel.json` para permitir la previsualización del sitio dentro de los iframes del dashboard de Vercel.
- ✅ **Fix Audio Global (`/play`):** Se añadió el guardado del `AudioContext` en Zustand (`useAppStore`) y se invoca `audioContext.resume()` al encender la música para saltar las políticas estrictas de autoplay en navegadores.
- ✅ **Fix UI Logotipo (`/information`):** Se corrigió el desbordamiento del branding limitando el Logotipo a `w-64` en vez de `w-full` en la vista desktop (`xl:flex-row`), evitando que el texto se salga de la pantalla con zoom.

### 📦 Instaladores (Tauri & NSIS)
- ✅ **Instalador custom real:** NSIS 2.3.1 perMachine con UAC de administrador, UI WebView2, 18 idiomas con banderas y lista custom, inglés por defecto, licencia, ruta, progreso, cancelación con rollback, atajos, bienvenida y despedidas. Artefacto final de ~11.6 MB (ya no placeholders de 971 bytes).
- ✅ **Build reproducible:** `launcher/build-installer.ps1` compila, parchea, copia a `website/public/downloads/` y `launcher/downloads/` y verifica tamaño.
- ✅ **Descarga online:** Release `muzicmania-v2.1.1` con assets para Windows 10/11; el API route redirige al release si no existe el archivo local.
- ✅ **Launcher pre-game:** inicializador, update checker GitHub con descarga progressiva/reintentos/omitir offline, tutorial de primera ejecución, hub maximizado online/offline, invitado local, cuenta CISZU ID, sesión persistente, ajustes, redes y soporte. Ver `MOBILE_LAUNCHER_PLAN.md` para Android/iOS.
- ✅ **Anclaje a taskbar:** check final que encola `LAUNCH_PIN`/`PIN_ONLY`; Windows 11 usa `TaskbarManager` con diálogo de confirmación y Windows 10 el verbo Shell clásico. Si no está permitido, diálogo nativo topmost con instrucciones y `shell:AppsFolder`; AUMID y shortcut de Menú Inicio sincronizados.
- ✅ **Desinstalador custom:** UI propia v2.1.0 con versión/ruta/espacio, conservación o borrado de datos locales, feedback opcional, progreso y logs. Integrado en el hub y en el desinstalador de Windows; si no detecta instalación muestra vista "not installed" con descarga y soporte.
- ✅ **Roadmap visual compartido:** `roadmap.css/js` en instalador (6 etapas) y desinstalador (3 etapas), con completados verdes, bloqueados con candado, error rojo en todo el recorrido y navegación hacia atrás solo por etapas completadas.
- ✅ **Marca y soporte:** logo real `logo.svg` compartido, footer con copyright, versión, 6 redes sociales, WhatsApp de soporte y selector rápido de idioma; enlaces externos vía `open_url`.
- ✅ **Pulido UI:** rate limits de 500–1200 ms en acciones, hints de licencia, validación de rutas/espacio, easter egg de 5 clics al logo, botones de error con iconos y colores, y advertencias de red/soporte.
- ✅ **Modo offline jugable:** ventana local maximizada con las 4 pistas oficiales de Genesis Neon, charts generados, selector de dificultad y récords locales en localStorage.
- ✅ **Detección de instalación:** si MuzicMania ya existe, el setup muestra versión/ruta y permite actualizar/reinstalar, abrir el desinstalador o cerrar. El arranque normal ya no muestra una pantalla de instalación completada.
- ✅ **Bloqueo de Atajos:** Bloqueados teclas del navegador (F3, F5, F11, Ctrl+P, Ctrl+R, DevTools, etc.) en instalador y launcher.
- ✅ **Facturación y códigos:** `/profile/billing` con historial de compras, solicitudes de reembolso, canje de códigos promocionales y solicitudes de retiro (revisión manual). Los artículos comprados también se pueden regalar desde el inventario.
- ✅ **Rangos y medallas:** rangos Wood/Stone/Iron/Gold/Platinum/Diamond/Obsidian/Legend por nivel, badge de rango automático, staff y empresa verificada; los badges de logros existentes se muestran en perfil y leaderboard.
- ✅ **Leaderboard avanzado:** filtros diario/semanal/mensual/anual sobre `scores`, búsqueda, orden, rango de cuenta y hasta 3 badges destacados por jugador.
- ✅ **Migraciones fase 5/7/8:** `20261109000001_phase5_finance_ranks.sql`, `20261109000002_rank_badges_backfill.sql`, `20261109000003_rank_badges_extra.sql`, `20261109000004_notifications_friends.sql` y `20261109000005_notifications_status.sql` aplicadas.
- ✅ **Notificaciones:** campana junto a la cuenta con badge, slider de 50 actividades, filtros por logro/social/amistad/compras/seguridad, búsqueda, marcar leído y página completa `/notifications`. Incluye notificaciones automáticas de badges, solicitudes de amistad, sanciones y cambios de reembolso/retiro.
- ✅ **Amistad:** solicitudes desde el perfil, aceptar/rechazar desde la campana y notificaciones de resultado.
- ✅ **STAFFCON Finanzas:** bandeja de reembolsos/retiros y generador/listado de promociones en `MUZICMANIA FINANZAS`, con auditoría y sin exponer la service role; devcon ya no muestra esta opción.
- ✅ **Offline Screen:** Pantalla de error con botón para jugar en `Modo Offline` local y botón de salir.
- ✅ **Ventana de Launcher:** `always_on_top` y tamaño ampliado para el primer inicio.

### 🆕 Nuevas Páginas y Características (10 Sep 2026)
- ✅ **Stats**: Página `/stats` leyendo métricas reales desde `muzicmania_stats` (Supabase).
- ✅ **Changelog**: Página `/changelog` con filtros, búsqueda, orden, paginación y likes con login.
- ✅ **Support**: Página `/support` con sistema de tickets (tabla `muzicmania_tickets`) y AuthWarningModal.
- ✅ **Disclaimer Actions**: Soporte de botones de acción (`--action "Texto|URL"` o `--action "OK|close"`) en devcon y componente `DisclaimerStack`.

