import SVGSprite from 'svg-sprite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// RUTA ABSOLUTA CORREGIDA
const inputDir = path.resolve(__dirname, '../content/icons/svg-src');
const outputDir = path.resolve(__dirname, '../content/icons/sprites');

console.log(`📂 Carpeta base: ${inputDir}`);
console.log(`📂 Carpeta salida: ${outputDir}`);

const types = ['flags', 'outline', 'filled', 'color'];

async function generateSprite(type) {
    const srcDir = path.join(inputDir, type);
    console.log(`🔍 Buscando iconos en: ${srcDir}`);
    if (!fs.existsSync(srcDir)) {
        console.log(`⚠️ Directorio no existe: ${srcDir}`);
        return;
    }

    const files = fs.readdirSync(srcDir).filter((file) => file.endsWith('.svg'));
    if (files.length === 0) {
        console.log(`⚠️ No hay archivos SVG en: ${srcDir}`);
        return;
    }

    console.log(`🚀 Procesando ${type}: ${files.length} iconos...`);

    // Configurar transforamciones SVGO según el tipo
    const svgoPlugins =
        type === 'color' || type === 'flags'
            ? [{ name: 'removeViewBox', active: false }] // Mantener colores
            : [
                  { name: 'removeViewBox', active: false },
                  { name: 'removeAttrs', params: { attrs: '(stroke|fill)' } },
              ]; // Eliminar colores para iconos monocromáticos

    const spriter = new SVGSprite({
        dest: outputDir,
        mode: {
            symbol: {
                dest: '.',
                sprite: type === 'filled' ? 'sprite-filled.svg' : `sprite-${type}.svg`, // Renamed to force cache break
            },
        },
        shape: {
            id: { generator: (name) => path.basename(name, '.svg') },
            transform: [{ svgo: { plugins: svgoPlugins } }],
        },
    });

    files.forEach((file) => {
        const filePath = path.join(srcDir, file);
        spriter.add(filePath, file, fs.readFileSync(filePath, 'utf-8'));
    });

    return new Promise((resolve, reject) => {
        console.log(`🔨 Compilando ${type}...`);
        spriter.compile((error, result) => {
            if (error) return reject(error);

            let filesWritten = 0;
            for (const mode in result) {
                for (const resource in result[mode]) {
                    const res = result[mode][resource];
                    fs.mkdirSync(path.dirname(res.path), { recursive: true });
                    fs.writeFileSync(res.path, res.contents);
                    console.log(`💾 Escrito: ${res.path} (${res.contents.length} bytes)`);
                    filesWritten++;
                }
            }
            resolve(filesWritten);
        });
    });
}

(async () => {
    try {
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        for (const type of types) {
            const count = await generateSprite(type);
            console.log(`✨ Finalizado ${type}: ${count || 0} archivos generados.`);
        }
    } catch (err) {
        console.error('❌ Error:', err);
    }
})();
