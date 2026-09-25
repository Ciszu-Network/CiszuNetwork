const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const https = require('https');

// ---------------------------------------------------------------------------
// Rasterización de PDFs en Node: pdfjs-dist (legacy) renderiza la página 1 a
// PNG usando @napi-rs/canvas (binarios precompilados; `canvas` nativo requiere
// node-gyp). pdfjs legacy hace `require('canvas')` para DOMMatrix/Path2D, así
// que redirigimos esa resolución a @napi-rs/canvas, que exporta lo mismo.
// ---------------------------------------------------------------------------
const Module = require('module');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === 'canvas' || request.startsWith('canvas/')) {
    return originalResolve.call(this, '@napi-rs/canvas', ...args);
  }
  return originalResolve.call(this, request, ...args);
};
const { createCanvas } = require('@napi-rs/canvas');
const pdfjs = require('pdfjs-dist/legacy/build/pdf.mjs');

const findMonorepoRoot = (startDir) => {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return startDir;
};

const SCRIPT_DIR = path.resolve(__dirname);
const FORCE = process.argv.includes('--force');
const CDN_UPLOAD = process.argv.includes('--cdn');
const MONOREPO_ROOT = findMonorepoRoot(SCRIPT_DIR);
const CERTIFICATES_DIR = path.join(MONOREPO_ROOT, 'shared/docs/certificados');
const PREVIEWS_DIR = path.join(CERTIFICATES_DIR, 'previews');
const DATA_FILE = path.join(SCRIPT_DIR, '../src/data/certificates.ts');
const MANIFEST_FILE = path.join(SCRIPT_DIR, '../src/data/certificates.previews.ts');
const SIDECAR_EXT = '.certmeta.json';

if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

const readSidecar = (filePath) => {
  const metaPath = `${filePath}${SIDECAR_EXT}`;
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return null;
  }
};

const generateThumbnail = async (filePath, outputPath) => {
  try {
    await sharp(filePath)
      .rotate()
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`  Error generating thumbnail for ${path.basename(filePath)}:`, error.message);
    return false;
  }
};

// Fuentes estándar y cMaps empaquetados con pdfjs-dist. SIN standardFontDataUrl,
// los PDFs que usan fuentes estándar (Helvetica, Times, etc.) renderizan SIN
// TEXTO — era la causa de previews de SkillsBuild/Cisco sin contenido legible.
const toPosix = (p) => p.replace(/\\/g, '/');
const FONTS_DIR = path.join(SCRIPT_DIR, '../node_modules/pdfjs-dist/standard_fonts');
const CMAPS_DIR = path.join(SCRIPT_DIR, '../node_modules/pdfjs-dist/cmaps');
const RENDER_SCALE = 2; // alta DPI para texto nítido; sharp reduce después
const PREVIEW_MAX_WIDTH = 900;
const PREVIEW_JPEG_QUALITY = 82;

/** Renderiza la primera página de un PDF a JPG (thumbnail real, con texto).
 *  - Resuelve fuentes estándar y cMaps desde node_modules (texto siempre visible).
 *  - Fondo blanco explícito (canvas transparente haría ilegibles PDFs con alpha).
 *  - Detecta páginas "en blanco" (sin tinta) para no publicar previews vacías.
 */
