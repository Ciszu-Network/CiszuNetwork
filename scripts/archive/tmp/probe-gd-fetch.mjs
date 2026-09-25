// Traza el POST a global_disclaimer_deliveries desde la pagina para ver por que
// aparece como net::ERR_ABORTED. Uso: node tmp/probe-gd-fetch.mjs <url> [site]
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'https://ciszunetwork.vercel.app/';
const site = process.argv[3] || 'ciszu';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext();
await ctx.addInitScript(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
const page = await ctx.newPage();

const target = /rest\/v1\/global_disclaimer/;
const log = [];
let anonKey = '';
page.on('request', (r) => {
  if (/obwzzmbvkrcscqwptlqo\.supabase\.co/.test(r.url())) anonKey = anonKey || r.headers()['apikey'] || '';
  if (target.test(r.url())) log.push(`REQ  ${r.method()} ${r.resourceType()} ${r.url().slice(0, 120)}`);
});
page.on('response', (r) => { if (target.test(r.url())) log.push(`RESP ${r.status()} ${r.url().slice(0, 120)}`); });
page.on('requestfailed', (r) => { if (target.test(r.url())) log.push(`FAIL ${r.method()} ${r.url().slice(0, 120)} → ${r.failure()?.errorText}`); });
page.on('framenavigated', (f) => { if (f === page.mainFrame()) log.push(`NAV  ${f.url().slice(0, 100)}`); });
page.on('console', (m) => { if (/disclaimer|Disclaimer/i.test(m.text())) log.push(`LOG[${m.type()}] ${m.text().slice(0, 160)}`); });

await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(12000);

// Prueba manual: el MISMO POST desde el contexto de la pagina (para ver si el
// abort es de red/CORS o de ciclo de vida).
const manual = await page.evaluate(async ({ siteName, key }) => {
  const url = 'https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/global_disclaimer_deliveries';
  const doFetch = async (label, init) => {
    try {
      const res = await fetch(url, init);
      return `${label}: ${res.status} ${res.statusText}`;
    } catch (e) {
      return `${label}: THREW ${e.name} ${e.message}`;
    }
  };
  const headers = { 'Content-Type': 'application/json', 'Content-Profile': 'ciszunetwork', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'resolution=merge-duplicates,return=minimal' };
  return {
    site: siteName,
    keyPresent: !!key,
    postSinKey: await doFetch('POST-sin-key', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Profile': 'ciszunetwork' }, body: JSON.stringify({ disclaimer_id: 999999, site: siteName }) }),
    postConKey: await doFetch('POST-con-key', { method: 'POST', headers, body: JSON.stringify({ disclaimer_id: 999999, site: siteName }) }),
  };
}, { siteName: site, key: anonKey });

console.log(JSON.stringify({ url, site, manual, log }, null, 1));
await browser.close();
