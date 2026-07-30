require('./lib/env').loadEnv();
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const sql = `SELECT n.nspname AS schema, p.proname AS name,
  pg_get_function_identity_arguments(p.oid) AS args,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'muzicmania')
  AND p.proname IN ('submit_game_score', 'handle_review_like', 'handle_review_update',
                    'update_track_like_count', 'get_email_by_username',
                    'is_account_recoverable', 'check_username_available',
                    'handle_account_deletion', 'handle_new_user',
                    'auto_confirm_user_email', 'normalize_username')
ORDER BY n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)`;

fetch(API + '/projects/' + REF + '/database/query', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql })
}).then(async r => {
  const data = await r.json();
  console.log('schema.name(args)                          | anon | auth');
  console.log('--------------------------------------------|------|-----');
  for (const row of data) {
    const name = (row.schema + '.' + row.name + '(' + (row.args || '') + ')').padEnd(44).substring(0,44);
    console.log(name + '| ' + (row.anon_can_execute ? 'YES ' : 'NO  ') + '| ' + (row.auth_can_execute ? 'YES' : 'NO'));
  }
}).catch(e => console.error('ERR: ' + e.message));