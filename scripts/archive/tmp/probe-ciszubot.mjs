// Localiza en qué página de ciszubot ocurre el error de hidratación de React.
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let current = '';

page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const text = m.text();
  if (text.includes('localhost:8788')) return;
  if (text.includes('cloudflareinsights.com')) return;
  if (text.includes('doubleclick') || text.includes('google-analytics')) return;
  console.log(`[${current}] ${text.slice(0, 400)}`);
});
page.on('pageerror', (e) => console.log(`[pageerror ${current}] ${String(e).slice(0, 400)}`));

for (const path of ['/', '/information', '/help', '/about', '/team', '/faq', '/donate', '/stats']) {
  current = path;
  await page.goto(`http://localhost:3121${path}`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
}

await browser.close();
console.log('listo');
