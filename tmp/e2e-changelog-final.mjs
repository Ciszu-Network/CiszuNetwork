// Verificación final de Playwright (ESM con createRequire).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
page.on('console', msg => {    if (msg.type() === 'error') console.log('[err]', msg.text().slice(0, 160));
});
page.on('response', res => {
  if (res.url().includes('/api/changelogs')) console.log('[net]', res.status(), res.request().method(), res.url());
});
page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0,200)));

console.log('--- índice /changelog ---');
await page.goto('http://localhost:3000/changelog', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const idxCards = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll('a[href^="/changelog/"]')).map(a => ({ href: a.getAttribute('href'), text: a.innerText.replace(/\s+/g,' ').slice(0, 60) }));
  const body = document.body.innerText;
  return {
    cards,
    contador: (body.match(/MOSTRANDO[^\n]*/i) || ['(sin contador)'])[0],
    localE2e: body.toUpperCase().includes('LOCAL E2E'),
    demoLocal: body.toUpperCase().includes('DEMO LOCAL'),
    versionLocal: body.toUpperCase().includes('LOCAL E2E') && body.includes('VERIFICACIÓN END-TO-END'),
  };
});
console.log('🔎 índice:', JSON.stringify(idxCards, null, 2));

// snapshots parciales del detalle de cada entrada.
const detailSlugs = ['patch-v2.5.0', 'demo-local-pipeline', 'local-e2e-devcon'];
for (const slug of detailSlugs) {
  await page.goto('http://localhost:3000/changelog/' + slug, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const detailInfo = await page.evaluate((u) => {
    const body = document.body.innerText;
    return {
      href: u,
      visible: body.length > 20,
      headerIncludesSlug: body.includes(u),
      bitacora: body.includes('BITÁCORA TÉCNICA') || body.includes('Bitácora Técnica'),
    };
  }, slug);
  console.log('📄 detalle', slug, ':', JSON.stringify(detailInfo));
}
await browser.close();
console.log('✅ verificación final lista');
process.exit(0);
