# WORKFLOW_SYSTEM — Flujo de Trabajo (CiszuBot)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: WORKFLOW_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: Documenta el flujo de trabajo diario del proyecto CiszuBot: comandos reales (pnpm por workspace), desarrollo del bot y la web, Docker, pipeline de documentación, reglas de git, protocolo de inicio/cierre de sesión y troubleshooting.

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Comandos base del monorepo](#2-comandos-base-del-monorepo)
3. [Desarrollo del bot (discord-bot)](#3-desarrollo-del-bot-discord-bot)
4. [Desarrollo de la web (website)](#4-desarrollo-de-la-web-website)
5. [Docker y despliegue del bot](#5-docker-y-despliegue-del-bot)
6. [Pipeline de documentación](#6-pipeline-de-documentación)
7. [Generación de slash commands y docs](#7-generación-de-slash-commands-y-docs)
8. [Reglas de git](#8-reglas-de-git)
9. [Flujo diario](#9-flujo-diario)
10. [Protocolo de inicio de sesión](#10-protocolo-de-inicio-de-sesión)
11. [Protocolo de cierre de sesión](#11-protocolo-de-cierre-de-sesión)
12. [Zonas y responsabilidades](#12-zonas-y-responsabilidades)
13. [Troubleshooting](#13-troubleshooting)
14. [FAQ](#14-faq)
15. [Checklist de revisión](#15-checklist-de-revisión)

## 1. Visión general

Este documento unifica la forma de trabajar con el proyecto CiszuBot. Reemplaza la versión antigua (que describía el bot como "iniciar con `node index.js` en vanilla JS") por el flujo real: bot **TypeScript** en `projects/ciszubot/discord-bot/` y web **Next.js** en `projects/ciszubot/website/`, ambos gestionados por pnpm workspaces y turbo.

Principios:
- Ejecutar scripts automáticamente si son seguros; solo informar bloqueos.
- No commitear ni pushear sin solicitud explícita del usuario.
- Actualizar los docs de estado (`PROJECT_STATE.md`, `PROJECT_STATE.md`, etc.) tras hitos.

## 2. Comandos base del monorepo

Desde la raíz (`E:\Ciszu Network`):

| Comando | Descripción |
| --- | --- |
| `pnpm install` | Instala todos los workspaces |
| `pnpm dev` | Turbo: arranca todos los apps |
| `pnpm build` | Turbo: compila todos los apps |
| `pnpm lint` | Turbo: lint de todos los apps |
| `pnpm test` | Turbo: tests de todos los apps |
| `pnpm --filter <name> dev` | Dev de un solo workspace |

El bot no está incluido en `pnpm dev` de turbo por defecto: hay que arrancarlo explícitamente con su filtro (ver sección 3).

## 3. Desarrollo del bot (discord-bot)

Filtro: `ciszubot`.

```bash
pnpm --filter ciszubot dev          # Compilación watch + nodemon (hot reload)
pnpm --filter ciszubot build        # Compilación a dist/ (tsc)
pnpm --filter ciszubot start        # Ejecuta dist/src/index.js (producción sin Docker)
pnpm --filter ciszubot typecheck    # tsc --noEmit
```

Notas:
- `dev` ejecuta `tsc -w & nodemon dist/src/index.js`; requiere `.env` con las variables de la sección 10 de `STACK_SYSTEM.md`.
- En desarrollo, definir `GUILD_ID` para registrar los slash commands solo en un servidor de prueba (más rápido que el registro global).
- La música requiere **ffmpeg** en el PATH (en local) o dentro del contenedor (Docker ya lo incluye).

## 4. Desarrollo de la web (website)

Filtro: `ciszubot-website`.

```bash
pnpm --filter ciszubot-website dev     # next dev
pnpm --filter ciszubot-website build   # next build
pnpm --filter ciszubot-website start   # next start (tras build)
```

Notas:
- El dashboard OAuth requiere registrar el callback `https://ciszubot.vercel.app/api/auth/discord/callback` en el Developer Portal.
- En local, configurar las variables en `.env.local` (ver `STACK_SYSTEM.md` §10.2).
- `NEXT_PUBLIC_SITE_URL` debe apuntar al entorno correspondiente.

## 5. Docker y despliegue del bot

```bash
# Build de la imagen (contexto: raíz del monorepo)
docker build -f projects/ciszubot/discord-bot/Dockerfile -t ciszubot .

# Ejecución con variables de entorno
docker run -d --name ciszubot --env-file projects/ciszubot/discord-bot/.env -p 5000:5000 ciszubot

# Ver logs
docker logs -f ciszubot

# Detener/eliminar
docker stop ciszubot && docker rm ciszubot
```

Puntos del Dockerfile a recordar:
- Multi-stage sobre `node:24-alpine`; ffmpeg en runtime.
- Corre como usuario `node` (no root).
- Expone el puerto 5000 (statsServer interno).
- pnpm 11.18.0 vía corepack.

### 5.1 Docker Compose (recomendado para VPS)

Aunque hoy no hay `docker-compose.yml` commiteado, el despliegue recomendado en el VPS (ver `VPS_PLAN.md`, ciszu) usa Compose con `restart: unless-stopped`, `env_file` y bind-mount de `logs/`.

## 6. Pipeline de documentación

Fuente de verdad de la documentación pública: `docs/txt/`. El pipeline convierte:

```
txt → md → docx → pdf
```

Scripts (desde la raíz del repo):

```bash
node scripts/txt2md.js projects/ciszubot/docs        # txt → md
node scripts/md2office.js projects/ciszubot/docs     # md → docx
python scripts/txt2pdf.py projects/ciszubot/docs     # txt → pdf
```

Reglas del pipeline:
- Los archivos especiales **GUIDELINES, RULES, ACTA** se componen manualmente en DOCX/PDF; NO se automatizan. Sus TXT/MD sí pueden cambiar.
- `docs/documentation/` (este directorio) es documentación **oficial para IA**, mantenida a mano y revisada en commits.
- Al cambiar documentación hay que actualizar referencias cruzadas (`docs/*.md`, scripts, paths).

## 7. Generación de slash commands y docs

Fuente canónica de los comandos:

| Artefacto | Descripción |
| --- | --- |
| `discord-bot/commands.json` | JSON canónico de los 72 slash commands |
| `docs/slash-commands.json` | Copia documental del JSON |
| `docs/slash-commands.md` | Comandos en Markdown |
| `website/src/data/commands.ts` | Catálogo tipado para la web (72 comandos, 9 categorías, íconos) |

Regeneración:

```bash
node scripts/generate-commands.js
```

**Aviso**: `commands.json` es la fuente de verdad para el registro slash. Si se añade/edita un comando, regenerar este artefacto y actualizar `website/src/data/commands.ts` para que la web muestre el catálogo correcto.

## 8. Reglas de git

- Mensajes de commit en **español**, descriptivos, de una línea.
- Flujo habitual: `git add .` → `git commit -m "mensaje"` → `git push origin main`.
- **Nunca commitear ni pushear sin solicitud explícita del usuario.**
- El push desde este PC puede fallar por DNS (github.com no resuelve); el usuario hace push manualmente cuando ocurre.
- Actualizar `PROJECT_HISTORY.md` tras hitos importantes.
- `.gitignore` ya excluye binarios grandes y `content/`; si se añade un patrón nuevo, ejecutar `git rm -r --cached <ruta>`.
- Antes de commitear: `git status`, `git diff`, `git log --oneline -10`; no incluir secretos (`.env`, claves).

## 9. Flujo diario

1. **Leer estado**: `PROJECT_STATE.md`, `PROJECT_STATE.md`, `TODO.md`, `PROJECT_HISTORY.md`.
2. **Arrancar entornos**:
   - Bot: `pnpm --filter ciszubot dev`.
   - Web: `pnpm --filter ciszubot-website dev`.
3. **Desarrollar** con la zona asignada (tabla en sección 12).
4. **Verificar**: `pnpm --filter ciszubot typecheck`, `pnpm lint`, `pnpm test`, build web.
5. **Documentar**: actualizar docs afectados y referencias cruzadas.
6. **Cerrar sesión**: aplicar protocolo de cierre (sección 11).

## 10. Protocolo de inicio de sesión

Al iniciar una sesión de trabajo (agente u operador):

1. Leer `PROJECT_STATE.md`, `PROJECT_STATE.md`, `TODO.md`, `PROJECT_HISTORY.md` y `MIGRATION_HANDOVER.md` (si existe en ciszu docs).
2. Leer este `WORKFLOW_SYSTEM.md` y `BRAND_PLAN.md`.
3. Verificar que `pnpm install` está actualizado (`node_modules` coherentes con `pnpm-lock.yaml`).
4. Comprobar espacio en disco (`Get-PSDrive C,E`) si se van a descargar artefactos grandes.
5. Confirmar estado del bot en producción vía `https://ciszubot.vercel.app/estado` o la tabla `bot_status`.

## 11. Protocolo de cierre de sesión

Al acercarse al límite de contexto (~110-120k tokens en opencode):

1. Avisar por push (`pnpm notify`) y proponer cambiar de sesión.
2. **Commitear** el trabajo actual (si el usuario lo autoriza).
3. Actualizar `PROJECT_STATE.md`, `PROJECT_STATE.md`, `PROJECT_HISTORY.md`, `TODO.md`.
4. Dejar resumen del próximo paso en `MIGRATION_HANDOVER.md`.
5. La nueva sesión empieza con "continúa" + resumen guardado.
6. **No escribir código nuevo** tras el umbral salvo trivial; priorizar guardar estado.
7. Borrar temporales de `.opencode/temp/` (los que superen 1 semana).

## 12. Zonas y responsabilidades

| Zona | Ruta | Filtro pnpm | Comandos típicos |
| --- | --- | --- | --- |
| Bot (lógica) | `discord-bot/src/` | `ciszubot` | dev, build, start, typecheck |
| Comandos | `discord-bot/src/commands/` + `commands.json` | `ciszubot` | generate-commands.js |
| Web (landing) | `website/src/app/` | `ciszubot-website` | dev, build |
| Web (dashboard) | `website/src/app/dashboard/` | `ciszubot-website` | dev, build |
| Docs IA | `docs/documentation/` | — | edición manual |
| Docs públicas | `docs/txt/ md/ docx/ pdf/` | — | txt2md, md2office, txt2pdf |
| Migraciones DB | `services/supabase/migrations/` | — | dbvr + Advisors |
| Docker | `discord-bot/Dockerfile` | — | docker build/run |

## 13. Troubleshooting

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `client.commands` undefined / comandos no cargan | Registry no cargado | Verificar `commandRegistry.load(path)` y rutas de `src/commands/` |
| Slash no aparecen en Discord | Registro falló o caché | Definir `GUILD_ID` en dev; en prod comprobar permisos de la app |
| Timeout al ejecutar slash | Falta `deferReply` | El código ya hace `deferReply` antes de ejecutar; ver logs de error |
| Música no suena | Falta ffmpeg | Instalar ffmpeg local o usar el contenedor Docker |
| Heartbeat falla | Supabase sin `SUPABASE_URL`/`SERVICE_ROLE_KEY` | Revisar `.env`; el bot solo loguea warning |
| Dashboard no carga config | Caché de `guild_configs` obsoleta | Reiniciar el bot (limitación conocida) |
| Push falla por DNS | github.com no resuelve en este PC | El usuario hace push manualmente |
| Bot no inicia | Token inválido o permisos de invitación | Verificar `DISCORD_BOT_TOKEN` y scopes del invite |
| `/estado` muestra offline | Bot apagado o heartbeat no llega | Levantar el bot; esperar ≤60 s |
| 429 rate limit en comandos | Demasiadas peticiones a Discord | Respetar backoff; revisar `rateLimiter` de `@ciszunetwork/utils` |

## 14. FAQ

**¿Cómo arranco solo el bot?** `pnpm --filter ciszubot dev` (desde la raíz del monorepo).

**¿Cómo arranco solo la web?** `pnpm --filter ciszubot-website dev`.

**¿Dónde regenero los slash commands JSON?** `node scripts/generate-commands.js` (desde la raíz).

**¿El bot se arranca con `node index.js`?** No, eso era de la versión antigua. Ahora: `pnpm --filter ciszubot start` (tras build) o el contenedor Docker.

**¿Cuándo se actualizan los docs de estado?** Tras cada hito y obligatoriamente en el protocolo de cierre de sesión.

## 15. Checklist de revisión

- [ ] Comandos reales del monorepo reflejados (filtros `ciszubot` y `ciszubot-website`).
- [ ] Flujo prefix/slash y regeneración de `commands.json` documentados.
- [ ] Docker build/run correcto según el `Dockerfile` real.
- [ ] Pipeline de docs (txt→md→docx→pdf) y reglas de GUIDELINES/RULES/ACTA presentes.
- [ ] Protocolos de inicio/cierre de sesión completos.
- [ ] Tabla de troubleshooting sin datos inventados.
- [ ] Referencias cruzadas a `ARCHITECTURE.md`, `STACK_SYSTEM.md`, `BRAND_PLAN.md` y `VPS_PLAN.md` (ciszu).


