# Staff Console (STAFFCON) — Guía de uso (Ciszu Network)

> Consola interactiva (TUI) para gestionar los **empleados** de la organización.
> Mantiene `archives/staff/` (general → cargo → empleado) con sus 6 formatos
> (md/txt/csv/xlsx/docx/pdf) y el organigrama en `content/`.

Versión: 1.0.0
Ubicación: `tools/consoles/staffcon.ps1`
Motor: `scripts/staffcon.js` + generador `scripts/staffgen.js`
Fuente de verdad: `archives/staff/data/staff.json`

## Qué hace

- **Resumen**: empleados actuales, rangos (20 cargos), información y ubicación exacta.
- **Añadir empleado**: nombres, apellidos, teléfono, correo, dirección, ID auto (CZ-XXX),
  cargo y supervisor. Solo CEO, Supervisor y Gerente (y C-level con permiso) pueden añadir.
- **Quitar empleado**: el ID se conserva; sus docs pasan a registro de baja.
- **Cambiar rango**: ascender/descender/colocar un cargo (mueve la carpeta del empleado).
- **Modificar datos**: cualquier campo excepto el rango. Puedes editarte a ti mismo.
- **Herramientas / Manual / Información / Salir**.

## Acceso (seguridad)

- **Password global** (vault `DEVCON_PASSWORD`, nunca en código).
- **Identidad**: pide tu ID de empresa (CZ-XXX). Puede entrar cualquier empleado activo
  (`org.accesos.staffcon`, nivel ≤ 9); las operaciones se validan por la matriz de permisos
  y jerarquía (un nivel N gestiona solo niveles > N).
- El **fundador** (CZ-001) no se puede quitar ni cambiar de rango, pero sí editar sus datos.
- Toda acción queda registrada como `actor` en el log de sesión.

## Logs

- `tools/consoles/local-logs/staffcon-<fecha>.log` — cada acción (login/logout/alta/baja/rango/mod).

## Comandos del perfil PowerShell

```powershell
staffcon
```

## Personalizar el banner (ASCII art)

El banner vive en `Show-Banner` de `tools/consoles/staffcon.ps1`. Se genera con TAAG
(Text to ASCII Art Generator): https://patorjk.com/software/taag/ — preajuste Graffiti:
`https://patorjk.com/software/taag/#p=display&f=Graffiti&t=Type+Something+&x=none&v=4&h=4&w=80&we=false`

_Última revisión: 26 ago 2026._ Relacionado: `STAFF_SYSTEM.md`, `EMPLOYEES_SYSTEM.md`.