---
description: Opera Storybook de @ciszu/ui: levanta el UI, corre/ve tests de interaccion (Playwright), build, o publica en Chromatic (visual + a11y).
---

Opera Storybook de `@ciszu/ui` según el argumento pasado. Storybook es dev-only y vive en `packages/ui/`.

- **sin argumento / `run`** → levanta el servidor: `pnpm --filter @ciszu/ui storybook` (puerto 6006). Espera a que diga *Storybook 10.5.8 started* y confirma a Ciszuko la URL `http://localhost:6006`.
- **`test`** → ejecuta las stories como tests de componente en un navegador real:
  `pnpm --filter @ciszu/ui test:storybook` (usa Playwright/Chromium vía `@storybook/addon-vitest` + `vitest.config.mts`). Repórtame el resumen (tests pasados/fallados).
- **`testwatch`** → modo watch de los tests de stories: `pnpm --filter @ciszu/ui exec vitest --config vitest.config.mts` (re-ejecuta al guardar).
- **`build`** → `pnpm --filter @ciszu/ui build-storybook`; output en `packages/ui/storybook-static`.
- **`chromatic`** → publica visual + a11y en la nube: `pnpm --filter @ciszu/ui chromatic` (usa el token del repo en CI; local pide auth). Deja que Chromatic responda y reporta la URL del build.

Reglas:
- No crear más de una story por componente salvo que tenga estados/args distintos claros.
- Las stories nuevas deben llevar `tags: ['autodocs', 'a11y', 'test']` (autodocs=docs, a11y=chequeo Axe, test=incluida en los tests de interacción).
- Las play functions se importan de `storybook/test` (NO `@storybook/test`): `expect`, `userEvent`, `within`, `fn`.
- Tras tocar stories/componentes, correr `test` para validar antes de terminar.