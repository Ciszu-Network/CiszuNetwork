/**
 * sync-commands.mjs — regenera el catálogo de comandos de la web desde el
 * CÓDIGO REAL del bot. Se ejecuta automáticamente en `prebuild` (y por tanto
 * en cada build/deploy de Vercel): la página de comandos y el QuickHelp del
 * dashboard siempre reflejan los comandos reales, con categorías, tags de
 * búsqueda y premium derivados del código.
 *
 * Uso manual: node scripts/sync-commands.mjs
 *             node scripts/sync-commands.mjs --check   (falla si está desactualizado)
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// El script vive en la raíz del proyecto web: ROOT = carpeta de la web.
const ROOT = __dirname;
const BOT_SRC = join(ROOT, '..', 'discord-bot', 'src');
const OUT = join(ROOT, 'src', 'data', 'commands.generated.ts');
const CHECK = process.argv.includes('--check');

if (!existsSync(BOT_SRC)) {
  // Build aislado sin el monorepo (p. ej. Vercel con solo la carpeta web):
  // se conserva el catálogo ya generado.
  console.log('sync-commands: sin acceso al código del bot, se mantiene el catálogo actual.');
  process.exit(0);
}

// ─── 1. Premium: leer config/features.ts del bot ───
const featuresSrc = readFileSync(join(BOT_SRC, 'config', 'features.ts'), 'utf8');
const premiumCategories = new Set();
const premiumCommands = new Set();
for (const match of featuresSrc.matchAll(/\{ slug: '([a-z]+)', label: '[^']+', categories: \[([^\]]+)\][^}]*premium: true/g)) {
  for (const cat of match[2].matchAll(/'([^']+)'/g)) premiumCategories.add(cat[1]);
}
for (const match of featuresSrc.matchAll(/\{ slug: '([a-z]+)', label: '[^']+', commands: \[([^\]]+)\][^}]*premium: true/g)) {
  for (const cmd of match[2].matchAll(/'([^']+)'/g)) premiumCommands.add(cmd[1]);
}
for (const match of featuresSrc.matchAll(/PREMIUM_COMMANDS = new Set\(\[([^\]]+)\]\)/g)) {
  for (const cmd of match[1].matchAll(/'([^']+)'/g)) premiumCommands.add(cmd[1]);
}

// ─── 2. Parsear cada archivo de comandos ───
const NAME_RE = /name:\s*'([^']+)',\s*\n\s*description:\s*'((?:[^'\\]|\\.)*)'/g;
const TERNARY_RE =
  /name:\s*\w+\s*===\s*'(\w+)'\s*\?\s*'([^']+)'\s*:\s*'([^']+)',\s*\n\s*description:\s*\w+\s*===\s*'(\w+)'\s*\?\s*'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g;
const files = readdirSync(join(BOT_SRC, 'commands')).filter((f) => f.endsWith('.ts'));
const commands = [];

for (const file of files) {
  const src = readFileSync(join(BOT_SRC, 'commands', file), 'utf8');
  const starts = [];
  for (const match of src.matchAll(NAME_RE)) {
    starts.push({ index: match.index, names: [match[1]], descriptions: [match[2]] });
  }
  for (const match of src.matchAll(TERNARY_RE)) {
    starts.push({ index: match.index, names: [match[2], match[3]], descriptions: [match[5], match[6]] });
  }
  starts.sort((a, b) => a.index - b.index);
  for (let i = 0; i < starts.length; i++) {
    const block = src.slice(starts[i].index, starts[i + 1]?.index ?? src.length);
    let aliasGroups = [...(block.match(/aliases:\s*\[([^\]]*)\]/)?.[1].matchAll(/'([^']+)'/g) ?? [])].map((m) => m[1]);
    if (aliasGroups.length === 0) {
      const ternaryAliases = block.match(/aliases:\s*[^?]*\?\s*\[([^\]]*)\]\s*:\s*\[([^\]]*)\]/);
      if (ternaryAliases) {
        aliasGroups = [
          [...ternaryAliases[1].matchAll(/'([^']+)'/g)].map((m) => m[1]),
          [...ternaryAliases[2].matchAll(/'([^']+)'/g)].map((m) => m[1]),
        ];
      }
    }
    const usage = block.match(/usage:\s*'([^']+)'/)?.[1];
    const category = block.match(/category:\s*'([^']+)'/)?.[1] ?? 'General';
    starts[i].names.forEach((name, variant) => {
      const aliases = Array.isArray(aliasGroups[0]) ? (aliasGroups[variant] ?? aliasGroups[0]) : aliasGroups;
      commands.push({
        name,
        description: starts[i].descriptions[variant].replace(/\\'/g, "'"),
        aliases,
        usage: usage ?? `cz!${name}`,
        category,
      });
    });
  }
}

// ─── 3. Orden de categorías + iconos ───
const CATEGORY_ORDER = [
  'Economía', 'Niveles', 'Social', 'Diversión', 'Música', 'Búsqueda',
  'Información', 'Utilidad', 'Moderación', 'Configuración', 'Secreto', 'General',
];
const CATEGORY_ICONS = {
  'Diversión': 'gamepad', 'Economía': 'money', 'Información': 'info', 'Música': 'music',
  'Niveles': 'star', 'Social': 'people', 'Utilidad': 'settings', 'Moderación': 'shield',
  'Configuración': 'settings', 'Búsqueda': 'search', 'Secreto': 'lock', 'General': 'help',
};

// ─── 4. Tags de búsqueda derivados ───
const STOPWORDS = new Set(['de', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'o', 'a', 'en', 'con', 'por', 'para', 'del', 'al', 'que', 'se', 'su', 'tu', 'es', 'sin', 'más', 'mas', 'muy', 'te', 'ti', 'lo']);
function deriveTags(cmd) {
  const words = `${cmd.name} ${cmd.description}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const tags = new Set([cmd.category.toLowerCase(), ...words.slice(0, 8)]);
  return [...tags].slice(0, 10);
}

const enriched = commands.map((cmd) => ({
  ...cmd,
  icon: CATEGORY_ICONS[cmd.category] ?? 'help',
  premium: premiumCommands.has(cmd.name) || premiumCategories.has(cmd.category),
  tags: deriveTags(cmd),
}));

const order = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
enriched.sort((a, b) => {
  const ca = order.get(a.category) ?? 99;
  const cb = order.get(b.category) ?? 99;
  return ca !== cb ? ca - cb : a.name.localeCompare(b.name);
});

const categories = [...new Set(enriched.map((c) => c.category))];

// ─── 5. Escribir el archivo generado ───
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const lines = [];
lines.push('/**');
lines.push(' * GENERADO AUTOMÁTICAMENTE — NO EDITAR A MANO.');
lines.push(' * Fuente: projects/ciszubot/discord-bot/src/commands/*.ts (código real del bot).');
lines.push(' * Se regenera solo en cada build de la web (prebuild).');
lines.push(' */');
lines.push('');
lines.push('export interface CommandInfo {');
lines.push('  name: string;');
lines.push('  description: string;');
lines.push('  aliases: string[];');
lines.push('  usage: string;');
lines.push('  category: string;');
lines.push('  icon: string;');
lines.push('  premium: boolean;');
lines.push('  tags: string[];');
lines.push('}');
lines.push('');
lines.push(`export const CATEGORIES: string[] = ${JSON.stringify(categories)};`);
lines.push('');
lines.push('export const COMMANDS: CommandInfo[] = [');
let lastCat = '';
for (const cmd of enriched) {
  if (cmd.category !== lastCat) {
    lines.push(`  // ─── ${cmd.category} ───`);
    lastCat = cmd.category;
  }
  lines.push('  {');
  lines.push(`    name: '${esc(cmd.name)}',`);
  lines.push(`    description: '${esc(cmd.description)}',`);
  lines.push(`    aliases: ${JSON.stringify(cmd.aliases)},`);
  lines.push(`    usage: '${esc(cmd.usage)}',`);
  lines.push(`    category: '${esc(cmd.category)}',`);
  lines.push(`    icon: '${cmd.icon}',`);
  lines.push(`    premium: ${cmd.premium},`);
  lines.push(`    tags: ${JSON.stringify(cmd.tags)},`);
  lines.push('  },');
}
lines.push('];');
lines.push('');

const content = lines.join('\n');

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current === content) {
    console.log(`sync-commands: OK (${enriched.length} comandos, ${categories.length} categorías).`);
  } else {
    console.error(`sync-commands: catálogo DESACTUALIZADO (${enriched.length} comandos). Ejecuta sin --check.`);
    process.exitCode = 1;
  }
} else {
  writeFileSync(OUT, content, 'utf8');
  console.log(`sync-commands: ${enriched.length} comandos en ${categories.length} categorías.`);
}
