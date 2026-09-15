// One-off: descarga SVGs oficiales (simple-icons) y los sube al CDN.
const fs = require('fs');
const path = require('path');

for (const line of fs.readFileSync(
  path.join(__dirname, '../../../muzicmania/website/.env.local'),
  'utf8',
).split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const SOURCES = [
  { file: 'cisco.svg', url: 'https://unpkg.com/simple-icons@11/icons/cisco.svg' },
  { file: 'ibm.svg', url: 'https://unpkg.com/simple-icons@11/icons/ibm.svg' },
  { file: 'microsoft.svg', url: 'https://unpkg.com/simple-icons@11/icons/microsoft.svg' },
  { file: 'hp.svg', url: 'https://unpkg.com/simple-icons@11/icons/hp.svg' },
];

const CDN_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/ciszu-cdn/assets/brand-logos/';
const PUBLIC_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/ciszu-cdn/assets/brand-logos/';

(async () => {
  for (const src of SOURCES) {
    const res = await fetch(src.url);
    if (!res.ok) {
      console.log('❌ download', src.file, res.status);
      continue;
    }
    const svg = await res.text();
    const up = await fetch(CDN_BASE + src.file, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'image/svg+xml',
        'x-upsert': 'true',
        'Cache-Control': 'public, max-age=604800',
      },
      body: svg,
    });
    const check = await fetch(PUBLIC_BASE + src.file);
    console.log(up.status, 'upload +', check.status, 'public GET →', src.file);
  }
})();
