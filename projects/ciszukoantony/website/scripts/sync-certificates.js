const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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
const MONOREPO_ROOT = findMonorepoRoot(SCRIPT_DIR);
const CERTIFICATES_DIR = path.join(MONOREPO_ROOT, 'shared/docs/certificados');
const PREVIEWS_DIR = path.join(CERTIFICATES_DIR, 'previews');
const DATA_FILE = path.join(SCRIPT_DIR, '../src/data/certificates.ts');
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
  const thumbnail = fs.existsSync(thumbPath)
    ? `shared/docs/certificados/previews/${baseName}-preview.jpg`
    : undefined;

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

const syncCertificates = async () => {
  console.log('🔍 Scanning certificates directory...');
  const files = await scanDir(CERTIFICATES_DIR);
  console.log(`   Found ${files.length} document(s)`);

  const existingFileNames = new Set();
  const existingIds = new Set();

  if (fs.existsSync(DATA_FILE)) {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const matches = [...content.matchAll(/name:\s*'([^']+)'/g)];
    matches.forEach((m) => existingFileNames.add(m[1]));
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

    const entry = buildEntry(file);
    if (existingIds.has(entry.id)) {
      const suffix = Date.now().toString(36);
      entry.id = `${entry.id}-${suffix}`;
    }

    const baseName = path.basename(file.name, file.ext);
    const thumbPath = path.join(PREVIEWS_DIR, `${baseName}-preview.jpg`);

    if (!fs.existsSync(thumbPath)) {
      console.log(`   Generating thumbnail for: ${file.name}`);
      const ok = await generateThumbnail(file.path, thumbPath);
      if (ok) {
        thumbnailsGenerated++;
        entry.thumbnail = `shared/docs/certificados/previews/${baseName}-preview.jpg`;
      }
    }

    newEntries.push({ file, entry });
  }

  if (newEntries.length === 0) {
    console.log('✅ No new certificates found. certificates.ts is up to date.');
    return;
  }

  console.log(`\n📝 Found ${newEntries.length} new certificate(s)`);
  console.log(`🖼️  Generated ${thumbnailsGenerated} thumbnail(s)`);

  const lines = fs.readFileSync(DATA_FILE, 'utf8').split('\n');
  const certLineIdx = lines.findIndex((l) => /export\s+const\s+CERTIFICATES\s*:\s*Certificate\[\]\s*=\s*\[/.test(l));
  const otherLineIdx = lines.findIndex((l) => /export\s+const\s+OTHER_DOCS\s*:\s*Certificate\[\]\s*=\s*\[/.test(l));

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
            lines.push(`${indent}  ${key}: '${value.replace(/'/g, "\\'")}',`);
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
    return `'${value.replace(/'/g, "\\'")}'`;
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

syncCertificates().catch((error) => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});
