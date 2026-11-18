# DESKTOP_SHELL_SYSTEM — Sistema reutilizable de instalación y escritorio (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-11-16
Identificador: DESKTOP_SHELL_SYSTEM_V1.0.0_2026_11_16_ciszunetwork

> **Definición**: sistema oficial de Ciszu Network para construir el shell de escritorio de
> un producto: instalador, hub de mantenimiento, desinstalador y launcher, con estructura,
> flujos, i18n, errores, actualizaciones y plantilla reutilizable.

---

## 1. Propósito y alcance

Este documento define la **capa de escritorio reutilizable** del ecosistema. No documenta
solo MuzicMania: define el patrón que debe reutilizar cualquier producto de Ciszu Network
que necesite instalar, mantener, actualizar o abrir una aplicación.

La implementación de referencia es MuzicMania:

- `projects/muzicmania/launcher/src-tauri/splash/`
- `projects/muzicmania/launcher/src-tauri/src/main.rs`
- `projects/muzicmania/website/scripts/patch-nsis-lang.ps1`
- `projects/muzicmania/launcher/build-installer.ps1`
- `projects/muzicmania/launcher/src-tauri/nsis-lang/`

La plantilla y el generador viven en:

- `shared/templates/desktop-shell/`
- `shared/scripts/scaffold-desktop-shell.mjs`
- comando `pnpm shell:new`

El sistema incluye dos capas:

| Capa | Incluye | Documento específico |
|---|---|---|
| **Instalación** | Instalador, hub de mantenimiento, desinstalador, update y reinstall | `INSTALLERS_SYSTEM.md` |
| **Launcher** | Splash, update, tutorial, login, hub, offline, ajustes, bandeja y cierre | `LAUNCHER_SYSTEM.md` |

## 2. Principios del sistema

1. **Producto ≠ shell.** El shell aporta estructura y flujos; el producto aporta marca,
   acciones, textos legales y adaptadores.
2. **Una sola fuente de verdad.** La configuración del producto vive en un archivo de
   configuración; la lógica genérica no se duplica.
3. **Nunca usar diálogos nativos del navegador.** `window.confirm` y `window.alert` muestran
   títulos como `localhost` dentro de Tauri. Todo aviso/error usa modales propios.
4. **Los errores se capturan y se explican.** Una promesa rechazada no debe quedar sin
   feedback visual.
5. **Idioma persistente y consistente.** Instalador y desinstalador comparten preferencia;
   el launcher exige reinicio al cambiar idioma.
6. **La actualización no es una reinstalación.** Update modifica archivos; Reinstall
   desinstala e instala de nuevo; Uninstall elimina la aplicación.
7. **La app en ejecución bloquea operaciones destructivas.** Antes de instalar,
   desinstalar, actualizar o reinstalar se comprueba que MuzicMania no esté abierto.
8. **La plantilla no contiene secretos.** Nunca se copian `.env`, tokens ni datos de usuario.
9. **Todo cambio de shell se prueba en instalación limpia, hub y launcher.**

## 3. Configuración del producto

El generador usa `shared/templates/desktop-shell/config.example.json` y su esquema
`config.schema.json`. Campos mínimos:

| Campo | Ejemplo | Uso |
|---|---|---|
| `product.name` | `CiszuBot` | Nombre visible, títulos y textos |
| `product.slug` | `ciszubot` | IDs, localStorage, rutas y binario |
| `product.appId` | `com.ciszunetwork.ciszubot` | Tauri / bundle / notificaciones |
| `product.version` | `1.0.0` | Versión inicial |
| `brand.owner` | `Ciszu Network` | Copyright y footer |
| `urls.productUrl` | `https://ciszubot.vercel.app` | Web oficial |
| `urls.supportUrl` | `.../support` | Soporte |
| `urls.githubRepo` | `.../CiszuNetwork` | Releases / update |
| `urls.whatsapp` | `https://wa.me/...` | Soporte rápido |
| `socials.*` | Discord, YouTube, etc. | Footer y comunidad |
| `shell.kind` | `installer` / `launcher` / `all` | Archivos a generar |
| `shell.languages` | `["1033", "1034"]` | Idiomas activos iniciales |

La configuración no debe contener claves, tokens, números privados ni rutas absolutas del
equipo de desarrollo.

## 4. Arquitectura de capas

