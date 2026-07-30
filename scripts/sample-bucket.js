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
  if (!Array.isArray(data)) return { files: [], dirs: [] };
  
  let files = data.filter(i => i.id !== null).map(i => i.name);
  let dirs = data.filter(i => i.id === null).map(i => i.name);
  
  for (const dir of dirs) {
    const sub = await listRecursive(bucket, prefix + dir + '/');
    files = files.concat(sub.files);
    dirs = dirs.concat(sub.dirs);
  }
  return { files, dirs };
}

async function main() {
  console.log('Sampling files in ciszu-cdn...');
  const { files, dirs } = await listRecursive('ciszu-cdn', '');
  console.log('Total dirs: ' + dirs.length);
  console.log('Total files: ' + files.length);
  
  // Group by first directory
  const groups = {};
  for (const f of files) {
    const first = f.split('/')[0];
    groups[first] = (groups[first] || 0) + 1;
  }
  console.log('\nBy source:');
  for (const [src, count] of Object.entries(groups).sort((a,b) => b[1] - a[1])) {
    console.log('  ' + src + ': ' + count);
  }
  
  // Show some sample files
  console.log('\nSample files:');
  for (const f of files.slice(0, 20)) console.log('  ' + f);
}
main();