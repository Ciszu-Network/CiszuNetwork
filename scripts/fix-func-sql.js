const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
require('./lib/env').loadEnv();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

const sql = `CREATE OR REPLACE FUNCTION public.check_username_available(p_username TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username))
  );
END;
$$;`;

async function main() {
  console.log('Sending SQL...');
  try {
    const r = await fetch(API + '/projects/' + REF + '/database/query', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: sql })
    });
    const d = await r.json();
    console.log('Status: ' + r.status);
    console.log(JSON.stringify(d).substring(0, 500));
  } catch(e) { console.log('FAIL: ' + e.message); }
}
main();