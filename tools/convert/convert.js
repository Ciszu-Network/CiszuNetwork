/**
 * convert — kit universal de conversión de formatos para el repo.
 *
 * Uso:
 *   node tools/convert/convert.js <conversion> <input> [--out <archivo|directorio>]
 *
 * Conversiones:
 *   md2txt   txt2md   md2docx   md2pdf   docx2pdf   pdf2txt   csv2xlsx   xlsx2csv
 *
 * - input = archivo o directorio (batch: convierte todos los archivos de la extensión
 *   fuente, recursivo, preservando estructura).
 * - --out  = archivo destino (solo single-file) o directorio. Por defecto: mismo
 *   directorio del input (single) o subcarpeta <extDestino>/ (batch).
 *
 * Motores:
 *   md2docx → pandoc · md2pdf → pandoc+weasyprint si existe, si no reportlab
 *   docx2pdf → Word (COM, Windows) · pdf2txt → pypdf · csv2xlsx/xlsx2csv → openpyxl
 *   md2txt/txt2md → JS puro (sin dependencias)
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PANDOC = 'C:\\Users\\fplay\\AppData\\Local\\Microsoft\\WinGet\\Packages\\JohnMacFarlane.Pandoc_Microsoft.Winget.Source_8wekyb3d8bbwe\\pandoc-3.10\\pandoc.exe';
const ENGINES = path.join(__dirname, 'engines');

const CONVERSIONS = {
  'md2txt':   { src: '.md',   out: '.txt',  single: true },
  'txt2md':   { src: '.txt',  out: '.md',   single: true },
  'md2docx':  { src: '.md',   out: '.docx' },
  'md2pdf':   { src: '.md',   out: '.pdf'  },
  'docx2pdf': { src: '.docx', out: '.pdf'  },
  'pdf2txt':  { src: '.pdf',  out: '.txt'  },
  'csv2xlsx': { src: '.csv',  out: '.xlsx' },
  'xlsx2csv': { src: '.xlsx', out: '.csv'  },
};

const log = (...a) => console.log(...a);

// SIN shell (spawnSync con args array): las rutas del usuario no se interpretan
// nunca como comandos. Allowlist de binarios: solo se ejecutan exe de esta lista
// (fix semgrep detect-child-process, ago 2026).
const ALLOWED_BINS = new Set(['pandoc', 'python', 'powershell', 'weasyprint']);

function run(exe, args) {
  const bin = path.basename(exe).replace(/\.exe$/i, '');
  if (!ALLOWED_BINS.has(bin)) throw new Error(`Binario no permitido: ${exe}`);
  // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
  const r = spawnSync(exe, args, { stdio: 'inherit' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${path.basename(exe)} terminó con código ${r.status}`);
}

function weasyprintAvailable() {
  const r = spawnSync('weasyprint', ['--version'], { stdio: 'pipe' });
  return r.error ? false : r.status === 0;
}

function convertFile(pair, input, out) {
  const rel = path.relative(process.cwd(), input);
  log(`  → ${rel}  ⇒  ${path.relative(process.cwd(), out)}`);

  switch (pair) {
    case 'md2txt': {
      let t = fs.readFileSync(input, 'utf8');
      t = t.replace(/```[\s\S]*?```/g, (m) => m.replace(/^```.*$/gm, ''));
      t = t.replace(/^#{1,6}\s+/gm, '');
      t = t.replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2');
      t = t.replace(/`([^`\n]+)`/g, '$1');
      t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
      t = t.split('\n').map((l) => {
        const t0 = l.trim();
        if (t0.startsWith('|')) {
          const cells = t0.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
          if (cells.every((c) => /^[-:]+$/.test(c))) return '---';
          return cells.join(' | ');
        }
        return l;
      }).join('\n');
      fs.writeFileSync(out, t, 'utf8');
      break;
    }
    case 'txt2md': {
      let t = fs.readFileSync(input, 'utf8');
      t = t.replace(/-{10,}/g, '\n---\n');
      t = t.split('\n').map((l) => l.trimEnd()).join('\n');
      fs.writeFileSync(out, t, 'utf8');
      break;
    }
    case 'md2docx':
      run(PANDOC, [input, '-o', out]);
      break;
    case 'md2pdf': {
      if (weasyprintAvailable()) {
        run(PANDOC, [input, '-o', out, '--pdf-engine=weasyprint']);
      } else {
        run('python', [path.join(ENGINES, 'md2pdf.py'), input, '--out', out]);
      }
      break;
    }
    case 'docx2pdf':
      run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ENGINES, 'docx2pdf.ps1'), '-File', input, '-Out', out]);
      break;
    case 'pdf2txt':
      run('python', [path.join(ENGINES, 'pdf2txt.py'), input, '--out', out]);
      break;
    case 'csv2xlsx':
      run('python', [path.join(ENGINES, 'csv2xlsx.py'), input, '--out', out]);
      break;
    case 'xlsx2csv': {
      const outDir = fs.existsSync(out) && fs.statSync(out).isDirectory() ? out : path.dirname(out);
      run('python', [path.join(ENGINES, 'xlsx2csv.py'), input, '--out-dir', outDir]);
      break;
    }
    default:
      throw new Error(`Conversión no soportada: ${pair}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const pair = args.find((a) => !a.startsWith('--'));
  if (!pair || !CONVERSIONS[pair]) {
    log(`Uso: node tools/convert/convert.js <conversion> <input> [--out <archivo|directorio>]\n`);
    log(`Conversiones disponibles: ${Object.keys(CONVERSIONS).join('  ')}\n`);
    log(`Ejemplos:`);
    log(`  node tools/convert/convert.js md2pdf plantilla.md`);
    log(`  node tools/convert/convert.js md2docx docs/guia.md --out docs/guia.docx`);
    log(`  node tools/convert/convert.js csv2xlsx contabilidad/ --out contabilidad/xlsx`);
    log(`  node tools/convert/convert.js md2txt docs/ --out docs/txt   (batch)`);
    process.exit(1);
  }
  const rest = args.filter((a) => a !== pair);
  const i = rest.indexOf('--out');
  const input = (i >= 0 ? rest.slice(0, i)[0] : rest[0]);
  const outFlag = i >= 0 ? rest[i + 1] : null;
  if (!input) { log('Falta el archivo/directorio de entrada.'); process.exit(1); }

  const { src, out: ext } = CONVERSIONS[pair];
  const stats = fs.statSync(input);
  if (!stats.isDirectory() && path.extname(input).toLowerCase() !== src) {
    log(`Error: extensión esperada ${src} para ${pair}`); process.exit(1);
  }

  const inputs = stats.isDirectory()
    ? walk(input).filter((f) => f.toLowerCase().endsWith(src))
    : [input];

  if (inputs.length === 0) { log(`Sin archivos ${src} en ${input}`); process.exit(1); }

  let outDir;
  if (stats.isDirectory()) {
    outDir = outFlag || path.join(input, ext.replace('.', ''));
    fs.mkdirSync(outDir, { recursive: true });
  } else if (outFlag) {
    outDir = fs.existsSync(outFlag) && fs.statSync(outFlag).isDirectory() ? outFlag : path.dirname(outFlag);
  } else {
    outDir = path.dirname(input);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const outIsDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
  let ok = 0, fail = 0;
  for (const f of inputs) {
    const base = path.basename(f, path.extname(f));
    let outFile;
    if (stats.isDirectory()) {
      const relDir = path.dirname(path.relative(input, f));
      outFile = path.join(outDir, relDir === '.' ? '' : relDir, base + ext);
    } else if (outFlag && !outIsDir(outFlag)) {
      outFile = outFlag;
    } else {
      outFile = path.join(outDir, base + ext);
    }
    try { convertFile(pair, f, outFile); ok++; }
    catch (e) { log(`  FAIL ${f}: ${e.message}`); fail++; }
  }
  log(`\nConvertidos: ${ok} OK, ${fail} errores → ${outDir}`);
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

main();
