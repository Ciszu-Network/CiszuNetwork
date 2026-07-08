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

const ASSETS = path.join(ROOT, 'assets');
const CRITICAL_ONLY = ['logos/tagline_black.svg', 'logos/tagline_white.svg', 'logos/imagen'];
const ICONS_SRC = path.join(ROOT, 'packages', 'cdn', 'icons');

for (const rel of CRITICAL_ONLY) {
  const src = path.join(ASSETS, rel);
  const dst = path.join(CWD, 'public', rel);
  if (!fs.existsSync(src)) {
    console.log(`  [!] ${rel} no encontrado en assets`);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  try {
    fs.cpSync(src, dst, { recursive: true, force: true });
    console.log(`  [OK] ${rel} copiado a public/ (offline)`);
  } catch (e) {
    console.error(`  [ERR] ${rel}: ${e.message}`);
  }
}

console.log('\nAssets criticos sincronizados. El resto se sirve desde CDN.');
