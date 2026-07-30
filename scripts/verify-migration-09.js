require('./lib/env.js').loadEnv();
const API='https://api.supabase.com/v1', REF='obwzzmbvkrcscqwptlqo', T=process.env.SUPABASE_ACCESS_TOKEN;

// Check policies
const sql1 = [
  "SELECT n.nspname AS s, c.relname AS t, count(*) AS n",
  "FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid",
  "WHERE n.nspname IN ('muzicmania','ciszubot','ciszunetwork')",
  "GROUP BY n.nspname, c.relname ORDER BY n.nspname, c.relname"
].join('\n');

// Check functions
const sql2 = [
  "SELECT n.nspname AS schema, p.proname AS name,",
  "  CASE p.prosecdef WHEN true THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security",
  "FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid",
  "WHERE p.proname IN ('submit_game_score','get_email_by_username','is_account_recoverable','handle_review_like','handle_review_update','update_track_like_count')",
  "  AND n.nspname IN ('muzicmania','public')",
  "ORDER BY n.nspname, p.proname"
].join('\n');

// Check initplan wrapping
const sql3 = [
  "SELECT n.nspname AS s, c.relname AS t, pol.polname AS p,",
  "  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr",
  "FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid",
  "WHERE n.nspname IN ('muzicmania','ciszubot','ciszunetwork')",
  "  AND (pg_get_expr(pol.polqual, pol.polrelid) LIKE '%auth.uid%' OR pg_get_expr(pol.polqual, pol.polrelid) LIKE '%auth.role%' OR pg_get_expr(pol.polqual, pol.polrelid) LIKE '%auth.jwt%')",
  "ORDER BY n.nspname, c.relname, pol.polname"
].join('\n');

(async () => {
  console.log('=== POLICIES PER TABLE ===');
  const d1 = await (await fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql1})})).json();
  for(const r of d1) console.log(r.s+'.'+r.t+': '+r.n);

  console.log('\n=== FUNCTION SECURITY ===');
  const d2 = await (await fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql2})})).json();
  for(const r of d2) console.log(r.schema+'.'+r.name+': '+r.security);

  console.log('\n=== POLICIES WITH auth.*() ===');
  const d3 = await (await fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql3})})).json();
  for(const r of d3) {
    console.log('['+r.s+'.'+r.t+'] '+r.p);
    console.log('  '+(r.using_expr||'').substring(0,250));
  }
})();