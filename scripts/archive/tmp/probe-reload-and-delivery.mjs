// 1) ¿La home se carga dos veces?  2) ¿Leer el cuerpo del POST evita
// net::ERR_ABORTED en las tablas de entrega global_*?
// Uso: node tmp/probe-reload-and-delivery.mjs <url> [site]
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'https://ciszunetwork.vercel.app/';
const site = process.argv[3] || 'ciszu';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext();
await ctx.addInitScript(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
const page = await ctx.newPage();

const t0 = Date.now();
const navs = [];
const loads = [];
const fails = [];
page.on('framenavigated', (f) => { if (f === page.mainFrame()) navs.push(`${Date.now() - t0}ms ${f.url().slice(0, 90)}`); });
page.on('load', () => loads.push(`${Date.now() - t0}ms`));
page.on('requestfailed', (r) => fails.push(`${Date.now() - t0}ms FAIL ${r.method()} ${r.url().slice(0, 90)} → ${r.failure()?.errorText}`));

await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(6000);

const navInfo = await page.evaluate(() => {
  const e = performance.getEntriesByType('navigation')[0];
  return { type: e ? e.type : null, count: performance.getEntriesByType('navigation').length, marks: performance.getEntriesByType('resource').filter((r) => /rest\/v1\/global_disclaimer/.test(r.name)).length };
});

// Compara variantes de POST (mismo sitio, ids inexistentes → deben fallar por RLS,
// lo importante es el ERR_ABORTED):
const variants = await page.evaluate(async (siteName) => {
  const base = 'https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/global_disclaimer_deliveries';
  const key = window.__probeKey || '';
  const headers = { 'Content-Type': 'application/json', 'Content-Profile': 'ciszunetwork', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'resolution=merge-duplicates,return=minimal' };
  const body = JSON.stringify({ disclaimer_id: 999999, site: siteName });
  const out = {};
  // A) fire-and-forget (como el codigo actual)
  try { fetch(base, { method: 'POST', headers, body }).catch(() => {}); out.A = 'lanzado sin leer cuerpo'; } catch (e) { out.A = String(e); }
  await new Promise((r) => setTimeout(r, 1500));
  // B) leyendo el cuerpo
  try { const res = await fetch(base, { method: 'POST', headers, body }); await res.text(); out.B = `status ${res.status} (cuerpo leido)`; } catch (e) { out.B = `THREW ${e.message}`; }
  // C) sin Prefer (return=representation por defecto) leyendo json
  try { const res = await fetch(base, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates' }, body }); const j = await res.json().catch(() => null); out.C = `status ${res.status} json=${j === null ? 'null' : 'ok'}`; } catch (e) { out.C = `THREW ${e.message}`; }
  return out;
}, site);

await page.waitForTimeout(2500);
console.log(JSON.stringify({ url, site, navInfo, navs, loads, fails, variants }, null, 1));
await browser.close();
