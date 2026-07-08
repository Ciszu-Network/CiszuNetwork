import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MuzicMania CLI Configuration
const CONFIG = {
    title: '🪐 MUZICMANIA PROFESSIONAL CLI v1.0',
    version: '2026-BETA',
    author: 'Ciszuko Antony',
};

const clear = () => process.stdout.write('\x1Bc');

const runCommand = (command, spinnerLabel) => {
    return new Promise((resolve) => {
        const spinner = ora(spinnerLabel).start();
        exec(command, (error, stdout, stderr) => {
            if (error) {
                spinner.fail(chalk.red(`Error: ${error.message}`));
                resolve(false);
                return;
            }
            spinner.succeed(chalk.green('¡Completado con éxito!'));
            if (stdout) console.log(chalk.gray(stdout));
            resolve(true);
        });
    });
};

const mainMenu = async () => {
    clear();
    console.log(
        chalk.cyan.bold(`
    ${CONFIG.title}
    ${chalk.gray('----------------------------------------')}
    ${chalk.blue('Version:')} ${CONFIG.version} | ${chalk.blue('Dev:')} ${CONFIG.author}
    `)
    );

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: '¿Qué deseas hacer hoy, Commander?',
            choices: [
                { name: chalk.green('🚀 Iniciar Servidor de Desarrollo (Vite)'), value: 'dev' },
                { name: chalk.yellow('🎨 Gestionar Iconos (Build Completo)'), value: 'icons' },
                { name: chalk.green('✨ Optimizar SVGs (SVGO)'), value: 'optimize' },
                { name: chalk.magenta('📄 Exportar Documentación (PDF/Docs)'), value: 'docs' },
                { name: chalk.blue('🛡️ Verificar Integridad del Proyecto'), value: 'verify' },
                new inquirer.Separator(),
                { name: chalk.red('🛑 Salir'), value: 'exit' },
            ],
        },
    ]);

    switch (action) {
        case 'dev':
            console.log(chalk.cyan('\nIniciando motor de renderizado...'));
            exec('npm run dev', (err) => {
                if (err) console.error(err);
            });
            console.log(chalk.green('✔ Servidor de Vite en ejecución.'));
            break;

        case 'icons':
            await runCommand(
                'npm run icons:full-build',
                'Procesando, optimizando y generando sprites de iconos...'
            );
            break;

        case 'optimize':
            await runCommand(
                'npx svgo -f content/icons/src -o content/icons/optimized',
                'Optimizando quirúrgicamente todos los archivos SVG...'
            );
            break;

        case 'docs':
            await runCommand(
                'npm run docs:export',
                'Generando archivos de documentación profesional...'
            );
            break;

        case 'verify':
            await runCommand('npx tsc --noEmit', 'Validando tipos y sintaxis del código...');
            break;

        case 'exit':
            process.exit(0);
            break;
    }

    if (action !== 'dev') {
        const { again } = await inquirer.prompt([
            { type: 'confirm', name: 'again', message: '¿Deseas realizar otra tarea?' },
        ]);
        if (again) mainMenu();
        else process.exit(0);
    }
};

mainMenu();
