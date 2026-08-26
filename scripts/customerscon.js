/**
 * CUSTOMERSCON - Motor de la Customers Console (gestion de clientes)
 *
 * CLI que gestiona archives/customers/data/customers.json y regenera la
 * documentacion (scripts/customersgen.js) tras cada mutacion. La TUI vive en
 * test/website/debug/customerscon.ps1.
 *
 * Sin cargos ni prioridad: cualquier persona con la password de la consola
 * puede añadir/quitar/modificar clientes. Toda accion queda en el log.
 *
 * Uso:
 *   node scripts/customerscon.js list
 *   node scripts/customerscon.js summary
 *   node scripts/customerscon.js add --session <s> --actor <a> --nombres X --apellidos Y --asunto Z [--telefono T --correo E --direccion D --fecha AAAA-MM-DD]
 *   node scripts/customerscon.js remove --session <s> --actor <a> --id <target> --motivo "..."
 *   node scripts/customerscon.js modify --session <s> --actor <a> --id <target> --campo <campo> --valor <valor>
 */

const path = require('path');
const fs = require('fs');
const gen = require('./staffgen.js');
const cgen = require('./customersgen.js');

const ROOT = gen.ROOT;
const LOG_DIR = path.join(ROOT, 'test', 'website', 'debug', 'local-logs');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[++i] ?? '';
    else args._.push(a);
  }
  return args;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function logLine(data, session, actor, action, detail) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const file = path.join(LOG_DIR, `customerscon-${today()}.log`);
  const line = `[${nowStamp()}] ${session} actor=${actor} accion=${action} ${detail}`;
  fs.appendFileSync(file, line + '\n');
  console.log(`  ${line}`);
}

function read() {
  return cgen.readData();
}

function save(data, scope) {
  data.actualizacion = today();
  fs.writeFileSync(cgen.DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  if (scope && scope.length) cgen.generateScoped(data, scope);
  else cgen.generate(data);
}

function findC(data, id) {
  return data.customers.find((c) => c.id === id);
}

function nextId(data) {
  const max = data.customers.reduce((m, c) => {
    const n = parseInt((c.id || '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  const p = data.org.prefijoId || 'CL';
  return `${p}-${String(max + 1).padStart(3, '0')}`;
}

// ---------- acciones ----------
function doList() {
  const data = read();
  for (const c of data.customers) {
    console.log(`${c.id}|${cgen.cname(c)}|${c.asunto || ''}|${c.estado}`);
  }
}

function doSummary() {
  const data = read();
  console.log(`CISZU NETWORK - CLIENTES (${data.customers.length} totales)`);
  console.log('---');
  for (const c of data.customers) {
    const mark = c.estado === 'activo' ? '[ACTIVO]' : '[BAJA]';
    console.log(`  ${c.id}  ${cgen.cname(c).padEnd(22)} ${mark} asunto: ${c.asunto || '-'}`);
  }
  const act = data.customers.filter((c) => c.estado === 'activo').length;
  console.log(`---`);
  console.log(`Activos: ${act} · Bajas: ${data.customers.length - act} · Fuente: ${cgen.DATA_FILE}`);
}

function doAdd(args, session) {
  const data = read();
  const nombres = (args.nombres || '').trim();
  const apellidos = (args.apellidos || '').trim();
  if (!nombres || !apellidos) {
    console.error('❌ nombres y apellidos son obligatorios.');
    logLine(data, session, args.actor || '?', 'add', 'DENEGADO: sin nombres/apellidos');
    process.exit(1);
  }
  const id = nextId(data);
  const c = {
    id,
    nombres,
    apellidos,
    asunto: (args.asunto || '').trim(),
    telefono: args.telefono || '',
    correo: args.correo || '',
    direccion: args.direccion || '',
    redes: [],
    fecha: args.fecha || null,
    estado: 'activo',
    registroBaja: null,
  };
  data.customers.push(c);
  save(data, [id]);
  logLine(data, session, args.actor || '?', 'add', `cliente ${id} ${cgen.cname(c)} asunto="${c.asunto}"`);
  console.log(`✅ Cliente ${id} (${cgen.cname(c)}) añadido. Carpeta y 5 formatos regenerados.`);
}

function doRemove(args, session) {
  const data = read();
  const target = findC(data, args.id);
  if (!target || target.estado !== 'activo') {
    console.error(`❌ Cliente ${args.id} no existe o ya no esta activo.`);
    process.exit(1);
  }
  const motivo = (args.motivo || '').trim() || 'Baja no especificada';
  target.estado = 'inactivo';
  target.registroBaja = {
    eliminadoPor: args.actor || '?',
    fecha: today(),
    motivo,
    datosPrevio: { ...target },
  };
  save(data, [target.id]);
  logLine(data, session, args.actor || '?', 'remove', `cliente ${target.id} ${cgen.cname(target)} motivo="${motivo}" (ID conservado)`);
  console.log(`✅ Cliente ${target.id} (${cgen.cname(target)}) dado de baja. Carpeta conservada con registro; ID nunca se reutilizara.`);
}

const MODIFY_FIELDS = ['nombres', 'apellidos', 'asunto', 'telefono', 'correo', 'direccion', 'redes', 'fecha'];

function doModify(args, session) {
  const data = read();
  const target = findC(data, args.id);
  if (!target || target.estado !== 'activo') {
    console.error(`❌ Cliente ${args.id} no existe o no esta activo.`);
    process.exit(1);
  }
  const campo = args.campo;
  if (!MODIFY_FIELDS.includes(campo)) {
    console.error(`❌ Campo '${campo}' no valido. Permitidos: ${MODIFY_FIELDS.join(', ')}.`);
    process.exit(1);
  }
  const valor = args.valor ?? '';
  const oldName = cgen.slugName(target);

  if (campo === 'redes') {
    try { target.redes = JSON.parse(valor || '[]'); } catch { console.error('❌ redes debe ser un JSON valido como [{"red":"X","url":"Y"}]'); process.exit(1); }
  } else if (campo === 'fecha') {
    target.fecha = valor || null;
  } else {
    target[campo] = valor.trim();
  }

  const newName = cgen.slugName(target);
  if (newName !== oldName) {
    const from = path.join(cgen.CUSTOMERS, oldName);
    const to = path.join(cgen.CUSTOMERS, newName);
    if (fs.existsSync(from) && !fs.existsSync(to)) fs.renameSync(from, to);
  }
  save(data, [target.id]);
  logLine(data, session, args.actor || '?', 'modify', `cliente ${target.id} campo=${campo} (${oldName})`);
  console.log(`✅ ${cgen.cname(target)} (${target.id}) actualizado (campo ${campo}). Docs regeneradas.`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const session = args.session || `customerscon-${nowStamp().replace(/[^\d]/g, '').slice(0, 14)}`;
  try {
    switch (cmd) {
      case 'list': doList(); break;
      case 'summary': doSummary(); break;
      case 'add': doAdd(args, session); break;
      case 'remove': doRemove(args, session); break;
      case 'modify': doModify(args, session); break;
      default:
        console.error('Uso: list|summary|add|remove|modify. Ver cabecera del script.');
        process.exit(1);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

if (require.main === module) main();