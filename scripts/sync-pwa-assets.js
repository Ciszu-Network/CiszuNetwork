/**
 * sync-pwa-assets.js — copia el service worker canónico a los 4 websites.
 * Uso:   node scripts/sync-pwa-assets.js
 * Iconos: regenerar con scripts/generate-pwa-icons.ps1 (GDI+).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SW_SRC = path.join(ROOT, 'scripts', 'pwa', 'sw.js');

const WEBS = [
  'projects/ciszu/website',
  'projects/ciszubot/website',
  'projects/muzicmania/website',
];

const antony = fs.readdirSync(path.join(ROOT, 'projects')).find((d) => /^ciszuk.*antony$/.test(d));
if (antony) WEBS.push(`projects/${antony}/website`);

let ok = 0;
for (const w of WEBS) {
  const dst = path.join(ROOT, w, 'public', 'sw.js');
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(SW_SRC, dst);
  ok += 1;
  console.log(`  [>>] ${w.replace(/^projects\//, '')}/public/sw.js`);
}
console.log(`Sync: ${ok} service workers copiados (canonical: scripts/pwa/sw.js)`);