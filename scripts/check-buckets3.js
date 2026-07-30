const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/m)[1].trim().replace(/^["\']|["\']$/g, '');
const url = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

async function listWithPrefix(bucket, prefix) {
  let all = [];
  let offset = 0;
  while (true) {
    const r = await fetch(url + '/storage/v1/object/list/' + bucket, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 1000, offset, prefix })
    });
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) break;
    all = all.concat(data);
    offset += data.length;
  }
  return all;
}

async function main() {
  console.log('Listing with prefix "shared/icons/svg/":');
  const items = await listWithPrefix('ciszu-cdn', 'shared/icons/svg/');
  console.log('  Items: ' + items.length);
  for (const item of items.slice(0, 10)) {
    console.log('  - ' + item.name + ' (' + (item.metadata?.size || '?') + ' bytes)');
  }
  if (items.length > 10) console.log('  ... and ' + (items.length - 10) + ' more');
  
  console.log('\nListing ALL with prefix "":');
  const all = await listWithPrefix('ciszu-cdn', '');
  console.log('  Total items: ' + all.length);
  const dirs = all.filter(i => i.id === null);
  const files = all.filter(i => i.id !== null);
  console.log('  Directories: ' + dirs.length);
  console.log('  Files: ' + files.length);
  for (const item of files.slice(0, 10)) {
    console.log('  - ' + item.name);
  }
}
main();