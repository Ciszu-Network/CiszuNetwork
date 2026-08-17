# DEV_CONSOLE_SYSTEM — Consola de Desarrollo y Debugging Local (Ciszu Network)

Versión: 1.1.0
Actualización: 2026-08-17
Identificador: DEV_CONSOLE_SYSTEM_V1.0.0_2026_08_16_ciszunetwork

> **Definición**: sistema que documenta la consola interactiva (TUI) y el modo CLI
> (`test/website/debug/dev_console.ps1`) para probar las 4 webs del monorepo en local:
> puertos fijos, comandos, logs en tiempo real y resolución de problemas.

## 1. Qué es la consola de desarrollo

`dev_console.ps1` es una consola PowerShell que centraliza la operación de las 4 webs
Next.js en desarrollo local. Reemplaza la necesidad de abrir terminales manuales por
web: encender, reiniciar, detener, ver estado, abrir en el navegador y seguir logs,
desde un único punto.

Existen dos modos de uso:

| Modo | Disparo | Uso |
| --- | --- | --- |
| **TUI interactivo** | `devcon` / `pnpm dev:console` | Menú navegable por flechas, pensado para operación visual con el usuario |
| **CLI no interactivo** | `-Action <accion> -Web <key>` | Automatización: PowerShell, opencode, scripts, CI local |

La guía de usuario vive en `test/website/debug/dev_console.md` (y `.txt`); este documento
describe el sistema: arquitectura, puertos, comandos y reglas.

## 2. Puertos fijos (nomenclatura)

Cada web tiene un puerto local fijo. Esta tabla es la **fuente de verdad** de puertos y se
replica en la guía, en el AGENTS.md y en los scripts del perfil PowerShell.

| Web | Filtro pnpm | Puerto | Carpeta | URL local |
| --- | --- | --- | --- | --- |
| **Ciszu Network** | `ciszunetwork-website` | 3000 | `projects/ciszu/website` | `http://localhost:3000` |
| **Ciszuko Antony** | `ciszukantony-website` | 3001 | `projects/ciszukoantony/website` | `http://localhost:3001` |
| **CiszuBot** | `ciszubot-website` | 3002 | `projects/ciszubot/website` | `http://localhost:3002` |
| **MuzicMania** | `muzicmania-website` | 3003 | `projects/muzicmania/website` | `http://localhost:3003` |

La consola resuelve la carpeta del portfolio por patrón en runtime
(`Get-ChildItem projects -Directory | Where-Object { $_.Name -match 'antony' }`), igual que
el resto del ecosistema, para no depender del nombre exacto de la carpeta.

## 3. Arquitectura de la consola

### 3.1 Estructura de archivos

```
test/website/debug/
├── dev_console.ps1     # TUI + CLI (unica fuente de verdad)
├── dev_console.md      # Guia de usuario (markdown)
└── dev_console.txt     # Guia de usuario (texto plano)
```

### 3.2 Componentes internos

| Componente | Responsabilidad |
| --- | --- |
| `$WEBS` | Catálogo de webs: `key`, `name`, `filter` (pnpm), `port`, `dir` |
| `Show-Menu` | Navegación TUI (flechas ↑/↓, Enter, Q/Esc) |
| `Start-WebByKey` | Lanza `pnpm --filter <filter> dev -p <port>` en fondo con logs redirigidos |
| `Stop-WebByKey` | Detiene el proceso que escucha en el puerto de la web |
| `Show-Log` | Abre el log en vivo en una ventana PowerShell separada |
| `Show-Status` | Estado de puertos y URLs |
| Modo `-Action` | CLI no interactivo para automatización |

### 3.3 Cómo arranca una web

La consola lanza el comando real `pnpm --filter <filter> dev -p <port>` a través de
`cmd.exe /c` con ventana oculta. `stdout` y `stderr` van a:

```
.opencode/temp/dev-logs/<key>.log        # salida normal
.opencode/temp/dev-logs/<key>.log.err    # errores
```

Ese directorio es **gitignored** (vive bajo `.opencode/`). No se toca en producción.

### 3.4 Detección de estado

El estado de una web se calcula consultando si hay un proceso a la escucha en su puerto:

```powershell
Get-NetTCPConnection -LocalPort <port> -State Listen
```

No depende de ficheros de PID ni de guardar estados: si el puerto responde, la web está
encendida. Esto evita estados fantasma tras cierres manuales del navegador o del proceso.

## 4. Modo TUI interactivo

### 4.1 Apertura

```powershell
# Comando del perfil PowerShell
devcon

# Desde la raiz del monorepo
pnpm dev:console

# Directo (sin perfil ni pnpm)
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.ps1
```

