# Console Dev Debugging — Guía de uso (Ciszu Network)

> Consola interactiva (TUI) para probar las 4 webs del monorepo en local,
> sin abrir terminales a mano. Con navegación por flechas y acciones por web.

Versión: 1.0.0
Ubicación: `test/website/debug/dev_console.ps1`

## Qué hace

- **Encender / Reiniciar / Detener** cada webapp (Next.js `next dev` con puerto fijo).
- **Encender / Detener TODAS** las webs a la vez.
- **Estado de puertos**: revisa qué puertos están escuchando y abrir la web en el navegador.
- **Logs a tiempo real**: abre el log de la web en una ventana PowerShell separada (`Get-Content -Tail -Wait`).
- **Herramientas extra**: limpiar logs, ver procesos node, ver ocupación de puertos 3000-3003.
- **Ayuda, créditos y versión** integrados en el mismo menú.

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
| `Enter` | Elegir la opción resaltada |
| `Q` o `Esc` | Volver al menú anterior (o salir en el principal) |

### Flujo típico

1. Abrir la consola (`devcon`).
2. Elegir **Encender TODAS las webs** (o una web concreta).
3. Esperar unos segundos y elegir **Estado de puertos** para ver si responden.
4. Abrir `http://localhost:3000` … `http://localhost:3003` en el navegador.
5. Si una web falla, desde su gestión elegir **Ver log (tiempo real)**.
6. Al terminar, **Detener TODAS las webs** y **Salir**.

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