---
description: Catálogo vivo de comandos pnpm, opencode y PowerShell del ecosistema. Uso: /commands
---

Muestra el catálogo real de comandos disponibles sin hardcodear listas:

```bash
pnpm commands
```

Incluye:

- scripts de `package.json` (pnpm),
- archivos de `.opencode/command/*.md` con su descripción,
- snippets de los perfiles de shell (PowerShell en Windows, zsh en Linux).

Para una versión máquina-legible: `pnpm commands -- --json`.
Para comprobar la paridad entre ambos shells: `pnpm shell:check`.

Si el usuario pregunta por un comando concreto, léelo de `package.json` o de su archivo
`.opencode/command/<nombre>.md` antes de responder. No inventes scripts.
