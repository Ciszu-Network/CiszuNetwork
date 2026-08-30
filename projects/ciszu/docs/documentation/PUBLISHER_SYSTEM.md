# PUBLISHER_SYSTEM — Sistema de Publicación y Distribución (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-30
Identificador: PUBLISHER_SYSTEM_V1.0.0_2026_08_30_ciszunetwork

> **Definición**: pipeline end-to-end de publicación de contenido (web, docs, assets, social, releases) para el ecosistema Ciszu Network. Define automatizaciones, validaciones, flujos y gobernanza.

---

## 1. Arquitectura del pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  SOURCE     │───▶│  BUILD      │───▶│  VALIDATE   │───▶│  DEPLOY     │
│  (Content)  │    │  (Transform)│    │  (Quality)  │    │  (Publish)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
- txt (source)      - md → docx       - Lint (md, code)   - Web (Vercel)
- md (canónico)     - md → pdf        - Link check        - CDN (Supabase)
- Code (TS/TSX)     - Assets opt.     - Schema validate   - Social (API)
- Assets (raw)      - Bundle (web)    - SEO audit         - Discord (webhook)
- Data (JSON/CSV)   - Docker (bot)    - Accessibility     - GitHub (release)
```

---

## 2. Formatos canónicos y conversión

| Formato | Rol | Herramienta | Comando |
|---|---|---|---|
| **txt** | Source of truth (escritura humana) | — | `vim/nano` |
| **md** | Canónico (versionado, diffable) | `scripts/txt2md.js` | `pnpm docs:txt2md` |
| **docx** | Distribución Office/Stakeholders | `scripts/md2office.js` | `pnpm docs:md2office` |
| **pdf** | Archivo legal/legal/impresión | `scripts/txt2pdf.py` | `pnpm docs:txt2pdf` |
| **html** | Web (Next.js MDX) | `@next/mdx` | `pnpm build` |

### Flujo estándar (Documentación)

```bash
# 1. Editar source txt
vim docs/txt/ARCHITECTURE.txt

# 2. Generar md canónico
pnpm docs:txt2md          # txt → md (documentation/)

# 3. Generar derivados
pnpm docs:md2office       # md → docx (docs/docx/)
pnpm docs:txt2pdf         # txt → pdf (docs/pdf/)

