---
description: Abre Maltego (framework GUI de minería de datos OSINT) instalado por Ciszuko.
---

Maltego v4.12.1 Community (instalado por Ciszuko, 18 ago 2026) es GUI manual; **no hay CLI
para CI** — para automatizar usar SpiderFoot. Config de usuario en `%APPDATA%\Maltego\v4.12.1`.

```powershell
& "E:\Ciszu Network\tools\cibersecurity\maltego\maltego.ps1"          # abre la GUI
& "E:\Ciszu Network\tools\cibersecurity\maltego\maltego.ps1" -Config   # abre carpeta de config
& "E:\Ciszu Network\tools\cibersecurity\maltego\maltego.ps1" -Log      # abre el log actual
```

Reglas:
- No automatizar nada de Maltego en CI/scripts (es desktop, sin CLI).
- Entidades/vínculos hallados con Maltego se documentan en `OSINT_PROTOCOLS.md`.
- Refs: `CIBERSECURITY_SYSTEM.md`, `OSINT_PROTOCOLS.md`.
