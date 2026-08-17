# Console Dev Debugging — Guía de uso (Ciszu Network)

> Consola interactiva (TUI) para probar las 4 webs del monorepo en local,
> sin abrir terminales a mano. Con navegación por flechas y acciones por web.

Versión: 2.1.0
Ubicación: `test/website/debug/dev_console.ps1`

## Qué hace

- **Operativas** (Encender / Reiniciar / Detener): abren un menú de **selección múltiple** con las 4 webs **marcadas por defecto** (auto-marcado). Al terminar de marcar/desmarcar decides cómo proceder: **Proceder**, **No proceder** o **Abortar**.
- **Proceder (Enter)**: ejecuta la operación en las webs marcadas. **No proceder (N)**: vuelve al menú sin aplicar nada. **Abortar (Q/Esc)**: detiene las webs y cierra la consola (equivale a Ctrl+C).
- **Espera real**: la consola espera a que cada web compila y queda lista (spinner) antes de volver al menú.
- **Estado**: consulta las webs que elijas (una, varias o todas), mostrando `ENCENDIDA / ENCENDIENDO... / DETENIDA`.
- **Logs a tiempo real**: menú **simple** — elige UNA web y abre su log (next dev) en ventana separada. **Solo las webs encendidas tienen log**: si una web está detenida no se ofrece abrir su log.
- **Herramientas extra**: limpiar logs, procesos node, puertos 3000-3003, abrir webs en el navegador, procesos por puerto, CPU/mem de cada web, abrir carpeta de logs, versiones (node/pnpm/turbo), git status, espacio en disco.
- **Ayuda, créditos y versión** integrados en el mismo menú.

Opciones con **emojis** y selector amarillo; rojo solo para errores.

## Puertos fijos (nomenclatura del monorepo)

| Web | Filtro pnpm | Puerto | Carpeta |
| --- | --- | --- | --- |
| **Ciszu Network** | `ciszunetwork-website` | 3000 | `projects/ciszu/website` |
| **Ciszuko Antony** | `ciszukantony-website` | 3001 | `projects/ciszukoantony/website` |
| **CiszuBot** | `ciszubot-website` | 3002 | `projects/ciszubot/website` |
| **MuzicMania** | `muzicmania-website` | 3003 | `projects/muzicmania/website` |

## Cómo abrirla

### Desde cualquier PowerShell (comando global)

```powershell
devcon
```

Ese comando vive en el perfil PowerShell (`devcon` = `dev_console.ps1` con la `ExecutionPolicy Bypass`).

### Directo desde el repositorio

```powershell
Set-Location "E:\Ciszu Network"
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.ps1
```

### Desde pnpm (raíz del monorepo)

```powershell
pnpm dev:console
```

## Uso del menú

| Tecla | Acción |
| --- | --- |
| `↑` / `↓` | Moverse entre opciones |
| `Enter` | **Proceder** (ejecutar la operación en las webs marcadas) |
| `Espacio` | Marcar o desmarcar la web resaltada |
| `A` | Marcar **todas** las webs |
| `1`…`9` / `0` | Saltar al índice de la opción (0 = 10.ª) |
| `N` | **No proceder** (cancelar la operación, vuelve al menú) |
| `Q` o `Esc` | **Abortar** (detiene las webs en ejecución y cierra la consola, como Ctrl+C) |

Las webs aparecen **marcadas por defecto** en cada operativa (pulsar `A` las re-marca todas). Cada opción se muestra con **índice numérico, emoji e icono** de estado; la selección se resalta en **amarillo**; los **rojos quedan solo para errores**. Estados: `🟢 ENCENDIDA` / `🟡 ENCENDIENDO...` / `⚫ DETENIDA`.

### Flujo típico

