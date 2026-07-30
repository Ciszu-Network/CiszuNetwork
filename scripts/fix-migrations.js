const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
require('./lib/env').loadEnv();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

function isValidVersion(v) {
  return /^\d{14}$/.test(v);
}

async function runSQL(sql, label) {
  console.log(`  ${label}...`);
  const r = await fetch(API + '/projects/' + REF + '/database/query', {
    method: 'POST', headers,
    body: JSON.stringify({ query: sql })
  });
  const text = await r.text();
  console.log(`    ${r.status}: ${text.substring(0, 200)}`);
  return r.ok;
}

async function main() {
  // 1. Check current migration state
  console.log('=== Current migration history ===');
  await runSQL('SELECT version, name, statements FROM supabase_migrations.schema_migrations ORDER BY version', 'List migrations');
  
  // 2. Mark old versions as reverted
  const oldVersions = [
    '20240508000000','20240510000001','20240510000002','20240510000003',
    '20240510000004','20240510000005','20240510000006','20260425000000',
    '20260426000001','20260426000002','20260506000000','20260513000000',
    '20260522000000','20260523000000','20260531000000','20260531000001',
    '20260728000000','20260728000001','20260728000002','20260729000000',
    '20260729000001'
  ];
  // We also need to add our pending migrations as applied
  const pendingVersions = ['20260729000002', '20260729000003'];
  
  // Validate all version strings before using in SQL
  const allVersions = [...oldVersions, ...pendingVersions];
  for (const v of allVersions) {
    if (!isValidVersion(v)) {
      throw new Error(`Invalid migration version format: ${v}`);
    }
  }
  
  // Mark old as reverted
  for (const v of oldVersions) {
    await runSQL(
      `DELETE FROM supabase_migrations.schema_migrations WHERE version = '${v}'`,
      `Revert ${v}`
    );
  }
  
  // Add our pending migrations as applied
  for (const v of pendingVersions) {
    await runSQL(
      `INSERT INTO supabase_migrations.schema_migrations (version, name, statements) VALUES ('${v}', '${v}', '{}') ON CONFLICT DO NOTHING`,
      `Apply ${v}`
    );
  }
  
  // Verify final state
  console.log('\n=== Final migration history ===');
  await runSQL('SELECT version FROM supabase_migrations.schema_migrations ORDER BY version', 'List');
}
main();