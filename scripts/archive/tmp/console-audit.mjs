// Auditoria de consola SIN extensiones: separa lo nuestro de lo que inyectan
// las extensiones del navegador. Uso:
//   node tmp/console-audit.mjs <url1> [url2 ...] [--wait=8]
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const waitArg = args.find((a) => a.startsWith('--wait='));
const waitMs = (waitArg ? Number(waitArg.split('=')[1]) : 8) * 1000;
const urls = args.filter((a) => !a.startsWith('--'));

const browser = await chromium.launch({ channel: 'chrome' });

for (const url of urls) {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
  });
  const page = await ctx.newPage();
  const entries = [];
  const netFailures = [];

  page.on('console', (m) => {
    const type = m.type();
    if (type === 'log' || type === 'info' || type === 'debug') return;
    entries.push({ kind: `console.${type}`, text: m.text().slice(0, 400), loc: `${m.location().url.replace(url, '')}:${m.location().lineNumber}`.slice(0, 160) });
  });
  page.on('pageerror', (e) => entries.push({ kind: 'pageerror', text: String(e).slice(0, 400), loc: (e.stack || '').split('\n')[1]?.trim().slice(0, 160) || '' }));
  page.on('requestfailed', (r) => {
    const f = r.failure();
    netFailures.push(`${r.resourceType()} ${r.url().slice(0, 140)} → ${f ? f.errorText : '?'}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) netFailures.push(`HTTP ${r.status()} ${r.url().slice(0, 140)}`);
  });

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  } catch (e) {
    entries.push({ kind: 'nav', text: String(e).slice(0, 200), loc: '' });
  }
  await page.waitForTimeout(waitMs);

  // Filtra el ruido de red esperado (bloqueos de anuncios no aplican sin extension)
  const dedupe = (list) => {
    const seen = new Map();
    for (const item of list) {
      const key = typeof item === 'string' ? item : `${item.kind}|${item.text}`;
      const prev = seen.get(key);
      if (prev) { if (typeof prev === 'object') prev.count += 1; continue; }
      seen.set(key, typeof item === 'string' ? item : { ...item, count: 1 });
    }
    return [...seen.values()];
  };

  console.log(`\n================ ${url} ================`);
  console.log('--- consola (error/warning) ---');
  console.log(JSON.stringify(dedupe(entries), null, 1));
  console.log('--- red (fallos + 4xx/5xx) ---');
  console.log(JSON.stringify(dedupe(netFailures), null, 1));

  await ctx.close();
}

await browser.close();
