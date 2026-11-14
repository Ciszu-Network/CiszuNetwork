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
- snippets del perfil PowerShell portable.

Para una versión máquina-legible: `pnpm commands -- --json`.

Si el usuario pregunta por un comando concreto, léelo de `package.json` o de su archivo
`.opencode/command/<nombre>.md` antes de responder. No inventes scripts.
