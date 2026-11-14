---
description: Busca presencia en ~400 redes sociales por username con Sherlock (preset oficial de Ciszu).
---

Ejecuta Sherlock sobre uno o más usernames con el preset oficial:

```powershell
& "E:\Ciszu Network\tools\cibersecurity\osint\sherlock.ps1" -Usernames <user1>,<user2> [-Preset full|quick] [-Test] [-Out ruta]
```

- **full** (default): `--csv --timeout 30`
- **quick**: `--csv --timeout 15`
- Salida oficial: `tools/cibersecurity/osint/output/sherlock/` · Test: `test/osint/sherlock/` (gitignored)

Luego resume: usernames consultados, nº de redes con presencia y carpeta de salida.
No imprimir credenciales. Refs: `CIBERSECURITY_SYSTEM.md`, `OSINT_PROTOCOLS.md`.