const fs = require('fs');
const env = fs.readFileSync('E:/Ciszu Network/services/supabase/.env.local', 'utf8');
const getVar = (k) => {
  const m = env.match(new RegExp('^' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=(.+)', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
};
const SVC = getVar('SUPABASE_SERVICE_ROLE_KEY');
const ANON = getVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const URL = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

(async () => {
  const tests = [
    { func: 'check_username_available', role: 'service', key: SVC, body: { p_username: 'test' } },
    { func: 'check_username_available', role: 'anon', key: ANON, body: { p_username: 'test' } },
    { func: 'get_email_by_username', role: 'anon', key: ANON, body: { p_username: 'test' } },
    { func: 'get_email_by_username', role: 'service', key: SVC, body: { p_username: 'test' } },
    { func: 'handle_review_like', role: 'anon', key: ANON, body: {} },
    { func: 'handle_new_user', role: 'anon', key: ANON, body: {} },
  ];
  for (const t of tests) {
    const r = await fetch(`${URL}/rest/v1/rpc/${t.func}`, {
      method: 'POST',
      headers: { apikey: t.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(t.body)
    });
    const text = r.ok ? await r.text() : `${r.status} ${r.statusText}`;
    console.log(`${t.func} (${t.role}): ${text}`);
  }
})();