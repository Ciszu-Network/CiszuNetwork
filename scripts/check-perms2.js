const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const getVar = (key) => {
  const m = env.match(new RegExp('^' + key.replace(/[^a-zA-Z0-9_]/g, '\\$&') + '=(.+)', 'm'));
  return m ? m[1].trim().replace(/^["\']|["\']$/g, '') : null;
};
const SVC = getVar('SUPABASE_SERVICE_ROLE_KEY');
const ANON = getVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const URL = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

async function test() {
  console.log('ANON key length:', ANON ? ANON.length : 'null');
  console.log('SVC key length:', SVC ? SVC.length : 'null');
  console.log('');

  // Test via SQL API
  const r1 = await fetch(`${URL}/rest/v1/rpc/check_username_available`, {
    method: 'POST',
    headers: { apikey: SVC, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_username: 'test123' })
  });
  const t1 = await r1.text();
  console.log('check_username_available (SVC):', r1.status, t1.substring(0, 200));

  const r2 = await fetch(`${URL}/rest/v1/rpc/check_username_available`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_username: 'test123' })
  });
  const t2 = await r2.text();
  console.log('check_username_available (ANON):', r2.status, t2.substring(0, 200));

  // Check if muzicmania schema functions are even callable
  const r3 = await fetch(`${URL}/rest/v1/rpc/submit_game_score`, {
    method: 'POST',
    headers: { apikey: SVC, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_track_id: 'test', p_score: 0, p_combo: 0, p_accuracy: 0 })
  });
  const t3 = await r3.text();
  console.log('submit_game_score (SVC):', r3.status, t3.substring(0, 200));
}
test();