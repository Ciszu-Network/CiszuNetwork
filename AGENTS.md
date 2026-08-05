# Ciszu Network Monorepo — AGENTS.md

## Visión general del proyecto

**Ciszu Network** es el ecosistema digital de **CiszukoAntony** (Ciszuko): un monorepo con 4 sitios web (Next.js 15 + Tailwind 4), un bot de Discord (Discord.js), un juego de música (MuzicMania — web + app Tauri), paquetes compartidos (`@ciszu/ui`, `@ciszunetwork/cdn`) y un CDN de assets sobre Supabase Storage.

| Proyecto | URL (Vercel) | Descripción |
|---|---|---|
| **CiszuNetwork** | `ciszunetwork.vercel.app` | Web principal — presentación de la marca, redes y ecosistema |
| **CiszukoAntony** | `ciszukoantony.vercel.app` | Portfolio personal (logos, medios, música) |
| **MuzicMania** | `muzicmania.vercel.app` | Juego de ritmo/música — scores en Supabase (schema `muzicmania`), auth de Supabase, app de escritorio Tauri + NSIS |
| **Ciszubot** | `ciszubot.vercel.app` | Landing del bot de Discord (`projects/ciszubot/website/`, Next.js) + **estado en vivo del bot** (heartbeat Supabase → `ciszubot.bot_status`) |

Infraestructura: **Supabase** (un solo proyecto `obwzzmbvkrcscqwptlqo` — auth, Postgres, Storage CDN `ciszu-cdn`) + **Vercel** (4 proyectos, deploys vía GitHub Actions) + **GitHub** (repo privado `Ciszu-Network/CiszuNetwork`). Identidad visual: neon cyan/rosa, fuente Geomanist.

**Estado actual (jul 2026)**: los 4 sitios despliegan desde `main` y funcionan en producción (imágenes directas CDN, `images.unoptimized`, REST de muzicmania corregido). La sesión de seguridad cerró: code scanning 31/31 fixed, dependabot 35/36 (resta glib), secret scanning 1 abierta (PAT sbp_ redactado del repo). **Migración 11 APLICADA (31 jul 2026)** con PAT nuevo del usuario (`SUPABASE_ACCESS_TOKEN` en `services/supabase/.env` + CLI supabase). **Herramientas completas**: semgrep 0 findings reales, ZAP 2.17.0 instalado + DAST probado (0 High/4 Medium), DOMPurify aplicado, builds 4/4 OK. Pendientes activos: revocar el PAT viejo filtrado (cierra alerta secret scanning), rotar tokens restantes (lista abajo), secretlint full repo scan (timeout — subtargets), exponer schemas en Dashboard. Detalles en la sección "Herramientas de seguridad instaladas".

## Quick start
```bash
pnpm install              # install all workspaces
pnpm dev                  # turbo: all apps
pnpm build                # turbo: all apps
pnpm lint                 # turbo: lint all apps
pnpm --filter <name> dev  # single app
```

Package manager: **pnpm v10.8.1**, Node >=20.

## Workspaces & entry points

| pnpm filter name | Location | What |
|---|---|---|
| `ciszunetwork-website` | `projects/ciszu/website/` | Next.js — main CiszuNetwork website |
| `ciszukoantony-website` | `projects/ciszukoantony/website/` | Next.js — portfolio |
| `muzicmania-website` | `projects/muzicmania/website/` | Next.js + Tauri — music game |
| `ciszubot-website` | `projects/ciszubot/website/` | Next.js — bot landing website |
| `ciszubot` | `projects/ciszubot/discord-bot/` | Discord.js bot (TypeScript, pnpm workspace, Docker) |
| `@ciszunetwork/cdn` | `packages/cdn/` | Asset resolver (see below) |

> **Terminología**: cada producto web es un **website** (cúmulo de webpages). Los pnpm filter names, workflows y carpetas usan `-website` (nunca `-webpage`). Los clientes API de Bruno viven en `apis/bruno/` (antes `apis-client/bruno/`).

All websites are Next.js 15 with Tailwind 4 + PostCSS. They use `eslint` (no Prettier config found).

## CiszuBot (bot de Discord) — estado (ago 2026)

**v3.2.0 — TypeScript + pnpm + Node 24, expansión masiva de comandos** (`projects/ciszubot/discord-bot/`):

- Stack: Node 24 (imagen `node:24-alpine`), TypeScript 5.9, pnpm 11 (workspace), Discord.js ^14.22, Express ^5, `@supabase/supabase-js`, `@discordjs/voice` + `play-dl` (música), `@top-gg/sdk` + `discordbotlist` (bot lists).
- **72 comandos en 9 categorías** (Configuración, Diversión, Economía, Información, Moderación, Música, Niveles, Social, Utilidad). Registry (`src/utils/commandRegistry.ts`) soporta arrays por archivo y **fábricas** (`typeof entry === 'function' ? entry() : entry`) — ver `commands/minigames.ts`, `setup.ts`, `music.ts`, `moderation.ts` como patrón.
- **Servicios** (`src/services/`): `configService` (guild_configs con caché en memoria — ⚠️ el dashboard NO invalida la caché hasta reiniciar), `economy` (wallets/transactions), `levels` (XP), `giveaways` (timers + reanudación), `botlists` (AutoPoster top.gg + DBL cada 30 min + webhook), `music` (cola por guild), `statsServer` (acepta `client`, añade `POST /api/votes` — webhook top.gg que recompensa 500 monedas).
- **Listeners** (`src/listeners/index.ts`): XP por mensaje (cooldown 60s), AFK (quitar al hablar), snipe (MessageDelete → upsert snipes), welcome/goodbye/autorole (PartialGuildMember), contadores (rename), tickets (botones con `deferUpdate`), canal privado, resume giveaways en ready/GuildCreate.
- **Migración 14 aplicada** (2 ago 2026): 13 tablas en `ciszubot` — guild_configs, wallets, transactions, shop_items, inventory, levels, warns, tickets, giveaways, afk, alliances, discord_users, snipes.
- **Slash commands globales** (`/`): registrados vía `Routes.applicationCommands`; preserva el **Entry Point command** (`launch`, type 4) para evitar el error 50240. Si `GUILD_ID` está en `.env`, registra solo en ese guild.
- **Supabase conectado (2 ago 2026)**: `src/services/supabase.ts` con service_role + schema `ciszubot`. Cada comando se inserta en `ciszubot.command_logs` y cada 60s **heartbeat** a `ciszubot.bot_status` (upsert id=1, version v3.2.0). Shutdown marca online=false.
- **Fixes clave**: `Routes.applicationcommands` → `applicationCommands` (mayúscula), botones/selects con `deferUpdate`, registry con `loaded.default ?? loaded` (ESM/CJS), `slashCommand` es `SlashCommandBuilder` **SIN `.toJSON()`** (patrón ping.ts).
- **Docker**: multi-stage con pnpm (`corepack prepare pnpm@11.18.0`), usuario no-root, `EXPOSE 5000`, logs en `logs/` con chown. Stage 2 añade `ffmpeg python3 make g++` (música). Contexto = raíz del repo. Comando: `docker compose up -d --build ciszu-bot`.
- **Panel web**: Express en `:5000` (`/api/stats` + `POST /api/votes` + estáticos desde `public/`). Compose mapea `5000:5000`.
- **Env vars bot** (`.env`, gitignored): `TOP_GG_TOKEN` y `DISCORDBOTLIST_TOKEN` **pendientes del usuario** (código listo; sin ellos no postea a bot lists).
- ⚠️ **24/7 pendiente**: el bot corre en el PC del usuario (Docker Desktop). Si el PC se apaga, el bot muere. Ver `docs/ia_docs/VPS_247.md` para la recomendación de hosting.

## Web de CiszuBot — estado (ago 2026)

**`projects/ciszubot/website/` — reconstruida 2 ago 2026** con tema neon de MuzicMania (Tailwind v4, Exo_2 + Rajdhani):

