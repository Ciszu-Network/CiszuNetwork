---
description: Busca perfiles por username con Maigret (recursión + tags) usando el preset oficial de Ciszu.
---

Ejecuta Maigret sobre uno o más usernames con el preset oficial:

```powershell
& "E:\Ciszu Network\tools\cibersecurity\osint\maigret.ps1" -Usernames <user1>,<user2> [-Preset full|quick] [-Test] [-Out ruta]
```

- **full** (default): `--graph --tags social,tech --csv --json ndjson --html`
- **quick**: solo `--csv`
- Salida oficial: `tools/cibersecurity/osint/output/maigret/` · Test: `test/osint/maigret/` (gitignored)

Luego resume: usernames consultados, nº de cuentas encontradas y carpeta de salida.
No imprimir credenciales. Refs: `CIBERSECURITY_SYSTEM.md`, `OSINT_PROTOCOLS.md`.