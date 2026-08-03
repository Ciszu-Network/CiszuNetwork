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
  'projects/ciszu/website/.env.local',
  'projects/ciszukoantony/website/.env.local',
  'projects/muzicmania/website/.env.local',
  'projects/ciszubot/website/.env.local',
  'projects/ciszubot/discord-bot/.env',
];

const [newAnon, newSvc] = process.argv.slice(2);

if (!newAnon || !newSvc) {
  console.log('\n  Uso: node scripts/update-env-keys.js <anon-key> <service-role-key>\n');
  console.log('  Las keys se obtienen desde:');
  console.log('  https://supabase.com/dashboard/project/obwzzmbvkrcscqwptlqo/settings/api\n');
  process.exit(1);
}

// Backup de los .env actuales antes de rotar (regla: backups complejos -> archives/backups/envs/)
function pad2(n) { return String(n).padStart(2, '0'); }
const now = new Date();
const stamp = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}`;
const backupDir = path.join(ROOT, 'archives', 'backups', 'envs', stamp);
let backedUp = 0;
for (const rel of ENV_FILES) {
  const src = path.resolve(ROOT, rel);
  if (!fs.existsSync(src)) continue;
  const dst = path.join(backupDir, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  backedUp++;
}
console.log(`\n  [BK] ${backedUp} .env respaldados en archives/backups/envs/${stamp}/`);

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