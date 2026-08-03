const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = path.resolve(__dirname, '..', 'apis-client', 'bruno');
const args = process.argv.slice(2);

const reportIdx = args.indexOf('--reporter-json');
if (reportIdx !== -1 && args[reportIdx + 1]) {
  const out = path.resolve(cwd, args[reportIdx + 1]);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  args[reportIdx + 1] = out;
}

const cmd = process.platform === 'win32' ? 'cmd.exe' : 'bru';
const cmdArgs = process.platform === 'win32' ? ['/c', 'bru', ...args] : args;
const result = spawnSync(cmd, cmdArgs, { cwd, stdio: 'inherit', shell: false });
process.exit(result.status ?? 1);
