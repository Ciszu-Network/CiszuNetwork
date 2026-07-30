const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const g = s => { const m = env.match(new RegExp('^' + s.replace(/[^a-zA-Z0-9_]/g,'.') + '=(.+)','m')); return m ? m[1].trim().replace(/^["\']|["\']$/g,'') : null; };
const TOKEN = g('SUPABASE_ACCESS_TOKEN');
const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';

const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

async function main() {
  // Try different API endpoints for PostgREST config
  const endpoints = [
    `${API}/projects/${REF}/config/database`,
    `${API}/projects/${REF}/config/postgrest`,
    `${API}/projects/${REF}/config`,
    `${API}/projects/${REF}/database/settings`,
  ];
  
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { headers });
      const data = await res.json();
      console.log(`GET ${ep.replace(API, '')}: ${res.status}`);
      if (res.ok) {
        const str = JSON.stringify(data).substring(0, 500);
        console.log(`  ${str}`);
        break;
      }
    } catch(e) { console.log(`Error: ${ep}`); }
  }

  // Run the migration SQL directly
  const migrationSql = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\migrations\\20260729000002_fix_schemas_and_perms.sql', 'utf8');
  console.log('\n--- Running migration SQL ---');
  
  // Split by ; and run each statement
  const statements = migrationSql.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    try {
      const res = await fetch(`${API}/projects/${REF}/database/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: stmt.trim() })
      });
      const data = await res.json();
      console.log(`  [${res.status}] ${stmt.trim().substring(0, 80)}...`);
      if (!res.ok) console.log(`    Error: ${JSON.stringify(data).substring(0, 200)}`);
    } catch(e) {
      console.log(`  Error executing: ${e.message}`);
    }
  }
  
  // Now test the fixed function
  console.log('\n--- Testing check_username_available ---');
  // Try with anon key
  const anonKey = g('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  try {
    const testRes = await fetch(`https://${REF}.supabase.co/rest/v1/rpc/check_username_available`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_username: 'testuser' })
    });
    const result = await testRes.text();
    console.log(`  Result (${testRes.status}): ${result}`);
  } catch(e) {
    console.log(`  Error: ${e.message}`);
  }
}
main();