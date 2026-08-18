---
description: Gestiona alias de email temporales de SimpleLogin por API (info, listar, crear) con el wrapper oficial.
---

Gestiona SimpleLogin (alias de email anti-spam/privacidad) vía `tools/osint/simplelogin.ps1`.
La API key se lee del vault (`services/supabase/.env` → `SIMPLELOGIN_API_KEY`); nunca se imprime.

Acciones:

```powershell
& "E:\Ciszu Network\tools\osint\simplelogin.ps1" info          # validar key + cuenta
& "E:\Ciszu Network\tools\osint\simplelogin.ps1" aliases       # listar alias
& "E:\Ciszu Network\tools\osint\simplelogin.ps1" options       # dominios/suffix disponibles
& "E:\Ciszu Network\tools\osint\simplelogin.ps1" create <prefijo>   # crear alias custom
& "E:\Ciszu Network\tools\osint\simplelogin.ps1" random        # crear alias aleatorio
```

Reglas:
- No exponer la API key ni los recovery codes en logs/resumen.
- Si falta la key en el vault, devolver el mensaje de error del script (pide `vault crypt`).
- Refs: `CIBERSECURITY_SYSTEM.md`, `OSINT_PROTOCOLS.md`.