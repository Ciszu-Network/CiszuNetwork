const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
require('./lib/env').loadEnv();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

const sql = `SELECT n.nspname AS schema, p.proname AS name,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_functiondef(p.oid) AS def
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'muzicmania')
  AND p.proname IN ('submit_game_score', 'handle_review_like', 'generate_ticket_id',
                    'handle_review_update', 'update_track_like_count',
                    'check_username_available', 'get_email_by_username',
                    'handle_new_user', 'auto_confirm_user_email',
                    'handle_account_deletion', 'normalize_username',
                    'is_account_recoverable')
ORDER BY n.nspname, p.proname`;

async function main() {
  const r = await fetch(API + '/projects/' + REF + '/database/query', {
    method: 'POST', headers,
    body: JSON.stringify({ query: sql })
  });
  const data = await r.json();
  for (const row of data) {
    console.log(`\n=== ${row.schema}.${row.name}(${row.args}) ===`);
    // Print just the relevant parts of the function def
    const lines = row.def.split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (t && !t.startsWith('--')) {
        console.log('  ' + t.substring(0, 150));
      }
    }
  }
}
main();