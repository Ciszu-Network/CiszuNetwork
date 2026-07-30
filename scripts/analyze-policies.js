require('./lib/env').loadEnv();
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SQL = `SELECT n.nspname, c.relname, pol.polname,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expr,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_expr,
  CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' WHEN '*' THEN 'ALL' END AS cmd
FROM pg_policy pol
JOIN pg_class c ON pol.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname IN ('muzicmania','ciszubot','ciszunetwork')
ORDER BY n.nspname, c.relname, pol.polname`;

async function query(sql) {
  const r = await fetch(API + '/projects/' + REF + '/database/query', {
    method:'POST', headers:{'Authorization':'Bearer '+TOKEN,'Content-Type':'application/json'},
    body: JSON.stringify({query: sql})
  });
  if (!r.ok) { const t = await r.text(); throw new Error(t.substring(0,500)); }
  return r.json();
}

async function main() {
  const rows = await query(SQL);
  const key = (r) => r.nspname + '.' + r.relname + '|' + r.cmd;
  const groups = {};
  for (const r of rows) {
    const k = key(r);
    if (!groups[k]) groups[k] = [];
    groups[k].push(r);
  }

  console.log('=== DUPLICATE POLICIES ===');
  for (const [k, list] of Object.entries(groups)) {
    if (list.length > 1) {
      console.log(k + ' (' + list.length + ' policies)');
      for (const p of list) {
        console.log('  - ' + p.polname);
        if (p.using_expr) console.log('    USING: ' + p.using_expr.substring(0,150));
        if (p.check_expr) console.log('    CHECK: ' + p.check_expr.substring(0,150));
      }
    }
  }

  console.log('\n=== TOP-LEVEL auth.*() IN POLICIES (potential initplan) ===');
  for (const r of rows) {
    const expr = (r.using_expr || '') + ' ' + (r.check_expr || '');
    const match = expr.match(/(auth\.\w+\(\))/g);
    if (match) {
      // Check if auth call is inside a subquery
      if (!/\(\s*SELECT\s/i.test(expr.substring(0, expr.indexOf(match[0])))) {
        console.log(r.nspname + '.' + r.relname + ' [' + r.cmd + '] ' + r.polname);
        if (r.using_expr) console.log('  USING: ' + r.using_expr);
        if (r.check_expr) console.log('  CHECK: ' + r.check_expr);
      }
    }
  }
}
main().catch(e => console.error('ERR: ' + e.message));