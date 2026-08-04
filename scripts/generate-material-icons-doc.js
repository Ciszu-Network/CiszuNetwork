// generate-material-icons-doc.js — genera MATERIAL_ICONS.md con el catálogo COMPLETO de
// Material Icon Theme (todos los folder icons y file icons con sus matches).
//
// Uso:
//   node scripts/generate-material-icons-doc.js
//
// Fuentes: descarga los .ts oficiales del theme (PKief/vscode-material-icon-theme, main)
// y los parsea. Si ya están descargados en el dir cache, los reutiliza.
//   node scripts/generate-material-icons-doc.js --force   # re-descarga los fuentes
//
// Salida: sobrescribe projects/ciszu/docs/ia_docs/MATERIAL_ICONS.md

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.opencode-tmp', 'material-icons-theme');
const OUT_FILE = path.join(ROOT, 'projects', 'ciszu', 'docs', 'ia_docs', 'MATERIAL_ICONS.md');

const THEME_REPO = 'PKief/vscode-material-icon-theme';
const THEME_BRANCH = 'main';
const SOURCES = {
  'folderIcons.ts': 'src/core/icons/folderIcons.ts',
  'fileIcons.ts': 'src/core/icons/fileIcons.ts',
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'GET' },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`HTTP ${res.statusCode} en ${url}`));
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function ensureSources(force) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  for (const [file, remotePath] of Object.entries(SOURCES)) {
    const local = path.join(CACHE_DIR, file);
    if (!force && fs.existsSync(local)) {
      console.log(`  [OK] ${file} (cache)`);
      continue;
    }
    const url = `https://raw.githubusercontent.com/${THEME_REPO}/${THEME_BRANCH}/${remotePath}`;
    console.log(`  [>>] Descargando ${file}...`);
    const data = await fetch(url);
    fs.writeFileSync(local, data);
    console.log(`  [OK] ${file} (${data.length} bytes)`);
  }
}

function extractBlocks(src, startPattern) {
  const blocks = [];
  const start = src.indexOf(startPattern);
  if (start === -1) return blocks;
  let i = src.indexOf('{', start);
  let depth = 0;
  let current = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    current += ch;
    if (depth === 0 && current.trim()) {
      blocks.push(current.trim());
      current = '';
      const next = src.indexOf('{', i);
      if (next === -1) break;
      i = next;
      continue;
    }
    i++;
  }
  return blocks;
}

function parseStringList(text) {
  const out = [];
  const re = /'([^']+)'/g;
  let m;
  while ((m = re.exec(text))) out.push(m[1]);
  return out;
}

function parseFolderIcons(src) {
  const icons = [];
  const start = src.indexOf('icons: [');
  if (start === -1) return icons;
  let i = src.indexOf('{', start);
  let depth = 0;
  let current = '';
  let inEntry = false;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') { depth++; inEntry = true; }
    if (ch === '}') depth--;
    if (inEntry) current += ch;
    if (inEntry && depth === 0) {
      const name = /name:\s*'([^']+)'/.exec(current);
      const fns = /folderNames:\s*\[([^\]]*)\]/.exec(current);
      const enabledFor = /enabledFor:\s*\[[^\]]*\]/.exec(current);
      const clone = /clone:\s*\{[^}]*base:\s*'([^']+)'/.exec(current);
      if (name) {
        icons.push({
          name: name[1],
          folderNames: fns ? parseStringList(fns[1]) : [],
          enabledFor: !!enabledFor,
          cloneBase: clone ? clone[1] : null,
        });
      }
      current = '';
      inEntry = false;
    }
    i++;
  }
  return icons;
}