const rasterizePdfPage1 = async (pdfPath, outputPath) => {
  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjs.getDocument({
      data,
      standardFontDataUrl: fs.existsSync(FONTS_DIR) ? `${toPosix(FONTS_DIR)}/` : undefined,
      cMapUrl: fs.existsSync(CMAPS_DIR) ? `${toPosix(CMAPS_DIR)}/` : undefined,
      cMapPacked: true,
      isEvalSupported: false,
      useSystemFonts: false,
    }).promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Chequeo de contenido: proporción de píxeles "con tinta" (no blanco).
    const { data: pixels } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let inked = 0;
    const total = canvas.width * canvas.height;
    for (let i = 0; i < pixels.length; i += 4) {
      // blanco puro/ cercano cuenta como fondo; cualquier otra cosa es contenido
      if (pixels[i] < 245 || pixels[i + 1] < 245 || pixels[i + 2] < 245) inked++;
    }
    const inkRatio = inked / total;
    if (inkRatio < 0.005) {
      console.warn(`  ⚠️  ${path.basename(pdfPath)}: página casi en blanco (${(inkRatio * 100).toFixed(2)}% tinta) — posible PDF escaneado vacío o error de render`);
    }

    const pngBuffer = canvas.toBuffer('image/png');
    await sharp(pngBuffer)
      .resize({
        width: PREVIEW_MAX_WIDTH,
        height: Math.round(PREVIEW_MAX_WIDTH * 1.4),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: PREVIEW_JPEG_QUALITY, mozjpeg: true })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`  Error rasterizando ${path.basename(pdfPath)}:`, error.message);
    return false;
  }
};

/** Supabase Storage rechaza claves con caracteres no-ASCII (InvalidKey).
 *  Los PREVIEWS usan siempre nombre ASCII-seguro (sin acentos); los archivos
 *  fuente conservan su nombre original. */
const asciiSafeName = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Normaliza un nombre para comparar duplicados ignorando acentos y mayúsculas. */
const normalizeName = (fileName) =>
  fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

const inferKind = (fileName) => {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) {
    if (lower.includes('transcript') || lower.includes('expediente')) return 'transcript';
    if (lower.includes('report') || lower.includes('profile')) return 'report';
    return 'certificate';
  }
  if (lower.match(/\.(jpg|jpeg|png|webp)$/i)) return 'image';
  return 'document';
};

const inferCategory = (fileName, sidecar) => {
  if (sidecar?.category) return sidecar.category;
  const lower = fileName.toLowerCase();
  if (lower.includes('cisco') || lower.includes('html') || lower.includes('css') || lower.includes('python')) return 'programming';
  if (lower.includes('english') || lower.includes('efset') || lower.includes('ingles')) return 'english';
  if (lower.includes('ai') || lower.includes('inteligencia')) return 'ai';
  if (lower.includes('cloud') || lower.includes('microsoft')) return 'cloud';
  if (lower.includes('photoshop') || lower.includes('design') || lower.includes('capcut') || lower.includes('edicion')) return 'design';
  if (lower.includes('marketing') || lower.includes('youtube') || lower.includes('autotub')) return 'marketing';
  if (lower.includes('finance') || lower.includes('finanzas')) return 'finance';
  if (lower.includes('bachillerato') || lower.includes('dato')) return 'bachillerato';
  if (lower.includes('personality') || lower.includes('16personalities')) return 'personal';
  return 'other';
};

const inferTitle = (fileName, sidecar) => {
  if (sidecar?.title) return sidecar.title;
  const base = path.basename(fileName, path.extname(fileName));
  return base
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const inferProvider = (fileName, sidecar) => {
  if (sidecar?.provider) return sidecar.provider;
  const lower = fileName.toLowerCase();
  if (lower.includes('cisco')) return 'Cisco Networking Academy · Skills for All';
  if (lower.includes('microsoft')) return 'Microsoft Learn';
  if (lower.includes('ibm') || lower.includes('skillsbuild')) return 'IBM SkillsBuild';
  if (lower.includes('efset')) return 'EF SET (Education First)';
  if (lower.includes('16personalities')) return '16Personalities (NERIS Analytics Limited)';
  return 'Online course platform';
};

const scanDir = async (dir, relative = '') => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(relative, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'previews') continue;
      const children = await scanDir(fullPath, relPath);
      results.push(...children);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        results.push({
          name: entry.name,
          path: fullPath,
          relative: relPath,
          ext,
        });
      }
    }
  }

  return results;
};

