# ARCHITECTURE — Arquitectura del Sistema (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: ARCHITECTURE_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Documenta la arquitectura real y actual del proyecto **CiszuGamens**: comunidad gaming con servidor Discord activo, landing page Next.js y assets servidos vía CDN (Supabase Storage).

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Componentes del sistema](#3-componentes-del-sistema)
4. [Flujos de datos](#4-flujos-de-datos)
5. [Assets y CDN](#5-assets-y-cdn)
6. [Servidor Discord](#6-servidor-discord)
7. [Despliegue y ejecución](#7-despliegue-y-ejecución)
8. [Decisiones de diseño (ADR)](#8-decisiones-de-diseño-adr)
9. [Limitaciones conocidas](#9-limitaciones-conocidas)
10. [Roadmap de arquitectura](#10-roadmap-de-arquitectura)

## 1. Visión general

**CiszuGamens** es la comunidad gaming del ecosistema **Ciszu Network**. A diferencia de CiszuBot, **no tiene bot de Discord propio**; es un servidor de comunidad gestionado por humanos con:

- **Servidor Discord** activo: https://discord.gg/W3kMtMMj6E
- **Discord Bot List**: https://discordbotlist.com/servers/ciszugamens
- **Landing page** Next.js 15 (en `website/`) — por desarrollar
- **Assets** (logos, banners, thumbnails, flyers) servidos vía **CDN Supabase Storage** (`ciszu-cdn`)

El proyecto vive en el monorepo bajo `projects/ciszugamens/` y se integra en el ecosistema mediante:
- Sistema de anuncios (`source: 'ciszugamens'` en `@ciszu/ui/Ads.tsx`)
- Colores de énfasis: **cian #22d3ee**
- Documentación técnica en `docs/documentation/`

## 2. Estructura del proyecto

```
projects/ciszugamens/
├── content/
│   ├── logos/
│   │   └── images/
│   │       ├── outline/
│   │       │   ├── isotype/color/         # 3 isotipos (color, degradado, monocroma)
│   │       │   │   ├── ciszugamens_logo_isotipo_outline_color_cpurple_zblack.png
│   │       │   │   ├── ciszugamens_logo_isotipo_outline_degradado_cpurple_zblue.png
│   │       │   │   └── ciszugamens_logo_isotipo_outline_monochrome_cwhite_zblack.png
│   │       │   └── logotype/
│   │       │       ├── color/             # 1 logotipo color
│   │       │       │   └── ciszugamens_logotipo_outline_color.png
│   │       │       └── monochrome/        # 1 logotipo monocroma
│   │       │           └── ciszugamens_logotipo_outline_monochrome_black.png
│   │       └── not-outline/
│   │           └── isotype/
│   │               ├── color/
│   │               └── monochrome/
│   ├── banners/images/                    # Video banner GIF
│   │   └── ciszugamens_video_banner.gif
│   ├── flyers/images/
│   └── thumbnails/images/
├── docs/
│   ├── documentation/                     # Docs técnicos (gitignored, force-add)
│   │   ├── README.md
│   │   ├── ARCHITECTURE.md
│   │   ├── STACK_SYSTEM.md
│   │   ├── WORKFLOW_SYSTEM.md
│   │   ├── BRAND_PLAN.md
│   │   ├── DISCORD_SECURITY_PROTOCOLS.md
│   │   ├── PROJECT_STATE.md
│   │   ├── PROJECT_HISTORY.md
│   │   ├── TODO.md
│   │   ├── PRD_PROTOCOLS.md
│   │   ├── TRD_PROTOCOLS.md
│   │   ├── WORKFLOW_APP_PROTOCOLS.md
│   │   ├── UIDBUXDB_PROTOCOLS.md
│   │   ├── BACKEND_SCHEMA_PROTOCOLS.md
│   │   └── IMPLEMENTATION_PLAN_PROTOCOLS.md
│   ├── backups/                           # JSON, XLSX de respaldo
│   ├── docx/                              # Documentos Word
│   │   └── DISCORD_MODERATION_GUIDELINES.docx
│   ├── pdf/                               # PDFs
│   │   └── DISCORD_MODERATION_GUIDELINES.pdf
│   ├── txt/                               # Texto plano
│   │   └── DISCORD_MODERATION_GUIDELINES.txt
│   ├── md/                                # Markdown
│   └── pdf/
├── website/                               # Next.js 15 landing (por desarrollar)
│   ├── public/
│   └── src/
└── README.md
```

## 3. Componentes del sistema

| Componente | Estado | Descripción |
|---|---|---|
| **Servidor Discord** | ✅ Activo | Comunidad gaming, 500+ miembros, roles verificados |
| **Discord Bot List** | ✅ Activo | https://discordbotlist.com/servers/ciszugamens |
| **Landing Next.js** | 🚧 Pendiente | `website/` - por desarrollar |
| **CDN Assets** | ✅ Activo | 5 logos + 1 banner en Supabase Storage `ciszu-cdn` |
| **Sistema de anuncios** | ✅ Integrado | `source: 'ciszugamens'` en Ads.tsx |

## 4. Flujos de datos

```
Usuario web → Landing Next.js → CDN (logos/banner) → Usuario
Usuario Discord → Servidor → Roles/Verificación → Acceso a canales
Admin → Dashboard (futuro) → CDN upload → Assets actualizados
```

## 5. Assets y CDN

- **Resolución**: vía `AssetResolver` (`packages/cdn/`) con `NEXT_PUBLIC_CDN_URL`
- **Bucket**: `ciszu-cdn` (Supabase Storage)
- **Rutas**: `projects/ciszugamens/content/...`
- **Subida**: `pnpm cdn:upload` desde la raíz del monorepo

## 6. Servidor Discord

- **Invite**: https://discord.gg/W3kMtMMj6E
- **Bot List**: https://discordbotlist.com/servers/ciszugamens
- **Roles**: Verificado, Moderador, Admin, Comunidad, Eventos
- **Canales**: General, Anuncios, Soporte, Eventos, Media, Off-topic
- **Moderación**: Directrices en `docs/docx/DISCORD_MODERATION_GUIDELINES.docx`

## 7. Despliegue y ejecución

- **Landing**: Vercel (proyecto `ciszugamens` por crear)
- **CDN**: Supabase Storage (ya configurado en monorepo)
- **CI/CD**: GitHub Actions desde raíz (workflow `deploy-ciszugamens-website.yml` por crear)

## 8. Decisiones de diseño (ADR)

| ADR | Decisión | Fecha |
|---|---|---|
| ADR-001 | Sin bot propio: solo servidor humano | 2024 |
| ADR-002 | Assets vía CDN Supabase (no public/) | 2026-08 |
| ADR-003 | Landing Next.js 15 + Tailwind v4 | 2026-08 |

## 9. Limitaciones conocidas

- No hay bot automatizado (moderación manual)
- Landing web no desplegada
- Sin dashboard de administración

## 10. Roadmap de arquitectura

1. Landing page Next.js + deploy Vercel
2. Dashboard admin para gestión de roles/anuncios
3. Integración completa en sistema de anuncios (rotación banners)
4. Posible bot auxiliar para welcome/verificación

---

_Última revisión: 29 ago 2026._