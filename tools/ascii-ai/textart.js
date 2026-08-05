#!/usr/bin/env node
// textart.js — Arte ASCII / ANSI de gran tamaño para cabeceras de terminal (Ciszu).
// Sin dependencias externas: fuente bloque propia (A-Z, 0-9, básica) + escala.
//
// Uso:
//   node tools/ascii-ai/textart.js --text "CISZU" --scale 2
//   node tools/ascii-ai/textart.js --text "NEON RUNNER" --scale 3 --ansi
//   node tools/ascii-ai/textart.js --text "CISZU" --ansi --color rainbow --frame
//   node tools/ascii-ai/textart.js --text "CISZU" --pixels "#" --out banner.txt
//
// Flags:
//   --text <texto>   texto (A-Z, 0-9, espacios y '.!:-')
//   --pixels <ch>    carácter de píxel encendido (default: '█')
//   --scale <n>      ancho por píxel (default 2)
//   --vscale <n>     repetir cada fila n veces (default 1)
//   --ansi           colorear gradiente neón y reset al final
//   --color <stil>   neon | rainbow  (solo con --ansi; default neon)
//   --frame          marco superior/inferior '━' a todo lo ancho
//   --out <archivo>  guardar resultado (texto plano o con escapes si --ansi)

const fs = require('fs');
const path = require('path');

const FONT = {
  A: ['..##..', '.#..#.', '#....#', '#....#', '######', '#....#', '#....#'],
  B: ['#####.', '#....#', '#....#', '#####.', '#....#', '#....#', '#####.'],
  C: ['.####.', '#....#', '#.....', '#.....', '#.....', '#....#', '.####.'],
  D: ['#####.', '#....#', '#....#', '#....#', '#....#', '#....#', '#####.'],
  E: ['######', '#.....', '#.....', '#####.', '#.....', '#.....', '######'],
  F: ['######', '#.....', '#.....', '####..', '#.....', '#.....', '#.....'],
  G: ['.####.', '#....#', '#.....', '#.###.', '#....#', '#....#', '.###..'],
  H: ['#....#', '#....#', '#....#', '######', '#....#', '#....#', '#....#'],
  I: ['######', '...#..', '...#..', '...#..', '...#..', '...#..', '######'],
  J: ['..####', '....#.', '....#.', '....#.', '....#.', '#...#.', '.###..'],
  K: ['#...#.', '#..#..', '#.#...', '##....', '#.#...', '#..#..', '#...#.'],
  L: ['#.....', '#.....', '#.....', '#.....', '#.....', '#.....', '######'],
  M: ['#....#', '##..##', '#.##.#', '#.##.#', '#....#', '#....#', '#....#'],
  N: ['#....#', '##...#', '#.#..#', '#..#.#', '#...##', '#....#', '#....#'],
  O: ['.####.', '#....#', '#....#', '#....#', '#....#', '#....#', '.####.'],
  P: ['#####.', '#....#', '#....#', '#####.', '#.....', '#.....', '#.....'],
  Q: ['.####.', '#....#', '#....#', '#....#', '#.#..#', '#..#..', '.#...#' ],
  R: ['#####.', '#....#', '#....#', '#####.', '#.#...', '#..#..', '#...#.'],
  S: ['.####.', '#....#', '#.....', '.####.', '.....#', '#....#', '.####.'],
  T: ['######', '..#...', '..#...', '..#...', '..#...', '..#...', '..#...'],
  U: ['#....#', '#....#', '#....#', '#....#', '#....#', '#....#', '.####.'],
  V: ['#....#', '#....#', '#....#', '#....#', '.#..#.', '.#..#.', '..##..'],
  W: ['#....#', '#....#', '#....#', '#.##.#', '#.##.#', '##..##', '#....#'],
  X: ['#....#', '#....#', '.#..#.', '..##..', '.#..#.', '#....#', '#....#'],
  Y: ['#....#', '#....#', '.#..#.', '..##..', '..#...', '..#...', '..#...'],
  Z: ['######', '.....#', '....#.', '...#..', '..#...', '.#....', '######'],
  '0': ['.####.', '#....#', '#...#.', '#..#..', '#.#...', '#....#', '.####.'],
  '1': ['..#...', '.##...', '..#...', '..#...', '..#...', '..#...', '..####'],
  '2': ['.####.', '#....#', '.....#', '..##..', '.#....', '#.....', '######'],
  '3': ['#####.', '.....#', '.....#', '.####.', '.....#', '.....#', '#####.'],
  '4': ['...#..', '..##..', '.#.#..', '#..#..', '######', '...#..', '...#..'],
  '5': ['######', '#.....', '#.....', '#####.', '.....#', '#....#', '.####.'],
  '6': ['.####.', '#.....', '#.....', '#####.', '#....#', '#....#', '.####.'],
  '7': ['######', '.....#', '.....#', '...#..', '..#...', '..#...', '..#...'],
  '8': ['.####.', '#....#', '#....#', '.####.', '#....#', '#....#', '.####.'],
  '9': ['.####.', '#....#', '#....#', '.###..', '.....#', '#....#', '.####.'],
  '.': ['......', '......', '......', '......', '......', '..##..', '..##..'],
  '!': ['..#...', '..#...', '..#...', '..#...', '..#...', '......', '..#...'],
  ':': ['......', '..##..', '..##..', '......', '..##..', '..##..', '......'],
  '-': ['......', '......', '......', '######', '......', '......', '......'],
  ' ': ['......', '......', '......', '......', '......', '......', '......'],
};

