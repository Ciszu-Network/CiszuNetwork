// Localiza el archivo que añade deuda de traducción comparando con HEAD.
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const { extractHardcodedStrings } = await import(
  new URL('../packages/utils/src/i18nCoverage.ts', import.meta.url).href
);

const ROOT = process.cwd();
const WEB = process.argv[2] || 'ciszu';

function listSourceFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'api') continue;
      listSourceFiles(full, out);
    } else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) out.push(full);
  }
  return out;
}

let before = 0;
let after = 0;
const rows = [];
for (const file of listSourceFiles(join(ROOT, 'projects', WEB, 'website', 'src'))) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const next = extractHardcodedStrings(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).length;
  let prevText = '';
  try {
    prevText = execSync(`git show HEAD:"${rel}"`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch {
    prevText = '';
  }
  const prev = prevText ? extractHardcodedStrings(prevText.replace(/\r\n/g, '\n')).length : 0;
  before += prev;
  after += next;
  if (next !== prev) rows.push(`${String(next - prev).padStart(4)}  ${rel}  (${prev} -> ${next})`);
}
console.log(`${WEB}: ${before} -> ${after}`);
console.log(rows.join('\n'));
