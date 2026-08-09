import { expect, test } from '@playwright/test';

/**
 * Smoke E2E contra los 4 sitios en producción (Vercel).
 * Objetivo: detectar regresiones de despliegue (404, assets rotos, h1 ausente)
 * sin depender de datos dinámicos de las páginas.
 */

const SITES = {
  ciszunetwork: 'https://ciszunetwork.vercel.app',
  ciszukoantony: 'https://ciszukoantony.vercel.app',
  ciszubot: 'https://ciszubot.vercel.app',
  muzicmania: 'https://muzicmania.vercel.app',
} as const;

test('smoke: las 4 webs responden 200', async ({ request }) => {
  for (const [name, url] of Object.entries(SITES)) {
    const res = await request.get(url);
    expect(res.ok(), `${name}: ${url} → HTTP ${res.status()}`).toBeTruthy();
  }
});

test('ciszunetwork: héroe visible y sin imágenes rotas', async ({ page }) => {
  await page.goto(SITES.ciszunetwork, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1').first()).toBeVisible();

  // scrollea abajo para forzar el lazy-load de imágenes
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(3000);

  const broken = await page.evaluate(
    () => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length
  );
  expect(broken).toBe(0);
});

test('ciszubot: página principal con el badge de estado en vivo', async ({ page }) => {
  await page.goto(SITES.ciszubot, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1').first()).toBeVisible();

  // Badge de estado: "Bot en línea" / "Bot offline" / "Sin conexión"
  // según el heartbeat del bot (ciszubot.bot_status + revalidate=60).
  await expect(page.getByText(/bot (en línea|offline|sin conexión)/i).first()).toBeVisible();
});

test('muzicmania: responde y es la web correcta (challenge Cloudflare en headless)', async ({ page }) => {
  // ⚠️ muzicmania está detrás de un challenge de Cloudflare que no se resuelve
  // en headless — solo puedes verificar que la web responde y es MuzicMania.
  const res = await page.goto(SITES.muzicmania, { waitUntil: 'domcontentloaded' });
  expect(res?.status(), `HTTP ${res?.status()}`).toBeLessThan(500);
  await expect(page).toHaveTitle(/muzicmania/i);
});