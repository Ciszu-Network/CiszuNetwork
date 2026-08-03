# Ciszu Network Monorepo

Monorepo principal de **Ciszu Network** — el ecosistema digital de **CiszukoAntony**. Contiene 4 webs (Next.js 15 + Tailwind 4), un bot de Discord (Discord.js), un juego de música (web + app Tauri), paquetes compartidos y el CDN de assets sobre Supabase Storage.

```
.
├── projects/                 # Aplicaciones individuales (web + bot + contenido)
│   ├── ciszu/                # Web principal CiszuNetwork (ciszunetwork.vercel.app)
│   │   ├── website/          #   Next.js — ciszunetwork-page
│   │   ├── content/          #   Multimedia (banners, flayers, logos)
│   │   └── docs/             #   Documentación (incl. ia_docs/)
│   ├── ciszukantony/        # Portfolio personal (ciszukantony.vercel.app)
│   │   ├── website/          #   Next.js — ciszuko-network
│   │   ├── content/          #   Multimedia + logos (fuente maestra)
│   │   ├── musicboard/       #   (contenido musical)
│   │   └── docs/
│   ├── muzicmania/           # Juego musical (muzicmania.vercel.app)
│   │   ├── website/          #   Next.js — muzicmania-next
│   │   ├── launcher/         #   App de escritorio (Tauri + NSIS)
│   │   ├── mobile/           #   App móvil
│   │   ├── content/          #   Música, covers, arrows, particles
│   │   └── docs/
│   ├── ciszubot/             # Bot de Discord (ciszubot.vercel.app)
│   │   ├── website/          #   Next.js — ciszubot-web (landing + dashboard)
│   │   ├── discord-bot/      #   Discord.js + Express (Docker)
│   │   ├── content/
│   │   └── docs/
│   └── ciszugamens/          # Legacy (contenido antiguo — líneas de canales)
├── packages/                 # Paquetes compartidos (pnpm workspace)
│   ├── cdn/                  # @ciszunetwork/cdn — Asset resolver + CDN
│   └── ui/                   # @ciszu/ui — Componentes compartidos (Icon, etc.)
├── shared/                   # Recursos compartidos del monorepo
│   ├── icons/svg/            #   Sistema de iconos (5.194 SVGs: outline/filled/flags)
│   ├── fonts/                #   Fuentes tipográficas (Geomanist, etc.)
│   ├── images/               #   Imágenes compartidas
│   └── widgets/              #   Widgets HTML (Ko-fi, Top.gg)
├── services/                 # Infraestructura
│   ├── supabase/              #   config.toml, migrations, seeds, .env
│   └── vercel/                #   Configuración de despliegues
├── scripts/                   # Scripts de automatización (build, CDN, BD, docs)
├── apis-client/bruno/         # Colecciones API de Bruno (OpenCollection YAML)
├── archives/                  # Backups (bases de datos, envs, clientes)
└── docs/                      # ⚠️ Movido dentro de projects/ciszu/docs/
```

> **Migración ago 2026**: la estructura antigua (`apps/...`, `public/...`, `assets/`) fue restructurada a `projects/`. Cada producto vive bajo `projects/<nombre>/` con su `website/`, `content/` y `docs/` propios. La documentación general (`docs/ia_docs/`) vive en `projects/ciszu/docs/ia_docs/`.

## Quick start

```bash
pnpm install              # install all workspaces (pnpm v10.8.1, Node >=20)
pnpm dev                  # turbo: all apps
pnpm build                # turbo: all apps
pnpm lint                 # turbo: lint all apps
pnpm --filter <nombre> dev  # single app
```

### Filtros pnpm por app

| Filtro | Producto | Comando útil |
|---|---|---|
| `ciszunetwork-page` | Web principal Ciszu Network | `web:dev` / `web:build` |
| `ciszuko-network` | Portfolio CiszukoAntony | `antony:dev` / `antony:build` |
| `muzicmania-next` | Juego de música | `muzicmania:dev` / `muzicmania:build` |
| `ciszubot-web` | Landing del bot | `pnpm --filter ciszubot-web dev` |
| `ciszubot` | Bot de Discord (TS, Docker) | `bot:start` / `bot:dev` |

## CDN y assets

- **CDN**: bucket público `ciszu-cdn` en Supabase Storage (`NEXT_PUBLIC_CDN_URL = .../object/public/ciszu-cdn`). El bucket **espeja las rutas del repo** (misma ruta relativa bajo `projects/`).
- **Resolver**: `@ciszunetwork/cdn` — `assetResolver.resolve(path)` y `resolveIcon(name, style, format)` con estrategia híbrida local/CDN según entorno (dev, Tauri, producción).
- **Iconos**: sistema inline-first en `packages/ui` (`Icon.tsx`) con registry generado (`packages/ui/src/generated/icon-registry.ts`) y fallback al CDN. Regenerar: `node scripts/generate-icon-registry.js`.
- **Upload**: `pnpm cdn:upload` sube 6 fuentes: `shared/icons/svg`, `projects/ciszu/content`, `projects/ciszu/docs`, `projects/ciszukantony/content`, `projects/ciszubot/content`, `projects/muzicmania/content`. Fallback offline en el prebuild: `node scripts/copy-assets.js`.
- **Logos**: `projects/ciszukantony/content/logos/` es la fuente maestra; usa `assetResolver.resolve('projects/ciszukantony/content/logos/...')`.

