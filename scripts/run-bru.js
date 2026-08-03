const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = path.resolve(__dirname, '..', 'apis', 'bruno');
const args = process.argv.slice(2);

// Seguridad: rechazar metacaracteres de shell en argumentos (previene inyección
// vía cmd /c en Windows — CodeQL: shell command built from environment values)
const UNSAFE = /[&|;<>^()`$"'*?[\]{}\\!]/;
const sanitized = [];
for (const arg of args) {
  if (UNSAFE.test(arg)) {
    console.error(`Argumento rechazado (caracteres de shell): ${arg}`);
    process.exit(1);
  }
  sanitized.push(arg);
}

const reportIdx = sanitized.indexOf('--reporter-json');
if (reportIdx !== -1 && sanitized[reportIdx + 1]) {
  const out = path.resolve(cwd, sanitized[reportIdx + 1]);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  sanitized[reportIdx + 1] = out;
}

const cmd = process.platform === 'win32' ? 'cmd.exe' : 'bru';
const cmdArgs = process.platform === 'win32' ? ['/c', 'bru', ...sanitized] : sanitized;
const result = spawnSync(cmd, cmdArgs, { cwd, stdio: 'inherit', shell: false });
process.exit(result.status ?? 1);
