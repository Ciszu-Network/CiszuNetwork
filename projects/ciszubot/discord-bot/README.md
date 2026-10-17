# CiszuBot — Bot oficial de Discord de Ciszu Network

**Versión actual**: v3.2.0 · **73 comandos** · **En línea 24/7** (Bot-Hosting, plan Free)

Bot de Discord en español (con i18n en 4 idiomas de respuesta) del ecosistema
Ciszu Network. Prefijo `cz!`, mención directa y slash commands globales. Incluye
música, economía, niveles, moderación, minijuegos y un sistema de **feature flags
+ Premium (beta)** controlable en tiempo real desde la web y la devcon.

---

## 1. Cómo funciona

```
Discord (Gateway)
   │  mensajes cz! / mención / slash
   ▼
src/index.ts  ── dispatch de comandos (prefijo + slash)
   │  gateCommand()  ← feature flags globales + override por servidor + Premium
   ▼
src/commands/<categoría>/<comando>.ts   (98 comandos en 11 categorías)
   │  embeds + botones + select menus
   ▼
Servicios:
   · supabase.ts        Postgres (Supabase) vía Drizzle ORM — datos del ecosistema
   · featureFlags.ts    flags globales (ciszubot.feature_flags) y por servidor
                        (ciszubot.guild_feature_flags) con caché de 20s
   · economy.ts         wallets/banco/transacciones (moneda configurable por servidor)
   · drops.ts           drops de dinero con botón (free: 3/día · premium: ilimitados)
   · configService.ts   config completa por servidor (welcome, niveles, automod,
                        cooldowns, starboard, invites, drops, VCs privados, moneda…)
   · statsServer.ts     NestJS + Fastify en :5000 (stats/votos para listas)
   · logger.ts          pino (consola + archivos)
   · sentry.ts          errores (SENTRY_DSN)
   · recoveryClient.ts  recuperación de música tras caídas
```

**Heartbeat**: mientras corre, el bot escribe `ciszubot.bot_status.last_seen`
cada ~30s. Eso es lo que la web usa para mostrar el estado en vivo y lo que el
vigía de CI monitorea (ver §6).

**Categorías de comandos**: Música, Diversión, Economía, Información, Utilidad,
Moderación, Configuración, Niveles, Social, Secreto (lista blanca) (+ `search`
y comandos premium).

**Sistemas nuevos (v3.4.0)** — todos configurables desde Discord (`cz!<comando>`)
y en la mayoría de casos desde el dashboard web:

| Sistema | Comandos | Notas |
| --- | --- | --- |
| Economía admin | `addmoney`, `removemoney` | balance o banco; staff |
| Moneda por servidor | `coin emoji/name/reset` | emoji y nombre configurables |
| Drops | `drops on/off/channel/amount/interval/message/exclude` | botón de reclamo; free 3/día |
| Niveles reales | `levelconfig on/off/channel/xp/message/role` | mensaje custom + roles por nivel |
| Automod | `automod on/off/links/invites/caps/spam/word` | borra el mensaje y avisa |
| Rate limits | `cooldown set/remove/list` | "espera X segundos" por comando |
| Rol staff | `staff role/off` | habilita todos los comandos de staff |
| Bienvenidas | `welcome channel/message/test` | variables {user} {guild} {members} |
| Despedidas | `goodbye channel/message/test` | idem |
| Invitaciones | `invites [@user] / points / reward / reset` | puntos y recompensas por rol |
| Starboard | `starboard channel/emoji/min` | destaca mensajes con reacciones |
| Logs | `logs #canal` | ediciones, borrados, entradas/salidas, bans |
| Contadores | `counters add/remove/list` | canales con datos reales |
| VCs privados | `privatevc setup/rename/limit/delete` | hub + panel de botones |
| Emojis Nitro | `nitro on/off` | reenvío por webhook (sin Nitro) |
| Embeds custom | `embed json/save/send/list/delete/webhook` | premium |
| Matrimonios | `marry`, `divorce`, `partner` | propuesta con botones |
| Páginas web | `web [página]` | una entrada por página (login incluido) |
| Alianzas | `alliance` | canal dedicado, puntos + leaderboard, filtros (+18/palabras/servidores con sanción), cooldown, 1 por servidor, recompensas, embeds |
| Tickets por categorías | `tickets` | panel con selector, formularios (modales), roles por categoría, rol al abrir, reclamar/cerrar con registro y logs |
| Premium admin | `premium activate/deactivate/status` | activa el plan a todo el servidor |
| Categoría secreta | `secret status/config/stats/feature/premium/whitelist` | solo lista blanca (owner + IDs) |

La devcon (sección `ESTADO DEL BOT`) incluye hosting real (Bot-Hosting), estado
web y **Premium por ID de servidor** (`node scripts/botstatus.mjs premium <id> <plan>`).

## 2. Feature flags y Premium (beta)

- **Flags globales** (`ciszubot.feature_flags`): apagan una categoría completa
  en TODOS los servidores (kill switch) con motivo visible al usuario.
  Control: devcon (sección `FEATURES DEL BOT`) o `node scripts/features.mjs`.
