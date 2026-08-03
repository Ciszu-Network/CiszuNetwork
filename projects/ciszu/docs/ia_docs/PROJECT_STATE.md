# Estado Completo del Proyecto Ciszu Network

**Última actualización:** 28 Julio, 2026
**Propietario:** Ciszuko Antony (Francisco Garcia) — Caracas, Venezuela
**Stack Principal:** Next.js 15 + TypeScript + Tailwind CSS v4 + Supabase + Tauri 2 + pnpm + Turborepo + Vercel
**Monorepo:** pnpm workspaces (root: E:\Ciszu Network)

## 🚀 Proyectos en Detalle

### 1. CiszuNetwork Page (projects/ciszu/website)
**Filtro pnpm:** ciszunetwork-website
**URL:** ciszunetwork.vercel.app
**Framework:** Next.js 15 (App Router)
**Estado:** ✅ Activo
**Docs:** docs/ (root) — 17 txt, 17 md, 17 docx, 17 pdf, 12 ia_docs
**public/docs/:** ✅ Creado

### 2. Ciszuko Antony Portfolio (projects/ciszukoantony/website)
**Filtro pnpm:** ciszukoantony-website
**URL:** ciszukoantony.vercel.app
**Framework:** Next.js 15 (App Router)
**Estado:** ✅ Activo
**Docs:** projects/ciszukoantony/docs/ — 16 txt, 16 md, 15 docx, 16 pdf, 11 ia_docs
**public/docs/:** ✅ Creado

### 3. MuzicMania (projects/muzicmania)
**Filtro pnpm:** muzicmania-website
**URL:** muzicmania.vercel.app
**Framework:** Next.js 15 + Tauri 2 (Rust)
**Versions:** website (web), launcher (desktop, Windows), mobile (placeholder)
**Estado:** ✅ Activo (desarrollo continuo)
**Docs:** projects/muzicmania/docs/ — 22 txt, 22 md, 16 docx, 16 pdf, 19 ia_docs (referencia)
**public/docs/:** ✅ Creado en website/, launcher/, mobile/
**Iconos:** 5,194 SVGs en 3 sets (outline, filled, flags)

### 4. CiszuBot (projects/ciszubot)
**Filtro pnpm:** ciszubot-website (website), ciszubot (bot)
**URL:** ciszubot.vercel.app
**Framework:** Next.js 15 (website) + Discord.js v14 (bot)
**Estado:** ⚠️ Website activo, bot en desarrollo en discord-bot/
**Docs:** projects/ciszubot/docs/ — 18 txt, 18 md, 17 docx, 17 pdf, 11 ia_docs
**public/docs/:** ✅ Creado en website/
**Shigamens Server:** Documentación especial incluida (2 docs)

### 5. CiszuGamens (ciszugamens/)
**Tipo:** Comunidad gaming / Discord server
**Estado:** ✅ Comunidad activa
**Docs:** ciszugamens/docs/ — 17 txt, 18 md, 16 docx, 16 pdf, 4 ia_docs
**Archivos especiales:** MOD_GUIDELINES, STAFF_GUIDELINES, ASCII_ICONS, FAST_TEXT, xlsx template

### 6. @ciszunetwork/cdn (packages/cdn)
**Tipo:** Paquete npm compartido
**Función:** Resolver de assets e iconos
**Métodos:** resolveIcon(name, style, format), assetResolver.resolve(path)
**Integración:** Supabase Storage (bucket: ciszu-assets)
**Estado:** ✅ Activo

## 📊 Documentación — Estado Global

### Pipeline de Formatos
```
txt (source of truth) → md (markdown) → docx (Word) → pdf (distribution)
```

### Scripts de Conversión
| Script | Tecnología | Función | Estado |
|---|---|---|---|
| scripts/txt2md.js | Node.js | TXT → MD (convierte formato plano a markdown con headers) | ✅ |
| scripts/md2office.js | Node.js + Pandoc | MD → DOCX | ✅ |
| scripts/txt2pdf.py | Python + Reportlab | MD → PDF (con Arial, estilo profesional, bilingüe) | ✅ |
| scripts/docx2pdf.ps1 | PowerShell + Word COM | DOCX → PDF | ⚠️ Word COM hangs |
| scripts/sync-public-docs.js | Node.js | Copia docs/ → public/docs/ en websites | ✅ |

### Documentos Estándar (22 tipos)
- ABOUT, ACTA, CATALOGO, CHANGELOG, CONTACT, CREDITS, DOCUMENTATION
- FAQ, FORUM, GUIDELINES, HELP, INFORMATION, LEADERBOARD, LIBRARY
- LICENSE, MOD_GUIDELINES, POLICY, README, RULES, SECURITY, STATS
- SUPPORT, TEAM, TERMS_AND_CONDITIONS

### Archivos Especiales (NO automatizar DOCX/PDF)
- GUIDELINES.docx/pdf — Composición manual
- RULES.docx/pdf — Composición manual
- ACTA.docx/pdf — Composición manual

### ia_docs — Estructura Estándar (12 archivos base)
Archivos comunes a todos los proyectos:
AGENT_INSTRUCTIONS.md, AGENT_SECURITY_PROTOCOLS.md, ARCHITECTURE.md,
INITIAL_PROMPT.md, MIGRATION_HANDOVER.md, PROJECT_HISTORY.md,
PROJECT_STATE.md, PROJECTS.md*, STACK.md, STATUS.md, TO_DO_LIST.md, WORKFLOW.md
(*PROJECTS.md solo en root)

MuzicMania tiene 19 archivos (es el proyecto de referencia).

## 🔧 Herramientas Instaladas

### Sistema
- **OS:** Windows (PowerShell 5.1)
- **Node.js:** 24.18.0
- **Python:** 3.14
- **pnpm:** 10.8.1

### Documentación
- **Pandoc:** 3.10 (en C:\Users\fplay\AppData\Local\Microsoft\WinGet\Packages\...)
- **Reportlab:** 5.0.0 (Python)
- **WeasyPrint:** 69.0 (Python, requiere GTK DLLs)

### Git
- **Repos:** GitHub (CiszukoAntony organization)
- **Push:** No funciona desde esta máquina (DNS bloquea github.com) — usuario push manual
- **Commits:** Solo cuando el usuario lo solicita explícitamente
- **Mensajes:** En español, descriptivos, sin emojis

## 🚧 Pendientes
1. **PDF engine**: WeasyPrint requiere GTK DLLs; wkhtmltopdf no se pudo instalar
2. **Bot Discord**: projects/ciszubot/discord/ no existe aún
3. **CDN upload**: Ejecutar pnpm cdn:upload con SUPABASE_SERVICE_ROLE_KEY
4. **MuzicMania mobile**: Placeholder vacío
5. **Tests**: Ningún framework configurado
6. **GUIDELINES/RULES/ACTA DOCX/PDF**: Edición manual pendiente
7. **DNS**: No se puede hacer push a GitHub desde esta máquina

## ✅ Completado (v2.0.0)
- [x] Documentación multi-formato completa en todos los proyectos
- [x] ia_docs reestructurados siguiendo modelo MuzicMania
- [x] public/docs/ creado en todos los websites
- [x] Scripts de automatización de documentación (5 scripts)
- [x] Contenido real escrito (sin placeholders de MuzicMania)
- [x] Pandoc 3.10 instalado
- [x] Reportlab (Python) instalado
- [x] Pipeline CI/CD (GitHub Actions)
- [x] Despliegue Vercel automatizado