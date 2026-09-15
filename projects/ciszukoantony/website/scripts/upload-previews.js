// ---------------------------------------------------------------------------
// Sube las previews generadas (shared/docs/certificados/previews/) al bucket
// público `ciszu-cdn` de Supabase, en shared/docs/certificados/previews/.
//
// Uso:
//   node scripts/upload-previews.js               # sube todo lo que falte/cambie
//   node scripts/upload-previews.js --force      # re-subie todo (upsert)
//   node scripts/upload-previews.js --verify-only # solo verifica URLs públicas
//
// Requiere SUPABASE_SERVICE_ROLE_KEY en el entorno (o en .env.local del sitio,
// o en ../../muzicmania/website/.env.local). NUNCA se expone al cliente:
// este script corre solo en la máquina/CI del owner.
// ---------------------------------------------------------------------------
const fs = require('fs');
const path = require('path');

const findMonorepoRoot = (startDir) => {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    dir = path.dirname(dir);
  }
  return startDir;
};

const SCRIPT_DIR = __dirname;
const ROOT = findMonorepoRoot(SCRIPT_DIR);
const PREVIEWS_DIR = path.join(ROOT, 'shared/docs/certificados/previews');
const BUCKET = 'ciszu-cdn';
const OBJECT_PREFIX = 'shared/docs/certificados/previews';

// Carga de credenciales: .env.local del sitio (o el de muzicmania como fallback).
function loadEnv() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  const candidates = [
    path.join(SCRIPT_DIR, '../.env.local'),
    path.join(ROOT, 'projects/muzicmania/website/.env.local'),
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  }
}

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const VERIFY_ONLY = args.includes('--verify-only');

// Resueltas de forma perezosa: loadEnv() corre dentro de main(), después de
// que este módulo se evaluó. No capturarlas como const a nivel de módulo.
const SUPABASE_URL = () => process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

const contentTypeFor = (name) => {
  const ext = path.extname(name).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function uploadOne(bareName, buffer, attempt = 1) {
  const encoded = `${OBJECT_PREFIX}/${bareName}`.split('/').map(encodeURIComponent).join('/');
  const url = `${SUPABASE_URL()}/storage/v1/object/${BUCKET}/${encoded}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY(),
      Authorization: `Bearer ${SERVICE_KEY()}`,
      'Content-Type': contentTypeFor(bareName),
      'x-upsert': 'true',
      'Cache-Control': 'public, max-age=86400',
    },
    body: buffer,
  });
  if (res.ok) return { ok: true };
  const body = await res.text().catch(() => '');
  if (res.status >= 500 && attempt < 3) {
    await sleep(1500 * attempt);
    return uploadOne(bareName, buffer, attempt + 1);
  }
  return { ok: false, status: res.status, body: body.slice(0, 200) };
}

async function verifyOne(bareName) {
  const encoded = `${OBJECT_PREFIX}/${bareName}`.split('/').map(encodeURIComponent).join('/');
  const publicUrl = `${SUPABASE_URL()}/storage/v1/object/public/${BUCKET}/${encoded}`;
  try {
    const res = await fetch(publicUrl, { method: 'GET' });
    return { publicUrl, ok: res.ok, status: res.status };
  } catch (e) {
    return { publicUrl, ok: false, status: 0, error: e.message };
  }
}

async function main() {
  loadEnv();
  if (!SUPABASE_URL() || !SERVICE_KEY()) {
    console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  const files = fs.readdirSync(PREVIEWS_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.error(`❌ No hay previews en ${PREVIEWS_DIR}. Ejecuta antes: pnpm sync:certificates`);
    process.exit(1);
  }

  if (VERIFY_ONLY) {
    console.log(`🔎 Verificando ${files.length} preview(s) en el CDN...`);
    let ok = 0;
    const broken = [];
    const CONC = 8;
    for (let i = 0; i < files.length; i += CONC) {
      const batch = files.slice(i, i + CONC);
      const results = await Promise.all(batch.map((f) => verifyOne(f)));
      results.forEach((r, j) => {
        if (r.ok) ok++;
        else broken.push({ file: batch[j], status: r.status });
      });
    }
    console.log(`✅ ${ok}/${files.length} preview(s) responden 200 en el CDN.`);
    if (broken.length) {
      console.log(`❌ Rotos/faltantes (${broken.length}):`);
      for (const b of broken) console.log(`   - ${b.file} → HTTP ${b.status}`);
      process.exit(2);
    }
    return;
  }

  // Si no es --force, solo sube las que aún no existen en el bucket (HEAD 200).
  let toUpload = files;
  if (!FORCE) {
    console.log('🔎 Comprobando qué previews faltan en el bucket...');
    const missing = [];
    const CONC = 8;
    for (let i = 0; i < files.length; i += CONC) {
      const batch = files.slice(i, i + CONC);
      const results = await Promise.all(
        batch.map(async (f) => {
          const r = await verifyOne(f);
          if (!r.ok && process.env.DEBUG_UPLOAD) {
            console.log(`   [debug] ${f} → ${r.status} ${r.error || ''} ${r.publicUrl.slice(0, 90)}`);
          }
          return { f, exists: r.ok };
        }),
      );
      missing.push(...results.filter((r) => !r.exists).map((r) => r.f));
    }
    toUpload = missing;
    console.log(`   ${files.length - missing.length} ya existen · ${missing.length} faltan`);
    if (missing.length === 0) {
      console.log('✅ El bucket ya tiene todas las previews. Nada que subir.');
      return;
    }
  }

  console.log(`⬆️  Subiendo ${toUpload.length} preview(s) a ${BUCKET}/${OBJECT_PREFIX}/ ...`);
  let uploaded = 0;
  const failures = [];
  const CONC = 4;
  for (let i = 0; i < toUpload.length; i += CONC) {
    const batch = toUpload.slice(i, i + CONC);
    const results = await Promise.all(
      batch.map(async (f) => {
        const buffer = fs.readFileSync(path.join(PREVIEWS_DIR, f));
        const r = await uploadOne(f, buffer);
        return { f, r };
      }),
    );
    for (const { f, r } of results) {
      if (r.ok) {
        uploaded++;
        process.stdout.write(`   ✅ ${f}\n`);
      } else {
        failures.push({ f, ...r });
        process.stdout.write(`   ❌ ${f} → HTTP ${r.status} ${r.body || ''}\n`);
      }
    }
  }

  console.log(`\n📊 Subidas: ${uploaded}/${toUpload.length}`);
  if (failures.length) {
    console.error(`❌ Fallaron ${failures.length}. Revisa credenciales o policies del bucket.`);
    process.exit(2);
  }

  // Verificación final de todas las URLs públicas.
  console.log('🔎 Verificación final de URLs públicas...');
  const verify = await Promise.all(files.map((f) => verifyOne(f)));
  const stillBroken = verify.filter((v) => !v.ok);
  if (stillBroken.length) {
    console.error(`❌ ${stillBroken.length} preview(s) siguen sin responder 200:`);
    stillBroken.forEach((v) => console.error(`   - ${v.publicUrl} → ${v.status}`));
    process.exit(2);
  }
  console.log(`✅ ${files.length}/${files.length} previews verificadas con 200 en el CDN.`);
}

main().catch((e) => {
  console.error('❌ Upload failed:', e.message);
  process.exit(1);
});