- **Single page** (`src/app/page.tsx`): hero con isotipo oficial (CDN), badge de estado en vivo, stats dinámicas reales, grid completo de 12 comandos con categorías (Diversión/Información/Social/Utilidad), sección estado en vivo, sección ecosistema (links a ciszunetwork/ciszukoantony/muzicmania) y CTA invitar.
- **Datos dinámicos**: fetch server-side a `ciszubot.bot_status` vía PostgREST con anon key + `Accept-Profile: ciszubot` (policy SELECT anon). `revalidate = 60`. El badge "En línea" es **online && last_seen < 3 min** (si el PC se apaga sin shutdown, la web lo detecta por heartbeat viejo).
- **Datos de comandos**: `src/data/commands.ts` — 72 comandos con descripciones/aliases/usage/categorías reales del bot (9 categorías). Canonical: `scripts/generate-commands.js` (regenera `commands.json` + `docs/slash-commands.{json,md}` desde dist).
- **Dashboard OAuth (2 ago 2026)**: `src/lib/auth.ts` (server-only) — cookie `ciszubot_session` HMAC sha256 (7 días), `oauthUrl`, `exchangeCode`, `refreshAccessToken`, `fetchDiscordUser`, `getGuildsForUser`, `isGuildAdmin` (ADMINISTRATOR|MANAGE_GUILD), `getBotGuildIds` (usa `DISCORD_BOT_TOKEN`), `supabaseAdmin` (usa `SUPABASE_SERVICE_ROLE_KEY`). Rutas `/api/auth/discord` + `/callback` + `/logout`; páginas `/dashboard` (servidores admin con bot presente) y `/dashboard/[guildId]` (+ `client.tsx` con formulario: prefix, idioma, toggles nivel/tickets/privados/automod, autorole, mensajes bienvenida/despedida → `POST /api/dashboard/[guildId]`).
  - **Env vars Vercel `ciszubot` (production, añadidas 2 ago 2026)**: `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL` (= `https://ciszubot.vercel.app`, build-time — define el redirect del OAuth). En local: `.env.local` con las mismas + anon key/URL.
  - ⚠️ **Pendiente del usuario**: registrar `https://ciszubot.vercel.app/api/auth/discord/callback` en Discord Developer Portal (OAuth2 → Redirects) y guardar `DISCORD_CLIENT_SECRET` en Vercel + `.env.local`.
- **Layout**: Navbar sticky con isotipo + links anchor + botón Invitar (URL oauth2 con scope `bot applications.commands`) + **cuenta** (avatar, link Panel, logout) cuando hay sesión. Footer con socials + proyectos + copyright, favicon = isotipo PNG.
- **Env vars**: `vercel.json` solo CDN_URL + APP_ENV (patrón del repo); `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` ya configuradas en el proyecto Vercel `ciszubot` (las 4 apps las tienen desde jul 2026).
- **prebuild**: `copy-assets.js` (depth 3 → `../../../scripts/copy-assets.js`) copia `projects/ciszubot/content/...` a `public/` para dev/fallback local.

## CDN strategy (Ciszu CDN — mirror del repo)

El CDN es un **espejo** del repositorio. Las rutas en Supabase Storage (`ciszu-cdn`, migrado desde `ciszu-assets`) reflejan 1:1 las rutas reales del repo. No hay carpeta `assets/` staging — el upload lee directamente de los directorios originales.

- **Upload**: `pnpm cdn:upload` (`scripts/upload-cdn.js`) — escanea 6 fuentes (`shared/icons/svg/`, `projects/ciszu/content/`, `projects/ciszu/docs/`, `projects/*/content/`) y sube con la misma ruta relativa a `ciszu-cdn`.
  - **Re-upload inteligente por tamaño + mimetype** (desde 4 ago 2026): el script salta un archivo SOLO si el tamaño remoto coincide **y** el mimetype remoto coincide con el esperado por extensión. Antes saltaba solo por tamaño → si un objeto se subió con `text/plain` (p.ej. un SVG) y tenía el mismo tamaño que el local, el script NUNCA lo re-subía (causa raíz del bug del logotipo ciszubot). Ahora detecta el mismatch y re-subirá con `[!!]` warning.
  - **`--force`**: re-sube TODOS los archivos ignorando tamaño/mimetype. **`--prune`**: borra objetos del bucket que no existen localmente.
  - **Verificación de mimetypes**: `pnpm cdn:verify` (`scripts/check-cdn-mimes.js`) — lista todos los objetos del bucket y reporta los que tienen mimetype incorrecto para su extensión (detecta los `text/plain` rotos antes de que rompan un site). ⚠️ Para cargar el ACCESS_TOKEN hace falta meter `SUPABASE_ACCESS_TOKEN` del `.env` en la variable de entorno (el script no lee `.env`). Lista recursiva puede tardar ~minuto (bucket grande).
  - ⚠️ **Upload manual de archivos sueltos**: las `sb_secret_*` keys NO funcionan para PUT directo al storage ("Invalid Compact JWS"). Usar el CLI: `supabase --experimental storage cp <archivo> ss:///ciszu-cdn/<ruta-repo>` con `SUPABASE_ACCESS_TOKEN` (vault) y proyecto ya linkeado (`supabase link --project-ref obwzzmbvkrcscqwptlqo`). ⚠️ Clave: el CLI **no sobreescribe un objeto existente** (error `409 KeyAlreadyExists`) — para actualizar: DELETE previo con la API de Storage (service_role) y luego subir.
  - ⚠️ **El CDN NO refresca la caché aunque re-subas el mismo contenido** (lección 4 ago 2026): el ETag de Cloudflare es un hash del CONTENIDO, no de los metadatos. Si un SVG subido con `text/plain` se vuelve a subir con el mimetype correcto pero **bytes idénticos**, el ETag no cambia, la revalidación devuelve `304 Not Modified`, y Cloudflare sigue sirviendo la entrada vieja `text/plain` (+ `nosniff` → navegador bloquea el render del SVG) **para siempre**. La purga no se dispara. Fix probado: **cambia el contenido** (aunque sea 1 byte, p.ej. newline final) → ETag nuevo → CDN hace refetch con el mimetype correcto. Ejemplo real: este bug en `ciszubot_logotipo_outline_color.svg`.
- **Offline fallback**: `scripts/copy-assets.js` se ejecuta como `prebuild` en cada website. Copia assets críticos a `public/` con las mismas rutas espejo. `--all` copia todo.
  - Path depth: `projects/ciszu/website/` → `../../scripts/copy-assets.js`, `projects/*/website/` → `../../../scripts/copy-assets.js`
  - **Mirrors**: `projects/<name>/content` → `public/projects/<name>/content/` y la media maestra `projects/ciszukoantony/content` → `public/projects/ciszukoantony/content/` (necesario para el resolver local de logos). Los outputs del prebuild en `public/` de las webs puras están en `.gitignore` (solo muzicmania/Tauri trackea sus mirrors).
- **Asset resolver**: `packages/cdn/index.ts` — `resolveIcon(name, style, format)` para icons, `assetResolver.resolve(path)` para assets arbitrarios. Usa `NEXT_PUBLIC_CDN_URL` como base (ya incluye el bucket: `.../object/public/ciszu-cdn`).
- ⚠️ **`NEXT_PUBLIC_CDN_URL` por proyecto Vercel**: en jul 2026 los proyectos `muzicmania`, `ciszunetworkpage` y `ciszukoantonypage` tenían el valor apuntando al bucket VIEJO `ciszu-assets` (renombrado → URLs 404). Fueron recreadas (DELETE+POST vía API, target production) apuntando a `ciszu-cdn`. Al cambiar env vars en Vercel hace falta un nuevo build/deploy (los redeploys vía API `POST /v16/deployments/{id}/redeploy` NO existen — disparar workflows con un push de `packages/**` o `projects/**`).

### Rutas de logos (fuente maestra)

