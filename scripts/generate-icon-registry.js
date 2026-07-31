const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'shared', 'icons', 'svg');
const OUT_DIR = path.join(ROOT, 'packages', 'ui', 'src', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'icon-registry.ts');

const STYLES = ['outline', 'filled'];

const ICON_LIST = [
  'home', 'search', 'settings', 'menu', 'close', 'user', 'heart', 'star',
  'check', 'download', 'delete', 'edit', 'add', 'remove', 'calendar', 'clock',
  'info', 'help', 'warning', 'error', 'refresh', 'share', 'mail', 'globe',
  'lock', 'eye', 'copy', 'pause',
];

function parseSvg(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/);
  if (!match) return null;
  return { viewBox: match[1], inner: match[2].trim() };
}

function main() {
  if (!fs.existsSync(ICONS_DIR)) {
    console.error(`  [!] No existe ${ICONS_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const registry = {};
  for (const style of STYLES) {
    registry[style] = {};
    const styleDir = path.join(ICONS_DIR, style);
    if (!fs.existsSync(styleDir)) continue;
    for (const name of ICON_LIST) {
      const file = path.join(styleDir, `${name}.svg`);
      if (!fs.existsSync(file)) continue;
      const parsed = parseSvg(file);
      if (parsed) registry[style][name] = parsed;
    }
  }

  const lines = [];
  lines.push('// ARCHIVO GENERADO — no editar a mano.');
  lines.push('// Regenerar con: node scripts/generate-icon-registry.js');
  lines.push('// Fuente: shared/icons/svg/{outline,filled}/<nombre>.svg');
  lines.push('');
  lines.push('export interface IconEntry {');
  lines.push('  viewBox: string;');
  lines.push('  inner: string;');
  lines.push('}');
  lines.push('');
  lines.push('export const iconRegistry: Record<string, Record<string, IconEntry>> = {');
  for (const style of STYLES) {
    const names = Object.keys(registry[style]);
    lines.push(`  ${style}: {`);
    for (const name of names) {
      const entry = registry[style][name];
      lines.push(`    ${name}: { viewBox: ${JSON.stringify(entry.viewBox)}, inner: ${JSON.stringify(entry.inner)} },`);
    }
    lines.push('  },');
  }
  lines.push('};');
  lines.push('');
  lines.push('export function getIcon(style: string, name: string): IconEntry | undefined {');
  lines.push('  return iconRegistry[style]?.[name];');
  lines.push('}');
  lines.push('');

  fs.writeFileSync(OUT_FILE, lines.join('\n'));
  const total = Object.values(registry).reduce((acc, s) => acc + Object.keys(s).length, 0);
  console.log(`  [OK] ${total} iconos registrados (${STYLES.map(s => `${s}: ${Object.keys(registry[s]).length}`).join(', ')}) -> ${OUT_FILE}`);
}

main();
