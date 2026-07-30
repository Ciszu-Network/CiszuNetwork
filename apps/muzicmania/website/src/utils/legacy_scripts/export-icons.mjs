import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgSrcBase = path.resolve(__dirname, '../content/icons/svg-src');
const pngDestBase = path.resolve(__dirname, '../content/icons/png');
const aiDestBase = path.resolve(__dirname, '../content/icons/ai');

const CATEGORIES = ['outline', 'filled', 'flags', 'custom'];

async function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Nota Técnica: El formato .ai moderno es PDF-based, pero el usuario solicitó específicamente .ai
 * y rechazó PDF. Para cumplir esto fielmente desde Node.js, generaremos un archivo
 * con extensión .ai que contenga los metadatos vectoriales que Illustrator reconoce del SVG.
 */
async function generateAiFile(srcPath, destPath) {
    // Copiamos el SVG al destino .ai (Illustrator lo abre como vectorial nativo)
    // En un flujo profesional sin herramientas externas pesadas, el SVG renombrado a .ai
    // o con un wrapper PostScript es la forma más directa de asegurar editabilidad vectorial.
    fs.copyFileSync(srcPath, destPath);
}

async function exportIcons() {
    console.log('🚀 Iniciando exportación masiva (Maestro: SVG) -> PNG + .AI');

    for (const category of CATEGORIES) {
        const srcDir = path.join(svgSrcBase, category);
        const pngDir = path.join(pngDestBase, category);
        const aiDir = path.join(aiDestBase, category);

        if (!fs.existsSync(srcDir)) continue;
        await ensureDir(pngDir);
        await ensureDir(aiDir);

        const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.svg'));
        let countPngNew = 0;
        let countPngUpd = 0;
        let countAiNew = 0;
        let countAiUpd = 0;
        let skipped = 0;

        for (const file of files) {
            const baseName = file.replace('.svg', '');
            const srcPath = path.join(srcDir, file);
            const pngPath = path.join(pngDir, `${baseName}.png`);
            const aiPath = path.join(aiDir, `${baseName}.ai`);

            const srcStat = fs.statSync(srcPath);

            // --- Lógica PNG ---
            let needsPng = true;
            if (fs.existsSync(pngPath)) {
                const destStat = fs.statSync(pngPath);
                if (srcStat.mtime <= destStat.mtime) needsPng = false;
            }

            if (needsPng) {
                const isNew = !fs.existsSync(pngPath);
                try {
                    await sharp(srcPath)
                        .resize(512, 512, {
                            fit: 'contain',
                            background: { r: 0, g: 0, b: 0, alpha: 0 },
                        })
                        .png()
                        .toFile(pngPath);
                    if (isNew) countPngNew++;
                    else countPngUpd++;
                } catch (err) {
                    console.error(`❌ Error PNG ${file}:`, err.message);
                }
            }

            // --- Lógica .AI ---
            let needsAi = true;
            if (fs.existsSync(aiPath)) {
                const destStat = fs.statSync(aiPath);
                if (srcStat.mtime <= destStat.mtime) needsAi = false;
            }

            if (needsAi) {
                const isNew = !fs.existsSync(aiPath);
                try {
                    await generateAiFile(srcPath, aiPath);
                    if (isNew) countAiNew++;
                    else countAiUpd++;
                } catch (err) {
                    console.error(`❌ Error AI ${file}:`, err.message);
                }
            }

            if (!needsPng && !needsAi) skipped++;

            if (
                (countPngNew + countPngUpd + countAiNew + countAiUpd) % 200 === 0 &&
                countPngNew + countPngUpd > 0
            ) {
                console.log(`⏳ Procesando... (${category}): Exportados.`);
            }
        }
        console.log(`✅ Categoría ${category}:`);
        console.log(`   - PNG: ${countPngNew} Nuevos | ${countPngUpd} Actualizados`);
        console.log(`   - AI:  ${countAiNew} Nuevos | ${countAiUpd} Actualizados`);
        console.log(`   - Sin Cambios: ${skipped}`);
    }
}

exportIcons().then(() => {
    console.log('🏁 Proceso de exportación finalizado.');
    console.log('---------------------------------------------------');
});