## Supabase

- Proyecto único: `obwzzmbvkrcscqwptlqo` — auth, Postgres, Storage.
- Schemas: `muzicmania` (scores, profiles con auth), `ciszubot` (guild_configs, wallets, levels, tickets…), `ciszunetwork`.
- CDN en bucket público `ciszu-cdn`; bucket `avatars` para fotos de perfil.
- Credenciales reales solo en `services/supabase/.env` (gitignored). Migraciones SQL en `services/supabase/migrations/`.

## CI/CD (GitHub Actions)

Seis flujos en `.github/workflows/` — CI + **CodeQL** + 4 deploys a Vercel, cada uno con nombre descriptivo completo:

| Archivo | Proyecto Vercel | Raíz | Web |
|---|---|---|---|
| `deploy-ciszunetwork-webpage.yml` | `ciszunetworkpage` | `projects/ciszu/website` | ciszunetwork.vercel.app |
| `deploy-ciszukantony-webpage.yml` | `ciszukoantonypage` | `projects/ciszukantony/website` | ciszukantony.vercel.app |
| `deploy-muzicmania-webpage.yml` | `muzicmania` | `projects/muzicmania/website` | muzicmania.vercel.app |
| `deploy-ciszubot-webpage.yml` | `ciszubot` | `projects/ciszubot/website` | ciszubot.vercel.app |

Cada deploy se dispara con cambios en el `projects/<proyecto>/**`, `packages/**` o `scripts/copy-assets.js`. ⚠️ Desplegar SIEMPRE desde la raíz (`vercel --prod` con `working-directory: .`); nunca `vercel pull/prebuilt` dentro de `projects/*/website` (ruta duplicada → deploy vacío).
- ⚠️ Desplegar SIEMPRE desde la raíz (`vercel --prod` con `working-directory: .`); nunca `vercel pull/prebuilt` dentro de `projects/*/website` (ruta duplicada → deploy vacío).

## Seguridad y calidad

- **XSS**: nunca `innerHTML`/`dangerouslySetInnerHTML` sin escapar; usa `escapeHtml()` o `textContent`; DOMPurify el entrante.
- **SQL Injection**: siempre ORM parametrizado o RPC — nunca concatenar.
- **Secrets**: `secretlint` + `gitleaks` en pre-commit (hook); rotar credenciales si el repo se hace público.
- **DevSecOps**: SAST (Semgrep), DAST (ZAP), dependencias (pnpm audit, trivy, cargo audit), advisors de Supabase verificados tras cada cambio de policies/functions. Detalles: `projects/ciszu/docs/ia_docs/DEVSECOPS.md`.
- **Advisors Supabase**: usar SECURITY INVOKER siempre que sea posible; envolver `auth.*()` en `(SELECT …)`; separar políticas RLS por comando (no ALL).

## Documentación

- Estándares de ingeniería: `projects/ciszu/docs/ia_docs/CODE_PRINCIPLES.md`
- DevSecOps: `projects/ciszu/docs/ia_docs/DEVSECOPS.md`
- Herramientas de desarrollo: `projects/ciszu/docs/ia_docs/TOOLS.md`
- Estado de los proyectos y migraciones: `projects/ciszu/docs/ia_docs/PROJECT_STATE.md`
- Docs de cada producto en `projects/<project>/docs/`.
- AGENTS.md en la raíz: gestión de multiworkspace, gotchas y checklist de implementación.

## Scripts de automatización (`scripts/`)

```bash
node scripts/copy-assets.js           # Prebuild: logs críticos + mirrors a public/
node scripts/upload-cdn.js            # Subir assets al CDN ciszu-cdn (pnpm cdn:upload)
node scripts/generate-icon-registry.js# Regenerar registry de iconos inline
node scripts/sync-public-docs.js      # Sincronizar docs a public/docs
node scripts/backup-db.js             # Backup BD con timestamp (archives/backups)
node scripts/update-env-keys.js       # Actualizar keys Supabase en .env (con backup)
node scripts/apply-migration-XX.js    # Aplicar migración SQL
node scripts/run-bru.js               # API testing con Bruno (gitignore: environments/prod.yml)
```

## APIs y testing

- **Bruno**: colecciones OpenCollection YAML en `apis-client/bruno/` — `health/` (4 webs + bot status) y `rest/` (leaderboard, bot_status, stats local).
- Uso: `pnpm api:test` (prod, excluye `local`), `pnpm api:test:report`, `pnpm api:test:local`.

## Contribución

1. Branch desde `main`: `git checkout -b feature/…`
2. Desarrollar, verificar `pnpm lint` y build de tu app.
3. Commit con mensaje descriptivo **en español**.
4. Push (manualmente desde tu máquina; GitHub bloqued DNS de esta PC).

## Licencia

Propietario — Ciszu Network © 2024-2026. El repositorio es **privado**.