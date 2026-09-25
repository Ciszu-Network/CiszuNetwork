require('./lib/env').loadEnv();
const fs = require('fs');
const path = require('path');
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';

if (!TOKEN) { console.error('NO TOKEN'); process.exit(1); }

const sql = fs.readFileSync(path.resolve(__dirname, '..', 'services', 'supabase', 'migrations', '20260729000005_fix_advisors_security_definer.sql'), 'utf8');
console.log('SQL length: ' + sql.length + ' chars');

fetch(API + '/projects/' + REF + '/database/query', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
}).then(async r => {
  const text = await r.text();
  if (r.ok || r.status === 201) {
    console.log('OK: Migration 05 applied');
  } else {
    console.log('HTTP ' + r.status + ': ' + text.substring(0, 800));
  }
}).catch(e => console.error('ERR: ' + e.message));