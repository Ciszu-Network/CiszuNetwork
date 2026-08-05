# Comandos personalizados para opencode (plan) — ago 2026

**ESTADO: PLAN — NADA IMPLEMENTADO AÚN.** Documento de planificación y diseño. La implementación se activará solo cuando el CEO lo pida explícitamente.

Objetivo: definir el sistema de **comandos personalizados para la terminal opencode** (la que ya usa voz STT/TTS), escalable por niveles, que permita a Ciszuko interactuar con servicios externos (ntfy, servidores, checks, Supabase, etc.) directamente desde la TUI.

## Contexto: cómo funcionan los comandos hoy

El plugin de voz (`tools/opencode-voice/index.js`) registra comandos con:

```js
api.command.register(() => [...sttCommands, ...ttsCommands]);
```

Cada comando es un objeto con:

| Campo | Descripción | Ejemplos actuales |
|---|---|---|
| `title` | Título del comando | `"STT: record/transcribe"` |
| `value` | ID interno único | `"stt.record"` |
| `description` | Texto de ayuda | `"Toggle recording; press again to stop and transcribe"` |
| `keybind` | Atajo de teclado | `"ctrl+r"`, `"<leader>s"`, `"escape"` |
| `slash` | Comando `/nombre` | `{ name: "stt-record-pc" }` |
| `onSelect()` | Acción a ejecutar | código JS arbitrario |

El comando tiene acceso a:
- `api.ui.toast({ message, variant, duration })` — notificaciones en pantalla
- `api.ui.dialog.replace(() => api.ui.DialogSelect({...}))` — selectores interactivos
- `api.kv` — estado persistente (`kv.get`/`kv.set`)
- `api.client` — sesión y mensajes
- Node.js completo: `fetch`, `child_process`, `fs` — cualquier integración externa

Los plugins se cargan desde `C:\Users\fplay\.config\opencode\tui.json` (config TUI). El plugin nuevo se añadiría ahí, junto al de voz. Los cambios requieren **relanzar con `opencode-run`**.

## Nivel 1 — Plugin de comandos en código (`tools/opencode-commands-ciszu/`)

Paquete nuevo en el repo, mismo patrón que `tools/opencode-voice/`:

```
tools/opencode-commands-ciszu/
├── index.js                 # registro de comandos + carga de módulos
├── package.json
└── lib/
    ├── notify.js            # ntfy.sh: enviar/listar/limpiar mensajes (+ audio)
    ├── servers.js           # Docker: estado/start/stop/restart/logs del bot
    ├── checks.js            # checks: webs, bot_status, disco, git, CDN
    ├── supabase.js          # consultas de estado vía API/PostgREST (solo lectura)
    └── system.js            # info del sistema (CPU, RAM, disco)
```

### Categoría A — Notificaciones (ntfy)

Reutiliza la infraestructura de `scripts/ntfy-notif.js` (`pnpm notify`, topic/token en vault). La diferencia: se invoca desde la TUI con comandos directos, sin abrir otra terminal.

| Comando | Slash | Keybind | Qué hace |
|---|---|---|---|
| Enviar mensaje al móvil | `/notify <texto>` | `<leader>n` | POST a ntfy.sh con el texto dado (o último mensaje del asistente si vacío). Diálogo para escribir si no hay argumento |
| Enviar con audio | `/notify-voice <texto>` | — | ntfy + audio Piper (igual que `pnpm notify --voice`) |
| Prioridad urgente | `/notify-urgent <texto>` | — | ntfy con `--priority urgent --tag warning` |
| Listar notificaciones | `/notify-list` | — | Consulta la API de ntfy y muestra las últimas en un diálogo |
| Limpiar | `/notify-clear` | — | Borra el feed del topic (confirmación previa) |

### Categoría B — Servidores (Docker)

Control del bot de Discord y demás servicios Docker desde la TUI. Usa `docker` vía `child_process` (con `docker compose` en el repo).

| Comando | Slash | Keybind | Qué hace |
|---|---|---|---|
| Estado servicios | `/server status` | `<leader>d` | `docker compose ps` — muestra contenedores y salud |
| Arrancar bot | `/server start bot` | — | `docker compose up -d --build ciszu-bot` |
| Parar bot | `/server stop bot` | — | `docker compose stop ciszu-bot` |
| Reiniciar bot | `/server restart bot` | — | `docker compose restart ciszu-bot` |
| Logs del bot | `/server logs <n>` | — | Últimas N líneas del log del bot (toast o dialog) |

⚠️ Riesgo: `docker` puede requerir privilegios de administrador. El server opencode corre sin elevar → el comando debe detectar el fallo y avisar con toast.

### Categoría C — Checks automáticos

Revisar cosas de un vistazo, sin escribir prompts largos.