Los logos viven en `projects/ciszukoantony/content/logos/` (fuente maestra). **El bucket del CDN espeja las rutas del repo** — tras la reestructuración ago 2026 (paths `projects/...`) hay que re-subir con `pnpm cdn:upload` para que el bucket tenga las nuevas rutas. Usar siempre:

```ts
assetResolver.resolve('projects/ciszukoantony/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg')
```

### Sistema de iconos (inline-first + CDN fallback)

- `packages/ui/src/Icon.tsx` — componente compartido `Icon`: renderiza SVG inline (coloreable, sin red) si el nombre está en el registro; **fallback de estilo inline outline↔filled** (si el estilo pedido no existe pero el otro sí, usa ese antes de ir a red — soluciona ciszubot 404 `outline/shield` etc. que solo existen en `filled`); si no está en ninguno, `<img>` al CDN dinámico con **recall local** en caso de error (onError → ruta local → oculto). ⚠️ El `inner` del registry se inyecta **CRUDO** (SSR y cliente) — el registry es fuente propia generada, no input de usuario. NUNCA reintroducir DOMPurify en el render cliente: al sanitizar fragmentos `<path>` sueltos (sin raíz `<svg>`) los vacía y los iconos desaparecen tras navegar (`<g></g>`).
- `packages/ui/src/generated/icon-registry.ts` — **archivo GENERADO** desde el catálogo canónico `shared/icons/svg/{outline,filled}/`. Regenerar con `node scripts/generate-icon-registry.js` (lista curada en el script; añadir nombres nuevos ahí).
- Las 4 apps dependen de `@ciszu/ui` y sus `hooks/useIcon.tsx`/`utils/icons.ts` delegan en el componente compartido.
- **Política**: iconos UI estáticos → inline en bundle (registry); iconos dinámicos/desconocidos → CDN con recall; medios (logos, música, covers) → `assetResolver.resolve()`.

Supabase Storage (`ciszu-cdn` bucket, `avatars` bucket) es para CDN y user-generated content. `avatars` es bucket por defecto de Supabase para fotos de perfil (`auth.users`).

### Sistema mixto local + CDN

El `AssetResolver` (`packages/cdn/index.ts`) usa estrategia híbrida vía `forceCdn`/`forceLocal`:

| Entorno | forceCdn | forceLocal | Resultado |
|---|---|---|---|
| Tauri | — | — | `tauri://localhost/...` (local) |
| Tauri | ✓ | — | CDN |
| Desarrollo | — | — | Ruta relativa `/...` (local) |
| Desarrollo | — | ✓ | Ruta relativa `/...` |
| Producción | — | — | CDN |
| Producción | ✓ | — | CDN |
| Producción | — | ✓ | Ruta relativa `/...` (desde public/) |

Uso:
```ts
resolveIcon('home')                                   // CDN en prod, local en dev
resolveIcon('home', 'outline', 'svg', { forceCdn: true })  // forzar CDN
resolveIcon('home', 'outline', 'svg', { forceLocal: true }) // forzar local
```

- No hay carpeta `assets/` staging — las fuentes originales son la verdad única (`shared/icons/svg/`, `projects/*/content/`, etc.)
- ⚠️ **`encodePath()` en `packages/cdn`** (`src/cdn-client.ts`): `assetUrl`/`resolveIcon`/`assetResolver.resolve` codifican la ruta relativa (espacios, acentos → `%20` etc.) antes de devolver URL. Rutas con espacios como `logos/images/not-outline/...` rompían el `<img>` y el preload (mismatch src↔preload → warning y logo no resuelto). No usar rutas crudas al construir URLs.
- `copy-assets.js` copia solo críticos por defecto, o todos con `--all`
- Binarios grandes (`.mp4`, `.gif`, `.exe`, etc.) excluidos de git globalmente
- **Cloudflare R2** configurado como alternativa futura pero **INACTIVO** (requiere tarjeta/paypal). Credenciales comentadas en el vault.

## Supabase

Single project: `obwzzmbvkrcscqwptlqo.supabase.co`
- Credentials in `services/supabase/.env`
- Muzicmania uses `@supabase/supabase-js` for auth + DB
- Storage buckets: `ciszu-cdn` (public, 50 MB limit, renamed from ciszu-assets) for CDN + user content, `avatars` for profile pics
- Old `services/supabase/supabase/` (config.toml, migrations, ia_docs) was **permanently deleted** — re-run `supabase pull` against the remote project to recover
- CDN: `ciszu-cdn` bucket via Supabase Storage (`NEXT_PUBLIC_CDN_URL`)
- **DB bugfixes** (aplicados vía Management API SQL, jul 2026):
  - `check_username_available` → SECURITY INVOKER + explícito `muzicmania.profiles` (antes: SECDEF sin search_path)
  - `get_email_by_username` → search_path + `muzicmania.profiles` + REVOKE anon (devuelve 401)
  - `handle_account_deletion`, `is_account_recoverable(TEXT)` → search_path + `muzicmania.profiles`
  - `handle_new_user` → eliminada referencia a `public.profiles` (tabla movida a muzicmania — bug crítico que rompía registro)
  - `muzicmania.submit_game_score` → eliminada referencia a `public.profiles` (bug crítico que rompía envío de scores)
  - (Pendiente: leaked password + MFA — dashboard settings, no SQL)
  - ✅ Schemas expuestos (1 ago 2026): Dashboard → Settings → API → Exposed schemas: `muzicmania, ciszubot, ciszunetwork` — al exponerlos, Supabase muestra aviso de "custom grant"/GRANT custom en schemas (advertencia informativa, no es error)

## CI/CD (GitHub Actions)

All workflows run on `push: [main, master]`:

- **CI** (`.github/workflows/ci.yml`) — lint only, matrix over `[website, ciszukoantony, muzicmania]`
- **4 deploy workflows** — each triggers on matching `projects/<name>/**` + `packages/**` + `scripts/copy-assets.js` changes
  - Pattern: `vercel link --yes --project <name>` → `vercel --prod --yes --archive=tgz`, ambos **desde la raíz del repo** (`working-directory: .`)
  - ⚠️ NUNCA usar `vercel pull/build/deploy --prebuilt` dentro de `projects/*/website`: con `rootDirectory` fijado en el proyecto, el CLI duplica la ruta y produce deployments READY pero vacíos (404 en el alias)
  - Deploy desde la raíz requiere el `.vercelignore` raíz (excluye node_modules, .next, content, binarios)
  - Vercel tokens son GH secrets (`VERCEL_TOKEN`)
- Proyectos Vercel: `ciszunetworkpage` -> `projects/ciszu/website`, `ciszukoantonypage` -> `projects/ciszukoantony/website`, `ciszubot` -> `projects/ciszubot/website`, `muzicmania` -> `projects/muzicmania/website`
- Discord bot (`deploy-ciszubot-website.yml`) deploys su website, no el bot en sí

## Git conventions

- `.gitignore` excludes: all `*.gif`, large binaries (`*.exe`, `*.mp4`, `*.mp3`, etc.), `projects/ciszu/content/**/*`, CDN video subdirs, legacy `CiszuGamens/`
- Commit messages are in Spanish (descriptive, one line)
- No commit/push without explicit user request
- Git push fails from this machine (DNS cannot resolve github.com) — user pushes manually

## muzicmania-source (recovery from Vercel)

`muzicmania-source/` contiene ~14,852 archivos (201 MB) extraídos del deployment de Vercel.

### Qué se recuperó (solo `public/`)
- **`icons/png/` y `icons/svg-src/`** — Sistema completo de iconos
- **`arrowskins/`** — 384 SVGs en 24 variantes
- **`logos/`** — gif/imagen/video (logotipos, isotipos, taglines)
- **`music/`** — Álbum genesis_neon con sus subálbumes
- **`downloads/`** — 2 instaladores EXE (Windows 10/11, v2.0.1)
- **`docs/`** — Documentación en MD/PDF/DOCX/7z/RAR/ZIP
- **`fonts/`**, **`images/`**, **`particleskins/`** — Varios assets menores

