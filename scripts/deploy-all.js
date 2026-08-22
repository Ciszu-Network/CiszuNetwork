'use strict';

/**
 * deploy-all.js — Deploy local masivo a Vercel de todas las webs de Ciszu Network.
 *
 * Recorre y ejecuta secuencialmente el script de deploy de cada proyecto,
 * asegurando que compartan el mismo token de entorno y deteniéndose si alguno falla.
 *
 * Uso:
 *   $env:VERCEL_TOKEN = "..."; node scripts/deploy-all.js
 */

const { execSync } = require('node:child_process');

const PROJECTS = ['ciszunetworkpage', 'ciszukoantonypage', 'ciszubot', 'muzicmania'];

const token = process.env.VERCEL_TOKEN;
if (!token) {
    console.error('[deploy-all] VERCEL_TOKEN no está en el entorno.');
    console.error('[deploy-all] Cargarlo primero, por ejemplo:');
    console.error(
        '[deploy-all] $env:VERCEL_TOKEN = (Select-String -Path .env.local -Pattern "^VERCEL_TOKEN\\s*=").Line.Split("=",2)[1].Trim()'
    );
    process.exit(1);
}

console.log(`[deploy-all] Iniciando despliegue masivo para ${PROJECTS.length} proyectos...\n`);

for (const project of PROJECTS) {
    console.log(`[deploy-all] ========================================`);
    console.log(`[deploy-all] Desplegando proyecto: ${project}`);
    console.log(`[deploy-all] ========================================`);

    try {
        // Ejecuta el script individual pasándole el proyecto actual
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
