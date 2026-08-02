/* Genera commands.json y docs/slash-commands.md desde los comandos compilados del bot */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'apps', 'ciszubot', 'discord-bot', 'dist', 'commands');
const outJson = path.join(__dirname, '..', 'apps', 'ciszubot', 'discord-bot', 'commands.json');
const outMd = path.join(__dirname, '..', 'apps', 'ciszubot', 'docs', 'slash-commands.md');
const outMdJson = path.join(__dirname, '..', 'apps', 'ciszubot', 'docs', 'slash-commands.json');

const files = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
const commands = [];
for (const file of files) {
  const loaded = require(path.join(distDir, file));
  const raw = loaded.default ?? loaded;
  const list = Array.isArray(raw) ? raw : [raw];
  for (const entry of list) {
    const cmd = typeof entry === 'function' ? entry() : entry;
    if (!cmd?.name) continue;
    const slash = cmd.slashCommand?.toJSON?.() ?? null;
    commands.push({
      name: cmd.name,
      description: cmd.description,
      aliases: cmd.aliases ?? [],
      usage: cmd.usage,
      category: cmd.category,
      slash,
    });
  }
}

commands.sort((a, b) => a.name.localeCompare(b.name));

const json = commands.map((c) => ({
  name: c.name,
  description: c.description,
  type: 1,
  options: c.slash?.options ?? [],
}));

fs.writeFileSync(outJson, JSON.stringify(json, null, 2) + '\n');

const categories = [...new Set(commands.map((c) => c.category))].sort();
let md = `# Slash Commands — CiszuBot v3.2.0\n\nTotal: **${commands.length} comandos** (${categories.length} categorías)\n\n`;
for (const cat of categories) {
  const cmds = commands.filter((c) => c.category === cat);
  md += `## ${cat}\n\n`;
  for (const c of cmds) {
    md += `### /${c.name}\n- ${c.description}\n- Uso: \`${c.usage}\`\n- Aliases: ${c.aliases.length ? c.aliases.map((a) => `\`${a}\``).join(', ') : '—'}\n- Slash: ${c.slash ? `\`/${c.slash.name}\`` : 'no'}\n\n`;
  }
}
fs.writeFileSync(outMd, md);
fs.writeFileSync(outMdJson, JSON.stringify(json, null, 2) + '\n');

console.log(`Generados ${commands.length} comandos -> commands.json + docs/slash-commands.{json,md}`);
console.log(`Categorías: ${categories.join(', ')}`);
