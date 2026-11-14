---
description: Gestiona las 4 webs en local (dev server): encender, reiniciar, detener, estado y log en vivo.
---

Gestiona el arranque local de las 4 webs del monorepo (Next.js dev) usando la consola
`test/website/debug/dev_console.ps1` (modo CLI, no TUI). Cada web tiene un puerto fijo:

| Web | Filtro pnpm | Puerto local |
| --- | --- | --- |
| Ciszu Network | `ciszunetwork-website` | 3000 |
| Ciszuko Antony | `ciszukoantony-website` | 3001 |
| CiszuBot | `ciszubot-website` | 3002 |
| MuzicMania | `muzicmania-website` | 3003 |

Sintaxis: `/dev <accion> [web]`

- **`status`** → muestra qué webs responden en sus puertos:
  `powershell -NoProfile -ExecutionPolicy Bypass -File test/website/debug/dev_console.ps1 -Action status`
- **`start network|antony|ciszubot|muzic`** → encender una web concreta
  (`.ps1 -Action start -Web <key>`).
- **`restart <key>`** → detener y volver a encender (`.ps1 -Action restart -Web <key>`).
- **`stop <key>`** → detener una web (`.ps1 -Action stop -Web <key>`).
- **`log <key>`** → abre el log en vivo de una web en ventana PowerShell separada
  (`.ps1 -Action log -Web <key>`).

Sin argumentos → equivale a `status`.

Reglas:
- Los procesos Next dev corren en segundo plano (ventana oculta); el log es la única salida
  en `test/website/debug/local-logs/<key>.log` (gitignored). Para verlos usar `log`.
- No dejar webs encendidas al terminar una sesión de tests local: cerrar con
  `stop` (o `devstop` en PowerShell) para liberar los puertos 3000-3003.
- Si una web no responde a los 5 s del arranque, el compilador sigue trabajando:
  revisar de nuevo con `status` antes de reportar error.