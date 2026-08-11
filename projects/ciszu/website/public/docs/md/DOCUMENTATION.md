CISZU NETWORK - DOCUMENTACIÓN OFICIAL
Nombre: DOCUMENTATION
Versión: 2.0.0
Actualización: 2026-07-28
Identificador: DOCUMENTATION_V2.0.0_2026_07_28_ciszunetwork

---


CENTRO DE DOCUMENTACIÓN / DOCUMENTATION CENTER

[ESPAÑOL]

Ciszu Network mantiene un sistema de documentación completo y estandarizado para todos sus proyectos. Este documento describe la estructura,formatos y propósitos de cada componente documental.

ESTRUCTURA DEL MONOREPO

El monorepo está organizado con pnpm workspaces y Turborepo:

projects/                    # Aplicaciones del network
  website/               # CiszuNetwork Page (Next.js 15)
  ciszukoantony/
    website/             # Portfolio personal (Next.js 15)
  muzicmania/
    website/             # Juego musical (Next.js 15)
    launcher/            # Aplicación de escritorio (Tauri 2)
    mobile/              # Placeholder para versión móvil
  ciszubot/
    website/             # Landing page del bot (Next.js 15)
    discord/             # Bot de Discord (Node.js + Discord.js)
packages/
  cdn/                   # Asset resolver @ciszunetwork/cdn
scripts/                 # Scripts raíz de automatización
docs/                    # Documentación global
ciszugamens/             # Comunidad gaming (standalone)
ciszukoantony/           # Marca personal (standalone)
content/                 # Assets multimedia maestros

PIPELINE DE DOCUMENTACIÓN

Cada proyecto sigue el mismo pipeline de formatos:
  TXT (fuente de verdad) → MD (markdown) → DOCX (Word) → PDF (distribución)

Scripts disponibles:
- scripts/txt2md.js: Convierte TXT → MD
- scripts/md2office.js: Convierte MD → DOCX (usa Pandoc)
- scripts/txt2pdf.py: Convierte MD → PDF (usa Reportlab)
- scripts/docx2pdf.ps1: Convierte DOCX → PDF (Word COM)

ESTRUCTURA DE DOCUMENTACIÓN POR PROYECTO

[proyecto]/
└── docs/
    ├── documentation/    # Documentación técnica para IA (Markdown)
    ├── txt/        # Documentos fuente en texto plano
    ├── md/         # Documentos en formato Markdown
    ├── docx/       # Documentos de Microsoft Word
    ├── pdf/        # Documentos en PDF
    ├── backups/    # Copias de seguridad
    └── xlsx/       # Plantillas (solo si aplica)

Además, cada website tiene en su carpeta public/:
  public/docs/       # Documentación pública descargable

DOCUMENTOS ESTÁNDAR (22 tipos)

Cada proyecto puede tener un subconjunto de estos documentos:

Información General:
  ABOUT, CATALOGO, CHANGELOG, CONTACT, CREDITS, DOCUMENTATION, TEAM

Soporte y Ayuda:
  FAQ, HELP, SUPPORT

Normas y Legal:
  GUIDELINES, LICENSE, POLICY, RULES, SECURITY, TERMS_AND_CONDITIONS

Especiales por Proyecto:
  ACTA, FORUM, INFORMATION, LEADERBOARD, LIBRARY, MOD_GUIDELINES, README, STATS

ARCHIVOS ESPECIALES (composición manual)
Los siguientes documentos tienen composición especial en formato Word/PDF
que no puede automatizarse. Solo sus versiones TXT y MD pueden modificarse
mediante scripts:
  - GUIDELINES.docx, GUIDELINES.pdf
  - RULES.docx, RULES.pdf
  - ACTA.docx, ACTA.pdf

ESTÁNDARES DE FORMATEO (DOCX/PDF)
- Tipografía: Arial 11pt o 12pt
- Encabezados con bloque de metadatos oficial
- Identificador único por documento y versión
- Formato bilingüe (ES/EN) en todos los documentos
- Numeración de páginas en PDF

