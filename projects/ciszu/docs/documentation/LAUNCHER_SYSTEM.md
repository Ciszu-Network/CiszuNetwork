# LAUNCHER_SYSTEM — Launcher reutilizable de escritorio (Ciszu Network)

Versión: 1.2.0
Actualización: 2026-11-27
Identificador: LAUNCHER_SYSTEM_V1.2.0_2026_11_27_ciszunetwork

> **Definición**: sistema oficial del launcher de escritorio de Ciszu Network: splash,
> actualización, tutorial, login, hub, offline, configuración, bandeja y cierre, reutilizable
> para cualquier producto.

---

## 1. Propósito

El launcher es la primera experiencia de escritorio del producto. No es una web envuelta:
gestiona actualizaciones, sesión, conexión, modo offline, configuración local, bandeja y
cierre. Este documento define el **modelo reutilizable** y la implementación de referencia.

Implementación canónica:

- `projects/muzicmania/launcher/src-tauri/splash/index.html`
- `projects/muzicmania/launcher/src-tauri/splash/launcher.js`
- `projects/muzicmania/launcher/src-tauri/splash/launcher.css`
- `projects/muzicmania/launcher/src-tauri/splash/offline.html`
- `projects/muzicmania/launcher/src-tauri/splash/offline-game.html`
- `projects/muzicmania/launcher/src-tauri/src/main.rs`

Plantilla:

- `shared/templates/desktop-shell/`
- `pnpm shell:new --kind launcher`

## 2. Vistas del launcher

| Vista | Contenido | Acción principal |
|---|---|---|
| Splash | Logo, versión, estado, progreso | Leer configuración y sesión |
| Update | Comprobación, notas, descarga | Actualizar o continuar |
| Tutorial | Pasos de bienvenida | Entrar al hub |
| Login | CISZU ID o invitado | Abrir login oficial |
| Hub | Cuenta, estado, juego, comunidad, ayuda | Jugar online/offline |
| Configuración | Modal centrado (idioma, tema, arranque, updates, telemetría) | Guardar preferencias |
| Notificaciones | Bandeja de la barra de ventana: cuenta online + locales + logs | Buscar, filtrar, ordenar, marcar, borrar |
| Offline | Shell local con hub, modos, ajustes y editor | Volver al menú / Jugar |
| Offline game | Juego local | Jugar pistas |
| Close dialog | Cerrar a bandeja o salir | Recordar elección |
| Update chip | Icono de actualización en la barra | Abrir el actualizador existente |

## 3. Flujo de arranque

```text
Splash
  → leer settings + sesión
  → comprobar conexión
  → comprobar actualización (si auto_update)
  → tutorial (primer inicio)
  → login (si online y no hay sesión)
  → hub
```

- Si `?offline=1`, se salta la comprobación de red y se abre el hub con sesión invitado.
- Si hay sesión recordada, no se pide login de nuevo.
- Si el servidor responde fuera del rango 2xx/3xx, el estado es offline.
- El hub debe seguir disponible sin conexión.

## 4. Hub

El hub contiene:

- Cabecera: logo, configuración, estado online/offline, cuenta.
- Hero: logotipo oficial, bienvenida, Jugar online, Jugar offline, Reintentar conexión.
- Cuenta: nombre, sesión, iniciar sesión, perfil, cerrar sesión.
- Launcher: acceso a configuración y actualizaciones.
- Comunidad: Discord, YouTube, Instagram, TikTok, X, GitHub.
- Ayuda: soporte, changelog, descarga, WhatsApp, Ciszu Network.
- Estado de sesión: nota y botón de actualizar estado.
- Footer: isotipo, copyright, enlace a Ciszuko Antony, derechos.

### 4.1 Estado online/offline

- Online: punto verde.
- Offline: punto rojo con parpadeo lento.
- Offline no elimina la sesión local ni los datos del hub.
- “Reintentar conexión” vuelve a consultar el servicio.
- “Actualizar estado” debe:
  1. Consultar conexión.
  2. Si no hay conexión, mantenerse offline y mostrar error.
  3. Si hay conexión y no hay sesión, abrir login.
  4. Si hay sesión, continuar al hub/juego.

