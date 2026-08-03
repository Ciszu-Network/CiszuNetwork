import prompts from 'prompts';
import pc from 'picocolors';
import { spawn, ChildProcess } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import net from 'net';
import { dbMenu } from './dbManager';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Adjusted rootDir definition: src/scripts -> src -> root (two levels up)
const rootDir = join(__dirname, '..', '..');

let nextProcess: ChildProcess | null = null;
let activeProcess: ChildProcess | null = null; 

// Helper for dark purple using 256-color ANSI codes
const darkPurple = (str: string) => `\u001b[38;5;93m${str}\u001b[0m`;

// Helper to check if a port is in use
const isPortBusy = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err: any) => {
            if (err.code === 'EADDRINUSE') resolve(true);
            else resolve(false);
        });
        server.once('listening', () => {
            server.close();
            resolve(false);
        });
        server.listen(port);
    });
};

let portStatus = false;
const updatePortStatus = async () => {
    portStatus = await isPortBusy(3000); // Next.js default port
};

const isNextRunning = () => (nextProcess !== null && !nextProcess.killed) || portStatus;

const runCommand = (command: string, args: string[], cwd = rootDir, captureOutput = false): Promise<number | null> => {
    return new Promise((resolve, reject) => {
        // Consola de desarrollo local e interactiva: el operador escribe los comandos
        // (dev server, herramientas del monorepo). No recibe input de usuario final.
        // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
        const child = spawn(command, args, {
            cwd,
            stdio: captureOutput ? 'pipe' : 'inherit',
            shell: true,
        });
        activeProcess = child;

        if (captureOutput && child.stdout && child.stderr) {
            child.stdout.on('data', (data) => console.log(data.toString()));
            child.stderr.on('data', (data) => console.error(data.toString()));
        }

        child.on('close', (code) => {
            activeProcess = null;
            resolve(code);
        });

        child.on('error', (err) => {
            activeProcess = null;
            reject(err);
        });
    });
};

const ASCII_ART = `${darkPurple('   ███╗   ███╗██╗   ██╗███████╗██╗ ██████╗███╗   ███╗ █████╗ ███╗   ██╗██╗ █████╗ ')}
${darkPurple('   ████╗ ████║██║   ██║╚══███╔╝██║██╔════╝████╗ ████║██╔══██╗████╗  ██║██║██╔══██╗')}
${darkPurple('   ██╔████╔██║██║   ██║  ███╔╝ ██║██║     ██╔████╔██║███████║██╔██╗ ██║██║███████║')}
${darkPurple('   ██║╚██╔╝██║██║   ██║ ███╔╝  ██║██║     ██║╚██╔╝██║██╔══██║██║╚██╗██║██║██╔══██║')}
${darkPurple('   ██║ ╚═╝ ██║╚██████╔╝███████╗██║╚██████╗██║ ╚═╝ ██║██║  ██║██║ ╚████║██║██║  ██║')}
${darkPurple('   ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝')}`;

const showHeader = () => {
    console.clear();
    console.log(ASCII_ART);
    const serverStatus = isNextRunning() ?
        pc.bgGreen(pc.black(' [🟢 ON]  ')) :
        pc.bgRed(pc.white(' [🔴 OFF] '));

    console.log(darkPurple('   ╔═══════════════════════════════════════════════════════════════════════════╗'));
    console.log(`${darkPurple('   ║ ')}${pc.white('MUZICMANIA DEV-TS CONSOLE ')}${pc.dim('v2.0 NEXT.JS 15')}${darkPurple(' | ')}${pc.white('Estado: ')}${serverStatus}${darkPurple('     ║')}`);
    console.log(darkPurple('   ╚═══════════════════════════════════════════════════════════════════════════╝'));
};

const waitForKey = (message = 'Presiona cualquier tecla para volver al menú...') => {
    return new Promise<void>((resolve) => {
        console.log(pc.dim(`\n${message}`));
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.once('data', () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve();
            });
        } else {
            resolve();
        }
    });
};

const stopNext = async (silent = false) => {
    if (nextProcess || (await isPortBusy(3000))) {
        if (!silent) console.log(pc.yellow('\n[INFO] Deteniendo servidor Next.js...'));
        try {
            if (nextProcess && nextProcess.pid) {
                await runCommand('taskkill', ['/pid', nextProcess.pid.toString(), '/f', '/t']);
            } else {
                await runCommand('taskkill', ['/f', '/im', 'node.exe', '/fi', 'WINDOWTITLE eq next*']);
            }
            if (!silent) console.log(pc.green('[EXITO] Servidor detenido correctamente.'));
        } catch (e: any) {
            if (!silent) console.error(pc.red('[ERROR] No se pudo detener el proceso: ' + e.message));
        }
        nextProcess = null;
        activeProcess = null;
        await updatePortStatus();
        return true;
    }
    if (!silent) console.log(pc.dim('\n[INFO] El servidor no está en ejecución.'));
    return false;
};

