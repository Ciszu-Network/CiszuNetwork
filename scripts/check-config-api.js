const REF = 'obwzzmbvkrcscqwptlqo';
const API = 'https://api.supabase.com/v1';
require('./lib/env').loadEnv();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.error('SUPABASE_ACCESS_TOKEN env var required'); process.exit(1); }
const headers = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

async function main() {
  // 1. Check current PostgREST config
  console.log('=== Current PostgREST config ===');
  let res = await fetch(`${API}/projects/${REF}/config/database/postgres`, { headers });
  console.log(`${res.status}: ${(await res.text()).substring(0, 300)}`);

  // Try different endpoints
  const endpoints = [
    `${API}/projects/${REF}/config`,
    `${API}/projects/${REF}/config/database`,
    `${API}/projects/${REF}/database/settings`,
    `${API}/projects/${REF}`,  
    `${API}/projects/${REF}/postgrest`,
  ];
  for (const ep of endpoints) {
    res = await fetch(ep, { headers });
    const text = await res.text();
    console.log(`\n${ep.replace(API, '')}: ${res.status}`);
    if (res.ok) {
      const json = JSON.parse(text);
      // Look for schema-related fields
      const schemas = json.db_schema || json.db_extra_search_path || json.public_schemas || json.schemas;
      if (schemas) console.log(`  schemas: ${schemas}`);
      console.log(`  ${JSON.stringify(json).substring(0, 500)}`);
    }
  }
}
main();