function parseFileIcons(src) {
  const icons = [];
  const start = src.indexOf('icons: parseByPattern([');
  if (start === -1) return icons;
  let i = src.indexOf('{', start);
  let depth = 0;
  let current = '';
  let inEntry = false;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') { depth++; inEntry = true; }
    if (ch === '}') depth--;
    if (inEntry) current += ch;
    if (inEntry && depth === 0) {
      const name = /name:\s*'([^']+)'/.exec(current);
      const exts = /fileExtensions:\s*\[([^\]]*)\]/.exec(current);
      const fns = /fileNames:\s*\[([^\]]*)\]/.exec(current);
      const enabledFor = /enabledFor:\s*\[[^\]]*\]/.exec(current);
      const light = /light:\s*true/.test(current);
      const clone = /clone:\s*\{[^}]*base:\s*'([^']+)'/.exec(current);
      if (name) {
        icons.push({
          name: name[1],
          extensions: exts ? parseStringList(exts[1]) : [],
          fileNames: fns ? parseStringList(fns[1]) : [],
          enabledFor: !!enabledFor,
          light,
          cloneBase: clone ? clone[1] : null,
        });
      }
      current = '';
      inEntry = false;
    }
    i++;
  }
  return icons;
}

function mdTable(headers, rows) {
  const lines = [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`];
  for (const row of rows) lines.push(`| ${row.join(' | ')} |`);
  return lines.join('\n');
}

function countRows(rows) {
  const c = {};
  for (const r of rows) c[r[0]] = (c[r[0]] || 0) + 1;
  return c;
}

async function main() {
  const force = process.argv.includes('--force');
  console.log('\n  === Generando MATERIAL_ICONS.md (catálogo completo) ===');
  await ensureSources(force);

  const folderSrc = fs.readFileSync(path.join(CACHE_DIR, 'folderIcons.ts'), 'utf8');
  const fileSrc = fs.readFileSync(path.join(CACHE_DIR, 'fileIcons.ts'), 'utf8');

  const folderIcons = parseFolderIcons(folderSrc);
  const fileIcons = parseFileIcons(fileSrc);
  console.log(`  [>>] Folder icons parseados: ${folderIcons.length}`);
  console.log(`  [>>] File icons parseados: ${fileIcons.length}`);

  const theme = {
    defaultIcon: 'file',
    iconPacks: ['Angular', 'Bashly', 'Nest', 'Ngrx', 'Qwik', 'React', 'Redux', 'Roblox', 'Vue', 'Vuex'],
  };

  const folderRows = [];
  for (const icon of folderIcons) {
    const names = icon.folderNames.join(', ') || '—';
    const iconName = icon.cloneBase ? `${icon.cloneBase} (clone → ${icon.name})` : icon.name;
    folderRows.push([
      iconName,
      names,
      icon.enabledFor ? 'Solo packs' : 'Siempre',
      icon.enabledFor ? 'ver abajo' : '—',
    ]);
  }

  const fileRows = [];
  for (const icon of fileIcons) {
    const exts = icon.extensions.join(', ') || '—';
    const fns = icon.fileNames.join(', ') || '—';
    const base = icon.cloneBase ? `${icon.cloneBase} (clone → ${icon.name})` : icon.name;
    fileRows.push([base, exts, fns, icon.light ? 'light' : '—', icon.enabledFor ? 'Solo packs' : '—']);
  }

  const folderNames = folderIcons.filter((i) => !i.enabledFor).length;
  const fileNames = fileIcons.filter((i) => !i.enabledFor).length;

  const md = `# Material Icon Theme — Catálogo completo (v5.36.1)

> Documento GENERADO por \`scripts/generate-material-icons-doc.js\` — no editar a mano.
> Fuente oficial: [PKief/vscode-material-icon-theme](https://github.com/PKief/vscode-material-icon-theme) (branch \`main\`).
> Regenerar con: \`node scripts/generate-material-icons-doc.js\` (usa cache en \`.opencode-tmp/material-icons-theme/\`; \`--force\` re-descarga).

## 1. Cómo funciona el tema

- **Folder icons**: se asignan por **nombre de carpeta** (\`folderNames\`). Si el nombre coincide con la lista de un icono, VS Code pinta ese icono automáticamente. Las listas se comprueban en orden; si ninguna coincide, se usa el icono genérico \`folder\`.
- **File icons**: se asignan por **extensión** (\`fileExtensions\`) o **nombre de archivo** (\`fileNames\`, incluye dotfiles). Los patrones con punto (p.ej. \`ts.map\`, \`js.snap\`) matchean el sufijo completo del nombre, no solo la extensión.
- **Icon packs** (\`enabledFor\`): algunos iconos solo se activan si el pack correspondiente está habilitado en la config (\`material-icon-theme.activeIconPack\`). En el repo se usa el pack por defecto (ninguno activo), así que los iconos "Solo packs" NO se aplican.
- **Clones**: un icono puede clonar la forma de otro con otro color (\`clone: { base, color }\`) — en las tablas se indica \`base (clone → name)\`.

## 2. Sobrescritura de iconos (settings.json)

En \`E:\\Ciszu Network\\.vscode\\settings.json\` se puede forzar el icono de una carpeta concreta:

\`\`\`jsonc
"material-icon-theme.folders.associations": {
  // key = nombre exacto de la carpeta, value = nombre del folder icon (sin prefijo "folder-")
  "logos": "images",
  "gif": "video",   // las carpetas "gif" sin config se verían genéricas
  "samples": "examples"
}
\`\`\`

El \`value\` debe ser un nombre de la columna "Icono" de la tabla de folder icons de abajo (p.ej. \`images\`, \`video\`, \`audio\`, \`theme\`, \`examples\`, \`animation\`, \`svg\`).

## 3. Estado actual del repo (4 ago 2026)

| Carpeta | Icono aplicado | Cómo |
|---|---|---|
| \`images\`, \`icons\` | \`folder-images\` | match por defecto (\`image(s)\`, \`img(s)\`, \`icon(s)\`, ...) |
| \`logos\`, \`banners\`, \`thumbnails\`, \`flyers\`, \`isotype\`, \`logotype\`, \`imagotype\`, \`not-outline\`, \`outline\`, \`background\`, \`contour\`, \`horizontal\`, \`vertical\`, \`tagline\`, \`no-tagline\`, \`holidays\`, \`persons\` | \`folder-images\` | asociación en settings.json |
| \`gif\`, \`gifs\`, \`long-videos\` | \`folder-video\` | asociación en settings.json |
| \`video(s)\`, \`media\` | \`folder-video\` | match por defecto |
| \`music\`, \`audio\` | \`folder-audio\` | match por defecto |
| \`albums\` | \`folder-audio\` | asociación en settings.json |
| \`gradient\`, \`monochrome\`, \`mc_skin\` | \`folder-theme\` | asociación en settings.json |
| \`color(s)\`, \`design(s)\`, \`palette(s)\`, \`theme(s)\` | \`folder-theme\` | match por defecto |
| \`samples\` | \`folder-examples\` | match por defecto (\`sample(s)\`) |
| \`sketches\` | \`folder-mock\` | match por defecto (\`sketch(es)\`) |
| \`arrowskins\`, \`particleskins\` | \`folder-animation\` | asociación en settings.json |
| \`others\`, \`misc\`, \`extra(s)\` | \`folder-other\` | match por defecto |
| \`events\` | \`folder-event\` | match por defecto |
| \`resources\` | \`folder-resource\` | match por defecto |
| \`styles\` | \`folder-css\` | match por defecto (\`style(s)\`) |

## 4. TODOS los folder icons (${folderIcons.length})

${mdTable(['Icono', 'Nombres de carpeta que matchean', 'Activación', 'Pack'], folderRows)}

> \`—\` en "Nombres" significa que el icono NO tiene matches por defecto (solo se activa vía asociación manual o subcarpeta especial).
> "Solo packs" = requiere pack activo (no aplica en este repo salvo pack por defecto). ${folderIcons.length - folderNames} iconos de ${folderIcons.length} requieren pack.

## 5. TODOS los file icons (${fileIcons.length})

${mdTable(['Icono', 'Extensiones', 'Nombres de archivo', 'Variante', 'Activación'], fileRows)}

> \`—\` en Extensiones/Nombres = sin match por defecto (solo por patrón/scripts o config manual).
> Los iconos con nombres de archivo son los que matchean dotfiles y archivos de config (p.ej. \`.gitignore\`, \`package.json\`, \`next.config.ts\`).
`;
  fs.writeFileSync(OUT_FILE, md);
  console.log(`  [OK] ${OUT_FILE}`);
  console.log(`  [>>] Folder icons: ${folderIcons.length} (${folderIcons.length - folderNames} solo packs)`);
  console.log(`  [>>] File icons: ${fileIcons.length} (${fileIcons.length - fileNames} solo packs)`);
  console.log('  === Listo ===');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
