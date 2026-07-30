const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const g = s => { const m = env.match(new RegExp('^' + s.replace(/[^a-zA-Z0-9_]/g,'.') + '=(.+)','m')); return m ? m[1].trim().replace(/^["\']|["\']$/g,'') : null; };
const ANON = g('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SVC = g('SUPABASE_SERVICE_ROLE_KEY');
const BASE = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

async function test(name, key, path, body, expectStatus) {
  try {
    const r = await fetch(BASE + path, {
      method: 'POST',
      headers: { apikey: key || ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    const statusMatch = r.status === expectStatus ? '✓' : '✗';
    console.log(`${statusMatch} ${name}: ${r.status} -> ${text.substring(0, 120)}`);
  } catch(e) { console.log(`✗ ${name}: ERROR - ${e.message}`); }
}

async function main() {
  // 1. check_username_available - should return true (username doesn't exist)
  await test('check_username_available(ANON)', ANON, '/rest/v1/rpc/check_username_available', { p_username: 'nonexistent_user_99999' }, 200);
  
  // 2. check_username_available as SVC
  await test('check_username_available(SVC)', SVC, '/rest/v1/rpc/check_username_available', { p_username: 'nonexistent_user_99999' }, 200);
  
  // 3. handle_review_like
  await test('handle_review_like(ANON)', ANON, '/rest/v1/rpc/handle_review_like', { p_review_id: 1 }, 404);
  await test('handle_review_like(SVC)', SVC, '/rest/v1/rpc/handle_review_like', { p_review_id: 1 }, 404);
  
  // 4. submit_game_score(ANON)
  await test('submit_game_score(ANON)', ANON, '/rest/v1/rpc/submit_game_score', { p_score: 100, p_game_mode: 'test', p_player_name: 'test' }, 401);
  await test('submit_game_score(SVC)', SVC, '/rest/v1/rpc/submit_game_score', { p_score: 100, p_game_mode: 'test', p_player_name: 'test' }, 400);
  
  // 5. get_email_by_username(ANON)
  await test('get_email_by_username(ANON)', ANON, '/rest/v1/rpc/get_email_by_username', { p_username: 'admin' }, 404);
  // 6. get_email_by_username(SVC)
  await test('get_email_by_username(SVC)', SVC, '/rest/v1/rpc/get_email_by_username', { p_username: 'admin' }, 200);
}
main();