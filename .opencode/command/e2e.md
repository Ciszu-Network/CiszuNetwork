---
description: Ejecuta los smoke tests E2E de Playwright contra producción y abre el reporte HTML.
---

Ejecuta los E2E de Playwright (smoke tests contra las 4 webs en Vercel) y abre el reporte visual:

1. Ejecuta `pnpm e2e` (usa Opera GX como navegador y `PLAYWRIGHT_BROWSERS_PATH` forzado a `E:\Ciszu Network\.opencode-tmp\playwright-browsers` — ambos ya quedan fijados en `playwright.config.ts`).
2. Si terminan OK, abre el reporte HTML en el navegador: `pnpm exec playwright show-report`.
3. Reporta el resumen: tests pasados/fallidos/flaky y qué webs quedan pendientes de revisar.

Notas: retries=1 para mitigar el DNS intermitente del PC (EAI_AGAIN). Si fallan por DNS, reintentar una vez antes de reportar error.