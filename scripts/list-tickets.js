require('./lib/env.js').loadEnv();
const API='https://api.supabase.com/v1', REF='obwzzmbvkrcscqwptlqo', T=process.env.SUPABASE_ACCESS_TOKEN;
const sql = [
  "SELECT pol.polname AS p,",
  "  CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' WHEN '*' THEN 'ALL' END AS cmd,",
  "  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,",
  "  pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expr",
  "FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid",
  "WHERE n.nspname = 'muzicmania' AND c.relname = 'tickets'",
  "ORDER BY pol.polname"
].join('\n');
fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql})})
  .then(r=>r.json()).then(d=>{for(const r of d) console.log('['+r.cmd+'] '+r.p);}).catch(e=>console.error(e));