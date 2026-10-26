/**
 * sync-commands.mjs — regenera el catálogo de comandos de la web desde el
 * código real del bot. Delega en el generador canónico del monorepo para que
 * el prebuild de la web y el script raíz produzcan exactamente el mismo
 * catálogo (incluida la categoría +18).
 *
 * Uso manual: node sync-commands.mjs
 *             node sync-commands.mjs --check
 */
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, '..', '..', '..');
const ROOT_SCRIPT = join(MONOREPO_ROOT, 'scripts', 'sync-bot-commands.mjs');
const BOT_SRC = join(__dirname, '..', 'discord-bot', 'src');

if (existsSync(ROOT_SCRIPT) && existsSync(BOT_SRC)) {
  const result = spawnSync(process.execPath, [ROOT_SCRIPT, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: MONOREPO_ROOT,
  });
  process.exit(result.status ?? 1);
}

console.log('sync-commands: sin acceso al código del bot, se mantiene el catálogo actual.');
