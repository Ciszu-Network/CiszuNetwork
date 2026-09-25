require('./lib/env').loadEnv();
const fs = require('fs');
const path = require('path');
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const sql = fs.readFileSync(path.resolve(__dirname, '..', 'services', 'supabase', 'migrations', '20260729000006_fix_remaining_anon.sql'), 'utf8');

fetch(API + '/projects/' + REF + '/database/query', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
}).then(async r => {
  const t = await r.text();
  console.log(r.ok || r.status === 201 ? 'OK: applied' : 'HTTP ' + r.status + ': ' + t.substring(0, 300));
}).catch(e => console.log('ERR: ' + e.message));