```text
┌─────────────────────────────────────────────────────────────┐
│ Producto: marca, textos, iconos, acciones y adaptadores     │
├─────────────────────────────────────────────────────────────┤
│ Shell UI: roadmap, footer, idioma, modales, estados, tokens │
├─────────────────────────────────────────────────────────────┤
│ Adaptador: Tauri (invoke) o Web (HTTP / API del producto)   │
├─────────────────────────────────────────────────────────────┤
│ Bridge: comandos, IPC temporal, NSIS, procesos, ventanas    │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 Archivos del shell

| Archivo | Responsabilidad |
|---|---|
| `installer.html` / `installer.js` | Instalador y hub de mantenimiento |
| `uninstaller.html` / `uninstaller.js` | Desinstalador |
| `roadmap.js` / `roadmap.css` | Etapas, progreso y navegación |
| `index.html` / `launcher.js` / `launcher.css` | Launcher |
| `offline.html` / `offline-game.*` | Modo offline |
| `flags/` | Banderas de idiomas |
| `logo.svg` | Logotipo de referencia |
| `main.rs` | Ventanas, comandos, tray, update, reinstall, IPC |

## 5. Componentes compartidos

### 5.1 Roadmap

- Seis etapas normales: Idioma, Bienvenido, Licencia, Carpeta, Instalar, Finalizar.
- Cuatro etapas cuando ya existe una instalación: Idioma, Mantenimiento, Instalar,
  Finalizar.
- El idioma se marca como completado al entrar al hub de mantenimiento.
- Al finalizar se activa explícitamente la etapa Finalizar para que la barra llegue al 100%.
- Al reinstalar no se reutiliza el roadmap del hub: el reinstall real se ejecuta fuera del
  flujo de instalación.
- Etiquetas localizadas mediante `STAGE_I18N` y `MuzicRoadmap.setLabels()`.
- Navegación bloqueada durante instalación/desinstalación.

### 5.2 Footer

El footer es global y debe verse en todas las vistas:

- Copyright y año.
- Enlace a Ciszu Network.
- Nombre y versión del producto.
- Selector rápido de idioma.
- Redes sociales con iconos de marca.
- Soporte y WhatsApp.
- Enlace al creador o a la página oficial cuando aplique.
- En el launcher: isotipo, copyright y enlace a Ciszuko Antony.

No se debe ocultar el footer en una vista concreta; su espacio se reserva con
`flex-shrink: 0`.

### 5.3 Idioma

- Códigos oficiales: `1033`, `1034`, `2052`, `1028`, `1046`, `1051`, `1041`, `1050`,
  `1036`, `1031`, `1040`, `1043`, `1045`, `1025`, `1055`, `1029`, `1038`, `1053`.
- Instalador y desinstalador comparten `muzicmania-installer-lang-v2` como preferencia.
- Instalador actualiza `installer_set_lang` para que NSIS y la notificación final usen el
  idioma elegido.
- El launcher guarda el idioma en su configuración y exige reinicio al cambiarlo.
- Las banderas viven en `flags/` y deben acompañar al nombre del idioma.
- Los textos que falten en un idioma deben caer a inglés, nunca a otro idioma aleatorio.

### 5.4 Modales y avisos

Tipos obligatorios:

| Modal | Uso |
|---|---|
| Confirmación | Cancelar instalación, desinstalar, reinstalar |
| Aviso | Aplicación en ejecución, operación bloqueada |
| Error | Fallo de update, uninstaller ausente, permiso denegado |
| Progreso | Update, instalación y desinstalación |
| Idioma | Cambio de idioma y reinicio del launcher |

Reglas:

- No usar `window.confirm` ni `window.alert`.
- No mostrar rutas `localhost`, `tauri.localhost` ni detalles internos.
- El botón de cierre no debe destruir una operación en curso sin advertir.
- Los textos deben estar traducidos o caer a inglés.

### 5.5 Errores

- Toda promesa `invoke()` debe tener `.catch()`.
- Los errores se muestran en un modal con título, explicación y acción.
- Los errores técnicos se registran en consola; el usuario ve un texto comprensible.
- Si la app está en ejecución, se detiene la operación y se pide cerrarla.
- Si el desinstalador no existe, se muestra un error de reparación; nunca se abre una URL
  local inexistente.

### 5.6 Notificaciones

- La notificación final del instalador usa el idioma seleccionado.
- No se envía una notificación de éxito si la instalación falló.
- El update del instalador no debe presentarse como una reinstalación.

## 6. Flujo del instalador

### 6.1 Instalación nueva

```text
Idioma → Bienvenido → Licencia → Carpeta → Instalar → Finalizar
```

Antes de `Instalar`:

1. Validar carpeta.
2. Comprobar espacio.
3. Comprobar que el producto no está ejecutándose.
4. Escribir `cmd.txt = INSTALL`.
5. NSIS ejecuta la instalación.
6. La UI lee progreso, estado y log.
7. Al recibir `DONE`, mostrar Finalizar.
8. Al cerrar, Rust crea accesos, lanza la app si se pidió y limpia IPC.

### 6.2 Hub de mantenimiento

Se muestra cuando la instalación ya existe:

- Versión instalada.
- Ubicación.
- Datos locales.
- Cerrar.
- Desinstalar.
- Reinstalar.
- Buscar actualización.

El hub debe abrirse directamente al detectar una instalación, sin obligar a pasar por el
flujo de instalación.

### 6.3 Update

Update es **actualizar**, no reinstalar:

1. Comprobar la última versión en GitHub Releases.
2. Si no hay versión nueva, informar y no tocar archivos.
3. Descargar el instalador de la versión nueva.
4. Ejecutarlo en modo silencioso (`/S`) sobre la instalación existente.
5. Conservar cuenta y datos locales.
6. No ejecutar el desinstalador.
7. Relanzar la app al terminar.

### 6.4 Reinstall

Reinstall es **desinstalar e instalar literalmente**:

1. Comprobar que no hay procesos del producto abiertos.
2. Localizar `uninstall.exe` y el setup original.
3. Ejecutar el desinstalador en modo silencioso conservando datos locales.
4. Ejecutar el instalador de nuevo.
5. Mostrar en el instalador las fases **Desinstalando → Instalando → Finalizando** con progreso visible.
6. Mostrar una acción final: Abrir la aplicación o mantenerse en el hub.
7. No usar el flujo de update.

### 6.5 Uninstall

1. Comprobar que no hay procesos abiertos.
2. Mostrar confirmación propia, nunca `window.confirm`.
3. Cerrar el instalador y abrir el desinstalador oficial.
4. Si existe un desinstalador huérfano, cerrarlo antes de abrir uno nuevo.
5. El desinstalador elimina la app y pregunta si conservar datos locales.

### 6.6 App en ejecución

Antes de instalar, desinstalar, actualizar o reinstalar:

```text
PowerShell → Win32_Process → Name = product.exe
  → excluir el proceso actual
  → excluir --installer y --uninstaller
  → si hay otro proceso: modal "cierra la aplicación"
