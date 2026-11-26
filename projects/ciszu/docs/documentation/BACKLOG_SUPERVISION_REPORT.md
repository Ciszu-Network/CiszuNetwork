# BACKLOG_SUPERVISION_REPORT — Supervisión de pendientes

**Versión:** 1.0
**Actualización:** 2026-11-14
**Identificador:** BACKLOG_SUPERVISION_REPORT
**Definición:** foto de los TODO de cada proyecto, sin modificar sus casillas. Los TODO son propiedad de Ciszuko Antony y este agente no los edita ni los marca.

---

## 1. Resumen por proyecto

| Proyecto | Hechas | Abiertas | Estado |
|---|---:|---:|---|
| Ciszu Network | 24 | 1 | Solo queda debug de devcon; el test automatizado ya pasa |
| CiszuBot | 0 | 1 | Top.gg bloqueado por Vercel; no hay acción local posible |
| Ciszuko Antony | 0 | 0 | Todo cerrado |
| CiszuGamens | 0 | 0 | Todo cerrado |
| CiszuPy | 0 | 0 | Todo cerrado |
| MuzicMania | 22 | 46 | 33 features futuras + 13 de launcher/instalador |

Total: **46 hechas · 48 abiertas**. La mayoría de las abiertas de MuzicMania son
planificación de producto, no bugs.

## 2. Ciszu Network

Abierta:

- **Debuggear todos los sistemas de devcon nuevos.** El 14 nov se ejecutó
  `test/website/debug/dev_console.tests.ps1`: falló solo por BOM UTF-8 ausente en
  `dev_console.ps1`; se añadió el BOM y los 20 checks pasan (`RESULTADO: TODOS LOS TESTS OK`).
  La casilla sigue abierta porque solo Ciszuko puede marcarla.

## 3. CiszuBot

Abierta:

- **Verificar CiszuBot en Top GG.** Top.gg denegó la verificación porque dashboard y web
  están pausados por Vercel. No se puede reintentar hasta que Vercel vuelva a servir la web.
  El bot y el CDN siguen operativos; el heartbeat está siendo vigilado por `bot-heartbeat-watch.yml`.

## 4. MuzicMania

### 4.1 Features futuras (33)

Skins/arrow/particles, tienda y lootboxes, pases de temporada, misiones, chat, multijugador
real, modo historia, torneos/ligas, anticheat multijugador, animaciones de personajes,
colaboraciones, emotes, suscripciones, billing, kickstarter/Patreon, redes sociales,
donaciones, paneles staff, rangos, niveles, badges y leaderboards.

Recomendación: congelar nuevas features hasta desbloquear Vercel y cerrar la validación
online de auth, economía y notificaciones. El trabajo local puede avanzar en datos y UI,
pero no marcar como completado sin prueba real.

### 4.2 Launcher e instaladores (13)

Abiertas principales:

- Terminar el instalador custom (bienvenida, despedida y cancelación en cada etapa).
- Cancelación durante la instalación con confirmación.
- Portar el launcher a Android/iOS (APK/AAB + Xcode).
- Update checker/instalador automático estilo Discord/Steam.
- Flujo inicial: update → check de red → bienvenida/tutorial → login → HUB maximizado.
- Cuenta offline/invitado y reinicio online desde el HUB.
- Auto-anclaje en taskbar de Windows 11.
- Notificaciones y diálogos de compatibilidad al instalar/anclar.

Auditoría del 14 nov:

- `cargo check` del launcher: **OK**.
- `build-installer.ps1`: **OK**, instalador NSIS generado (11.68 MB, SHA256 `DF88BD85…93087A`).
- Se corrigieron tres `LangString` mal escritos (`choowHowToInstall` → `chooseHowToInstall`)
  en Polish/Czech/Hungarian y el template NSIS; quedan warnings cosméticos de claves
  duplicadas del template de Tauri, no bloquean la instalación.
- `test/website/debug/dev_console.tests.ps1`: 20/20 OK tras añadir el BOM UTF-8 que faltaba.
- Se preparó portabilidad desktop: `tauri.linux.conf.json` (deb/AppImage),
  `tauri.macos.conf.json` (app/DMG) y workflow `build-launcher.yml` para Windows/Linux/macOS.
- Se reemplazaron dependencias de plataforma en el código: apertura de URLs con `open`,
  configuración en `dirs::config_dir`, `/dev/null` en Unix, restart nativo y login OAuth
  disponible también fuera de Windows. Taskbar pin queda no-op fuera de Windows.
- **Verificado**: workflow `build-launcher` 43633415206 completó Windows x64, Linux x64 y macOS arm64; artefactos Windows 11.3 MB, Linux 101.4 MB (DEB/AppImage), macOS 12.3 MB (app/DMG).
- **Pendiente real**: probar los instaladores en máquinas reales; los builds Linux/macOS ya están validados.
  Android/iOS requieren toolchains y firma externas.

## 5. Supervisión y prioridades

1. Vercel: revisar el 7 dic 2026; no desplegar antes.
2. Top.gg: reintentar solo con dashboard operativo.
3. Launcher: los artefactos Windows/Linux/macOS ya compilan; probarlos en máquinas reales.
4. Instalador Windows: regenerar tras el fix de idiomas y revisar warnings.
5. MuzicMania: no abrir features nuevas hasta validar auth/economía online.
6. Devcon: no marcar la casilla; el test ya está verde y queda la revisión visual del owner.

No se modificó ningún `TODO.md`.

_Última revisión: 14 nov 2026._ Relacionado: `TODO.md` de cada proyecto, `PROJECTS_SYSTEM.md`,
`INSTALLERS_SYSTEM.md`, `STATUS_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md`.
