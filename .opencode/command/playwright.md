---
description: Ejecuta/inspecciona Playwright E2E y utilidades de navegador. Uso: /playwright [e2e|report|open|codegen|install|ui]
---

Opera Playwright (E2E contra producción y utilidades) según el argumento:

- **`e2e`** → smoke E2E contra las 4 webs en Vercel: `pnpm e2e` (usa Opera GX como navegador y `PLAYWRIGHT_BROWSERS_PATH` forzado a `.opencode/temp/playwright-browsers`). Specs: `test/website/e2e/`. Reintentar 1 vez si falla por DNS (EAI_AGAIN).
- **`report`** → corre e2e y abre el reporte HTML: `pnpm e2e`; si OK, `pnpm exec playwright show-report test/website/e2e/reports/playwright`.
- **`open`** → abre el último reporte (sin re-correr): `pnpm exec playwright show-report test/website/e2e/reports/playwright`.
- **`codegen`** → generador de tests apuntando a una URL de prod: `pnpm exec playwright codegen --browser chromium https://ciszunetwork.vercel.app`. Útil para crear specs nuevos interactivamente.
- **`install`** → instala/actualiza los browsers en la caché de E: (requerido en máquina nueva o CI): `pnpm exec playwright install --with-deps chromium`.
- **`ui`** → lanza el test runner con UI de Playwright si está configurado (`--ui`).

Artefactos/traces en `test/website/e2e/reports/test-results/` y reporte HTML en `test/website/e2e/reports/playwright/` (ambos gitignored).

Nota: los tests de **componentes** de Storybook corren también con Playwright, pero se disparan con `/storybook test`. Este comando es solo para E2E/producción y utilidades.