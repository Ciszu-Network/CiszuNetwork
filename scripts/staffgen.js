/**
 * STAFFGEN - Generador de documentacion de empleados (archives/staff)
 *
 * Lee archives/staff/data/staff.json (fuente de verdad) y regenera TODA la
 * estructura de archives/staff con sus 5 formatos por nivel:
 *   - docs/ (global):  STAFF_GLOBAL.{md,txt,csv,docx,pdf}
 *   - <cargo>/docs/:   STAFF_<CARGO>.{md,txt,csv,docx,pdf}
 *   - <cargo>/<EMPLEADO>/docs/: EMPLEADO_<NOMBRE>_<CARGO>.{md,txt,csv,docx,pdf}
 * Y las carpetas content/ (images, videos, profile) en cada nivel.
 *
 * Uso:
 *   node scripts/staffgen.js            # regenera todo desde el JSON
 *   node scripts/staffgen.js --check    # solo valida el JSON
 *
 * Lo invoca la STAFFCON (scripts/staffcon.js) tras cada mutacion.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const STAFF = path.join(ROOT, 'archives', 'staff');
const DATA_FILE = path.join(STAFF, 'data', 'staff.json');
const STAFFPDF = path.join(ROOT, 'scripts', 'staffpdf.py');
const PANDOC = 'C:\\Users\\fplay\\AppData\\Local\\Microsoft\\WinGet\\Packages\\JohnMacFarlane.Pandoc_Microsoft.Winget.Source_8wekyb3d8bbwe\\pandoc-3.10\\pandoc.exe';

// ---------- utilidades ----------
function readData() {
  if (!fs.existsSync(DATA_FILE)) throw new Error('No existe archives/staff/data/staff.json');
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }

function writeFile(p, content) {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
}

function fullName(e) { return `${e.nombres} ${e.apellidos}`.replace(/\s+/g, ' ').trim().toUpperCase(); }

function roleByFolder(data, folder) {
  return data.roles.find((r) => r.carpeta === folder);
}

function membersOf(data, roleFolder) {
  return data.empleados.filter((e) => e.estado === 'activo' && (e.cargos || []).includes(roleFolder));
}

function inactive(data) {
  return data.empleados.filter((e) => e.estado === 'inactivo');
}

function idStamp(data, slug) {
  const v = data.schemaVersion.replace(/\./g, '_');
  const d = data.actualizacion.replace(/-/g, '_');
  return `${slug}_V${v}_${d}_ciszunetwork`;
}

function csv(v) {
  if (v == null) return '';
  v = String(v);
  if (/[",\n]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}

function mdToTxt(md) {
  return md
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\|/g, '  ')
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^---+$/gm, '============================================================')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- formatos (md/txt/csv/docx/pdf) ----------
function generateFormats(levelDir, base, md, csvContent) {
  const mdPath = path.join(levelDir, base + '.md');
  const txtPath = path.join(levelDir, base + '.txt');
  const csvPath = path.join(levelDir, base + '.csv');
  const docxPath = path.join(levelDir, base + '.docx');
  const pdfPath = path.join(levelDir, base + '.pdf');
  writeFile(mdPath, md);
  writeFile(txtPath, mdToTxt(md));
  writeFile(csvPath, csvContent);
  try {
    execSync(`"${PANDOC}" "${mdPath}" -f markdown -t docx -o "${docxPath}"`, { stdio: 'pipe' });
  } catch (e) { console.error(`  ✗ DOCX ${base}: ${e.message.substring(0, 60)}`); }
  try {
    execSync(`python "${STAFFPDF}" "${mdPath}" "${pdfPath}"`, { stdio: 'pipe' });
  } catch (e) { console.error(`  ✗ PDF  ${base}: ${e.message.substring(0, 60)}`); }
}

function ensureContent(dir) {
  for (const sub of ['images', 'videos', 'profile']) {
    const d = path.join(dir, sub);
    mkdirp(d);
    const keep = path.join(d, '.gitkeep');
    if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
  }
}

// ---------- contenido GLOBAL ----------
function buildGlobalMd(data) {
  const act = data.empleados.filter((e) => e.estado === 'activo');
  const bajas = inactive(data);
  const rows = data.roles
    .map((r) => `| ${r.nivel} | ${r.nombre} (${r.displayName}) | ${membersOf(data, r.carpeta).length} |`)
    .join('\n');
  const empRows = act
    .map((e) => {
      const sup = e.supervisor ? `${e.supervisor}` : 'Fundador';
      const ing = e.fechaIngreso || 'Fundador (desde creacion)';
      return `| ${e.id} | ${fullName(e)} | ${e.cargo} | ${e.correo || '-'} | ${e.telefono || '-'} | ${sup} | ${ing} |`;
    })
    .join('\n');
  const bajaRows = bajas
    .map((e) => `| ${e.id} | ${fullName(e)} | ${e.registroBaja?.fecha || '-'} | ${e.registroBaja?.motivo || '-'} | ${e.registroBaja?.eliminadoPor || '-'} |`)
    .join('\n');

  return `# CISZU NETWORK - REGISTRO GLOBAL DE EMPLEADOS

Version: ${data.schemaVersion}
Actualizacion: ${data.actualizacion}
Identificador: ${idStamp(data, 'STAFF_GLOBAL')}

> **Definicion**: plantilla global que resume a todos los empleados de ${data.org.nombre},
> sus cargos, la jerarquia de rangos y el historial de bajas. Fuente de verdad:
> \`archives/staff/data/staff.json\`.

---

## 1. Organizacion

- **Nombre**: ${data.org.nombre}
- **Fundador**: ${data.org.fundador}
- **Sede**: ${data.org.sede}
- **Pais**: ${data.org.pais}
- **Correo de contacto**: ${data.org.correo}
- **Descripcion**: ${data.org.descripcion}

## 2. Roles y jerarquia (${data.roles.length})

Escala de rangos por **nivel** (0 = mayor autoridad, 9 = base). Se asciende bajando
el numero de nivel; un cargo de nivel N solo puede gestionar cargos de nivel mayor que N.

${rows}

## 3. Empleados activos (${act.length})

| ID | Nombre | Cargo | Correo | Telefono | Supervisor | Ingreso |
|----|--------|-------|--------|----------|------------|---------|
${empRows}

## 4. Historial de bajas (${bajas.length})

| ID | Nombre | Fecha de baja | Motivo | Eliminado por |
|----|--------|---------------|--------|---------------|
${bajaRows || '| - | (sin bajas registradas) | - | - | - |'}

## 5. Metadatos

- Estructura de carpetas: \`archives/staff/docs/\`, \`archives/staff/<cargo>/\`, \`archives/staff/<cargo>/<EMPLEADO>/\`.
- Cada nivel mantiene sus 5 formatos (\`md\`, \`txt\`, \`csv\`, \`docx\`, \`pdf\`) y carpetas \`content/{images,videos,profile}\`.
- El contenido global sirve para representar el **organigrama** visual de toda la empresa (\`content/images\`).
- Consola de gestion: **STAFFCON** (\`test/website/debug/staffcon.ps1\`).

---

_Ultima revision: ${today()}_
`;
}

function buildGlobalCsv(data) {
  const head = ['id', 'nombres', 'apellidos', 'telefono', 'correo', 'direccion', 'cargo', 'nivel', 'supervisor', 'fechaIngreso', 'estado'];
  const rows = data.empleados.map((e) => {
    const r = roleByFolder(data, e.cargo);
    return [
      e.id, e.nombres, e.apellidos, e.telefono, e.correo, e.direccion, e.cargo,
      r ? r.nivel : '', e.supervisor || '', e.fechaIngreso || '', e.estado,
    ].map(csv).join(',');
  });
  return head.join(',') + '\n' + rows.join('\n') + '\n';
}

// ---------- contenido por CARGO ----------
function buildRoleMd(data, role) {
  const members = membersOf(data, role.carpeta);
  const rows = members
    .map((e) => `| ${e.id} | ${fullName(e)} | ${e.correo || '-'} | ${e.telefono || '-'} | ${e.supervisor || 'Fundador'} |`)
    .join('\n');
  const perms = role.permisos || {};
  const si = (b) => (b ? 'SI' : 'no');
  return `# CISZU NETWORK - CARGO: ${role.nombre} (${role.displayName})

Version: ${data.schemaVersion}
Actualizacion: ${data.actualizacion}
Identificador: ${idStamp(data, 'STAFF_' + role.carpeta)}

> **Definicion**: ficha del cargo **${role.nombre}** dentro de la organizacion.
> ${role.descripcion}

---

## 1. Ficha del cargo

- **Cargo**: ${role.nombre}
- **Denominacion**: ${role.displayName}
- **Nivel jerarquico**: ${role.nivel} (0 = mayor autoridad)
- **Horario**: ${role.horario}

## 2. Responsabilidades

${role.responsabilidades.map((r) => `- ${r}`).join('\n')}

## 3. Permisos en STAFFCON

- Añadir empleados: ${si(perms.anadir)}
- Quitar empleados: ${si(perms.quitar)}
- Cambiar rango: ${si(perms.rango)}
- Modificar datos: ${si(perms.modificar)}

Un cargo con nivel N solo puede gestionar cargos de nivel **mayor** que N.

## 4. Miembros activos del cargo (${members.length})

| ID | Nombre | Correo | Telefono | Supervisor |
|----|--------|--------|----------|------------|
${rows || '| - | (sin miembros activos) | - | - | - |'}

## 5. Escalabilidad

El cargo **${role.nombre}** se ubica en el nivel ${role.nivel} de la escala organizacional.
La promocion asciende hacia el nivel 0 (direccion); la demora o el descenso se aplica
bajando de nivel. El detalle de la escala vive en \`EMPLOYEES_SYSTEM.md\`.

---

_Ultima revision: ${today()}_
`;
}

function buildRoleCsv(data, role) {
  const head = ['id', 'nombres', 'apellidos', 'telefono', 'correo', 'cargo', 'nivel', 'supervisor', 'estado'];
  const rows = membersOf(data, role.carpeta).map((e) =>
    [e.id, e.nombres, e.apellidos, e.telefono, e.correo, role.carpeta, role.nivel, e.supervisor || '', e.estado].map(csv).join(',')
  );
  return head.join(',') + '\n' + rows.join('\n') + '\n';
}

// ---------- contenido por EMPLEADO ----------
function buildEmployeeMd(data, emp, role) {
  const redes = (emp.redes || []).length
    ? emp.redes.map((r) => `- ${r.red}: ${r.url}`).join('\n')
    : '- (sin redes registradas)';
  const supName = emp.supervisor
    ? data.empleados.find((x) => x.id === emp.supervisor)
    : null;
  const sup = emp.supervisor ? `${supName ? fullName(supName) : 'desconocido'} (${emp.supervisor})` : 'Fundador';
  const ing = emp.fechaIngreso || 'Fundador (desde creacion)';
  return `# CISZU NETWORK - EMPLEADO: ${fullName(emp)}

Version: ${data.schemaVersion}
Actualizacion: ${data.actualizacion}
Identificador: ${idStamp(data, `EMPLEADO_${emp.id}_${role.carpeta}`)}

> **Definicion**: ficha del empleado **${fullName(emp)}** (ID ${emp.id}) en su cargo
> **${role.nombre}** (nivel ${role.nivel}). Esta carpeta se replica en cada cargo que la
> persona ocupa dentro de la organizacion.

---

## 1. Datos personales

- **Nombre completo**: ${fullName(emp)}
- **ID de empresa**: ${emp.id}
- **Cargo en esta carpeta**: ${role.nombre} (${role.displayName})
- **Nivel jerarquico**: ${role.nivel}
- **Fecha de ingreso**: ${ing}
- **Supervisor**: ${sup}

## 2. Contacto

- **Correo**: ${emp.correo || '(sin registrar)'}
- **Telefono**: ${emp.telefono || '(sin registrar)'}
- **Direccion**: ${emp.direccion || '(sin registrar)'}

## 3. Redes sociales

${redes}

## 4. Estado

- **Estado**: activo

---

_Ultima revision: ${today()}_
`;
}

function buildEmployeeCsv(emp, role) {
  const head = ['id', 'nombres', 'apellidos', 'telefono', 'correo', 'direccion', 'cargo', 'nivel', 'supervisor', 'fechaIngreso', 'estado'];
  const row = [emp.id, emp.nombres, emp.apellidos, emp.telefono, emp.correo, emp.direccion, role.carpeta, role.nivel, emp.supervisor || '', emp.fechaIngreso || '', emp.estado].map(csv).join(',');
  return head.join(',') + '\n' + row + '\n';
}

// ---------- contenido BAJA (ex-empleado) ----------
function buildBajaMd(data, emp) {
  const b = emp.registroBaja || {};
  return `# CISZU NETWORK - REGISTRO DE BAJA: ${fullName(emp)}

Version: ${data.schemaVersion}
Actualizacion: ${data.actualizacion}
Identificador: ${idStamp(data, `REGISTRO_BAJA_${emp.id}`)}

> **Definicion**: registro de un exempleado de ${data.org.nombre}. El ID se conserva
> de forma permanente (nunca se reutiliza) y los datos completos se mantienen en el
> archivo de texto (.txt) de esta carpeta por seguridad y trazabilidad.

---

## 1. Datos de baja

- **ID**: ${emp.id}
- **Nombre**: ${fullName(emp)}
- **Fecha de baja**: ${b.fecha || '-'}
- **Motivo**: ${b.motivo || '-'}
- **Registrada por**: ${b.eliminadoPor || '-'}

## 2. Nota de seguridad

Los archivos \`md\`, \`csv\`, \`docx\` y \`pdf\` de esta carpeta se mantienen en formato
minimo de registro. El historial completo del exempleado (contacto, direccion, redes,
cargos ocupados y supervisor) se conserva en \`${fullName(emp).replace(/ /g, '_')}_${(emp.cargos?.[0] || 'BAJA')}.txt\`.
La documentacion global y del cargo ya no lo lista como activo.

---

_Ultima revision: ${today()}_
`;
}

function buildBajaTxt(data, emp) {
  const b = emp.registroBaja || {};
  const supName = emp.supervisor ? data.empleados.find((x) => x.id === emp.supervisor) : null;
  const lines = [
    '====================================================================',
    'REGISTRO DE BAJA DE EMPLEADO - CISZU NETWORK',
    '====================================================================',
    '',
    `ID: ${emp.id}`,
    `Nombre: ${fullName(emp)}`,
    `Cargos ocupados: ${(emp.cargos || []).join(', ') || '(sin cargo)'}`,
    `Cargo principal: ${emp.cargo || '(sin cargo)'}`,
    `Telefono: ${emp.telefono || '(sin registrar)'}`,
    `Correo: ${emp.correo || '(sin registrar)'}`,
    `Direccion: ${emp.direccion || '(sin registrar)'}`,
    `Supervisor: ${emp.supervisor ? `${supName ? fullName(supName) : 'desconocido'} (${emp.supervisor})` : 'Fundador'}`,
    `Fecha de ingreso: ${emp.fechaIngreso || 'Fundador (desde creacion)'}`,
    `Redes sociales: ${(emp.redes || []).map((r) => `${r.red}: ${r.url}`).join(' | ') || '(sin redes)'}`,
    '',
    '--------------------------------------------------------------------',
    'DATOS DE LA BAJA',
    '--------------------------------------------------------------------',
    `Fecha de baja: ${b.fecha || '-'}`,
    `Motivo: ${b.motivo || '-'}`,
    `Registrada por: ${b.eliminadoPor || '-'}`,
    '',
    'NOTA: Este archivo conserva la informacion del exempleado por seguridad y',
    'trazabilidad. El ID nunca se reutiliza. La documentacion global y de cargos',
    'ya no lo lista como activo.',
    '',
    '====================================================================',
  ];
  return lines.join('\n') + '\n';
}

function buildBajaCsv(emp) {
  const b = emp.registroBaja || {};
  const head = ['id', 'nombre', 'cargo', 'fechaBaja', 'motivo', 'eliminadoPor', 'estado'];
  const row = [emp.id, fullName(emp), emp.cargo || '', b.fecha || '', b.motivo || '', b.eliminadoPor || '', 'inactivo'].map(csv).join(',');
  return head.join(',') + '\n' + row + '\n';
}

// ---------- generacion ----------
function buildLevels(data, opts) {
  // opts = { full: true } regenera TODO; { roles: [carpeta], employees: ["id:carpeta"] }
  // regenera solo global + los roles/empleados indicados (rapido para la STAFFCON).
  const full = !!opts.full;
  const roleScope = full ? new Set(data.roles.map((r) => r.carpeta)) : new Set(opts.roles || []);
  const empScope = full ? null : new Set(opts.employees || []);

  // Global (siempre se regenera: lista a todos los empleados)
  generateFormats(path.join(STAFF, 'docs'), 'STAFF_GLOBAL', buildGlobalMd(data), buildGlobalCsv(data));
  ensureContent(path.join(STAFF, 'content'));

  for (const role of data.roles) {
    const roleDir = path.join(STAFF, role.carpeta);
    ensureContent(path.join(roleDir, 'content'));

    const inRole = roleScope.has(role.carpeta);
    if (inRole) {
      generateFormats(path.join(roleDir, 'docs'), 'STAFF_' + role.carpeta, buildRoleMd(data, role), buildRoleCsv(data, role));
    }

    for (const emp of data.empleados.filter((e) => (e.cargos || []).includes(role.carpeta))) {
      const empDir = path.join(roleDir, fullName(emp).replace(/ /g, '_'));
      ensureContent(path.join(empDir, 'content'));
      const inEmp = full || empScope.has(`${emp.id}:${role.carpeta}`);
      if (!inEmp) continue;
      const base = `EMPLEADO_${fullName(emp).replace(/ /g, '_')}_${role.carpeta}`;
      const docsDir = path.join(empDir, 'docs');
      if (emp.estado === 'inactivo') {
        generateFormats(docsDir, base, buildBajaMd(data, emp), buildBajaCsv(emp));
        writeFile(path.join(docsDir, base + '.txt'), buildBajaTxt(data, emp));
      } else {
        generateFormats(docsDir, base, buildEmployeeMd(data, emp, role), buildEmployeeCsv(emp, role));
      }
    }
  }
}

function generate(data) {
  buildLevels(data, { full: true });
}

// Regenera solo los niveles afectados (lista de carpetas de cargo y de "id:carpeta").
function generateScoped(data, scope) {
  buildLevels(data, { roles: scope.roles || [], employees: scope.employees || [] });
}

function countFiles() {
  const c = { md: 0, txt: 0, csv: 0, docx: 0, pdf: 0 };
  for (const f of fs.readdirSync(path.join(STAFF, 'docs'))) {
    const ext = f.split('.').pop();
    if (ext in c) c[ext]++;
  }
  for (const role of fs.readdirSync(STAFF)) {
    const rd = path.join(STAFF, role);
    if (!fs.statSync(rd).isDirectory() || !fs.existsSync(path.join(rd, 'docs'))) continue;
    for (const f of fs.readdirSync(path.join(rd, 'docs'))) {
      const ext = f.split('.').pop();
      if (ext in c) c[ext]++;
    }
    for (const emp of fs.readdirSync(rd)) {
      const ed = path.join(rd, emp, 'docs');
      if (!fs.existsSync(ed)) continue;
      for (const f of fs.readdirSync(ed)) {
        const ext = f.split('.').pop();
        if (ext in c) c[ext]++;
      }
    }
  }
  return c;
}

function main() {
  const data = readData();
  if (process.argv.includes('--check')) {
    console.log('JSON valido:', data.empleados.length, 'empleados,', data.roles.length, 'roles');
    return;
  }
  console.log('STAFFGEN: regenerando archives/staff...');
  generate(data);
  const t = countFiles();
  console.log(`OK: ${t.md} md, ${t.txt} txt, ${t.csv} csv, ${t.docx} docx, ${t.pdf} pdf`);
}

module.exports = {
  generate, generateScoped, readData, fullName, roleByFolder, DATA_FILE, STAFF, today,
  generateFormats, csv, mdToTxt, ensureContent, idStamp, mkdirp, writeFile, PANDOC, STAFFPDF, ROOT,
};

if (require.main === module) main();