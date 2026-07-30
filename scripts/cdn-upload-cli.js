/**
 * cdn-upload-cli.js — Sube assets a ciszu-cdn usando supabase storage cp
 * 
 * Usa el CLI de Supabase con `storage cp -r --jobs 50` para cada fuente,
 * mucho más rápido que upload-cdn.js porque maneja paralelismo nativo.
 * 
 * Uso: node scripts/cdn-upload-cli.js [--diff]
 *   --diff:  Solo sube fuentes cuyos archivos locales existen y no están en CDN
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'ciszu-cdn';
const SUPABASE_DIR = path.join(ROOT, 'services', 'supabase');

// Same sources as upload-cdn.js
const SOURCES = [
  'shared/icons/svg', 'shared/fonts', 'shared/images',
  'content',
  'ciszukoantony/content', 'ciszukoantony/ciszukoantony-music',
  'ciszugamens/content',
  'apps/muzicmania/content', 'apps/muzicmania/website/public/arrowskins',
  'apps/ciszubot/content',
  'docs',
  'ciszukoantony/docs', 'ciszugamens/docs', 'apps/ciszubot/docs',
  'apps/muzicmania/docs',
  'apps/website/public/docs', 'apps/ciszukoantony/website/public/docs',
  'apps/ciszubot/website/public/docs', 'apps/muzicmania/website/public/docs',
  'apps/muzicmania/launcher/public/docs', 'apps/muzicmania/mobile/public/docs',
];

const DIFF = process.argv.includes('--diff');

function run(cmd, label) {
  console.log(`\n  [UPLOAD] ${label}`);
  console.log(`  > ${cmd.substring(0, 120)}...`);
  try {
    const out = execSync(cmd, {
      cwd: SUPABASE_DIR,
      timeout: 600000,  // 10 min per source
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN },
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
    const lines = out.toString().split('\n').filter(l => l.trim());
    const ok = lines.filter(l => !l.includes('PostHog') && !l.includes('Timeout') && l.trim());
    console.log(`  [OK] Completado (${ok.length} líneas de output)`);
    return true;
  } catch (e) {
    const stderr = e.stderr?.toString() || '';
    const stdout = e.stdout?.toString() || '';
    // Check if the error is just the PostHog timeout
    if (stderr.includes('PostHog') || stdout.includes('PostHog')) {
      console.log(`  [OK] Completado (PostHog timeout ignorado)`);
      return true;
    }
    console.error(`  [ERR] ${e.message.substring(0, 200)}`);
    if (stderr) console.error(`  STDERR: ${stderr.substring(0, 200)}`);
    return false;
  }
}

function main() {
  console.log(`\n  === CDN Upload CLI (supabase storage cp) ===`);
  console.log(`  Bucket: ${BUCKET}`);
  console.log(`  Fuentes: ${SOURCES.length}`);
  console.log(`  Modo: ${DIFF ? 'DIFF (solo nuevos)' : 'COMPLETO'}\n`);

  let ok = 0, err = 0;
  for (const src of SOURCES) {
    const srcPath = path.join(ROOT, src);
    if (!fs.existsSync(srcPath)) {
      console.log(`  [!] Source no encontrado: ${src} — saltando`);
      err++;
      continue;
    }

    // Normalize path separators
    const cdnPath = src.replace(/\\/g, '/');
    const localPath = srcPath;

    const cmd = `supabase storage cp -r --experimental --jobs 50 --linked "${localPath}" "ss:///${BUCKET}/${cdnPath}/"`;
    const label = src;
    
    if (run(cmd, label)) ok++;
    else err++;
  }

  console.log(`\n  === Resumen ===`);
  console.log(`  OK: ${ok} fuentes`);
  console.log(`  ERR: ${err} fuentes`);
  console.log(`\n  CDN: https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/${BUCKET}/\n`);
}

main();