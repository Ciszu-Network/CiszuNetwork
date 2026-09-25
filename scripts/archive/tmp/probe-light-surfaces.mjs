// Localiza de dónde sale un fondo oscuro en modo claro: imprime la cadena de
// ancestros con la clase que aporta el color.
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://127.0.0.1:3003';
const target = process.argv[3] || 'rgb(2, 6, 23)';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.addInitScript(() => {
  localStorage.setItem('ciszu_preferences', JSON.stringify({ theme: 'light' }));
});
await page.goto(url + '/', { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(2500);

const report = await page.evaluate((target) => {
  const hits = [];
  for (const el of document.querySelectorAll('*')) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg !== target) continue;
    const chain = [];
    let node = el;
    for (let i = 0; i < 4 && node; i += 1) {
      const cls = typeof node.className === 'string' ? node.className.slice(0, 140) : '';
      chain.push(`${node.tagName.toLowerCase()}${cls ? '.' + cls.split(/\s+/).join('.') : ''}`);
      node = node.parentElement;
    }
    hits.push({ tag: el.tagName.toLowerCase(), chain });
    if (hits.length >= 6) break;
  }
  return hits;
}, target);

console.log(JSON.stringify(report, null, 1));
await browser.close();