const buildEntry = (file) => {
  const sidecar = readSidecar(file.path);
  const id = path.basename(file.name, file.ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const kind = sidecar?.kind || inferKind(file.name);
  const category = sidecar?.category || inferCategory(file.name, sidecar);
  const title = inferTitle(file.name, sidecar);
  const provider = inferProvider(file.name, sidecar);

  const baseName = path.basename(file.name, file.ext);
  const thumbPath = path.join(PREVIEWS_DIR, `${baseName}-preview.jpg`);
  // Los thumbnails los resuelve la página vía PREVIEWS_BY_FILE (manifiesto).
  const thumbnail = undefined;

  return {
    id,
    title,
    provider,
    providerUrl: sidecar?.providerUrl,
    category,
    date: sidecar?.date,
    dateText: sidecar?.dateText,
    level: sidecar?.level,
    summary: sidecar?.summary,
    credentialId: sidecar?.credentialId,
    credentialLabel: sidecar?.credentialLabel,
    note: sidecar?.note,
    collection: sidecar?.collection,
    verify: sidecar?.verify,
    files: [
      {
        name: file.relative,
        label: sidecar?.label || title,
        kind,
      },
    ],
    thumbnail,
    previewType: file.ext === '.pdf' ? 'pdf' : 'image',
  };
};

const findArrayEnd = (lines, startIdx) => {
  let depth = 0;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '[') depth++;
      if (ch === ']') depth--;
    }
    if (depth === 0 && line.trim() === '];') {
      return i;
    }
  }
  return -1;
};

/** Resuelve el mejor preview existente para un archivo dado.
 *  Orden de candidatos: <base>-preview.jpg (formato actual) > <base>-preview.png
 *  (legacy) > <base>-preview-preview.jpg > <nombre completo>-preview.*
 *  Devuelve SOLO el nombre de archivo (los previews viven siempre en
 *  shared/docs/certificados/previews/). */
const resolvePreview = (rawBaseName, rawFullName) => {
  const baseName = asciiSafeName(rawBaseName);
  const fullName = asciiSafeName(rawFullName);
  const candidates = [
    `${baseName}-preview.jpg`,
    `${baseName}-preview.png`,
    `${baseName}-preview-preview.jpg`,
    `${fullName}-preview.jpg`,
    `${fullName}-preview.png`,
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(PREVIEWS_DIR, c))) {
      return c;
    }
  }
  return undefined;
};

/** Regenera el manifiesto de previews (certificates.previews.ts): mapea CADA
 *  archivo del directorio a su preview real existente (si lo hay). La página
 *  lo usa para resolver thumbnails automáticamente sin tocar certificates.ts. */
const writePreviewManifest = (files) => {
  const entries = files
    .map((file) => {
      const baseName = path.basename(file.name, path.extname(file.name));
      const preview = resolvePreview(baseName, file.name);
      return { name: file.relative, preview };
    })
    .filter((e) => e.preview);

  const escapeValue = (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  };

  const lines = [
    '// AUTO-GENERADO por scripts/sync-certificates.js — NO editar a mano.',
    '// Mapea cada archivo de shared/docs/certificados a su preview real (si existe).',
    '// Re-ejecutar con: pnpm sync:certificates',
    'export const PREVIEWS_BY_FILE: Record<string, string> = {',
    ...entries.map((e) => `  '${escapeValue(e.name)}': '${escapeValue(e.preview)}',`),
    '};',
    '',
  ];
  fs.writeFileSync(MANIFEST_FILE, lines.join('\n'), 'utf8');
  console.log(`\n🖼️  Manifiesto de previews actualizado (${entries.length} archivos con preview): ${MANIFEST_FILE}`);
};

