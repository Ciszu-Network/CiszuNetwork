/**
 * Script para convertir documentos MD a DOCX y PDF
 * Usa pandoc + weasyprint para formato profesional.
 *
 * Uso: node scripts/md2office.js <ruta_docs>
 * Ejemplo: node scripts/md2office.js docs
 * Ejemplo: node scripts/md2office.js apps/ciszubot/docs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PANDOC = 'C:\\Users\\fplay\\AppData\\Local\\Microsoft\\WinGet\\Packages\\JohnMacFarlane.Pandoc_Microsoft.Winget.Source_8wekyb3d8bbwe\\pandoc-3.10\\pandoc.exe';

const docsPath = process.argv[2];
if (!docsPath) { console.error('Uso: node scripts/md2office.js <ruta_docs>'); process.exit(1); }

const mdDir = path.resolve(docsPath, 'md');
const docxDir = path.resolve(docsPath, 'docx');
const pdfDir = path.resolve(docsPath, 'pdf');

if (!fs.existsSync(mdDir)) { console.error(`No existe: ${mdDir}`); process.exit(1); }
if (!fs.existsSync(docxDir)) fs.mkdirSync(docxDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// GUIDELINES, RULES y ACTA tienen composición manual en WORD/PDF que no se puede automatizar
const skipFiles = ['GUIDELINES.md', 'RULES.md', 'ACTA.md'];
const files = fs.readdirSync(mdDir).filter(f => f.endsWith('.md') && !skipFiles.includes(f));

let success = 0, fail = 0;

for (const file of files) {
  const mdPath = path.join(mdDir, file);
  const base = file.replace('.md', '');
  const docxPath = path.join(docxDir, base + '.docx');
  const pdfPath = path.join(pdfDir, base + '.pdf');

  const content = fs.readFileSync(mdPath, 'utf8');
  if (!content || content.includes('\u0000') || content.trim().length < 10) {
    console.log(`  ⚠ ${file}: contenido inválido, omitido`);
    continue;
  }

  try {
    // MD → DOCX
    execSync(`"${PANDOC}" "${mdPath}" -f markdown -t docx -o "${docxPath}"`, { stdio: 'pipe' });
    console.log(`  ✓ DOCX: ${base}.docx`);

    // DOCX → PDF via weasyprint (pandoc convierte docx a html internamente)
    try {
      execSync(`"${PANDOC}" "${docxPath}" -f docx -t pdf --pdf-engine=weasyprint -o "${pdfPath}"`, { stdio: 'pipe', timeout: 120000 });
      console.log(`  ✓ PDF:  ${base}.pdf`);
    } catch (pdfErr) {
      // Try from markdown directly
      try {
        execSync(`"${PANDOC}" "${mdPath}" -f markdown -t pdf --pdf-engine=weasyprint -o "${pdfPath}"`, { stdio: 'pipe', timeout: 120000 });
        console.log(`  ✓ PDF:  ${base}.pdf (desde MD)`);
      } catch (pdfErr2) {
        console.log(`  ⚠ PDF:  ${base}.pdf falló (${pdfErr2.message.substring(0, 60)})`);
      }
    }

    success++;
  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message.substring(0, 80)}`);
    fail++;
  }
}

console.log(`\nResultado: ${success} docs procesados, ${fail} errores`);
console.log(`DOCX: ${docxDir}`);
console.log(`PDF:  ${pdfDir}`);