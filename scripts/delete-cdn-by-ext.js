const path = require('path');
const https = require('https');

// Borra del bucket ciszu-cdn TODOS los objetos cuya extension este en la lista pasada por CLI.
// Herramienta de mantenimiento de cuota (el CDN espeja el repo, pero hay extensiones
// de diseno/cache/buscaros que no deben ocupar el storage del plan Free).
// Uso: node scripts/delete-cdn-by-ext.js .ai .psd .pfl .zip .mp4
// Requiere SUPABASE_ACCESS_TOKEN en el entorno (Management API).

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'obwzzmbvkrcscqwptlqo';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const BUCKET = 'ciszu-cdn';

function fetch(url, opts = {}, attempts = 4) {
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

function encodePath(p) {
  return p.split('/').map(s => encodeURIComponent(s)).join('/');
}

async function getServiceRoleKey() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`api-keys HTTP ${res.status}: ${res.body}`);
  return JSON.parse(res.body).find(k => k.name === 'service_role').api_key;
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
      if (!res.ok) throw new Error(`List HTTP ${res.status}: ${res.body}`);
      const data = JSON.parse(res.body);
      if (!Array.isArray(data) || data.length === 0) break;
      for (const obj of data) {
        const name = obj.name ? obj.name.replace(/\/$/, '') : '';
        if (!name) continue;
        if (!obj.metadata || !obj.id) await listLevel(`${prefix}${name}/`);
        else objects.push({ name: `${prefix}${name}`, size: obj.metadata.size });
      }
      offset += data.length;
    }
  }
  await listLevel('');
  return objects;
}

async function deleteOne(name, SERVICE_KEY) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(name)}`;
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${SERVICE_KEY}` } });
  return res.ok || res.status === 404;
}

async function main() {
  const exts = process.argv.slice(2).map(e => e.toLowerCase().startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`);
  if (exts.length === 0) { console.error('Uso: node scripts/delete-cdn-by-ext.js .ai .psd .pfl'); process.exit(1); }
  if (!ACCESS_TOKEN) { console.error('[!] SUPABASE_ACCESS_TOKEN no configurada'); process.exit(1); }

  const SERVICE_KEY = await getServiceRoleKey();
  console.log(`[+] Listando bucket para eliminar: ${exts.join(', ')}`);
  const objects = await listAll(SERVICE_KEY);
  const targets = objects.filter(o => exts.includes(path.extname(o.name.toLowerCase())));
  const totalBytes = targets.reduce((a, o) => a + o.size, 0);
  console.log(`[>] Eliminando ${targets.length} objetos (${(totalBytes / 1048576).toFixed(1)} MB)...`);

  let ok = 0, err = 0, idx = 0;
  async function worker() {
    while (idx < targets.length) {
      const obj = targets[idx++];
      try {
        await deleteOne(obj.name, SERVICE_KEY);
        ok++;
        if (ok % 100 === 0) console.log(`  [>>] ${ok} borrados...`);
      } catch (e) {
        console.error(`  [ERR] ${obj.name}: ${e.message}`);
        err++;
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));
  console.log(`\n[done] ${ok} borrados | ${err} errores | liberados ${(totalBytes / 1048576).toFixed(1)} MB`);
  process.exit(err ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });