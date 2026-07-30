const fs = require('fs');
const env = fs.readFileSync('E:\\Ciszu Network\\services\\supabase\\.env.local', 'utf8');
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/m)[1].trim().replace(/^["\']|["\']$/g, '');
const url = 'https://obwzzmbvkrcscqwptlqo.supabase.co';

async function main() {
  const testContent = 'test-' + Date.now();
  const testPath = 'shared/icons/svg/test-upload-' + Date.now() + '.svg';

  // Upload
  console.log('Uploading: ' + testPath);
  const r = await fetch(url + '/storage/v1/object/ciszu-cdn/' + testPath, {
    method: 'PUT',
    headers: { apikey: key, 'Content-Type': 'image/svg+xml', 'x-upsert': 'true' },
    body: testContent
  });
  console.log('Upload status: ' + r.status + ' ' + r.statusText);
  const text = await r.text();
  console.log('Response: ' + text.substring(0, 200));

  // List bucket
  const r2 = await fetch(url + '/storage/v1/object/list/ciszu-cdn', {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit: 10, offset: 0 })
  });
  const data = await r2.json();
  console.log('List status: ' + r2.status);
  console.log('Objects count: ' + (Array.isArray(data) ? data.length : JSON.stringify(data).substring(0, 200)));

  // Direct fetch
  const r3 = await fetch(url + '/storage/v1/object/public/ciszu-cdn/' + testPath);
  console.log('Public access: ' + r3.status + ' - ' + (await r3.text()).substring(0, 100));
}
main();