```

Nunca se mata la app del usuario automáticamente durante una operación normal.

## 7. Flujo del launcher

Ver `LAUNCHER_SYSTEM.md` para el detalle. Resumen:

```text
Splash → Update → Tutorial → Login → Hub
                                      ├── Jugar online
                                      ├── Jugar offline → Offline → Juego
                                      ├── Configuración
                                      ├── Actualizar estado
                                      └── Cerrar → Bandeja / Salir
```

- La configuración se abre en modal centrado.
- El idioma se cambia con banderas y requiere reinicio.
- “Actualizar estado” comprueba conexión y sesión: si no hay sesión abre login; si hay
  sesión, continúa al hub/juego.
- Offline ofrece “Volver al menú” y “Jugar”; ambos deben funcionar incluso si falla el
  ajuste de ventana.

## 8. Contrato Tauri / adaptador

### 8.1 Comandos de instalación

| Comando | Contrato |
|---|---|
| `installer_info` | Versión, OS, arquitectura, ruta, instalación detectada, WebView2 |
| `installer_disk_info` | Espacio libre/total |
| `installer_set_lang` | Persistir código de idioma |
| `installer_set_dir` | Persistir ruta |
| `installer_start_install` | Escribir `INSTALL` en IPC |
| `installer_read_progress` | Porcentaje |
| `installer_read_log` | Log completo |
| `installer_read_status` | `READY`, `DONE`, `ERROR`, `CANCELLED` |
| `installer_pick_dir` | Selector nativo |
| `installer_cancel` | `ABORT` y cerrar |
| `installer_run_uninstaller` | Cerrar instalador y abrir desinstalador |
| `installer_app_running` | Proceso del producto abierto |
| `installer_check_update` | Consulta de versión |
| `installer_start_update` | Descarga del setup |
| `installer_update_progress` | Progreso de descarga |
| `installer_apply_update` | `/S` sin desinstalar |
| `installer_reinstall_start` | Inicia el flujo visual de reinstall |
| `installer_reinstall_progress` | Fase y progreso del reinstall |
| `installer_open_app` | Abrir la app y cerrar el hub |
| `installer_finish` | Accesos, lanzamiento, notificación y cierre |

### 8.2 Comandos de launcher

| Comando | Contrato |
|---|---|
| `launcher_boot` / `get_settings` | Versión, primer inicio, settings |
| `launcher_session` / `launcher_guest` / `launcher_logout` | Sesión |
| `launcher_open_login` | Login externo |
| `launcher_ready` | Abrir experiencia online |
| `launcher_offline_game` | Preparar ventana offline |
| `server_status` | Estado HTTP del servicio |
| `launcher_check_update` / `start_update` / `apply_update` | Update |
| `launcher_hide` / `launcher_close` / `launcher_restart` | Bandeja / salida / relanzar |
| `set_launch_on_startup` | Registro de inicio con Windows |

### 8.3 IPC

Directorio temporal: `%TEMP%/muzicmania-ipc` en la implementación canónica. Archivos:

```text
status.txt
progress.txt
log.txt
default_dir.txt
cmd.txt
dir.txt
lang.txt
delete_data.txt
feedback.txt
```

El nombre del producto puede cambiar el prefijo. El contrato de estados no cambia.

### 8.4 NSIS

- `patch-nsis-lang.ps1` debe llamar al instalador personalizado con `--installer` y la ruta
  del setup.
- `SetAutoClose true` al terminar.
- No esperar indefinidamente al comando de cierre del hub.
- La UI de mantenimiento no debe usar los diálogos nativos de NSIS para errores.

## 9. Sistema visual

| Token | Valor de referencia |
|---|---|
| Fondo | `#07080d` / `#0B0C10` |
| Panel | `rgba(18,21,31,.82)` |
| Cian | `#0f9eff` |
| Rosa | `#ff20bf` |
| Morado | `#b026ff` |
| Verde | `#3ddc97` |
| Rojo | `#ff4060` |
| Texto | `#f1f4ff` |
| Secundario | `#8f98ad` |