const syncCertificates = async () => {
  console.log('🔍 Scanning certificates directory...');
  const files = await scanDir(CERTIFICATES_DIR);
  console.log(`   Found ${files.length} document(s)`);

  // 0) Con --force: limpiar previews viejas para regenerarlas todas desde cero.
  //    Sin --force el script es idempotente: reutiliza previews existentes y
  //    solo genera las que falten.
  if (FORCE && fs.existsSync(PREVIEWS_DIR)) {
    const oldPreviews = fs.readdirSync(PREVIEWS_DIR);
    for (const old of oldPreviews) {
      fs.unlinkSync(path.join(PREVIEWS_DIR, old));
    }
    console.log(`   🗑️  Cleaned ${oldPreviews.length} old preview(s)`);
  }

  // 1) Genera previews REALES para TODOS los PDFs (página 1 en JPG con texto)
  //    y para imágenes (resize). Sin esto, la limpieza del paso 0 dejaría sin
  //    preview a los archivos que ya existen en certificates.ts.
  let rasterized = 0;
  for (const file of files) {
    const baseName = asciiSafeName(path.basename(file.name, file.ext));
    const thumbPath = path.join(PREVIEWS_DIR, `${baseName}-preview.jpg`);
    if (file.ext !== '.pdf') {
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(file.ext) && !fs.existsSync(thumbPath)) {
        console.log(`   Generating image preview for: ${file.name}`);
        if (await generateThumbnail(file.path, thumbPath)) rasterized++;
      }
      continue;
    }
    if (!FORCE && fs.existsSync(thumbPath)) continue; // idempotente
    console.log(`   Generating preview for: ${file.name}`);
    if (await rasterizePdfPage1(file.path, thumbPath)) rasterized++;
  }
  if (rasterized > 0) console.log(`   ✅ ${rasterized} preview(s) generated`);

  // 1b) Limpieza de previews obsoletas: nombres que ya no corresponden a
  //     ningún archivo fuente (p.ej. con acentos que Supabase rechaza).
  const validPreviewNames = new Set(
    files.map((f) => `${asciiSafeName(path.basename(f.name, f.ext))}-preview.jpg`),
  );
  let removedStale = 0;
  for (const p of fs.readdirSync(PREVIEWS_DIR)) {
    if (!validPreviewNames.has(p)) {
      fs.unlinkSync(path.join(PREVIEWS_DIR, p));
      console.log(`   🗑️  Removed stale preview: ${p}`);
      removedStale++;
    }
  }
  if (removedStale > 0) console.log(`   🧹 ${removedStale} stale preview(s) removed`);

  // 2) Manifiesto de previews SIEMPRE se regenera (es la fuente de thumbnails).
  writePreviewManifest(files);

  const existingFileNames = new Set();
  const existingNormalized = new Set();
  const existingIds = new Set();

  if (fs.existsSync(DATA_FILE)) {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const matches = [...content.matchAll(/name:\s*'([^']+)'/g)];
    matches.forEach((m) => {
      existingFileNames.add(m[1]);
      existingNormalized.add(normalizeName(m[1]));
    });
    const ids = [...content.matchAll(/id:\s*'([^']+)'/g)];
    ids.forEach((m) => existingIds.add(m[1]));
  }

  const newEntries = [];
  let thumbnailsGenerated = 0;

  for (const file of files) {
    if (existingFileNames.has(file.relative)) {
      console.log(`   Skipping existing: ${file.name}`);
      continue;
    }
    if (existingNormalized.has(normalizeName(file.name))) {
      // Duplicado solo por acentos/espacios (p.ej. 'finalización' vs 'finalizacion').
      console.log(`   Skipping duplicate (accent): ${file.name}`);
      continue;
    }

    const entry = buildEntry(file);
    if (existingIds.has(entry.id)) {
      const suffix = Date.now().toString(36);
      entry.id = `${entry.id}-${suffix}`;
    }

    const baseName = asciiSafeName(path.basename(file.name, file.ext));
    const preview = resolvePreview(baseName, file.name);
    if (!preview) {
      const thumbPath = path.join(PREVIEWS_DIR, `${baseName}-preview.jpg`);
      console.log(`   Generating thumbnail for: ${file.name}`);
      const ok = await generateThumbnail(file.path, thumbPath);
      if (ok) {
        thumbnailsGenerated++;
        entry.thumbnail = `${baseName}-preview.jpg`;
      }
    } else {
      entry.thumbnail = preview;
    }

    newEntries.push({ file, entry });
  }

  lastSyncNewEntries = newEntries;

  if (newEntries.length === 0) {
    console.log('✅ No new certificates found. certificates.ts is up to date.');
    return;
  }

  console.log(`\n📝 Found ${newEntries.length} new certificate(s)`);
  console.log(`🖼️  Generated ${thumbnailsGenerated} thumbnail(s)`);

  const lines = fs.readFileSync(DATA_FILE, 'utf8').split('\n');
  const certLineIdx = lines.findIndex((l) => /export\s+const\s+CERTIFICATES\s*:\s*Certificate\[\]\s*=\s*\[/.test(l));
  const otherLineIdx = lines.findIndex((l) => /export\s+const\s+OTHER_DOCS\s*:\s*Certificate\[\]\s*=\s*\[/.test(l));

  const escapeValue = (value) => {
    if (typeof value !== 'string') return value;
    return value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  };

  const insertEntries = (arrayStartIdx, entries) => {
    const arrayEndIdx = findArrayEnd(lines, arrayStartIdx);
    if (arrayEndIdx === -1) return false;

    const indent = '  ';
    const entriesText = entries
      .map(({ entry }) => {
        const lines = [indent + '{'];
        const add = (key, value) => {
          if (value === undefined || value === null) return;
          if (typeof value === 'string') {
            lines.push(`${indent}  ${key}: '${escapeValue(value)}',`);
          } else if (typeof value === 'object') {
            if (Array.isArray(value)) {
              lines.push(`${indent}  ${key}: [${value.map((v) => formatValue(v, indent)).join(', ')}],`);
            } else {
              lines.push(`${indent}  ${key}: ${formatValue(value, indent)},`);
            }
          }
        };

        add('id', entry.id);
        add('title', entry.title);
        add('provider', entry.provider);
        add('providerUrl', entry.providerUrl);
        add('category', entry.category);
        add('date', entry.date);
        add('dateText', entry.dateText);
        add('level', entry.level);
        add('summary', entry.summary);
        add('credentialId', entry.credentialId);
        add('credentialLabel', entry.credentialLabel);
        add('note', entry.note);
        add('collection', entry.collection);
        add('verify', entry.verify);
        add('files', entry.files);
        add('thumbnail', entry.thumbnail);
        add('previewType', entry.previewType);

        lines.push(indent + '}');
        return lines.join('\n');
      })
      .join(',\n\n');

    const before = lines.slice(0, arrayEndIdx);
    const after = lines.slice(arrayEndIdx);
    lines.splice(0, lines.length, ...before, '', entriesText, ...after);
    return true;
  };

  const certEntries = newEntries.filter(({ entry }) => entry.category !== 'other');
  const otherEntries = newEntries.filter(({ entry }) => entry.category === 'other');

  if (certLineIdx !== -1 && certEntries.length > 0) {
    insertEntries(certLineIdx, certEntries);
  }

  if (otherLineIdx !== -1 && otherEntries.length > 0) {
    insertEntries(otherLineIdx, otherEntries);
  }

  fs.writeFileSync(DATA_FILE, lines.join('\n'), 'utf8');
  console.log(`\n✅ Updated ${DATA_FILE}`);
};

const formatValue = (value, indent) => {
  if (typeof value === 'string') {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => formatValue(v, indent)).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const props = Object.entries(value)
      .map(([k, v]) => `${k}: ${formatValue(v, indent)}`)
      .join(', ');
    return `{ ${props} }`;
  }
  return 'null';
};

