/**
 * Aplica la migración 20260930000001_account_lifecycle_roles.sql
 * (roles/tags por website, sanciones y ciclo de eliminación de cuentas).
 *
 * Uso: node scripts/apply-migration-47.js
 */
const fs = require('fs');
const path = require('path');

const envCandidates = [
  path.resolve(__dirname, '..', 'services', 'supabase', '.env.local'),
  path.resolve(__dirname, 'services', 'supabase', '.env.local'),
  path.join(process.cwd(), 'services', 'supabase', '.env.local'),
  path.resolve(__dirname, '..', 'services', 'supabase', '.env'),
  path.resolve(__dirname, 'services', 'supabase', '.env'),
  path.join(process.cwd(), 'services', 'supabase', '.env'),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const eq = trimmed.indexOf('=');
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
    break;
  }
}

const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN not found');
  process.exit(1);
}

const MIGRATION = '20260930000001_account_lifecycle_roles.sql';
const sql = fs
  .readFileSync(path.resolve(__dirname, '..', 'services', 'supabase', 'migrations', MIGRATION), 'utf8')
  .trim();

console.log('Applying migration ' + MIGRATION + ' (' + sql.length + ' chars)...');

fetch(API + '/projects/' + REF + '/database/query', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
})
  .then(async (r) => {
    const text = await r.text();
    if (r.ok || r.status === 201) {
      console.log('OK: Migration applied');
      console.log(text.substring(0, 500));
    } else if (text.includes('already exists') || text.includes('nothing to do')) {
      console.log('OK: Already applied or no changes');
    } else {
      console.log('HTTP ' + r.status + ': ' + text.substring(0, 800));
      process.exitCode = 1;
    }
  })
  .catch((e) => {
    console.error('ERR: ' + e.message);
    process.exitCode = 1;
  });
