/**
 * CUSTOMERSGEN - Generador de documentacion de clientes (archives/customers)
 *
 * Lee archives/customers/data/customers.json (fuente de verdad) y regenera:
 *   - docs/ (global):       CUSTOMERS_GLOBAL.{md,txt,csv,docx,pdf}
 *   - <CLIENTE>/docs/:      CUSTOMER_<NOMBRE>.{md,txt,csv,docx,pdf}
 *   - <CLIENTE>/content/{images,videos,profile}  + carpeta adicional asunto/
 *
 * Reutiliza los helpers de scripts/staffgen.js (formatos, csv, pdf, content).
 *
 * Uso:
 *   node scripts/customersgen.js          # regenera todo
 *   node scripts/customersgen.js --check  # valida el JSON
 */

const fs = require('fs');
const path = require('path');
const gen = require('./staffgen.js');

const CUSTOMERS = path.join(gen.ROOT, 'archives', 'customers');
const DATA_FILE = path.join(CUSTOMERS, 'data', 'customers.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) throw new Error('No existe archives/customers/data/customers.json');
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function cname(c) {
  return `${c.nombres} ${c.apellidos}`.replace(/\s+/g, ' ').trim().toUpperCase();
}

function slugName(c) {
  return cname(c).replace(/ /g, '_');
}

function active(data) {
  return data.customers.filter((c) => c.estado === 'activo');
}

function inactive(data) {
  return data.customers.filter((c) => c.estado === 'inactivo');
}

// ---------- contenido GLOBAL ----------
function buildGlobalMd(data) {
  const act = active(data);
  const bajas = inactive(data);
  const rows = act
    .map((c) => `| ${c.id} | ${cname(c)} | ${c.asunto || '-'} | ${c.correo || '-'} | ${c.telefono || '-'} |`)
    .join('\n');
  const bajaRows = bajas
    .map((c) => `| ${c.id} | ${cname(c)} | ${c.asunto || '-'} | ${c.registroBaja?.fecha || '-'} | ${c.registroBaja?.motivo || '-'} |`)
    .join('\n');

  return `# CISZU NETWORK - REGISTRO GLOBAL DE CLIENTES

Version: ${data.schemaVersion}
Actualizacion: ${data.actualizacion}
Identificador: ${gen.idStamp(data, 'CUSTOMERS_GLOBAL')}

> **Definicion**: plantilla global que resume a todos los clientes de ${data.org.nombre},
> su asunto (trabajo/encargo) y el historial de bajas. Fuente de verdad:
> \`archives/customers/data/customers.json\`.

---

## 1. Organizacion

- **Nombre**: ${data.org.nombre}
- **Fundador**: ${data.org.fundador}
- **Sede**: ${data.org.sede}
- **Pais**: ${data.org.pais}
- **Correo de contacto**: ${data.org.correo}
- **Descripcion**: ${data.org.descripcion}

## 2. Clientes activos (${act.length})

| ID | Nombre | Asunto | Correo | Telefono |
|----|--------|--------|--------|----------|
${rows}

## 3. Historial de bajas (${bajas.length})

| ID | Nombre | Asunto | Fecha de baja | Motivo |
|----|--------|--------|---------------|--------|
${bajaRows || '| - | (sin bajas registradas) | - | - | - |'}

## 4. Metadatos

- Estructura: \`archives/customers/docs/\` (global), \`archives/customers/<CLIENTE>/\` por cliente.
- Cada cliente mantiene sus 5 formatos (\`md\`, \`txt\`, \`csv\`, \`docx\`, \`pdf\`), \`content/{images,videos,profile}\`
  y la carpeta adicional \`asunto/\` para los archivos del trabajo.
- Consola de gestion: **CUSTOMERSCON** (\`test/website/debug/customerscon.ps1\`).

---

_Ultima revision: ${gen.today()}_
`;
}

function buildGlobalCsv(data) {
  const head = ['id', 'nombres', 'apellidos', 'asunto', 'telefono', 'correo', 'direccion', 'estado'];
  const rows = data.customers.map((c) =>
    [c.id, c.nombres, c.apellidos, c.asunto, c.telefono, c.correo, c.direccion, c.estado].map(gen.csv).join(',')
  );
  return head.join(',') + '\n' + rows.join('\n') + '\n';
}

// ---------- contenido por CLIENTE ----------
function buildCustomerMd(data, c) {
  const redes = (c.redes || []).length
    ? c.redes.map((r) => `- ${r.red}: ${r.url}`).join('\n')
    : '- (sin redes registradas)';
  return `# CISZU NETWORK - CLIENTE: ${cname(c)}

Version: ${data.schemaVersion}
Actualizacion: ${data.actualizacion}
Identificador: ${gen.idStamp(data, `CUSTOMER_${c.id}`)}

> **Definicion**: ficha del cliente **${cname(c)}** (ID ${c.id}) de ${data.org.nombre},
> con su asunto (trabajo o encargo) y datos de contacto.

---

## 1. Datos del cliente

- **Nombre completo**: ${cname(c)}
- **ID de cliente**: ${c.id}
- **Asunto / trabajo**: ${c.asunto || '(sin asunto registrado)'}
- **Fecha**: ${c.fecha || '(sin fecha)'}

## 2. Contacto

- **Correo**: ${c.correo || '(sin registrar)'}
- **Telefono**: ${c.telefono || '(sin registrar)'}
- **Direccion**: ${c.direccion || '(sin registrar)'}

## 3. Redes sociales

${redes}

## 4. Estado

- **Estado**: activo

## 5. Notas de la carpeta

Los archivos del trabajo/encargo se guardan en la carpeta \`asunto/\` de este cliente.
El contenido visual (fotos, videos, perfil) vive en \`content/{images,videos,profile}\`.

---

_Ultima revision: ${gen.today()}_
`;
}

function buildCustomerCsv(c) {
  const head = ['id', 'nombres', 'apellidos', 'asunto', 'telefono', 'correo', 'direccion', 'estado'];
  const row = [c.id, c.nombres, c.apellidos, c.asunto, c.telefono, c.correo, c.direccion, c.estado].map(gen.csv).join(',');
  return head.join(',') + '\n' + row + '\n';
}

// ---------- contenido BAJA (ex-cliente) ----------
function buildBajaMd(data, c) {
  const b = c.registroBaja || {};
  return `# CISZU NETWORK - REGISTRO DE BAJA DE CLIENTE: ${cname(c)}

Version: ${data.schemaVersion}
Actualizacion: ${data.actualizacion}
Identificador: ${gen.idStamp(data, `REGISTRO_BAJA_CL_${c.id}`)}

> **Definicion**: registro de un cliente que ya no esta activo. El ID se conserva
> de forma permanente (nunca se reutiliza) y el historial completo se mantiene en
> el archivo de texto (.txt) de esta carpeta por seguridad y trazabilidad.

---

## 1. Datos de baja

- **ID**: ${c.id}
- **Nombre**: ${cname(c)}
- **Asunto**: ${c.asunto || '-'}
- **Fecha de baja**: ${b.fecha || '-'}
- **Motivo**: ${b.motivo || '-'}
- **Registrada por**: ${b.eliminadoPor || '-'}

## 2. Nota de seguridad

Los archivos \`md\`, \`csv\`, \`docx\` y \`pdf\` se mantienen como registro minimo. El historial
completo del cliente (contacto, direccion, redes) se conserva en el \`.txt\`. La documentacion
global ya no lo lista como activo.

---

_Ultima revision: ${gen.today()}_
`;
}

function buildBajaTxt(data, c) {
  const b = c.registroBaja || {};
  return [
    '====================================================================',
    'REGISTRO DE BAJA DE CLIENTE - CISZU NETWORK',
    '====================================================================',
    '',
    `ID: ${c.id}`,
    `Nombre: ${cname(c)}`,
    `Asunto: ${c.asunto || '(sin asunto)'}`,
    `Telefono: ${c.telefono || '(sin registrar)'}`,
    `Correo: ${c.correo || '(sin registrar)'}`,
    `Direccion: ${c.direccion || '(sin registrar)'}`,
    `Redes sociales: ${(c.redes || []).map((r) => `${r.red}: ${r.url}`).join(' | ') || '(sin redes)'}`,
    '',
    '--------------------------------------------------------------------',
    'DATOS DE LA BAJA',
    '--------------------------------------------------------------------',
    `Fecha de baja: ${b.fecha || '-'}`,
    `Motivo: ${b.motivo || '-'}`,
    `Registrada por: ${b.eliminadoPor || '-'}`,
    '',
    'NOTA: Este archivo conserva la informacion del cliente por seguridad y',
    'trazabilidad. El ID nunca se reutiliza. La documentacion global ya no lo',
    'lista como activo.',
    '',
    '====================================================================',
  ].join('\n') + '\n';
}

function buildBajaCsv(c) {
  const b = c.registroBaja || {};
  const head = ['id', 'nombre', 'asunto', 'fechaBaja', 'motivo', 'eliminadoPor', 'estado'];
  const row = [c.id, cname(c), c.asunto || '', b.fecha || '', b.motivo || '', b.eliminadoPor || '', 'inactivo'].map(gen.csv).join(',');
  return head.join(',') + '\n' + row + '\n';
}

// ---------- generacion ----------
function buildLevels(data, opts) {
  const full = !!opts.full;
  const custScope = full ? null : new Set(opts.customers || []);

  gen.generateFormats(path.join(CUSTOMERS, 'docs'), 'CUSTOMERS_GLOBAL', buildGlobalMd(data), buildGlobalCsv(data));
  gen.ensureContent(path.join(CUSTOMERS, 'content'));

  for (const c of data.customers) {
    if (!full && !custScope.has(c.id)) continue;
    const cDir = path.join(CUSTOMERS, slugName(c));
    gen.ensureContent(path.join(cDir, 'content'));
    const asuntoDir = path.join(cDir, 'asunto');
    gen.mkdirp(asuntoDir);
    if (!fs.existsSync(path.join(asuntoDir, '.gitkeep'))) fs.writeFileSync(path.join(asuntoDir, '.gitkeep'), '');
    const base = `CUSTOMER_${slugName(c)}`;
    const docsDir = path.join(cDir, 'docs');
    if (c.estado === 'inactivo') {
      gen.generateFormats(docsDir, base, buildBajaMd(data, c), buildBajaCsv(c));
      gen.writeFile(path.join(docsDir, base + '.txt'), buildBajaTxt(data, c));
    } else {
      gen.generateFormats(docsDir, base, buildCustomerMd(data, c), buildCustomerCsv(c));
    }
  }
}

function generate(data) {
  buildLevels(data, { full: true });
}

function generateScoped(data, ids) {
  buildLevels(data, { customers: ids });
}

function countFiles() {
  const c = { md: 0, txt: 0, csv: 0, docx: 0, pdf: 0 };
  for (const f of fs.readdirSync(path.join(CUSTOMERS, 'docs'))) {
    const ext = f.split('.').pop();
    if (ext in c) c[ext]++;
  }
  for (const cust of fs.readdirSync(CUSTOMERS)) {
    const dd = path.join(CUSTOMERS, cust, 'docs');
    if (!fs.existsSync(dd)) continue;
    for (const f of fs.readdirSync(dd)) {
      const ext = f.split('.').pop();
      if (ext in c) c[ext]++;
    }
  }
  return c;
}

function main() {
  const data = readData();
  if (process.argv.includes('--check')) {
    console.log('JSON valido:', data.customers.length, 'clientes');
    return;
  }
  console.log('CUSTOMERSGEN: regenerando archives/customers...');
  generate(data);
  const t = countFiles();
  console.log(`OK: ${t.md} md, ${t.txt} txt, ${t.csv} csv, ${t.docx} docx, ${t.pdf} pdf`);
}

module.exports = { generate, generateScoped, readData, cname, slugName, DATA_FILE, CUSTOMERS };

if (require.main === module) main();