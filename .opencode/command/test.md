---
description: Centraliza todas las pruebas: unit (Vitest), componente (Storybook) y E2E (Playwright). Uso: /test [unit|component|e2e|all|fast]
---

Orquestador central de pruebas de Ciszu Network. En vez de recordar cada herramienta, usa `/test`:

- **`unit`** → Vitest (unitarios): ver `/vitest all`.
- **`component`** → testes de componentes Storybook en navegador (Playwright/Chromium): `pnpm --filter @ciszu/ui test:storybook`. Ver `/storybook test`.
- **`e2e`** → smoke E2E contra producción: ver `/playwright e2e`.
- **`all` (default)** → unit + component primero (rápidos y sin red), reporta resumen; luego e2e (necesita red/producción) y reporta aparte.
- **`fast`** → solo unit (`pnpm test`) y component (`pnpm --filter @ciszu/ui test:storybook`), sin e2e. Útil como chequeo previo a commit.

Reglas:
- Antes de commit, recomendar al menos `fast` (no asumir éxito sin correr).
- Tras tocar story/componente UI, correr `component`.
- Reportar SIEMPRE cifras reales (Test Files / Tests), no "todo ok".
- Los tres corren con Playwright en algún nivel: unit usa happy-dom, component usa chromium real vía `@vitest/browser-playwright`, e2e usa Opera GX/producción.