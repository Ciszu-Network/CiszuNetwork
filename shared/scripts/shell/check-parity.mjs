#!/usr/bin/env node
/**
 * Verifica la paridad de comandos entre el perfil PowerShell (Windows) y el
 * shell POSIX (Linux). Falla si un comando compartido falta en alguno.
 *
 *   node shared/scripts/shell/check-parity.mjs
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..', '..');
const manifest = JSON.parse(readFileSync(join(root, 'shared/shell/commands.json'), 'utf8'));
const posix = readFileSync(join(root, 'shared/shell/aliases.sh'), 'utf8');
const pwsh = readFileSync(join(root, 'shared/powershell/CiszuNetwork.Profile.ps1'), 'utf8');

const posixNames = new Set(
  [...posix.matchAll(/^\s*([A-Za-z0-9_-]+)\s*\(\)\s*\{/gm)].map((m) => m[1])
);
const pwshNames = new Set(
  [...pwsh.matchAll(/^\s*function\s+([A-Za-z0-9_-]+)/gm)].map((m) => m[1])
);

const missing = [];
for (const name of manifest.shared) {
  if (!posixNames.has(name)) missing.push(`POSIX: ${name}`);
  if (!pwshNames.has(name)) missing.push(`PowerShell: ${name}`);
}

if (missing.length) {
  console.error('Comandos compartidos que faltan:');
  for (const item of missing) console.error(`  - ${item}`);
  process.exit(1);
}

console.log(`Paridad OK: ${manifest.shared.length} comandos compartidos.`);
console.log(`Windows-only: ${manifest.windowsOnly.length} | Linux-only: ${manifest.linuxOnly.length}`);
