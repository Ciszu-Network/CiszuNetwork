const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT, 'backups');
const RETENTION_DAYS = 30;

const DRY_RUN = process.argv.includes('--dry-run');

function pad2(n) { return String(n).padStart(2, '0'); }

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

function fetch(url, opts) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname, port: u.port, path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: () => Promise.resolve(data), json: () => { try { return JSON.parse(data); } catch { return data; } } }));
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function loadEnv() {
  const envPath = path.join(ROOT, 'services', 'supabase', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('  [!] .env no encontrado en services/supabase/');
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.replace(/\r\n/g, '\n').split('\n')) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

async function getConnectionString(env) {
  const token = env.SUPABASE_ACCESS_TOKEN;
  const password = env.SUPABASE_DB_PASSWORD;
  const ref = 'obwzzmbvkrcscqwptlqo';

  if (!token) {
    console.error('  [!] SUPABASE_ACCESS_TOKEN no encontrado en services/supabase/.env');
    return null;
  }
  if (!password) {
    console.error('  [!] SUPABASE_DB_PASSWORD no encontrado en services/supabase/.env');
    return null;
  }

  console.log('  [>>] Obteniendo config del pooler via Management API...');
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/database/pooler`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error(`  [!] Error obteniendo config del pooler: HTTP ${res.status}`);
    return null;
  }

  const data = await res.json();
  const pooler = Array.isArray(data) ? data[0] : data;
  if (!pooler || !pooler.db_host || !pooler.db_port || !pooler.db_user || !pooler.db_name) {
    console.error('  [!] No se pudo extraer la config del pooler de la respuesta');
    console.error('  ', JSON.stringify(data).slice(0, 500));
    return null;
  }
  const pw = encodeURIComponent(password);
  return `postgresql://${pooler.db_user}:${pw}@${pooler.db_host}:${pooler.db_port}/${pooler.db_name}`;
}

async function findPgDump() {
  const candidates = [
    'E:\\DaVinci\\PGTools\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
    'pg_dump',
  ];
  for (const c of candidates) {
    try {
      execSync(`"${c}" --version 2>nul`, { stdio: 'ignore' });
      return c;
    } catch { continue; }
  }
  return null;
}

async function main() {
  console.log('\n  === Backup de Base de Datos Supabase ===\n');

  const env = await loadEnv();
  const connStr = await getConnectionString(env);

  if (!connStr) {
    console.error('\n  [!] No se pudo obtener la connection string automáticamente.');
    console.error('  Soluciones:');
    console.error('  1. Asegúrate de que SUPABASE_ACCESS_TOKEN y SUPABASE_DB_PASSWORD son válidos en services/supabase/.env');
    console.error('  2. O ejecuta manualmente (datos en services/supabase/.env):');
    console.error('     pg_dump "postgresql://postgres.obwzzmbvkrcscqwptlqo:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres" -f backup.sql');
    console.error('  3. O desde el Dashboard: Connect → Session pooler → URI');
    process.exit(1);
  }

  const pgDump = await findPgDump();
  if (!pgDump) {
    console.error('\n  [!] pg_dump no encontrado. Instala PostgreSQL (https://www.postgresql.org/download/windows/)');
    console.error('  Asegúrate de marcar "pg_dump" durante la instalación.');
    process.exit(1);
  }

  if (!fs.existsSync(BACKUPS_DIR)) {
    if (!DRY_RUN) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    console.log(`  [+] Directorio de backups creado: ${BACKUPS_DIR}`);
  }

  const filename = `ciszu-db-${timestamp()}.sql`;
  const outputFile = path.join(BACKUPS_DIR, filename);

  if (DRY_RUN) {
    console.log(`  [DRY-RUN] Se ejecutaría: ${pgDump} "${connStr.replace(/:[^:@]+@/, ':*****@')}" -f "${outputFile}"`);
    return;
  }

  console.log('  [>>] Ejecutando pg_dump...');
  try {
    execSync(`"${pgDump}" "${connStr}" --no-owner --no-privileges -f "${outputFile}"`, { stdio: 'inherit', timeout: 300000 });
  } catch (err) {
    console.error(`  [!] Error en pg_dump: ${err.message}`);
    process.exit(1);
  }

  const stats = fs.statSync(outputFile);
  console.log(`  [OK] Backup guardado: ${outputFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  // Cleanup old backups
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;
  try {
    const files = fs.readdirSync(BACKUPS_DIR);
    for (const file of files) {
      if (!file.startsWith('ciszu-db-') || !file.endsWith('.sql')) continue;
      const filePath = path.join(BACKUPS_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        console.log(`  [--] Backup antiguo eliminado: ${file}`);
        deleted++;
      }
    }
  } catch (err) {
    console.error(`  [!] Error limpiando backups: ${err.message}`);
  }
  if (deleted === 0) console.log('  [--] No hay backups antiguos que eliminar');
  console.log(`\n  === Backup completado ===`);
}

main().catch(console.error);