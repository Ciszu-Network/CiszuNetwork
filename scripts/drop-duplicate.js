require('./lib/env.js').loadEnv();
const sql = 'DROP POLICY IF EXISTS "Usuarios pueden ver sus propios tickets" ON muzicmania.tickets;';
fetch('https://api.supabase.com/v1/projects/obwzzmbvkrcscqwptlqo/database/query', {
  method:'POST', headers:{Authorization:'Bearer '+process.env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'},
  body:JSON.stringify({query:sql})
}).then(async r => {
  const t = await r.text();
  console.log(r.status + ': ' + t.substring(0,300));
}).catch(e => console.error(e.message));