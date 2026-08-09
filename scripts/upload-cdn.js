const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'obwzzmbvkrcscqwptlqo';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const BUCKET = 'ciszu-cdn';
const MAX_FILE_SIZE = 52428800;

// Extensiones que NUNCA se suben al CDN: fuentes de diseno (.ai/.psd), caches de
// edicion (.pfl), archivos comprimidos (.zip/.rar), videos (.mp4/.mov) y audio
// maestro (.wav) — las webs solo usan png/svg/webp/avif/mp3/ogg/opus. El storage
// del plan Free es 1 GB y estas extensiones lo agotaban (jul 2026: 103% quota).
// Mantener tambien el bucket sincronizado con scripts/delete-cdn-by-ext.js.
const EXCLUDED_EXT = new Set(['.ai', '.psd', '.pfl', '.zip', '.rar', '.drp', '.wfp', '.wav', '.raw', '.exe', '.mp4', '.mov']);

const SOURCES = [
  { dir: 'shared/icons/svg', prefix: 'shared/icons/svg' },
  { dir: 'projects/ciszu/content', prefix: 'projects/ciszu/content' },
  { dir: 'projects/ciszu/docs', prefix: 'projects/ciszu/docs' },
  { dir: 'projects/ciszukoantony/content', prefix: 'projects/ciszukoantony/content' },
  { dir: 'projects/ciszubot/content', prefix: 'projects/ciszubot/content' },
  { dir: 'projects/muzicmania/content', prefix: 'projects/muzicmania/content' },
];

const ROOT = path.resolve(__dirname, '..');

// Las keys del .env (sb_secret_*/sb_publishable_*) NO sirven para la Storage API
// ("Invalid Compact JWS"). El CLI las obtiene via Management API (/v1/projects/{ref}/api-keys),
// que devuelve las keys legacy reales en formato JWT (eyJ...). Hacemos lo mismo.
async function getServiceRoleKey() {
  if (!ACCESS_TOKEN) {
    console.error('  [!] SUPABASE_ACCESS_TOKEN no configurada (Management API)');
    process.exit(1);
  }
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  if (!res.ok) {
    console.error(`  [!] Management API /api-keys: HTTP ${res.status}`);
    process.exit(1);
  }
  const keys = await res.json();
  const srv = keys.find(k => k.name === 'service_role');
  if (!srv) {
    console.error('  [!] No se encontro service_role key via Management API');
    process.exit(1);
  }
  return srv.api_key;
}

