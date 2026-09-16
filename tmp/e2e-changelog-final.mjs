// Snapshot Playwright: índice + detalle de patch-v2.5.0.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
page.on('console', msg => {
  const txt = msg.text();
  if (txt.includes('500') || txt.includes('TypeError')) console.log('[console]', msg.type(), txt.slice(0,200));
});
page.on('response', res => {
  if (res.url().includes('/api/changelogs')) console.log('[net]', res.status(), res.request().method());
});

const API_DEBUG = 'http://localhost:3000/api/changelogs/debug?site=ciszu';
const jApi = await (await fetch(API_DEBUG, { cache: 'no-store' })).json().catch(e => ({}));
console.log('API:', 'enabled=' + ((jApi.enabled||false)?'true':'false'), 'entries=' + (Array.isArray(jApi.entries)?jApi.entries.length:0), 'error='+(jApi.error||''));
if (jApi.entries && jApi.entries.length) jApi.entries.forEach(e => console.log('   - ' + e.id + ' ' + e.slug + ' ' + e.version + ' ' + ((e.delivered||[]).length===0?'PENDING':'ENTREGADO')));

await page.goto('http://localhost:3000/changelog', { cache: 'no-store', waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const idx = await page.evaluate(() => {
  const body = document.body.innerText;
  return {
    url: location.href,
    bodyOK: body.length > 100,
    hasTitle: body.toUpperCase().includes('CHANGELOG') || body.toUpperCase().includes('HISTORIAL'),
    counter: (body.match(/MOSTRANDO[^\r\n]*/i) || ['(sin contador)'])[0],
    hasLocal: body.toUpperCase().includes('LOCAL E2E') || body.toUpperCase().includes('DEMO LOCAL'),
  };
});
console.log('📄 índice:', JSON.stringify(idx, null, 2));

await page.goto('http://localhost:3000/changelog/patch-v2.5.0', { cache: 'no-store', waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const detail = await page.evaluate(() => {
  const body = document.body.innerText;
  return {
    url: location.href,
    bodyOK: body.length > 20,
    hasSlug: body.includes('PATCH V2.5.0'),
    hasBitacora: /BITÁCORA TÉCNICA|Bitácora Técnica/i.test(body)
  };
});
console.log('📄 detalle patch-v2.5.0:', JSON.stringify(detail, null, 2));

await browser.close();
console.log('✅ snapshot final');
process.exit(0);
