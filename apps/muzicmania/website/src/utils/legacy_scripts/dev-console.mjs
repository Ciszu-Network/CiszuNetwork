import prompts from 'prompts';
import pc from 'picocolors';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

let viteProcess = null;

// Helper to run commands
const runCommand = (command, args, cwd = rootDir, captureOutput = false) => {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            stdio: captureOutput ? 'pipe' : 'inherit',
            shell: true,
        });

        if (captureOutput) {
            child.stdout.on('data', (data) => console.log(data.toString()));
            child.stderr.on('data', (data) => console.error(data.toString()));
        }

        child.on('close', (code) => {
            resolve(code);
        });

        child.on('error', (err) => {
            reject(err);
        });

        return child;
    });
};

const showHeader = () => {
    console.clear();
    console.log(
        pc.magenta(
            '   ╔═══════════════════════════════════════════════════════════════════════════╗'
        )
    );
    console.log(
        pc.magenta('   ║        ') +
            pc.cyan('MUZICMANIA DEV CONSOLE') +
            pc.magenta(' - Edición Profesional Node.js              ║')
    );
    console.log(
        pc.magenta(
            '   ╚═══════════════════════════════════════════════════════════════════════════╝'
        )
    );
    console.log('');
};

const startVite = async () => {
    if (viteProcess) {
        console.log(pc.yellow('\n[INFO] El servidor ya está corriendo. Reiniciando...'));
        try {
            process.kill(viteProcess.pid); // Attempt to kill cleanly first
        } catch (e) {}
        // On Windows sometimes we need taskkill to be sure
        spawn('taskkill', ['/pid', viteProcess.pid, '/f', '/t']);
        viteProcess = null;
    }

    console.log(pc.cyan('\nIniciando Servidor Vite (HMR)...\n'));
    console.log(pc.green('[INFO]') + ' Puerto: ' + pc.cyan('http://localhost:5500'));
    console.log(
        pc.green('[INFO]') +
            ' Presiona ' +
            pc.yellow('Ctrl+C') +
            ' para detener el servidor y volver al menú.'
    );

    // We launch vite directly.
    // Uses shell: true in runCommand, so we can run 'npm'
    // But to control it better, we might want to spawn 'vite' directly if available,
    // or just keep using npm run vite:start which we defined in package.json

    return new Promise((resolve) => {
        viteProcess = spawn('npm', ['run', 'vite:start'], {
            cwd: rootDir,
            stdio: 'inherit',
            shell: true,
        });

        viteProcess.on('close', (code) => {
            viteProcess = null;
            resolve();
        });
    });
};

const gitPush = async () => {
    console.log(pc.cyan('\nGIT PUSH DEPLOYMENT\n'));
    const { message } = await prompts({
        type: 'text',
        name: 'message',
        message: 'Mensaje del commit:',
        validate: (value) => (value.length > 0 ? true : 'El mensaje es requerido'),
    });

    if (message) {
        console.log(pc.green('\n[GIT] Agregando archivos...'));
        await runCommand('git', ['add', '.']);
        console.log(pc.green('[GIT] Realizando commit...'));
        await runCommand('git', ['commit', '-m', `"${message}"`]);
        console.log(pc.green('[GIT] Subiendo a main...'));
        await runCommand('git', ['push', 'origin', 'main']);
        console.log(pc.green('\n[EXITO] Cambios subidos correctamente!'));
    }
};

