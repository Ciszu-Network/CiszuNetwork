const fs = require('fs');
const path = require('path');

function findRoot(dir) {
  const rootMarker = path.join(dir, 'assets');
  if (fs.existsSync(rootMarker)) return dir;
  const parent = path.dirname(dir);
  if (parent === dir) return null;
  return findRoot(parent);
}

function copyDir(src, dst, label) {
  if (!fs.existsSync(src)) {
    console.log(`  [--] ${label}: no existe`);
    return;
  }
  fs.mkdirSync(dst, { recursive: true });
  try {
    fs.cpSync(src, dst, { recursive: true, force: true });
    console.log(`  [OK] ${label} -> public/`);
  } catch (e) {
    console.error(`  [ERR] ${label}: ${e.message}`);
  }
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
const appName = parts[1]; // 'muzicmania', 'website', 'ciszukoantony', 'ciszubot'

// --- 1. Root-level critical assets ---
const ASSETS = path.join(ROOT, 'assets');
const CRITICAL_ONLY = ['logos/tagline_black.svg', 'logos/tagline_white.svg', 'logos/imagen'];
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
    console.log(`  [OK] ${relPath} copiado a public/`);
  } catch (e) {
    console.error(`  [ERR] ${relPath}: ${e.message}`);
  }
}

// --- 2. Master media (ciszukoantony/content) -> public/ciszukoantony/content/ ---
// resolveAssetPath('ciszukoantony/content/...') mirror (fuente maestra de logos)
copyDir(
  path.join(ROOT, 'ciszukoantony', 'content'),
  path.join(CWD, 'public', 'ciszukoantony', 'content'),
  'ciszukoantony/content'
);

// --- 3. App content -> public/apps/{name}/content/ (for resolveAssetPath) ---
if (appName) {
  const appContentSrc = path.join(ROOT, 'apps', appName, 'content');
  const appContentDst = path.join(CWD, 'public', 'apps', appName, 'content');
  copyDir(appContentSrc, appContentDst, `apps/${appName}/content`);

  // --- 4. Legacy compatibility: copy content subdirs to public/ root ---
  // Code references /music/..., /images/..., /particleskins/... directly
  const legacyDirs = fs.existsSync(appContentSrc)
    ? fs.readdirSync(appContentSrc, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
    : [];

  for (const subdir of legacyDirs) {
    const src = path.join(appContentSrc, subdir);
    const dst = path.join(CWD, 'public', subdir);
    copyDir(src, dst, `${subdir}/`);
  }
}

// --- 5. Shared icons for offline fallback ---
copyDir(
  path.join(ROOT, 'shared', 'icons'),
  path.join(CWD, 'public', 'shared', 'icons'),
  'shared/icons'
);

console.log('\nAssets sincronizados para fallback offline.');