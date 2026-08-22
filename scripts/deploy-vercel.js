'use strict';

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
    process.exit(1);
}

function run(cmd) {
    console.log(`[deploy] > ${cmd.split(' --token=')[0]} --token=<oculto>`);
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
}

try {
    // 1. Vinculamos el proyecto al entorno de Vercel
    run(`vercel link --yes --project ${project} --token=${token}`);

    // 2. Precompilamos localmente para generar la salida optimizada sin enviar gigabytes por la red
    run(`vercel build --prod --yes --token=${token}`);

    // 3. Desplegamos utilizando el artefacto precompilado local
    run(`vercel deploy --prebuilt --prod --yes --token=${token}`);

    console.log(`[deploy] OK: ${project} desplegado en producción`);
} catch (err) {
    console.error(`[deploy] FALLÓ el deploy de ${project} D:`);
    process.exit(1);
}
console.log(`Listo bb <3`);
