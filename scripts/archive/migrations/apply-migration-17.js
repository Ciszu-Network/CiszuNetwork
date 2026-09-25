const fs = require('fs');
const path = require('path');
const envCandidates = [
  path.resolve(__dirname, '..', 'services', 'supabase', '.env'),
  path.resolve(__dirname, '..', 'services', 'supabase', '.env.local'),
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
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN not found'); process.exit(1); }
const sql = fs.readFileSync(
  path.resolve(__dirname, '..', 'services', 'supabase', 'migrations', '20260811000017_audit_log.sql'),
  'utf8'
).trim();
console.log('Applying migration 17 (' + sql.length + ' chars)...');
fetch(API + '/projects/' + REF + '/database/query', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
}).then(async r => {
  const text = await r.text();
  if (r.ok || r.status === 201) {
    console.log('OK: Migration 17 applied');
  } else if (text.includes('already exists')) {
    console.log('OK: Already applied');
  } else {
    console.log('HTTP ' + r.status + ': ' + text.substring(0, 800));
  }
}).catch(e => console.error('ERR: ' + e.message));