- Tipografía de referencia: Segoe UI en desktop y Geomanist en marca/campañas.
- Bordes redondeados 8–24 px.
- Animaciones cortas (160–350 ms).
- Accesibilidad: `cursor: pointer`, `:focus-visible`, contraste y modales centrados.
- Responsive: footer y botones siempre accesibles; paneles con scroll interno.
- El launcher usa barra de título personalizada con HUB, configuración global, minimizar, maximizar y cerrar.

## 10. i18n y persistencia

- Código de idioma numérico de Windows.
- Instalador y desinstalador comparten preferencia.
- Launcher guarda en `desktop_settings.json`.
- Al cambiar idioma en el launcher: modal con Reiniciar ahora, Cancelar cambio y Continuar
  sin reiniciar.
- Si se continúa sin reiniciar, se avisa que la traducción puede quedar incompleta.

## 11. Seguridad

- No incluir secretos en la plantilla ni en el shell.
- No aceptar rutas fuera de instalación sin validación.
- No concatenar SQL ni comandos de shell con datos de usuario sin escapar.
- Los enlaces externos se abren con el comando de apertura del sistema y validación HTTPS.
- La actualización solo acepta URLs del repositorio oficial.
- La plantilla no debe incluir `.env`, `.env.local`, `SECRET_TEMP.env` ni `services/supabase/.env`.
- Los instaladores deben firmarse con Authenticode y timestamp; firmar el binario antes del NSIS y el setup final. Sin firma, Defender puede marcar `Win32/Bearfoos.A!ml` por heurística. Ver `INSTALLERS_SYSTEM.md` §5.

## 12. Plantilla reutilizable

### 12.1 Ubicación

```text
shared/templates/desktop-shell/
├── README.md
├── config.example.json
├── config.schema.json
├── MANIFEST.json
├── adapters/web-adapter.js
└── (referencia canónica en projects/muzicmania/launcher/src-tauri/splash)
```

### 12.2 Generación

```powershell
pnpm shell:new --target projects/ciszubot/installer --config .\ciszubot.shell.json --kind installer
```

El generador copia la versión canónica de la capa solicitada, sustituye tokens de marca y
escribe `SHELL_CONFIG.json` + `SHELL_NEXT_STEPS.md`. No genera binarios, música ni secretos.

### 12.3 Caso CiszuBot

Para un instalador web de CiszuBot:

1. `--kind installer`.
2. Reemplazar logo y paleta.
3. Adaptar `tauriInvoke` con `adapters/web-adapter.js` y endpoints HTTP.
4. Cambiar textos de producto y licencia.
5. Mantener roadmap, footer, avisos, progreso, estados y errores.
6. No fingir una instalación local si el producto no se instala.

## 13. Checklist de nuevo producto

