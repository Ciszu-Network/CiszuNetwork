// Diagnóstico profundo del hook de changelogs publicados.
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();

await page.goto('http://localhost:3000/changelog', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);

const debug = await page.evaluate(async () => {
  // GET manual a la API de debug.
  const net = await fetch('/api/changelogs/debug?site=ciszu').then((r) => r.json());
  // React hydration: los ServerComponents envían pageProps. Si el hook está bien
  // serializado, veríamos published. Si es undefined, el cliente nunca recibe
  // una versión del hook en bundle.
  const props = window.__NEXT_DATA__
    ? (typeof window.__NEXT_DATA__ === 'object'
        ? (window.__NEXT_DATA__.props && window.__NEXT_DATA__.props.pageProps)
        : null)
    : null;
  const body = document.body.innerText;
  const cards = Array.from(document.querySelectorAll('a[href^="/changelog/"]')).map((a) => ({
    href: a.getAttribute('href'),
    text: a.innerText.replace(/\s+/g, ' ').slice(0, 70),
  }));
  return {
    net,
    propsKeys: props ? Object.keys(props) : ['no-__NEXT_DATA__'],
    cards,
    contador: (body.match(/MOSTRANDO[^\n]*/i) || ['(sin contador)'])[0],
    bodyHead: body.slice(0, 400).replace(/\s+/g, ' '),
  };
});
console.log('🔎 GET /api/changelogs/debug?site=ciszu =', JSON.stringify(debug.net));
console.log('🧩 pageProps keys =', JSON.stringify(debug.propsKeys));
console.log('🔗 cards =', JSON.stringify(debug.cards, null, 2));
console.log('🧮 contador =', debug.contador);
console.log('📄 bodyHead =', debug.bodyHead);

// Detalle de la entrada local (por slug).
await page.goto('http://localhost:3000/changelog/local-e2e-devcon', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
const detailBody = await page.evaluate(() => document.body.innerText.slice(0, 600));
console.log('📄 locale detail body =', detailBody.replace(/\s+/g, ' '));
await browser.close();
process.exit(0);
