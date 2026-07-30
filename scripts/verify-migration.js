require('./lib/env.js').loadEnv();
const API='https://api.supabase.com/v1', REF='obwzzmbvkrcscqwptlqo', T=process.env.SUPABASE_ACCESS_TOKEN;
const sql = [
  "SELECT n.nspname AS s, c.relname AS t, pol.polname AS p,",
  "  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr",
  "FROM pg_policy pol",
  "JOIN pg_class c ON pol.polrelid = c.oid",
  "JOIN pg_namespace n ON c.relnamespace = n.oid",
  "WHERE n.nspname IN ('muzicmania','ciszubot','ciszunetwork')",
  "ORDER BY n.nspname, c.relname, pol.polname"
].join('\n');
fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql})})
  .then(r=>r.json()).then(d=>{
    for(const r of d) {
      const name = r.s+'.'+r.t;
      if (!/select.*tickets/i.test(name) && !/select.*auth/i.test(r.using_expr||'')) continue;
      console.log('['+name+'] '+r.p);
      if(r.using_expr) console.log('  USING: '+r.using_expr);
    }
  }).catch(e=>console.error(e));