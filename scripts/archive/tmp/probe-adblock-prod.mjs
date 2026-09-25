// Prueba la deteccion del AdBlockerGuard contra una URL, simulando adblocker:
//   --net   corta la peticion del script de AdSense (bloqueador de RED/DNS)
//   --css   oculta los baits via CSS (filtro cosmetico tipo uBlock)
//   --dns   deja pasar el script (como si ya estuviera en cache HTTP) pero corta
//           fetch/XHR del dominio de anuncios (bloqueador DNS con script cacheado)
// Uso: node tmp/probe-adblock-prod.mjs <url> [--net] [--css] [--dns]
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'https://ciszukoantony.vercel.app/';
const modeNet = process.argv.includes('--net');
const modeCss = process.argv.includes('--css');
const modeDns = process.argv.includes('--dns');
const modeCssLate = process.argv.includes('--csslate');
const modeReject = process.argv.includes('--reject');

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext();
// storage limpio (como el usuario al borrar cache/datos)
await ctx.addInitScript(() => {
  try { localStorage.clear(); sessionStorage.clear(); } catch {}
});
const page = await ctx.newPage();
const blocked = [];
page.on('requestfailed', (r) => {
  if (/pagead2|googlesyndication|doubleclick/.test(r.url())) blocked.push(r.url().slice(0, 120));
});
if (modeNet) {
  await page.route('**pagead2.googlesyndication.com/**', (r) => r.abort());
}
if (modeReject) {
  // Cookies rechazadas (bypass del guard) + AdSense bloqueado: no debe salir.
  await ctx.addInitScript(() => {
    try { localStorage.setItem('cookies_accepted', 'false'); } catch {}
  });
  await page.route('**pagead2.googlesyndication.com/**', (r) => r.abort());
}
if (modeDns) {
  await page.route('**googlesyndication.com/**', (r) =>
    r.request().resourceType() === 'script' ? r.continue() : r.abort(),
  );
}
if (modeCss) {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '.adsbox,.adbox,.ad-banner,.ad-placeholder,.pub_300x250,.advertisement,.leaderboard,.ad-slot,.ad-container,.sponsor-ad-wrap,.textads,.banner-ad,.pub_300x250m,.pub_728x90,.google-ad,.ad-wrapper,.ad-unit{display:none!important}';
      document.head.appendChild(s);
    });
  });
}
if (modeCssLate) {
  // Simula extensiones MV3 (uBOL/AdGuard): el CSS cosmético llega DESPUÉS de la carga.
  await page.addInitScript(() => {
    setTimeout(() => {
      const s = document.createElement('style');
      s.textContent = '.adsbox,.adbox,.ad-banner,.ad-placeholder,.pub_300x250,.advertisement,.leaderboard,.ad-slot,.ad-container,.sponsor-ad-wrap,.textads,.banner-ad,.pub_300x250m,.pub_728x90,.google-ad,.ad-wrapper,.ad-unit{display:none!important}';
      document.head.appendChild(s);
    }, 2000);
  });
}

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${String(e).slice(0, 300)}`));

await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(9000);

const out = await page.evaluate(() => {
  const text = document.body ? document.body.innerText : '';
  const script = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
  // replica de baitHidden()
  const cls = ['ad-banner ad-placeholder pub_300x250 adbox adsbox', 'advertisement leaderboard', 'adsbygoogle ad-slot', 'sponsor-ad-wrap ad-container', 'adsbox adsbox-ad'];
  const probe = () => {
    const res = [];
    for (const c of cls) {
      const b = document.createElement('div');
      b.innerHTML = '&nbsp;';
      b.className = c;
      b.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:300px;height:250px;';
      document.body.appendChild(b);
      const st = getComputedStyle(b);
      res.push({ cls: c, h: b.offsetHeight, w: b.offsetWidth, parent: b.offsetParent === null, display: st.display, vis: st.visibility, op: st.opacity });
      document.body.removeChild(b);
    }
    return res;
  };
  return {
    guardVisible: /ADBLOCKER DETECTADO/i.test(text),
    guardBlur: !!document.querySelector('div[style*="blur(14px)"]'),
    adScriptInDom: !!script,
    adScriptSrc: script ? script.getAttribute('src').slice(0, 120) : null,
    adsbygoogleType: typeof window.adsbygoogle,
    consent: localStorage.getItem('cookies_accepted'),
    choice: localStorage.getItem('ciszu_adblock_choice'),
    voluntary: sessionStorage.getItem('ciszu_voluntary_reload'),
    turnstile: !!document.querySelector('iframe[src*="challenges.cloudflare.com"]'),
    baits: probe(),
    bodyTextStart: text.slice(0, 200),
  };
});

const guardLogs = logs.filter((l) => l.includes('AdBlockerGuard'));
console.log(JSON.stringify({ url, modeNet, modeCss, modeDns, modeCssLate, modeReject, blocked, guardLogs, out, logs: logs.slice(0, 12) }, null, 1));
await page.screenshot({ path: `tmp/adblock-${modeNet ? 'net' : modeCss ? 'css' : modeDns ? 'dns' : 'clean'}.png`, fullPage: false });
await browser.close();
