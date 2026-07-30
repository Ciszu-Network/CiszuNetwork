/**
 * update-env-keys.js — Actualiza las keys de Supabase en todos los .env del workspace
 * 
 * Uso: node scripts/update-env-keys.js <new-anon-key> <new-service-role-key>
 * 
 * Ejemplo:
 *   node scripts/update-env-keys.js sb_publishable_XXXXX sb_secret_XXXXX
 * 
 * Después de rotar las keys en el Dashboard de Supabase:
 *   https://supabase.com/dashboard/project/obwzzmbvkrcscqwptlqo/settings/api
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILES = [
  'services/supabase/.env.local',
  'services/supabase/.env',
  'apps/website/.env.local',
  'apps/ciszukoantony/website/.env.local',
  'apps/muzicmania/website/.env.local',
  'apps/ciszubot/website/.env.local',
  'apps/ciszubot/discord-bot/.env',
];

const [newAnon, newSvc] = process.argv.slice(2);

if (!newAnon || !newSvc) {
  console.log('\n  Uso: node scripts/update-env-keys.js <anon-key> <service-role-key>\n');
  console.log('  Las keys se obtienen desde:');
  console.log('  https://supabase.com/dashboard/project/obwzzmbvkrcscqwptlqo/settings/api\n');
  process.exit(1);
}

let count = 0;
for (const rel of ENV_FILES) {
  const fp = path.resolve(ROOT, rel);
  if (!fs.existsSync(fp)) continue;
  
  let content = fs.readFileSync(fp, 'utf8');
  let changed = false;

  const anonPatterns = [
    /^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m,
    /^VITE_SUPABASE_ANON_KEY=.*$/m,
    /^SUPABASE_ANON_KEY=.*$/m,
  ];
  const svcPatterns = [
    /^SUPABASE_SERVICE_ROLE_KEY=.*$/m,
    /^VITE_SUPABASE_SERVICE_ROLE_KEY=.*$/m,
  ];

  for (const pat of anonPatterns) {
    if (pat.test(content)) {
      const keyName = content.match(pat)[0].split('=')[0];
      content = content.replace(pat, keyName + '=' + newAnon);
      changed = true;
    }
  }
  for (const pat of svcPatterns) {
    if (pat.test(content)) {
      const keyName = content.match(pat)[0].split('=')[0];
      content = content.replace(pat, keyName + '=' + newSvc);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log('  [OK] ' + rel);
    count++;
  }
}

console.log('\n  ' + count + ' archivos actualizados.\n');