#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TEMPLATE_ROOT = path.join(ROOT, "shared", "templates", "desktop-shell");
const MANIFEST_PATH = path.join(TEMPLATE_ROOT, "MANIFEST.json");
const DEFAULT_SOURCE = "projects/muzicmania/launcher/src-tauri/splash";

const TEXT_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".txt",
  ".md",
  ".svg",
]);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { force: false, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--target" || value === "-t") args.target = argv[++index];
    else if (value === "--config" || value === "-c") args.config = argv[++index];
    else if (value === "--kind" || value === "-k") args.kind = argv[++index];
    else if (value === "--force") args.force = true;
    else if (value === "--dry-run") args.dryRun = true;
    else if (value === "--help" || value === "-h") args.help = true;
    else fail(`argumento no reconocido: ${value}`);
  }
  return args;
}

function help() {
  console.log(`Ciszu Desktop Shell — generador de plantilla

Uso:
  pnpm shell:new --target <carpeta> --config <archivo.json> [--kind installer|launcher|all] [--force] [--dry-run]

Ejemplo:
  pnpm shell:new --target projects/ciszubot/installer --config shared/templates/desktop-shell/config.example.json --kind installer
`);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`no se pudo leer ${label}: ${error.message}`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || !value.trim()) fail(`falta ${label}`);
  return value.trim();
}

function normalizeConfig(raw) {
  if (!raw || typeof raw !== "object") fail("la configuración no es un objeto JSON");
  const product = raw.product || {};
  const urls = raw.urls || {};
  const shell = raw.shell || {};
  const config = {
    ...raw,
    product: {
      name: requireString(product.name, "product.name"),
      slug: requireString(product.slug, "product.slug"),
      appId: requireString(product.appId, "product.appId"),
      version: requireString(product.version, "product.version"),
    },
    urls: {
      productUrl: requireString(urls.productUrl, "urls.productUrl"),
      supportUrl: urls.supportUrl || "",
      githubRepo: urls.githubRepo || "",
      whatsapp: urls.whatsapp || "",
    },
    brand: {
      owner: raw.brand?.owner || "Ciszu Network",
      websiteUrl: raw.brand?.websiteUrl || "https://ciszunetwork.vercel.app",
    },
    socials: raw.socials || {},
    shell: {
      kind: shell.kind || "installer",
      languages: Array.isArray(shell.languages) ? shell.languages : [],
      source: shell.source || DEFAULT_SOURCE,
    },
  };
  if (!/^[a-z0-9][a-z0-9-]*$/.test(config.product.slug)) {
    fail("product.slug debe usar minúsculas, números y guiones");
  }
  return config;
}

function resolveSource(relativePath) {
  const source = path.resolve(ROOT, relativePath);
  const manifest = readJson(MANIFEST_PATH, "MANIFEST.json");
  const reference = path.resolve(ROOT, manifest.reference.splash);
  if (source !== reference) {
    fail(`por seguridad, shell.source debe ser ${manifest.reference.splash}`);
  }
  if (!fs.existsSync(source)) fail(`no existe la fuente: ${relativePath}`);
  return source;
}

function copyRecursive(source, target, manifest, dryRun) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    if (dryRun) return;
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      if (manifest.forbidden?.includes(entry)) continue;
      copyRecursive(path.join(source, entry), path.join(target, entry), manifest, dryRun);
    }
    return;
  }
  if (dryRun) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function walkTextFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkTextFiles(full));
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function replacementPairs(config) {
  const pairs = [];
  const add = (from, to) => {
    if (from && to && from !== to) pairs.push([from, to]);
  };
  add("https://muzicmania.vercel.app", config.urls.productUrl);
  add("https://github.com/Ciszu-Network/CiszuNetwork", config.urls.githubRepo);
  add("https://wa.me/584126858111", config.urls.whatsapp);
  add("https://discord.gg/W3kMtMMj6E", config.socials.discord);
  add("https://www.youtube.com/@CiszuNetwork", config.socials.youtube);
  add("https://www.instagram.com/ciszunetwork/", config.socials.instagram);
  add("https://www.tiktok.com/@ciszunetwork", config.socials.tiktok);
  add("https://x.com/CiszukoAntony", config.socials.x);
  add("https://github.com/Ciszu-Network", config.socials.github);
  add("com.ciszunetwork.muzicmania", config.product.appId);
  add("MuzicMania", config.product.name);
  add("muzicmania", config.product.slug);
  pairs.sort((a, b) => b[0].length - a[0].length);
  return pairs;
}