1. Abrir la consola (`devcon`).
2. Menú principal → **Encender webs** (o Reiniciar / Detener).
3. Las webs vienen marcadas; desmarca con **Espacio** las que no quieras.
4. **Enter** para **Proceder** (o `N` para cancelar, `Q/Esc` para abortar todo).
5. La consola espera a que compile cada web y avisa cuando está lista.
6. **Estado** para consultar una, varias o todas.
7. **Logs en tiempo real** para ver el log (next dev) de una web **encendida**.
8. **Salir (Ctrl+C)** detiene las webs y cierra la consola.

## Modo CLI (sin menú, para automatización)

La consola también acepta acciones directas sin abrir el TUI:

```powershell
# Estado de todas las webs
powershell -File test\website\debug\dev_console.ps1 -Action status

# Encender una web concreta (network | antony | ciszubot | muzic)
powershell -File test\website\debug\dev_console.ps1 -Action start -Web network
powershell -File test\website\debug\dev_console.ps1 -Action start -Web antony
powershell -File test\website\debug\dev_console.ps1 -Action restart -Web ciszubot
powershell -File test\website\debug\dev_console.ps1 -Action stop -Web muzic

# Ver el log en vivo de una web (abre ventana separada)
powershell -File test\website\debug\dev_console.ps1 -Action log -Web network
```

También existen comandos cortos del perfil (función `dev`):

```powershell
devweb      # encender Ciszu Network
devantony   # encender Ciszuko Antony
devbotweb   # encender CiszuBot
devmuzic    # encender MuzicMania
devall      # encender todas
devstop     # detener todas
devstatus   # estado de puertos rápidos
devlog network   # log en vivo de una web
```

## Pruebas automáticas (sin Pester)

La consola incluye un **SelfTest interno** determinista (`-SelfTest`) que valida versión, catálogo de webs, `Format-State`, fases posibles y opciones de selección, sin interactividad:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.ps1 -SelfTest
```

Y un **runner de pruebas** que verifica sintaxis, BOM UTF-8, SelfTest, modo Demo y CLI status:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.tests.ps1
```

El runner termina con `exit 0` solo si todo pasa (ideal para el CI local).

## Logs

- **Ubicación**: `.opencode/temp/dev-logs/<key>.log` (gitignored).
  - `network.log`, `antony.log`, `ciszubot.log`, `muzic.log`.
  - Errores en `<key>.log.err`.
- **En vivo**: se abre una ventana PowerShell separada con `Get-Content -Tail 80 -Wait`.
  Cerrar esa ventana no afecta al TUI; los procesos de Next.js siguen corriendo.

## Notas / resolución de problemas

| Problema | Solución |
| --- | --- |
| "Puerto ocupado" al encender | El puerto está en uso por `next dev`, otro proceso o una web ya encendida. Revisar con `devstatus`, detener la web o usar `Ver que puertos están ocupados` en Herramientas. |
| La web no responde a los 5 s | El compilador de Next sigue trabajando. Esperar y verificar de nuevo en **Estado de puertos** o ver el log en vivo. |
| Los logs acumulan mucho | **Herramientas → Limpiar logs** (borra `.opencode/temp/dev-logs/*`). |
| `pnpm` no se encuentra desde la consola | La consola llama a `pnpm` del PATH. Si no está, ejecutar desde una PowerShell con pnpm configurado (la consola hereda el entorno). |
| Ventana oculta inesperada | Los procesos Next dev se lanzan con `cmd.exe /c` en ventana oculta; el log es la única salida. Usar `-Action log` para verlos. |

## Créditos

- **Proyecto**: Ciszu Network — ecosistema digital de Ciszuko Antony.
- **Consola**: Console Dev Debugging (TUI) — `test/website/debug/dev_console.ps1`.
- **Documentación relacionada**: `DEV_CONSOLE_SYSTEM.md`, `DEBUGGING_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md` (en `projects/ciszu/docs/documentation/`).

## Comandos opencode relacionados

- `/dev` — encender / detener webs locales desde opencode.
- `/devcon` — abre la consola TUI (no recomendado desde opencode; usar modo CLI).

_Última revisión: 16 ago 2026._ Relacionado: `dev_console.txt`, `DEV_CONSOLE_SYSTEM.md`.