# Dev Console — Guía de uso (Ciszu Network)

> Consola interactiva (TUI) para probar las 4 webs del monorepo en local. Este
> archivo es la referencia de `tools/consoles/devcon.ps1`, que es un **wrapper**
> que apunta a la consola real en `test/website/debug/dev_console.ps1`.

Versión: 2.4.0
Ubicación del wrapper: `tools/consoles/devcon.ps1`
Consola real: `test/website/debug/dev_console.ps1`

## Qué hace

- **Operativas** (Encender / Reiniciar / Detener): menú de selección múltiple con las 4 webs
  marcadas por defecto. Enter = proceder, N = no proceder, Q/Esc = abortar.
- **Estado de puertos**: consulta las webs elegidas (ENCENDIDA / ENCENDIENDO / DETENIDA).
- **Logs a tiempo real**: abre el log de una web encendida en ventana separada.
- **Herramientas extra**: limpiar logs, memoria, puertos, git status, CDN local, Advisor
  (mensajes globales) y las consolas STAFFCON / CUSTOMERSCON.
- **Manual / Créditos / Versión**.

## Acceso (seguridad)

- **Password global** (vault `DEVCON_PASSWORD`, nunca en código).
- **Identidad**: pide tu ID de empresa (CZ-XXX). Solo entras si tu rango está dentro del nivel
  máximo de la consola (`staff.json` → `org.accesos.devcon`, nivel ≤ 6).
- El operador queda registrado como `actor` en los logs de sesión.

## Logs

- `tools/consoles/local-logs/devcon-<fecha>.log` — entradas/salidas de sesión (vía wrapper).
- `test/website/debug/local-logs/devcon-<fecha>.log` y `advisor-<fecha>.log` — sesión del devcon
  y acciones del Advisor (se escriben desde la consola real en debug).

## Comandos del perfil PowerShell

```powershell
devcon            # TUI
devall / devstop  # encender / detener las 4 webs
devstatus         # estado de puertos
devlog <web>      # log en vivo (network | antony | ciszubot | muzic)
```

## Personalizar el banner (ASCII art)

El arte ASCII del devcon vive en `$ART` (variable) y `Show-Art` de
`test/website/debug/dev_console.ps1`. Se generan con TAAG
(Text to ASCII Art Generator): https://patorjk.com/software/taag/ — estilo
*Graffiti* o el que prefieras, con la URL de preajuste:
`https://patorjk.com/software/taag/#p=display&f=Graffiti&t=Type+Something+&x=none&v=4&h=4&w=80&we=false`

_Última revisión: 26 ago 2026._ Relacionado: `DEV_CONSOLE_SYSTEM.md`.