### Qué NO se recuperó (solo existía en GitHub)
- **`src/`** — Código fuente TypeScript/React (componentes, hooks, stores, servicios, páginas)
- **Configs** — `next.config.ts`, `tsconfig.json`, `tailwind.config.mjs`, `postcss.config.mjs`, `eslint.config.mjs`
- **`scripts/`** — Scripts de build Tauri, patch NSIS, download flags
- **`supabase/`** — Consola de debug, migraciones
- **`components/`**, **`hooks/`**, **`lib/`**, **`utils/`**, **`config/`**, **`data/`**, **`types/`**, **`services/`**, **`store/`**

Vercel solo preserva build output + `public/`. Para recuperar source se necesita el repo de GitHub original.

## ⚠️ Seguridad — Credenciales

**Este repositorio es PRIVADO.** Si alguna vez se vuelve público, hay credenciales comprometidas en el historial de git que deben ser rotadas inmediatamente.

Archivos que NUNCA deben trackearse en git (ya en `.gitignore`):
- `documents/md/credentials.md` — contenido sensible (fue purgado del historial vía filter-branch)
- `docs/md/VERCEL_ENV_VARS.md` — documenta secrets en texto plano (eliminado del disco)
- `services/supabase/docs/md/PRIVATE_DOCS.md` — **redactado** (jul 2026) tras alerta de secret scanning: contenía password del dashboard, PAT, service_role, anon key y JWT secret en texto plano. Las credenciales reales viven SOLO en `services/supabase/.env` (gitignored). No volver a pegar secrets en docs.

Si el repo cambia a público:
1. Rotar TODAS las credenciales (Supabase keys, Discord token, Vercel token, Cloudflare R2)
2. Purgar historial con `git filter-branch` o BFG Repo-Cleaner
3. Verificar que no queden secrets en `git log --all -p | grep -i "sb_\|vcp_\|ghp_\|token\|secret\|key"`

## Gotchas

- **NUNCA añadir `@types/react`/`@types/react-dom` al `package.json` ROOT** (jul 2026): crea doble identidad de tipos — `ReactNode` importado (`.pnpm/@types+react@19.2.17`) no asignable a `React.ReactNode` global en `projects/ciszu/website/src/app/layout.tsx`. Tampoco usar overrides en `pnpm-workspace.yaml` para types. Los types de react viven SOLO en `packages/ui/package.json` (devDeps 19.2.17 + react/react-dom 19.2.7 devDeps para su propio tsc) y cada app tiene los suyos.
- **`packages/ui` necesita `react`/`react-dom`/`@types/react` en devDependencies**: sin ellos, `tsc` del ui falla con "Could not find a declaration file for module 'react'" cuando las apps compilan `Icon.tsx`.
- **`images.unoptimized: true` en las 4 apps** (jul 2026): el optimizador de imágenes de Vercel devolvía 400 (`INVALID_IMAGE_OPTIMIZE_REQUEST`) para TODO (local y remoto) por el límite mensual del plan Hobby. Con `unoptimized` next/image sirve el src directo (sin `/_next/image`).
- **muzicmania REST**: las tablas viven en el schema `muzicmania` (`db: { schema: 'muzicmania' }` en `src/config/supabase.ts`). Columnas reales de `scores`: `id, user_id, score, created_at, track_id, accuracy` (NO `song_id` — el código usa `track_id`). `profiles` NO tiene `created_at` (usar `updated_at`) y no hay FK scores→profiles (el embed `profiles(...)` da 400 — consultar aparte por `user_id`).
- **`.single()` con 0 filas → 406 PGRST116**: usar siempre `.maybeSingle()` cuando la fila puede no existir (StatsTicker, récord global). El 406 en consola de `select=score&order=score.desc&limit=1` era eso.
- **Cargo advisories pendientes** (`projects/muzicmania/launcher`): `glib` 0.18.5 (GHSA-wrw7-89jp-8q8g, fix en ≥0.20.0) requiere gtk/tauri 3 — tauri 2.11.5 lo pincha en 0.18. `serde_with` 3.21.0 ya patcheado (cargo update jul 2026).
- **Overrides de seguridad** en `pnpm-workspace.yaml`: `undici 6.27.0`, `body-parser 1.20.6`, `brace-expansion 5.0.8`, `postcss 8.5.25`, `minimatch@^9 9.0.7`, `sharp 0.35.3` (forzar versiones patcheadas para transitivas).
- `muzicmania/website` has **Tauri + NSIS** commands (`pnpm tauri:build`, `pnpm tauri:build:nsis`); needs Rust toolchain
- No test framework is configured — CI only runs `lint`
- `prebuild` relative paths: all 4 webs at depth 3 (`projects/*/website` → `../../../scripts/copy-assets.js`)
- `projects/ciszu/content/` holds master media of la página Ciszu; each app has a mirror `content/` + `documents/` + `documents/ia_docs/`
- Vercel deployments do **not** preserve original TypeScript source — only build output + public/ static assets
- `packages/cdn`, `packages/ui`, `packages/config`, `packages/utils` are the shared npm packages
- Icon system is in `shared/icons/` (outline/filled/flag); use `resolveIcon()` from `@ciszunetwork/cdn`. All 4 websites import this package.
- **Legacy files** (pre-date `packages/cdn/`): `shared/hybrid-system.js`, `shared/aliases.json`, `scripts/setup-icons-system.js`, `scripts/setup-aliases.js` — no longer imported by any app. The canonical resolver is `packages/cdn/index.ts`.
- **Content dirs**: `projects/ciszu/content/`, `projects/*/content/`, `projects/ciszukoantony/content/`, `projects/ciszugamens/content/` hold multimedia (banners, flyers, logos, thumbnails). These are candidates for CDN but tracked in git for local builds.
- **Espacio en disco LIMITADO (crítico)**: el PC tiene poco espacio libre en C: (disco del sistema). Reglas OBLIGATORIAS para cualquier trabajo temporal:
  - **NUNCA** escribir archivos temporales en `C:\Users\fplay\AppData\Local\Temp` ni otras rutas de C: — el espacio libre allí es mínimo
  - Usar SIEMPRE `E:\Ciszu Network\.opencode-tmp/` (gitignored, dentro del repo en el disco E:) para logs, reportes, archivos de trabajo temporales
  - Borrar los archivos temporales de `.opencode-tmp/` en cuanto dejen de usarse (fin de tarea), o como máximo limpiar los antiguos (>1 semana)
  - Antes de descargar imágenes Docker/paquetes grandes, verificar espacio: `Get-PSDrive C,E` (C: no debe bajar de ~5 GB libres)
  - La DB local de Supabase (`supabase start`) ocupa ~1.5 GB en Docker — verificar espacio antes de usarla

## Supabase Advisors (Database Linter)

### Security advisors — estado actual (jul 2026)

| Advisor | Estado | Explicación |
|---|---|---|
| `authenticated_security_definer_function_executable` | 0 warnings | ✅ Migración 11 (REVOKE EXECUTE de anon/authenticated en `handle_review_like`, `handle_review_update`, `update_track_like_count` — son SOLO triggers, el motor no chequea EXECUTE al dispararlos). ⚠️ **Pendiente de aplicar**: requiere PAT válido vía Management API (el `sbp_` filtrado fue redactado y ya no funciona). |
| `auth_leaked_password_protection` | 1 warning | **Free Tier limitation** — solo activable desde Dashboard con plan Pro. |

**Funciones cambiadas a SECURITY INVOKER** (más seguro, RLS se respeta):
- `public.get_email_by_username(text)` → INVOKER (migration 09)
- `public.is_account_recoverable(uuid)` → INVOKER (migration 09)
- `public.is_account_recoverable(text)` → INVOKER (migration 09)
- `public.submit_game_score(...)` → INVOKER (migration 09)
- `muzicmania.submit_game_score(...)` → INVOKER (migration 10)