const WATCH = process.argv.includes('--watch');

let lastSyncNewEntries = [];

const runSync = async () => {
  lastSyncNewEntries = [];
  await syncCertificates();
  if (CDN_UPLOAD) {
    await uploadNewAssetsToCDN();
  }
};

if (WATCH) {
  (async () => {
    console.log('👁️  Watch mode enabled. Watching for changes in', CERTIFICATES_DIR);
    await runSync();

    let timeout;
    const watcher = fs.watch(CERTIFICATES_DIR, { persistent: false }, async (eventType, filename) => {
      if (!filename) return;
      console.log(`\n🔄 Change detected: ${filename} (${eventType})`);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await runSync();
      }, 500);
    });

    const cleanup = () => {
      console.log('\n🛑 Stopping watcher...');
      watcher.close();
      process.exit(0);
    };
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  })();
} else {
  runSync().catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// CDN upload helpers
// ---------------------------------------------------------------------------
const loadSupabaseEnv = () => {
  const envPaths = [
    path.join(MONOREPO_ROOT, 'services/supabase/.env'),
    path.join(MONOREPO_ROOT, 'services/supabase/.env.local'),
  ];
  const env = {};
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eq = trimmed.indexOf('=');
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in env)) env[key] = val;
    }
  }
  return env;
};

