const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/m)[1].trim().replace(/^["\']|["\']$/g, '');
const url = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

async function listRecursive(bucket, prefix) {
  const r = await fetch(url + '/storage/v1/object/list/' + bucket, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 10000, offset: 0, prefix })
  });
  const data = await r.json();
  if (!Array.isArray(data)) return [];
  
  let files = data.filter(i => i.id !== null).map(i => i.name);
  let dirs = data.filter(i => i.id === null).map(i => i.name);
  
  for (const dir of dirs) {
    const subFiles = await listRecursive(bucket, prefix + dir + '/');
    files = files.concat(subFiles);
  }
  return files;
}

async function main() {
  console.log('Counting all files in ciszu-cdn...');
  const files = await listRecursive('ciszu-cdn', '');
  console.log('Total files: ' + files.length);
  if (files.length > 0) {
    const shared = files.filter(f => f.startsWith('shared/')).length;
    const content = files.filter(f => f.startsWith('content/')).length;
    console.log('  shared/: ' + shared);
    console.log('  content/: ' + content);
  }
}
main();