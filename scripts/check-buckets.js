const SUPABASE_URL = 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/m)[1].trim().replace(/^["\']|["\']$/g, '');

async function listAll(bucket) {
  let all = [];
  let offset = 0;
  while (true) {
    const r = await fetch(SUPABASE_URL + '/storage/v1/object/list/' + bucket, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } })
    });
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data.map(o => o.name));
    offset += data.length;
  }
  return all;
}

async function main() {
  for (const b of ['ciszu-cdn', 'avatars']) {
    console.log('Checking bucket: ' + b);
    const r = await fetch(SUPABASE_URL + '/storage/v1/bucket/' + b, { headers: { apikey: key } });
    console.log('  Exists: ' + r.ok);
    if (r.ok) {
      const info = await r.json();
      console.log('  Public: ' + info.public);
      const names = await listAll(b);
      console.log('  Objects: ' + names.length);
      if (names.length > 0) {
        console.log('  First 5: ' + names.slice(0, 5).join(', '));
        if (names.length <= 20) console.log('  All: ' + names.join(', '));
      }
    }
  }
}
main();