function parseArgs(argv) {
  const args = {};
  const withVal = ['text', 'pixels', 'scale', 'vscale', 'color', 'out'];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    if (withVal.includes(key)) { args[key] = argv[i + 1] || ''; i++; }
    else args[key] = true;
  }
  return args;
}

const RESET = '\x1b[0m';
const rgb = (r, g, b) => `\x1b[38;2;${r};${g};${b}m`;

function gradient(steps, from, to) {
  const out = [];
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 1 : i / (steps - 1);
    out.push([
      Math.round(from[0] + (to[0] - from[0]) * t),
      Math.round(from[1] + (to[1] - from[1]) * t),
      Math.round(from[2] + (to[2] - from[2]) * t),
    ]);
  }
  return out;
}

function render(text, pixels, scale, vscale) {
  const lines = [];
  for (let r = 0; r < 7; r++) {
    let line = '';
    for (const ch of text.toUpperCase()) {
      const glyph = FONT[ch] || FONT[' '];
      for (const p of glyph[r]) {
        line += p === '#' ? pixels.repeat(scale) : ' '.repeat(scale);
      }
      line += ' '.repeat(scale);
    }
    for (let v = 0; v < vscale; v++) lines.push(line);
  }
  return lines;
}

function colorize(lines, style, frame) {
  const width = Math.max(...lines.map((l) => l.length));
  const NEON = gradient(lines.length, [0, 229, 255], [255, 71, 201]);
  const RAIN = gradient(lines.length, [255, 0, 80], [0, 230, 255]);
  const pal = style === 'rainbow' ? RAIN : NEON;
  const painted = lines.map((l, i) => {
    const [r, g, b] = pal[i];
    return rgb(r, g, b) + l + RESET;
  });
  const bar = frame ? `${rgb(0, 229, 255)}${'━'.repeat(width)}${RESET}` : '';
  return bar ? `${bar}\n${painted.join('\n')}\n${bar}` : painted.join('\n');
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log('Uso: node tools/ascii-ai/textart.js --text "CISZU" [--pixels #] [--scale 2] [--vscale 1] [--ansi] [--color neon] [--frame] [--out archivo] [--help]');
  process.exit(0);
}
const text = args.text || 'CISZU';
const pixels = args.pixels || '█';
const scale = Math.max(1, parseInt(args.scale || '2', 10) || 1);
const vscale = Math.max(1, parseInt(args.vscale || '1', 10) || 1);
const ansi = !!args.ansi;
const style = (args.color || 'neon').toLowerCase();
const frame = !!args.frame;

const lines = render(text, pixels, scale, vscale);
const out = ansi ? colorize(lines, style, frame) : lines.join('\n');
if (args.out) {
  fs.writeFileSync(path.resolve(args.out), out + '\n', 'utf8');
  console.error(`  [ok] guardado → ${args.out}`);
}
process.stdout.write((args.out ? '' : '') + out + '\n');