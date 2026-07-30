const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/m)[1].trim().replace(/^["\']|["\']$/g, '');
const url = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

async function listAll(bucket) {
  let all = [];
  let offset = 0;
  while (true) {
    const r = await fetch(url + '/storage/v1/object/list/' + bucket, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 1000, offset, prefix: '' })
    });
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data.map(o => o.name));
    offset += data.length;
  }
  return all;
}

async function main() {
  console.log('ciszu-cdn objects:');
  const names = await listAll('ciszu-cdn');
  console.log('  Count: ' + names.length);
  if (names.length > 0) {
    console.log('  First 5: ' + names.slice(0, 5).join(', '));
    // Check if upload test file exists
    const testFiles = names.filter(n => n.includes('test-upload'));
    console.log('  Test files: ' + testFiles.length);
  }
}
main();