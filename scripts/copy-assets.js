const fs = require('fs');
const path = require('path');

function findRoot(dir) {
  const rootMarker = path.join(dir, 'assets');
  if (fs.existsSync(rootMarker)) return dir;
  const parent = path.dirname(dir);
  if (parent === dir) return null;
  return findRoot(parent);
}

const CWD = process.cwd();
const ROOT = findRoot(CWD);
if (!ROOT) {
  console.log('  [!] No se encontro la raiz del proyecto');
  process.exit(0);
}

// Detect app name from CWD path relative to ROOT
const rel = path.relative(ROOT, CWD).replace(/\\/g, '/');
const parts = rel.split('/');
// parts = ['apps', '<name>', 'website'] or ['apps', '<name>'] or ['apps', '<name>', ...]
const appName = parts[1]; // 'muzicmania', 'website', 'ciszukoantony', 'ciszubot'

const ASSETS = path.join(ROOT, 'assets');
const CRITICAL_ONLY = ['logos/tagline_black.svg', 'logos/tagline_white.svg', 'logos/imagen'];

// Copy root-level critical assets
for (const relPath of CRITICAL_ONLY) {
  const src = path.join(ASSETS, relPath);
  const dst = path.join(CWD, 'public', relPath);
  if (!fs.existsSync(src)) {
    console.log(`  [!] ${relPath} no encontrado en assets`);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  try {
    fs.cpSync(src, dst, { recursive: true, force: true });
    console.log(`  [OK] ${relPath} copiado a public/ (offline)`);
  } catch (e) {
    console.error(`  [ERR] ${relPath}: ${e.message}`);
  }
}

// Copy app-specific content directory (if exists) to public/apps/{name}/content/
if (appName) {
  const appContentSrc = path.join(ROOT, 'apps', appName, 'content');
  const appContentDst = path.join(CWD, 'public', 'apps', appName, 'content');
  if (fs.existsSync(appContentSrc)) {
    fs.mkdirSync(path.dirname(appContentDst), { recursive: true });
    try {
      fs.cpSync(appContentSrc, appContentDst, { recursive: true, force: true });
      console.log(`  [OK] apps/${appName}/content copiado a public/ (offline)`);
    } catch (e) {
      console.error(`  [ERR] apps/${appName}/content: ${e.message}`);
    }
  } else {
    console.log(`  [--] apps/${appName}/content no existe`);
  }
}

// Copy shared icons for offline fallback
const ICONS_SRC = path.join(ROOT, 'shared', 'icons');
const ICONS_DST = path.join(CWD, 'public', 'shared', 'icons');
if (fs.existsSync(ICONS_SRC)) {
  fs.mkdirSync(path.dirname(ICONS_DST), { recursive: true });
  try {
    fs.cpSync(ICONS_SRC, ICONS_DST, { recursive: true, force: true });
    console.log('  [OK] shared/icons copiado a public/ (offline)');
  } catch (e) {
    console.error(`  [ERR] shared/icons: ${e.message}`);
  }
}

console.log('\nAssets sincronizados para fallback offline.');