/**
 * CISZUHELP — Ayuda rápida de los comandos pnpm de Ciszu Network.
 *
 * Muestra los comandos principales del monorepo con su uso y descripción.
 * La lista completa de scripts vive en package.json (scripts), pero aquí está
 * la guía curada (categorizada) para uso diario.
 *
 * Uso:
 *   pnpm ciszuhelp
 *   pnpm ciszuhelp <filtro>      # filtra por palabra (p. ej. "deploy", "seo")
 */

const CATS = [
  {
    cat: 'Desarrollo (webs)',
    items: [
      ['pnpm dev', 'Levanta todas las apps (turbo).'],
      ['pnpm build', 'Build de todas las apps (turbo).'],
      ['pnpm lint', 'Lint de todas las apps.'],
      ['pnpm typecheck', 'Type-check de @ciszu/ui + las 4 webs.'],
      ['pnpm test', 'Unit tests (Vitest).'],
      ['pnpm e2e', 'Tests E2E (Playwright).'],
      ['pnpm ci:local', 'Lint + typecheck + test (chequeo pre-commit).'],
    ],
  },
  {
    cat: 'Webs individuales',
    items: [
      ['pnpm web:dev / web:build', 'Ciszu Network (3000).'],
      ['pnpm antony:dev / antony:build', 'Ciszuko Antony (3001).'],
      ['pnpm ciszubot:web:dev / :build', 'CiszuBot (3002).'],
      ['pnpm muzicmania:dev / :build', 'MuzicMania (3003).'],
      ['pnpm --filter <app> dev', 'Una app cualquiera.'],
    ],
  },
  {
    cat: 'Consolas (TUI)',
    items: [
      ['pnpm dev:console', 'Dev Console (test/website/debug/dev_console.ps1).'],
      ['pnpm dev:all / dev:stop / dev:status / dev:log', 'Encender/detener/estado/log de las 4 webs.'],
      ['staffcon (perfil)', 'Staff Console — gestión de empleados (tools/consoles).'],
      ['customerscon (perfil)', 'Customers Console — gestión de clientes (tools/consoles).'],
    ],
  },
  {
    cat: 'Deploy (Vercel)',
    items: [
      ['pnpm deploy:network / deploy:antony / deploy:bot / deploy:muzic', 'Deploy de una web (scripts/deploy-vercel.js).'],
      ['pnpm deploy:all', 'Deploy de las 4 webs.'],
      ['pnpm ship:prod', 'ci:local + deploy de las 4 webs.'],
    ],
  },
  {
    cat: 'CDN / Assets',
    items: [
      ['pnpm cdn:upload', 'Sube assets a Supabase Storage (ciszu-cdn).'],
      ['pnpm cdn:verify', 'Verifica MIME de los assets subidos.'],
      ['pnpm cdn:serve', 'CDN local (offline) en :8788.'],
    ],
  },
  {
    cat: 'Base de datos',
    items: [
      ['pnpm db:backup', 'Backup de la base de datos (Supabase).'],
    ],
  },
  {
    cat: 'Seguridad / Vault',
    items: [
      ['pnpm vault:bw', 'Sube el vault local (.env) a Bitwarden (secure note, sync).'],
    ],
  },
  {
    cat: 'Google (GA4 / GTM / AdSense)',
    items: [
      ['Env vars por web', 'NEXT_PUBLIC_GTM_ID · NEXT_PUBLIC_GA4_MEASUREMENT_ID · NEXT_PUBLIC_ADSENSE_CLIENT (ver GOOGLE_SYSTEM.md).'],
    ],
  },
  {
    cat: 'Notificaciones / API',
    items: [
      ['pnpm notify "Mensaje"', 'Push a ntfy.'],
      ['pnpm api:test', 'Tests de API con Bruno (prod).'],
    ],
  },
  {
    cat: 'SEO',
    items: [
      ['pnpm seo:audit:full', 'Auditoría SEO completa (Screaming Frog + semrush/ahrefs).'],
      ['pnpm seo:crawl / seo:crawl:all', 'Crawl de una o todas las webs.'],
      ['pnpm seo:compare:<web>', 'Compara SEO de una web.'],
      ['pnpm seo:fixes:<web>', 'Aplica fixes de SEO.'],
    ],
  },
  {
    cat: 'Storybook (@ciszu/ui)',
    items: [
      ['pnpm --filter @ciszu/ui storybook', 'Arranca Storybook.'],
      ['pnpm --filter @ciszu/ui test:storybook', 'Tests de interacción de stories.'],
    ],
  },
  {
    cat: 'Otros',
    items: [
      ['pnpm bot:dev / bot:start', 'Bot de Discord (dev / prod).'],
      ['pnpm mf:dev', 'Worker local (wrangler) en :8787.'],
      ['pnpm release', 'Changesets (version/publish).'],
    ],
  },
];

const filter = process.argv[2] ? process.argv[2].toLowerCase() : '';

let out = '';
out += 'CISZU NETWORK — Ayuda de comandos pnpm\n';
out += '=======================================\n\n';

for (const { cat, items } of CATS) {
  const filtered = filter ? items.filter(([cmd]) => cmd.toLowerCase().includes(filter)) : items;
  if (filtered.length === 0) continue;
  out += `## ${cat}\n`;
  for (const [cmd, desc] of filtered) out += `  ${cmd.padEnd(42)} ${desc}\n`;
  out += '\n';
}

if (!out.includes('##')) {
  out += `No se encontró nada para "${filter}".\n`;
}

out += 'La lista COMPLETA de scripts vive en package.json (scripts).\n';
process.stdout.write(out);