La `ExecutionPolicy Bypass` evita bloques por política de ejecución scripts (común en
Windows sin firma).

### 4.2 Menú principal

| Opción | Acción |
| --- | --- |
| Encender webs | Abre selección múltiple → `Start-WebByKey` sobre las marcadas |
| Reiniciar webs | `Stop-WebByKey` + `Start-WebByKey` sobre las marcadas |
| Detener webs | `Stop-WebByKey` sobre las marcadas |
| Estado de puertos | Tabla de estado + URLs (🔢 selección múltiple) |
| Logs en tiempo real | Menú simple → log de UNA web encendida por vez |
| Herramientas extra | Limpiar logs, procesos node, puertos 3000-3003, abrir webs en navegador, procesos por puerto, CPU/mem por web, carpeta de logs, versiones (node/pnpm/turbo), git status, espacio en disco |
| Manual de ayuda | Muestra la guía rápida integrada |
| Créditos / Versión | Identidad y versión de la consola |
| Salir (Ctrl+C) | Detiene las webs en ejecución y cierra la consola |

### 4.3 Selección múltiple (operativas)

Las operativas (Encender / Reiniciar / Detener) abren un menú de selección con las
4 webs **marcadas por defecto** (auto-marcado). Al terminar de marcar/desmarcar se
elige cómo proceder:

| Decisión | Tecla | Comportamiento |
| --- | --- | --- |
| **Proceder** | `Enter` | Ejecuta la operación en las webs marcadas |
| **No proceder** | `N` | Cancela la operación y vuelve al menú (no aplica nada) |
| **Abortar** | `Q` / `Esc` | Detiene las webs en ejecución y cierra la consola (equivale a Ctrl+C) |

Las webs marcadas se procesan con `Invoke-SelectedWebs` (`Start-WebByKey`/`Stop-WebByKey` con `-Wait`);
la consola espera (spinner + `Wait-WebReady`) a que cada web responda en su puerto.

### 4.4 Teclas

| Tecla | Efecto |
| --- | --- |
| `↑` / `↓` | Moverse entre opciones |
| `Espacio` | Marcar / desmarcar la web resaltada |
| `A` | Marcar todas las webs |
| `1`…`9` / `0` | Saltar al índice de la opción (0 = 10.ª) |
| `Enter` | Proceder (ejecutar en las webs marcadas) |
| `N` | No proceder (cancelar) |
| `Q` / `Esc` | Abortar (detener webs y salir de la consola) |

## 5. Modo CLI no interactivo

Pensado para opencode, scripts y automatización:

```powershell
# Estado de todas las webs (tabla [ON]/[OFF])
ps.ps1 (dev_console) -Action status

# Encender / reiniciar / detener una web
-Action start    -Web network
-Action restart  -Web ciszubot
-Action stop     -Web muzic

# Log en vivo de una web (ventana separada)
-Action log -Web network
```

Claves de web disponibles: `network`, `antony`, `ciszubot`, `muzic`. Si `-Web` no coincide
con ninguna clave, la consola imprime las válidas y sale con código 1.

## 6. Comandos del perfil PowerShell

Para no abrir la carpeta `test/website/debug/` cada vez, el perfil registra estos comandos:

| Comando | Equivale a |
| --- | --- |
| `devcon` | Abre el TUI |
| `devall` | Encender las 4 webs |
| `devstop` | Detener las 4 webs |
| `devstatus` | `-Action status` |
| `devlog <web>` | `-Action log -Web <web>` |
| `devweb` / `devantony` / `devbotweb` / `devmuzic` | Encender cada web |

Todos se resuelven contra la constante `$DEV_CONSOLE` del perfil, que apunta a
`E:\Ciszu Network\test\website\debug\dev_console.ps1`.

## 7. Scripts pnpm en la raíz

| Script | Comando resultante |
| --- | --- |
| `pnpm dev:console` | Abre el TUI |
| `pnpm dev:all` | Encender las 4 webs |
| `pnpm dev:stop` | Detener las 4 webs |
| `pnpm dev:status` | Estado rápido |
| `pnpm dev:log -- <web>` | Log en vivo de una web |
| `pnpm web:dev` / `antony:dev` / `ciszubot:web:dev` / `muzicmania:dev` | Cada web en su puerto fijo |

**Nota**: los scripts de dev previos (sin puerto) se actualizaron para fijar el puerto
(`-p 3000`…`-p 3003`), de modo que encender varias webs a la vez no colisione en el 3000
automático de Next.

## 8. Logs

### 8.1 Ubicación

- `.opencode/temp/dev-logs/network.log`
- `.opencode/temp/dev-logs/antony.log`
- `.opencode/temp/dev-logs/ciszubot.log`
- `.opencode/temp/dev-logs/muzic.log`
- Errores en la misma carpeta con sufijo `.err`

