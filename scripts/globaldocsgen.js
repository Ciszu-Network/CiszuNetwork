/**
 * GLOBALDOCSGEN — Tarea #7: documentación global (ciszu) + PROTOCOLS por website.
 *
 * Genera, desde un data central:
 *   - Global (projects/ciszu/docs/documentation/): PRD_GLOBAL_SYSTEM, TRD_GLOBAL_SYSTEM,
 *     UIDBUXDB_GLOBAL_SYSTEM, BACKEND_SCHEMA_GLOBAL_SYSTEM, IMPLEMENTATION_PLAN_GLOBAL_SYSTEM.
 *   - Por website (projects/<site>/docs/documentation/): PRD_PROTOCOLS, TRD_PROTOCOLS,
 *     WORKFLOW_APP_PROTOCOLS, UIDBUXDB_PROTOCOLS, BACKEND_SCHEMA_PROTOCOLS,
 *     IMPLEMENTATION_PLAN_PROTOCOLS.
 *
 * El WORKFLOW_SYSTEM.md global se renombra a GLOBAL_SYSTEM.md (git mv) fuera de este script.
 *
 * Uso: node scripts/globaldocsgen.js
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const DATA = {
  org: {
    nombre: 'Ciszu Network',
    fundador: 'Ciszuko Antony (Francisco Garcia)',
    correo: 'ciszunetwork@outlook.com',
    vision: 'Ecosistema digital masivo de Ciszuko Antony: 4 webs, un bot de Discord, un juego de musica y paquetes compartidos.',
  },
  global: {
    stack: ['Next.js 15 (App Router)', 'Tailwind 4', 'Supabase (Postgres + auth + storage CDN)', 'pnpm monorepo', '@ciszu/ui (paquetes compartidos)', 'Vercel + GitHub Actions', 'Google (GA4 + GTM + AdSense)', 'PostHog + Cloudflare + Sentry'],
    sistemas: ['GLOBAL_ADVISOR', 'AD (anuncios)', 'STAFF/CUSTOMERS', 'AUTH (CISZU ID)', 'PAYMENTS', 'SEO', 'MONITORING'],
    principios: ['Acceso minimo necesario', 'Una fuente de verdad por tema', 'Docs antes de codificar', 'Secretos solo en vault', 'Anuncios SOLO flotantes'],
  },
  sites: [
    {
      key: 'ciszu', nombre: 'Ciszu Network', url: 'https://ciszunetwork.vercel.app',
      stack: 'Next.js 15 + Tailwind 4 + Supabase (schema ciszunetwork) + @ciszu/ui + Puck (editor visual)',
      dbSchema: 'ciszunetwork',
      dbTables: ['global_announcements', 'global_announcement_settings', 'global_announcement_deliveries', 'announcement_reads', 'staff_members', 'pages (Puck)'],
      rls: 'RLS activo; entregas de anuncios con policies por site; staff_members para emisores verificados',
      pages: ['/', '/about', '/contact', '/descargas', '/faq', '/feedback', '/guidelines', '/policies', '/support', '/team', '/projects/{ciszukoantony,ciszunetwork,discord,minecraft,muzicmania,telegram,whatsapp}', '/login', '/register', '/edit/* (Puck)'],
      features: ['Landing + marca del ecosistema', 'Puck editor visual (paginas/editables)', 'PWA + instalacion', 'Auth CISZU ID + Cloudflare + Turnstile', 'GlobalAdvisor (mensajes globales)', 'Anuncios (Ads + GA4/GTM/AdSense)', 'Donaciones NowPayments', 'Resenas Google/Trustpilot', 'SEO (robots/sitemap)', 'Feedback FAB'],
      backend: 'RSC server + API routes (verify-turnstile, payments/invoice, puck/save, webhooks/nowpayments) + Supabase',
      design: { palette: 'neon cyan/rosa sobre negro', font: 'Geomanist / IBM Plex', theme: 'dark + light', vibe: 'hacker neon, elegante' },
    },
    {
      key: 'ciszukoantony', nombre: 'Ciszuko Antony', url: 'https://ciszukoantony.vercel.app',
      stack: 'Next.js 15 + Tailwind 4 + Supabase + @ciszu/ui + framer-motion',
      dbSchema: 'ciszunetwork (auth/profiles)',
      dbTables: ['auth.users', 'profiles'],
      rls: 'RLS: perfiles publicos de lectura, edicion solo del dueno',
      pages: ['/', '/about', '/certificates', '/contact', '/descargas', '/faq', '/feedback', '/login', '/policies', '/projects', '/register', '/support', '/team'],
      features: ['Portfolio personal (logos, medios, musica)', 'Certificados', 'Descargas de contenido', 'Auth + Cloudflare', 'Anuncios (Ads + Google)', 'Feedback FAB', 'SEO'],
      backend: 'RSC server + API routes (verify-turnstile, puck/save) + Supabase',
      design: { palette: 'violeta/lavanda + cyan', font: 'Exo2 / Rajdhani', theme: 'dark + light', vibe: 'artista/creativo, suave' },
    },
    {
      key: 'ciszubot', nombre: 'CiszuBot', url: 'https://ciszubot.vercel.app',
      stack: 'Next.js 15 + Tailwind 4 + Supabase (schema ciszubot) + Discord.js bot (TS, pnpm, Docker)',
      dbSchema: 'ciszubot',
      dbTables: ['guild_settings', 'economy', 'levels', 'log_config', 'warnings', 'announcements'],
      rls: 'RLS activo; datos de guilds solo para el bot (service role) y admin',
      pages: ['/', '/comandos', '/dashboard', '/dashboard/:guildId', '/descargas', '/estado', '/feedback', '/login', '/privacidad', '/register', '/soporte', '/terminos'],
      features: ['Landing del bot + estado en vivo', 'Dashboard por servidor', 'Auth Discord', 'Comandos (8ball, afk, economy, niveles...)', 'Anuncios (Google)', 'i18n (idiomas)', 'SEO'],
      backend: 'RSC + API routes (auth/discord, dashboard/:guildId, verify-turnstile) + bot (discord.js)',
      design: { palette: 'violeta + cyan (bot)', font: 'Inter / Space Grotesk', theme: 'dark + light', vibe: 'tech bot, limpio' },
    },
    {
      key: 'muzicmania', nombre: 'MuzicMania', url: 'https://muzicmania.vercel.app',
      stack: 'Next.js 15 + Tailwind 4 + Supabase (schema muzicmania) + Tauri (app escritorio) + framer-motion',
      dbSchema: 'muzicmania',
      dbTables: ['profiles', 'scores', 'tracks', 'charts', 'songs', 'reviews', 'matches', 'report_logs'],
      rls: 'RLS activo; scores insertables con RPC (submit_game_score); perfiles publicos',
      pages: ['/', '/play', '/leaderboard', '/library', '/profile', '/profile/:id', '/profile/settings', '/terms', '/policy', '/rules', '/guidelines', '/license', '/download', '/changelog', '/faq', '/forum', '/help', '/information', '/stats', '/support', '/team', '/credits', '/reviews', '/fddp2026'],
      features: ['Juego de ritmo (canvas + hooks)', 'Partidas con puntuacion (RPC)', 'Leaderboard global', 'Libreria de canciones', 'Perfiles + settings', 'App Tauri + NSIS (Windows)', 'Anuncio intrusivo tras partida + recompensa', 'Anuncios (Google)', 'Auth + Turnstile', 'SEO'],
      backend: 'RSC + API routes (auth/resolve-username, leaderboard, download/windows, build-status, ping, verify-turnstile) + Supabase RPC',
      design: { palette: 'cyan eléctrico/rosa neón', font: 'Exo2 / Rajdhani', theme: 'dark + light', vibe: 'ritmo neón, arcade' },
    },
  ],
};

// ---------- helpers ----------
function today() { return new Date().toISOString().slice(0, 10); }
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function write(p, c) { mkdirp(path.dirname(p)); fs.writeFileSync(p, c, 'utf8'); }
function header(slug, title, def) {
  const d = '2026-08-26';
  return `# ${title}

Version: 1.0.0
Actualizacion: ${d}
Identificador: ${slug}_V1.0.0_${d.replace(/-/g, '_')}_ciszunetwork

> **Definicion**: ${def}

---

`;
}
function table(rows) { return '| ' + rows[0].join(' | ') + ' |\n| ' + rows[0].map(() => '---').join(' | ') + ' |\n' + rows.slice(1).map((r) => '| ' + r.join(' | ') + ' |').join('\n') + '\n'; }

// ---------- generadores por tipo ----------
function genPRD(site, isGlobal) {
  const n = isGlobal ? DATA.org.nombre : site.nombre;
  const pages = isGlobal ? DATA.sites.flatMap((s) => s.pages) : site.pages;
  const features = isGlobal ? DATA.global.sistemas : site.features;
  const t = [];
  t.push(header(isGlobal ? 'PRD_GLOBAL_SYSTEM' : `PRD_${site.key}_PROTOCOLS`, `${n} — Product Requirement Document (PRD)`, isGlobal ? 'Requisitos de producto de todo el ecosistema.' : `Requisitos de producto de ${n}.`));
  t.push(`## 1. Vision y objetivo

**${n}** forma parte del ecosistema de ${DATA.org.fundador}. Objetivo: ${isGlobal ? DATA.org.vision : site.nombre + ' dentro del ecosistema de Ciszu Network.'}

## 2. Audiencia objetivo

- Usuarios del ecosistema (jugadores, fans, clientes de servicios).
- Comunidad de ${DATA.org.nombre} (Discord, redes).
- Visitantes ocasionales y clientes de soporte.

## 3. Problema que resuelve

- ${isGlobal ? 'Coordinacion de 4 webs + bot + juego con identidad unica y monetizacion real.' : 'Dar valor especifico a la audiencia de esta web.'}
- Ser parte de un ecosistema coherente (marca, auth, anuncios, analiticas).

## 4. Alcance / features

${features.map((f) => `- ${f}`).join('\n')}

## 5. User stories

- Como visitante quiero navegar y entender la oferta para decidir usar el servicio.
- Como usuario quiero una cuenta unica (CISZU ID) para sincronizar mi experiencia.
- Como jugador quiero partidas justas y recompensas (MuzicMania).
- Como cliente quiero soporte y donar/colaborar con facilidad.

## 6. Criterios de aceptacion

- Todas las paginas cargan sin errores y con SEO basico (robots/sitemap).
- Auth con Cloudflare + Turnstile; cuentas opcionales salvo donde se requiera.
- Anuncios cerrables, flotantes (nunca rompen layout); central solo tras accion.
- GA4 + GTM + AdSense operativos por web.

## 7. Paginas (landing / rutas)

${pages.map((p) => `- \`${p}\``).join('\n')}

## 8. Roadmap

- Fase 1: landing + marca + auth. Fase 2: features propias (juego, dashboard, etc.).
- Fase 3: monetizacion (anuncios reales + donaciones). Fase 4: compras/suscripciones.

## 9. Metricas

- Trafico (Cloudflare/GA4), engagement (PostHog), ingresos (anuncios/donaciones), NPS/soporte.

---
_Ultima revision: ${today()}_. Relacionado: TRD, WORKFLOW, IMPLEMENTATION_PLAN.
`);
  return t.join('\n');
}

function genTRD(site, isGlobal) {
  const n = isGlobal ? DATA.org.nombre : site.nombre;
  const stack = isGlobal ? DATA.global.stack : site.stack.split(' + ');
  const t = [];
  t.push(header(isGlobal ? 'TRD_GLOBAL_SYSTEM' : `TRD_${site.key}_PROTOCOLS`, `${n} — Technical Requirement Document (TRD)`, isGlobal ? 'Requisitos tecnicos del ecosistema.' : `Requisitos tecnicos de ${n}.`));
  t.push(`## 1. Arquitectura

- Monorepo pnpm; la web vive en \`projects/${isGlobal ? '<site>' : site.key}/website\`.
- Next.js 15 App Router (RSC + client), Tailwind 4, @ciszu/ui (paquetes compartidos).
- Backend: RSC server + API routes + Supabase. Deploy: Vercel + GitHub Actions.

## 2. Stack

${stack.map((s) => `- ${s}`).join('\n')}

## 3. Integraciones

- Supabase (Postgres + auth + storage CDN \`ciszu-cdn\`).
- Google: GA4 + GTM + AdSense (scripts SSR en <head>; env NEXT_PUBLIC_*).
- PostHog (producto), Cloudflare Web Analytics (trafico), Sentry (errores).
- Cloudflare Turnstile (anti-bot), Feedback, ntfy/UptimeRobot (monitoring).

## 4. Componentes y paquetes

- \`@ciszu/ui\`: Modal, Toast, AdsProvider/AdFloat/AdPill, GoogleScripts, GlobalAdvisor, auth.
- \`@ciszunetwork/cdn\`: resolver de assets. \`@ciszunetwork/db\`: capa de datos server-only.

## 5. Rendimiento y seguridad

- Middleware con CSP + cabeceras; robots.ts (allow /, disallow /api/).
- RLS en toda tabla; rate limit en POST; secretos solo en vault.
- Core Web Vitals (Vercel Speed Insights en MuzicMania).

## 6. Entornos

- \`development\` (local, puerto fijo), \`preview\` (Vercel), \`production\` (main).

---
_Ultima revision: ${today()}_. Relacionado: PRD, BACKEND_SCHEMA, IMPLEMENTATION_PLAN.
`);
  return t.join('\n');
}

function genWorkflowApp(site) {
  const t = [];
  t.push(header(`WORKFLOW_APP_${site.key}_PROTOCOLS`, `${site.nombre} — Workflow de la app`, `Como actua ${site.nombre} pagina a pagina y su ciclo de vida.`));
  t.push(`## 1. Flujo del usuario (recorrido principal)

1. Entra a la landing (\`/\`): ve la marca, navega a secciones.
2. Si necesita cuenta: \`/login\` o \`/register\` (Cloudflare + Turnstile + verificar correo opcional).
3. Usa las secciones principales y vuelve a la landing o contacta por \`/support\`.

## 2. Mapa del sitio (sitemap)

${site.pages.map((p) => `- \`${p}\``).join('\n')}

## 3. Comportamiento por pagina

${site.pages.slice(0, 10).map((p) => `- **\`${p}\`**: renderiza contenido; (si es dinamica) consulta Supabase/API; envio de eventos a GA4/PostHog.`).join('\n')}

## 4. Disparadores de GitHub Actions (workflows)

- CI: lint + test + typecheck + semgrep + audit + gitleaks (push/PR).
- Deploy: \`deploy-${site.key}-website.yml\` (push a main, deploy a Vercel desde la raiz).
- DAST (semanal) + Lighthouse CI (LCP/rendimiento) + uptime-watch (cada 5 min).

## 5. Eventos de negocio

- Feedback (FAB), donaciones (NowPayments), anuncios (impresiones/clics en GA4).
- Auth (login/registro/logout), partidas (MuzicMania), dashboard (CiszuBot).

---
_Ultima revision: ${today()}_. Relacionado: GLOBAL_SYSTEM, IMPLEMENTATION_PLAN.
`);
  return t.join('\n');
}

function genUidb(site, isGlobal) {
  const n = isGlobal ? DATA.org.nombre : site.nombre;
  const d = isGlobal ? { palette: 'neon cyan/rosa sobre negro', font: 'Geomanist', theme: 'dark + light', vibe: 'hacker neon' } : site.design;
  const t = [];
  t.push(header(isGlobal ? 'UIDBUXDB_GLOBAL_SYSTEM' : `UIDBUXDB_${site.key}_PROTOCOLS`, `${n} — UI/UX Design Brief`, isGlobal ? 'Identidad y diseno UI/UX global del ecosistema.' : `Brief de diseno UI/UX de ${n}.`));
  t.push(`## 1. Identidad

- **Vibe**: ${d.vibe}. **Paleta**: ${d.palette}. **Tipografia**: ${d.font}. **Tema**: ${d.theme}.

## 2. Principios de diseno

- Neon sobre oscuro; acentos de marca; claro/oscuro consistente.
- Componentes compartidos via @ciszu/ui (Modal, Toast, Ads, Navbar/Footer propios por web).
- Los anuncios NUNCA se incrustan: overlays flotantes (regla de diseno).

## 3. Sistema de componentes

- Radix (Dialog, Toast), Tailwind, iconos CDN. Tokens en \`@ciszu/ui\`.
- Storybook/Chromatic para documentar componentes (dev-only).

## 4. Accesibilidad y responsive

- Contraste, foco, ARIA; mobile-first; animaciones suaves (framer-motion).

## 5. Marca y assets

- Assets via CDN (\`@ciszunetwork/cdn\`, Supabase Storage). Logos de marca en \`projects/<web>/content\`.

---
_Ultima revision: ${today()}_. Relacionado: GLOBAL_SYSTEM (GLOBAL_COMPONENTS, STYLES, COLOR), UI_COMPONENTS_SYSTEM.
`);
  return t.join('\n');
}

function genBackend(site, isGlobal) {
  const n = isGlobal ? DATA.org.nombre : site.nombre;
  const schema = isGlobal ? 'ciszunetwork + ciszubot + muzicmania' : site.dbSchema;
  const tables = isGlobal ? DATA.sites.flatMap((s) => s.dbTables) : site.dbTables;
  const t = [];
  t.push(header(isGlobal ? 'BACKEND_SCHEMA_GLOBAL_SYSTEM' : `BACKEND_SCHEMA_${site.key}_PROTOCOLS`, `${n} — Backend y Schema de Base de Datos`, isGlobal ? 'Backend y esquema global de los 3 schemas.' : `Backend y esquema de ${n}.`));
  t.push(`## 1. Backend

- RSC server + API routes + Supabase (${schema}).
- ${isGlobal ? 'Cada web tiene su schema; RLS obligatorio.' : site.backend}

## 2. Schema: ${schema}

Tablas:

${tables.map((t2) => `- \`${t2}\``).join('\n')}

## 3. RLS y seguridad

- ${site.rls}
- \`SECURITY DEFINER\` solo en triggers; preferir INVOKER con search_path.
- Rate limit en POST; parametrizacion; sin secretos en codigo.

## 4. Funciones / RPC

- RPC de escritura (ej. \`submit_game_score\` en MuzicMania), policies por comando.

## 5. Migraciones

- SQL en \`services/supabase/migrations/\`, aplicadas con \`scripts/apply-migration-XX.js\`.

---
_Ultima revision: ${today()}_. Relacionado: DB_SYSTEM, ORM_SYSTEM, SECURITY_PROTOCOLS.
`);
  return t.join('\n');
}

function genImpl(site, isGlobal) {
  const n = isGlobal ? DATA.org.nombre : site.nombre;
  const t = [];
  t.push(header(isGlobal ? 'IMPLEMENTATION_PLAN_GLOBAL_SYSTEM' : `IMPLEMENTATION_PLAN_${site.key}_PROTOCOLS`, `${n} — Plan de Implementacion`, isGlobal ? 'Plan de implementacion global del ecosistema.' : `Plan de implementacion de ${n}.`));
  t.push(`## 1. Fases

- **Fase 1 - Fundacion**: monorepo, stack, CI/CD, docs globales.
- **Fase 2 - Marca y contenido**: identidad, assets CDN, paginas legales.
- **Fase 3 - Features**: auth (CISZU ID), juego/dashboard, feedback, anuncios.
- **Fase 4 - Monetizacion**: GA4 + GTM + AdSense reales, donaciones, compras futuras.

## 2. Pasos de implementacion

1. Definir datos y docs (PRD/TRD/WORKFLOW/UIDBUXDB/BACKEND/IMPLEMENTATION).
2. Implementar por feature con tests y verificacion (tsc, lint, e2e).
3. Desplegar a Vercel (preview) y validar; promover a produccion.
4. Medir (GA4/PostHog) e iterar.

## 3. Verificacion

- \`pnpm ciszuhelp\` (comandos), \`pnpm ci:local\` (lint+typecheck+test).
- E2E (Playwright), DAST (ZAP), Lighthouse CI, uptime-watch.
- Google: verificar etiquetas GA4/GTM/AdSense en produccion.

## 4. Dependencias y riesgos

- AdSense requiere aprobacion y trafico; Google Ads requiere primera campana.
- El sistema de anuncios propio ya esta operativo (flotantes, cerrables).

---
_Ultima revision: ${today()}_. Relacionado: PRD, TRD, WORKFLOW, GLOBAL_SYSTEM.
`);
  return t.join('\n');
}

// ---------- main ----------
function main() {
  let count = 0;
  // Global docs en ciszu
  const gdir = path.join(ROOT, 'projects', 'ciszu', 'docs', 'documentation');
  const globalDocs = {
    'PRD_GLOBAL_SYSTEM.md': () => genPRD(DATA.sites[0], true),
    'TRD_GLOBAL_SYSTEM.md': () => genTRD(DATA.sites[0], true),
    'UIDBUXDB_GLOBAL_SYSTEM.md': () => genUidb(DATA.sites[0], true),
    'BACKEND_SCHEMA_GLOBAL_SYSTEM.md': () => genBackend(DATA.sites[0], true),
    'IMPLEMENTATION_PLAN_GLOBAL_SYSTEM.md': () => genImpl(DATA.sites[0], true),
  };
  for (const [f, fn] of Object.entries(globalDocs)) { write(path.join(gdir, f), fn()); count++; }

  // Per-site docs
  for (const site of DATA.sites) {
    const dir = path.join(ROOT, 'projects', site.key, 'docs', 'documentation');
    const per = {
      'PRD_PROTOCOLS.md': () => genPRD(site, false),
      'TRD_PROTOCOLS.md': () => genTRD(site, false),
      'WORKFLOW_APP_PROTOCOLS.md': () => genWorkflowApp(site),
      'UIDBUXDB_PROTOCOLS.md': () => genUidb(site, false),
      'BACKEND_SCHEMA_PROTOCOLS.md': () => genBackend(site, false),
      'IMPLEMENTATION_PLAN_PROTOCOLS.md': () => genImpl(site, false),
    };
    for (const [f, fn] of Object.entries(per)) { write(path.join(dir, f), fn()); count++; }
  }
  console.log(`GLOBALDOCSGEN: ${count} docs generados`);
}

main();