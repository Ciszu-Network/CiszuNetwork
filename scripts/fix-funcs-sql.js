const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
require('./lib/env').loadEnv();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

const fixes = [
  // Fix 1: get_email_by_username - needs explicit schema ref + search_path
  `CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username));
  RETURN v_email;
END;
$$;`,

  // Fix 2: handle_account_deletion - explicit schema ref
  `CREATE OR REPLACE FUNCTION public.handle_account_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
BEGIN
  DELETE FROM muzicmania.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;`,

  // Fix 3: is_account_recoverable - explicit schema ref
  `CREATE OR REPLACE FUNCTION public.is_account_recoverable(p_username TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'muzicmania, public'
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM muzicmania.profiles
    WHERE LOWER(username) = LOWER(TRIM(p_username))
    AND deleted_at IS NOT NULL;
  RETURN v_count > 0;
END;
$$;`,
];

async function run(sql, label) {
  console.log(`Fixing ${label}...`);
  try {
    const r = await fetch(API + '/projects/' + REF + '/database/query', {
      method: 'POST', headers,
      body: JSON.stringify({ query: sql })
    });
    const d = await r.json();
    const ok = r.status === 201;
    console.log(`  ${ok ? '✓' : '✗'} ${r.status}: ${JSON.stringify(d).substring(0, 200)}`);
    return ok;
  } catch(e) {
    console.log(`  ✗ ERROR: ${e.message}`);
    return false;
  }
}

async function main() {
  for (const f of fixes) {
    const label = f.match(/CREATE OR REPLACE FUNCTION public\.(\w+)/)?.[1] || 'unknown';
    await run(f, label);
  }
}
main();