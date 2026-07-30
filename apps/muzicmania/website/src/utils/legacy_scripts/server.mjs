import browserSync from 'browser-sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bs = browserSync.create();

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Generate log filename
const date = new Date();
const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const randomSuffix = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
const logFile = path.join(logDir, `server-${dateStr}-${randomSuffix}.log`);

// Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[36m',
    yellow: '\x1b[33m',
    gray: '\x1b[90m',
};

function formatTime() {
    return new Date().toLocaleTimeString('es-ES', { hour12: false });
}

function log(message, type = 'INFO') {
    const timestamp = formatTime();
    const cleanMessage = message.replace(/\x1b\[[0-9;]*m/g, '');
    const fileLine = `[${timestamp}] [${type}] ${cleanMessage}\n`;

    // Console
    let color = colors.green;
    if (type === 'REQ') color = colors.blue;
    console.log(
        `${colors.gray}[${timestamp}]${colors.reset} ${color}[${type}]${colors.reset} ${message}`
    );

    // File - SAFE TO ENABLE NOW (BrowserSync won't watch this folder)
    fs.appendFile(logFile, fileLine, (err) => {
        if (err) console.error('Log error:', err);
    });
}

console.log(`${colors.green}>>> SERVIDOR MANIA (BrowserSync) ACTIVADO...${colors.reset}`);

// BrowserSync Configuration
bs.init(
    {
        server: {
            baseDir: path.join(__dirname, '..'),
            directory: false,
        },
        port: 5500,
        host: 'localhost', // Force localhost preference
        ui: false, // Disable UI for speed
        notify: false, // Disable popup notifications in browser
        open: false, // Don't auto-open
        logLevel: 'silent', // Handle logging manually

        // CRITICAL: Explicitly watch ONLY these files
        files: [
            path.join(__dirname, '../*.html'),
            path.join(__dirname, '../*.css'),
            path.join(__dirname, '../scripts/**/*.js'),
            path.join(__dirname, '../scripts/**/*.mjs'),
            path.join(__dirname, '../content/**/*.css'),
            path.join(__dirname, '../content/**/*.svg'),
        ],

        // CRITICAL: Explicitly ignore these
        watchOptions: {
            ignored: [
                'node_modules',
                'logs',
                '**/*.log',
                '.git',
                'scripts/server.mjs', // Don't reload on server script changes
            ],
            ignoreInitial: true, // Don't trigger changes on startup
        },

        middleware: [
            function (req, res, next) {
                log(`${req.method} ${req.url}`, 'REQ');
                next();
            },
        ],
    },
    (err, bsInstance) => {
        if (err) return console.error(err);
        log(`Server Running at http://localhost:5500`, 'SYSTEM');
        log(`Logs saving to: logs/${path.basename(logFile)}`, 'SYSTEM');
    }
);
