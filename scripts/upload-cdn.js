const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'ciszu-assets';
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

if (!SERVICE_KEY) {
  console.error('  [!] SUPABASE_SERVICE_ROLE_KEY no configurada');
  process.exit(1);
}

async function ensureBucket() {
  const url = `${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SERVICE_KEY}` } });
  if (res.status === 200) return console.log(`  [OK] Bucket "${BUCKET}" ya existe`);

  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 52428800 }),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    if (!err.includes('already exists')) throw new Error(`Bucket: ${err}`);
  }
  console.log(`  [+] Bucket "${BUCKET}" creado`);
}

function getMime(ext) {
  const map = {
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
    '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain', '.md': 'text/markdown', '.json': 'application/json',
    '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.mov': 'video/quicktime',
    '.zip': 'application/zip', '.rar': 'application/vnd.rar', '.psd': 'image/vnd.adobe.photoshop',
    '.drp': 'application/octet-stream', '.ai': 'application/postscript',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

async function uploadFile(filePath) {
  const relative = path.relative(ASSETS_DIR, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const mimeType = getMime(ext);

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${relative}`;
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
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${relative}`;
}

async function walkDir(dir) {
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
  console.log('\n  === Subiendo assets al CDN (Supabase Storage) ===\n');
  await ensureBucket();

  const files = await walkDir(ASSETS_DIR);
  console.log(`  [+] ${files.length} archivos\n`);

  let ok = 0, err = 0;
  for (const f of files) {
    try {
      const url = await uploadFile(f);
      console.log(`  [OK] ${path.relative(ASSETS_DIR, f)}`);
      ok++;
    } catch (e) {
      console.error(`  [ERR] ${path.relative(ASSETS_DIR, f)}: ${e.message}`);
      err++;
    }
  }
  console.log(`\n  [OK] ${ok} subidos | [!!] ${err} errores`);
  if (ok > 0) console.log(`  CDN: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);
}

main().catch(console.error);
