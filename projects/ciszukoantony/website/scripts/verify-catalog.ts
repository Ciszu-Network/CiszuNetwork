/* Verificación del catálogo de certificados.
 *
 * Comprueba, contra los datos declarados y los archivos reales:
 *   1. Cero títulos genéricos ("Certificate #373", "Course 109", ...).
 *   2. Cero referencias de catálogo (CKO-*) duplicadas.
 *   3. Cada documento con fecha verificable la declara.
 *   4. Cada archivo declarado existe en disco y tiene preview mapeada.
 *   5. Cada preview mapeada existe en disco.
 *
 * Uso:  pnpm verify:catalog
 * Salida con código 1 si alguna comprobación falla (apto para CI).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_DOCUMENTS, CATALOG_REFS, catalogRef } from '../src/data/certificates';
import { PREVIEWS_BY_FILE } from '../src/data/certificates.previews';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = (() => {
  let dir = HERE;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    dir = path.dirname(dir);
  }
  return HERE;
})();
const CERT_DIR = path.join(MONOREPO_ROOT, 'shared/docs/certificados');

const GENERIC_TITLE = /^(certificate|course|documento|document|diploma)?\s*#?\s*\d+\b/i;
const failures: string[] = [];

// 1) títulos genéricos
for (const d of ALL_DOCUMENTS) {
  if (GENERIC_TITLE.test(d.title.trim())) failures.push(`título genérico: ${d.id} -> "${d.title}"`);
}

// 2) refs únicas
const refs = Object.entries(CATALOG_REFS);
const dupes = refs.filter(([, r], i) => refs.findIndex(([, x]) => x === r) !== i);
if (dupes.length) failures.push(`refs duplicadas: ${dupes.map(([id, r]) => `${id}=${r}`).join(', ')}`);

// 3) fechas declaradas (solo el diploma censurado puede omitirla)
for (const d of ALL_DOCUMENTS) {
  if (!d.date && !d.note) failures.push(`sin fecha y sin nota: ${d.id}`);
}

// 4) archivos declarados
const seen = new Set<string>();
for (const d of ALL_DOCUMENTS) {
  for (const f of d.files) {
    if (seen.has(f.name)) continue;
    seen.add(f.name);
    if (!fs.existsSync(path.join(CERT_DIR, f.name))) failures.push(`archivo ausente: ${d.id} -> ${f.name}`);
    if (!PREVIEWS_BY_FILE[f.name]) failures.push(`sin preview mapeada: ${d.id} -> ${f.name}`);
  }
}

// 5) previews mapeadas
for (const [file, preview] of Object.entries(PREVIEWS_BY_FILE)) {
  if (!fs.existsSync(path.join(CERT_DIR, 'previews', preview))) failures.push(`preview ausente: ${file} -> ${preview}`);
}

console.log(`📚 ${ALL_DOCUMENTS.length} documentos · ${refs.length} refs de catálogo · ${seen.size} archivos`);
for (const d of ALL_DOCUMENTS.slice(0, 3)) console.log(`   ${catalogRef(d)}  ${d.date ?? '----------'}  ${d.title}`);

if (failures.length) {
  console.error(`\n❌ ${failures.length} problema(s):`);
  for (const f of failures) console.error(`   - ${f}`);
  process.exit(1);
}
console.log('\n✅ Catálogo verificado: sin títulos genéricos, refs únicas, fechas y previews completas.');
