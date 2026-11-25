# OPENCODE_SYSTEM — Comandos y Voz para OpenCode

Versión: 3.0.0
Actualización: 2026-11-22
Identificador: OPENCODE_SYSTEM_V3.0.0_2026_11_22_ciszunetwork

Sistema de comandos personalizados y voz bidireccional (STT/TTS) para la terminal opencode en Windows. **Estado actual: OpenCode V2 (API v2).** La voz fue portada a la API TUI V2 y está activa: `opencode plugin list` muestra el plugin local y el arranque registra 14 comandos.

## Visión general

- **Voz (V2, activa)**: fork local de `@renjfk/opencode-voice` v0.6.0 (MIT) en `tools/tts-stt-ai/`, portado a `@opencode/plugin/tui` con `Plugin.define` + `setup`.
  - STT: grabación `ffmpeg` (DirectShow) → `whisper-cli` (whisper.cpp) → normalización LLM.
  - TTS: normalización LLM → `piper` → `ffplay` (PC) o push de audio por ntfy (móvil).
  - **Estado V2**: cargado desde `cli.json` (14 comandos), estado persistente en `context.storage` y selección con `context.ui.dialog.select`. La API V1 del upstream queda como referencia histórica.
- **Comandos**: sistema escalable por niveles para interactuar con servicios externos (ntfy, Docker, Supabase, checks) desde la TUI.
- Todo el sistema vive **en el repo local** (`E:\Ciszu Network`); `tools/` está gitignored: el código del fork no viaja en el repo público. Binarios/modelos/voces en `runtime/` y temporales en `tmp/` también están gitignored.

## Instalación (realizada)

| Componente | Ruta | Notas |
|---|---|---|
| Plugin parcheado (código) | `tools/tts-stt-ai/` (trackeado) | `index.js` + `lib/` (stt, tts, session, llm-client, logger) + package.json |
| whisper.cpp v1.9.2 | `tools/tts-stt-ai/runtime/whisper/Release/` (`whisper-cli.exe` + dlls ggml) | `whisper-bin-x64.zip` de GitHub releases |
| Modelo whisper | `tools/tts-stt-ai/runtime/models/ggml-large-v3-turbo-q5_0.bin` (574 MB) | Default del plugin |
| Piper (Windows) | `tools/tts-stt-ai/runtime/piper/piper/piper.exe` (+ espeak-ng-data con español) | release 2023.11.14-2 |
| Voces Piper | `tools/tts-stt-ai/runtime/piper-voices/` | **`sharvard` (ES, femenina — DEFAULT)**, `amy` (EN, femenina), `ryan` (EN), `bryce` (EN), `davefx` (ES) |
| ffmpeg 9.0 essentials | `tools/tts-stt-ai/runtime/ffmpeg-9.0-essentials_build/bin/` | Grabación dshow + ffplay + conversión mp3 |
| sox 14.4.2 (win32) | `tools/tts-stt-ai/runtime/sox/sox-14.4.2/` | Solo utilidad manual (raw↔wav); el plugin NO lo usa en Windows |
| Config TUI | `C:\Users\fplay\.config\opencode\cli.json` | Preferencias del cliente V2 + `plugins` solo-TUI (V2 reemplazó `tui.json`) |
| Plugin de voz | `C:\Users\fplay\.config\opencode\cli.json` → `plugins` | `E:/Ciszu Network/tools/tts-stt-ai`; opciones `endpoint`, `model`, `apiKeyEnv` (Gemini) |
| Config servidor | `opencode.json` (global y raíz del repo) | Proveedores, agentes, permisos, MCP y plugins de servidor |
| Env vars (user) | `GEMINI_API_KEY`, `NOTIFY_TOPIC`, `NOTIFY_TOKEN` + PATH | PATH: `runtime\whisper\Release`, `runtime\piper\piper`, `runtime\ffmpeg...\bin` |

Endpoint LLM de normalización de voz: **Gemini OpenAI-compatible** (`https://generativelanguage.googleapis.com/v1beta/openai/`, modelo `gemini-3.6-flash`, `apiKeyEnv: GEMINI_API_KEY`). La clave vive en el vault `services/supabase/.env` (ver `VAULT_SYSTEM.md`). `NOTIFY_TOPIC`/`NOTIFY_TOKEN` se exportan como variables de usuario para que el plugin envíe audio al móvil.