### Performance advisors — estado actual (jul 2026)

| Advisor | Estado | Explicación |
|---|---|---|
| `auth_rls_initplan` | 0 warnings | ✅ Todas las `auth.uid()`/`auth.role()`/`auth.jwt()` envueltas en `(SELECT auth.X())` |
| `multiple_permissive_policies` | 0 warnings | ✅ Policies duplicadas mergeadas, ALL separado en comandos individuales |

**Reglas para evitar `auth_rls_initplan`:**
- Toda llamada a `auth.uid()`, `auth.role()`, `auth.jwt()` en USING/CHECK de RLS policies debe ir envuelta en `(SELECT auth.X())`
- Si ya está dentro de una subconsulta EXISTS, envolver igualmente: `profiles.id = (SELECT auth.uid())`

**Reglas para evitar `multiple_permissive_policies`:**
- No usar `FOR ALL` — separar en policies individuales por comando (SELECT/INSERT/UPDATE/DELETE)
- Si un mismo rol+acción tiene dos policies con distintos USING, mergearlas con OR
- Para `muzicmania.likes`: "Likes are viewable by everyone" (SELECT) + "Users can manage their own likes" (ALL) → la ALL cubre SELECT, causando duplicado. Solución: ALL → INSERT+UPDATE+DELETE separados.

## Seguridad — XSS y SQL Injection

### Prevención de XSS

- **NUNCA** usar `innerHTML` o `dangerouslySetInnerHTML` con datos de usuario sin escapar
- Usar `escapeHtml()` helper (crea textNode via DOM y extrae innerHTML):
  ```js
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
  ```
- Preferir `textContent` sobre `innerHTML` cuando no se necesita HTML
- En Next.js, JSX escapa automáticamente — solo preocuparse por `dangerouslySetInnerHTML`
- TODO `dangerouslySetInnerHTML` debe usar DOMPurify.sanitize() si los datos pudieran volverse dinámicos en el futuro

**Archivos legacy con XSS ya fixeados:**
- `projects/muzicmania/web/src/utils/legacy_scripts/search.mjs` — `query` del search box escapado con `escapeHtml()`
- `projects/muzicmania/web/src/utils/legacy_scripts/auth.mjs` — `displayName`/`username` escapados con `escapeHtml()`
- Duplicados en `projects/muzicmania/website/` (untracked)

### Prevención de SQL Injection

- **NUNCA** concatenar strings en queries SQL: `` `SELECT * FROM t WHERE id = '${val}'` ``
- Usar siempre el ORM de Supabase (parametrizado): `.eq('id', val)`, `.rpc('func', { param: val })`
- En scripts que construyen SQL dinámico, validar entrada con regex antes de interpolarla
- Las 52 funciones PL/pgSQL del proyecto están **limpias** (sin `EXECUTE` dinámico)
- Discord bot usa Discord API segura — no construye SQL directamente

**Archivos con patrones inseguros ya fixeados:**
- `scripts/fix-migrations.js` — validación regex `/^\d{14}$/` sobre version strings antes de usarlas en SQL
- `projects/muzicmania/web/src/scripts/dbManager.ts` — `eval()` + raw SQL: agregadas confirmaciones explícitas (dev tool, no se shippea)

**Dev tools que requieren precaución:**
- `projects/muzicmania/*/src/scripts/dbManager.ts` — tiene `eval()` (shell interactiva) y `execute_sql_query` RPC. Son herramientas de desarrollo solamente. Tienen doble confirmación de seguridad.

## Migraciones aplicadas (jul 2026)

| Migration | Archivo | Qué hace |
|---|---|---|
| 04 | `20260729000004_fix_excessive_grants.sql` | Revocó ALL de anon, solo SELECT |
| 05 | `20260729000005_fix_advisors_security_definer.sql` | Fix 27 warnings: search_path + REVOKE anon |
| 06 | `20260729000006_fix_remaining_anon.sql` | REVOKE preciso por signature exacta |
| 07 | `20260729000007_fix_public_inherit.sql` | REVOKE FROM PUBLIC + GRANT a authenticated |
| 08 | `20260729000008_fix_performance_advisors.sql` | Initplan wrapping + eliminar policies duplicadas |
| 09 | `20260729000009_fix_remaining_advisors.sql` | Funciones públicas a INVOKER + merged policies |
| 10 | `20260729000010_fix_submit_game_score_invoker.sql` | `muzicmania.submit_game_score` → INVOKER |
| 11 | `20260729000011_revoke_execute_trigger_functions.sql` | REVOKE EXECUTE de anon/authenticated en las 3 funciones trigger SECURITY DEFINER restantes (cierra advisor). ✅ **APLICADA 31 jul 2026** vía Management API (PAT nuevo del usuario) — verificada: anon/auth_exec = false en las 3 |
| 12 | `20260801000012_revoke_execute_security_definer.sql` | Red de seguridad: REVOKE EXECUTE idempotente de TODAS las funciones SECURITY DEFINER (muzicmania triggers + public auth/profiles triggers) |
| 13 | `20260801000013_bot_status_heartbeat.sql` | ✅ **APLICADA 2 ago 2026** — tabla `ciszubot.bot_status` (single-row id=1: online, last_seen, started_at, version, guilds, commands_total, prefix). Policy SELECT para anon/authenticated + GRANT SELECT anon + **GRANT ALL service_role** (Management API no aplica grants default). La consume la web de ciszubot (estado en vivo) |
| 14 | `20260802000014_bot_expansion.sql` | ✅ **APLICADA 2 ago 2026** — 13 tablas en `ciszubot`: guild_configs, wallets, transactions, shop_items, inventory, levels, warns, tickets, giveaways, afk, alliances, discord_users, snipes (+5 índices) |

## Herramientas de desarrollo (GUI + CLI) — ago 2026

Pila decidida (análisis completo en `docs/ia_docs/TOOLS.md`): **DBeaver CE + dbvr Community** (BD), **Bruno** (API client), **Fork** (Git GUI).

- **dbvr Community**: CLI BD headless (Apache-2.0, descarga SEPARADA de dbeaver.io/dbvr — NO viene con DBeaver). Instalado en `C:\Program Files\dbvr\dbvr.exe` 26.1.4 (bundle Java 21), PATH de usuario actualizado. **Datasource `supabase` CONFIGURADO y verificado** (2 ago 2026): pooler `aws-1-us-east-1.pooler.supabase.com:6543` (⚠️ SOLO transaction 6543 responde desde este PC; session 5432 y directa timeout), user `postgres.obwzzmbvkrcscqwptlqo`, db `postgres`, password = `SUPABASE_DB_PASSWORD` de `services/supabase/.env`. Uso: `dbvr sql -ds=supabase "SELECT ..."`, `-format=json`, `dbvr meta table list -ds=supabase --schema=ciszubot` (⚠️ el flag `--schema` va ANTES del subcomando), `dbvr datasource list/view`, y `dbvr mcp start -ds=supabase` (MCP server opcional).
- **DBeaver CE**: GUI BD. dbvr y DBeaver **comparten workspace** (`C:\Users\fplay\AppData\Roaming\DBeaverData\workspace6`) → la conexión `supabase` de dbvr ya aparece en DBeaver (driver PostgreSQL 42.7.13 descargado). No crear conexión duplicada.
- **Bruno**: cliente API git-native en `apis/bruno/` (**formato OpenCollection YAML** — `opencollection.yml` + `*.yml`, NUNCA `.bru` bajo ese root; el CLI 4.x no los detecta). GUI: File → Open Collection → `E:\Ciszu Network\apis\bruno`. CLI instalado (4.0.0, `pnpm add -g @usebruno/cli`; requiere `PNPM_HOME=C:\Users\fplay\AppData\Local\pnpm` en PATH vía `pnpm setup`). Ejecutar desde raíz: `pnpm api:test` / `pnpm api:test:report` (wrapper `scripts/run-bru.js` — Windows necesita `cmd /c bru`, no `bru.cmd` directo). Colección: `health/` (5 checks: 4 webs + bot_status) + `rest/` (leaderboard muzicmania, bot_status completo, stats local :5000 con tag `local` excluido por defecto). Env: `apis/bruno/environments/prod.yml` (gitignored, formato `variables: [{name, value}]`; plantilla `prod.example.yml`).
- **Password BD**: la Management API NO devuelve el password (solo `[YOUR-PASSWORD]` placeholder en `/config/database/pooler`). Se resetea con `PATCH /v1/projects/{ref}/database/password` (solo requiere el nuevo, min 4 chars). Tras resetear, actualizar `SUPABASE_DB_PASSWORD` en `services/supabase/.env`.
- **`backup-db.js`**: reparado 2 ago 2026 — endpoint `/config/database/pooler` (el viejo `/database/connection` da 404), password desde `.env`, fix CRLF. ⚠️ `pg_dump` del sistema es 13.4 (`E:\DaVinci\PGTools\pg_dump.exe`) — **incompatible con server 17.6** ("server version mismatch"); el backup real requiere pg_dump ≥17 (PostgreSQL 17 o Docker `postgres:17`).
- **Descartadas** (incluso premium): Postman (free degradado, cloud), GitKraken (AI redundante con el agente, pesado), TablePlus (sin CLI, Windows rezagado), Beekeeper Personal (no aporta a IA).

