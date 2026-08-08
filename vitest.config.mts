import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Tests del monorepo (plan TESTING.md):
//   - packages/cdn   : lógica pura (node)
//   - packages/ui    : registry + componentes (happy-dom, via @vitest-environment en el archivo)
//   - discord-bot    : servicios (node, supabase mockeado; LOG_LEVEL=error vía setup)
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: [
      'packages/cdn/tests/**/*.test.ts',
      'packages/ui/tests/**/*.test.{ts,tsx}',
      'projects/ciszubot/discord-bot/tests/**/*.test.ts',
    ],
    setupFiles: [
      'packages/ui/tests/setup.ts',
      'projects/ciszubot/discord-bot/tests/setup.ts',
    ],
    css: false,
    globals: false,
  },
});