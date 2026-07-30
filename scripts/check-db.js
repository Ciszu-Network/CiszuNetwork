const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const g = s => { const m = env.match(new RegExp('^' + s.replace(/[^a-zA-Z0-9_]/g,'.') + '=(.+)','m')); return m ? m[1].trim().replace(/^["\']|["\']$/g,'') : null; };
const S = g('SUPABASE_SERVICE_ROLE_KEY');

fetch('https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/rpc/get_schemas_and_tables', {
  method: 'POST', headers: { apikey: S, 'Content-Type': 'application/json' }, body: '{}'
}).then(r => r.text().then(t => console.log(r.status, t.substring(0, 500)))).catch(e => console.error(e));

// Try raw SQL via the query endpoint
fetch('https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/', {
  method: 'GET', headers: { apikey: S }
}).then(r => r.text().then(t => console.log('Tables:', t.substring(0, 500)))).catch(e => console.error(e));