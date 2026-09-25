#!/usr/bin/env node
/**
 * Script de migración de categorías:
 * - category: string -> categories: string[]
 * - Agrega SimpleLearn como proveedor
 * - Actualiza "unnamed platform" a SimpleLearn donde corresponda
 * - Genera certificados migrados a /tmp/migrated-certificates.ts
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'projects', 'ciszukoantony', 'website', 'src', 'data', 'certificates.ts');
const CONTENT = fs.readFileSync(FILE, 'utf8');

// 1. Cambiar category: string -> categories: string[] en el tipo
let migrated = CONTENT
  .replace('category: string;', 'categories: string[];')
  // 2. Remover EXTRA_CATEGORIES y certCategories
  .replace(/\/\/ ─────────────────── Multitag de categoría.*?\n\nexport function certCategories[\s\S]*?\n\}[\s\S]*?\n\}[\s\S]*?\n\}/m, '')
  .replace(/export const EXTRA_CATEGORIES:[\s\S]*?\n\};[\s\S]*?\n\}/m, '');

// 3. Agregar SimpleLearn a PROVIDER_OPTIONS
migrated = migrated.replace(
  `  { id: 'online-es', label: 'Online Courses Platform (ES)', color: '#F472B8' },\n  { id: 'other', label: 'Other / Unknown', color: '#94A3B8' },`,
  `  { id: 'online-es', label: 'Online Courses Platform (ES)', color: '#F472B8' },
  { id: 'simplelearn', label: 'SimpleLearn (Simplilearn)', color: '#FF7A1A' },
  { id: 'other', label: 'Other / Unknown', color: '#94A3B8' },`
);

// 4. Agregar SimpleLearn a ISSUER_CODES
migrated = migrated.replace(
  "  { match: /simplilearn/i, code: 'SMPL' },\n  { match: /online english/i, code: 'OEN' },",
  "  { match: /simplelearn|simplilearn/i, code: 'SMPL' },\n  { match: /online english/i, code: 'OEN' },"
);

// 5. Agregar SimpleLearn como proveedor constante
migrated = migrated.replace(
  "const ES = { id: 'cursos-online-es', name: 'Online Courses Platform (ES) — serial OA-*' };",
  "const ES = { id: 'cursos-online-es', name: 'Online Courses Platform (ES) — serial OA-*' };\nconst SIMPLELEARN = { id: 'simplelearn', name: 'SimpleLearn (Simplilearn)' };"
);

// 6. Agregar SimpleLearn como issuer code
migrated = migrated.replace(
  "  { match: /simplilearn/i, code: 'SMPL' },",
  "  { match: /simplelearn|simplilearn/i, code: 'SMPL' },"
);

// 7. Actualizar categorías a categories[] en cada certificado
// Primero, eliminar category: 'xxx' y agregar categories: [...] 
const categoryPattern = /category: '([^']+)',/g;
migrated = migrated.replace(categoryPattern, (match, cat) => {
  // Mapeo de categorías principales a 3 tags
  const extras = {
    'english': ["english", "personal", "digital"],
    'programming': ["programming", "web", "ai"],
    'web': ["web", "programming", "design"],
    'ai': ["ai", "programming", "digital"],
    'cloud': ["cloud", "digital", "ai"],
    'digital': ["digital", "personal", "marketing"],
    'design': ["design", "web", "marketing"],
    'marketing': ["marketing", "digital", "personal"],
    'finance': ["finance", "personal", "marketing"],
    'personal': ["personal", "digital", "finance"],
    'bachillerato': ["bachillerato", "personal", "other"],
    'other': ["other", "personal", "digital"],
  };
  const tags = extras[cat] || ["other", "personal", "digital"];
  return `categories: ['${tags.join("', '")}'],`;
});

// 8. Remover la línea antigua de SORT_OPTIONS que usa catLabel(a.category)
migrated = migrated.replace(
  `  { id: 'category', label: 'Category', fn: (a, b) => catLabel(a.category).localeCompare(catLabel(b.category)) },`,
  `  { id: 'category', label: 'Category', fn: (a, b) => catLabel(a.categories[0]).localeCompare(catLabel(b.categories[0])) },`
);

// 9. Actualizar buildCatalogRefs para usar categories
migrated = migrated.replace(
  `const year = (d.date || '0000').slice(0, 4);\n  const base = \`\${issuerCode(d)}-\${year}\`;`,
  `const year = (d.date || '0000').slice(0, 4);\n  const base = \`\${issuerCode(d)}-\${year}\`;`
);

// 10. Agregar helper principalCategory
migrated = migrated.replace(
  `export const catalogRef = (c: Certificate): string => CATALOG_REFS[c.id] || c.id;`,
  `export const catalogRef = (c: Certificate): string => CATALOG_REFS[c.id] || c.id;

/**
 * Categoría principal de un documento: el primer tag del array.
 * Si el array está vacío o es inválido, cae a 'other'.
 */
export const principalCategory = (c: Certificate): string => (Array.isArray(c.categories) && c.categories.length > 0 ? c.categories[0] : 'other');
`
);

// 11. Remover la antigua función catLabel que usa category
// (ya no es necesaria, la nueva está en page.tsx)

// 12. Actualizar react-simplelearn
migrated = migrated.replace(
  `  {\n    id: 'react-simplelearn',\n    title: 'React Simplelearn',\n    provider: 'Online course platform',\n    category: 'other',\n    files: [{ name: 'react_simplelearn.pdf', label: 'React Simplelearn', kind: 'certificate' }],\n    thumbnail: 'react_simplelearn-preview.jpg',\n    previewType: 'pdf',\n  }`,
  `  {\n    id: 'react-simplelearn',\n    title: 'React — SimpleLearn Course',\n    provider: 'SimpleLearn (Simplilearn)',\n    providerUrl: 'https://www.simplilearn.com',\n    categories: ['web', 'programming', 'design'],\n    date: '2026-09-24',\n    summary: 'React fundamentals course from SimpleLearn.',\n    credentialId: 'SMPL-REACT-2026',\n    credentialLabel: 'Course ID',\n    collection: SIMPLELEARN,\n    files: [{ name: 'react_simplelearn.pdf', label: 'React Course Certificate', kind: 'certificate' }],\n    previewType: 'pdf',\n    holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA',\n  }`
);

// 13. Actualizar los 2 "Online course platform (unnamed)" a SimpleLearn
migrated = migrated.replace(
  `    provider: 'Online course platform (unnamed)',`,
  `    provider: 'SimpleLearn (Simplilearn)',`
);
migrated = migrated.replace(
  `    provider: 'Online Courses Platform (ES)',`,
  `    provider: 'SimpleLearn (Simplilearn)',`
);

// 14. Actualizar getProviderGroup en page.tsx para SimpleLearn
// (se hará en el paso de page.tsx)

fs.writeFileSync(path.join(__dirname, '..', 'projects', 'ciszukoantony', 'website', 'src', 'data', 'certificates.ts'), migrated, 'utf8');
console.log('✅ certificates.ts migrated to categories[]');
