# ARCHITECTURE — Arquitectura del Sistema (CiszuBot)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: ARCHITECTURE_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: Documenta la arquitectura real y actual del proyecto CiszuBot: estructura del monorepo, componentes (website Next.js + bot Discord.js en TypeScript + base de datos Supabase), flujos de datos, despliegue y decisiones de diseño.

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Componentes del sistema](#3-componentes-del-sistema)
4. [Flujos de datos](#4-flujos-de-datos)
5. [Modelo de datos (schema `ciszubot`)](#5-modelo-de-datos-schema-ciszubot)
6. [Despliegue y ejecución](#6-despliegue-y-ejecución)
7. [Monitorización y estado en vivo](#7-monitorización-y-estado-en-vivo)
8. [Decisiones de diseño (ADR)](#8-decisiones-de-diseño-adr)
9. [Limitaciones conocidas](#9-limitaciones-conocidas)
10. [Roadmap de arquitectura](#10-roadmap-de-arquitectura)
11. [FAQ](#11-faq)
12. [Checklist de revisión](#12-checklist-de-revisión)

## 1. Visión general

CiszuBot es un bot de Discord en español perteneciente al ecosistema **Ciszu Network**. El proyecto está compuesto por tres piezas principales que conviven en el monorepo:

- **Bot de Discord** (`projects/ciszubot/discord-bot/`): implementado en **TypeScript** con **Discord.js v14**, versión **v3.2.0**, con **72 comandos** (slash + prefijo `cz!`) repartidos en **9 categorías**.
- **Website** (`projects/ciszubot/website/`): landing page Next.js 15 con **dashboard de administración por OAuth de Discord** y **estado del bot en vivo**.
- **Base de datos** (Supabase): schema dedicado **`ciszubot`** con **13 tablas** (economía, niveles, tickets, warns, snipes, etc.) y la tabla pública **`ciszubot.bot_status`** para el heartbeat de estado.

El bot ya está **completamente implementado y funcional**. Este documento describe el estado actual (v3.2.0), no el estado "pendiente de crear" de versiones anteriores de la documentación.

## 2. Estructura del proyecto

```
projects/ciszubot/
├── website/                 # Next.js 15 — Landing + dashboard OAuth
│   ├── public/
│   │   └── docs/            # Documentación pública descargable (docx/pdf/txt/md)
│   └── src/
│       ├── app/             # App Router: rutas públicas + /dashboard/[guildId]
│       │   ├── api/         # auth/discord, dashboard/[guildId], verify-turnstile
│       │   ├── comandos/    # Lista de comandos (generada de commands.ts)
│       │   ├── dashboard/   # Dashboard por servidor
│       │   ├── descargas/   # Descarga de la documentación
│       │   ├── estado/      # Estado en vivo del bot (lee bot_status)
│       │   ├── feedback/    # Feedback
│       │   ├── privacidad/  # Política de privacidad
│       │   ├── soporte/     # Soporte
│       │   └── terminos/    # Términos de uso
│       ├── components/      # Componentes compartidos
│       ├── config/          # Configuración de la web
│       ├── data/            # commands.ts (catálogo de 72 comandos)
│       ├── lib/             # Utilidades server/client
│       ├── middleware.ts    # Cabeceras de seguridad + CSP
│       ├── instrumentation.ts / instrumentation-client.ts  # Sentry
│       ├── sentry.edge.config.ts / sentry.server.config.ts
│       └── robots.ts        # robots.txt (allow /, disallow /api/)
├── discord-bot/             # Bot Discord.js (TypeScript)
│   ├── src/
│   │   ├── commands/        # 44 archivos de comandos (9 categorías)
│   │   ├── config/          # index.ts (token, intents) y links.ts
│   │   ├── listeners/       # index.ts — XP, AFK, snipe, welcome, tickets, botones
│   │   ├── services/        # botlists, cache, config, economy, giveaways,
│   │   │                    # levels, logger, music, sentry, statsServer, supabase
│   │   ├── types/           # Tipos compartidos
│   │   ├── utils/           # commandRegistry.ts (registro de comandos)
│   │   └── index.ts         # Punto de entrada principal
│   ├── tests/               # Pruebas
│   ├── commands.json        # Slash commands JSON (canónico, 72)
│   ├── bot-config.json      # Prefijo cz!, colores, actividad
│   ├── Dockerfile           # Multi-stage node:24-alpine
│   ├── tsconfig.json
│   └── package.json         # ciszubot v3.2.0
├── docs/                    # Documentación del proyecto
│   ├── txt/                 # Texto plano (fuente de verdad de docs)
│   ├── md/                  # Markdown (generado)
│   ├── docx/                # Word (generado)
│   ├── pdf/                 # PDF (generado)
│   ├── slash-commands.json  # Comandos en formato documental
│   ├── slash-commands.md
│   ├── backups/             # Copias de seguridad
│   └── documentation/       # Documentación para IA (este directorio)
└── content/                 # Contenido (gitignored)
```

## 3. Componentes del sistema

### 3.1 Bot de Discord (`discord-bot/`)

| Aspecto | Valor |
| --- | --- |
| Nombre de paquete | `ciszubot` |
| Versión | 3.2.0 |
| Runtime | Node.js ≥ 22 (Docker: `node:24-alpine`) |
| Lenguaje | TypeScript 5.x |
| Librería | Discord.js v14 |
| Audio | `@discordjs/voice` + `play-dl` (requiere ffmpeg) |
| Base de datos | Supabase (`@supabase/supabase-js`, schema `ciszubot`) |
| Errores | `@sentry/node` |
| Bot lists | `@top-gg/sdk` + `discordbotlist` |
| Servidor stats | Express (panel de métricas interno) |
| Prefijo | `cz!` (+ mención como prefijo alternativo) |

**Intents del gateway** (`src/index.ts`):

| Intent | Uso |
| --- | --- |
| `Guilds` | Comandos de guild, estado de servidores |
| `GuildMessages` | Procesamiento de mensajes con prefijo |
| `MessageContent` | Leer contenido de mensajes (XP, AFK, snipe) |
| `GuildMembers` | Bienvenidas, autoroles, contadores |

**Categorías de comandos (72 comandos, 9 categorías):**

| Categoría | Descripción | Ejemplos |
| --- | --- | --- |
| Configuración | Configuración por servidor | `setprefix`, `setlang`, `setupwelcome`, `setuptickets`, `setupleveling`, `setuplogs` |
| Diversión | Minijuegos y entretenimiento | `8ball`, `rps`, `slot`, `text`, `snipe`, `animal` |
| Economía | Monedas, banco, tienda | `balance`, `daily`, `give`, `gamble`, `deposit`, `shop`, `buy` |
| Información | Utilidades informativas | `help`, `ping`, `profile`, `serverinfo`, `status`, `links` |
| Moderación | Herramientas de moderación | `kick`, `ban`, `unban`, `mute`, `warn`, `purge`, `close` |
| Música | Reproducción en voz | `play`, `skip`, `queue`, `stop`, `loop`, `pause`, `resume` |
| Niveles | XP y niveles | `rank`, `topxp` |
| Social | Interacción entre usuarios | `hi`, `bye`, `afk`, `alliance`, `allies`, `closeprivate` |
| Utilidad | Utilidades generales | `test`, `bump`, `promo`, `invite`, `vote`, `donate`, `giveaway`, `embed` |

### 3.2 Website (`website/`)

| Aspecto | Valor |
| --- | --- |
| Nombre de paquete | `ciszubot-website` |
| Framework | Next.js 15 (App Router) |
| React | 19.x |
| Estilos | Tailwind CSS v4 + PostCSS |
| UI compartida | `@ciszu/ui` |
| Assets | `@ciszunetwork/cdn` |
| Utilidades | `@ciszunetwork/utils` |
| Errores | `@sentry/nextjs` |
| Despliegue | Vercel (proyecto `ciszubot-website`) |

Rutas principales:

| Ruta | Propósito |
| --- | --- |
| `/` | Landing con información del bot |
| `/comandos` | Catálogo de los 72 comandos por categoría |
| `/estado` | Estado en vivo del bot (lee `bot_status`) |
| `/dashboard` | Login OAuth Discord → selección de servidores |
| `/dashboard/[guildId]` | Configuración del bot en un servidor |
| `/descargas` | Descarga de documentación |
| `/feedback`, `/soporte`, `/privacidad`, `/terminos` | Páginas legales y de soporte |
| `/api/auth/discord/callback` | Callback de OAuth |
| `/api/dashboard/[guildId]` | API del dashboard |
| `/api/verify-turnstile` | Verificación Cloudflare Turnstile |

### 3.3 Base de datos (Supabase)

Proyecto Supabase `obwzzmbvkrcscqwptlqo`, schema dedicado **`ciszubot`** (13 tablas tras la migración 14). Se detalla en la [sección 5](#5-modelo-de-datos-schema-ciszubot).

## 4. Flujos de datos

### 4.1 Flujo de un comando con prefijo

```
Usuario → mensaje "cz!balance"
  → Client.on('messageCreate') (src/index.ts:225)
  → detección de prefijo (cz! o mención)
  → CommandRegistry.get(nombre) (utils/commandRegistry.ts)
  → command.execute(message, args)
  → services/economy.ts → getSupabase() → SUPABASE service_role → tabla wallets
  → respuesta embed al canal
  → logCommand() → tabla command_logs
  → incrementCommands() → statsServer
```

### 4.2 Flujo de un comando slash

```
Usuario → /balance
  → Events.InteractionCreate (src/index.ts:91)
  → se construye SimulatedMessage (para reutilizar la lógica prefix)
  → interaction.deferReply() (evita timeout de 3s)
  → command.execute(simulatedMessage, args)
  → respuesta vía interaction.followUp/editReply
```

Los comandos slash se **refrescan automáticamente** en el evento `ClientReady` mediante `REST.put` (v10). Si `GUILD_ID` está definido en el entorno, se registran solo en ese guild (desarrollo); si no, globalmente (producción).

### 4.3 Heartbeat de estado (bot → web)

```
Bot (setInterval 60s)
  → updateBotStatus() (services/supabase.ts:37)
  → upsert en ciszubot.bot_status (single-row id=1)
  → la web /estado y el dashboard leen la fila con SELECT público
```

El bot también publica `updateStats()` cada 30 s al statsServer interno (Express).

### 4.4 Panel de estadísticas (Express interno)

El bot levanta un servidor Express en el puerto 5000 (`statsServer.ts`) que expone métricas en vivo del proceso (comandos totales, servidores, uptime). Esto permite monitorizar el contenedor Docker sin abrir la API de Discord.

## 5. Modelo de datos (schema `ciszubot`)

Migración 14 aplicada → **13 tablas**. La tabla pública del sistema es `ciszubot.bot_status` (migración 13):

| Tabla | Propósito |
| --- | --- |
| `guild_configs` | Configuración por servidor (prefijo, idioma, welcome/goodbye, autoroles, contadores, tickets, leveling, logs) |
| `wallets` | Saldo de monedas por usuario y servidor |
| `transactions` | Historial de transacciones económicas |
| `shop_items` | Ítems de la tienda del servidor |
| `inventory` | Ítems comprados por usuario |
| `levels` | XP y nivel por usuario y servidor |
| `warns` | Avisos de moderación |
| `tickets` | Tickets abiertos/cerrados |
| `giveaways` | Sorteos activos |
| `afk` | Estados AFK |
| `alliances` | Alianzas entre servidores |
| `discord_users` | Datos consolidados de usuarios de Discord |
| `snipes` | Últimos mensajes borrados por canal |
| `bot_status` | Heartbeat: online, guilds, commands_total, version, last_seen |

### 5.1 Tabla `bot_status` (clave del sistema de estado)

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | SMALLINT PK | Single-row, `CHECK (id = 1)` |
| `online` | BOOLEAN | Estado del bot |
| `last_seen` | TIMESTAMPTZ | Último heartbeat |
| `started_at` | TIMESTAMPTZ | Inicio del proceso |
| `version` | TEXT | Versión del bot |
| `guilds` | INT | Número de servidores |
| `commands_total` | BIGINT | Total de comandos ejecutados |
| `prefix` | TEXT | Prefijo activo (`cz!`) |
| `updated_at` | TIMESTAMPTZ | Última actualización |

**Seguridad** (ver `DISCORD_SECURITY_PROTOCOLS.md`): RLS habilitado, policy `SELECT USING (true)` para lectura pública, `GRANT ALL` solo a `service_role` (el bot escribe con `SUPABASE_SERVICE_ROLE_KEY`). Es una tabla de estado no sensible, single-row, sin `auth.*()` (evita initplan advisor).

## 6. Despliegue y ejecución

### 6.1 Bot — Docker (producción)

El `Dockerfile` es multi-stage:

- **Stage 1 (builder)**: `node:24-alpine`, compila TypeScript con pnpm (`--filter ciszubot`).
- **Stage 2 (runtime)**: `node:24-alpine` + `ffmpeg` (necesario para música vía play-dl), solo dependencias de producción, corre como **usuario `node`** (no root), `EXPOSE 5000`.

```
docker build -f projects/ciszubot/discord-bot/Dockerfile -t ciszubot .
docker run -d --name ciszubot --env-file .env -p 5000:5000 ciszubot
```

- **Bot local (desarrollo)**: `pnpm --filter ciszubot dev` (compila con `tsc -w` + `nodemon`).
- **Bot en producción sin Docker**: `pnpm --filter ciszubot build && pnpm --filter ciszubot start` (Node ≥ 22 + ffmpeg en el PATH).

### 6.2 Website — Vercel

Despliegue automático desde `main` vía GitHub Actions. Env vars necesarias: `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`. El callback de OAuth debe estar registrado en el Developer Portal: `https://ciszubot.vercel.app/api/auth/discord/callback`.

### 6.3 Hosting 24/7 del bot

Pendiente de definir. Recomendación: **Oracle Cloud Free Tier** (VPS siempre encendido), ver `VPS_PLAN.md` (ciszu). El bot está preparado para correr en contenedor Docker con shutdown limpio (SIGINT/SIGTERM → heartbeat `online: false`).

## 7. Monitorización y estado en vivo

| Capa | Mecanismo |
| --- | --- |
| Estado público | `ciszubot.bot_status` → `/estado` en la web |
| Heartbeat | Cada 60 s (upsert) |
| Stats internas | Express en puerto 5000 |
| Errores | Sentry (`captureError` con contexto: command, user, context) |
| Logs | `services/logger.ts` + ficheros en `logs/` |
| Bot lists | top.gg (auto, 30 min) + DiscordBotList (30 min) |
| Gestión de migraciones | Migraciones SQL versionadas en `services/supabase/migrations/` |
| Verificación de estado | dbvr (fuentes externas) según `SECURITY_PROTOCOLS.md` (ciszu) |

## 8. Decisiones de diseño (ADR)

| # | Decisión | Motivo |
| --- | --- | --- |
| ADR-1 | Bot en TypeScript + Discord.js v14 | Tipado fuerte, ecosistema maduro, slash + prefix en una base de código |
| ADR-2 | Schema dedicado `ciszubot` en Supabase | Aislamiento de datos por proyecto en un único backend |
| ADR-3 | `SimulatedMessage` para slash | Reutilizar toda la lógica de comandos prefix en slash sin duplicar código |
| ADR-4 | Heartbeat `bot_status` single-row | Estado ligero, público y barato de consultar por la web |
| ADR-5 | Docker multi-stage con usuario `node` | Imagen mínima y segura en producción |
| ADR-6 | `commands.json` canónico + generador | Slash commands y docs se regeneran desde una única fuente |
| ADR-7 | Express interno en puerto 5000 | Monitorización del contenedor sin exponer la API de Discord |
| ADR-8 | Registro de comandos slash en `ClientReady` | Aplicación inmediata sin pasos manuales por entorno |

## 9. Limitaciones conocidas

- **Caché de `guild_configs` en memoria** (`configService.ts`): los cambios realizados desde el dashboard web **no invalidan la caché del bot** hasta reiniciarlo. Pendiente de invalidación por evento (webhook o suscripción).
- **Música requiere ffmpeg**: el contenedor lo incluye; en desarrollo local hay que instalarlo manualmente.
- **Bot lists pendientes**: el código (`botlists.ts`) y el webhook `POST /api/votes` (recompensa 500 monedas) están listos, pero subir a top.gg/DiscordBotList requiere los tokens del usuario (`TOP_GG_TOKEN`, `DISCORDBOTLIST_TOKEN`).
- **Hosting 24/7 pendiente**: el bot no tiene VPS asignado aún.

## 10. Roadmap de arquitectura

1. Invalidación de caché `guild_configs` desde el dashboard.
2. Configurar tokens de bot lists y activar el webhook de votos.
3. Desplegar el bot en VPS (Oracle Free Tier) con Docker Compose + restart policy.
4. Ampliar el dashboard web a más sistemas (economía, niveles, tickets) vía API.
5. Migrar el statsServer a métricas más ricas (Prometheus) si el proyecto escala.

## 11. FAQ

**¿El bot está implementado?** Sí. v3.2.0 en TypeScript con Discord.js v14, 72 comandos en 9 categorías, con persistencia en Supabase.

**¿Qué diferencia hay entre prefijo y slash?** El prefijo `cz!` se procesa por `messageCreate`; los slash (`/comando`) por `InteractionCreate`. Ambos reutilizan la misma lógica vía `SimulatedMessage`.

**¿Dónde se guardan las monedas?** En las tablas `ciszubot.wallets` y `ciszubot.transactions`.

**¿Cómo sabe la web si el bot está online?** El bot hace un heartbeat cada 60 s a `ciszubot.bot_status`; la web lo consulta en `/estado`.

**¿Puede correr en un VPS pequeño?** Sí. La imagen de producción es mínima (multi-stage) y el consumo del bot es bajo; ffmpeg añade algo de RAM cuando se usa música.

## 12. Checklist de revisión

- [ ] La estructura del monorepo coincide con `projects/ciszubot/`.
- [ ] Las 13 tablas del schema `ciszubot` están reflejadas.
- [ ] `bot_status` documentada con su RLS/policies.
- [ ] Flujos prefix, slash, heartbeat y stats descritos con las rutas de código.
- [ ] Limitaciones y roadmap actualizados con la realidad del proyecto.
- [ ] Referencias cruzadas a `STACK_SYSTEM.md`, `WORKFLOW_SYSTEM.md`, `DISCORD_SECURITY_PROTOCOLS.md`, `SECURITY_PROTOCOLS.md` (ciszu) y `VPS_PLAN.md` (ciszu).
- [ ] Sin datos falsos ni estado "pendiente de crear" que contradiga `PROJECT_STATE.md`.


