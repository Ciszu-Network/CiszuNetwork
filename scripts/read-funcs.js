require('./lib/env.js').loadEnv();
const API='https://api.supabase.com/v1', REF='obwzzmbvkrcscqwptlqo', T=process.env.SUPABASE_ACCESS_TOKEN;
const sql = [
  "SELECT n.nspname AS schema, p.proname AS name,",
  "  pg_get_functiondef(p.oid) AS def",
  "FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid",
  "WHERE p.proname IN ('submit_game_score','get_email_by_username','is_account_recoverable','handle_review_like','handle_review_update','update_track_like_count')",
  "  AND n.nspname IN ('muzicmania','public')",
  "ORDER BY n.nspname, p.proname"
].join('\n');
fetch(API+'/projects/'+REF+'/database/query', {method:'POST', headers:{Authorization:'Bearer '+T,'Content-Type':'application/json'}, body:JSON.stringify({query:sql})})
  .then(r=>r.json()).then(d=>{
    for(const r of d) {
      console.log('=== ' + r.schema + '.' + r.name + ' ===');
      console.log((r.def||'<no source>').substring(0, 2000));
      console.log();
    }
  }).catch(e=>console.error(e));