> **Nota sobre modelos (2026-08-23)**: el LLM **principal del agente** (código) ya no es Gemini — es **DeepSeek V4 Flash** vía suscripción **OpenCode Go** (`opencode-go/deepseek-v4-flash`). Gemini queda **solo** para la normalización de voz de este plugin y tareas de imagen. Historial, costos y directivas de ahorro: `MODELS_LLM_SYSTEM.md`.

## Registro de comandos del plugin

```js
const commands = [...sttCommands, ...ttsCommands];
context.keymap.layer(() => ({
  mode: "global",
  priority: 10,
  commands: commands.map((command) => ({
    id: command.value,
    title: command.title,
    description: command.description,
    bind: command.keybind,
    slash: command.slash,
    run: () => command.onSelect(),
  })),
}));
```

Cada comando es un objeto con:

| Campo | Descripción | Ejemplos actuales |
|---|---|---|
| `title` | Título del comando | `"STT: record/transcribe"` |
| `value` | ID interno único | `"stt.record"` |
| `description` | Texto de ayuda | `"Toggle recording..."` |
| `keybind` | Atajo de teclado | `"ctrl+r"`, `"<leader>s"`, `"escape"` |
| `slash` | Comando `/nombre` | `{ name: "stt-record-pc" }` |
| `onSelect()` | Acción a ejecutar | código JS arbitrario |

**API V2 (implementación actual)**: un plugin TUI se declara con
`Plugin.define({ id, setup(ctx) })` desde `@opencode/plugin/tui`. Los comandos van en
`ctx.keymap.layer(...)`, el estado en `ctx.storage`, los avisos en `ctx.ui.toast.show(...)`,
los selectores en `ctx.ui.dialog` y la sesión en `ctx.client`/`ctx.data`. La configuración TUI
global es `cli.json`; los plugins solo-TUI se declaran en `cli.json` → `plugins`. Los cambios
se recargan al guardar (no hace falta reiniciar).

> **Histórico V1**: el upstream usaba `api.command.register`, `api.kv`, `api.ui.dialog.replace`,
> `api.client` y `tui.json`. Ese código ya no se ejecuta en V2.

## Uso de voz (dentro del TUI)

> Comandos activos en OpenCode V2 desde `cli.json` (14 comandos registrados).

| Acción | Comando / tecla |
|---|---|
| Grabar/transcribir (PC, toggle) | `/stt-record-pc` o `ctrl+r` |
| Grabar + transcribir + enviar prompt (PC) | `/stt-submit-pc` o `ctrl+x` luego `r` |
| Cancelar grabación (PC) | `/stt-stop-pc` |
| Elegir micrófono (PC) | `/stt-mic-pc` |
| Elegir modelo whisper (PC) | `/stt-model-pc` |
| Transcribir audio del móvil (ntfy) | `/stt-record-cel` |
| Transcribir + enviar prompt del móvil (ntfy) | `/stt-submit-cel` |
| Transcribir audio copiado manualmente al inbox local | `/stt-file-cel` |
| Transcribir + enviar prompt desde el inbox local | `/stt-file-submit-cel` |
| Leer última respuesta (PC) | `/tts-speak-pc` o `ctrl+x` luego `s` |
| Auto-TTS (PC, responde hablado) | `/tts-mode-pc` o `ctrl+x` luego `v` |
| Parar reproducción (PC) | `/tts-stop-pc` (escape) |
| Elegir voz (PC) | `/tts-voice-pc` (sharvard ES ♀ default / amy EN ♀ / ryan / bryce / davefx) |
| Enviar última respuesta al móvil | `/tts-speak-cel` (push ntfy con audio) |

Mics detectados en este PC: `Micrófono Ciszuko (Realtek(R) Audio)` y `Micrófono de escritorio (3- Microsoft® LifeCam HD-3000)`.

## Patches Windows aplicados al plugin (vs upstream)

