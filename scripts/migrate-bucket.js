/**
 * migrate-bucket.js — Copia objetos de ciszu-assets a ciszu-cdn y elimina el viejo
 *
 * Uso: node scripts/migrate-bucket.js
 */
const SUPABASE_URL = 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'services', 'supabase', '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const getVar = (k) => {
  const m = env.match(new RegExp('^' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=(.+)', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};
const SVC_KEY = getVar('SUPABASE_SERVICE_ROLE_KEY');
const ANON_KEY = getVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

async function main() {
  console.log('\n  === Migrar ciszu-assets → ciszu-cdn ===\n');

  // 1. Test permissions after migration
  console.log('  Verificando permisos post-migración...');
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/handle_review_like`, {
    method: 'POST', headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' }, body: '{}'
  });
  console.log(`  handle_review_like (anon): ${r1.status} ${r1.statusText} — ${r1.status === 404 ? 'BLOQUEADO ✓' : r1.status === 401 ? 'BLOQUEADO (key issue)' : 'ACCESIBLE ✗'}`);

  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_username_available`, {
    method: 'POST', headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_username: 'test_' + Date.now() })
  });
  console.log(`  check_username_available (anon): ${r2.status} ${r2.statusText} — ${r2.ok ? 'PERMITIDO ✓' : 'BLOQUEADO ✗'}`);

  // 2. List all objects in ciszu-assets
  console.log('\n  Listando objetos en ciszu-assets...');
  const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/ciszu-assets`, {
    method: 'POST', headers: { apikey: SVC_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 20000, offset: 0, prefix: '' })
  });
  const objects = await listRes.json();
  if (!Array.isArray(objects) || objects.length === 0) {
    console.log('  [!] No hay objetos en ciszu-assets o error:', objects.message || 'empty');
    if (Array.isArray(objects) && objects.length === 0) {
      console.log('  El bucket ya está vacío. Eliminando...');
      await fetch(`${SUPABASE_URL}/storage/v1/bucket/ciszu-assets`, {
        method: 'DELETE', headers: { apikey: SVC_KEY }
      }).then(r => console.log(`  Delete bucket: ${r.status}`));
    }
    return;
  }
  const names = objects.map(o => o.name).filter(Boolean);
  console.log(`  ${names.length} objetos encontrados`);

  // 3. Copy all objects to ciszu-cdn
  console.log('\n  Copiando a ciszu-cdn...');
  const CONCURRENCY = 24;
  let ok = 0, err = 0, idx = 0;

  async function processBatch() {
    const batch = [];
    while (idx < names.length && batch.length < CONCURRENCY) {
      const name = names[idx++];
      batch.push(
        fetch(`${SUPABASE_URL}/storage/v1/object/copy`, {
          method: 'POST', headers: { apikey: SVC_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucketId: 'ciszu-assets', sourceKey: name,
            destinationBucket: 'ciszu-cdn', destinationKey: name
          })
        }).then(r => r.ok ? ok++ : err++)
      );
    }
    if (batch.length === 0) return;
    await Promise.all(batch);
    if (idx < names.length) {
      console.log(`  ... ${idx}/${names.length} (${((idx/names.length)*100).toFixed(1)}%)`);
      await processBatch();
    }
  }

  await processBatch();
  console.log(`  Copiados: ${ok} | Errores: ${err}`);

  if (err > 0) {
    console.log('  [!] Hubo errores. No se eliminará el bucket viejo.');
    return;
  }

  // 4. Delete old objects and bucket
  console.log('\n  Eliminando bucket ciszu-assets...');
  const batchSize = 500;
  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    await fetch(`${SUPABASE_URL}/storage/v1/object/ciszu-assets`, {
      method: 'DELETE', headers: { apikey: SVC_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: batch })
    });
  }
  console.log('  Objetos eliminados');

  const delBucket = await fetch(`${SUPABASE_URL}/storage/v1/bucket/ciszu-assets`, {
    method: 'DELETE', headers: { apikey: SVC_KEY }
  });
  console.log(`  Bucket eliminado: ${delBucket.status}`);

  // 5. Update NEXT_PUBLIC_CDN_URL in .env.local
  console.log('\n  Actualizando NEXT_PUBLIC_CDN_URL...');
  let envContent = fs.readFileSync(envPath, 'utf8');
  const newCdnUrl = `${SUPABASE_URL}/storage/v1/object/public/ciszu-cdn`;
  if (envContent.includes('NEXT_PUBLIC_CDN_URL')) {
    envContent = envContent.replace(/^NEXT_PUBLIC_CDN_URL=.*/m, `NEXT_PUBLIC_CDN_URL=${newCdnUrl}`);
  } else {
    envContent += `\nNEXT_PUBLIC_CDN_URL=${newCdnUrl}\n`;
  }
  // Also update NEXT_PUBLIC_CDN_URL in this session
  process.env.NEXT_PUBLIC_CDN_URL = newCdnUrl;
  fs.writeFileSync(envPath, envContent);
  console.log(`  NEXT_PUBLIC_CDN_URL → ${newCdnUrl}`);

  console.log('\n  === Migración completada ===\n');
}

main().catch(e => { console.error('\n  [FATAL]', e.message, '\n'); process.exit(1); });