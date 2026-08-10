const path = require('path');
const https = require('https');

// ═══════════════════════════════════════════════════════════════════════════════
//  BORRADO MASIVO DE BUCKET DE SUPABASE STORAGE  —  HERRAMIENTA PELIGROSA
// ═══════════════════════════════════════════════════════════════════════════════
//  Borra masivamente objetos de un bucket via la API HTTP.
//  Leccion 10 ago 2026 (ciszu-assets, 16.891 objetos / 1.44 GB):
//    - El bulk POST /storage/v1/object/delete/{bucket} da "NoSuchBucket" (endpoint roto).
//    - El CLI `supabase storage rm -r` se cuelga con buckets grandes.
//    - Lo UNICO fiable: DELETE individual /storage/v1/object/{bucket}/{key} con
//      service_role + concurrencia (16.890 objetos en ~10 min).
//
//  ⚠️ PROTECCIONES OBLIGATORIAS (no se pueden omitir):
//    - Sin flags: solo imprime ayuda. Jamas borra sin confirmacion.
//    - Requiere --yes Y --confirm <nombre-exacto-del-bucket> (el nombre debe COINCIDIR
//      EXACTAMENTE con el bucket real; un error tipografico = abortar).
//    - El bucket canonico 'ciszu-cdn' (el que usan las 4 webs) esta DENEGADO:
//      exige ademas --force-cdn. No borrarlo salvo que sea 100% intencional.
//    - Tras confirmar, espera 10 segundos con countdown (Ctrl+C a tiempo).
//    - --dry-run por defecto si hay cualquier duda: lista y sale sin borrar.
//
//  Uso:
//    node scripts/delete-storage-bucket.js <bucket> --yes --confirm <bucket> [--prefix ruta] [--concurrency N] [--delete-bucket] [--dry-run]
//  Ejemplos:
//    node scripts/delete-storage-bucket.js ciszu-assets --dry-run
//    node scripts/delete-storage-bucket.js ciszu-assets --yes --confirm ciszu-assets --delete-bucket
//  Requiere SUPABASE_ACCESS_TOKEN en el entorno (Management API).
// ═══════════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'obwzzmbvkrcscqwptlqo';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const CANONICAL_BUCKET = 'ciszu-cdn'; // bucket principal — borrarlo exige --force-cdn

const RED = '\x1b[31m', YELLOW = '\x1b[33m', CYAN = '\x1b[36m', RESET = '\x1b[0m';

function warn(msg) { console.error(`${YELLOW}${msg}${RESET}`); }
function danger(msg) { console.error(`${RED}${msg}${RESET}`); }

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

