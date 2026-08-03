/**
 * Script para convertir documentos TXT a MD
 * Mantiene el mismo contenido, solo aplica formato markdown básico:
 * - Líneas de separación (-------) se convierten a ---
 * - Los títulos se mantienen como están (ya usan MAYÚSCULAS)
 *
 * Uso: node scripts/txt2md.js [ruta_docs]
 * Ejemplo: node scripts/txt2md.js docs
 * Ejemplo: node scripts/txt2md.js projects/ciszubot/docs
 */

const fs = require('fs');
const path = require('path');

const docsPath = process.argv[2];
if (!docsPath) {
  console.error('Uso: node scripts/txt2md.js <ruta_docs>');
  process.exit(1);
}

const txtDir = path.resolve(docsPath, 'txt');
const mdDir = path.resolve(docsPath, 'md');

if (!fs.existsSync(txtDir)) {
  console.error(`No existe: ${txtDir}`);
  process.exit(1);
}

if (!fs.existsSync(mdDir)) {
  fs.mkdirSync(mdDir, { recursive: true });
}

const files = fs.readdirSync(txtDir).filter(f => f.endsWith('.txt'));

let converted = 0;
let skipped = 0;

for (const file of files) {
  const txtPath = path.join(txtDir, file);
  const mdName = file.replace('.txt', '.md');
  const mdPath = path.join(mdDir, mdName);

  let content = fs.readFileSync(txtPath, 'utf8');

  // Replace long separator lines with markdown horizontal rule
  content = content.replace(/-{10,}/g, '\n---\n');

  // Remove trailing whitespace
  content = content.split('\n').map(l => l.trimEnd()).join('\n');

  // Ensure proper line ending
  content = content.replace(/\r\n/g, '\n').trimEnd() + '\n';

  fs.writeFileSync(mdPath, content, 'utf8');
  converted++;
  console.log(`  ✓ ${file} → ${mdName}`);
}

console.log(`\nConvertidos: ${converted} archivos (${skipped} omitidos)`);