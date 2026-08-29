# ARCHITECTURE — Arquitectura de Ciszu Network

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: ARCHITECTURE_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: visión estructural del monorepo: repositorio, proyectos, paquetes
> compartidos, servicios y decisiones de diseño clave del ecosistema.

Visión estructural del monorepo: repositorio, proyectos, paquetes compartidos, servicios y decisiones de diseño clave.

## Estructura del repositorio

```
ciszu-network/                        # Monorepo pnpm + Turbo
├── projects/                         # Productos (webs y apps)
│   ├── ciszu/website/                # CiszuNetwork — web principal (Next.js 15)
│   ├── ciszukoantony/website/         # CiszukoAntony — portfolio (Next.js 15)
│   ├── muzicmania/                   # MuzicMania — juego de ritmo
│   │   ├── website/                  #   Web (Next.js 15 + Tauri)
│   │   ├── launcher/                 #   App escritorio (Tauri + Rust)
│   │   └── mobile/                   #   Móvil (placeholder)
│   └── ciszubot/                     # CiszuBot
│       ├── website/                  #   Landing + estado en vivo (Next.js 15)
│       └── discord-bot/              #   Bot (Discord.js + Express, TypeScript)
│   └── ciszugamens/                  # CiszuGamens
│       ├── website/                  #   Landing Next.js 15 (en desarrollo)
│       ├── content/                  #   Assets (logos, banners, thumbnails)
│       └── docs/                     #   Documentación multi-formato
├── packages/                         # Paquetes compartidos
│   ├── cdn/                          # @ciszunetwork/cdn — asset resolver
│   ├── ui/                           # @ciszu/ui — componentes UI compartidos
│   ├── utils/                        # @ciszunetwork/utils — caché, rate limit, IAST, CSP
│   ├── config/                       # @ciszu/config — configuraciones compartidas
│   ├── email/                        # @ciszunetwork/email — proveedor de email
│   └── payments/                     # @ciszunetwork/payments — pagos
├── services/
│   └── supabase/                     # Vault de credenciales + migraciones
├── shared/                           # Assets y contenido compartido entre webs
│   ├── icons/                        # Catálogo de iconos (outline/filled)
│   └── images/                       # Contenido compartido (p.ej. fotos de perfil)
├── scripts/                          # Automatización raíz (CDN, backups, checks)
├── tools/                            # Generadores IA, voz, legal, conversión, ciszu-ai
├── test/                             # E2E (Playwright) — gitignored
├── apis/bruno/                       # Colecciones API (Bruno)
└── docs/                             # Documentación raíz
```

## Decisiones de diseño clave

- **pnpm workspaces + Turbo** para gestión de dependencias y builds.
- **Next.js 15 (App Router) + Tailwind 4 + PostCSS** en las 4 webs; `images.unoptimized` por el límite Hobby de Vercel.
- **Supabase** como backend único (auth, Postgres con RLS, Storage CDN).
- **Vercel** para deploy de las 4 webs (GitHub Actions), **Docker** para el bot.
- **Assets vía CDN** (`packages/cdn` resolver) — el bucket `ciszu-cdn` espeja las rutas del repo; `public/` solo docs/pwa/sw.
- **Sistema de iconos inline-first** (registry generado) + CDN fallback.
- **Modelo de negocio de un solo fundador**: 4 productos, infra compartida, free tiers.

## Pipeline de formato de documentos

```
txt (source of truth) → md (markdown) → docx (Word) → pdf (distribución)
```

## Proyectos activos

| Proyecto | Ruta | Tipo |
| -------- | ---- | ---- |
| CiszuNetwork Page | `projects/ciszu/website` | Web Next.js 15 |
| Ciszuko Antony Portfolio | `projects/ciszukoantony/website` | Web Next.js 15 |
| MuzicMania | `projects/muzicmania` | Web + Tauri app |
| CiszuBot | `projects/ciszubot` | Bot + web landing |
| CiszuGamens Community | `projects/ciszugamens` | Comunidad + Landing Next.js 15 |

## Documentación relacionada

