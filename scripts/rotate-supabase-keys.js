/**
 * rotate-supabase-keys.js — Rota las claves anon y service_role de Supabase
 * 
 * 1. Lee SUPABASE_ACCESS_TOKEN del env
 * 2. Revoca anon key y service_role key vía Management API
 * 3. Espera y obtiene las nuevas keys
 * 4. Actualiza todos los .env y .env.local del workspace
 * 
 * Uso: node scripts/rotate-supabase-keys.js
 */
require('./lib/env').loadEnv();
const fs = require('fs');
const path = require('path');
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN required');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const ENV_FILES = [
  'services/supabase/.env.local',
  'services/supabase/.env',
  'apps/website/.env.local',
  'apps/ciszukoantony/website/.env.local',
  'apps/muzicmania/website/.env.local',
  'apps/ciszubot/website/.env.local',
  'apps/ciszubot/discord-bot/.env',
];

const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

async function api(path, opts = {}) {
  const res = await fetch(API + path, { headers, ...opts });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function listKeys() {
  const { ok, data } = await api('/projects/' + REF + '/api-keys');
  if (!ok || !Array.isArray(data)) throw new Error('Cannot list keys: ' + JSON.stringify(data));
  return data;
}

async function revokeKey(id) {
  console.log('  Revoking ' + id + '...');
  const { ok, status, data } = await api('/projects/' + REF + '/api-keys/' + id + '/revoke', { method: 'POST' });
  if (!ok) throw new Error('Revoke failed: HTTP ' + status + ' ' + JSON.stringify(data));
  console.log('  [OK] Revoked ' + id);
  return data;
}

async function updateEnvFiles(newAnon, newSvc) {
  let updated = 0;
  for (const rel of ENV_FILES) {
    const fp = path.resolve(ROOT, rel);
    if (!fs.existsSync(fp)) continue;
    let content = fs.readFileSync(fp, 'utf8');
    let changed = false;

    // Replace anon key patterns
    const anonPatterns = [
      /^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m,
      /^VITE_SUPABASE_ANON_KEY=.*$/m,
      /^SUPABASE_ANON_KEY=.*$/m,
    ];
    const svcPatterns = [
      /^SUPABASE_SERVICE_ROLE_KEY=.*$/m,
      /^VITE_SUPABASE_SERVICE_ROLE_KEY=.*$/m,
    ];

    for (const pat of anonPatterns) {
      if (pat.test(content)) {
        const keyName = content.match(pat)[0].split('=')[0];
        content = content.replace(pat, keyName + '=' + newAnon);
        changed = true;
      }
    }
    for (const pat of svcPatterns) {
      if (pat.test(content)) {
        const keyName = content.match(pat)[0].split('=')[0];
        content = content.replace(pat, keyName + '=' + newSvc);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(fp, content, 'utf8');
      console.log('  [UPDATE] ' + rel);
      updated++;
    } else {
      console.log('  [SKIP] ' + rel + ' (no matching keys)');
    }
  }
  return updated;
}

async function main() {
  console.log('\n  === Rotación de claves Supabase ===\n');

  // 1. List current keys
  console.log('  Listando keys actuales...');
  const keys = await listKeys();
  
  // Find the sb_publishable_ and sb_secret_ format keys (these are the ones used in env files)
  const anonEntry = keys.find(k => k.name === '_czn' || (k.prefix && k.prefix.startsWith('sb_publishable')));
  const svcEntry = keys.find(k => k.name === 'default' || (k.prefix && k.prefix.startsWith('sb_secret')));
  
  if (!anonEntry || !svcEntry) {
    console.log('  Keys found:');
    keys.forEach(k => console.log('    ' + k.name + ' | ' + k.id + ' | prefix: ' + (k.prefix || '-')));
    throw new Error('Cannot identify anon/service keys');
  }

  console.log('  Anon key: ' + anonEntry.id + ' (prefix: ' + anonEntry.prefix + ')');
  console.log('  Service key: ' + svcEntry.id + ' (prefix: ' + svcEntry.prefix + ')');

  // 2. Revoke both keys
  console.log('\n  Revocando keys...');
  await revokeKey(anonEntry.id);
  await revokeKey(svcEntry.id);

  // 3. Wait and fetch new keys
  console.log('\n  Esperando 5s para que se generen las nuevas keys...');
  await new Promise(r => setTimeout(r, 5000));

  console.log('  Obteniendo nuevas keys...');
  const newKeys = await listKeys();

  const newAnonEntry = newKeys.find(k => k.name === '_czn' || (k.prefix && k.prefix.startsWith('sb_publishable')));
  const newSvcEntry = newKeys.find(k => k.name === 'default' || (k.prefix && k.prefix.startsWith('sb_secret')));

  if (!newAnonEntry || !newSvcEntry) {
    console.log('  New keys found:');
    newKeys.forEach(k => console.log('    ' + k.name + ' | ' + k.id + ' | prefix: ' + (k.prefix || '-')));
    throw new Error('Cannot find new keys');
  }

  // We need the FULL key values. The list endpoint only shows prefix.
  // We need to get the full key from somewhere. The Management API might not expose full keys.
  // Let's try fetching the key details.
  const anonDetail = await api('/projects/' + REF + '/api-keys/' + newAnonEntry.id);
  const svcDetail = await api('/projects/' + REF + '/api-keys/' + newSvcEntry.id);
  
  console.log('  Anon detail status: ' + anonDetail.status);
  console.log('  Svc detail status: ' + svcDetail.status);
  
  // The keys might be in the response
  let newAnonKey, newSvcKey;
  
  if (anonDetail.ok && anonDetail.data.api_key) newAnonKey = anonDetail.data.api_key;
  if (svcDetail.ok && svcDetail.data.api_key) newSvcKey = svcDetail.data.api_key;
  
  if (!newAnonKey) {
    console.log('\n  [!] No se pudo obtener la key completa via API.');
    console.log('  Las nuevas keys SOLO están visibles en el Dashboard:');
    console.log('  https://supabase.com/dashboard/project/' + REF + '/settings/api');
    console.log('\n  Debes copiarlas manualmente y actualizar estos archivos:');
    for (const rel of ENV_FILES) {
      const fp = path.resolve(ROOT, rel);
      if (fs.existsSync(fp)) console.log('    - ' + rel);
    }
    console.log('\n  Las keys viejas ya fueron REVOCADAS. El proyecto no funcionará');
    console.log('  hasta que actualices los .env con las nuevas keys desde el Dashboard.\n');
    return;
  }

  // 4. Update env files
  console.log('\n  Actualizando archivos .env...');
  const count = await updateEnvFiles(newAnonKey, newSvcKey);
  
  console.log('\n  === Resumen ===');
  console.log('  Keys rotadas: anon + service_role');
  console.log('  Archivos actualizados: ' + count);
  console.log('');
}

main().catch(e => {
  console.error('\n  [FATAL] ' + e.message + '\n');
  process.exit(1);
});