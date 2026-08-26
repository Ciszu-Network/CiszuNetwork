/**
 * STAFFCON - Motor de la Staff Console (gestion de empleados)
 *
 * CLI que gestiona archives/staff/data/staff.json y regenera toda la
 * documentacion (scripts/staffgen.js) tras cada mutacion. La TUI vive en
 * test/website/debug/staffcon.ps1.
 *
 * Seguridad:
 *  - Cada accion requiere un actor (ID de empleado activo) y su cargo.
 *  - Solo los cargos con el permiso correspondiente pueden ejecutarla.
 *  - Un cargo de nivel N solo gestiona cargos de nivel MAYOR que N.
 *  - El fundador (CZ-001) no se puede quitar ni cambiar de rango.
 *  - Toda accion (exitosa o fallida) se registra en el log de sesion.
 *
 * Uso:
 *   node scripts/staffcon.js login <id>
 *   node scripts/staffcon.js list
 *   node scripts/staffcon.js roles
 *   node scripts/staffcon.js add --actor <id> --session <s> --nombres X --apellidos Y --cargo <carpeta> [--telefono T --correo E --direccion D --supervisor ID --fecha AAAA-MM-DD]
 *   node scripts/staffcon.js remove --actor <id> --session <s> --id <target> --motivo "..."
 *   node scripts/staffcon.js rank --actor <id> --session <s> --id <target> --cargo <nuevaCarpeta>
 *   node scripts/staffcon.js modify --actor <id> --session <s> --id <target> --campo <campo> --valor <valor>
 */

const path = require('path');
const fs = require('fs');
const gen = require('./staffgen.js');

const ROOT = gen.ROOT || path.resolve(__dirname, '..');
const LOG_DIR = path.join(ROOT, 'tools', 'consoles', 'local-logs');