### 4.2 Cuenta y menú de usuario

- La barra muestra el avatar y el nombre: `GuestXXXXXX` para invitados y `display_name` para
  cuentas online.
- Click en la cuenta abre un menú contextual:
  - Offline: configuración del launcher y “Actualizar conexión”.
  - Online: configuración del launcher, configuración de cuenta y cerrar sesión; si es invitado,
    además “Iniciar sesión”.
- El invitado conserva una numeración local persistente (`Guest` + 6 dígitos) y la web la recibe
  por `?guest=` para que `/play` use el mismo nombre. Nunca se muestra “Invitado” genérico si ya
  existe un nombre local.

### 4.3 Notificaciones y logs

- La barra de ventana incluye una campana con contador de no leídas y un icono de actualización
  cuando hay una versión nueva.
- Fuentes de notificaciones:
  - **Cuenta online**: `GET/PATCH /api/launcher/notifications`, autenticado con un token de
    alcance limitado (solo leer/marcar notificaciones). Nunca se transporta el `access_token`
    de Supabase.
  - **Locales**: eventos del launcher (offline, errores, actualizaciones, cuenta) persistidos en
    `localStorage`.
  - **Logs**: errores y avisos del archivo `launcher.log` se convierten en notificaciones; el
    filtro “Logs” permite ver el historial completo.
- Controles: búsqueda, filtro por tipo/estado, orden recientes/antiguas, marcar visto, leer todo,
  borrar notificaciones y borrar logs.
- El chequeo silencioso de actualizaciones corre cada 60 s cuando hay red, independientemente del
  modo online/offline del hub. Si hay versión nueva, crea una notificación y muestra el icono de
  actualización; al pulsarlo se abre el flujo de autoactualización existente.

### 4.4 Logs locales y detección de fallos

- `launcher.log` (junto a `desktop_settings.json`) registra arranque, cierre, errores, pánicos,
  navegación y eventos de red.
- Un hilo de Rust comprueba el heartbeat del webview cada 15 s; si no responde en 120 s escribe
  `hang_detected`.
- Al arrancar, si la última línea del log no es un cierre limpio, escribe
  `previous_session_unclean` y lo muestra como aviso en la bandeja.
- Rotación automática al superar 2 MB (conserva las últimas 1.500 líneas).

### 4.5 Botones

- Jugar online: solo si hay conexión.
- Jugar offline: siempre disponible.
- Reintentar conexión: visible en offline.
- Actualizar estado: siempre en el hub.
- Todos con icono y estado de carga.

### 4.6 Splash, hub y paridad visual con `/play` (2.5.1)

- Splash con isotipo + logotipo oficiales, animación de flotación/pulso, parpadeo del estado y
  aviso de “Soporte por tardanza” tras 15 s sin respuesta.
- Barra de ventana con isotipo y logotipo; se elimina el bloque duplicado “Launcher · BETA” del hub.
- Hub centrado: logotipo lockup, acciones de juego apiladas verticalmente, fondo animado (orbes,
  rejilla y notas), tarjeta de cuenta con marco de avatar y tarjeta de últimos cambios.
- Campana de notificaciones junto a Configuración y sección de preferencias de notificaciones
  (no molestar, sonidos, correo, autoeliminación y tipos capturados).
- Fuentes oficiales Exo 2 y Rajdhani empaquetadas en el launcher.
- Shell offline alineado con `/play`: sidebar de modos/opciones, previsualización central al
  hover, perfil arriba a la izquierda, changelog arriba a la derecha, panel social, now playing y
  quickdocks de tema/idioma en la barra inferior.
- Motor local alineado con `useGameEngine`: mismo generador de chart/semilla, ventanas de juicio,
  puntuación, vida, KPS, precisión, holds, minas, HUD y pausa con cuenta atrás y auto-pausa.

## 5. Configuración

La configuración se muestra en un **modal centrado**, no en una tarjeta del hub.

Opciones:

- Idioma (con banderas y todos los idiomas oficiales).
- Iniciar con Windows.
- Comportamiento al cerrar: preguntar, mantener en segundo plano o cerrar completamente.
- Actualizaciones automáticas.
- Confirmar enlaces externos.
- Buscar actualización.
- Anclar a taskbar.
- Reiniciar launcher.
- Ayuda.

### 5.1 Idioma

- El selector muestra bandera + nombre.
- Los 18 idiomas oficiales deben estar disponibles.
- La preferencia se guarda en `desktop_settings.json`.
- Al cambiar idioma se muestra un modal:
  - **Reiniciar ahora** (recomendado).
  - **Cancelar cambio**.
  - **Continuar sin reiniciar** (no recomendado).
- Si se continúa sin reiniciar, algunos textos dinámicos pueden quedar en el idioma anterior.
- El idioma no debe cambiar a mitad de una partida o instalación.

### 5.2 Inicio con Windows

- Escribe una entrada `MuzicMania` en `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`.
- El desinstalador la elimina.
- Debe ser configurable por el usuario.

### 5.3 Cierre

- La ventana usa **decoración personalizada** (`decorations(false)`), sin la barra clásica de Windows.
- La barra superior incluye logo, botón **HUB**, configuración global, minimizar, maximizar y cerrar.
- El botón HUB vuelve al hub desde offline, juego offline, login o tutorial; configuración abre el modal global.
- El arrastre se realiza con `data-tauri-drag-region` y doble clic maximiza/restaura.
- La X no cierra el proceso directamente.
- Muestra un modal con:
  - Mantener en segundo plano.
  - Cerrar completamente.
  - Cancelar.
  - Recordar mi elección.
- Si el usuario elige recordar, la próxima X usa la acción elegida.
- El menú de bandeja ofrece:
  - Abrir MuzicMania.
  - Información.
  - Salir completamente.

## 6. Sesión y autenticación

- CISZU ID es el proveedor de identidad.
- El launcher abre una ventana de login externa y espera la sesión.
- La sesión se guarda en `launcher_session.json` sin tokens ni email.
- Invitado local: sesión sin cuenta online.
- “Actualizar estado” puede abrir login si hay conexión y no hay sesión.
- Cerrar sesión limpia los datos de navegación del WebView.

## 7. Update

- Comprueba GitHub Releases.
- No debe bloquear el hub indefinidamente.
- Si falla la red, ofrece reintentar u omitir.
- Si hay actualización:
  1. Descargar el setup.
  2. Mostrar notas y progreso.
  3. Instalar con permisos.
  4. Relanzar el launcher.
- El update del launcher es distinto del update del instalador: el primero actualiza la
  app; el segundo actualiza los archivos instalados sin desinstalar.

## 8. Offline

El modo offline vive dentro del mismo shell del launcher, no en una página separada:

- `Jugar offline` abre la vista offline.
- `Volver al menú` regresa al hub sin recargar la ventana.
- `Jugar offline` carga el juego local en un iframe; no hay fetch ni servicios externos.
- La barra de título permanece visible, con HUB y configuración global.
- La X sigue mostrando el modal de cierre y nunca deja la ventana bloqueada.
- El juego offline es una **beta local**: cuatro pistas, charts generados, mejores puntajes locales y modos online desactivados. El sistema de niveles completo queda pendiente.

- Se activa al pulsar “Jugar offline” o al abrir `?offline=1`.
- La pantalla intermedia debe indicar que no hay conexión.
- Botones:
  - **Volver al menú**: regresa al hub en modo offline.
  - **Jugar**: abre el juego offline.
- Si `launcher_offline_game` falla, la navegación a la pantalla de juego debe continuar.
- No usar `alert()` para errores offline.
- El juego offline debe cargar pistas locales y guardar mejores puntajes locales.

## 9. Ventana y diseño

- Tema oscuro, cian/rosa/morado, Geomanist/Segoe UI.
- Logotipo oficial en el hero, no solo texto.
- Footer con isotipo y copyright.
- Iconos de línea para acciones; iconos de marca para redes.
- Hover, cursor pointer, foco visible y animaciones suaves.
- Responsive: 520 px, 900 px y 1280 px como mínimo.
- El hub se maximiza; splash/update usan ventana compacta centrada.
- Selects personalizados; no usar el estilo nativo del navegador para el idioma.