| Comando | Slash | Keybind | Qué hace |
|---|---|---|---|
| Check completo | `/check` | `<leader>c` | Ejecuta todos los checks de abajo y muestra un resumen en diálogo |
| Webs en línea | `/check webs` | — | HTTP 200 de las 4 webs (ciszunetwork, ciszukoantony, muzicmania, ciszubot) |
| Bot en línea | `/check bot` | — | Consulta `ciszubot.bot_status` (online, last_seen, version, guilds) |
| Disco libre | `/check disk` | — | `Get-PSDrive C,E` → alerta si C: < 5 GB |
| Estado CDN | `/check cdn` | — | HEAD a un objeto del bucket (mimetype/200) |
| Git pendiente | `/check git` | — | `git status --short` → aviso si hay cambios sin commitear |

### Categoría D — Supabase (solo lectura)

| Comando | Slash | Keybind | Qué hace |
|---|---|---|---|
| Estado proyecto | `/supabase status` | — | Latencia + salud del proyecto (PING PostgREST) |
| Último heartbeat | `/supabase heartbeat` | — | `bot_status` detallado (guilds, commands_total, started_at) |
| Conteo de tablas | `/supabase tables` | — | Lista tablas del schema `ciszubot`/`muzicmania` con filas |

### Categoría E — Sistema

| Comando | Slash | Keybind | Qué hace |
|---|---|---|---|
| Info del equipo | `/sys info` | — | CPU, RAM usada/libre, disco, uptime |
| Procesos pesados | `/sys top` | — | Top 5 procesos por CPU/RAM |
| Estado opencode | `/sys opencode` | — | PID, tiempo de ejecución, tamaño del log del server |

### Categoría F — Extensión de voz (mejoras a `opencode-voice`)

| Comando | Slash | Keybind | Qué hace |
|---|---|---|---|
| Diagnóstico voz | `/voice check` | — | Verifica: mic detectado, modelo whisper presente, piper + voz activa, PATH correcto → resumen en toast |
| Test rápido | `/voice test` | — | STT: graba 3s y transcribe "Hola"; TTS: dice "Hola, esto es una prueba" |
| Estado del plugin | `/voice status` | — | Muestra config activa (modelo, mic, voz, modo TTS, modo STT) |

## Nivel 2 — Comandos markdown (`.opencode/command/*.md`)

Comandos declarativos: un archivo markdown con frontmatter que opencode interpreta como prompt con `$ARGUMENTS`. Sin código, pero muy útiles para tareas que ya hace el agente.

Ruta: `.opencode/command/<nombre>.md` (proyecto) o `~/.config/opencode/command/<nombre>.md` (global).

```markdown
---
description: Enviar mensaje al móvil vía ntfy
---
Ejecuta `pnpm notify "<$ARGUMENTS>"` y confirma el resultado.
```

| Archivo | Slash | Qué hace |
|---|---|---|
| `notify.md` | `/notify` | Envía ntfy vía `pnpm notify` (fallback del comando de código) |
| `deploy-web.md` | `/deploy-web` | Explica/ejecuta el flujo de deploy de una web (workflow + push) |
| `backup-db.md` | `/backup-db` | Ejecuta `node scripts/backup-db.js` y reporta el archivo |
| `cdn-upload.md` | `/cdn-upload` | Ejecuta `pnpm cdn:upload` y resume subidas |
| `git-status.md` | `/git-status` | `git status` + `git log --oneline -5` resumido |

Estos comandos **sí pueden usarse hoy mismo** sin escribir código (solo crear los .md) — pero se planifican juntos para no duplicar funcionalidad con el Nivel 1 (los .md son más lentos: pasan por el LLM; los de código son instantáneos).

## Nivel 3 — MCP servers

opencode soporta MCP nativamente en `opencode.json` (config global):

```json
"mcp": {
  "nombre": {
    "type": "local",              // o "remote"
    "command": ["npx", "-y", "pkg"],
    "enabled": true,
    "environment": { "TOKEN": "{env:MI_TOKEN}" }
  }
}
```

Opciones compatibles con el ecosistema:

| MCP | Tipo | Para qué | Notas |
|---|---|---|---|
| Docker MCP (`@docker/docker-mcp`) | local | Inspeccionar/controlar contenedores con herramientas del agente | Alternativa más potente al Nivel 1-B; requiere Docker Desktop corriendo |
| ntfy MCP (propio) | local | `send`, `list`, `clear` del topic | Podría sustituir a Nivel 1-A si se prefiere el agente gestione notificaciones |
| Supabase MCP (`dbvr mcp start -ds=supabase`) | local | Consultas SQL con herramientas reales | Ya existe en el stack (`dbvr`) — solo configurar |
| GitHub MCP (`@modelcontextprotocol/server-github`) | remote | PRs, issues, workflows | Útil para el deploy/review |

