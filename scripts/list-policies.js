require('./lib/env').loadEnv();
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const sql = `SELECT n.nspname AS schema_name, c.relname AS table_name,
  pol.polname AS policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS cmd,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expr,
  ARRAY(SELECT pg_catalog.unnest(pol.polroles)
        INTERSECT SELECT oid FROM pg_catalog.pg_roles
        WHERE rolname NOT LIKE 'pg_%') AS role_oids
FROM pg_catalog.pg_policy pol
JOIN pg_catalog.pg_class c ON pol.polrelid = c.oid
JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname IN ('muzicmania', 'ciszubot', 'ciszunetwork')
ORDER BY n.nspname, c.relname, pol.polname`;

fetch(API + '/projects/' + REF + '/database/query', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
}).then(async r => {
  const data = await r.json();
  for (const row of data) {
    const name = row.schema_name + '.' + row.table_name;
    console.log('[' + row.cmd.padEnd(6) + '][' + name.padEnd(35) + '] ' + row.policy_name);
    if (row.using_expr) console.log('  USING: ' + row.using_expr.substring(0, 200));
    if (row.check_expr) console.log('  CHECK: ' + row.check_expr.substring(0, 200));
  }
}).catch(e => console.error('ERR: ' + e.message));