# STACK_SYSTEM — Pila Tecnológica (CiszuBot)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: STACK_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: Documenta la pila tecnológica completa y actual del proyecto CiszuBot por capas (website, bot, base de datos, despliegue y herramientas), con versiones exactas tomadas de los manifiestos del repositorio.

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Resumen de la pila](#2-resumen-de-la-pila)
3. [Capa de presentación — Website](#3-capa-de-presentación--website)
4. [Capa de lógica — Bot de Discord](#4-capa-de-lógica--bot-de-discord)
5. [Capa de datos — Supabase](#5-capa-de-datos--supabase)
6. [Capa de despliegue](#6-capa-de-despliegue)
7. [Herramientas de desarrollo](#7-herramientas-de-desarrollo)
8. [Dependencias del bot (detalle)](#8-dependencias-del-bot-detalle)
9. [Versiones y compatibilidad](#9-versiones-y-compatibilidad)
10. [Entornos y variables de entorno](#10-entornos-y-variables-de-entorno)
11. [Actualización de la pila](#11-actualización-de-la-pila)
12. [FAQ](#12-faq)
13. [Checklist de revisión](#13-checklist-de-revisión)

## 1. Visión general

La pila de CiszuBot se divide en tres dominios claros:

1. **Website** (`ciszubot-website`): Next.js 15 + TypeScript + Tailwind 4, desplegado en Vercel.
2. **Bot** (`ciszubot`): TypeScript + **Discord.js v14** en Node 24 (Docker `node:24-alpine`).
3. **Datos** (Supabase): schema **`ciszubot`** con 13 tablas + Storage/CDN para assets.

Toda la pila vive en el monorepo de Ciszu Network y comparte paquetes (`@ciszu/ui`, `@ciszunetwork/utils`, `@ciszunetwork/cdn`). El package manager es **pnpm 10.8.1** y Node >= 20 (el bot exige >= 22).

## 2. Resumen de la pila

| Capa | Tecnología | Versión | Dónde |
| --- | --- | --- | --- |
| Framework web | Next.js (App Router) | 15.5.x | `website/` |
| UI web | React | 19.2.x | `website/` |
| Estilos | Tailwind CSS + PostCSS | 4.2.x | `website/` |
| Bot | Discord.js | 14.22.x | `discord-bot/` |
| Bot (lenguaje) | TypeScript | 5.9.x | `discord-bot/` |
| Bot (audio) | @discordjs/voice + play-dl | 0.19.2 / 1.9.7 | `discord-bot/` |
| Backend de datos | Supabase (Postgres) | — | nube |
| Observabilidad | Sentry | 10.69.x | ambos |
| Bot lists | @top-gg/sdk + discordbotlist | 3.1.6 / 1.1.1 | `discord-bot/` |
| Server stats | Express | 4.21.x | `discord-bot/` |
| Despliegue web | Vercel | — | CI GitHub Actions |
| Contenedor bot | Docker | node:24-alpine | `discord-bot/Dockerfile` |

## 3. Capa de presentación — Website

### 3.1 Framework

- **Next.js 15** con **App Router** (`app/`), React 19, renderizado híbrido (SSR/CSR por ruta).
- **Tailwind CSS v4** + **PostCSS** con `@tailwindcss/postcss`; configuración en `tailwind.config.mjs` y `postcss.config.mjs`.
- **TypeScript 6.x** en el website (`tsconfig.json`).
- **ESLint** para linting.

### 3.2 Paquetes compartidos

| Paquete | Uso |
| --- | --- |
| `@ciszu/ui` | Componentes de UI compartidos del ecosistema |
| `@ciszunetwork/cdn` | Resolución de assets vía CDN |
| `@ciszunetwork/utils` | Utilidades comunes (rate limiters, etc.) |
| `server-only` | Evita importar código de servidor en cliente |

### 3.3 Observabilidad web

- `@sentry/nextjs` 10.x con `instrumentation.ts`, `instrumentation-client.ts`, `sentry.edge.config.ts`, `sentry.server.config.ts` y `middleware.ts`.

### 3.4 Middleware y seguridad web

- `middleware.ts`: cabeceras de seguridad + CSP (ver `SECURITY_PROTOCOLS.md`, ciszu).
- `robots.ts`: `allow: /`, `disallow: /api/`.
- Turnstile (Cloudflare) para validación de formularios (`/api/verify-turnstile`).

## 4. Capa de lógica — Bot de Discord

### 4.1 Lenguaje y runtime

- **TypeScript 5.9.x**, compilado con `tsc` (`dist/`).
- **Node.js ≥ 22** (manifiesto `engines`), en producción **Node 24** en Alpine.
- **pnpm** como package manager y gestor de workspaces.

### 4.2 Librerías principales

| Librería | Versión | Propósito |
| --- | --- | --- |
| `discord.js` | ^14.22.0 | Cliente y APIs de Discord |
| `@discordjs/voice` | ^0.19.2 | Reproducción de audio en canales de voz |
| `play-dl` | ^1.9.7 | Descarga de audio (YouTube, etc.) |
| `@supabase/supabase-js` | ^2.60.0 | Acceso a Supabase (schema `ciszubot`) |
| `@sentry/node` | ^10.69.0 | Captura de errores |
| `express` | ^4.21.2 | Servidor interno de stats (puerto 5000) |
| `dotenv` | ^16.6.1 | Variables de entorno |
| `@top-gg/sdk` | ^3.1.6 | Estadísticas y votos en top.gg |
| `discordbotlist` | ^1.1.1 | Estadísticas en DiscordBotList |

### 4.3 DevDependencies del bot

| Paquete | Versión | Propósito |
| --- | --- | --- |
| `typescript` | ^5.9.0 | Compilador |
| `nodemon` | ^3.0.1 | Recarga en desarrollo (`tsc -w & nodemon`) |
| `@types/node` | ^26.0.0 | Tipos de Node |
| `@types/express` | ^5.0.6 | Tipos de Express |

### 4.4 Estructura interna del bot

| Módulo | Responsabilidad |
| --- | --- |
| `src/index.ts` | Bootstrap, intents, handlers de eventos, shutdown |
| `src/utils/commandRegistry.ts` | Registro de comandos (arrays y fábricas) |
| `src/services/economy.ts` | Economía (wallets, transacciones) |
| `src/services/levels.ts` | XP y niveles |
| `src/services/music.ts` | Cola y reproducción de audio |
| `src/services/giveaways.ts` | Sorteos |
| `src/services/configService.ts` | Config por servidor (caché en memoria) |
| `src/services/botlists.ts` | Posting de stats a bot lists |
| `src/services/statsServer.ts` | Express interno de métricas |
| `src/services/supabase.ts` | Cliente Supabase (service_role) |
| `src/services/sentry.ts` | Inicialización de Sentry |
| `src/services/logger.ts` | Logging |
| `src/listeners/index.ts` | Eventos: XP, AFK, snipe, welcome, botones (tickets, privados) |

## 5. Capa de datos — Supabase

- **Proyecto**: `obwzzmbvkrcscqwptlqo`.
- **Schema dedicado**: `ciszubot` (13 tablas tras la migración 14).
- **Cliente**: `@supabase/supabase-js` con `db.schema = 'ciszubot'`.
- **Autenticación**: el bot usa `SUPABASE_SERVICE_ROLE_KEY` (bypass de RLS); la web usa la misma clave en server-side para el dashboard. El frontend público lee solo tablas con policy `SELECT` (p. ej. `bot_status`).
- **Migraciones**: versionadas en `services/supabase/migrations/` (p. ej. `20260801000013_bot_status_heartbeat.sql`).
- **Verificación**: con `dbvr` (fuentes externas) tras cada migración, según `SECURITY_PROTOCOLS.md` (ciszu).

Tablas (13): `guild_configs`, `wallets`, `transactions`, `shop_items`, `inventory`, `levels`, `warns`, `tickets`, `giveaways`, `afk`, `alliances`, `discord_users`, `snipes` + `bot_status` (heartbeat).

## 6. Capa de despliegue

### 6.1 Website — Vercel

- Proyecto Vercel `ciszubot-website`, despliegue automático desde `main` vía GitHub Actions.
- **12 rutas** construidas; build OK (2 ago 2026).

### 6.2 Bot — Docker

- `Dockerfile` multi-stage basado en **`node:24-alpine`**.
- Runtime incluye **ffmpeg** (obligatorio para música con play-dl).
- Corre como **usuario `node`** (no root), expone **puerto 5000**.
- pnpm 11.18.0 activado vía corepack en ambas stages.
- Build: `pnpm --filter ciszubot build` (tsc). Runtime: `node dist/src/index.js`.

### 6.3 Hosting 24/7

- **Pendiente**: se recomienda VPS (Oracle Cloud Free Tier). Ver `VPS_PLAN.md` (ciszu).
- El bot ya implementa shutdown limpio (SIGINT/SIGTERM) y heartbeat de estado, listo para Docker Compose con restart policy.

## 7. Herramientas de desarrollo

| Herramienta | Uso |
| --- | --- |
| pnpm 10.8.1 | Gestión de paquetes y workspaces |
| Node ≥ 20 (local) | Runtime de desarrollo |
| TypeScript 5.9 | Compilación del bot |
| ESLint | Lint (turbo `pnpm lint`) |
| dbvr | Verificación de migraciones/RLS desde fuentes externas |
| Bruno | Colecciones de API (endpoints del dashboard/votos) |
| Git + GitHub Actions | CI/CD y despliegues Vercel |
| Vercel | Hosting de la web |
| Sentry | Errores y rendimiento |
| Docker / Docker Compose | Contenedor del bot |
| UptimeRobot + ntfy | Monitorización externa (ver `MONITORING_SYSTEM.md`, ciszu) |

## 8. Dependencias del bot (detalle)

Sección de `discord-bot/package.json`:

```json
{
  "name": "ciszubot",
  "version": "3.2.0",
  "main": "dist/src/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/index.js",
    "dev": "tsc -w & nodemon dist/src/index.js",
    "typecheck": "tsc --noEmit"
  },
  "engines": { "node": ">=22" }
}
```

Dependencias de producción: `@ciszunetwork/utils` (workspace), `@discordjs/voice`, `@sentry/node`, `@supabase/supabase-js`, `@top-gg/sdk`, `discord.js`, `discordbotlist`, `dotenv`, `express`, `play-dl`.

## 9. Versiones y compatibilidad

| Componente | Versión mínima | Producción actual | Notas |
| --- | --- | --- | --- |
| Node.js | 22 | 24 (Alpine) | `engines` del bot: >= 22 |
| Discord.js | 14 | 14.22 | API v10 |
| TypeScript | 5 | 5.9 | `tsc --noEmit` para typecheck |
| Next.js | 15 | 15.5.22 | App Router |
| React | 19 | 19.2.7 | — |
| Tailwind | 4 | 4.2.4 | PostCSS plugin |
| Supabase JS | 2 | 2.60.0 | schema `ciszubot` |
| Sentry | 10 | 10.69.0 | node + nextjs |
| pnpm | 10 | 10.8.1 | CI/container: 11.18.0 |

## 10. Entornos y variables de entorno

### 10.1 Bot (`discord-bot/.env`)

| Variable | Tipo | Uso |
| --- | --- | --- |
| `DISCORD_BOT_TOKEN` | secreto | Login del bot (nunca se expone) |
| `DISCORD_CLIENT_ID` | secreto | ID de la aplicación |
| `GUILD_ID` | opcional | Si se define, slash solo en ese guild (dev) |
| `SUPABASE_URL` | secreto | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | secreto | Clave service_role (bypass RLS) |
| `SENTRY_DSN` | secreto | DSN de Sentry |
| `TOP_GG_TOKEN` | secreto | Token top.gg (pendiente de aportar) |
| `DISCORDBOTLIST_TOKEN` | secreto | Token DiscordBotList (pendiente de aportar) |
| `PORT` | opcional | Puerto del statsServer (5000 por defecto) |
| `NODE_ENV` | opcional | `development`/`production` |

### 10.2 Website (Vercel env vars)

`DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`.

**Regla de oro**: secretos SOLO como `process.env.X` en server-only; nunca `NEXT_PUBLIC_` para secretos; nunca fallbacks hardcodeados (ver `SECURITY_PROTOCOLS.md`, ciszu).

## 11. Actualización de la pila

1. Actualizar dependencias con `pnpm update` por workspace (`pnpm --filter ciszubot update`).
2. Verificar `pnpm typecheck` en el bot y `pnpm --filter ciszubot-website build` en la web.
3. Ejecutar `pnpm lint`.
4. Si cambia `node:24-alpine` o pnpm del Dockerfile, probar build completo de la imagen.
5. Confirmar compatibilidad Discord.js ↔ API de Discord (breaking changes en majors).
6. Actualizar este documento con las versiones reales (leer los `package.json`).
7. Commitear con el mensaje descriptivo correspondiente y verificar en producción.

## 12. FAQ

**¿Por qué el bot exige Node ≥ 22 si el resto del repo usa ≥ 20?** Por las APIs de Node usadas por Discord.js v14 y `play-dl`; además Docker usa Node 24 en producción.

**¿El bot usa JavaScript vanilla?** No. Está en **TypeScript** (v3.2.0). Los docs antiguos que decían "vanilla JS" están obsoletos.

**¿Qué es `@ciszunetwork/cdn`?** El paquete que resuelve assets del CDN de Supabase Storage (usado por la web).

**¿Qué pasa si no hay ffmpeg?** Los comandos de música (`play`, etc.) fallarán. En Docker ya viene incluido.

**¿Dónde se verifica la RLS de las tablas?** Con `dbvr` tras cada migración y con los Advisors de Supabase Dashboard; procedimiento en `SECURITY_PROTOCOLS.md` (ciszu).

## 13. Checklist de revisión

- [ ] Versiones exactas tomadas de los `package.json` reales.
- [ ] Bot documentado como TypeScript + Discord.js v14 + Node 24 (Docker).
- [ ] Schema `ciszubot` y sus 13 tablas mencionadas.
- [ ] Variables de entorno del bot y de la web listadas (sin valores reales).
- [ ] Herramientas (dbvr, Bruno, pnpm) referenciadas correctamente.
- [ ] Referencias a `VPS_PLAN.md`, `SECURITY_PROTOCOLS.md` y `MONITORING_SYSTEM.md` (ciszu).
- [ ] Sin secretos ni valores inventados.