### Instalador

- [ ] Logo, iconos y tokens de marca.
- [ ] Nombre, slug, app id y versión.
- [ ] URLs, soporte, redes y WhatsApp.
- [ ] 18 idiomas o subconjunto aprobado.
- [ ] Roadmap y hub de mantenimiento.
- [ ] Detección de app en ejecución.
- [ ] Update desde GitHub Releases.
- [ ] Reinstall real (uninstall + install).
- [ ] Uninstaller y limpieza de procesos huérfanos.
- [ ] Errores en modales propios.
- [ ] NSIS con auto-cierre y ruta del setup.

### Launcher

- [ ] Splash, update y tutorial.
- [ ] Login y sesión.
- [ ] Hub, estado de conexión y botón de estado.
- [ ] Offline y “Volver al menú”.
- [ ] Configuración en modal.
- [ ] Idiomas con banderas, persistencia y reinicio.
- [ ] Bandeja, cierre completo y autostart.
- [ ] Responsive y accesibilidad.

## 14. Pruebas obligatorias

- [ ] `node --check` de cada JS.
- [ ] `cargo check`.
- [ ] Build NSIS.
- [ ] Instalación limpia.
- [ ] Reapertura → hub.
- [ ] Update sin desinstalar.
- [ ] Reinstall conservando datos.
- [ ] Uninstall desde hub.
- [ ] App abierta → aviso y bloqueo.
- [ ] Idioma instalador/desinstalador compartido.
- [ ] Launcher: splash, login, hub, offline, settings, tray.
- [ ] Cambio de idioma del launcher + reinicio.
- [ ] Offline: volver al menú y jugar.
- [ ] Cierre a bandeja y salida completa.
- [ ] Sin `window.confirm`, `window.alert` ni `localhost` visible.

## 15. Gobernanza

- Toda modificación del shell debe actualizar su doc de sistema.
- Si el cambio afecta al contrato Tauri, actualizar `INSTALLERS_SYSTEM.md` y
  `LAUNCHER_SYSTEM.md`.
- La plantilla no se modifica sin probar la generación en un destino temporal.
- Los productos no deben copiar el shell y divergir sin registrar la decisión.
- Las mejoras al shell canónico se reflejan automáticamente al regenerar.

## 16. Relación con otros documentos

- `INSTALLERS_SYSTEM.md`: build, NSIS, releases, distribución y verificación.
- `LAUNCHER_SYSTEM.md`: detalle del launcher.
- `ARCHITECTURE.md`: visión del monorepo.
- `PACKAGES_SYSTEM.md`: paquetes compartidos.
- `SECURITY_PROTOCOLS.md`: reglas de seguridad.
- `LOCAL_TESTING_PROTOCOLS.md` y `TESTING_SYSTEM.md`: pruebas.
- `PROJECTS_SYSTEM.md`: estado del ecosistema.

## 17. Versionado y releases del shell

El shell no versiona por su cuenta: cada producto declara `build.config.json` en la raíz de
su launcher. El contrato mínimo es `launcherVersion`, `gameVersion`, `channel`, `buildDate`,
`changelogUrl` y `releaseTag`.

- El build sincroniza Cargo/Tauri, genera `build-info.js` y escribe el registro histórico de
  descargas; el nombre incluye juego, launcher, canal y OS.
- `beta` es el canal público de MuzicMania; `release` se reserva para estable y `testing`
  para debug. `alpha` está deprecado.
- Los componentes que comparan versiones usan primero el launcher y nunca degradan una
  instalación. El hub y el updater muestran estados explícitos para red, versión nueva y
  versión local más reciente.
- La barra de ventana del launcher y de los setups es propia: isotipo, canal, idioma y
  controles; no se repiten logos ni textos de marca dentro de la misma vista.

## 18. Resumen ejecutivo

Ciszu Network tiene desde ahora un **sistema de shell de escritorio reutilizable**:
instalador, hub, desinstalador y launcher comparten roadmap, footer, i18n, avisos, errores,
actualización, reinstalación y contrato de bridge. MuzicMania es la implementación de
referencia; `shared/templates/desktop-shell` + `pnpm shell:new` generan la base de un producto
nuevo para que el trabajo sea adaptar marca y acciones, no reescribir la estructura.

_Última revisión: 18 nov 2026._ Relacionado: `INSTALLERS_SYSTEM.md`,
`LAUNCHER_SYSTEM.md`, `ARCHITECTURE.md`, `SECURITY_PROTOCOLS.md`,
`LOCAL_TESTING_PROTOCOLS.md`.