const handleLogStream = (): Promise<void> => {
    return new Promise((resolve) => {
        activeProcess = nextProcess;
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            readline.emitKeypressEvents(process.stdin);

            const onKeypress = async (_str: string, key: any) => {
                if (key && key.ctrl && key.name === 'c') {
                    process.stdin.removeListener('keypress', onKeypress);
                    process.stdin.setRawMode(false);
                    process.stdin.pause();

                    console.log(pc.cyan('\n\n--- CONTROL DEL SERVIDOR NEXT.JS ---'));
                    const { action } = await prompts({
                        type: 'select',
                        name: 'action',
                        message: '¿Qué deseas hacer?',
                        choices: [
                            { title: '🛑 Detener servidor y volver al menú', value: 'stop' },
                            { title: '📄 Mantener en segundo plano e ir al menú', value: 'keep' },
                            { title: '❌ Salir de la consola (Cierra todo)', value: 'exit' },
                            { title: '🔙 Continuar viendo logs', value: 'continue' },
                        ],
                        hint: '',
                    });

                    if (action === 'stop') {
                        await stopNext(true);
                        console.log(pc.green('[INFO] Servidor detenido. Volviendo al menú...'));
                        resolve();
                    } else if (action === 'keep') {
                        console.log(pc.green('[INFO] Servidor en segundo plano.'));
                        activeProcess = null;
                        resolve();
                    } else if (action === 'exit') {
                        await stopNext(true);
                        console.log(pc.magenta('\n¡Cerrando todo! 👋'));
                        setTimeout(() => process.exit(0), 500);
                    } else {
                        process.stdin.setRawMode(true);
                        process.stdin.resume();
                        process.stdin.on('keypress', onKeypress);
                    }
                }
            };

            process.stdin.on('keypress', onKeypress);
        }

        const onExit = () => {
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
                process.stdin.pause();
            }
            nextProcess = null;
            activeProcess = null;
            updatePortStatus().then(resolve);
        };

        if (nextProcess) {
            nextProcess.once('close', onExit);
            nextProcess.once('error', onExit);
        } else {
            resolve();
        }
    });
};

const startNext = async () => {
    if (isNextRunning()) {
        console.log(pc.yellow('\n[INFO] El servidor ya está corriendo.'));
        const { action } = await prompts({
            type: 'select',
            name: 'action',
            message: '¿Qué deseas hacer?',
            choices: [
                { title: '👀 Ver Logs', value: 'logs' },
                { title: '🔄 Reiniciar', value: 'restart' },
                { title: '🛑 Detener', value: 'stop' },
                { title: '⬅️ Volver al menú', value: 'back' },
            ],
            hint: '',
        });

        if (action === 'logs') return handleLogStream();
        if (action === 'restart') await stopNext();
        else if (action === 'stop') { await stopNext(); return; }
        else return;
    }

    console.log(pc.cyan('\nIniciando Next.js 15 Dev Server...\n'));
    nextProcess = spawn('npm', ['run', 'dev'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true,
    });

    await new Promise((r) => setTimeout(r, 1000));
    await updatePortStatus();
    showHeader();
    return handleLogStream();
};

const gitPush = async () => {
    console.log(pc.cyan('\nGIT DEPLOYMENT - TS EDITION\n'));
    const { message } = await prompts({
        type: 'text',
        name: 'message',
        message: 'Mensaje del commit:',
        validate: (v) => v.length > 0 || 'El mensaje es requerido',
    });

    if (message) {
        await runCommand('git', ['add', '.']);
        await runCommand('git', ['commit', '-m', `"${message}"`]);
        await runCommand('git', ['push', 'origin', 'main']);
        console.log(pc.green('\n[EXITO] Cambios subidos correctamente.'));
    }
};

const main = async () => {
    let exit = false;

    process.on('SIGINT', async () => {
        if (activeProcess && activeProcess.pid) {
            spawn('taskkill', ['/pid', activeProcess.pid.toString(), '/f', '/t'], { stdio: 'ignore', shell: true });
            activeProcess = null;
        } else {
            process.exit(0);
        }
    });

    while (!exit) {
        await updatePortStatus();
        showHeader();

        const response = await prompts({
            type: 'select',
            name: 'value',
            message: pc.cyan('» ') + 'Selecciona una opción:',
            choices: [
                { title: pc.white('[1].') + pc.green(' Servidor Next.js (Dev)'), value: 'server' },
                { title: pc.white('[2].') + pc.yellow(' Reiniciar Servidor'), value: 'restart' },
                { title: pc.white('[3].') + pc.cyan(' Git Push (Deploy)'), value: 'git' },
                { title: pc.white('[4].') + pc.magenta(' Gestión de Base de Datos'), value: 'db' },
                { title: pc.white('[5].') + pc.red(' Salir'), value: 'exit' },
            ],
        });

        if (!response.value || response.value === 'exit') {
            exit = true;
            if (nextProcess) await stopNext(true);
            break;
        }

        switch (response.value) {
            case 'server': await startNext(); break;
            case 'restart': await stopNext(true); await startNext(); break;
            case 'git': await gitPush(); await waitForKey(); break;
            case 'db': await dbMenu(); break;
        }
    }
};

main();
