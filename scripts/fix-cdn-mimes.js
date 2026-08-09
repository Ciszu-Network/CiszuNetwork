const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const SUPABASE_URL = 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const PROJECT_REF = 'obwzzmbvkrcscqwptlqo';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const BUCKET = 'ciszu-cdn';
const ROOT = path.resolve(__dirname, '..');

const MIME_MAP = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.txt': 'text/plain', '.md': 'text/markdown', '.json': 'application/json',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.opus': 'audio/opus',
  '.wav': 'audio/wav', '.flac': 'audio/flac', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
  '.zip': 'application/zip', '.rar': 'application/vnd.rar',
  '.psd': 'image/vnd.adobe.photoshop', '.ai': 'application/postscript',
};

function fetch(url, opts = {}, attempts = 3) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname, port: u.port, path: u.pathname + u.search,
      method: opts.method || 'GET', headers: opts.headers || {},
    };
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', err => {
      if (attempts > 1 && /getaddrinfo|ENOTFOUND|EAI_AGAIN|ECONNRESET|ETIMEDOUT/i.test(err.message + err.code)) {
        setTimeout(() => fetch(url, opts, attempts - 1).then(resolve, reject), 1500);
      } else reject(err);
    });
    req.setTimeout(120000, () => req.destroy(new Error('ETIMEDOUT')));
    if (opts.body) req.write(opts.body);
    req.end();
  });
}
function getMime(ext) { return MIME_MAP[ext.toLowerCase()] || 'application/octet-stream'; }

async function listAll(SERVICE_KEY) {
  const objects = [];
  async function listLevel(prefix) {
    let offset = 0;
    while (true) {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 1000, offset, prefix, sortBy: { column: 'name', order: 'asc' } }),
      });
      if (!res.ok) throw new Error(`List ${prefix} HTTP ${res.status}: ${res.body}`);
      const data = JSON.parse(res.body);
      if (!Array.isArray(data) || data.length === 0) break;
      for (const obj of data) {
        const name = obj.name ? obj.name.replace(/\/$/, '') : '';
        if (!name) continue;
        const full = `${prefix}${name}`;
        if (!obj.metadata || !obj.id) {
          await listLevel(`${full}/`);
        } else {
          objects.push({ ...obj, name: full });
        }
      }
      offset += data.length;
      if (objects.length % 2000 === 0) console.log(`  [>>] ${objects.length} objetos...`);
    }
  }
  await listLevel('');
  return objects;
}

async function uploadOne(SERVICE_KEY, key, filePath, mime) {
  const body = fs.readFileSync(filePath);
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': mime },
    body,
  });
  return res;
}

async function main() {
  if (!ACCESS_TOKEN) { console.error('[!] SUPABASE_ACCESS_TOKEN no configurada'); process.exit(1); }
  const keysRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const SERVICE_KEY = JSON.parse(keysRes.body).find(k => k.name === 'service_role').api_key;

  console.log('  === listando bucket ===');
  const objects = await listAll(SERVICE_KEY);
  console.log(`  [>>] ${objects.length} objetos`);

  const bad = objects.filter(obj => {
    const ext = path.extname(obj.name);
    return MIME_MAP[ext] && obj.metadata.mimetype !== getMime(ext);
  });
  console.log(`  [!] ${bad.length} con mimetype incorrecto`);

  let ok = 0, skip = 0, errs = 0;
  for (const obj of bad) {
    const local = path.join(ROOT, obj.name.replace(/\//g, path.sep));
    if (!fs.existsSync(local)) { console.log(`  [--] no local, skip: ${obj.name}`); skip++; continue; }
    const mime = getMime(path.extname(obj.name));
    const res = await uploadOne(SERVICE_KEY, obj.name, local, mime);
    if (res.ok) { ok++; console.log(`  [OK] ${obj.name} -> ${mime}`); }
    else { errs++; console.log(`  [ERR] ${obj.name}: HTTP ${res.status} ${res.body.toString().slice(0, 120)}`); }
  }
  console.log(`\n  === Fijados: ${ok} | saltados: ${skip} | errores: ${errs} ===`);
}

main().catch(e => { console.error(e); process.exit(1); });