## 10. Bandeja y ventanas

- `launcher_hide` oculta la ventana.
- `launcher_close` cierra completamente.
- `launcher_restart` relanza y sale.
- La bandeja debe mantenerse aunque la ventana esté oculta.
- El icono debe tener tooltip y menú contextual.
- Al abrir desde la bandeja: mostrar, restaurar y enfocar.

## 11. Contrato de comandos

| Comando | Uso |
|---|---|
| `launcher_boot` | Versión, primer inicio, sesión y settings |
| `launcher_log` | Escribir una entrada en el log local |
| `launcher_logs_read` | Leer las últimas entradas del log |
| `launcher_logs_clear` | Borrar el log local |
| `launcher_heartbeat` | Señal de vida del webview |
| `launcher_notifications` | Leer notificaciones de la cuenta (token de alcance limitado) |
| `launcher_notifications_read` | Marcar notificaciones como leídas |
| `offline_back_to_hub` | Volver al hub desde el shell offline |
| `launcher_session` | Leer sesión |
| `launcher_guest` | Crear invitado |
| `launcher_logout` | Cerrar sesión |
| `launcher_open_login` | Abrir login |
| `launcher_ready` | Abrir experiencia online |
| `launcher_offline_game` | Preparar ventana offline |
| `offline_game_close` | Cerrar juego offline |
| `launcher_show_hub` | Maximizar hub |
| `launcher_show_small` | Ventana compacta |
| `launcher_pin_taskbar` | Anclar |
| `launcher_check_update` | Comprobar versión |
| `launcher_start_update` | Descargar |
| `launcher_update_progress` | Progreso |
| `launcher_apply_update` | Aplicar y salir |
| `launcher_hide` | Bandeja |
| `launcher_close` | Salir |
| `launcher_restart` | Reiniciar |
| `set_launch_on_startup` | Autostart |

## 12. Configuración persistida

`desktop_settings.json`:

```json
{
  "close_confirm": true,
  "link_confirm": true,
  "auto_update": true,
  "tutorial_done": false,
  "language": "1034",
  "theme": "light",
  "launch_on_startup": false,
  "close_action": "ask"
}
```

- `language` usa el código numérico.
- `theme` acepta `light` (por defecto) o `dark`; se aplica al instante en launcher, splashes y shell local.
- `close_action` acepta `ask`, `background` o `exit`.
- El `launcher_session.json` puede guardar un token de notificaciones de alcance limitado; nunca el
  `access_token`/`refresh_token` de Supabase ni emails.
- Nunca guardar tokens de acceso completos, emails ni secretos.

## 13. Plantilla

```powershell
pnpm shell:new --target projects/ciszubot/launcher-shell --config .\ciszubot.shell.json --kind launcher
```

El generador copia `index.html`, `launcher.js`, `launcher.css`, `offline.html`,
`offline-game.*`, `logo.svg` y `flags/` desde la referencia canónica. No copia música,
contenido ni binarios.

Después de generar:

- [ ] Cambiar logo/iconos.
- [ ] Cambiar nombre, URLs, redes y marca.
- [ ] Adaptar los comandos Rust.
- [ ] Configurar auth y update.
- [ ] Revisar offline y pistas.
- [ ] Traducir todos los textos del producto.
- [ ] Probar bandeja y cierre.

## 14. Pruebas del launcher

- [ ] Arranque en limpio y con sesión recordada.
- [ ] Update disponible / no disponible / sin red.
- [ ] Tutorial de primer inicio.
- [ ] Login real y cancelado.
- [ ] Invitado offline.
- [ ] Hub online y offline.
- [ ] Botón Actualizar estado con y sin sesión.
- [ ] Configuración: idioma, autostart, cierre, update, enlaces.
- [ ] Cambio de idioma y reinicio.
- [ ] Bandeja: abrir, ocultar, salir.
- [ ] X con recordar activado.
- [ ] Offline: volver al menú y jugar.
- [ ] Responsive 520/900/1280.
- [ ] Sin errores en consola ni `alert`/`confirm`.

