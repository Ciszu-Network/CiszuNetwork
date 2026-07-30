require('./lib/env.js').loadEnv();
const API='https://api.supabase.com/v1', REF='obwzzmbvkrcscqwptlqo', T=process.env.SUPABASE_ACCESS_TOKEN;
const sql = [
  "SELECT n.nspname AS s, c.relname AS t, count(*) AS n",
  "FROM pg_policy pol",
  "JOIN pg_class c ON pol.polrelid = c.oid",
  "JOIN pg_namespace n ON c.relnamespace = n.oid",
  "WHERE n.nspname IN ('muzicmania','ciszubot','ciszunetwork')",
  "GROUP BY n.nspname, c.relname ORDER BY n.nspname, c.relname"
].join('\n');
fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql})})
  .then(r=>r.json()).then(d=>{for(const r of d)console.log(r.s+'.'+r.t+': '+r.n+' policies')}).catch(e=>console.error(e));