#!/usr/bin/env node

/**
 * Instala el hook de git que auto-sincroniza los certificados cuando cambian
 * archivos en `shared/docs/certificados/`.
 *
 * IMPORTANTE: NUNCA sobrescribe el hook existente. El hook de `.git/hooks/pre-commit`
 * del repo ejecuta secretlint + gitleaks (repo público) y borrarlo sería un
 * riesgo de seguridad. En su lugar se AÑADE un bloque marcado que invoca este
 * sincronizador; si el bloque ya existe, no se duplica.
 *
 * Uso: pnpm sync:certificates:git-hook
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = path.resolve(__dirname);
// git-hooks -> scripts -> website -> ciszukoantony -> projects -> raíz del monorepo
const MONOREPO_ROOT = path.resolve(SCRIPT_DIR, '../../../../..');
const HOOK_SOURCE = path.join(SCRIPT_DIR, 'pre-commit');
const HOOK_DEST = path.join(MONOREPO_ROOT, '.git', 'hooks', 'pre-commit');
const MARKER_START = '# >>> ciszukoantony certificates sync >>>';
const MARKER_END = '# <<< ciszukoantony certificates sync <<<';

if (!fs.existsSync(HOOK_SOURCE)) {
  console.error('❌ Hook source not found:', HOOK_SOURCE);
  process.exit(1);
}

const syncPath = HOOK_SOURCE.replace(/\\/g, '/');
const block = `${MARKER_START}\nnode "${syncPath}" || exit 1\n${MARKER_END}\n`;

let existing = '';
if (fs.existsSync(HOOK_DEST)) {
  existing = fs.readFileSync(HOOK_DEST, 'utf8');
}

if (existing.includes(MARKER_START)) {
  console.log('✅ El hook ya está instalado (bloque encontrado). Nada que hacer.');
  process.exit(0);
}

let content;
if (existing) {
  // Añadir al final del hook existente (secretlint/gitleaks siguen ejecutándose).
  content = existing.trimEnd() + '\n\n' + block;
} else {
  content = '#!/bin/sh\n' + block;
}

fs.writeFileSync(HOOK_DEST, content, { mode: 0o755 });
console.log('✅ Bloque de sincronización añadido al hook:', HOOK_DEST);
console.log('   El hook existente (secretlint/gitleaks) se conserva intacto.');
console.log('   Sincroniza certificados cuando shared/docs/certificados/ cambia.');
