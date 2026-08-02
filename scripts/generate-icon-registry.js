const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'shared', 'icons', 'svg');
const OUT_DIR = path.join(ROOT, 'packages', 'ui', 'src', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'icon-registry.ts');

const STYLES = [
  { key: 'outline', dir: 'outline' },
  { key: 'filled', dir: 'filled' },
  { key: 'flag', dir: 'flags' },
];

const FLAG_NAMES = [
  'ar', 'au', 'bo', 'br', 'ca', 'cl', 'cn', 'co', 'cr', 'cu', 'de', 'do',
  'ec', 'es-ct', 'es', 'fr', 'gb', 'gt', 'hn', 'id', 'in', 'it', 'jp', 'kr',
  'mx', 'ni', 'nl', 'other', 'pa', 'pe', 'ph', 'pl', 'pr', 'pt', 'py', 'ru',
  'sa', 'se', 'sv', 'th', 'tr', 'us', 'uy', 've', 'vn',
];

const ICON_LIST = [
  'home', 'search', 'settings', 'menu', 'close', 'user', 'heart', 'star',
  'check', 'download', 'delete', 'edit', 'add', 'remove', 'calendar', 'clock',
  'info', 'help', 'warning', 'error', 'refresh', 'share', 'mail', 'globe',
  'lock', 'eye', 'copy', 'pause',
  // UI general (ciszubot web, status pages)
  'moon', 'sun', 'discord', 'gamepad', 'hand', 'message', 'comment', 'support',
  'terms', 'policies', 'faq', 'team', 'verified', 'wifi', 'id-card', 'headset',
  'life-ring', 'key', 'external', 'security', 'favorite', 'flag', 'person',
  'group', 'people', 'envelope', 'paper-plane', 'timer', 'watch-later',
  'update', 'power', 'tv', 'credit-card', 'certificates', 'heart-pulse',
  'language', 'play', 'gift',
  // Solo disponibles en filled (se omiten en outline automáticamente)
  'server', 'terminal', 'shield', 'users', 'signal', 'crown', 'dice', 'medal',
  'trophy', 'robot', 'rocket', 'palette', 'arrow-right',
  // Navegación / chevrons
  'chevronRight', 'arrow-back',
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
    registry[style.key] = {};
    const styleDir = path.join(ICONS_DIR, style.dir);
    if (!fs.existsSync(styleDir)) continue;
    const names = style.key === 'flag'
      ? FLAG_NAMES
      : ICON_LIST;
    for (const name of names) {
      const file = path.join(styleDir, `${name}.svg`);
      if (!fs.existsSync(file)) continue;
      const parsed = parseSvg(file);
      if (parsed) registry[style.key][name] = parsed;
    }
  }

  const lines = [];
  lines.push('// ARCHIVO GENERADO — no editar a mano.');
  lines.push('// Regenerar con: node scripts/generate-icon-registry.js');
  lines.push('// Fuente: shared/icons/svg/{outline,filled,flags}/<nombre>.svg');
  lines.push('');
  lines.push('export interface IconEntry {');
  lines.push('  viewBox: string;');
  lines.push('  inner: string;');
  lines.push('}');
  lines.push('');
  lines.push('export const iconRegistry: Record<string, Record<string, IconEntry>> = {');
  for (const style of STYLES) {
    const names = Object.keys(registry[style.key]);
    lines.push(`  ${style.key}: {`);
    for (const name of names) {
      const entry = registry[style.key][name];
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
      lines.push(`    ${key}: { viewBox: ${JSON.stringify(entry.viewBox)}, inner: ${JSON.stringify(entry.inner)} },`);
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
  console.log(`  [OK] ${total} iconos registrados (${STYLES.map(s => `${s.key}: ${Object.keys(registry[s.key]).length}`).join(', ')}) -> ${OUT_FILE}`);
}

main();
