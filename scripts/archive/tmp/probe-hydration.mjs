// Diagnóstico detallado (modo dev = error sin minificar) del mismatch de
// hidratación en ciszubot.
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e.stack || e).slice(0, 4000)));
page.on('console', (m) => {
  const t = m.text();
  if (m.type() !== 'error') return;
  if (t.includes('localhost:8788')) return;
  console.log('CONSOLE:', t.slice(0, 3000));
});

await page.goto('http://localhost:3123/', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(6000);
await browser.close();
console.log('listo');
