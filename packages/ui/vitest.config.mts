import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Los browsers de Playwright se instalan en E: (disco del sistema C: tiene
// poco espacio). Mismo patrón que playwright.config.ts de la raíz. En CI no
// existe esa ruta y se usan los browsers instalados con `playwright install`.
const localBrowsersPath = path.join(
  dirname,
  '..',
  '..',
  '.opencode',
  'temp',
  'playwright-browsers'
);
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(localBrowsersPath)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = localBrowsersPath;
}

// Config del addon Vitest de Storybook:
// transforma las stories de @ciszu/ui en tests de componente que corren en un navegador
// real (Playwright/Chromium) sin depender de Chromatic ni de tener Storybook levantado.
export default defineConfig({
  define: {
    // En browser mode no existe `process`: lo resolvemos en build-time (mismo
    // patrón que Next.js). @ciszunetwork/cdn lee NEXT_PUBLIC_CDN_URL en runtime.
    'process.env.NEXT_PUBLIC_CDN_URL': JSON.stringify(
      process.env.NEXT_PUBLIC_CDN_URL ?? ''
    ),
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            storybookUrl: 'http://localhost:6006',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
          coverage: {
            enabled: true,
            provider: 'v8',
            reportsDirectory: './coverage-storybook',
            include: ['src/**'],
          },
        },
      },
    ],
  },
});