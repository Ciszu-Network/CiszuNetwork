import { defineConfig } from '@playwright/test';

// E2E (Fase 3 del plan TESTING.md): smoke tests contra los sitios en producción.
// Ejecutar con: pnpm e2e
// Nota: si PLAYWRIGHT_BROWSERS_PATH no está definido, Playwright descarga los
// browsers a %USERPROFILE%\AppData\Local\ms-playwright. En este PC se instalan
// en E:\Ciszu Network\.opencode-tmp\playwright-browsers (disco E:, no C:).
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list']],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});