---
description: Framework integral OSINT con SpiderFoot (correos, teléfonos, dominios, IPs) usando el preset oficial de Ciszu.
---

Ejecuta SpiderFoot sobre uno o más targets con el preset oficial:

```powershell
& "E:\Ciszu Network\tools\osint\spiderfoot.ps1" -Targets <target1>,<target2> [-Preset full|quick] [-Test] [-Out ruta]
```

- **full** (default): `-u passive` — todos los módulos pasivos sin API keys (HIBP, social, dominios, IPs, usernames). Lento.
- **quick**: `-m sfp_gravatar,sfp_keybase,sfp_social` — módulos rápidos (~10 s), para pruebas/CI.
- SpiderFoot escanea **un target por scan**; el wrapper itera sobre la lista.
- Salida oficial: `tools/osint/output/spiderfoot/` · Test: `test/osint/spiderfoot/` (gitignored)

**Instalado**: clon en `clones/spiderfoot` (v4.0.0). El wrapper detecta `clones\spiderfoot\sf.py`.
Si no está presente, avisa y sale con código 2 (no falla el resto del trabajo).

Luego resume: targets consultados, nº de eventos encontrados (líneas CSV) y carpeta de salida.
No imprimir credenciales. Refs: `CIBERSECURITY_SYSTEM.md`, `OSINT_PROTOCOLS.md`.