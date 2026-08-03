const fs = require('fs');
const path = require('path');

function findRoot(dir) {
  const rootMarker = path.join(dir, 'pnpm-workspace.yaml');
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
const appName = parts[1]; // 'ciszu', 'ciszubot', 'ciszukoantony', 'muzicmania'

// Guard: ejecutado desde la raiz del repo crea una carpeta public/ fantasma
if (!appName) {
  console.log('  [!] Ejecuta este script desde una app (pnpm --filter <app> build).');
  console.log('      En la raiz del repo no se copia nada para no ensuciar la raiz.');
  process.exit(0);
}

// --- 1. Root-level critical assets (logos from master source) ---
const LOGOS_SRC = path.join(ROOT, 'projects', 'ciszukoantony', 'content', 'logos');
const CRITICAL_ONLY = ['tagline_black.svg', 'tagline_white.svg', 'imagen'];
for (const relPath of CRITICAL_ONLY) {
  const src = path.join(LOGOS_SRC, relPath);
  const dst = path.join(CWD, 'public', 'logos', relPath);
  if (!fs.existsSync(src)) {
    console.log(`  [!] ${relPath} no encontrado en logos`);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  try {
    fs.cpSync(src, dst, { recursive: true, force: true });
    console.log(`  [OK] logos/${relPath} copiado a public/`);
  } catch (e) {
    console.error(`  [ERR] logos/${relPath}: ${e.message}`);
  }
}

// --- 2. Master media (projects/ciszukoantony/content) -> public/projects/ciszukoantony/content/ ---
// resolveAssetPath('projects/ciszukoantony/content/...') mirror (fuente maestra de logos)
copyDir(
  path.join(ROOT, 'projects', 'ciszukoantony', 'content'),
  path.join(CWD, 'public', 'projects', 'ciszukoantony', 'content'),
  'projects/ciszukoantony/content'
);

// --- 3. App content -> public/projects/{name}/content/ (for resolveAssetPath) ---
if (appName) {
  const appContentSrc = path.join(ROOT, 'projects', appName, 'content');
  const appContentDst = path.join(CWD, 'public', 'projects', appName, 'content');
  copyDir(appContentSrc, appContentDst, `projects/${appName}/content`);

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