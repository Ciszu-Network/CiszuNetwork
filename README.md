# Ciszu Network

[![GitHub Stars](https://img.shields.io/github/stars/Ciszu-Network/CiszuNetwork?style=for-the-badge&logo=github&color=5865F2)](https://github.com/Ciszu-Network/CiszuNetwork/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Ciszu-Network/CiszuNetwork?style=for-the-badge&logo=github&color=8B5CF6)](https://github.com/Ciszu-Network/CiszuNetwork/network/members)
[![GitHub Watchers](https://img.shields.io/github/watchers/Ciszu-Network/CiszuNetwork?style=for-the-badge&logo=github&color=EC4899)](https://github.com/Ciszu-Network/CiszuNetwork/watchers)
[![License: MIT](https://img.shields.io/badge/License-MIT-7C3AED?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Node](https://img.shields.io/badge/Node-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 🌐 Ecosistema Ciszu Network

**Ciszu Network** es el ecosistema digital de **CiszukoAntony** — desarrollador, músico y creador de contenido desde Venezuela. Un monorepo moderno que agrupa 4 productos web, un bot de Discord, la comunidad CiszuGamens, paquetes compartidos y un CDN propio sobre Supabase Storage.

| Producto | Descripción | Tecnologías | Estado |
|---|---|---|---|
| **Ciszu Network** | Web principal — portafolio, blog, documentación técnica | Next.js 15, Tailwind 4, Supabase | 🟢 Producción |
| **Ciszuko Antony** | Portfolio personal — proyectos, música, galería | Next.js 15, Tailwind 4, Supabase | 🟢 Producción |
| **MuzicMania** | Juego musical web + app Tauri (desktop) | Next.js 15, Tauri v2, Supabase, WebAudio | 🟢 Producción |
| **CiszuBot** | Bot de Discord + dashboard web (landing, stats, tickets) | Discord.js, Next.js 15, Express, Docker | 🟢 Producción |
| **CiszuGamens** | Comunidad gaming — servidor Discord | Discord | 🟢 Activa |

> **Todos los productos están desplegados en Vercel** y son accesibles públicamente.

---

## 🏗️ Arquitectura del Monorepo

```
ciszunetwork-monorepo/
├── projects/                    # Productos independientes (webs + comunidad)
│   ├── ciszu/                   # Web principal (ciszunetwork.vercel.app)
│   │   └── website/             # Next.js 15 (ciszunetwork-website)
│   ├── ciszukoantony/           # Portfolio (ciszukoantony.vercel.app)
│   │   └── website/             # Next.js 15 (ciszukoantony-website)
│   ├── muzicmania/              # Juego musical (muzicmania.vercel.app)
│   │   ├── website/             # Next.js 15 (muzicmania-website)
│   │   ├── launcher/            # Tauri v2 (app desktop Windows)
│   │   └── mobile/              # App móvil (futuro)
│   └── ciszubot/                # Bot + Dashboard (ciszubot.vercel.app)
│       ├── website/             # Next.js 15 (ciszubot-website)
│       └── discord-bot/         # Discord.js v14 + Express
│   └── ciszugamens/             # Comunidad gaming (Discord)
├── packages/                    # Paquetes compartidos (pnpm workspace)
│   ├── cdn/                     # @ciszunetwork/cdn — Asset resolver + CDN client
│   └── ui/                      # @ciszu/ui — Componentes compartidos, iconos, CloudflareGuard
├── shared/                      # Recursos globales
│   ├── icons/svg/               # 5.194 SVGs (outline, filled, flags, logos)
│   ├── fonts/                   # Fuentes tipográficas (Geomanist, etc.)
│   ├── images/                  # Imágenes compartidas
│   └── widgets/                 # Widgets HTML (Ko-fi, Top.gg)
├── .github/workflows/           # CI/CD (GitHub Actions)
├── apis/bruno/                  # Colecciones API (Bruno OpenCollection YAML)
└── services/supabase/           # Migraciones SQL, schema, seeds
```

---

## ⚙️ Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Runtime** | Node.js | 20+ |
| **Package Manager** | pnpm | 10+ |
| **Framework Web** | Next.js | 15 (App Router) |
| **Styling** | Tailwind CSS | 4 |
| **Language** | TypeScript | 5 |
| **Database/Storage/Auth** | Supabase | Postgres + Storage + Auth |
| **Bot Discord** | Discord.js | 14 |
| **Desktop App** | Tauri | 2 |
| **CI/CD** | GitHub Actions | Ubuntu Latest |
| **Deploy** | Vercel | Produccion + Preview |
| **CDN** | Supabase Storage | Bucket `ciszu-cdn` |
| **Captcha** | Cloudflare Turnstile | Widget global |
| **Analytics** | PostHog + Cloudflare Web Analytics | US Cloud |
| **Error Tracking** | Sentry | 5 proyectos |
| **Testing** | Vitest + Playwright | Unit + E2E |
| **Lint/Format** | ESLint + Prettier | Flat config |

---

## 🔑 Características Principales

### CDN Propio (`@ciszunetwork/cdn`)
- **Bucket público**: `ciszu-cdn` en Supabase Storage
- **Resolver híbrido**: CDN → local → fallback según entorno
- **Estrategia inline-first** para iconos (5.194 SVGs registrados)
- **Sin mirrors locales**: assets servidos vía resolver/CDN

### Seguridad
- **RLS** en todas las tablas Supabase (políticas por comando)
- **Captcha invisible** Cloudflare Turnstile (widget global, 4 hostnames)
- **Rate limiting** propio (`createRateLimiter` en `@ciszunetwork/utils`)
- **Secret scanning**: gitleaks + secretlint en CI
- **SAST/DAST**: Semgrep + OWASP ZAP programados

### Discord Bot (CiszuBot)
- Slash commands + prefix (`cz!`)
- Sistema de economía, niveles, tickets, wallets crypto
- Dashboard web con OAuth2 Discord
- Auto-post a Top.gg / DiscordBotList cada 30 min

### Juego Musical (MuzicMania)
- WebAudio + Tone.js para reproducción
- Leaderboards globales (Supabase RPC)
- App desktop nativa con Tauri v2 (Windows NSIS installer)
- Contenido: covers, arrows, particles, partículas personalizadas

---

## 📦 Paquetes Compartidos

| Paquete | Descripción | Exportaciones clave |
|---|---|---|
| `@ciszunetwork/cdn` | Asset resolver, CDN client, icon resolver | `assetResolver`, `resolveIcon`, `deliveryVariants` |
| `@ciszu/ui` | Componentes React compartidos | `Icon`, `CloudflareGuard`, `Modal`, `Button`, `Input`, `escapeHtml` |

---

## 🔗 Enlaces en Producción

| Producto | URL |
|---|---|
| **Ciszu Network** | https://ciszunetwork.vercel.app |
| **Ciszuko Antony** | https://ciszukoantony.vercel.app |
| **MuzicMania** | https://muzicmania.vercel.app |
| **CiszuBot** | https://ciszubot.vercel.app |
| **CiszuGamens (Discord)** | https://discord.com/invite/W3kMtMMj6E |

---

## 🛡️ Seguridad y Transparencia

Este repositorio es **público por transparencia y credibilidad**. El código está abierto para:
- ✅ Auditoría de seguridad
- ✅ Aprendizaje y referencia
- ✅ Contribuciones (ver [CONTRIBUTING.md](CONTRIBUTING.md))
- ✅ Verificación de prácticas de desarrollo

**No incluye**: credenciales, tokens, `.env` files, claves privadas. Todas las variables sensibles están en `.gitignore` y se gestionan via GitHub Secrets / Vercel Environment Variables.

---

## 📄 Licencia

Este proyecto está bajo licencia **MIT** — ver [LICENSE](LICENSE) para detalles.

> **© 2024-2026 Ciszu Network** — Desarrollado por **CiszukoAntony** (Venezuela 🇻🇪)

---

## 🤝 Conectar

### Discord

[![Discord CiszuGamens](https://img.shields.io/badge/Discord-CiszuGamens-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/invite/W3kMtMMj6E)

- **CiszuGamens** — la comunidad gaming oficial de Ciszu Network. Torneos, eventos,
  canales de voz, staff y la mejor comunidad. Únete: **https://discord.com/invite/W3kMtMMj6E**
- **CiszuBot** — el bot del ecosistema (soporte y stats en su web).

### Redes sociales

[![GitHub](https://img.shields.io/badge/GitHub-Ciszu_Network-181717?style=for-the-badge&logo=github)](https://github.com/Ciszu-Network)
[![Twitter/X](https://img.shields.io/badge/X-@CiszukoAntony-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/CiszukoAntony)
[![YouTube](https://img.shields.io/badge/YouTube-Ciszu_Network-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@CiszuNetwork)
[![Email](https://img.shields.io/badge/Email-ciszunetwork@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ciszunetwork@gmail.com)

- **Email oficial**: **ciszunetwork@gmail.com**
- **GitHub**: [Ciszu-Network](https://github.com/Ciszu-Network)
- **X/Twitter**: [@CiszukoAntony](https://x.com/CiszukoAntony)
- **YouTube**: [Ciszu Network](https://youtube.com/@CiszuNetwork)

---

## 🙏 Créditos

- **Iconos**: Sistema propio basado en Tabler Icons, Material Icons, Remix Icon, Lucide
- **Fuentes**: Geomanist, Inter, JetBrains Mono
- **Inspiración**: Vercel, Supabase, Cloudflare, Discord.js, Tauri communities
- **Herramientas**: pnpm, Turbo, ESLint, Prettier, Vitest, Playwright, Bruno, ZAP

---

> **Nota**: Este es un proyecto personal de código abierto para mostrar transparencia en el desarrollo. No está diseñado para ser clonado y ejecutado directamente por terceros (requiere infraestructura propia: Supabase, Vercel, Cloudflare, Discord App). Si te inspira, ¡dale una ⭐ y síguenos!