- `lib/stt.js`:
  - `VOICE_BASE` = raíz del plugin derivada de `fileURLToPath(import.meta.url)` — paths repo-relativos, sobreviven movidas del repo.
  - `WAV_FILE` → `tmp\opencode-stt.wav`; `MODELS_DIRS` → primero `runtime\models`; `INBOX_DIR`/`PROCESSED_DIR` → `tmp\inbox`/`tmp\processed` (win32).
  - `transcribe(kv, logger, filePath = WAV_FILE)` — acepta archivo arbitrario (`/stt-file-cel`).
  - `startRecording()`: en win32 spawn de **ffmpeg dshow** (`-f dshow -i audio=<mic>` + `silenceremove=stop_periods=-1:stop_duration=0.8:stop_threshold=-35dB`) con stdin pipe; parada escribiendo `q` (cierre limpio → WAV válido). Linux/macOS usa sox.
  - `listInputDevices()`: win32 → parsea `ffmpeg -list_devices true -f dshow -i dummy` (regex `"([^"]+)"\s+\(audio\)`).
  - `forceKillSox()`: `pkill` solo en no-win32.
- `lib/tts.js`:
  - `VOICES_DIR` → `runtime\piper-voices`; `AUDIO_DIR` → `tmp` (win32).
  - `TTS_VOICES` → voces femeninas: `sharvard` (es_ES, **DEFAULT**) y `amy` (en_US); se mantienen ryan/bryce/davefx.
  - `piperOnPath()` → acepta `piper.exe` en win32.
  - Playback win32 → **ffplay** (`-f s16le -ar 22050 -ch_layout mono -nodisp -autoexit -loglevel quiet -i -`).
  - **`/tts-speak-cel`**: sintetiza la última respuesta del asistente → attachment de audio en el topic ntfy (`NOTIFY_TOPIC` + `Authorization: Bearer NOTIFY_TOKEN`).

## Voz en el móvil (ntfy)

1. **Hablar al PC (STT)**: grabar con la app de grabadora → `ntfy.sh/app` → suscribirse al
   topic (`NOTIFY_TOPIC`) → publicar **adjuntando el audio** (clip). En el PC:
   `/stt-record-cel` (o `/stt-submit-cel`) → descarga el **último audio** adjunto
   (mimetype `audio/*` o extensión) y lo transcribe. La web app usa PUT + query params
   (confirmado en `PublishDialog.jsx`). Límite ntfy.sh: 15 MB ≈ 40 s de voz.
