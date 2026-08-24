// seo-run-all.js — ejecuta una acción SEO sobre los 4 websites.
// Uso:
//   node scripts/seo-run-all.js sf <crawl-date>
//   node scripts/seo-run-all.js log <log-file-per-site>   (o "auto" para detectar)
//   node scripts/seo-run-all.js compare <old-date> <new-date>
//   node scripts/seo-run-all.js fixes <date> [apply|dry-run]
//   node scripts/seo-run-all.js all <crawl-date>          (sf + fixes dry-run)

const { spawnSync } = require('child_process');
const path = require('path');

const SITES = ['ciszu', 'cizukoantony', 'muzicmania', 'ciszubot'];

const [,, action, ...args] = process.argv;

if (!action) {
  console.log('Uso: node scripts/seo-run-all.js <sf|log|compare|fixes|all> [args...]');
  process.exit(1);
}

const actions = action === 'all' ? ['sf', 'fixes'] : [action];

for (const a of actions) {
  for (const site of SITES) {
    console.log(`\n=== ${site} (${a}) ===`);
    const result = spawnSync('node', [path.join('scripts', 'seo-run.js'), site, a, ...args], {
      stdio: 'inherit',
      shell: true,
    });
    if (result.status && result.status !== 0) {
      console.log(`⚠️ ${site}: ${a} terminó con código ${result.status}`);
    }
  }
}