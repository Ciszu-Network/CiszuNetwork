---
description: Framework integral OSINT con SpiderFoot (correos, teléfonos, dominios, IPs) usando el preset oficial de Ciszu.
---

Ejecuta SpiderFoot sobre uno o más targets con el preset oficial:

```powershell
& "E:\Ciszu Network\tools\osint\spiderfoot.ps1" -Targets <target1>,<target2> [-Preset full|quick] [-Test] [-Out ruta]
```

- **full** (default): `-u passive` — selecciona todos los módulos pasivos sin API keys (HIBP, social, dominios, IPs, usernames).
- **quick**: versión reducida (aún usando `-u passive`).
- SpiderFoot escanea **un target por scan**; el wrapper itera sobre la lista.
- Salida oficial: `tools/osint/output/spiderfoot/` · Test: `test/osint/spiderfoot/` (gitignored)

**Nota de instalación**: SpiderFoot no está instalado todavía. Si el usuario lo pide,
proponer (AGENTS §7.1): `git clone https://github.com/smicallef/spiderfoot "~/spiderfoot"`
+ `cd "~/spiderfoot"; pip install -r requirements.txt`. El wrapper detecta `~\spiderfoot\sf.py`.
Si no está instalado, el wrapper avisa y sale con código 2 (no falla el resto del trabajo).

Luego resume: targets consultados, nº de eventos encontrados (líneas CSV) y carpeta de salida.
No imprimir credenciales. Refs: `CIBERSECURITY_SYSTEM.md`, `OSINT_PROTOCOLS.md`.