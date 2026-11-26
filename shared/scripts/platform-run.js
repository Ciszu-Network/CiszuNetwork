#!/usr/bin/env node
/**
 * Ejecuta comandos del monorepo en Windows o Linux sin depender del shell.
 *
 * Uso:
 *   node scripts/platform-run.js dev start all
 *   node scripts/platform-run.js dev status
 *   node scripts/platform-run.js dev console
 *   node scripts/platform-run.js profile install
 *   node scripts/platform-run.js vault:bw
 */

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const isWindows = process.platform === 'win32';
const [, , command, ...args] = process.argv;

function run(program, commandArgs, options = {}) {
  const result = spawnSync(program, commandArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    ...options,
  });
  if (result.error) {
    console.error(`No se pudo ejecutar ${program}: ${result.error.message}`);
    process.exit(1);
  }
  process.exit(result.status === null ? 1 : result.status);
}

function powershell(script, scriptArgs = []) {
  const shell = isWindows ? 'powershell' : 'pwsh';
  run(shell, [
    '-NoLogo',
    '-NoProfile',
    ...(isWindows ? ['-ExecutionPolicy', 'Bypass'] : []),
    '-File',
    script,
    ...scriptArgs,
  ]);
}

function linuxDev() {
  const action = args[0] || 'status';
  if (action === 'console') {
    const target = path.join(root, 'test', 'website', 'debug', 'dev_console.ps1');
    powershell(path.join(root, 'shared', 'scripts', 'linux', 'console-run.ps1'), ['-Target', target]);
  }
  const mapped = action === 'all' ? ['start', 'all'] : args;
  run('bash', [path.join(root, 'shared', 'scripts', 'linux', 'dev.sh'), ...mapped]);
}

function windowsDev() {
  const action = args[0] || 'status';
  const web = args[1] || (action === 'start' || action === 'stop' ? 'all' : undefined);
  const scriptArgs = ['-Action', action];
  if (web) scriptArgs.push('-Web', web);
  powershell(path.join(root, 'test', 'website', 'debug', 'dev_console.ps1'), scriptArgs);
}

switch (command) {
  case 'dev':
    if (isWindows) windowsDev();
    else linuxDev();
    break;
  case 'profile': {
    const action = args[0] || 'install';
    if (isWindows) {
      const scriptArgs = action === 'check' ? ['-Check'] : [];
      powershell(path.join(root, 'shared', 'powershell', 'install-profile.ps1'), scriptArgs);
    } else {
      run('bash', [path.join(root, 'shared', 'shell', 'install.sh')]);
    }
    break;
  }
  case 'vault:bw':
    powershell(path.join(root, 'scripts', 'vault-bitwarden.ps1'), args);
    break;
  default:
    console.error('Uso: node scripts/platform-run.js <dev|profile|vault:bw> [...]');
    process.exit(2);
}