- `FULL_STACK_SYSTEM.md` — stack tecnológico completo
- `WORKFLOW_SYSTEM.md` — flujos de trabajo y comandos diarios
- `DB_SYSTEM.md` — base de datos y consultas
- `CDN_MIGRATIONS.md` — historial de migraciones del CDN
- `SECURITY_PROTOCOLS.md` — protocolos de seguridad del ecosistema
- `AGENTS.md` — reglas y convenciones del agente (raíz del repo)

## Conceptos de arquitectura (contexto informático)

| Término | Definición |
|---|---|
| **Monorepo** | Repositorio con múltiples proyectos y paquetes |
| **Workspace** | Espacio de pnpm para un paquete/app |
| **Paquete compartido** | Librería reutilizada entre apps (`packages/*`) |
| **BaaS** | Backend gestionado (Supabase) |
| **CDN** | Red de entrega de contenido (Storage Supabase) |
| **SSR/SSG** | Render en servidor / generación estática |
| **Edge/Serverless** | Ejecución cerca del usuario o efímera |
| **Resolver** | Capa que traduce nombres de assets a URLs |
| **Registry** | Registro generado de iconos (inline-first) |
| **Source of truth** | Fuente canónica de un dato o formato |

## Principios de arquitectura del ecosistema

1. **Un monorepo, varios productos** — compartir infraestructura y paquetes.
2. **Backend único (Supabase)** — no crear servidores propios sin necesidad.
3. **Assets vía CDN/resolver** — `public/` solo docs/pwa/sw.
4. **Configuraciones compartidas** — `@ciszu/config` para no duplicar.
5. **Iconos inline-first** con fallback a CDN.
6. **Modelo de un solo fundador** — infra compartida y free tiers.

## Diagrama de flujo de datos (resumen)

```
Navegador ──► Vercel (Next.js web) ──► API routes (turnstile, leaderboard)
   │                │
   │                ├──► Supabase (Postgres + RLS)
   │                ├──► KV (caché edge) / ciszu.cache
   │                └──► CDN ciszu-cdn (imágenes, skins, audio)
   │
   └──► CDN (assets optimizados vía resolver)

Bot ──► Discord API ──► Node (Discord.js) ──► Supabase (bot_status, counters)
```

## Servicios externos y propósito

| Servicio | Rol en la arquitectura |
|---|---|
| Vercel | Hosting + Functions de las 4 webs |
| Supabase | BD, auth, storage, CDN |
| Upstash KV | Caché edge (multi-tienda) |
| GitHub Actions | CI/CD + cron (DAST, uptime) |
| Cloudflare | Turnstile, Web Analytics, futura capa CDN/DNS |
| PostHog | Analytics de producto |
| Sentry | Errores runtime |
| UptimeRobot + ntfy | Monitorización con push |
| NOWPayments | Pagos/donaciones (IPN) |

## Mapa de despliegue

```
GitHub (main) ──► GitHub Actions (ci + codeql + secretlint)
    │
    ├──► Vercel ciszunetwork    ciszunetwork.vercel.app
    ├──► Vercel ciszukoantony    ciszukoantony.vercel.app
    ├──► Vercel muzicmania      muzicmania.vercel.app
    └──► Vercel ciszubot        ciszubot.vercel.app

Bot: Docker (node:24-alpine) ──► Discord ──► Supabase
```

## Modelo de capas (resumen)

| Capa | Componentes | Responsabilidad |
|---|---|---|
| **Presentación** | 4 webs Next.js 15 + PWA | Render, UI, interacción |
| **Aplicación** | Rutas API, middleware, `@ciszu/ui`, resolvers | Lógica de producto y servidor |
| **Soporte compartido** | `packages/*` (cdn, ui, utils, config, email, payments) | Funcionalidad reutilizada |
| **Backend como servicio** | Supabase (Postgres + Auth + Storage) | Datos, identidad, CDN |
| **Plataforma** | Vercel, GitHub Actions, Docker, Cloudflare | Deploy, CI/CD, entrega, protección |

## Cadena de una petición HTTP (ejemplo típico)