function applyReplacements(directory, config, dryRun) {
  const pairs = replacementPairs(config);
  for (const file of walkTextFiles(directory)) {
    let content = fs.readFileSync(file, "utf8");
    const original = content;
    for (const [from, to] of pairs) content = content.split(from).join(to);
    if (content !== original && !dryRun) fs.writeFileSync(file, content, "utf8");
  }
}

function nextSteps(config, kind) {
  return `# ${config.product.name} — Desktop Shell

Generado desde \`shared/templates/desktop-shell\`.

- Producto: **${config.product.name}**
- Slug: \`${config.product.slug}\`
- App ID: \`${config.product.appId}\`
- Versión inicial: \`${config.product.version}\`
- Capa: \`${kind}\`
- Web: ${config.urls.productUrl}

## Siguientes pasos

1. Reemplazar \`logo.svg\`, iconos y assets de marca.
2. Adaptar tokens de color y tipografía.
3. Revisar todos los textos del producto y la licencia.
4. Adaptar los comandos Rust/Tauri y el NSIS si la capa es de escritorio.
5. Configurar GitHub Releases y actualizaciones.
6. Configurar el adaptador web si la capa se sirve como página.
7. Probar instalación, hub, update, reinstall, uninstall y launcher.
8. Revisar que no queda ninguna referencia a MuzicMania.

Contrato y checklist completa: \`DESKTOP_SHELL_SYSTEM.md\`.
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    help();
    return;
  }
  if (!args.target) fail("falta --target");
  if (!args.config) fail("falta --config");

  const manifest = readJson(MANIFEST_PATH, "MANIFEST.json");
  const configPath = path.resolve(process.cwd(), args.config);
  const config = normalizeConfig(readJson(configPath, "config"));
  const kind = args.kind || config.shell.kind || "installer";
  if (!["installer", "launcher", "all"].includes(kind)) {
    fail("--kind debe ser installer, launcher o all");
  }

  const target = path.resolve(process.cwd(), args.target);
  if (fs.existsSync(target) && !args.force) {
    fail(`el destino ya existe: ${target}. Usa --force para sobrescribir.`);
  }

  const source = resolveSource(config.shell.source);
  if (args.dryRun) {
    console.log(`DRY RUN: ${source} -> ${target} (${kind})`);
    return;
  }

  fs.mkdirSync(target, { recursive: true });
  const files = new Set(manifest.common || []);
  if (kind === "installer" || kind === "all") {
    for (const file of manifest.installer || []) files.add(file);
  }
  if (kind === "launcher" || kind === "all") {
    for (const file of manifest.launcher || []) files.add(file);
  }

  for (const relative of files) {
    const from = path.join(source, relative);
    const to = path.join(target, relative);
    if (!fs.existsSync(from)) fail(`no existe en la fuente: ${relative}`);
    copyRecursive(from, to, manifest, false);
  }

  applyReplacements(target, config, false);
  fs.copyFileSync(path.join(TEMPLATE_ROOT, "config.schema.json"), path.join(target, "config.schema.json"));
  fs.mkdirSync(path.join(target, "adapters"), { recursive: true });
  fs.copyFileSync(
    path.join(TEMPLATE_ROOT, "adapters", "web-adapter.js"),
    path.join(target, "adapters", "web-adapter.js"),
  );
  fs.writeFileSync(path.join(target, "SHELL_CONFIG.json"), JSON.stringify(config, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(target, "SHELL_NEXT_STEPS.md"), nextSteps(config, kind), "utf8");

  console.log(`Generado ${kind} en ${target}`);
  console.log(`Producto: ${config.product.name} (${config.product.slug})`);
  console.log("Revisa SHELL_NEXT_STEPS.md antes de continuar.");
}

main();
