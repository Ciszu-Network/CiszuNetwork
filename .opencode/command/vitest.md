---
description: Corres los tests unitarios con Vitest: completo, filtrado, watch o panel visual. Uso: /vitest [all|watch|ui|<filtro>]
---

Corre los tests unitarios del monorepo con Vitest según el argumento:

- **`all` (default)** → suite completa: `pnpm test` (`vitest run`). Reporta tests pasados/fallidos/saltados.
- **`watch`** → modo watch: `pnpm test:watch` (re-ejecuta al guardar).
- **`ui`** → panel visual interactivo: `pnpm test:ui --open` (sirve en `http://localhost:<puerto>/__vitest__/`). Equivale a `/test-ui`.
- **`<filtro>`** → solo los tests que matcheen el argumento: `pnpm exec vitest run <filtro>` (acepta un substring o un path de archivo: `pnpm exec vitest run packages/ui`).

Contexto:
- Config raíz: `vitest.config.mts` (include: `packages/{cdn,ui,utils,email,payments}/tests/**` + `projects/ciszubot/discord-bot/tests/**`).
- Los tests de **componentes Storybook** NOS son estos: corre `/storybook test` por separado.
- Si un test del bot falla por `process.env` (ej. `PORT`/webhook), revisar que el setup `beforeAll` del archivo corra correctamente; a veces es flaky y reintentar pasa.

Tras correr, reporta el resumen real (Test Files / Tests) no solo "ok".