⚠️ Decisión de diseño: los MCP añaden tools del agente (más contexto en cada turno). Para acciones **manuales e inmediatas** (ntfy, docker start/stop) el Nivel 1 es mejor. Los MCP se reservan para cuando el **agente** deba hacerlo de forma autónoma dentro de una tarea.

## Nivel 4 — Hooks (eventos automáticos)

El plugin puede escuchar eventos y reaccionar sin que el usuario pida nada:

| Hook | Evento | Ejemplo |
|---|---|---|
| `event` | todos | Loggear o notificar eventos de la sesión |
| `session.idle` | fin de tarea | Notificar al móvil "tarea terminada" cuando el agente acaba (ya lo usa TTS auto) |
| `tool.execute.before/after` | herramientas | Avisar si una build falla (`pnpm build` exit != 0) |
| `permission.asked` | permisos | Notificar al móvil cuando el agente pide permiso (ya lo usa voz) |
| `question.asked` | preguntas | Avisar al móvil cuando hay una pregunta pendiente |
| `chat.message` | mensajes | Estadísticas de uso / guardar resúmenes |
| `command.execute.before` | comandos | Log de qué comandos personalizados se ejecutan |

Ejemplos planificados:
- **ntfy-fallback**: si el agente falla 2 veces seguidas en una build → push urgente al móvil
- **deploy-done**: al terminar un push con deploy, verificar la web y notificar resultado

## Resumen de escalado

| Nivel | Mecanismo | Velocidad | Esfuerzo | Para qué |
|---|---|---|---|---|
| 1 | Plugin de código (`api.command.register`) | Instantáneo | Medio | Acciones manuales directas: ntfy, docker, checks, supabase |
| 2 | Comandos markdown (`.md` con `$ARGUMENTS`) | Lento (LLM) | Bajo | Tareas que ya hace el agente (backup, deploy, cdn) |
| 3 | MCP servers (`opencode.json`) | Herramientas del agente | Bajo | Autonomía del agente (docker, supabase, github) |
| 4 | Hooks de eventos (`event`, `tool.execute.*`) | Automático | Medio | Reacciones sin pedir: alertas, notificaciones proactivas |

## Dependencias y requisitos

| Recurso | Para qué | Fuente |
|---|---|---|
| `NOTIFY_TOPIC` / `NOTIFY_TOKEN` | ntfy (comandos A) | `services/supabase/.env` (vault) |
| Docker Desktop corriendo | servidores (comandos B) | PC local |
| `pnpm notify` script | voz + fallbacks | `scripts/ntfy-notif.js` |
| dbvr CLI | supabase MCP | `C:\Program Files\dbvr\dbvr.exe` |
| Keys de MCP remoto | GitHub MCP | `gh` autenticado |

## Riesgos y consideraciones

1. **Permisos Docker**: el server opencode corre sin elevar (tarea AtLogOn). `docker compose` puede fallar → cada comando de servidor debe capturar el error y mostrarlo con toast.
2. **Keybinds ocupados**: `ctrl+r` (STT), `<leader>r` (STT submit), `<leader>s` (TTS), `<leader>v` (TTS mode), `escape` (TTS stop). Los nuevos usan `<leader>n`, `<leader>c`, `<leader>d` — verificar colisiones antes de registrar.
3. **Recarga**: cualquier cambio de plugin/MCP/comando requiere `opencode-run` (el plugin se carga al arrancar el server).
4. **Contexto de sesión**: los comandos de código NO gastan tokens del modelo (son JS directo); los markdown y MCP sí. Preferir Nivel 1 para lo frecuente.
5. **Seguridad**: los comandos con `child_process` deben validar argumentos (p.ej. nombre de servicio por lista blanca) para no permitir inyección.

## Plan de implementación (cuando se apruebe)

- **Fase 1**: esqueleto `tools/opencode-commands-ciszu/` + categoría A (ntfy) + categoría C (checks) — registro en `tui.json`, relanzar con `opencode-run`
- **Fase 2**: categoría B (docker) + categoría D (supabase) + E (sistema)
- **Fase 3**: comandos markdown (`.opencode/command/`) para backup/deploy/cdn
- **Fase 4**: MCP servers (docker, dbvr supabase) en config global
- **Fase 5**: hooks proactivos (ntfy en fallos de build, aviso de fin de tarea)
- **Fase 6**: extensión de `opencode-voice` con `/voice check` y `/voice test`

## Referencias

- Skill oficial `customize-opencode` (schema completo: https://opencode.ai/config.json)
- Plugin de voz: `tools/opencode-voice/` (patrón de registro de comandos)
- ntfy: `scripts/ntfy-notif.js` + doc VOZ_OPENCODE.md
- MCP: `opencode.json` global (`C:\Users\fplay\.config\opencode\opencode.json`)