const exportDocs = async () => {
    console.log(pc.cyan('\nEXPORTAR DOCUMENTACIÓN\n'));

    // Document Selection
    const docResponse = await prompts({
        type: 'select',
        name: 'doc',
        message: 'Selecciona qué documento exportar:',
        choices: [
            { title: 'README.md', value: 'README.md' },
            { title: 'DOCUMENTATION.md', value: 'DOCUMENTATION.md' },
            { title: 'CHANGELOG.md', value: 'CHANGELOG.md' },
            { title: 'LICENSE.md', value: 'LICENSE.md' },
            { title: 'ABOUT.md', value: 'ABOUT.md' },
            { title: 'FAQ.md', value: 'FAQ.md' },
            { title: 'HELP.md', value: 'HELP.md' },
            { title: 'SUPPORT.md', value: 'SUPPORT.md' },
            { title: 'CONTACT.md', value: 'CONTACT.md' },
            { title: 'CREDITS.md', value: 'CREDITS.md' },
            { title: 'GUIDELINES.md', value: 'GUIDELINES.md' },
            { title: 'POLICY.md', value: 'POLICY.md' },
            { title: 'RULES.md', value: 'RULES.md' },
            { title: 'SECURITY.md', value: 'SECURITY.md' },
            { title: 'TERMS_AND_CONDITIONS.md', value: 'TERMS_AND_CONDITIONS.md' },
            { title: 'TEAM.md', value: 'TEAM.md' },
            { title: pc.yellow('TODOS LOS DOCUMENTOS'), value: 'ALL' },
            { title: pc.red('Cancelar'), value: 'cancel' },
        ],
        hint: 'Usa flechas y Enter',
    });

    if (!docResponse.doc || docResponse.doc === 'cancel') return;

    // Format Selection
    const formatResponse = await prompts({
        type: 'select',
        name: 'format',
        message: 'Selecciona el formato:',
        choices: [
            { title: 'TXT solamente', value: 'txt' },
            { title: 'PDF solamente', value: 'pdf' },
            { title: 'Word/DOCX solamente', value: 'docx' },
            { title: 'TXT + PDF', value: 'txt_pdf' },
            { title: 'TXT + DOCX', value: 'txt_docx' },
            { title: 'PDF + DOCX', value: 'pdf_docx' },
            { title: pc.yellow('TODOS (TXT + PDF + DOCX)'), value: 'all' },
            { title: pc.red('Cancelar'), value: 'cancel' },
        ],
        hint: 'Usa flechas y Enter',
    });

    if (!formatResponse.format || formatResponse.format === 'cancel') return;

    console.log(
        pc.green(`\n[INFO] Generando ${docResponse.doc} en formato ${formatResponse.format}...`)
    );
    await runCommand('node', [
        'scripts/export-docs.js',
        `--file="${docResponse.doc}"`,
        `--format="${formatResponse.format}"`,
    ]);
};

const showGuide = () => {
    console.log(pc.cyan('\nGUÍA DE USO - DEVELOPMENT & DEBUG CONSOLE\n'));
    console.log(
        pc.white('  [A] Server Vite: ') +
            pc.dim('Inicia servidor local con HMR (Hot Module Replacement).')
    );
    console.log(
        pc.white('  [B] Git Push:    ') +
            pc.dim('Flujo completo de add -> commit -> push a GitHub.')
    );
    console.log(
        pc.white('  [C] Docs:        ') + pc.dim('Convierte archivos Markdown a PDF/Word/TXT.')
    );
    console.log(
        pc.white('  [D] Instalar:    ') + pc.dim('Ejecuta "npm install" para reparar dependencias.')
    );
    console.log(
        pc.white('  [E] Iconos Full: ') +
            pc.dim('Proceso completo: Organizar -> Convertir -> Sprite.')
    );
    console.log(pc.white('  [F] Iconos Man.: ') + pc.dim('Solo convertir SVG a PNG/AI (Manual).'));
    console.log(
        pc.white('  [G] CMD Shell:   ') +
            pc.dim('Abre una terminal interactiva dentro de la consola.')
    );
    console.log(
        pc.white('  [H] CSS Watch:   ') + pc.dim('Monitorea cambios en archivos CSS (Nodemon).')
    );
    console.log('');
};

