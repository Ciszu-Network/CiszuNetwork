import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Los browsers se instalan en E: (disco del sistema C: tiene poco espacio).
// Si PLAYWRIGHT_BROWSERS_PATH no lo indica, Playwright descargaría a
// %USERPROFILE%\AppData\Local\ms-playwright (C:) — lo forzamos aquí.
process.env.PLAYWRIGHT_BROWSERS_PATH ||= path.join(
  __dirname,
  '.opencode-tmp',
  'playwright-browsers'
);

// Opera GX como navegador por defecto en este PC (Chromium-based, evita
// descargar chromium aparte). Si no existe (CI/otra máquina), usa el
// chromium estándar de Playwright.
const OPERA_GX =
  'C:\\Users\\fplay\\AppData\\Local\\Programs\\Opera GX\\opera.exe';
const launchOptions = existsSync(OPERA_GX) ? { executablePath: OPERA_GX } : {};

// E2E (Fase 3 del plan TESTING.md): smoke tests contra los sitios en producción.
// Ejecutar con: pnpm e2e
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  workers: 2,
  retries: 1,
  reporter: [['list']],
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions,
  },
});