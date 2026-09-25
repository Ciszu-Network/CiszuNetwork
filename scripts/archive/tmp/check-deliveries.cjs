// Solo lectura: últimas filas de las tablas de entrega para comprobar que los
// upserts del front (clave anónima) sí llegan a la base de datos.
const fs = require('fs');
const path = require('path');

for (const envPath of [
  path.resolve('services/supabase/.env.local'),
  path.resolve('services/supabase/.env'),
]) {
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const eq = t.indexOf('=');
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
  break;
}

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = 'obwzzmbvkrcscqwptlqo';
const sql = `
select 'disclaimer' as t, site, disclaimer_id as ref_id, delivered_at::text as at from ciszunetwork.global_disclaimer_deliveries order by delivered_at desc limit 6;
`;

fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
})
  .then(async (res) => {
    const text = await res.text();
    console.log(res.status, text.slice(0, 2000));
  })
  .catch((e) => console.error('ERR ' + e.message));
