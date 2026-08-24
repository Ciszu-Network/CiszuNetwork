// seo-crawl-all.js — ejecuta el crawl de Screaming Frog para los 4 websites.
// Uso: node scripts/seo-crawl-all.js [fecha]

const { spawnSync } = require('child_process');
const path = require('path');

const SITES = ['ciszu', 'cizukoantony', 'muzicmania', 'ciszubot'];

const [,, dateArg] = process.argv;
const date = dateArg || new Date().toISOString().split('T')[0];

for (const site of SITES) {
  const result = spawnSync('node', [path.join('scripts', 'seo-crawl.js'), site, date], { stdio: 'inherit', shell: true });
  if (result.status && result.status !== 0) {
    console.log(`⚠️ ${site}: crawl terminó con código ${result.status}`);
  }
}