require('./lib/env.js').loadEnv();
const API='https://api.supabase.com/v1', REF='obwzzmbvkrcscqwptlqo', T=process.env.SUPABASE_ACCESS_TOKEN;

// Check what tables/operations submit_game_score actually accesses via RLS
const sql = [
  "SELECT n.nspname AS schema, c.relname AS table_name,",
  "  c.relrowsecurity AS rls_enabled,",
  "  (SELECT json_agg(json_build_object(",
  "    'name', pol.polname,",
  "    'cmd', CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' WHEN '*' THEN 'ALL' END,",
  "    'role', ARRAY(SELECT pg_catalog.unnest(pol.polroles)::regrole::text)))",
  "   FROM pg_policy pol WHERE pol.polrelid = c.oid) AS policies",
  "FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid",
  "WHERE n.nspname = 'muzicmania' AND c.relname IN ('scores','profiles')",
  "ORDER BY c.relname"
].join('\n');

fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql})})
  .then(r=>r.json()).then(d=>{
    for(const r of d) {
      console.log(r.schema+'.'+r.table_name+' (RLS: '+(r.rls_enabled ? 'ON' : 'OFF')+')');
      for(const p of (r.policies||[])) {
        console.log('  ['+p.cmd+'] '+p.name+' -> roles: '+(p.role||[]).join(', '));
      }
    }
  }).catch(e=>console.error(e));