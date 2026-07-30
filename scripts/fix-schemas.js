const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const g = s => { const m = env.match(new RegExp('^' + s.replace(/[^a-zA-Z0-9_]/g,'.') + '=(.+)','m')); return m ? m[1].trim().replace(/^["\']|["\']$/g,'') : null; };
const TOKEN = g('SUPABASE_ACCESS_TOKEN');
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function main() {
  // 1. Check current postgrest config
  const config = await fetch(`${API}/projects/${REF}/config/postgrest`, { headers });
  const cfg = await config.json();
  console.log('Current PostgREST config:');
  console.log('  db_schema:', cfg.db_schema);
  console.log('  db_extra_search_path:', cfg.db_extra_search_path);

  // 2. Update exposed schemas
  const updateRes = await fetch(`${API}/projects/${REF}/config/postgrest`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      db_schema: 'public, graphql_public, muzicmania, ciszubot, ciszunetwork',
      db_extra_search_path: 'public, extensions'
    })
  });
  const upd = await updateRes.json();
  console.log('\nUpdate result:', updateRes.status, updateRes.ok ? 'OK' : JSON.stringify(upd).substring(0, 200));

  // 3. Check if profiles exists in muzicmania schema
  const queryRes = await fetch(`${API}/projects/${REF}/database/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `SELECT table_schema, table_name FROM information_schema.tables WHERE table_name IN ('profiles', 'scores', 'reviews', 'track_stats') ORDER BY table_schema, table_name`
    })
  });
  const tables = await queryRes.json();
  console.log('\nTables in database:');
  if (Array.isArray(tables)) {
    for (const t of tables) console.log(`  ${t.table_schema}.${t.table_name}`);
  } else {
    console.log('  Error:', JSON.stringify(tables).substring(0, 300));
  }

  // 4. Check muzicmania schema functions
  const funcRes = await fetch(`${API}/projects/${REF}/database/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `SELECT n.nspname AS schema, p.proname AS name, p.prosecdef AS security_definer, array_to_string(p.proargnames, ', ') AS args FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname IN ('public', 'muzicmania') AND p.proname LIKE '%review%' OR p.proname LIKE '%like%' OR p.proname LIKE '%score%' OR p.proname IN ('check_username_available', 'get_email_by_username', 'handle_new_user', 'auto_confirm_user_email', 'handle_account_deletion', 'normalize_username', 'is_account_recoverable', 'generate_ticket_id') ORDER BY n.nspname, p.proname`
    })
  });
  const funcs = await funcRes.json();
  console.log('\nFunctions:');
  if (Array.isArray(funcs)) {
    for (const f of funcs) console.log(`  ${f.schema}.${f.name}(...)  SECDEF=${f.security_definer}`);
  } else {
    console.log('  Error:', JSON.stringify(funcs).substring(0, 300));
  }
}
main();