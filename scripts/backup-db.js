// Add to root package.json scripts:
// "db:backup": "node scripts/backup-db.js"
// "db:backup:scheduled": "node scripts/backup-db.js --scheduled"

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT, 'backups');
const SUPABASE_DIR = path.join(ROOT, 'services', 'supabase');
const RETENTION_DAYS = 30;

const SCHEDULED = process.argv.includes('--scheduled');
const DRY_RUN = process.argv.includes('--dry-run');

function log(...args) {
  if (SCHEDULED) return;
  console.log(`[${new Date().toISOString()}]`, ...args);
}

function error(...args) {
  console.error(`[${new Date().toISOString()}] [!]`, ...args);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function timestamp() {
  const d = new Date();
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  const h = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const s = pad2(d.getSeconds());
  return `${y}${mo}${da}-${h}${mi}${s}`;
}

function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function run() {
  if (!checkSupabaseCLI()) {
    error('supabase CLI no está disponible. Asegúrate de tenerlo instalado y en el PATH.');
    process.exit(1);
  }

  if (!fs.existsSync(SUPABASE_DIR)) {
    error(`El directorio del proyecto Supabase no existe: ${SUPABASE_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(BACKUPS_DIR)) {
    log('Creando directorio de backups:', BACKUPS_DIR);
    if (!DRY_RUN) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
  }

  const filename = `supabase-db-${timestamp()}.sql`;
  const outputFile = path.join(BACKUPS_DIR, filename);

  if (DRY_RUN) {
    console.log(`[DRY-RUN] Se ejecutaría: supabase db dump --linked -f "${outputFile}"`);
  } else {
    log('Iniciando dump de la base de datos...');
    try {
      execSync(`supabase db dump --linked -f "${outputFile}"`, {
        cwd: SUPABASE_DIR,
        stdio: SCHEDULED ? 'ignore' : 'inherit',
      });
      const stats = fs.statSync(outputFile);
      log(`Backup completado: ${outputFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    } catch (err) {
      error('Error al hacer dump de la base de datos:', err.message);
      process.exit(1);
    }
  }

  // Cleanup backups older than RETENTION_DAYS
  if (!fs.existsSync(BACKUPS_DIR)) {
    if (!SCHEDULED) log('No hay directorio de backups que limpiar.');
    return;
  }

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;

  try {
    const files = fs.readdirSync(BACKUPS_DIR);
    for (const file of files) {
      if (!file.startsWith('supabase-db-') || !file.endsWith('.sql')) continue;
      const filePath = path.join(BACKUPS_DIR, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        if (DRY_RUN) {
          console.log(`[DRY-RUN] Se eliminaría backup antiguo: ${file}`);
        } else {
          fs.unlinkSync(filePath);
          log(`Backup antiguo eliminado: ${file}`);
        }
        deleted++;
      }
    }
  } catch (err) {
    error('Error al limpiar backups antiguos:', err.message);
  }

  if (deleted === 0 && !DRY_RUN) {
    log('No hay backups antiguos que eliminar.');
  }
}

run();