2. **Alternativa local**: copiar manualmente un archivo de audio a
   `C:\Users\fplay\inbox\` y usar `/stt-file-cel` o `/stt-file-submit-cel`. No requiere
   ninguna app de terminal en el móvil.
3. El plugin coge el audio **más reciente** (ntfy: último adjunto no procesado, id en kv
   `stt.ntfyLastId`), convierte a wav si hace falta (ffmpeg), transcribe y añade/envía el
   texto. El archivo se mueve a `tmp/processed/`.
4. **Que la IA hable al móvil (TTS)**: `/tts-speak-cel` → normaliza su última respuesta y
   envía push ntfy con audio adjunto (máx. ~15 MB ≈ 40 s).

## Push ntfy: metadatos y nombres identificables

### Helper compartido: `tools/tts-stt-ai/lib/ntfy-meta.js`

**ESM puro** — el binario Bun de opencode NO soporta named imports desde módulos CJS en plugins TUI (`Export named 'buildNtfyMeta' not found`). Como ESM lo importan igual el plugin y el script CLI (Node 24 usa `require(ESM)` nativo).

- `buildAudioName({ tipo, motivo, sesion, texto })` → `ciszu-tts-20260805-025812-respuesta-ciszuai-8f3a.mp3`
  - Patrón: `ciszu-<tipo>-<YYYYMMDD>-<HHMMSS>-<motivo>-<sesion-saneada>-<hash4>.mp3`; sanitiza acentos/minúsculas/espacios, máx 24 chars por parte, `na` si vacía.
- `buildNtfyMeta({ title, message, tags, priority, click, icon, actions, filename })` → solo campos presentes; `tags` CSV; `actions` JSON string.
- `buildViewAction({label, url})` y `buildHttpAction({label, url, method, headers, body})` (p.ej. header `Authorization` para la API del bot) — ambos aceptan `clear: true`.

### Metadatos enviados (PUT + query params — UTF-8 seguro)

| Campo (query param) | `/tts-speak-cel` | `ntfy-notif.js --voice` |
|---|---|---|
| `f` (filename) | `ciszu-tts-<fecha>-<hora>-respuesta-<sesion>-<hash>.mp3` | `ciszu-notif-<fecha>-<hora>-aviso-na-<hash>.mp3` |
| `title` | `Ciszu · Respuesta por voz` (mapa `MOTIVO_TITLES`) | título del aviso |
| `message` | texto normalizado (máx 300 chars) | mensaje del aviso |
| `tags` | `robot` | `robot` o el `--tag` |
| `priority` | 3 | `--priority` o 3 |
| `click`/`icon`/`actions` | opcionales por contexto | reservado |

⚠️ **Regla (verificada empíricamente)**: el **multipart form-data NO sirve** en ntfy.sh — el servidor ignora el filename del `Content-Disposition` y los campos de metadatos del form. Los **headers** funcionan pero Node los codifica como latin1 → tildes corruptas. Solución: **PUT con todo como query params** (percent-encoded UTF-8): filename via `f`, resto directo.

### Cambios técnicos

- `lib/tts.js`: `synthToNtfy(text, logger, ctx)` (`ctx = {motivo, sesion, title, message, tags, priority, click, icon, actions}`); `sendToNtfy(mp3, topic, logger, meta)` — PUT con `f` + `Content-Type: audio/mpeg`; borra `.mp3`/`.wav` tras enviar.
- `scripts/ntfy-notif.js`: `synthesizeVoice` → nombre con `buildAudioName`; `send()` → `POST` (texto) o `PUT` (audio con `f`); `requestWithRetry()` (reintentos 1.5s/4s/10s).

## Avisos ntfy con audio (`scripts/ntfy-notif.js`)

- `pnpm notify "Titulo" "Mensaje" --voice [--priority urgent --tag warning]` → audio del mensaje sintetizado con Piper (voz **sharvard** default; `--voice amy|ryan|bryce|sharvard|davefx`).
- `--markdown` → mensaje como Markdown. `--delay 30m|"tomorrow, 3pm"|ts` → entrega programada (mín 10 s, máx 3 días; id en la respuesta, se cancela con `DELETE /<topic>/<id>`).
- Sintetiza con piper (stdin→wav) + ffmpeg (wav→mp3) desde `tools/tts-stt-ai/runtime/`; el mp3 se borra tras enviar. Si la síntesis falla, aviso solo en texto (warning).
- Topic/token de `NOTIFY_TOPIC`/`NOTIFY_TOKEN` (env → `.env.local` → `services/supabase/.env` → defaults).
- **Botones de acción**: `buildViewAction`/`buildHttpAction` pasados como JSON en `actions`.

## Comandos escalables por niveles (diseño)

### Nivel 1 — Plugin de comandos en código (`tools/opencode-commands-ciszu/`)

Paquete nuevo, patrón `tools/tts-stt-ai/`: `index.js` + `lib/` (`notify.js`, `servers.js`, `checks.js`, `supabase.js`, `system.js`).

**Categoría A — Notificaciones (ntfy)**: `/notify <texto>` (`<leader>n`), `/notify-voice`, `/notify-urgent`, `/notify-list`, `/notify-clear`. Reutiliza `scripts/ntfy-notif.js`.

**Categoría B — Servidores (Docker)**: `/server status` (`<leader>d`), `/server start bot`, `/server stop bot`, `/server restart bot`, `/server logs <n>`. ⚠️ `docker` puede requerir admin; el server opencode corre sin elevar → detectar fallo y toast.

**Categoría C — Checks**: `/check` (`<leader>c`), `/check webs`, `/check bot` (`ciszubot.bot_status`), `/check disk` (alerta si C: < 5 GB), `/check cdn` (HEAD mimetype/200), `/check git`.

**Categoría D — Supabase (solo lectura)**: `/supabase status`, `/supabase heartbeat`, `/supabase tables`.

**Categoría E — Sistema**: `/sys info`, `/sys top`, `/sys opencode`.

**Categoría F — Extensión de voz**: `/voice check`, `/voice test`, `/voice status`.

### Nivel 2 — Comandos markdown (`.opencode/command/*.md`)

Frontmatter + `$ARGUMENTS`, sin código. V2 descubre `.opencode/commands/` (preferida) y la legacy `.opencode/command/`; este repo mantiene `command/` por compatibilidad. Ruta global: `~/.config/opencode/commands/`. Candidatos: `notify.md`, `deploy-web.md`, `backup-db.md`, `cdn-upload.md`, `git-status.md`. Más lentos (pasan por el LLM); los de código son instantáneos. V2 recarga comandos al guardar.

### Nivel 3 — MCP servers (`opencode.json`)

```json
"mcp": {
  "servers": {
    "nombre": {
      "type": "local",
      "command": ["npx", "-y", "pkg"],
      "environment": { "TOKEN": "{env:MI_TOKEN}" }
    }
  }
}
```

> V2 agrupa en `mcp.servers`, usa `disabled: true` para no conectar y recarga al guardar. `enabled`
> ya no existe. Ver `MCP_PROTOCOLS.md`.

| MCP | Tipo | Para qué |
|---|---|---|
| Docker MCP (`@docker/docker-mcp`) | local | Controlar contenedores con herramientas del agente |
| ntfy MCP (propio) | local | `send`/`list`/`clear` del topic |
| Supabase MCP (`dbvr mcp start -ds=supabase`) | local | Consultas SQL (ya existe en el stack) |
| GitHub MCP (`@modelcontextprotocol/server-github`) | remote | PRs, issues, workflows |

Decisión de diseño: para acciones **manuales e inmediatas** el Nivel 1 es mejor; los MCP se reservan para autonomía del **agente** dentro de una tarea.

### Nivel 4 — Hooks (eventos automáticos, API V2)

En V2 los hooks viven en un plugin de servidor (`@opencode/plugin`): `ctx.event.subscribe()`
para eventos (`session.idle`, `permission.asked`, etc.), `ctx.tool.hook("execute.before" |
"execute.after")`, `ctx.shell.hook("create.before")` y `ctx.session.hook(...)` para contexto/
prompt. Los hooks V1 (`event`, `tool.execute.before/after`, `chat.message`) **no se traducen
automáticamente**. Ejemplos: **ntfy-fallback** (2 fallos de build → push urgente),
**deploy-done** (verificar web tras push).

### Resumen de escalado

| Nivel | Mecanismo | Velocidad | Esfuerzo | Para qué |
|---|---|---|---|---|
| 1 | Plugin de código | Instantáneo | Medio | Acciones manuales directas |
| 2 | Markdown (`.md` + `$ARGUMENTS`) | Lento (LLM) | Bajo | Tareas que ya hace el agente |
| 3 | MCP servers | Herramientas del agente | Bajo | Autonomía del agente |
| 4 | Hooks de eventos | Automático | Medio | Reacciones sin pedir |

### Dependencias y requisitos

`NOTIFY_TOPIC`/`NOTIFY_TOKEN` (vault), Docker Desktop corriendo, `pnpm notify` (`scripts/ntfy-notif.js`), dbvr CLI (`C:\Program Files\dbvr\dbvr.exe`), `gh` autenticado para GitHub MCP.

### Riesgos

1. **Permisos Docker**: el server opencode corre sin elevar → capturar error y toast.
2. **Keybinds ocupados**: `ctrl+r`, `<leader>r`, `<leader>s`, `<leader>v`, `escape` ya usados. Nuevos usan `<leader>n`, `<leader>c`, `<leader>d` — verificar colisiones.
3. **Recarga**: V2 recarga configuración, comandos, skills y MCP al guardar; los cambios de código de un plugin requieren recargarlo. No es necesario reiniciar el server para editar `opencode.json`/`cli.json`.
4. **Contexto de sesión**: los comandos de código NO gastan tokens; markdown y MCP sí.
5. **Seguridad**: comandos con `child_process` deben validar argumentos (lista blanca) para evitar inyección.

## Perfil PowerShell portable y CLI (14 nov 2026)

El perfil ya no vive duplicado en `$PROFILE`: el `$PROFILE` solo carga un **loader** y el
código real está versionado en `shared/powershell/CiszuNetwork.Profile.ps1`.

- Instalación/reparación en un dispositivo nuevo: `pnpm profile:install` (hace backup del
  `$PROFILE` actual y escribe el loader).
- Comprobación: `pnpm profile:check`.
- El loader busca el repo en `CISZU_REPO`, la ruta instalada, `E:\Ciszu Network`,
  `$HOME\Ciszu Network` y `$HOME\source\repos\CiszuNetwork`.
- Incluye `doctor`, `cmds`, `opsstatus`, `opsdigest`, `opsreport`, `cleannext`, `cleanlogs`,
  `cleanall`, `profile-reload`, `profile-edit`, `profile-path`, `free` y `ports`.
- Autocompletado: scripts de `pnpm`, apps de `dev`/`devlog`, ramas de `git` en
  `checkout/switch/merge/rebase/branch`, historial incremental y búsqueda con flechas.
- `gc`/`gcp` bloquean el stage si detectan `.env`, `SECRET_TEMP.env` o `.age`.
- Catálogo completo: `pnpm commands`; ayuda del perfil: `ciszuh` o `czhelp`.\n- **Banner normal por defecto**: el módulo muestra banner y cabecera como antes; `CISZU_PROFILE_BANNER=0` los desactiva para terminales no interactivas. Si `E:` está bloqueado por BitLocker, el loader omite el módulo sin errores; para diagnóstico, `CISZU_PROFILE_DEBUG=1`.

## LSP en OpenCode V2 — retirado del agente

**OpenCode V2 no ejecuta servidores LSP.** El campo `"lsp"` se acepta por compatibilidad pero se
ignora: no arranca servers, no expone tools de definiciones/referencias/hover y no entrega
diagnósticos al agente. Por eso `opencode.json` (raíz) ya no lo configura y `permission.lsp` no
es una acción válida de V2.

- Los editores (VS Code, etc.) conservan su propio LSP; es independiente de OpenCode.
- `typescript` y `eslint` de la raíz siguen disponibles para `tsc`, `eslint` y los builds, pero
  ya no son requisito de LSP del agente.
- La verificación obligatoria es por comando: `tsc --noEmit`, `next build`, `pnpm test`
  (`LOCAL_TESTING_PROTOCOLS.md` §3.3). No asumir que el código compila por ausencia de errores
  en el editor.
- Historia y catálogo de LSP para editores: `LSP_PROTOCOLS.md`.

## Notas y gotchas

- El plugin de voz V2 está cargado (`opencode plugin list` muestra `E:\Ciszu Network\tools\tts-stt-ai`) y registra `/stt-*` y `/tts-*`. La configuración TUI se recarga al guardar desde `cli.json`; ya no existe `tui.json`.
- Los keybinds se definen en `cli.json`; `ctrl+r` y `escape` del fork conservan su función, pero deben validarse contra la referencia de keybinds de V2 si cambia el cliente.
- El keybind `escape` (`tts-stop-pc`) puede pisar cierres de diálogo → usar `/tts-stop-pc`.
- En Windows **sox NO graba** (`-d` → "no default audio device") — el patch usa ffmpeg; sox solo conversión manual.
- Si se re-instala opencode y el plugin no carga: borrar caché `~/.cache/opencode/packages/` (solo plugins npm; el fork local no se cachea).
- Verificar el port V2 sin TUI: `node tools/tts-stt-ai/tmp/test-v2.mjs` (14 comandos).
- `whisper-cli`/`piper`/`ffmpeg` se ejecutan por nombre → dependen del PATH de usuario; los spawn usan arrays de argumentos (sin shell) → los espacios en `E:\Ciszu Network` no rompen nada.
- **Gotcha Bun**: el binario de opencode NO importa módulos CJS desde plugins TUI — usar ESM puro.

## Revertir

1. Borrar la entrada del plugin de `C:\Users\fplay\.config\opencode\cli.json`.
2. Quitar `GEMINI_API_KEY`/`NOTIFY_TOPIC`/`NOTIFY_TOKEN` y las 3 entradas PATH de usuario.
3. Borrar `tools/tts-stt-ai/` del repo local (~900 MB con modelos y voces; `tools/` está gitignored, no hay commit que revertir).

## Referencias

- Skill oficial `customize-opencode` (schema: https://opencode.ai/config.json)
- Plugin de voz: `tools/tts-stt-ai/` (patrón de registro de comandos)
- ntfy: `scripts/ntfy-notif.js` + doc `MONITORING_SYSTEM.md` / `REMOTE_CONTROL_SYSTEM.md`
- MCP: `opencode.json` global (`C:\Users\fplay\.config\opencode\opencode.json`)

_Última revisión: 22 nov 2026._ Relacionado: `LSP_PROTOCOLS.md`, `MCP_PROTOCOLS.md`,
`FRAMEWORKS_SYSTEM.md`, `TESTING_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md`, `AGENTS.md` (§6.7),
`REMOTE_CONTROL_SYSTEM.md`, `MONITORING_SYSTEM.md`, `MODELS_LLM_SYSTEM.md`.
