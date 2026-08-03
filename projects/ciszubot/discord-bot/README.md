# CiszuBot v3.0.0 - Bot de Discord en Español

## Descripción General

CiszuBot es un bot de Discord en español, desarrollado con Node.js 24, TypeScript y Discord.js v14 (pnpm workspace). Ofrece comandos por prefijo (`cz!`), por mención, slash commands globales (`/`), alias, respuestas enriquecidas con embeds, manejo avanzado de errores y un panel web con estadísticas en tiempo real.

## Características Principales

- Prefijo: `cz!` y mención directa al bot
- Slash commands (`/`) registrados globalmente (todos los servidores)
- Comandos con alias y estructura modular en TypeScript
- Respuestas en embeds con colores azul y morado (aleatorio en hi/bye)
- Panel web Express (:5000) con estadísticas del bot (stats server integrado en `src/services/statsServer.ts`)
- Manejo de errores con mensajes claros y visuales
- Logging avanzado en archivos y consola (`src/services/logger.ts`)
- Supabase listo para integrar (conexión con `@supabase/supabase-js`)
- Botones y menús de selección respondidos correctamente (`deferUpdate`, sin timeouts)

## Stack (migración jul/ago 2026)

- Node.js 24 (imagen `node:24-alpine` en Docker)
- TypeScript 5.9, compilación con `tsc` a `dist/`
- pnpm 11 (monorepo, `projects/ciszubot/*` en el workspace)
- Discord.js ^14.22
- Express ^5 + dotenv ^16
- Docker multi-stage (builder + runtime, usuario no-root, `--frozen-lockfile`)

## Estructura

- **src/index.ts**: Punto de entrada, login, registro de slash commands (globales, preservando Entry Point commands type 4), manejo de interacciones (chat input, select menus, botones) y mensajes con prefijo
- **src/commands/**: Comandos modulares (`8ball`, `bye`, `confess`, `directsay`, `help`, `hi`, `ping`, `pong`, `profile`, `say`, `serverinfo`, `test`)
- **src/types/command.ts**: Tipos `BotCommand`, `SimulatedMessage` y declaration merging (`Client.commands`)
- **src/config/index.ts**: Config centralizada (bot-config.json + env)
- **src/utils/commandRegistry.ts**: Carga de comandos desde `dist/commands` (soporta `exports.default`)
- **src/services/logger.ts**: Logging multinivel
- **src/services/statsServer.ts**: Panel web Express y estadísticas
- **bot-config.json**: Configuración centralizada del bot

## Flujo de Uso

1. El usuario envía `cz!comando`, menciona al bot, o usa `/comando`
2. El bot detecta el comando y busca en la colección
3. Si el comando existe, ejecuta y responde con embed
4. Si no existe, responde con embed de error
5. Todas las acciones se registran en logs
6. El panel web muestra estadísticas en tiempo real (`http://localhost:5000`)

## Dependencias

- **discord.js**: ^14.22
- **dotenv**: ^16
- **express**: ^5
- **@supabase/supabase-js**: ^2.60
- **typescript**: ^5.9, **nodemon**: ^3 (dev)

## Despliegue y Configuración

- Variables de entorno en `.env` (ver `.env.example`): `BOT_TOKEN`, `GUILD_ID` (opcional, para registro por servidor)
- Registro de slash commands: **global** por defecto; si `GUILD_ID` está definido, registra solo en ese servidor (instantáneo)
- El Entry Point command de la app (`launch`, type 4) se preserva automáticamente en el bulk update
- Logs automáticos en carpeta `logs/`
- Configuración editable en `bot-config.json`
- Panel web en `http://localhost:5000`
- Docker: `docker compose up -d --build ciszu-bot` (contexto: raíz del repo, ver `docker-compose.yml`)
- Local: `pnpm install && pnpm build && pnpm start` (o `pnpm dev`)

## Cambios importantes (v3.0.0, 1 ago 2026)

- Migración de JavaScript vanilla a TypeScript (estructura estilo muzicmania)
- Fix crítico: `Routes.applicationcommands` → `Routes.applicationCommands` (slash commands no se registraban)
- Fix: botones/selects nunca respondían (timeouts) → `deferUpdate` + handler de `StringSelectMenu`
- Fix: registry no cargaba comandos (`exports.default` del CJS)
- Fix: registro global fallaba con 50240 (Entry Point command) → se preserva en bulk update
- Dockerfile multi-stage con pnpm + Node 24, usuario no-root
- Stats server (antes `server.js`) integrado en `src/services/statsServer.ts`

## Créditos y Autoría

Desarrollado por Ciszuko
Documentación y soporte en español
