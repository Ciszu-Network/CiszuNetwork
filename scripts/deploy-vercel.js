'use strict';

/**
 * deploy-vercel.js — Deploy local a Vercel de una web de Ciszu Network.
 *
 * Replica el flujo del workflow `deploy-*.yml` sin depender de GitHub Actions:
 * enlaza el proyecto Vercel desde la raíz del monorepo y despliega en producción.
 *
 * Uso:
 *   node scripts/deploy-vercel.js <proyecto>      # usa VERCEL_TOKEN del entorno
 *   $env:VERCEL_TOKEN = "..."; node scripts/deploy-vercel.js ciszunetworkpage
 *
 * Proyectos válidos (ver ACTIONS_RUNNERS_SYSTEM.md):
 *   ciszunetworkpage | ciszukoantonypage | ciszubot | muzicmania
 *
 * Notas:
 *   - `vercel link` se ejecuta desde la raíz del monorepo; cada proyecto Vercel tiene su
 *     `rootDirectory` configurado (projects/<x>/website) y se auto-detecta.
 *   - `vercel --prod --archive=tgz` espera al build remoto (verde al final).
 *   - El token NUNCA va hardcodeado ni en logs; solo `process.env.VERCEL_TOKEN`.
 */

const { execSync } = require('node:child_process');

const PROJECTS = new Set(['ciszunetworkpage', 'ciszukoantonypage', 'ciszubot', 'muzicmania']);

const project = process.argv[2];
if (!project || !PROJECTS.has(project)) {
  console.error('[deploy] Uso: node scripts/deploy-vercel.js <proyecto>');
  console.error(`[deploy] Válidos: ${[...PROJECTS].join(', ')}`);
  process.exit(1);
}

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error('[deploy] VERCEL_TOKEN no está en el entorno.');
  console.error('[deploy] Cargarlo desde .env.local (vault) sin imprimirlo, por ejemplo:');
  console.error('[deploy]   $env:VERCEL_TOKEN = (Select-String .env.local "^VERCEL_TOKEN\\s*=").Line.Split("=",2)[1].Trim()');
  process.exit(1);
}

function run(cmd) {
  console.log(`[deploy] > ${cmd.split(' --token=')[0]} --token=<oculto>`);
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
}

try {
  run(`vercel link --yes --project ${project} --token=${token}`);
  run(`vercel --prod --yes --archive=tgz --token=${token}`);
  console.log(`[deploy] OK: ${project} desplegado en producción`);
} catch (err) {
  console.error(`[deploy] FALLÓ el deploy de ${project}`);
  process.exit(1);
}