1. El navegador pide una página a Vercel; Next.js la renderiza según la estrategia de `CACHING_SYSTEM.md`.
2. El middleware aplica cabeceras de seguridad + CSP (`buildCsp()`) y enciende el sensor IAST (`createIast()`).
3. Los datos se leen de Supabase (RLS activo) o de la caché multi-tienda (memoria → KV → Postgres).
4. Los assets se resuelven con `@ciszunetwork/cdn`: inline-first para iconos o URL de `ciszu-cdn` para el resto.
5. Si la ruta muta o consume un servicio externo, la protege `createRateLimiter` (ver `SECURITY_PROTOCOLS.md`).
6. Los errores fluyen a Sentry y los eventos de producto a PostHog.

## Criterios para añadir un paquete o servicio

- **¿Lo usan 2+ proyectos?** → va a `packages/*` (DRY); si es de un solo producto, queda en `projects/<producto>/`.
- **¿Lo cubre Supabase?** → preferir auth/Postgres/Storage de Supabase antes que un servicio nuevo.
- **¿Expone secretos?** → solo `process.env.X` en server; credenciales en vault (`VAULT_SYSTEM.md`).
- **¿Procesa dinero o firma acuerdos?** → integrar vía paquete `payments` y documentar en `PAYMENTS_SYSTEM.md`.
- Todo servicio externo nuevo se añade a la tabla "Servicios externos" y a su `*_SYSTEM.md` antes de darlo por activo.

## FAQ de arquitectura

| Pregunta | Respuesta |
|---|---|
| ¿Por qué un solo monorepo? | Comparte paquetes, configs y CI; cada web despliega sola desde `main` |
| ¿Por qué `images.unoptimized` y CDN? | Límite Hobby de Vercel; `ciszu-cdn` espeja las rutas del repo |
| ¿Cuándo separo un package? | Cuando 2+ webs necesitan el mismo código |
| ¿SSG, SSR o client? | Contenido estático → SSG; datos por usuario → SSR/client (App Router por ruta) |
| ¿Qué pasa si el DNS de GitHub falla? | Push manual del usuario; CI/DAST siguen en GitHub Actions |

## Patrones transversales

- **Una fuente de verdad por sistema**: un solo doc `*_SYSTEM.md` describe cada dominio; los demás referencian.
- **Assets por resolver, no por path duro**: todas las webs usan `@ciszunetwork/cdn`; `public/` solo docs, pwa y sw.
- **Seguridad shift-left**: pre-commit (gitleaks/secretlint) → CI (semgrep/CodeQL/audit) → DAST semanal (ZAP) → IAST en prod.
- **Deploy desde la raíz**: cada deploy de Vercel sube el repo completo con `--archive=tgz` y se activa solo su proyecto.
- **Cierre de sesión obligatorio**: estado + historial + estadísticas se actualizan antes de terminar (ver `WORKFLOW_SYSTEM.md`).
- **Evitar servidores propios**: si Supabase o un servicio gestionado lo cubre, no montar infraestructura propia.

## Riesgos y mitigaciones a nivel de arquitectura

| Riesgo | Mitigación |
|---|---|
| Cuota Free de Supabase (Storage ≈1 GB) | Limpieza periódica + `check-cdn-mimes.js` (ver `STATISTICS_SYSTEM.md`) |
| Deploy roto por cambio en `packages/**` | Los 4 deploys hacen build; revisar `WORKFLOW_SYSTEM.md` antes de tocar packages |
| Dependencias con CVE | `pnpm audit --prod` en CI + Dependabot + `DEVSECOPS_SYSTEM.md` |
| Dependencia de un solo hosting | Monitores UptimeRobot + ntfy; Cloudflare como futura capa DNS/CDN |
| Pérdida de contexto entre sesiones | Protocolos de inicio/cierre y handover en `WORKFLOW_SYSTEM.md` |

## Checklist de alineación de arquitectura

- [ ] Nuevo componente → decidido package vs proyecto según los criterios anteriores.
- [ ] Nuevo servicio externo → añadido a "Servicios externos" y a su `*_SYSTEM.md`.
- [ ] Deploy/documentación → archivos de estado actualizados y refs cruzadas válidas.
- [ ] Seguridad → RLS, rate limit, CSP/IAST y secretos por env revisados.
- [ ] Los assets se sirven por resolver/CDN, nunca por `public/` salvo docs/pwa/sw.

_Última revisión: 13 ago 2026._

