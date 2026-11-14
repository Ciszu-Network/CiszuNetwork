import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = new Set(process.argv.slice(2));
const dry = args.has('--dry-run');
const all = args.has('--all');

const targets = [];
if (all || args.has('--next')) {
  const projects = path.join(root, 'projects');
  for (const project of fs.readdirSync(projects, { withFileTypes: true })) {
    if (!project.isDirectory()) continue;
    const next = path.join(projects, project.name, 'website', '.next');
    if (fs.existsSync(next)) targets.push(next);
  }
}
if (all || args.has('--turbo')) {
  const turbo = path.join(root, '.turbo');
  if (fs.existsSync(turbo)) targets.push(turbo);
}
if (all || args.has('--logs')) {
  const logs = path.join(root, 'test', 'website', 'debug', 'local-logs');
  if (fs.existsSync(logs)) targets.push(logs);
}

if (!targets.length) {
  console.log('No hay caches seleccionadas. Usa --next, --turbo, --logs o --all.');
  process.exit(0);
}

for (const target of targets) {
  let bytes = 0;
  for (const file of walk(target)) bytes += file.size;
  const size = (bytes / 1024 ** 2).toFixed(1);
  if (dry) {
    console.log(`[dry-run] ${path.relative(root, target)} (${size} MB)`);
  } else {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`[clean] ${path.relative(root, target)} (${size} MB)`);
  }
}

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) {
      try {
        yield { path: full, size: fs.statSync(full).size };
      } catch {}
    }
  }
}
