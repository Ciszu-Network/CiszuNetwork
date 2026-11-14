import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const json = process.argv.includes('--json');
const results = [];

function add(name, status, detail) {
  results.push({ name, status, detail });
}

function commandVersion(command, args = ['--version']) {
  const result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', [command, ...args].join(' ')], { cwd: root, encoding: 'utf8', timeout: 10000 })
    : spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 10000 });
  if (result.error || result.status !== 0) return null;
  return (result.stdout || result.stderr || '').trim().split(/\r?\n/)[0] || 'ok';
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const done = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(250);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

async function main() {
  const node = process.versions.node;
  add('Node.js', Number(node.split('.')[0]) >= 24 ? 'ok' : 'warn', `v${node} (requiere >=24)`);

  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  add('pnpm', pkg.packageManager?.startsWith('pnpm@') ? 'ok' : 'warn', pkg.packageManager || 'no definido');
  add('git', commandVersion('git') ? 'ok' : 'warn', commandVersion('git') || 'no encontrado');
  add('GitHub CLI', commandVersion('gh') ? 'ok' : 'warn', commandVersion('gh') || 'no encontrado');
  add('Wrangler', commandVersion('wrangler') ? 'ok' : 'warn', commandVersion('wrangler') || 'no encontrado');
  add('Docker', commandVersion('docker') ? 'ok' : 'warn', commandVersion('docker') || 'no encontrado');

  const envLocal = fs.existsSync(path.join(root, '.env.local'));
  const vault = fs.existsSync(path.join(root, 'services', 'supabase', '.env'));
  add('Entorno local', envLocal ? 'ok' : 'warn', envLocal ? '.env.local presente' : 'falta .env.local');
  add('Vault local', vault ? 'ok' : 'warn', vault ? 'services/supabase/.env presente' : 'falta vault local');

  const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout?.trim();
  const dirty = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).stdout?.trim();
  add('Rama Git', branch ? 'ok' : 'warn', branch || 'sin repositorio');
  add('Working tree', dirty ? 'warn' : 'ok', dirty ? `${dirty.split(/\r?\n/).length} archivo(s) sin commit` : 'limpio');

  const workflows = fs.existsSync(path.join(root, '.github', 'workflows'))
    ? fs.readdirSync(path.join(root, '.github', 'workflows')).filter((name) => name.endsWith('.yml')).length
    : 0;
  add('Workflows', workflows > 0 ? 'ok' : 'warn', `${workflows} archivos`);

  const ports = await Promise.all([3000, 3001, 3002, 3003].map(async (port) => ({ port, open: await portOpen(port) })));
  for (const { port, open } of ports) {
    add(`Puerto ${port}`, open ? 'info' : 'ok', open ? 'ocupado (dev server activo)' : 'libre');
  }

  for (const drive of ['C', 'E']) {
    try {
      const stat = fs.statfsSync(`${drive}:\\`);
      const free = (stat.bfree * stat.bsize) / 1024 ** 3;
      add(`Disco ${drive}`, free < 2 ? 'warn' : 'ok', `${free.toFixed(1)} GB libres`);
    } catch {
      add(`Disco ${drive}`, 'info', 'no disponible');
    }
  }

  if (json) {
    console.log(JSON.stringify({ root, results }, null, 2));
    return;
  }

  const icons = { ok: 'OK', warn: 'WARN', info: 'INFO' };
  console.log(`CISZU DOCTOR — ${root}\n`);
  for (const item of results) {
    console.log(`[${icons[item.status] || 'INFO'}] ${item.name}: ${item.detail}`);
  }
  const warnings = results.filter((item) => item.status === 'warn').length;
  console.log(`\n${warnings ? `${warnings} aviso(s)` : 'Todo en orden'}.`);
}

main().catch((error) => {
  console.error(`[doctor] ${error.message}`);
  process.exit(1);
});
