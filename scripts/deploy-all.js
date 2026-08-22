'use strict';

const { execSync } = require('node:child_process');

const PROJECTS = ['ciszunetworkpage', 'ciszukoantonypage', 'ciszubot', 'muzicmania'];

const token = process.env.VERCEL_TOKEN;
if (!token) {
    console.error('[deploy-all] VERCEL_TOKEN no está en el entorno.');
    process.exit(1);
}

console.log(`[deploy-all] Iniciando despliegue masivo para ${PROJECTS.length} proyectos...\n`);

for (const project of PROJECTS) {
    console.log(`[deploy-all] ========================================`);
    console.log(`[deploy-all] Desplegando proyecto: ${project}`);
    console.log(`[deploy-all] ========================================`);

    try {
        execSync(`node scripts/deploy-vercel.js ${project}`, {
            stdio: 'inherit',
            cwd: process.cwd(),
        });
        console.log(`[deploy-all] OK: ${project} completado con éxito.\n`);
    } catch (err) {
        console.error(
            `[deploy-all] ERROR CRÍTICO: Falló el despliegue de ${project}. Deteniendo proceso.`
        );
        process.exit(1);
    }
}

console.log(
    '[deploy-all] ¡ÉXITO! Todos los proyectos fueron desplegados en producción correctamente.'
);