- **Override por servidor** (`ciszubot.guild_feature_flags`): el dashboard web
  permite apagar una función SOLO en ese servidor.
- **Override por deploy** (`FEATURES_OFF=music,search`): gana sobre la DB
  (útil si una función rompe el proceso al arrancar).
- **Premium (beta)**: `premium_beta=on` ⇒ todas las funciones premium son
  gratis; al salir de beta se bloquean por servidor (`ciszubot.premium_guilds`).
- El gate vive en `src/utils/commandGate.ts`: un comando de una función
  desactivada responde con embed "⛔ Comando no activado" y nunca se ejecuta.

## 3. Estructura del proyecto

```
discord-bot/
├── src/
│   ├── index.ts                 entrada: login + dispatch (prefijo/slash) + gate
│   ├── commands/                98 comandos por categoría
│   ├── config/features.ts       definición de flags y mapeo comando→función
│   ├── services/                supabase, featureFlags, statsServer, logger, sentry…
│   ├── utils/                   commandGate, commandRegistry, helpers
│   └── types/                   BotCommand, SimulatedMessage, declaration merging
├── bot-config.json              configuración central (prefix, colores, enlaces)
├── .env.example                 variables requeridas (ver §5)
└── Dockerfile                   imagen node:24-alpine (no usada en Bot-Hosting)
```

## 4. Despliegue 24/7 (Bot-Hosting — plan Free)

El bot corre en **Bot-Hosting.net** (deploy `CiszuBot`, runtime Node 24, 256MB
RAM / 512MB storage). Es un **bundle pre-construido** (no se instala nada en el
host): `dist/` + `node_modules` de producción **para Linux** + `public/` +
`bot-config.json`.

- **Actualizar el bot**:
  1. `cd deploy/ciszubot-standalone && npm install --ignore-scripts && npm run build`
  2. Copiar `dist/ public/ bot-config.json package.json` a `.opencode/temp/bot-bundle/`
  3. `npm install --omit=dev --ignore-scripts --os=linux --cpu=x64` ahí dentro
  4. Añadir el binding `@snazzah/davey-linux-x64-{gnu,musl}` desde el registry
     (npm no lo instala desde Windows por el check de plataforma)
  5. `tar -a -c -f ../ciszubot-bundle.zip dist public node_modules package.json bot-config.json`
  6. `node scripts/deploy-bothosting.mjs` (sube, descomprime, reinicia y espera logs)
- **Renovación**: el plan Free exige pulsar **Renovar** en el panel cada 4 días;
  si no, Bot-Hosting borra el deployment (3 días de gracia). El workflow
  `bot-renewal-reminder.yml` manda un push ntfy recordándolo.
- **Migración futura**: SillyDev (sin renovaciones) está pedido pero sin
  capacidad en sus nodos gratis; cuando libere, migrar es subir el mismo zip.
- **Control desde la devcon**: sección `ESTADO DEL BOT` → HOSTING (estado real,
  iniciar/reiniciar/detener, últimos logs vía API) y WEB (bot_status manual).

## 5. Variables de entorno

| Variable | Uso |
| --- | --- |
| `BOT_TOKEN` | Token de Discord (vault: `DISCORD_BOT_TOKEN`) |
| `DATABASE_URL` | Postgres de Supabase (pooler) — **obligatoria** |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | REST/admin (heartbeat, flags) |
| `SENTRY_DSN` | Errores (opcional) |
| `TOP_GG_TOKEN` / `DISCORDBOTLIST_TOKEN` | Votos en listas (opcional) |
| `NODE_ENV` / `PORT` | `production` / puerto del panel web interno (5000) |
| `FEATURES_OFF` | Kill switch por deploy (`music,search,…`) |

En Bot-Hosting las variables se cargan con `env.set` (secretas enmascaradas);
localmente van en `.env` (gitignored).

## 6. Monitoreo (dos cosas distintas)

- **Webs** (ciszunetwork/antony/muzicmania/ciszubot): UptimeRobot +
  `.github/workflows/uptime-watch.yml` (cada 5 min).
- **Bot** (donde corre): `.github/workflows/bot-heartbeat-watch.yml` lee
  `bot_status.last_seen` cada 15 min y avisa por ntfy si lleva >5 min sin latir
  (proceso caído, deploy borrado, host caído) y cuando se recupera.

## 7. Desarrollo local

```bash
pnpm --filter ciszubot dev        # bot en modo dev (tsx watch)
pnpm --filter ciszubot build      # tsc → dist/
node scripts/features.mjs list    # flags globales
node scripts/botstatus.mjs status # estado web (bot_status) + heartbeat real
```

La **devcon** (`devcon` en PowerShell) integra todo: encender webs, estado del
bot (hosting + web), features, cuentas CISZU ID, proyectos, roles, etc.

---
_Última revisión: 17 oct 2026._ Relacionado: `FEATURE_FLAGS_SYSTEM.md`,
`VPS_PLAN.md`, `DB_SYSTEM.md`, `MONITORING_SYSTEM.md`, `DEV_CONSOLE_SYSTEM.md`.
