---
description: Ejecuta herramientas OSINT oficiales (maigret, sherlock, simplelogin, spiderfoot) con presets de Ciszu.
---

Usa el dispatcher `tools/osint/osint.ps1` (o los wrappers individuales) para ejecutar
herramientas OSINT con los presets oficiales. Salidas:

- **Oficial**: `tools/osint/output/<herramienta>/`
- **Test rápido**: `-Test` → `test/osint/<herramienta>/` (gitignored, datos personales de terceros)

## Sintaxis

`/osint <herramienta> [args]`

| Herramienta | Comando | Preset por defecto |
| --- | --- | --- |
| maigret | `osint-maigret <usernames> [-Preset full\|quick] [-Test] [-Out ruta]` | `full` (graph+tags social,tech+csv+json ndjson+html) |
| sherlock | `osint-sherlock <usernames> [-Preset full\|quick] [-Test] [-Out ruta]` | `full` (csv+timeout 30) |
| simplelogin | `osint-slo info\|aliases\|options\|create <prefijo>\|random` | — (API SimpleLogin) |
| spiderfoot | `osint-sfx <targets> [-Preset full\|quick] [-Test] [-Out ruta]` | detecta tipo: email/phone/dominio/username (`quick` gratis) |

> **spiderfoot**: instalado en `clones/spiderfoot` (v4.0.0). Detecta tipo por formato
> (`@`=email · `+`sólo dígitos=teléfono · DNS=dominio · resto=username). `quick` = módulos
> gratuitos por tipo (~10-15 s) · `full` = `-u passive`. El wrapper detecta `clones\spiderfoot\sf.py`.

## Ejemplos

```powershell
# Maigret full (equivalent exacto al comando manual de Ciszuko)
& "E:\Ciszu Network\tools\osint\maigret.ps1" -Usernames iconage,iconagenator,DRAWDRAW

# Sherlock test rapido
& "E:\Ciszu Network\tools\osint\sherlock.ps1" -Usernames prueba -Preset quick -Test

# SimpleLogin: validar key + lista de alias
& "E:\Ciszu Network\tools\osint\simplelogin.ps1" info
& "E:\Ciszu Network\tools\osint\simplelogin.ps1" aliases
```

## Reglas

- Si el usuario no especifica Otra cosa, la salida oficial va a `tools/osint/output/<herramienta>/`.
- Nunca imprimas la API key de SimpleLogin ni recovery codes; `simplelogin.ps1` los lee del vault.
- Reporta resumen: usernames consultados, nº de hallazgos y carpeta de salida.
- Documentación de referencia: `CIBERSECURITY_SYSTEM.md` y `OSINT_PROTOCOLS.md`.