## 15. Relación con otros documentos

- `DESKTOP_SHELL_SYSTEM.md`: contrato general del shell.
- `INSTALLERS_SYSTEM.md`: instalación, NSIS y releases.
- `AUTH_SYSTEM.md`: autenticación.
- `FEATURE_FLAGS_SYSTEM.md`: flags del producto.
- `FRONTEND_SYSTEM.md`: UI y componentes.
- `ERRORS_SYSTEM.md`: captura de errores.

---

## 16. Resumen ejecutivo

El launcher oficial de Ciszu Network es un shell reutilizable con splash, update, tutorial,
login, hub, offline, configuración modal, idiomas con banderas, bandeja y cierre controlado.
MuzicMania es la referencia canónica; cualquier producto nuevo parte de
`shared/templates/desktop-shell` y solo cambia marca, acciones y adaptadores.

## 17. Versionado, canales y comparación de builds

Desde el 18 nov 2026 la versión de referencia es **launcher 2.4.2**, juego **2.1.1** y canal
**beta**. La fuente única es `projects/muzicmania/launcher/build.config.json`; `build.rs` la
inyecta en Rust y `build-installer.ps1` genera `splash/build-info.js`, archiva los setups y
actualiza el registro de descargas.

- **Prioridad de versión**: primero launcher; `gameVersion` es secundaria y describe el
  paquete offline. Una build nueva del launcher puede mantener la misma versión de juego.
- **Canales**: `beta` es el público actual, `release` el canal estable futuro y `testing`
  solo builds debug/dev. `alpha` está deprecado y no debe publicarse.
- **Contrato**: launcher y setup comparten `launcherVersion`; el nombre del artefacto incluye
  `Game-v<game>`, `Launcher-v<launcher>`, canal y OS.
- **Hub**: compara la versión instalada (`version.txt`) con la del setup. Igual = al día;
  instalada menor = recomendar update/reinstall; instalada mayor = advertir y **bloquear
  reinstall**. Nunca se degrada una instalación.
- **Updater**: distingue error de red (recomendar setup local), release del repositorio más
  nueva (descargar) y versión local más reciente que la publicada (avisar, no descargar).
- **UI**: titlebar propia con isotipo, tag de canal y estado/cuenta; el hub no repite el logo
  grande ni el botón de configuración. Los setups usan la misma barra compacta con idioma.
- **Changelog**: cada build apunta a su URL real (`changelogUrl`) y el tag de release
  (`releaseTag`) se usa para los assets de GitHub.

### 17.1 Primer inicio, bienvenida y login

En el primer arranque (sin `tutorial_done`) el launcher muestra una vista exclusiva de
bienvenida, después el tutorial guiado y finalmente el acceso CISZU ID antes del hub. El login
del launcher reutiliza `/login?launcher=1`: soporta OAuth, recuperación, 2FA, CAPTCHA, soporte y
`Recordarme`; el registro se oculta en modo launcher. El check de política se ejecuta antes de
esta secuencia para no permitir saltarse un bloqueo obligatorio.

La sesión se guarda en `launcher_session.json` solo si `remember=true`. Si el usuario no marca
Recordarme, la sesión vive durante la ejecución actual y se elimina al cerrar. El invitado
automático se usa cuando no hay conexión y también puede elegirse con “Continuar como invitado”
en la pantalla de login. El hub muestra “BIENVENIDO A MUZICMANIA · ¿PRIMERA VEZ?” durante la
primera sesión y cambia a “BIENVENIDO DE VUELTA” en las siguientes.

El invitado lleva numeración local persistente (`Guest` + 6 dígitos). El launcher la pasa a
`/play?guest=GuestXXXXXX` para que la web use exactamente el mismo nombre, y al shell offline
por `local/index.html?guest=...`. Con cuenta online se muestra `display_name` y avatar reales.

_Última revisión: 27 nov 2026._ Relacionado: `DESKTOP_SHELL_SYSTEM.md`,
`INSTALLERS_SYSTEM.md`, `RELEASE_POLICY_SYSTEM.md`, `AUTH_SYSTEM.md`, `FRONTEND_SYSTEM.md`.