## Scripts útiles (en `scripts/`)

> **Limpieza 2 ago 2026**: eliminados ~50 scripts one-shot (campañas de seguridad/icons/docs de jul 2026 y legacy pre-`packages/cdn`). Solo quedan los vivos. Los borrados siguen en el historial de git.

- `check-func-perms.js` — verifica permisos EXECUTE por rol en funciones
- `check-policies.js` — lista cantidad de policies por tabla
- `check-auth-wrapper.js` — detecta `auth.*()` sin wrapper `(SELECT ...)` en policies
- `analyze-policies.js` — detecta policies duplicadas y auth calls top-level
- `backup-db.js` — backup con timestamp a `archives/backups/db/` (regla de backups: complejo → archives/backups), limpia >30 días, flags `--scheduled`/`--dry-run`
- `update-env-keys.js` — backup automático de `.env` a `archives/backups/envs/<fecha>/` + actualiza todos los `.env` con nuevas keys tras rotación manual
- `copy-assets.js` — prebuild de las 4 webs: copia logos críticos (desde `projects/ciszukoantony/content/logos`), mirrors y `shared/icons` a `public/`; root marker = `pnpm-workspace.yaml`
- `upload-cdn.js` — `pnpm cdn:upload` (sube a `ciszu-cdn` desde SOURCES; `--force` re-sube todo ignorando tamaño/mimetype)
- `check-cdn-mimes.js` — `pnpm cdn:verify` (lista el bucket y reporta objetos con mimetype incorrecto para su extensión)
- `generate-icon-registry.js` — regenera `packages/ui/src/generated/icon-registry.ts` desde `shared/icons/svg`
- `generate-commands.js` — regenera `commands.json`/`docs/slash-commands.*` del bot desde dist
- `generate-material-icons-doc.js` — regenera `projects/ciszu/docs/ia_docs/MATERIAL_ICONS.md` con el catálogo COMPLETO de Material Icon Theme (descarga los fuentes oficiales a `.opencode-tmp/material-icons-theme/`; `--force` re-descarga). Parsea `folderIcons.ts` + `fileIcons.ts` (~290 folder icons + ~610 file icons)
- `ntfy-notif.js` — `pnpm notify` — notificaciones push vía ntfy.sh. Enviar/listar/limpiar: `pnpm notify "Titulo" "Mensaje"`, `--priority urgent --tag warning`, `--list`, `--clear` (requiere token), pipe desde stdin. Topic/token desde `NOTIFY_TOPIC`/`NOTIFY_TOKEN` en `.env.local` (raíz) o `services/supabase/.env` (vault). **Ciclo de notificaciones activo (política — ver CONTROL_REMOTO.md §1.2)**: avisar por push al móvil en inicio/fin de tarea, antes de pedir accesos, en advertencias, errores (urgent) y cuando se necesite un token/credential del usuario. No spam: un push por hito, emparejar inicio/fin.
- Aplicar migraciones: `node scripts/apply-migration-XX.js`
- `setup-remote-control.ps1` — activa el control remoto de la terminal (OpenSSH Server + Tailscale; re-ejecutable, PowerShell admin). Ver `projects/ciszu/docs/ia_docs/CONTROL_REMOTO.md`
- `backup-db.js` / `run-bru.js` / `fix-migrations.js` / `md2office.js` / `txt2md.js` / `txt2pdf.py` / `docx2pdf.ps1` / `sync-public-docs.js` / `setup.ps1` — utilidades de backup, API testing, docs y setup

## Control remoto de la terminal (ago 2026)

**Implementado en el PC**: OpenSSH Server v10.0.0 (MSI oficial `winget install Microsoft.OpenSSH.Preview`, servicio `sshd` Running + Automatic, puerto 22, DefaultShell = PowerShell) + Tailscale v1.98.10 logueado (IP tailnet `100.75.124.72`, hostname `ciszu-pc`) + clave ed25519 `ciszu_pc_ed25519` autorizada en `C:\ProgramData\ssh\administrators_authorized_keys`. En el móvil: Tailscale + Termius (misma cuenta Google, key `CISZU SSH Key`, host `Ciszu-PC` funcional). **Enfoque final = opencode NATIVO de Windows con `serve` + `attach`** (4 ago 2026): un servidor headless `opencode serve --port 4096 --hostname 127.0.0.1` corre en el PC (tarea programada `opencode-server-ciszu` AtLogOn oculta + script idempotente `C:\Users\fplay\opencode-server-ensure.ps1`); los lanzadores `opencode-ciszu-pc.cmd` (PC) y `opencode-ciszu-cel.cmd` (móvil), ambos en PATH con stub en `AppData\Roaming\npm`, ejecutan el ensure y `opencode attach http://127.0.0.1:4096`. PC y móvil (Termius → SSH `fplay@100.75.124.72:22` → PowerShell → `opencode-ciszu-cel`) se anclan al MISMO servidor → **misma sesión en vivo** en ambos (SSE), historial/theme/carpeta de Windows. Servidor ligado a loopback (seguro sin password; el móvil entra vía SSH local). Logs: `E:\Ciszu Network\.opencode-tmp\opencode-server{,-err}.log`. `opencode` a secas sigue siendo instancia local independiente (sin live-sync). ⚠️ La caja de texto del chat en el móvil NO es configurable (schema TUI solo expone `prompt.max_height`/`max_width` de la pantalla de inicio; `--mini` cambia toda la interfaz — probado y descartado). **WSL/tmux DESCARTADO** (duplicaba db de opencode sin historial, paths `/mnt`, TUI deformada con 2 clientes). Recordar: **Proton VPN puede estar activa en el PC** — el tráfico a `100.x.x.x` (tailnet) no se ve afectado por el adaptador `10.2.0.2` de la VPN. Doc completa: `projects/ciszu/docs/ia_docs/CONTROL_REMOTO.md` + guía práctica `GUIA_ACCESO_REMOTO_CEO.md`. **Plan de escalabilidad organizacional** (cómo repartir permisos por rol cuando el equipo crezca: creativos, devs, auditores, etc.): `projects/ciszu/docs/ia_docs/PLAN_ESCALABILIDAD_ORGANIZACIONAL.md` — la cuenta ya es GitHub **Organization** `Ciszu-Network` (ADMIN: CEO), con decisiones pendientes marcadas en el doc.