const SUPABASE_ENV = loadSupabaseEnv();
const SUPABASE_URL = SUPABASE_ENV.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const PROJECT_REF = SUPABASE_ENV.SUPABASE_PROJECT_REF || 'obwzzmbvkrcscqwptlqo';
const CDN_BUCKET = 'ciszu-cdn';
const CDN_BASE = `${SUPABASE_URL}/storage/v1/object/public/${CDN_BUCKET}`;

const cdnFetch = (url, opts = {}) => {
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : '');
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
};

const getMime = (ext) => {
  const map = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
};

const encodePath = (p) => p.split('/').map((s) => encodeURIComponent(s)).join('/');

const uploadFile = async (filePath, storagePath, serviceKey) => {
  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const mimeType = getMime(ext);
  const url = `${SUPABASE_URL}/storage/v1/object/${CDN_BUCKET}/${encodePath(storagePath)}`;
  await cdnFetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: content,
  });
};

const listCDNFiles = async (serviceKey) => {
  const existing = {};
  let offset = 0;
  while (true) {
    const res = await cdnFetch(`${SUPABASE_URL}/storage/v1/object/list/${CDN_BUCKET}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 1000, offset, prefix: 'shared/docs/certificados/', sortBy: { column: 'name', order: 'asc' } }),
    });
    const data = Array.isArray(res) ? res : [];
    if (data.length === 0) break;
    for (const obj of data) {
      const name = obj.name ? obj.name.replace(/\/$/, '') : '';
      if (!name || !obj.metadata || !obj.id) continue;
      existing[name] = {
        size: obj.metadata.size || obj.size,
        mime: obj.metadata.mimetype || undefined,
      };
    }
    offset += data.length;
  }
  return existing;
};

const uploadNewAssetsToCDN = async () => {
  try {
    const serviceKey = SUPABASE_ENV.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY no configurada; se salta la subida al CDN.');
      return;
    }

    console.log('\n☁️  CDN upload: consultando objetos existentes...');
    const existing = await listCDNFiles(serviceKey);
    const uploaded = new Set();

    const uploadIfMissing = async (relative, localPath) => {
      if (!fs.existsSync(localPath)) return;
      const localSize = fs.statSync(localPath).size;
      const remote = existing[relative];
      if (remote && remote.size === localSize && getMime(path.extname(localPath)) === remote.mime) {
        return;
      }
      await uploadFile(localPath, relative, serviceKey);
      console.log(`  [CDN] ${relative}`);
      uploaded.add(relative);
    };

    for (const file of lastSyncNewEntries) {
      const relative = file.relative;
      const baseName = path.basename(file.name, path.extname(file.name));
      const safeBase = baseName.replace(/[^\x00-\x7F]/g, '').replace(/[^a-z0-9_-]/gi, '-');
      const previewName = `${safeBase}-preview.jpg`;

      await uploadIfMissing(relative, file.path);
      await uploadIfMissing(`shared/docs/certificados/previews/${previewName}`, path.join(PREVIEWS_DIR, previewName));
    }

    if (uploaded.size === 0) {
      console.log('  [CDN] No hay assets nuevos para subir.');
    } else {
      console.log(`  [CDN] ${uploaded.size} asset(s) subido(s) al bucket "${CDN_BUCKET}".`);
    }
  } catch (error) {
    console.error('❌ CDN upload failed:', error.message);
  }
};
