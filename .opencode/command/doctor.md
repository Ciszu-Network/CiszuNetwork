---
description: Diagnóstico del entorno local (Node, pnpm, Git, entorno, puertos, discos y workflows).
---

Ejecuta el diagnóstico portable:

```bash
pnpm run doctor
```

El comando comprueba Node >=24, pnpm, Git, GitHub CLI, Wrangler, Docker, `.env.local`,
vault local, rama/estado de Git, número de workflows, puertos 3000-3003 y espacio libre.

Reglas:

- No corrijas ni borres nada automáticamente: primero reporta `OK`, `WARN` e `INFO`.
- Si el usuario pide reparar, propone el cambio concreto y espera confirmación.
- Para JSON: `pnpm run doctor -- --json`.