⚠️ **Gotchas reportados**:
- **OpenSSH Windows + host keys**: si el servicio sshd entra en crash-loop (evento 7031 `service terminated unexpectedly`) con `WARNING: UNPROTECTED PRIVATE KEY FILE`, la causa es owner/permisos de las host keys → NUNCA crear con `ssh-keygen -A` en ruta `C:\ProgramData\ssh` sin reparar. Fix: `Import-Module 'C:\Program Files\OpenSSH\OpenSSHUtils.psm1'` → `Repair-SshdHostKeyPermission` para cada `ssh_host_*_key` + `Repair-SshdConfigPermission` (owner SYSTEM, solo SYSTEM+Admins con acceso).
- **Instalación legacy de OpenSSH**: si service sshd existe pero la capability `OpenSSH.Server` = NotPresent, borrarlo (`sc.exe delete sshd`) y reinstalar con winget (el MSI crea el servicio correctamente).
- **Tailscale login headless**: `tailscale up` abre el navegador y caduca la URL si no se completa pronto; para rotar, ver `https://login.tailscale.com/a/<hash>` en stdout.
- **OpenSSH Windows no carga el perfil de PowerShell del usuario** en sesiones SSH: los aliases/funciones del perfil NO existen al conectar — usar scripts `.cmd` con ruta absoluta en su lugar. `C:\Users\fplay` está en el PATH de usuario → los lanzadores `.cmd` ahí (p.ej. `opencode-ciszu-pc`, `opencode-ciszu-cel`) se ejecutan escribiendo solo su nombre, sin `.\`.
- **Probar SSH interactivo con `ssh -tt` directo**: los `Start-Job` de PowerShell no preservan el pty y dan falsos negativos del attach.
- **WSL/tmux descartado para esto** (4 ago 2026): opencode en WSL tiene db/theme separados de Windows, paths `/mnt/e` confusos y la TUI se deforma con 2 clientes de distinto tamaño. Si se reintenta algún día, NUNCA usar `bash.exe` como DefaultShell (apunta a docker-desktop, no a Ubuntu: `execvpe(/bin/bash) failed`) y los perfiles de shell no cargan por SSH.
- Los scripts de diagnóstico temporal de esta implementación viven en `E:\Ciszu Network\.opencode-tmp/` (gitignored) — limpiar cuando dejen de usarse.

## Voz para opencode (STT/TTS) — ago 2026

**Integrado EN EL REPO (5 ago 2026)**: voz bidireccional en opencode basada en `@renjfk/opencode-voice` v0.6.0 con **fork local parcheado para Windows trackeado en el repo** (`tools/opencode-voice/`), registrado como plugin por ruta local en `C:\Users\fplay\.config\opencode\tui.json`. **Binarios, modelos y voces gitignored** en `tools/opencode-voice/runtime/` (whisper-cpp 1.9.2, `ggml-large-v3-turbo-q5_0` 574MB, piper + espeak-ng-data, ffmpeg 9.0, sox 14.4.2 win32 solo utilidad) y temporales en `tmp/` (inbox del móvil, processed, wavs). No quedan carpetas de voz fuera del repo. Pipeline: **STT** = ffmpeg DirectShow (grabación) → `whisper-cli` local → normalización LLM; **TTS** = normalización LLM → `piper` → `ffplay` (PC) o **push ntfy con audio al móvil**. Voces: **`sharvard` (ES, femenina — DEFAULT)** + `amy` (EN, femenina) + ryan/bryce EN + davefx ES. Endpoint LLM: **Gemini OpenAI-compatible** (`generativelanguage.googleapis.com/v1beta/openai/`, `gemini-3.6-flash`, `apiKeyEnv: GEMINI_API_KEY`). Env vars de usuario: `GEMINI_API_KEY` + **`NOTIFY_TOPIC`/`NOTIFY_TOKEN`** (para `/tts-phone` y avisos de voz). PATH: `runtime\whisper\Release`, `runtime\piper\piper`, `runtime\ffmpeg...\bin`.

**Patches Windows** (vs upstream): `stt.js` — rutas repo-relativas vía `VOICE_BASE` (derivadas de `fileURLToPath(import.meta.url)`), `transcribe(kv, logger, filePath)` acepta audio arbitrario, grabación con **ffmpeg dshow** (`-f dshow -i audio=<mic>` + `silenceremove`), parada limpia escribiendo `q` por stdin, mics parseando `ffmpeg -list_devices`, `pkill` solo no-win32; `tts.js` — playback con **ffplay**, `piperOnPath` acepta `piper.exe`. En Windows **sox NO graba** (`-d` → "no default audio device") — por eso ffmpeg; sox solo conversión manual raw↔wav.

**Uso**: `/stt-record` (ctrl+r, toggle grabar/transcribir), `/stt-submit` (leader+r, transcribe+envía), `/stt-mic`, `/stt-model`, `/stt-file` + `/stt-file-submit` (**voz del móvil**: SFTP Termius → `tmp/inbox/` → transcribe el audio más reciente; wav/mp3/flac/ogg/m4a/aac/opus/webm, convierte a wav si hace falta, mueve a `tmp/processed/`), `/tts-speak` (leader+s), `/tts-mode` (leader+v, auto-TTS), `/tts-voice` (sharvard/amy ♀ default), `/tts-phone` (**IA habla al móvil**: push ntfy con el audio de la respuesta), `/tts-stop` (escape). `ctrl+r` pisa `session_rename` → `"session_rename": "none"` en tui.json (renombrar sesión sigue por `/rename`). ⚠️ El plugin se carga al arrancar el servidor opencode — **iniciar/recargar sesiones con `opencode-run`** (`scripts/` + copia en PATH; mata 4096 si escucha → ensure → attach; corta la sesión en vivo). Mics PC: `Micrófono Ciszuko (Realtek(R) Audio)` + `Micrófono de escritorio (3- Microsoft® LifeCam HD-3000)`. Smoke test sin TUI: `node tools/opencode-voice/tmp/test-plugin.js`. Doc completa: `projects/ciszu/docs/ia_docs/VOZ_OPENCODE.md`.

**Avisos ntfy con audio** (política 5 ago 2026): `pnpm notify "Título" "Mensaje" --voice` adjunta el audio del mensaje (Piper sharvard por defecto; `--voice amy|ryan|bryce|sharvard|davefx`) al mismo push — texto + audio en uno solo, reproducible desde la app ntfy. El `pnpm notify` correspondiente al `ntfy-notif.js` de `scripts/`.

## Herramientas de seguridad instaladas (jul 2026)

| Herramienta | Cómo | Notas |
|---|---|---|
| **secretlint** (13.0.4) | `secretlint` (npm global) | Hook pre-commit activo (`.git/hooks/pre-commit`, ignora con `--no-verify`). Config: `.secretlintrc.json` (preset-recommend + patrones custom `sbp_`, `vcp_`, `sb_secret_`, JWT) |
| **gitleaks** (8.30.1) | `C:\Users\fplay\AppData\Local\Programs\Gitleaks\gitleaks.exe` | Escaneo de historial: `--log-opts="--all"`. Reporte del escaneo jul 2026: `Temp\opencode\gitleaks_hist.json` (130 leaks, la mayoría de `.turbo/runs/*.json` ya destrackeados; restan `cloudflare-api-key` ×3 en `.turbo` del historial y 1 key en `generate-tracks.ps1` ya quitada) |
| **semgrep** (1.172.0) | `semgrep scan --config p/security-audit` (pip) | ✅ Escaneo completo (jul 2026): todas las apps + packages + discord + scripts → 0 findings reales. Solo falsos positivos aceptados: `SocialIcon.tsx` (reescrito, dangerouslySetInnerHTML eliminado), `packages/ui/src/Icon.tsx` (sanitizado con DOMPurify), `devConsole.ts` (execSync dev tool) |
| **trivy** (0.72.0) | PATH: `C:\Users\fplay\AppData\Local\Microsoft\WinGet\Links` | Usa `--db-repository mirror.gcr.io/aquasec/trivy-db` (con la red nueva resuelve). pnpm-lock: 0 vulns HIGH/CRITICAL |
| **cargo-audit** (0.22.2) | `cargo audit` (en `projects/muzicmania/launcher/src-tauri`) | 17 warnings permitidos: glib (tauri 3) + unic-ucd-version (transitivo) |
| **pnpm audit** | `pnpm audit --prod` | 0 vulns |
| **ZAP** (2.17.0) | `C:\Program Files\ZAP\Zed Attack Proxy\zap.bat` (o jar directo) | ✅ Instalado + probado (31 jul 2026): DAST completo sobre `ciszunetwork.vercel.app` → 0 High, 4 Medium (CSP no set, Cross-Domain `ACAO:*`, Anti-clickjacking, SRI missing), 3 Informational (cache-control, User-Agent Fuzzer). Reporte: `Temp\opencode\zap_ciszunetwork.html`. ⚠️ **Solo modo daemon + API** (el usuario no usa la GUI). CLI: `zap.bat` con rutas relativas al CWD (ejecutar desde su directorio o usar el jar con ruta absoluta). `-quickstart` NO existe en 2.17 (add-on GUI) — usar daemon + API: `java -jar zap-2.17.0.jar -daemon -host 127.0.0.1 -port 8080 -config api.disablekey=true`, luego spider (`/JSON/spider/action/scan/`) y ascan (`/JSON/ascan/action/scan/`). Requiere JAVA_HOME (set a nivel máquina: `C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot`) |

**Pendientes sesión anterior (jul 2026):**
- ✅ Migración 11 APLICADA (REVOKE EXECUTE trigger functions) — vía Management API con PAT nuevo
- ✅ Schemas expuestos en Dashboard (Settings → API → Exposed schemas: `muzicmania, ciszubot, ciszunetwork` — 1 ago 2026)
- Rotar tokens — lista COMPLETA con valores en `C:\Users\fplay\AppData\Local\Temp\opencode\tokens_a_rotar.md` (8 ítems restantes: service_role, JWT secret, password dashboard, anon, Vercel vcp_, Suno AI key, Cloudflare R2, Discord). PAT nuevo del usuario ya rotado. Supabase: regenerar en Dashboard y actualizar `.env` con `scripts/update-env-keys.js`. Vercel: rotar `vcp_` y actualizar GH secret `VERCEL_TOKEN` (4 workflows lo usan)
- ✅ Semgrep scan completo + ✅ ZAP instalado + probado (DAST 0 High/4 Medium en ciszunetwork) + secretlint full repo scan (CORRIÓ pero expiró timeout 10 min por tamaño del repo — correr por subtargets o con `--exclude-dir node_modules,.next,.turbo`)
- ✅ Build de las 4 apps corregido: la causa del error `ReactNode` era `@types/react` añadido al ROOT — revertido (ver Gotchas)
- ✅ DOMPurify aplicado en `packages/ui/src/Icon.tsx` (semgrep packages 0 findings)
- ✅ PAT viejo filtrado REVOCADO por el usuario en Supabase Dashboard (cierra alerta secret scanning)
- ✅ Schemas expuestos en Dashboard → Settings → API → Exposed schemas: `muzicmania, ciszubot, ciszunetwork` (1 ago 2026 — con aviso informativo de GRANT custom)
- ⚠️ `auth_leaked_password_protection` advisor — requiere plan Pro (Free tier limitación, intencional)
- `.turbo/runs/*.json` con env vars siguen en el historial git (git rm --cached hecho; purgar con filter-branch si el repo se hace público)

## A ejecutar en toda implementación nueva

0. **Estándares de ingeniería**: leer y aplicar `docs/ia_docs/CODE_PRINCIPLES.md` (DRY, KISS, YAGNI, SOLID, Separation of Concerns, Least Astonishment) y `docs/ia_docs/DEVSECOPS.md` (DevSecOps: SAST/DAST, Shift-Left, herramientas) en toda implementación.
1. **Advisors**: después de cualquier cambio en policies o funciones, verificar Security + Performance Advisors en Dashboard
2. **XSS**: todo input de usuario renderizado debe pasar por `escapeHtml()` o `textContent`; nunca `innerHTML` directo
3. **SQL Injection**: nunca concatenar strings en SQL; siempre ORM parametrizado o RPC con objetos
4. **SECURITY DEFINER**: solo cuando sea estrictamente necesario (triggers que modifican datos de otros usuarios); preferir INVOKER siempre que RLS lo permita
5. **RLS policies**: siempre separar por comando (no ALL), evitar USING(true) sin restricción de rol, envolver auth.*() en subconsultas

## Límite de contexto de sesión (opencode) — OBLIGATORIO

**PARA AGENTES DE OPENCODE**: cuando la conversación supere los **120k tokens** de contexto, el modelo se vuelve MUY lento (respuestas tardan minutos y degradan la calidad). Reglas:

1. **Al acercarse al umbral (~110-120k)**: avisar al usuario por push (`pnpm notify`) y proponer **cambiar de sesión**.
2. **Antes de cambiar de sesión**: (a) commitear todo el trabajo pendiente, (b) actualizar este AGENTS.md con el estado actual y los pendientes, (c) guardar el estado del to-do (todo completado), (d) dejar un resumen claro del próximo paso.
3. La nueva sesión debe empezar diciendo "continúa" con el resumen del estado guardado.
4. No escribir código nuevo tras pasar el umbral salvo que sea trivial — priorizar guardar estado.

**Tamaños típicos**: una sesión normal de trabajo rinde ~60-90k tokens antes de tocar el umbral. Sesiones con muchos outputs de tools (logs, listados) llegan antes.

## Errores comunes de opencode y solución

### 500s / errores de servidor (API)
- **Síntoma**: respuestas del asistente fallan con errores 500/502/503, o el agente reporta "Error interno".
- **Causa**: saturación temporal del proveedor del modelo o inestabilidad de red del PC.
- **Solución**: (1) esperar 1-2 min y reintentar el mismo prompt (el estado del chat no se pierde), (2) si persiste, verificar red (VPN/DNS), (3) cambiar a un modelo alternativo si está disponible.

### Errores de red/DNS del PC (frecuente)
- **Síntoma**: `fetch failed`, `ENOTFOUND`, `getaddrinfo`, resolución DNS intermitente (github.com, huggingface.co, api-inference.huggingface.co, etc.).
- **Causa**: el proveedor DNS del PC falla intermitentemente; no es un problema del código.
- **Solución**: (1) comprobar con `Resolve-DnsName <dominio> -Server 8.8.8.8` si el DNS externo resuelve (si sí → es el DNS local), (2) **activar la VPN** del usuario (Proton VPN) — suele arreglarlo, (3) reintentar la operación. **No buscar vías alternativas de red**: la instrucción del usuario es usar la VPN directamente.

### Errores 401/403/429/402 en APIs de arte (contexto IA)
- **401**: key inválida/revocada → rotar token y actualizar vault (`services/supabase/.env`).
- **403**: geo-bloqueo (SiliconFlow sin VPN) → activar VPN.
- **429**: quota agotada (Gemini imagen `limit: 0`) → no reparable sin plan de pago; usar HF.
- **402**: balance insuficiente (SiliconFlow) → recargar o usar otro proveedor.
- **503**: sobrecarga del provider (nscale/HF) → el script `generate-art.js` ya hace retry; reintentar manualmente.

### Errores de herramientas/scripts
- **gitleaks/secretlint**: hooks pre-commit que fallan → corregir el secret o usar `--no-verify` si es falso positivo.
- **`pnpm install` lento/roto**: borrar `node_modules` y re-ejecutar; verificar disco en E:.
- **Git push falla**: el DNS del PC no resuelve github.com → el usuario hace push manualmente (ver Git conventions).
- **ZAP/semgrep/trivy**: ver "Herramientas de seguridad instaladas" para comandos exactos y rutas.
