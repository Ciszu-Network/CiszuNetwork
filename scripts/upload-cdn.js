const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'ciszu-cdn';

if (!SERVICE_KEY) {
  console.error('  [!] SUPABASE_SERVICE_ROLE_KEY no configurada');
  process.exit(1);
}

const SOURCES = [
  { dir: 'shared/icons/svg', prefix: 'shared/icons/svg' },
  { dir: 'content', prefix: 'content' },
  { dir: 'docs', prefix: 'docs' },
  { dir: 'ciszukoantony/content', prefix: 'ciszukoantony/content' },
  { dir: 'apps/ciszubot/content', prefix: 'apps/ciszubot/content' },
  { dir: 'apps/ciszukoantony/content', prefix: 'apps/ciszukoantony/content' },
  { dir: 'apps/muzicmania/content', prefix: 'apps/muzicmania/content' },
  { dir: 'apps/website/content', prefix: 'apps/website/content' },
];

const ROOT = path.resolve(__dirname, '..');

function getMime(ext) {
  const map = {
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
    '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain', '.md': 'text/markdown', '.json': 'application/json',
    '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.mov': 'video/quicktime',
    '.zip': 'application/zip', '.rar': 'application/vnd.rar',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

function fetch(url, opts) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname, port: u.port, path: u.pathname + u.search, method: opts.method || 'GET',
      headers: opts.headers || {},
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: () => Promise.resolve(data), json: () => JSON.parse(data) }));
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function ensureBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (res.ok) return console.log(`  [OK] Bucket "${BUCKET}" ya existe`);

  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 52428800 }),
  });
  const text = await createRes.text();
  if (!createRes.ok && !text.includes('already exists')) throw new Error(`Bucket: ${text}`);
  console.log(`  [+] Bucket "${BUCKET}" creado`);
}

async function listExistingFiles() {
  const existing = {};
  let offset = 0;
  while (true) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`  [!] Error listando objetos existentes: HTTP ${res.status} ${text}`);
      return {};
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const obj of data) {
      existing[obj.name] = obj.metadata ? obj.metadata.size : obj.size;
    }
    offset += data.length;
  }
  console.log(`  [>>] ${Object.keys(existing).length} objetos ya existen en ciszu-cdn`);
  return existing;
}

async function uploadFile(filePath, storagePath) {
  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const mimeType = getMime(ext);

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: content,
  });

  if (!res.ok && res.status !== 409) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
}

async function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...await walkDir(fp));
    else if (e.isFile()) files.push(fp);
  }
  return files;
}

async function main() {
  console.log('\n  === Subiendo assets al CDN (ciszu-cdn) — Diff mode ===\n');
  await ensureBucket();

  console.log('  [>>] Consultando objetos existentes en el bucket...');
  const existing = await listExistingFiles();
  const hasExisting = Object.keys(existing).length > 0;

  let totalOk = 0, totalErr = 0, totalSkipped = 0;

  for (const source of SOURCES) {
    const sourceDir = path.join(ROOT, source.dir);
    if (!fs.existsSync(sourceDir)) {
      console.log(`  [--] ${source.dir} — no existe, saltando`);
      continue;
    }

    const files = await walkDir(sourceDir);
    if (files.length === 0) { console.log(`  [--] ${source.dir} — vacío`); continue; }

    console.log(`\n  [>>] ${source.dir} (${files.length} archivos)`);
    let ok = 0, err = 0, skipped = 0;

    for (const f of files) {
      const relative = path.relative(ROOT, f).replace(/\\/g, '/');
      const localSize = fs.statSync(f).size;

      if (hasExisting && existing[relative] !== undefined && existing[relative] === localSize) {
        skipped++;
        continue;
      }

      try {
        await uploadFile(f, relative);
        console.log(`  [OK] ${relative}`);
        ok++;
      } catch (e) {
        console.error(`  [ERR] ${relative}: ${e.message}`);
        err++;
      }
    }

    console.log(`  [>>] ${source.dir}: ${ok} subidos | ${skipped} sin cambios | ${err} errores`);
    totalOk += ok; totalErr += err; totalSkipped += skipped;
  }

  console.log(`\n  === Total: ${totalOk} subidos | ${totalSkipped} sin cambios | ${totalErr} errores ===`);
  if (totalSkipped > 0 && totalOk === 0) console.log('  (Todo estaba sincronizado — nada que subir)');
}

main().catch(console.error);