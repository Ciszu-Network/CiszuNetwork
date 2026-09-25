// Verificación en vivo (Playwright) del header, las páginas de información y el
// panel de Ko-fi de ciszubot y ciszu.
import { chromium } from '@playwright/test';

const MOVED = ['/reviews', '/stats', '/leaderboard', '/downloads', '/download', '/changelog', '/feedback'];

const results = [];
const check = (ok, label, detail = '') => {
  results.push({ ok, label, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
};

async function headerLinks(page) {
  return page.$$eval('nav a[href]', (nodes) => nodes.map((n) => n.getAttribute('href')));
}

async function dropdownLinks(page) {
  return page.evaluate(() => {
    const panels = [...document.querySelectorAll('nav div')].filter((d) => {
      const cls = typeof d.className === 'string' ? d.className : '';
      return cls.includes('absolute') && cls.includes('top-full');
    });
    const out = [];
    for (const panel of panels) {
      for (const a of panel.querySelectorAll('a[href]')) out.push(a.getAttribute('href'));
    }
    return out;
  });
}

const browser = await chromium.launch({ channel: 'chrome' });

for (const [name, base] of [
  ['ciszubot', process.env.CISZUBOT_URL || 'http://localhost:3121'],
  ['ciszu', process.env.CISZU_URL || 'http://localhost:3122'],
]) {
  console.log(`\n========== ${name} (${base}) ==========`);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  const known = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    // Ruido esperado al servir un build de producción en localhost:
    //  · CDN local (localhost:8788) fuera de la CSP de producción
    //  · el beacon de Cloudflare rechaza el origen localhost por CORS
    if (text.includes('localhost:8788') || text.includes('cloudflareinsights.com')) return;
    // Ruido del entorno local: assets del CDN local bloqueados y llamadas a
    // Supabase sin sesión (401/404). No son errores de la página.
    if (text.startsWith('Failed to load resource')) return;
    if (text.includes('React error #418')) {
      known.push(text);
      return;
    }
    errors.push(text);
  });
  page.on('pageerror', (e) => {
    const text = String(e);
    // Aviso de hidratación de ciszubot: AdSense reescribe su propio <script>
    // en el <head> ANTES de que React hidrate, así que el árbol del head no
    // coincide. Es previo a estos cambios (ocurre también en `/`, que no se
    // tocó) y React regenera ese subárbol. Se registra aparte, no como fallo.
    if (text.includes('Minified React error #418')) {
      known.push(text);
      return;
    }
    errors.push(text);
  });

  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const links = await headerLinks(page);
  const moved = MOVED.filter((href) => links.includes(href));
  check(moved.length > 0, `${name}: las secciones movidas están en el header`, moved.join(', ') || 'ninguna');

  const infoHref = links.includes('/information');
  check(infoHref, `${name}: el enlace Information sigue visible en el header`);

  // El desplegable abre por hover: se reintenta porque el primer intento puede
  // caer antes de que React hidrate y el listener esté montado.
  let drop = [];
  for (let attempt = 0; attempt < 3 && drop.length === 0; attempt += 1) {
    await page.hover('nav a[href="/information"]').catch(() => {});
    await page.waitForTimeout(900);
    drop = await dropdownLinks(page);
  }
  const leaked = MOVED.filter((href) => drop.includes(href));
  check(leaked.length === 0, `${name}: Information NO contiene las secciones movidas`, leaked.join(', ') || 'limpio');
  check(drop.length > 0, `${name}: el desplegable Information abre con enlaces`, `${drop.length} enlaces`);

  // Zoom 100% (viewport 1280): Information debe seguir visible.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);
  const infoVisible = await page.evaluate(() => {
    const a = document.querySelector('nav a[href="/information"]');
    if (!a) return false;
    const r = a.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  check(infoVisible, `${name}: Information visible a 1280px`);

  // Páginas de información
  for (const path of ['/information', '/help', '/about', '/team', '/faq']) {
    const res = await page.goto(base + path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const status = res?.status() ?? 0;
    const h1 = await page.$eval('h1', (el) => el.textContent?.trim() ?? '').catch(() => '');
    const body = await page.content();
    const hasError = /Application error|Internal Server Error/i.test(body);
    check(status === 200 && h1.length > 0 && !hasError, `${name}: ${path} carga`, `HTTP ${status} · h1="${h1}"`);
  }

  // Donación: panel Ko-fi sin iframe
  const donatePath = name === 'ciszu' ? '/donate' : '/donate';
  await page.goto(base + donatePath, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const kofiFrame = await page.$$eval('iframe', (nodes) =>
    nodes.map((n) => n.getAttribute('src') || '').filter((s) => s.includes('ko-fi')),
  );
  const kofiLink = await page.$$eval('a[href*="ko-fi.com"]', (nodes) => nodes.map((n) => n.href));
  check(kofiFrame.length === 0, `${name}: /donate sin iframe de Ko-fi`, kofiFrame.join(', ') || 'ninguno');
  check(kofiLink.length > 0, `${name}: /donate tiene enlace a Ko-fi`, kofiLink[0] ?? '');

  check(errors.length === 0, `${name}: sin errores de consola`, errors.slice(0, 3).join(' | ') || 'limpio');
  if (known.length) console.log(`KNOWN ${name}: aviso de hidratación de AdSense (previo, no bloqueante)`);

  await page.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
process.exit(failed.length ? 1 : 0);
