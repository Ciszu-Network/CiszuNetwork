require('./lib/env.js').loadEnv();
const API='https://api.supabase.com/v1', REF='obwzzmbvkrcscqwptlqo', T=process.env.SUPABASE_ACCESS_TOKEN;
const sql = [
  "SELECT n.nspname AS s, c.relname AS t, pol.polname AS p,",
  "  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,",
  "  pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expr",
  "FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid",
  "WHERE n.nspname IN ('muzicmania','ciszubot','ciszunetwork')",
  "ORDER BY n.nspname, c.relname, pol.polname"
].join('\n');
fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql})})
  .then(r=>r.json()).then(d=>{
    let found = 0;
    for(const r of d) {
      const expr = (r.using_expr||'') + ' ' + (r.check_expr||'');
      // Match auth.X() where X is a function name, but NOT if preceded by "SELECT"
      const matches = expr.match(/(?<!SELECT\s)(auth\.\w+\(\))/g);
      if (matches) {
        console.log('UNWRAPPED: ' + r.s+'.'+r.t+' ['+r.p+']: ' + matches.join(', '));
        found++;
      }
    }
    if (!found) console.log('ALL CLEAN: no unwrapped auth.*() calls found');
  }).catch(e=>console.error(e));