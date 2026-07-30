const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const g = s => { const m = env.match(new RegExp('^' + s.replace(/[^a-zA-Z0-9_]/g,'.') + '=(.+)','m')); return m ? m[1].trim().replace(/^["\']|["\']$/g,'') : null; };
const ANON = g('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const SVC = g('SUPABASE_SERVICE_ROLE_KEY');
const BASE = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

async function test(name, key, method, path, body) {
  try {
    const r = await fetch(BASE + path, {
      method: method || 'POST',
      headers: { apikey: key || ANON, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await r.text();
    const ok = text.length < 200 ? text : text.substring(0, 120) + '...';
    const icon = r.status < 400 ? '✓' : (r.status === 404 ? '?' : (text.includes('permission denied') ? '✓' : '✗'));
    console.log(`${icon} ${r.status} ${name}: ${ok}`);
  } catch(e) { console.log(`☠ ${name}: ${e.message}`); }
}

async function main() {
  console.log('=== PUBLIC SCHEMA (ANON) ===');
  await test('check_username_available', ANON, 'POST', '/rest/v1/rpc/check_username_available', { p_username: 'test999' });
  await test('get_email_by_username', ANON, 'POST', '/rest/v1/rpc/get_email_by_username', { p_username: 'admin' });
  await test('submit_game_score', ANON, 'POST', '/rest/v1/rpc/submit_game_score', { p_score: 100, p_game_mode: 'test', p_player_name: 'test' });
  await test('handle_review_like', ANON, 'POST', '/rest/v1/rpc/handle_review_like', { p_review_id: 1 });
  await test('generate_ticket_id', ANON, 'POST', '/rest/v1/rpc/generate_ticket_id', {});

  console.log('\n=== PUBLIC SCHEMA (SERVICE_ROLE) ===');
  await test('check_username_available', SVC, 'POST', '/rest/v1/rpc/check_username_available', { p_username: 'test999' });
  await test('get_email_by_username', SVC, 'POST', '/rest/v1/rpc/get_email_by_username', { p_username: 'admin' });
  await test('submit_game_score', SVC, 'POST', '/rest/v1/rpc/submit_game_score', { p_score: 100, p_game_mode: 'test', p_player_name: 'test' });
  await test('handle_review_like', SVC, 'POST', '/rest/v1/rpc/handle_review_like', { p_review_id: 1 });
  await test('generate_ticket_id', SVC, 'POST', '/rest/v1/rpc/generate_ticket_id', {});
}
main();