function getMime(ext) {
  const map = {
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
    '.avif': 'image/avif', '.ico': 'image/x-icon',
    '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain', '.md': 'text/markdown', '.json': 'application/json',
    '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
    '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.opus': 'audio/opus',
    '.wav': 'audio/wav', '.flac': 'audio/flac', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
    '.zip': 'application/zip', '.rar': 'application/vnd.rar', '.psd': 'image/vnd.adobe.photoshop',
    '.ai': 'application/postscript',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

function fetch(url, opts, attempts = 4) {
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
    req.on('error', err => {
      if (attempts > 1 && /getaddrinfo|ENOTFOUND|EAI_AGAIN|ECONNRESET|ETIMEDOUT|502|504/i.test(err.message + err.code)) {
        setTimeout(() => fetch(url, opts, attempts - 1).then(resolve, reject), 1500);
      } else {
        reject(err);
      }
    });
    req.setTimeout(60000, () => req.destroy(new Error('ETIMEDOUT')));
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function ensureBucket(SERVICE_KEY) {
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

async function listExistingFiles(SERVICE_KEY) {
  const existing = {};

  async function listLevel(prefix) {
    let offset = 0;
    while (true) {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 1000, offset, prefix, sortBy: { column: 'name', order: 'asc' } }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`List ${prefix} HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      for (const obj of data) {
        const name = obj.name ? obj.name.replace(/\/$/, '') : '';
        if (!name) continue;
        const full = `${prefix}${name}`;
        if (!obj.metadata || !obj.id) {
          await listLevel(`${full}/`);
        } else {
          existing[full] = {
            size: obj.metadata.size || obj.size,
            mime: obj.metadata.mimetype || undefined,
          };
        }
      }
      offset += data.length;
    }
  }

  await listLevel('');
  console.log(`  [>>] ${Object.keys(existing).length} objetos ya existen en ciszu-cdn`);
  return existing;
}

async function uploadFile(filePath, storagePath, SERVICE_KEY) {
  const content = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const mimeType = getMime(ext);

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(storagePath)}`;
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

async function deleteObject(storagePath, SERVICE_KEY) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(storagePath)}`;
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${SERVICE_KEY}` } });
  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
}

function encodePath(p) {
  return p.split('/').map(s => encodeURIComponent(s)).join('/');
}

function isLockFile(name) {
  return /^~\$/.test(name);
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

async function collectLocalPaths() {
  const local = new Set();
  for (const source of SOURCES) {
    const sourceDir = path.join(ROOT, source.dir);
    if (!fs.existsSync(sourceDir)) continue;
    for (const f of await walkDir(sourceDir)) {
      local.add(path.relative(ROOT, f).replace(/\\/g, '/'));
    }
  }
  return local;
}

async function main() {
  const prune = process.argv.includes('--prune');
  const force = process.argv.includes('--force');

  console.log('\n  === Subiendo assets al CDN (ciszu-cdn) ===');
  const SERVICE_KEY = await getServiceRoleKey();

  await ensureBucket(SERVICE_KEY);

  console.log('  [>>] Consultando objetos existentes en el bucket...');
  const existing = await listExistingFiles(SERVICE_KEY);
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
      if (isLockFile(path.basename(f))) { skipped++; continue; }
      const relative = path.relative(ROOT, f).replace(/\\/g, '/');
      const localSize = fs.statSync(f).size;

      const ext = path.extname(f).toLowerCase();
      if (EXCLUDED_EXT.has(ext)) {
        console.log(`  [--] ${relative} (extension ${ext} excluida del CDN)`);
        skipped++;
        continue;
      }

      if (localSize > MAX_FILE_SIZE) {
        console.log(`  [--] ${relative} (${(localSize / 1048576).toFixed(1)} MB > limite ${(MAX_FILE_SIZE / 1048576).toFixed(0)} MB)`);
        skipped++;
        continue;
      }

      if (hasExisting && existing[relative] !== undefined) {
        const remote = existing[relative];
        if (!force && remote.size === localSize && getMime(path.extname(f)) === remote.mime) {
          skipped++;
          continue;
        }
        if (!force && remote.size === localSize && remote.mime && remote.mime !== getMime(path.extname(f))) {
          console.log(`  [!!] ${relative} — mimetype remoto '${remote.mime}' != esperado '${getMime(path.extname(f))}'. Re-subiendo.`);
        }
      }

      try {
        await uploadFile(f, relative, SERVICE_KEY);
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

  console.log(`\n  === Upload: ${totalOk} subidos | ${totalSkipped} sin cambios | ${totalErr} errores ===`);
  if (force) console.log('  (--force: se han re-subido TODOS los archivos, ignorando tamaño/mimetype)');

  if (prune) {
    console.log('\n  === Prune: borrando objetos del bucket que no existen localmente ===');
    const local = await collectLocalPaths();
    const remote = Object.keys(existing);
    const orphans = remote.filter(name => !local.has(name));
    console.log(`  [>>] ${remote.length} remotos | ${local.size} locales | ${orphans.length} huerfanos`);
    let delOk = 0, delErr = 0;
    for (const name of orphans) {
      try {
        await deleteObject(name, SERVICE_KEY);
        console.log(`  [DEL] ${name}`);
        delOk++;
      } catch (e) {
        console.error(`  [ERR] ${name}: ${e.message}`);
        delErr++;
      }
    }
    console.log(`\n  === Prune: ${delOk} borrados | ${delErr} errores ===`);
  }
}

main().catch(console.error);
