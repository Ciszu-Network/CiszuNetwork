// remove-bg.js — remoción de fondo a PNG transparente (100% gratis, uso comercial OK).
//
// Métodos:
//   1. chroma (default): flood-fill desde los bordes detectando el color de fondo dominante
//      (ideal para imágenes generadas con ART_GUIDE, fondo = franja de color sólido).
//   2. birefnet: modelo de segmentación BiRefNet (MIT, comercial OK) vía rembg (Python).
//      Requiere: pip install "rembg[cpu]" onnxruntime  (primera vez descarga ~1GB pesos).
//
// Uso:
//   node scripts/remove-bg.js --input <png> [--output <png>] [--tolerance 40]
//   node scripts/remove-bg.js --input <png> --method birefnet
//
// Flags:
//   --input <file>     imagen de entrada (PNG/JPEG)
//   --output <file>    salida (default: <input>_transparent.png)
//   --method <m>       chroma | birefnet (default: chroma)
//   --tolerance <n>    distancia de color máxima para considerarse fondo (default: 40, 0-255)
//   --feather <n>      suavizado de bordes en px (default: 1)
//
// Notas de licencia: pngjs (MIT), BiRefNet (MIT, uso comercial libre). RMBG de BRIA
// es CC BY-NC → NO usar para comercial (queda descartado).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) / Math.sqrt(3 * 255 * 255) * 255;
}

function detectBackgroundColor(png) {
  const { width, height, data } = png;
  const edges = [];
  const step = 8;
  for (let x = 0; x < width; x += step) {
    edges.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y += step) {
    edges.push([0, y], [width - 1, y]);
  }
  const buckets = new Map();
  for (const [x, y] of edges) {
    const idx = (y * width + x) * 4;
    if (data[idx + 3] < 250) continue;
    const key = `${data[idx] >> 4},${data[idx + 1] >> 4},${data[idx + 2] >> 4}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  let best = null;
  let bestCount = 0;
  for (const [key, count] of buckets) {
    if (count > bestCount) {
      bestCount = count;
      best = key.split(',').map((n) => (Number(n) << 4) | 8);
    }
  }
  if (!best) throw new Error('No se pudo detectar color de fondo');
  return { r: best[0], g: best[1], b: best[2] };
}

function removeChroma(inputFile, outputFile, tolerance, feather) {
  const { PNG } = require('pngjs');
  const png = PNG.sync.read(fs.readFileSync(inputFile));
  const { width, height, data } = png;
  const bg = detectBackgroundColor(png);

  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = [];
  for (let x = 0; x < width; x++) {
    queue.push(x, 0, x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y, width - 1, y);
  }
  while (queue.length) {
    const y = queue.pop();
    const x = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const p = idx * 4;
    if (data[p + 3] < 250) continue;
    const dist = colorDistance(data[p], data[p + 1], data[p + 2], bg.r, bg.g, bg.b);
    if (dist > tolerance) continue;
    isBg[idx] = 1;
    data[p + 3] = 0;
    queue.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  if (feather > 0) {
    const blur = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (data[idx * 4 + 3] === 0) continue;
        let nearBg = 0;
        for (let dy = -feather; dy <= feather; dy++) {
          for (let dx = -feather; dx <= feather; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            if (data[(ny * width + nx) * 4 + 3] === 0) nearBg++;
          }
        }
        const total = (feather * 2 + 1) ** 2;
        blur[idx] = nearBg / total;
      }
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const a = data[idx * 4 + 3];
        if (a === 0) continue;
        const reduce = blur[idx] * a;
        if (reduce > 0) {
          data[idx * 4 + 3] = Math.max(0, Math.min(255, Math.round(a - reduce)));
        }
      }
    }
  }

  fs.writeFileSync(outputFile, PNG.sync.write(png));
  console.log(`  ✓ ${outputFile} (fondo detectado rgb(${bg.r},${bg.g},${bg.b}), tolerancia ${tolerance})`);
}

function removeBirefnet(inputFile, outputFile) {
  const script = `
from rembg import remove, new_session
from PIL import Image
import sys
inp, out = sys.argv[1], sys.argv[2]
session = new_session("birefnet-general")
img = Image.open(inp)
res = remove(img, session=session)
res.save(out)
print("ok")
`;
  const tmp = path.join(ROOT, '.opencode', 'temp', `rembg_${Date.now()}.py`);
  fs.writeFileSync(tmp, script);
  try {
    const out = execFileSync('python', [tmp, inputFile, outputFile], { encoding: 'utf8', timeout: 300000 });
    console.log(`  ✓ ${outputFile} (BiRefNet: ${out.trim()})`);
  } catch (e) {
    const msg = String(e.stderr || e.message || e).slice(0, 500);
    if (msg.includes('No module named')) {
      throw new Error('rembg no instalado. Ejecuta: pip install "rembg[cpu]" onnxruntime');
    }
    throw new Error(`BiRefNet falló: ${msg}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    console.error('Uso: node scripts/remove-bg.js --input <png> [--method chroma|birefnet] [--tolerance 40]');
    process.exit(1);
  }
  const inputFile = path.resolve(ROOT, args.input);
  const outputFile = path.resolve(ROOT, args.output || inputFile.replace(/\.(png|jpg|jpeg)$/i, '_transparent.png'));
  const method = (args.method || 'chroma').toLowerCase();
  const tolerance = args.tolerance !== undefined ? Number(args.tolerance) : 40;
  const feather = args.feather !== undefined ? Number(args.feather) : 1;

  if (!fs.existsSync(inputFile)) {
    console.error(`No existe: ${inputFile}`);
    process.exit(1);
  }
  console.log(`[${method}] ${inputFile} → ${outputFile}`);
  if (method === 'birefnet') {
    removeBirefnet(inputFile, outputFile);
  } else {
    removeChroma(inputFile, outputFile, tolerance, feather);
  }
  console.log('Listo.');
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});