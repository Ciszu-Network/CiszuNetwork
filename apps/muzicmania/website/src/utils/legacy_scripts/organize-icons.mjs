import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcBase = path.resolve(__dirname, '../debug/download');
const destBase = path.resolve(__dirname, '../content/icons/svg-src');

const config = [
    {
        lib: 'remix',
        prefix: 'ri',
        paths: [
            {
                src: 'remix_unzipped/RemixIcon-4.2.0/icons',
                pattern: /-line\.svg$/,
                style: 'outline',
            },
            {
                src: 'remix_unzipped/RemixIcon-4.2.0/icons',
                pattern: /-fill\.svg$/,
                style: 'filled',
            },
        ],
    },
    {
        lib: 'tabler',
        prefix: 'tb',
        paths: [
            {
                src: 'tabler_unzipped/tabler-icons-2.47.0/icons',
                pattern: /\.svg$/,
                style: 'outline',
                exclude: /-filled\.svg$/,
            },
            {
                src: 'tabler_unzipped/tabler-icons-2.47.0/icons',
                pattern: /-filled\.svg$/,
                style: 'filled',
                exclude: null,
            },
        ],
    },
    {
        lib: 'fontawesome',
        prefix: 'fa',
        paths: [
            {
                src: 'fontawesome_unzipped/Font-Awesome-6.5.1/svgs/regular',
                pattern: /\.svg$/,
                style: 'outline',
            },
            {
                src: 'fontawesome_unzipped/Font-Awesome-6.5.1/svgs/solid',
                pattern: /\.svg$/,
                style: 'filled',
            },
        ],
    },
];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyIcons() {
    config.forEach((libCfg) => {
        libCfg.paths.forEach((pCfg) => {
            const srcDir = path.join(srcBase, pCfg.src);
            if (!fs.existsSync(srcDir)) {
                console.warn(`⚠️ Directorio no encontrado: ${srcDir}`);
                return;
            }

            const destDir = path.join(destBase, pCfg.style);
            ensureDir(destDir);

            // Recursivo para Remix (tiene categorías)
            const processDir = (currentDir) => {
                const entries = fs.readdirSync(currentDir, { withFileTypes: true });
                entries.forEach((entry) => {
                    const fullPath = path.join(currentDir, entry.name);
                    if (entry.isDirectory()) {
                        processDir(fullPath);
                    } else if (entry.name.endsWith('.svg')) {
                        if (pCfg.pattern.test(entry.name)) {
                            if (pCfg.exclude && pCfg.exclude.test(entry.name)) return;

                            // Nueva nomenclatura: [lib]-[style]-[name].svg
                            const cleanName = entry.name
                                .replace(pCfg.pattern, '')
                                .replace(pCfg.exclude || '', '');
                            const newName = `${libCfg.prefix}-${pCfg.style}-${cleanName}.svg`;
                            const destPath = path.join(destDir, newName);

                            fs.copyFileSync(fullPath, destPath);
                        }
                    }
                });
            };

            processDir(srcDir);
        });
    });
    console.log('✅ Organización de iconos completada.');
}

copyIcons();
