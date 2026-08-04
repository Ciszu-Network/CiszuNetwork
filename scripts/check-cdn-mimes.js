const fs = require('fs');
const path = require('path');
const https = require('https');

// Verifica que todos los objetos del bucket ciszu-cdn tengan el mimetype correcto
// según su extensión (detección de uploads con text/plain mal cacheados).
// Uso: node scripts/check-cdn-mimes.js

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'obwzzmbvkrcscqwptlqo';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const BUCKET = 'ciszu-cdn';

const MIME_MAP = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.txt': 'text/plain',
  '.md': 'text/markdown', '.json': 'application/json',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.mov': 'video/quicktime',
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
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: data }));
    });
    req.on('error', err => {
      if (attempts > 1 && /getaddrinfo|ENOTFOUND|EAI_AGAIN|ECONNRESET|ETIMEDOUT/i.test(err.message + err.code)) {
        setTimeout(() => fetch(url, opts, attempts - 1).then(resolve, reject), 1500);
      } else reject(err);
    });
    req.setTimeout(60000, () => req.destroy(new Error('ETIMEDOUT')));
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

function getMime(ext) {
  return MIME_MAP[ext.toLowerCase()] || 'application/octet-stream';
}

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
          objects.push(obj);
        }
      }
      offset += data.length;
      if (objects.length % 500 === 0) console.log(`  [>>] ${objects.length} objetos...`);
    }
  }
  await listLevel('');
  return objects;
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('[!] SUPABASE_ACCESS_TOKEN no configurada (Management API)');
    process.exit(1);
  }
  console.log('\n  === Verificando mimetypes del bucket ciszu-cdn ===');
  const keysRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const keys = JSON.parse(keysRes.body);
  const SERVICE_KEY = keys.find(k => k.name === 'service_role').api_key;

  const objects = await listAll(SERVICE_KEY);
  console.log(`  [>>] ${objects.length} objetos`);

  const bad = [];
  for (const obj of objects) {
    const ext = path.extname(obj.name);
    if (!MIME_MAP[ext]) continue;
    const expected = getMime(ext);
    const actual = obj.metadata.mimetype;
    if (actual !== expected) bad.push({ name: obj.name, actual, expected, size: obj.metadata.size });
  }

  if (bad.length === 0) {
    console.log('  [OK] Todos los mimetypes coinciden con la extensión');
    process.exit(0);
  }

  console.log(`  [!] ${bad.length} objetos con mimetype incorrecto (POSIBLES ROTOS EN WEB):`);
  for (const b of bad) console.log(`      ${b.name}\n          actual: ${b.actual} | esperado: ${b.expected} | size: ${b.size}`);
  console.log('\n  Fix: pnpm cdn:upload --force  (re-sube con mimetype correcto)');
  process.exit(bad.length);
}

main().catch(err => { console.error(err); process.exit(1); });
