---
description: Limpia caches locales seguras (.next, .turbo, logs de dev) sin tocar el código.
---

Comandos de limpieza acotados:

- `pnpm clean:next` → `.next` de las 4 webs.
- `pnpm clean:logs` → `test/website/debug/local-logs`.
- `pnpm clean:all` → `.next` + `.turbo` + logs.

Añade `-- --dry-run` para ver tamaños sin borrar. No borra `.opencode/temp`, `node_modules`,
archivos de otros agentes ni bases de datos. Si el usuario pide limpiar algo fuera de esa
lista, pide confirmación explícita.