async function listAll(BUCKET, SERVICE_KEY) {
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

async function deleteOne(BUCKET, name, SERVICE_KEY) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodePath(name)}`;
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${SERVICE_KEY}` } });
  return res.ok || res.status === 404;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const args = process.argv.slice(2);
  const bucket = args.find(a => !a.startsWith('--'));
  const flag = (name) => args.includes(name);
  const val = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };

  if (!bucket || flag('--help') || flag('-h')) {
    console.log(`${CYAN}delete-storage-bucket.js — borrado masivo de un bucket de Supabase Storage${RESET}
${RED}⚠️  Herramienta destructiva. Protegida a proposito.${RESET}
Uso: node scripts/delete-storage-bucket.js <bucket> --yes --confirm <bucket> [--prefix ruta] [--concurrency N] [--delete-bucket] [--dry-run]
  --yes                confirma intencion de borrar
  --confirm <bucket>   debe coincidir EXACTAMENTE con el nombre del bucket real
  --prefix <ruta>      borra solo objetos bajo ese prefijo
  --concurrency N      peticiones paralelas (default 16)
  --delete-bucket      elimina el bucket tras vaciarlo (solo si 0 fallos)
  --dry-run            lista y reporta, NO borra nada
${RED}El bucket canonico '${CANONICAL_BUCKET}' exige ademas --force-cdn.${RESET}`);
    process.exit(0);
  }

  const yes = flag('--yes');
  const dryRun = flag('--dry-run');
  const deleteBucket = flag('--delete-bucket');
  const forceCdn = flag('--force-cdn');
  const confirmName = val('--confirm', '');
  const prefix = val('--prefix', '');
  const concurrency = parseInt(val('--concurrency', '16'), 10) || 16;

  if (!ACCESS_TOKEN) { danger('[!] SUPABASE_ACCESS_TOKEN no configurada (Management API)'); process.exit(1); }

  // ── Barreras de seguridad ────────────────────────────────────────────────
  if (bucket === CANONICAL_BUCKET && !forceCdn) {
    danger(`[DENEGADO] '${CANONICAL_BUCKET}' es el bucket canonico de las 4 webs.`);
    danger('Si de verdad hay que borrarlo: --yes --confirm ciszu-cdn --force-cdn (y ni asi sin dry-run previo).');
    process.exit(1);
  }
  if (!yes) { warn('[!] Falta --yes (intencion de borrar). Solo se permite ver el inventario/dry-run.'); }
  if (!confirmName) { warn('[!] Falta --confirm <bucket>: el nombre exacto del bucket como doble confirmacion.'); }
  if (yes && !confirmName) { danger('[!] --yes sin --confirm NO es valido. Escribe el nombre del bucket.'); process.exit(1); }
  if (!yes || !confirmName) {
    if (dryRun) { /* dry-run puede correr sin --yes, listar es seguro */ }
    else { process.exit(1); }
  }
  if (yes && confirmName !== bucket) {
    danger(`[DENEGADO] --confirm '${confirmName}' no coincide con el bucket '${bucket}'. Abortando.`);
    process.exit(1);
  }

  const SERVICE_KEY = await getServiceRoleKey();

  // ── Verificar que el bucket existe antes de nada ─────────────────────────
  const rb = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${bucket}`, { headers: { Authorization: `Bearer ${SERVICE_KEY}` } });
  if (!rb.ok) {
    danger(`[!] Bucket '${bucket}' no encontrado (HTTP ${rb.status}). Nada que borrar.`);
    process.exit(1);
  }

  console.log(`[+] Listando bucket '${bucket}'...`);
  const objects = await listAll(bucket, SERVICE_KEY);
  const targets = prefix ? objects.filter(o => o.name.startsWith(prefix)) : objects;
  const totalBytes = targets.reduce((a, o) => a + o.size, 0);
  console.log(`[>] ${targets.length} objetos (${(totalBytes / 1048576).toFixed(1)} MB)${prefix ? ` bajo '${prefix}'` : ''} en '${bucket}'`);

  if (dryRun) { console.log('[dry-run] no se borro nada. Revisa el inventario antes de ejecutar de verdad.'); process.exit(0); }

  // ── Banner final antes de borrar ─────────────────────────────────────────
  danger('╔══════════════════════════════════════════════════════════════╗');
  danger(`║  BORRADO IRREVERSIBLE DE ${targets.length} OBJETOS (${(totalBytes / 1048576).toFixed(1)} MB)        ║`);
  danger(`║  Bucket: ${bucket.padEnd(46)}║`);
  danger('║  El bucket del CDN ES UN ESPEJO DEL REPO:                   ║');
  danger('║  si el archivo existe localmente, el proximo                ║');
  danger('║  "pnpm cdn:upload" lo REPONE. Para borrar de verdad:        ║');
  danger('║  borrar del repo Y del bucket (o usar upload --prune).      ║');
  danger('╚══════════════════════════════════════════════════════════════╝');
  if (!flag('--skip-wait')) {
    for (let s = 10; s > 0; s--) { warn(`  Abortando en ${s}s... (Ctrl+C para cancelar)`); await sleep(1000); }
  }

  let ok = 0, err = 0, idx = 0;
  const failed = [];
  async function worker() {
    while (idx < targets.length) {
      const obj = targets[idx++];
      for (let attempt = 0; ; attempt++) {
        try {
          if (await deleteOne(bucket, obj.name, SERVICE_KEY)) { ok++; break; }
        } catch { /* retry */ }
        if (attempt >= 3) { failed.push(obj.name); err++; break; }
        await sleep(800 * (attempt + 1));
      }
      if (ok % 250 === 0) console.log(`  [>>] ${ok} borrados (fallos: ${failed.length})...`);
    }
  }
  console.log(`[>] Borrando con concurrencia ${concurrency}...`);
  const t0 = Date.now();
  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(`\n[done] ${ok} borrados | ${err} errores | ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (failed.length) {
    danger(`[!] ${failed.length} fallos — reintentar con el mismo comando (los ya borrados dan 404 y cuentan como OK):`);
    for (const f of failed.slice(0, 10)) console.error('    ' + f);
  }

  if (deleteBucket && err === 0) {
    console.log(`[>] Eliminando bucket '${bucket}'...`);
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${bucket}`, { method: 'DELETE', headers: { Authorization: `Bearer ${SERVICE_KEY}` } });
    console.log(res.ok ? `[done] bucket '${bucket}' eliminado` : `[!] HTTP ${res.status}: ${res.body.slice(0, 200)}`);
  }
  process.exit(err ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
