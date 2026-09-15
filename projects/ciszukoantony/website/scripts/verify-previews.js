// Verificación temporal: cada doc en certificates.ts → preview mapeado → 200 en CDN.
const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.join(__dirname, '..');

const data = fs.readFileSync(path.join(SITE_ROOT, 'src/data/certificates.ts'), 'utf8');
const names = [...data.matchAll(/files:\s*\[\s*\{\s*name:\s*'([^']+)'/g)].map((m) => m[1]);

const manifest = fs.readFileSync(
  path.join(SITE_ROOT, 'src/data/certificates.previews.ts'),
  'utf8',
);
const map = {};
for (const m of manifest.matchAll(/'((?:[^'\\]|\\.)*)':\s*'((?:[^'\\]|\\.)*)'/g)) {
  map[m[1].replace(/\\'/g, "'")] = m[2].replace(/\\'/g, "'");
}

console.log('documentos en certificates.ts:', names.length);
const sinPreview = names.filter((n) => !map[n]);
console.log('sin preview mapeado:', sinPreview.length);
sinPreview.forEach((n) => console.log('  ✗', n));

// Cargar env para el base del CDN (mismo orden que upload-previews.js)
function loadEnv() {
  const candidates = [
    path.join(SITE_ROOT, '.env.local'),
    path.join(SITE_ROOT, '../../muzicmania/website/.env.local'),
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const CDN = process.env.NEXT_PUBLIC_CDN_URL && !process.env.NEXT_PUBLIC_CDN_URL.includes('localhost')
  ? process.env.NEXT_PUBLIC_CDN_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/ciszu-cdn';

(async () => {
  const unicos = [...new Set(names.map((n) => map[n]).filter(Boolean))];
  const base = CDN + '/shared/docs/certificados/previews/';
  let bad = 0;
  for (let i = 0; i < unicos.length; i += 8) {
    const rs = await Promise.all(
      unicos.slice(i, i + 8).map(async (p) => {
        const r = await fetch(base + p.split('/').map(encodeURIComponent).join('/')).catch(() => ({ status: 0 }));
        return [r.status, p];
      }),
    );
    rs.forEach(([s, p]) => {
      if (s !== 200) {
        bad++;
        console.log('  ✗ HTTP', s, p);
      }
    });
  }
  console.log(
    bad === 0
      ? `✅ Todos los ${unicos.length} previews únicos de certificates.ts responden 200 en el CDN`
      : `❌ ${bad} previews rotos`,
  );
})();
