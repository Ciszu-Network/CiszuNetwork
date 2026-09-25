// Auditoría de consola por rutas, SIN extensiones, quedándose solo con lo que es
// NUESTRO (descarta el ruido de terceros: Turnstile, anuncios bloqueados...).
// Uso: node tmp/console-audit-all.mjs [--base=prod|local] [--wait=5] [sitio...]
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const base = (args.find((a) => a.startsWith('--base='))?.split('=')[1]) ?? 'prod';
const waitS = Number(args.find((a) => a.startsWith('--wait='))?.split('=')[1] ?? 5);
const onlySites = args.filter((a) => !a.startsWith('--'));

const HOSTS = {
  ciszu: base === 'prod' ? 'https://ciszunetwork.vercel.app' : 'http://127.0.0.1:3000',
  ciszukoantony: base === 'prod' ? 'https://ciszukoantony.vercel.app' : 'http://127.0.0.1:3001',
  ciszubot: base === 'prod' ? 'https://ciszubot.vercel.app' : 'http://127.0.0.1:3002',
  muzicmania: base === 'prod' ? 'https://muzicmania.vercel.app' : 'http://127.0.0.1:3003',
};

const ROUTES = {
  ciszu: ['/', '/about', '/changelog', '/contact', '/courses', '/credits', '/documentation', '/donate', '/downloads', '/faq', '/feedback', '/forum', '/guidelines', '/help', '/information', '/license', '/policy', '/reviews', '/rules', '/stats', '/support', '/team'],
  ciszukoantony: ['/', '/about', '/certificates', '/changelog', '/contact', '/documentation', '/donate', '/downloads', '/faq', '/feedback', '/forum', '/help', '/information', '/policies', '/projects', '/reviews', '/stats', '/support', '/team'],
  ciszubot: ['/', '/about', '/changelog', '/commands', '/contact', '/documentation', '/donate', '/downloads', '/faq', '/feedback', '/forum', '/help', '/information', '/leaderboard', '/privacy', '/reviews', '/stats', '/support', '/team', '/terms'],
  muzicmania: ['/', '/about', '/changelog', '/contact', '/credits', '/documentation', '/donate', '/download', '/faq', '/fddp2026', '/feedback', '/forum', '/guidelines', '/help', '/information', '/leaderboard', '/library', '/license', '/play', '/policy', '/reviews', '/rules', '/stats', '/support', '/team', '/terms'],
};

// Ruido de terceros o de la propia infra que NO controlamos
const NOISE = [
  /challenges\.cloudflare\.com/i,
  /cdn-cgi\/challenge-platform/i,
  /%c%d font-size:0/,
  /OTS parsing error/,
  /powerPreference option is currently ignored/,
  /No available adapters/,
  /^\\u0000: 1$/,
  /^console\.groupEnd$/,
  /^\s*Error$/,
  /font-size:0;color:transparent/,
  /net::ERR_BLOCKED_BY_CLIENT/,
  /pagead2\.googlesyndication\.com/i,
  /doubleclick\.net/i,
  /gtag\/js/,
];
const isNoise = (text) => NOISE.some((re) => re.test(text));

const browser = await chromium.launch({ channel: 'chrome' });
const report = {};

for (const [site, host] of Object.entries(HOSTS)) {
  if (onlySites.length && !onlySites.includes(site)) continue;
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  report[site] = {};

  for (const route of ROUTES[site]) {
    const page = await ctx.newPage();
    const found = { console: [], pageerror: [], http: [], failed: [] };
    page.on('console', (m) => {
      const t = m.type();
      if (t !== 'warning' && t !== 'error') return;
      const text = m.text().slice(0, 260);
      const loc = m.location().url;
      if (isNoise(text) || isNoise(loc)) return;
      // Solo lo que nace de nuestro código (chunks propios o la propia página)
      if (loc && !loc.startsWith(host) && !loc.includes('_next/')) return;
      found.console.push(`${t}: ${text}`);
    });
    page.on('pageerror', (e) => {
      const text = String(e).slice(0, 260);
      if (isNoise(text)) return;
      found.pageerror.push(text);
    });
    page.on('response', (r) => { if (r.status() >= 400) found.http.push(`${r.status()} ${r.url().slice(0, 120)}`); });
    page.on('requestfailed', (r) => {
      const t = r.failure()?.errorText || '';
      if (isNoise(t) || isNoise(r.url())) return;
      found.failed.push(`${r.resourceType()} ${r.url().slice(0, 110)} → ${t}`);
    });

    try {
      await page.goto(host + route, { waitUntil: 'load', timeout: 90000 });
      await page.waitForTimeout(waitS * 1000);
    } catch (e) {
      found.pageerror.push('nav: ' + String(e).slice(0, 160));
    }
    await page.close();

    const has = found.console.length || found.pageerror.length || found.http.length || found.failed.length;
    if (has) report[site][route] = found;
    process.stdout.write(has ? 'X' : '.');
  }
  process.stdout.write(`  ${site}\n`);
}

console.log('\n' + JSON.stringify(report, null, 1));
await browser.close();