### 8.2 Log en tiempo real

`Show-Log` abre una ventana PowerShell separada ejecutando
`Get-Content <log> -Tail 80 -Wait`. Ventajas de una ventana dedicada:

- Ctrl+C o cerrar la ventana **no afecta al TUI** ni a los procesos Next dev.
- Permitir abrir varios logs a la vez (una ventana por web).

### 8.3 Limpieza

La opción Herramientas → Limpiar logs borra `*` de `.opencode/temp/dev-logs/`. Es seguro:
es carpeta temporal, gitignored y regenerable.

## 9. Identidad visual

La consola sigue la identidad del ecosistema (neon cyan/rosa sobre negro):

- Paleta ANSI truecolor: cyan `52;226;226`, rosa `255;92;144`, verde `138;226;52`.
- Arte ASCII de Ciszu Network en el encabezado de cada pantalla.
- Estados en color: `[ENCENDIDA]` verde, `[DETENIDA]` gris, avisos amarillo.
- ASCII puro (sin tildes en el código fuente) para una codificación segura en PS 5.1.

## 10. Resolución de problemas

| Problema | Causa | Solución |
| --- | --- | --- |
| "Ya encendida (port X)" | La web ya responde en el puerto | Usar `Restart` en vez de `Start` |
| Web no responde a los 5 s | El compilador Next sigue arrancando | Esperar y re-consultar `status` o ver `log` |
| Puerto ocupado y no es la web | Otro proceso escucha en el puerto | Herramientas → ocupación 3000-3003, matar el proceso |
| `pnpm` no encontrado | Entorno sin pnpm en PATH | Abrir la consola desde una sesión con pnpm configurado |
| Logs acumulados | Uso prolongado | Herramientas → Limpiar logs |
| `$root` mal calculado | Movida la carpeta `test/website/debug` | Verificar que `dev_console.ps1` viva en `test/website/debug/` (3 niveles bajo la raíz) |
| Consola no arranca por política | ExecutionPolicy | Usar `-ExecutionPolicy Bypass` o `devcon` del perfil |

## 11. Reglas y mantenimiento

1. **Una sola fuente de verdad**: `dev_console.ps1` es el único lugar que define puertos y
   lanzamiento de webs. Las guías y docs referencian sus valores; ante un cambio (nueva web
   o puerto) actualizar a la vez: script, guías (`md`/`txt`), y las tablas de `AGENTS.md`.
2. **No hardcodear rutas nuevas**: la carpeta del portfolio se resuelve en runtime.
3. **Toda web nueva** debe añadirse a `$WEBS` con su puerto fijo y su comando pnpm.
4. **Cerrar las webs al terminar**: liberar los puertos 3000-3003 con `devstop` o desde el
   TUI; evita colisiones en sesiones siguientes.
5. **Logs siempre bajo `.opencode/temp/`**: nunca dentro de `projects/` ni `test/`.
6. La consola es **dev-only**; no interfiere con los deploys de producción ni con los jobs
   de CI. Los e2e (Playwright) contra producción son otro sistema (`TESTING_SYSTEM.md`).

## 10. Pruebas de la consola (sin Pester)

La consola no depende de un framework externo; se prueba con dos mecanismos:

- **SelfTest interno** (`-SelfTest`): determinista y sin interactividad. Valida versión,
  catálogo de webs (4 keys/ports fijos), `Format-State`, que `Get-WebPhase` devuelve una fase
  válida por web y que `Build-WebSelectOptions` genera las 4 opciones. Termina con `exit 0/1`.
- **Runner** `test/website/debug/dev_console.tests.ps1`: verifica sintaxis, BOM UTF-8
  (obligatorio para los emojis en PS 5.1), SelfTest, modo Demo y CLI `-Action status`.
  Termina con `exit 0` solo si todo pasa.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.ps1 -SelfTest
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.tests.ps1
```

Al tocar lógica del TUI, ejecutar siempre el runner antes de commitear.

## Referencias

- Guía de usuario: `test/website/debug/dev_console.md` y `test/website/debug/dev_console.txt`.
- Pruebas de la consola: `test/website/debug/dev_console.tests.ps1`.
- Debugging: `DEBUGGING_SYSTEM.md`.
- Protocolos locales: `LOCAL_TESTING_PROTOCOLS.md`.
- Framework de tests global: `TESTING_SYSTEM.md`.
- Comandos del agente: `OPENCODE_SYSTEM.md`.

_Última revisión: 17 ago 2026._ Relacionado: `DEBUGGING_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md`, `TESTING_SYSTEM.md`.