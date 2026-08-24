// seo-crawl.js — ejecuta un crawl de Screaming Frog vía CLI (headless) y procesa los CSVs.
// Uso:
//   node scripts/seo-crawl.js <site> [fecha]
//   node scripts/seo-crawl-all.js <fecha>
//
// site: ciszu | ciszukoantony | muzicmania | ciszubot
// Requiere: Screaming Frog SEO Spider instalado (versión free suficiente, límite 500 URLs).
// El CLI exporta en el idioma del sistema (ES/EN); los scripts de análisis soportan ambos.

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SITE_FOLDERS = {
  ciszu: 'ciszu',
  ciszukoantony: 'ciszukoantony',
  muzicmania: 'muzicmania',
  ciszubot: 'ciszubot',
};

const SITE_URLS = {
  ciszu: 'https://ciszunetwork.vercel.app',
  ciszukoantony: 'https://ciszukoantony.vercel.app',
  muzicmania: 'https://muzicmania.vercel.app',
  ciszubot: 'https://ciszubot.vercel.app',
};

const SF_CLI = 'C:\\Program Files (x86)\\Screaming Frog SEO Spider\\ScreamingFrogSEOSpiderCli.exe';

// Pestañas a exportar (nombres EN/ES; SF usa el locale del sistema). Internal:All trae
// URL, title, meta, H1, status, canonical, redirect. Se añade Images:All para alt text.
const TABS = 'Internal:All,Images:All';

function today() {
  return new Date().toISOString().split('T')[0];
}

function crawlSite(site, date) {
  const folder = SITE_FOLDERS[site];
  const url = SITE_URLS[site];
  if (!folder || !url) {
    console.log(`Sitio inválido: ${site}. Opciones: ${Object.keys(SITE_FOLDERS).join(', ')}`);
    return 1;
  }

  const exportsDir = path.join('projects', folder, 'website', 'seo', 'audits', 'screaming-frog', `crawl-${date}`, 'exports');
  fs.mkdirSync(exportsDir, { recursive: true });

  if (!fs.existsSync(SF_CLI)) {
    console.log(`❌ No encontrado: ${SF_CLI}. Instala Screaming Frog SEO Spider.`);
    return 1;
  }

  console.log(`\n=== Crawl ${site} (${url}) → ${exportsDir} ===`);
  console.log('   Ejecutando Screaming Frog headless...');

  const result = spawnSync(SF_CLI, [
    '--crawl', url,
    '--headless',
    '--output-folder', exportsDir,
    '--export-format', 'csv',
    '--export-tabs', TABS,
    '--overwrite',
  ], { stdio: 'inherit', shell: false });

  if (result.status !== 0) {
    console.log(`⚠️ Crawl de ${site} terminó con código ${result.status}`);
  }

  // Renombrar CSVs genéricos a nombres estables (internos_todo.csv → internal_all.csv, etc.)
  const files = fs.readdirSync(exportsDir).filter(f => f.endsWith('.csv'));
  const renameMap = {
    'internos_todo.csv': 'internal_all.csv',
    'internal_all.csv': 'internal_all.csv',
    'imágenes_todo.csv': 'images_all.csv',
    'imagenes_todo.csv': 'images_all.csv',
    'images_all.csv': 'images_all.csv',
  };
  for (const f of files) {
    const target = renameMap[f];
    if (target && target !== f) {
      fs.renameSync(path.join(exportsDir, f), path.join(exportsDir, target));
    }
  }

  console.log(`   CSVs en ${exportsDir}: ${fs.readdirSync(exportsDir).filter(f => f.endsWith('.csv')).join(', ')}`);

  // Procesar con process-sf-csv
  console.log('\n=== Procesando análisis ===');
  const scriptPath = path.join('projects', folder, 'website', 'seo', 'scripts', 'process-sf-csv.ts');
  const processResult = spawnSync('npx', ['tsx', scriptPath, site, date], { stdio: 'inherit', shell: true });
  return processResult.status || 0;
}

const [,, site, dateArg] = process.argv;
const date = dateArg || today();

if (!site) {
  console.log('Uso: node scripts/seo-crawl.js <site> [fecha]  |  node scripts/seo-crawl-all.js [fecha]');
  process.exit(1);
}

process.exit(crawlSite(site, date));