IA_DOCS (Documentación para Agentes de IA)
Cada proyecto tiene documentation/ con la siguiente estructura estándar:
  AGENT_INSTRUCTIONS.md, AGENT_SECURITY_PROTOCOLS.md, ARCHITECTURE.md,
  INITIAL_PROMPT.md, MIGRATION_HANDOVER.md, PROJECT_HISTORY.md,
  PROJECT_STATE.md, PROJECTS.md, STACK.md, STATUS.md, TO_DO_LIST.md,
  WORKFLOW.md

El proyecto de referencia para documentation es MuzicMania (19 archivos).

CDN Y ASSETS
- Los assets multimedia se sirven desde Supabase Storage (bucket ciszu-assets)
- Los SVGs críticos están en shared/icons/svg/ (outline, filled, flags)
- El resolver de assets está en packages/cdn/index.ts
- Subida de assets: pnpm cdn:upload (requiere SUPABASE_SERVICE_ROLE_KEY)
- Sin fallback offline: los assets se sirven vía resolver/CDN (NEXT_PUBLIC_CDN_URL); copy-assets.js ELIMINADO (11 ago 2026)

CI/CD
- CI: .github/workflows/ci.yml — Lint only (matrix sobre proyectos)
- Deploy: 4 workflows individuales para cada website
- Plataforma: Vercel (vercel pull → vercel build → vercel deploy)
- Trigger: push a main/master con cambios en rutas específicas


---


[ENGLISH]

Ciszu Network maintains a complete and standardized documentation system for all its projects. This document describes the structure, formats, and purposes of each documentation component.

MONOREPO STRUCTURE

The monorepo is organized with pnpm workspaces and Turborepo:

projects/                    # Network applications
  website/               # CiszuNetwork Page (Next.js 15)
  ciszukoantony/
    website/             # Personal portfolio (Next.js 15)
  muzicmania/
    website/             # Rhythm game (Next.js 15)
    launcher/            # Desktop application (Tauri 2)
    mobile/              # Mobile placeholder
  ciszubot/
    website/             # Bot landing page (Next.js 15)
    discord/             # Discord bot (Node.js + Discord.js)
packages/
  cdn/                   # Asset resolver @ciszunetwork/cdn
scripts/                 # Root automation scripts
docs/                    # Global documentation
ciszugamens/             # Gaming community (standalone)
ciszukoantony/           # Personal brand (standalone)
content/                 # Master media assets

DOCUMENTATION PIPELINE

Each project follows the same format pipeline:
  TXT (source of truth) → MD (markdown) → DOCX (Word) → PDF (distribution)

Available scripts:
- scripts/txt2md.js: Converts TXT → MD
- scripts/md2office.js: Converts MD → DOCX (uses Pandoc)
- scripts/txt2pdf.py: Converts MD → PDF (uses Reportlab)
- scripts/docx2pdf.ps1: Converts DOCX → PDF (Word COM)

STANDARD DOCUMENTS (22 types)

Each project may have a subset of these documents:

General Information:
  ABOUT, CATALOGO, CHANGELOG, CONTACT, CREDITS, DOCUMENTATION, TEAM

Support and Help:
  FAQ, HELP, SUPPORT

Norms and Legal:
  GUIDELINES, LICENSE, POLICY, RULES, SECURITY, TERMS_AND_CONDITIONS

Project-Specific:
  ACTA, FORUM, INFORMATION, LEADERBOARD, LIBRARY, MOD_GUIDELINES, README, STATS

SPECIAL FILES (manual composition only)
The following documents have special composition in Word/PDF format
that cannot be automated. Only their TXT and MD versions can be modified
via scripts:
  - GUIDELINES.docx, GUIDELINES.pdf
  - RULES.docx, RULES.pdf
  - ACTA.docx, ACTA.pdf

IA_DOCS (Documentation for AI Agents)
Each project has documentation/ with the following standard structure:
  AGENT_INSTRUCTIONS.md, AGENT_SECURITY_PROTOCOLS.md, ARCHITECTURE.md,
  INITIAL_PROMPT.md, MIGRATION_HANDOVER.md, PROJECT_HISTORY.md,
  PROJECT_STATE.md, PROJECTS.md, STACK.md, STATUS.md, TO_DO_LIST.md,
  WORKFLOW.md

The reference project for documentation is MuzicMania (19 files).
