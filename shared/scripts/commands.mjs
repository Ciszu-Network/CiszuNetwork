import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const json = process.argv.includes('--json');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const scripts = Object.entries(pkg.scripts || {}).sort(([a], [b]) => a.localeCompare(b));

const commandDir = path.join(root, '.opencode', 'command');
const opencode = fs.existsSync(commandDir)
  ? fs
      .readdirSync(commandDir)
      .filter((name) => name.endsWith('.md'))
      .sort()
      .map((file) => {
        const source = fs.readFileSync(path.join(commandDir, file), 'utf8');
        const description = source.match(/^description:\s*(.+)$/m)?.[1]?.trim() || 'sin descripción';
        return { name: file.replace(/\.md$/, ''), description };
      })
  : [];

if (json) {
  console.log(JSON.stringify({ scripts: Object.fromEntries(scripts), opencode, root }, null, 2));
} else {
  console.log(`CISZU COMMANDS — ${root}\n`);
  console.log('PNPM');
  for (const [name, command] of scripts) {
    console.log(`  ${name.padEnd(24)} ${command}`);
  }
  console.log('\nOPENCODE');
  for (const item of opencode) {
    console.log(`  /${item.name.padEnd(23)} ${item.description}`);
  }
  console.log('\nPOWERSHELL');
  console.log('  ciszuh / czhelp           ayuda del perfil portable');
  console.log('  doctor                    pnpm run doctor');
  console.log('  opsstatus                 pnpm ops:status (dry-run)');
  console.log('  opsdigest                 pnpm ops:digest (dry-run)');
  console.log('  cmds                      pnpm commands');
  console.log('  profile-reload            recarga el perfil');
  console.log('\nUsa `pnpm <script>` o `pnpm <script> -- --help` para ver argumentos.');
}