# 4. Sincronizar a webs públicas
pnpm docs:sync            # md → website/public/docs/ (txt/md/docx/pdf)
```

---

## 3. Publicación Web (Next.js + Vercel)

### 3.1 Configuración por proyecto

| Proyecto | Root Directory | Build Command | Output | Deploy Trigger |
|---|---|---|---|---|
| `ciszunetwork-website` | `projects/ciszu/website` | `pnpm --filter ciszunetwork-website build` | `.next` | Push `main` + paths `projects/ciszu/**` |
| `ciszukoantony-website` | `projects/ciszukoantony/website` | `pnpm --filter ciszukoantony-website build` | `.next` | Push `main` + paths `projects/ciszukoantony/**` |
| `muzicmania-website` | `projects/muzicmania/website` | `pnpm --filter muzicmania-website build` | `.next` | Push `main` + paths `projects/muzicmania/**` |
| `ciszubot-website` | `projects/ciszubot/website` | `pnpm --filter ciszubot-website build` | `.next` | Push `main` + paths `projects/ciszubot/**` |
| `ciszugamens-website` | `projects/ciszugamens/website` | `pnpm --filter ciszugamens-website build` | `.next` | Push `main` + paths `projects/ciszugamens/**` |

### 3.2 Workflow GitHub Actions (`.github/workflows/deploy-<project>.yml`)

```yaml
name: Deploy <project>
on:
  push:
    branches: [main]
    paths:
      - 'projects/<project>/**'
      - 'packages/**'          # Cambios en shared packages
      - '.github/workflows/deploy-<project>.yml'
jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm exec tsc --noEmit
  build:
    needs: lint-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter <project> build
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter <project> build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_<PROJECT> }}
          vercel-args: '--prod --yes --archive=tgz'
          working-directory: ./projects/<project>/website
```

### 3.3 Pre-deploy checks (obligatorios)

| Check | Herramienta | Umbral |
|---|---|---|
| **Lint** | ESLint | 0 errors, 0 warnings |
| **Typecheck** | `tsc --noEmit` | 0 errors |
| **Build** | `next build` | Success |
| **Bundle size** | `next build` + analyze | JS < 150KB gz |
| **Lighthouse CI** | `lighthouse-ci` | Perf ≥ 90, A11y ≥ 95, SEO ≥ 90 |
| **Security headers** | `securityheaders.com` | A+ |

---

## 4. Publicación CDN (Supabase Storage)

### 4.1 Assets gestionados

| Tipo | Source | Destino CDN | Trigger |
|---|---|---|---|
| **Logos/Isotipos** | `projects/*/content/logos/` | `ciszu-cdn/projects/<project>/content/logos/` | `pnpm cdn:upload` |
| **Banners/Flyers** | `projects/*/content/banners/` | `ciszu-cdn/projects/<project>/content/banners/` | `pnpm cdn:upload` |
| **Thumbnails** | `projects/*/content/thumbnails/` | `ciszu-cdn/projects/<project>/content/thumbnails/` | `pnpm cdn:upload` |
| **Flyers/Video** | `projects/*/content/flyers/` | `ciszu-cdn/projects/<project>/content/flyers/` | `pnpm cdn:upload` |
| **Shared icons** | `shared/icons/` | `ciszu-cdn/shared/icons/` | `pnpm cdn:upload` |

### 4.2 Script `cdn:upload` (`scripts/upload-cdn.js`)

```javascript
// Uso: pnpm cdn:upload [--project=<name>] [--dry-run]
// Sube content/ recursivamente preservando estructura
// Usa Supabase SDK (service role key)
// Genera manifest JSON con hashes para cache busting
```

### 4.3 Cache busting

- Assets versionados por hash de contenido (SHA256 truncado 8 chars)
- URL final: `https://<project>.supabase.co/storage/v1/object/public/ciszu-cdn/projects/<project>/content/.../asset.<hash>.png`
- `AssetResolver` (`@ciszunetwork/cdn`) resuelve automáticamente

---

## 5. Publicación Social (Automation)

### 5.1 Herramientas y triggers

| Plataforma | Herramienta | Trigger | Contenido |
|---|---|---|---|
| **Twitter/X** | Buffer / Typefully / API nativa | Manual + Webhook release | Hilos, anuncios, clips |
| **Discord (Webhooks)** | `GLOBAL_ADVISOR_SYSTEM` + custom | Push `main` + `scripts/notify-discord.js` | Anuncios globales, releases, alertas |
| **Discord (Bot)** | `CiszuBot` (comando `/announce`) | Manual (Admin) | Anuncios servers |
| **GitHub Releases** | `gh release create` (auto via workflow) | Tag `v*` | Changelog + assets |
| **YouTube** | YouTube Studio / API | Manual (CEO) | Devlogs, trailers |
| **TikTok/Reels/Shorts** | CapCut + nativo | Manual (CEO/Mods) | Clips <60s |

### 5.2 Webhook Discord (`scripts/notify-discord.js`)

```bash
# Uso automático en workflows
pnpm notify "🚀 **Nuevo release v3.2.0**\n\nMuzicMania: nuevo modo ranked + 5 mapas\n🔗 https://muzicmania.vercel.app/changelog"
```

### 5.3 Plantillas de mensaje

| Tipo | Template |
|---|---|
| **Release** | `🚀 **{{project}} v{{version}}**\n{{changelog}}\n🔗 {{url}}\n#{{project}} #gamedev` |
| **Blog/Artículo** | `📝 **Nuevo en {{site}}**\n{{title}}\n{{excerpt}}\n🔗 {{url}}\n#{{tags}}` |
| **Evento/Torneo** | `🏆 **{{event}}**\n📅 {{date}} | 🎮 {{game}}\n🏁 {{prize}}\n🔗 Inscripciones: {{url}}\n#{{game}} #torneo` |
| **Alerta/Incidente** | `⚠️ **{{severity}}: {{title}}**\n{{details}}\n⏱ ETA fix: {{eta}}\n🔗 Status: {{status_url}}` |

---

## 6. Versionado y Changelog

### 6.1 Convención de versiones (SemVer + CalVer híbrido)

| Tipo | Formato | Ejemplo | Cuándo |
|---|---|---|---|
| **Web/Proyecto** | `MAJOR.MINOR.PATCH` | `v3.2.0` | Features, fixes, breaking |
| **Bot** | `vMAJOR.MINOR.PATCH` | `v3.2.0` | Discord.js + features |
| **Docs** | `YYYY.MM.DD` | `2026.08.30` | Cada sync público |
| **Assets CDN** | Hash (SHA256-8) | `a1b2c3d4` | Cada upload |
| **Config/Infra** | `YYYY.MM.DD` | `2026.08.30` | Cambios infra |

### 6.2 Changelog automático

- Fuente: Commits convencionales (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `perf:`, `security:`)
- Herramienta: `conventional-changelog` / `auto-changelog`
- Generado en: `CHANGELOG.md` (raíz proyecto) + GitHub Release notes

---

## 7. Validaciones de calidad (Quality Gates)

### 7.1 Documentación

| Check | Herramienta | Regla |
|---|---|---|
| **Cabecera estándar** | Script custom | Versión, Actualización, Identificador, Definición |
| **Longitud mínima** | `wc -l` | ≥ 200 líneas (sistemas/planes/protocolos) |
| **Referencias cruzadas** | Script custom | Backticks `` `FILE.md` ``, paths relativos válidos |
| **Links rotos** | `markdown-link-check` | 0 broken |
| **Frontmatter** | Schema JSON | Campos obligatorios presentes |

### 7.2 Código

| Check | Herramienta | Regla |
|---|---|---|
| **Types** | `tsc --noEmit` | 0 errors |
| **Lint** | ESLint (monorepo config) | 0 errors, 0 warnings |
| **Tests** | Vitest (unit) + Playwright (e2e) | ≥ 80% coverage lib |
| **Dependencias** | `pnpm audit --prod` | 0 high/critical |
| **Licencias** | `license-checker` | Solo MIT/Apache/BSD |

### 7.3 Assets

| Check | Herramienta | Regla |
|---|---|---|
| **Tamaño** | Script custom | Imágenes < 1MB, Video < 50MB |
| **Formato** | `file` + magic bytes | WebP/AVIF/PNG/MP4/WebM |
| **Dimensiones** | `sharp` / `ffprobe` | Según spec (`BRAND_PLAN.md`) |
| **Naming** | Regex | `kebab-case`, prefijo proyecto |

---

## 8. Rollback y recuperación

| Escenario | Acción | Tiempo objetivo |
|---|---|---|
| **Deploy web fallido** | `vercel rollback` (prev deployment) | < 2 min |
| **CDN asset corrupto** | Re-upload desde git (`pnpm cdn:upload`) | < 5 min |
| **Release bot roto** | Docker rollback + tag anterior | < 3 min |
| **Doc publicada con error** | Fix txt → regen md/docx/pdf → re-sync | < 10 min |
| **Social post erróneo** | Delete + re-post corregido | < 5 min |

---

## 9. Observabilidad de publicación

| Métrica | Fuente | Alerta |
|---|---|---|
| **Build success rate** | GitHub Actions | < 95% semana |
| **Deploy latency** | Vercel API | > 10 min |
| **CDN upload errors** | Script logs | > 0 |
| **Social post failures** | Buffer/Typefully API | > 0 |
| **Discord webhook failures** | Logs custom | > 0 |
| **Docs sync drift** | `docs:verify` script | > 0 archivos |

---

## 10. Referencias

- `MARKETING_PLAN.md` — Objetivos, calendario, KPIs
- `SOCIAL_NETWORK_PROTOCOLS.md` — Cuentas, handles, guidelines
- `AD_SYSTEM.md` — Anuncios en web + social
- `WORKFLOW_SYSTEM.md` — Comandos pnpm, git, CI/CD
- `WORKFLOW_APP_PROTOCOLS.md` — Disparadores GitHub por proyecto
- `DOCUMENTATION_SYSTEM.md` — Estándar docs, formatos, pipeline
- `CDN_SYSTEM.md` — Asset resolver, Supabase Storage

---

_Última revisión: 30 ago 2026._