// ---------- parseo de args ----------
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      args[key] = argv[++i] ?? '';
    } else {
      args._.push(a);
    }
  }
  return args;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Windows puede bloquear el rename de un directorio (antivirus/índice del
// sistema). Reintenta unas veces y, si sigue fallando, copia y borra.
function renameDir(from, to) {
  if (!fs.existsSync(from)) return;
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
  for (let i = 0; i < 5; i++) {
    try { fs.renameSync(from, to); return; } catch { /* reintenta */ }
    const until = Date.now() + 300;
    while (Date.now() < until) { /* espera activa breve */ }
  }
  fs.cpSync(from, to, { recursive: true });
  fs.rmSync(from, { recursive: true, force: true });
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// ---------- log de sesion ----------
function logLine(data, session, actorId, action, detail) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const file = path.join(LOG_DIR, `staffcon-${today()}.log`);
  const line = `[${nowStamp()}] ${session} actor=${actorId} accion=${action} ${detail}`;
  fs.appendFileSync(file, line + '\n');
  console.log(`  ${line}`);
}

// ---------- data ----------
function read() { return gen.readData(); }

function save(data, scope) {
  data.actualizacion = today();
  fs.writeFileSync(gen.DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  if (scope && (scope.roles.length || scope.employees.length)) {
    gen.generateScoped(data, scope);
  } else {
    gen.generate(data);
  }
}

function findEmp(data, id) {
  return data.empleados.find((e) => e.id === id);
}

function actorOf(data, id) {
  const e = findEmp(data, id);
  if (!e || e.estado !== 'activo') return null;
  const role = gen.roleByFolder(data, e.cargo);
  if (!role) return null;
  return { emp: e, role };
}

function nextId(data) {
  const max = data.empleados.reduce((m, e) => {
    const n = parseInt((e.id || '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  const p = data.org.prefijoId || 'CZ';
  return `${p}-${String(max + 1).padStart(3, '0')}`;
}

// ---------- permisos ----------
// Un cargo de nivel N gestiona cargos de nivel MAYOR que N (numeros mas altos = menos autoridad).
function canManage(data, actorRole, targetRoleFolder) {
  if (!targetRoleFolder) return true;
  const tr = gen.roleByFolder(data, targetRoleFolder);
  if (!tr) return false;
  return actorRole.nivel < tr.nivel;
}

function isFounder(emp) {
  return emp && emp.supervisor == null;
}

// ---------- acciones ----------
function doLogin(args) {
  const id = args._[1];
  const data = read();
  const e = findEmp(data, id);
  if (!e || e.estado !== 'activo') {
    console.error(`❌ ID ${id} no existe o no esta activo.`);
    process.exit(1);
  }
  const role = gen.roleByFolder(data, e.cargo);
  console.log(`${e.id}|${gen.fullName(e)}|${e.cargo}|${role ? role.nivel : '?'}|activo`);
}

function doList() {
  const data = read();
  for (const e of data.empleados) {
    const role = gen.roleByFolder(data, e.cargo);
    console.log(`${e.id}|${gen.fullName(e)}|${e.cargo}|${role ? role.nivel : '?'}|${e.estado}`);
  }
}

function doRoles() {
  const data = read();
  for (const r of data.roles) {
    console.log(`${r.carpeta}|${r.nombre} (${r.displayName})|${r.nivel}`);
  }
}

function doAdd(args, session) {
  const data = read();
  const actor = actorOf(data, args.actor);
  if (!actor) { console.error('❌ Actor no valido.'); logLine(data, session, args.actor, 'add', 'DENEGADO: actor invalido'); process.exit(1); }
  const cargo = args.cargo;
  const role = gen.roleByFolder(data, cargo);
  if (!role) { console.error(`❌ Cargo '${cargo}' no existe.`); logLine(data, session, actor.emp.id, 'add', `DENEGADO: cargo '${cargo}' inexistente`); process.exit(1); }
  if (!actor.role.permisos.anadir) { console.error('❌ Tu cargo no tiene permiso para AÑADIR empleados.'); logLine(data, session, actor.emp.id, 'add', 'DENEGADO: sin permiso anadir'); process.exit(1); }
  if (!canManage(data, actor.role, cargo)) { console.error(`❌ No puedes crear un cargo de nivel ${role.nivel} o superior al tuyo (${actor.role.nivel}).`); logLine(data, session, actor.emp.id, 'add', `DENEGADO: jerarquia cargo ${cargo} (nivel ${role.nivel})`); process.exit(1); }
  const nombres = (args.nombres || '').trim();
  const apellidos = (args.apellidos || '').trim();
  if (!nombres || !apellidos) { console.error('❌ nombres y apellidos son obligatorios.'); logLine(data, session, actor.emp.id, 'add', 'DENEGADO: sin nombres/apellidos'); process.exit(1); }
  if (args.supervisor && !findEmp(data, args.supervisor)) { console.error(`❌ Supervisor ${args.supervisor} no existe.`); process.exit(1); }

  const id = nextId(data);
  const emp = {
    id,
    nombres,
    apellidos,
    telefono: args.telefono || '',
    correo: args.correo || '',
    direccion: args.direccion || '',
    redes: [],
    cargo,
    cargos: [cargo],
    supervisor: args.supervisor || null,
    fechaIngreso: args.fecha || null,
    estado: 'activo',
    registroBaja: null,
  };
  data.empleados.push(emp);
  save(data, { roles: [cargo], employees: [`${id}:${cargo}`] });
  logLine(data, session, actor.emp.id, 'add', `empleado ${id} ${gen.fullName(emp)} cargo=${cargo} supervisor=${args.supervisor || 'CEO'}`);
  console.log(`✅ Empleado ${id} (${gen.fullName(emp)}) creado en cargo ${role.nombre}. Carpeta y 5 formatos regenerados.`);
}

function doRemove(args, session) {
  const data = read();
  const actor = actorOf(data, args.actor);
  if (!actor) { console.error('❌ Actor no valido.'); process.exit(1); }
  const target = findEmp(data, args.id);
  if (!target || target.estado !== 'activo') { console.error(`❌ Empleado ${args.id} no existe o ya no esta activo.`); process.exit(1); }
  if (target.id === actor.emp.id) { console.error('❌ No puedes quitarte a ti mismo.'); logLine(data, session, actor.emp.id, 'remove', `DENEGADO: auto-baja de ${target.id}`); process.exit(1); }
  if (isFounder(target)) { console.error('❌ El fundador no se puede quitar.'); logLine(data, session, actor.emp.id, 'remove', `DENEGADO: fundador ${target.id}`); process.exit(1); }
  if (!actor.role.permisos.quitar) { console.error('❌ Tu cargo no tiene permiso para QUITAR empleados.'); logLine(data, session, actor.emp.id, 'remove', 'DENEGADO: sin permiso quitar'); process.exit(1); }
  if (!canManage(data, actor.role, target.cargo)) { console.error(`❌ No puedes quitar un cargo de nivel igual o superior al tuyo.`); logLine(data, session, actor.emp.id, 'remove', `DENEGADO: jerarquia ${target.id} cargo ${target.cargo}`); process.exit(1); }
  const motivo = (args.motivo || '').trim() || 'Baja no especificada';

  const datosPrevio = { ...target };
  target.estado = 'inactivo';
  target.registroBaja = {
    eliminadoPor: actor.emp.id,
    fecha: today(),
    motivo,
    datosPrevio,
  };
  const rolesAffected = target.cargos || [target.cargo];
  save(data, {
    roles: rolesAffected,
    employees: rolesAffected.map((c) => `${target.id}:${c}`),
  });
  logLine(data, session, actor.emp.id, 'remove', `empleado ${target.id} ${gen.fullName(target)} motivo="${motivo}" (ID conservado, docs de baja regeneradas)`);
  console.log(`✅ Empleado ${target.id} (${gen.fullName(target)}) dado de baja. Carpeta conservada con registro de baja; ID ${target.id} nunca se reutilizara.`);
}

function doRank(args, session) {
  const data = read();
  const actor = actorOf(data, args.actor);
  if (!actor) { console.error('❌ Actor no valido.'); process.exit(1); }
  const target = findEmp(data, args.id);
  if (!target || target.estado !== 'activo') { console.error(`❌ Empleado ${args.id} no existe o no esta activo.`); process.exit(1); }
  if (target.id === actor.emp.id) { console.error('❌ No puedes cambiar tu propio rango.'); process.exit(1); }
  if (isFounder(target)) { console.error('❌ El fundador no se puede cambiar de rango.'); process.exit(1); }
  if (!actor.role.permisos.rango) { console.error('❌ Tu cargo no tiene permiso para CAMBIAR RANGO.'); logLine(data, session, actor.emp.id, 'rank', 'DENEGADO: sin permiso rango'); process.exit(1); }
  const newRole = gen.roleByFolder(data, args.cargo);
  if (!newRole) { console.error(`❌ Cargo '${args.cargo}' no existe.`); process.exit(1); }
  if (newRole.carpeta === target.cargo) { console.error('❌ El empleado ya tiene ese cargo.'); process.exit(1); }
  if (!canManage(data, actor.role, newRole.carpeta)) { console.error(`❌ No puedes ascender a un cargo de nivel ${newRole.nivel} (igual o superior al tuyo ${actor.role.nivel}).`); logLine(data, session, actor.emp.id, 'rank', `DENEGADO: jerarquia hacia ${newRole.carpeta}`); process.exit(1); }

  // Mueve la carpeta del empleado: elimina las del/los cargo(s) anterior(es) salvo el nuevo.
  const oldCargos = [...(target.cargos || [])];
  const oldName = gen.fullName(target).replace(/ /g, '_');
  for (const oc of oldCargos) {
    if (oc === newRole.carpeta) continue;
    const dir = path.join(gen.STAFF, oc, oldName);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  target.cargo = newRole.carpeta;
  target.cargos = [newRole.carpeta];
  save(data, {
    roles: [...new Set([...oldCargos, newRole.carpeta])],
    employees: [`${target.id}:${newRole.carpeta}`],
  });
  logLine(data, session, actor.emp.id, 'rank', `empleado ${target.id} ${gen.fullName(target)} de ${oldCargos.join(',')} a ${newRole.carpeta}`);
  console.log(`✅ ${gen.fullName(target)} (${target.id}) ahora es ${newRole.nombre} (nivel ${newRole.nivel}). Carpeta movida y docs regeneradas.`);
}

const MODIFY_FIELDS = ['nombres', 'apellidos', 'telefono', 'correo', 'direccion', 'redes', 'supervisor', 'fechaIngreso'];

function doModify(args, session) {
  const data = read();
  const actor = actorOf(data, args.actor);
  if (!actor) { console.error('❌ Actor no valido.'); process.exit(1); }
  const target = findEmp(data, args.id);
  if (!target || target.estado !== 'activo') { console.error(`❌ Empleado ${args.id} no existe o no esta activo.`); process.exit(1); }
  const isSelf = target.id === actor.emp.id;
  // Auto-edición permitida: puedes corregir TUS propios datos (el rango nunca
  // se modifica por aquí). Para gestionar a OTROS se aplica permiso + jerarquía.
  if (!isSelf) {
    if (!actor.role.permisos.modificar) { console.error('❌ Tu cargo no tiene permiso para MODIFICAR datos.'); logLine(data, session, actor.emp.id, 'modify', 'DENEGADO: sin permiso modificar'); process.exit(1); }
    if (!canManage(data, actor.role, target.cargo)) { console.error(`❌ No puedes modificar un cargo de nivel igual o superior al tuyo.`); logLine(data, session, actor.emp.id, 'modify', `DENEGADO: jerarquia ${target.id}`); process.exit(1); }
  }
  const campo = args.campo;
  if (!MODIFY_FIELDS.includes(campo)) { console.error(`❌ Campo '${campo}' no modificable. Permitidos: ${MODIFY_FIELDS.join(', ')}.`); process.exit(1); }
  const valor = args.valor ?? '';
  const oldName = gen.fullName(target).replace(/ /g, '_');

  if (campo === 'redes') {
    try { target.redes = JSON.parse(valor || '[]'); } catch { console.error('❌ redes debe ser un JSON valido como [{"red":"X","url":"Y"}]'); process.exit(1); }
  } else if (campo === 'supervisor') {
    if (valor && !findEmp(data, valor)) { console.error(`❌ Supervisor ${valor} no existe.`); process.exit(1); }
    target.supervisor = valor || null;
  } else if (campo === 'fechaIngreso') {
    target.fechaIngreso = valor || null;
  } else {
    target[campo] = valor.trim();
  }

  // Si cambio el nombre, renombra las carpetas del empleado en todos sus cargos.
  const newName = gen.fullName(target).replace(/ /g, '_');
  if (newName !== oldName) {
    for (const c of target.cargos || []) {
      renameDir(path.join(gen.STAFF, c, oldName), path.join(gen.STAFF, c, newName));
    }
  }
  save(data, {
    roles: target.cargos || [target.cargo],
    employees: (target.cargos || [target.cargo]).map((c) => `${target.id}:${c}`),
  });
  logLine(data, session, actor.emp.id, 'modify', `empleado ${target.id} campo=${campo} (${oldName})`);
  console.log(`✅ ${gen.fullName(target)} (${target.id}) actualizado (campo ${campo}). Docs regeneradas.`);
}

// ---------- main ----------
function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const session = args.session || `staffcon-${nowStamp().replace(/[^\d]/g, '').slice(0, 14)}`;
  try {
    switch (cmd) {
      case 'login': doLogin(args); break;
      case 'list': doList(); break;
      case 'roles': doRoles(); break;
      case 'add': doAdd(args, session); break;
      case 'remove': doRemove(args, session); break;
      case 'rank': doRank(args, session); break;
      case 'modify': doModify(args, session); break;
      default:
        console.error('Uso: login|list|roles|add|remove|rank|modify. Ver cabecera del script.');
        process.exit(1);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

if (require.main === module) main();