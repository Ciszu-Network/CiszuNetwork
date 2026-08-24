// seo-run.js — orquesta los scripts SEO TS de cada website.
// Uso:
//   node scripts/seo-run.js <site> sf <crawl-date>
//   node scripts/seo-run.js <site> log <log-file>
//   node scripts/seo-run.js <site> compare <old-date> <new-date>
//   node scripts/seo-run.js <site> fixes <date> [apply|dry-run]
//
// site: ciszu | ciszukoantony | muzicmania | ciszubot
// La carpeta seo vive en projects/<folder>/website/seo/scripts/.

const { spawnSync } = require('child_process');
const path = require('path');

const SITE_FOLDERS = {
  ciszu: 'ciszu',
  ciszukoantony: 'ciszukoantony',
  muzicmania: 'muzicmania',
  ciszubot: 'ciszubot',
};

const SCRIPTS = {
  sf: 'process-sf-csv.ts',
  log: 'process-log-file.ts',
  compare: 'compare-crawls.ts',
  fixes: 'generate-fixes.ts',
};

const [,, site, action, ...args] = process.argv;

if (!site || !action) {
  console.log('Uso: node scripts/seo-run.js <site> <sf|log|compare|fixes> [args...]');
  console.log('Sites: ' + Object.keys(SITE_FOLDERS).join(' | '));
  process.exit(1);
}

if (!SITE_FOLDERS[site]) {
  console.log(`Sitio inválido: ${site}. Opciones: ${Object.keys(SITE_FOLDERS).join(', ')}`);
  process.exit(1);
}

const script = SCRIPTS[action];
if (!script) {
  console.log(`Acción inválida: ${action}. Opciones: ${Object.keys(SCRIPTS).join(', ')}`);
  process.exit(1);
}

const scriptPath = path.join('projects', SITE_FOLDERS[site], 'website', 'seo', 'scripts', script);

const result = spawnSync('npx', ['tsx', scriptPath, site, ...args], {
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status || 0);