const commandConsole = async () => {
    console.log(pc.cyan('\nCONSOLA INTERACTIVA (Escribe "exit" para salir)\n'));
    let inConsole = true;
    while (inConsole) {
        const { cmd } = await prompts({
            type: 'text',
            name: 'cmd',
            message: pc.green('$'),
        });

        if (!cmd || cmd.trim() === 'exit' || cmd.trim() === 'menu') {
            inConsole = false;
            break;
        }

        try {
            await runCommand(cmd, [], rootDir);
        } catch (e) {
            console.error(pc.red('Error ejecutando comando: ' + e.message));
        }
    }
};

const main = async () => {
    let exit = false;

    while (!exit) {
        showHeader();

        const response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Selecciona una opción:',
            choices: [
                { title: 'Server         ' + pc.dim('Iniciar Vite Server'), value: 'server' },
                { title: 'Git Push       ' + pc.dim('Subir cambios a GitHub'), value: 'git-push' },
                {
                    title: 'Docs Export    ' + pc.dim('Generar Documentación (PDF/Word)'),
                    value: 'docs',
                },
                {
                    title: 'Install Deps   ' + pc.dim('Instalar Dependencias (npm)'),
                    value: 'install',
                },
                {
                    title: 'Icons Admin    ' + pc.dim('Gestión de Iconos (Build/Convert)'),
                    value: 'icons-menu',
                },
                { title: 'Console CMD    ' + pc.dim('Consola Interactiva'), value: 'console' },
                { title: 'CSS Watch      ' + pc.dim('Monitor CSS (Nodemon)'), value: 'css' },
                { title: 'Ayuda/Guía     ' + pc.dim('Ver manual de uso'), value: 'guide' },
                { title: 'Salir          ' + pc.dim('Cerrar consola'), value: 'exit' },
            ],
            initial: 0,
            hint: 'Usa flechas ↑ ↓ y Enter',
        });

        if (!response.value) {
            // Ctrl+C in menu
            exit = true;
            break;
        }

        try {
            switch (response.value) {
                case 'server':
                    await startVite();
                    break;

                case 'git-push':
                    await gitPush();
                    break;

                case 'docs':
                    await exportDocs();
                    break;

                case 'install':
                    console.log(pc.cyan('\nInstalando Dependencias...\n'));
                    await runCommand('npm', ['install']);
                    break;

                case 'icons-menu':
                    const iconAction = await prompts({
                        type: 'select',
                        name: 'action',
                        message: 'Gestión de Iconos:',
                        choices: [
                            { title: 'Full Build (Organize + Convert + Sprite)', value: 'full' },
                            { title: 'Manual Export (Solo AI/PNG)', value: 'manual' },
                            { title: 'Volver', value: 'back' },
                        ],
                    });
                    if (iconAction.action === 'full') {
                        console.log(pc.cyan('\nGenerando Iconos (Completo)...\n'));
                        await runCommand('npm', ['run', 'icons:full-build']);
                    } else if (iconAction.action === 'manual') {
                        console.log(pc.cyan('\nExportando Iconos Manualmente...\n'));
                        await runCommand('npm', ['run', 'icons:convert']);
                    }
                    break;

                case 'console':
                    await commandConsole();
                    break;

                case 'css':
                    console.log(pc.cyan('\nIniciando CSS Monitor (Nodemon)...\n'));
                    await runCommand('npx', [
                        'nodemon',
                        '--watch',
                        '*.css',
                        '--ext',
                        'css',
                        '--exec',
                        '"echo CSS Modificado! Recargando..."',
                    ]);
                    break;

                case 'guide':
                    showGuide();
                    break;

                case 'exit':
                    exit = true;
                    console.log(pc.magenta('\n¡Hasta luego! 👋'));
                    break;
            }
        } catch (error) {
            console.error(pc.red(`\nError: ${error.message}`));
        }

        if (
            !exit &&
            response.value !== 'server' &&
            response.value !== 'console' &&
            response.value !== 'css'
        ) {
            console.log(pc.dim('\nPresiona Enter para continuar...'));
            await prompts({ type: 'invisible', name: 'pause' });
        }
    }
};

main();
