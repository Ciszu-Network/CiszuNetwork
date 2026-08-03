const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = path.resolve(__dirname, '..', 'apis', 'bruno');
const args = process.argv.slice(2);

// CodeQL (js/command-line-injection): se evita cmd.exe por completo.
// En Windows se resuelve el binario JS real de bru a traves del shim
// .cmd de pnpm y se ejecuta con node (sin shell intermedio).
function resolveBruBin() {
  // PNPM_HOME puede no estar propagado en la sesion (pnpm setup lo define
  // solo en shells nuevos): fallback al directorio global por defecto.
  const defaultPnpmHome = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'pnpm')
    : null;
  const dirs = [
    process.env.PNPM_HOME,
    defaultPnpmHome,
    ...(process.env.PATH || '').split(path.delimiter),
  ];
  for (const dir of dirs) {
    if (!dir) continue;
    const shim = path.join(dir, process.platform === 'win32' ? 'bru.cmd' : 'bru');
    if (!fs.existsSync(shim)) continue;

    if (process.platform !== 'win32') return { exec: shim, args: [] };

    const content = fs.readFileSync(shim, 'utf8');
    const m = content.match(/node\s+"([^"]+\.js)"/) || content.match(/node\s+'([^']+\.js)'/);
    if (m && fs.existsSync(m[1])) return { exec: process.execPath, args: [m[1]] };
  }
  return null;
}

const bin = resolveBruBin();
if (!bin) {
  console.error('  [!] No se encontro el binario de bru (instala con: pnpm add -g @usebruno/cli)');
  process.exit(1);
}

const reportIdx = args.indexOf('--reporter-json');
if (reportIdx !== -1 && args[reportIdx + 1]) {
  const out = path.resolve(cwd, args[reportIdx + 1]);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  args[reportIdx + 1] = out;
}

const result = spawnSync(bin.exec, [...bin.args, ...args], { cwd, stdio: 'inherit', shell: false });
process.exit(result.status ?? 1);
