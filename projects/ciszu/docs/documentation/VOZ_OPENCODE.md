# Voz para opencode (STT + TTS) — ago 2026

Sistema bidireccional de voz para opencode en Windows, basado en el plugin **`@renjfk/opencode-voice` v0.6.0** (MIT, GitHub `renjfk/opencode-voice`) con un **fork local parcheado para Windows integrado en el repo** (`tools/tts-stt-ai/`).

- **STT**: grabación con `ffmpeg` (DirectShow) → transcripción local con `whisper-cli` (whisper.cpp) → normalización LLM.
- **TTS**: normalización LLM → síntesis con `piper` → reproducción con `ffplay` (PC) o push de audio por ntfy (móvil).

Todo el sistema vive **dentro del repo** (`E:\Ciszu Network`): el código del plugin se trackea en git; los binarios, modelos y voces van en `runtime/` (gitignored); los temporales en `tmp/` (gitignored). No hay carpetas de voz fuera del repo.

## Instalación (ya realizada)

| Componente | Ruta | Notas |
|---|---|---|
| Plugin parcheado (código) | `tools/tts-stt-ai/` (trackeado) | `index.js` + `lib/` (stt, tts, session, llm-client, logger) + package.json |
| whisper.cpp v1.9.2 | `tools/tts-stt-ai/runtime/whisper/Release/` (`whisper-cli.exe` + dlls ggml) | Descargado `whisper-bin-x64.zip` de GitHub releases |
| Modelo whisper | `tools/tts-stt-ai/runtime/models/ggml-large-v3-turbo-q5_0.bin` (574 MB) | Default del plugin |
| Piper (Windows) | `tools/tts-stt-ai/runtime/piper/piper/piper.exe` (+ espeak-ng-data con español) | `piper_windows_amd64.zip` release 2023.11.14-2 |
| Voces Piper | `tools/tts-stt-ai/runtime/piper-voices/` | **`sharvard` (ES, femenina — DEFAULT)**, `amy` (EN, femenina), `ryan` (EN), `bryce` (EN), `davefx` (ES) |
| ffmpeg 9.0 essentials | `tools/tts-stt-ai/runtime/ffmpeg-9.0-essentials_build/bin/` | Grabación dshow + reproducción ffplay + conversión mp3 |
| sox 14.4.2 (win32) | `tools/tts-stt-ai/runtime/sox/sox-14.4.2/` | Solo utilidad manual (raw↔wav); el plugin NO lo usa en Windows |
| Config | `C:\Users\fplay\.config\opencode\tui.json` | Plugin por ruta local + keybinds + endpoint LLM |
| Env vars (user) | `GEMINI_API_KEY`, `NOTIFY_TOPIC`, `NOTIFY_TOKEN` + PATH | PATH: `runtime\whisper\Release`, `runtime\piper\piper`, `runtime\ffmpeg...\bin` |

Endpoint LLM de normalización: **Gemini OpenAI-compatible** (`https://generativelanguage.googleapis.com/v1beta/openai/`, modelo `gemini-3.6-flash`, `apiKeyEnv: GEMINI_API_KEY`). La clave vive en el vault `services/supabase/.env`. `NOTIFY_TOPIC`/`NOTIFY_TOKEN` (topic ntfy del proyecto) se exportan como variables de usuario desde el vault para que el plugin pueda enviar audio al móvil.

## Patches Windows aplicados al plugin (vs upstream)

- `lib/stt.js`:
  - `VOICE_BASE` = `path.dirname(path.dirname(fileURLToPath(import.meta.url)))` → raíz del plugin. Todo path se deriva de ahí (repo-relativo, sobrevive a movidas del repo).
  - `WAV_FILE` → `tmp\opencode-stt.wav`; `MODELS_DIRS` → primero `runtime\models`; `INBOX_DIR`/`PROCESSED_DIR` → `tmp\inbox`/`tmp\processed` (win32).
  - `transcribe(kv, logger, filePath = WAV_FILE)` — ahora acepta un archivo arbitrario (usado por `/stt-file-cel`).
  - `startRecording()`: en win32 spawn de **ffmpeg dshow** (`-f dshow -i audio=<mic>` + `silenceremove=stop_periods=-1:stop_duration=0.8:stop_threshold=-35dB`) con stdin pipe; la parada se hace escribiendo `q` (cierre limpio → WAV válido). En Linux/macOS queda sox.
  - `stopRecording()`: win32 → `stdin.write("q")` + `end()`; fallback SIGKILL.
  - `listInputDevices()`: win32 → parsea `ffmpeg -list_devices true -f dshow -i dummy` (regex `"([^"]+)"\s+\(audio\)`).
  - `forceKillSox()`: `pkill` solo en no-win32.
- `lib/tts.js`:
  - `VOICES_DIR` → `runtime\piper-voices`; `AUDIO_DIR` → `tmp` (win32).
  - `TTS_VOICES` → voces femeninas añadidas: `sharvard` (es_ES, **DEFAULT**) y `amy` (en_US); se mantienen ryan/bryce/davefx.
  - `piperOnPath()` → acepta `piper.exe` en win32.
  - Playback: win32 → **ffplay** (`-f s16le -ar 22050 -ch_layout mono -nodisp -autoexit -loglevel quiet -i -`); Linux/macOS → `play`.
  - **`/tts-speak-cel`**: sintetiza la última respuesta del asistente y la publica como **attachment de audio en el topic ntfy** (`NOTIFY_TOPIC` + `Authorization: Bearer NOTIFY_TOKEN`) → la app ntfy del móvil reproduce la voz.

## Uso (dentro del TUI de opencode)

| Acción | Comando / tecla |
|---|---|
| Grabar/transcribir (PC, toggle) | `/stt-record-pc` o `ctrl+r` |
| Grabar + transcribir + enviar prompt (PC) | `/stt-submit-pc` o `ctrl+x` luego `r` |
| Cancelar grabación (PC) | `/stt-stop-pc` |
| Elegir micrófono (PC) | `/stt-mic-pc` |
| Elegir modelo whisper (PC) | `/stt-model-pc` |
| Transcribir audio del móvil (ntfy) | `/stt-record-cel` |
| Transcribir + enviar prompt del móvil (ntfy) | `/stt-submit-cel` |
| Transcribir audio del móvil (SFTP inbox) | `/stt-file-cel` |
| Transcribir + enviar prompt del móvil (SFTP) | `/stt-file-submit-cel` |
| Leer última respuesta (PC) | `/tts-speak-pc` o `ctrl+x` luego `s` |
| Auto-TTS (PC, responde hablado) | `/tts-mode-pc` o `ctrl+x` luego `v` |
| Parar reproducción (PC) | `/tts-stop-pc` (escape) |
| Elegir voz (PC) | `/tts-voice-pc` (sharvard ES ♀ default / amy EN ♀ / ryan / bryce / davefx) |
| Enviar última respuesta al móvil | `/tts-speak-cel` (push ntfy con audio) |

Mics detectados en este PC: `Micrófono Ciszuko (Realtek(R) Audio)` y `Micrófono de escritorio (3- Microsoft® LifeCam HD-3000)`.

## Voz en el móvil (Termius + ntfy)

El TUI corre en el PC, así que el móvil no puede hablar por micrófono. Flujo soportado:

1. **Hablar al PC (STT)** — dos vías:
   - **RECOMENDADA (sin SFTP, 5 ago 2026)**: en el móvil, grabar con la app de grabadora → abrir `ntfy.sh/app` en el navegador → suscribirse al topic (`NOTIFY_TOPIC`) → botón publicar (papel de avión) → **adjuntar el audio** (clip) → enviar. En el PC: `/stt-record-cel` (o `/stt-submit-cel`) → el plugin descarga el **último audio** adjunto del topic (mimetype `audio/*` o extensión) y lo transcribe con el mismo pipeline. La web app usa exactamente PUT + query params (confirmado en `PublishDialog.jsx`), así que el audio llega con nombre y metadatos. Límite ntfy.sh: 15 MB ≈ 40 s de voz.
   - **Alternativa (SFTP Termius)**: subir a `C:\Users\fplay\inbox\` → en el TUI `/stt-file-cel` (o `/stt-file-submit-cel`). ⚠️ Termius arranca en el home `C:\Users\fplay` y en móvil NO se puede navegar a `E:\Ciszu Network\...` — por eso existe el **junction** `C:\Users\fplay\inbox` → `E:\Ciszu Network\tools\opencode-voice\tmp\inbox\` (visible desde el home, no requiere admin; hay un `README.txt` dentro).
   - El plugin coge el audio **más reciente** (inbox: archivo más nuevo; ntfy: último adjunto no procesado, id en kv `stt.ntfyLastId`), lo convierte a wav si hace falta (ffmpeg), transcribe (whisper-cli) y añade/envía el texto. El archivo se mueve a `tmp/processed/`.
2. **Que la IA hable al móvil (TTS)**: `/tts-speak-cel` → el asistente normaliza su última respuesta y envía un push ntfy con el audio adjunto (máx. ~15 MB gratis ≈ 40 s de audio). Se reproduce desde la propia notificación.

## Push ntfy: metadatos y nombres identificables (IMPLEMENTADO — 5 ago 2026)

Los audios que llegan al móvil tienen **nombre de archivo descriptivo + metadatos ricos**, aprovechando todo lo que ntfy soporta. Aplicado a `/tts-speak-cel`, `ntfy-notif.js --voice` y reutilizable por los futuros comandos de `opencode-commands-ciszu` (categoría A — ver `COMANDOS_OPENCODE.md`).

### Helper compartido: `tools/tts-stt-ai/lib/ntfy-meta.js`

**ESM puro** (5 ago 2026, migrado desde `ntfy-meta.cjs`): el binario Bun de opencode NO soporta named imports desde módulos CJS en plugins TUI (`Export named 'buildNtfyMeta' not found` / `Missing 'default' export` / `require() async module` — el plugin fallaba en silencio). Como ESM lo importan igual el plugin y el script CLI (Node 24 usa `require(ESM)` nativo):

- `buildAudioName({ tipo, motivo, sesion, texto })` → `ciszu-tts-20260805-025812-respuesta-ciszuai-8f3a.mp3`
  - Patrón: `ciszu-<tipo>-<YYYYMMDD>-<HHMMSS>-<motivo>-<sesion-saneada>-<hash4>.mp3`
  - Sanitiza: acentos quitados, minúsculas, espacios → guiones, máx 24 chars por parte, `na` si vacía
- `buildNtfyMeta({ title, message, tags, priority, click, icon, actions, filename })` → solo campos presentes, `tags` como CSV, `actions` como JSON string

### Metadatos enviados (PUT + query params — UTF-8 seguro)

| Campo (query param) | `/tts-speak-cel` | `ntfy-notif.js --voice` |
|---|---|---|
| `f` (filename) | `ciszu-tts-<fecha>-<hora>-respuesta-<sesion>-<hash>.mp3` | `ciszu-notif-<fecha>-<hora>-aviso-na-<hash>.mp3` |
| `title` | `Ciszu · Respuesta por voz` (mapa `MOTIVO_TITLES`: respuesta/auto/notificar/deploy/check/alerta) | título del aviso |
| `message` | texto normalizado (máx 300 chars) | mensaje del aviso |
| `tags` | `robot` | `robot` o el `--tag` |
| `priority` | 3 | `--priority` o 3 |
| `click`/`icon`/`actions` | opcionales por contexto (`ctx.click`, `ctx.icon`, `ctx.actions`) | reservado |

⚠️ **Cómo se llegó a esto (probado empíricamente 5 ago 2026)**: el **multipart form-data NO sirve** en ntfy.sh — el servidor IGNORA el filename del `Content-Disposition` (el adjunto siempre llega como `attachment.mp3`) y además ignora los campos de metadatos del form (`title` no llegó en la prueba). Los **headers** (`Title`, `Message`, `Filename`...) SÍ funcionan, pero Node los codifica como latin1 → tildes/`·` corruptos (`Ciszu � Test`). La solución: **PUT con todo como query params** (UTF-8 percent-encoded): filename via `f`, resto de campos directos → verificado: `title` con tildes intactas + `attachment.name` personalizado en el feed JSON.

### Cambios técnicos

- `lib/tts.js`:
  - `synthToNtfy(text, logger, ctx)` — `ctx = { motivo, sesion, title, message, tags, priority, click, icon, actions }`; `MOTIVO_TITLES` para títulos legibles; nombre local = nombre final del archivo (`.wav`/`.mp3` en `tmp/`)
  - `sendToNtfy(mp3, topic, logger, meta)` — `PUT https://ntfy.sh/<topic>?<query params>` con `f` = filename, `Content-Type: audio/mpeg`, body = mp3; borra `.mp3` y `.wav` tras enviar
  - `/tts-speak-cel` → pasa `{ motivo: "respuesta", sesion, tags: ["robot"], priority: 3 }` (sesión = título de sesión activa)
- `scripts/ntfy-notif.js`:
  - `synthesizeVoice` → nombre con `buildAudioName`; `send()` → siempre query params: `POST` (texto) o `PUT` (audio con `f`); `requestWithRetry()` con reintentos 1.5s/4s/10s
- **Verificado**: push real con audio + metadatos a ntfy → HTTP 200, nombre `ciszu-notif-20260805-032641-aviso-na-ea5f.mp3` y `title` con `·` correctos en el feed JSON

### Uso por el agente (tareas)

Cuando opencode necesite avisar al móvil (inicio/fin de tarea, alertas), debe usar `pnpm notify "Título" "Mensaje" --voice [--priority urgent --tag warning]` — el script aplica el mismo helper y el móvil recibe audio + metadatos consistentes. Los futuros comandos TUI (`/notify`, `/notify-voice`, `/notify-urgent`) usarán el mismo `ntfy-meta.js` con su `motivo` propio.



## Avisos ntfy con audio (`scripts/ntfy-notif.js`)

Política (ago 2026): los avisos push del proyecto pueden llevar **audio** además de texto, en un único push (la app ntfy lo reproduce).

- `node scripts/ntfy-notif.js "Titulo" "Mensaje" --voice` → adjunta el audio del mensaje sintetizado con Piper (voz **sharvard** por defecto; `--voice amy|ryan|bryce|sharvard|davefx`).
- `--markdown` → el mensaje se marca como Markdown (negritas, links, code — se renderiza en la web app). `--delay 30m|"tomorrow, 3pm"|ts` → entrega programada (mín 10 s, máx 3 días; el id del programado sale en la respuesta del publish, se cancela con DELETE `/<topic>/<id>`).
- Sintetiza con piper (stdin → wav) + ffmpeg (wav → mp3) usando los binarios de `tools/tts-stt-ai/runtime/`; el mp3 se borra tras enviar.
- Si la síntesis falla, el aviso se envía solo en texto (con warning).
- El topic/token se leen de `NOTIFY_TOPIC`/`NOTIFY_TOKEN` (env → `.env.local` → `services/supabase/.env` → defaults).
- **Botones de acción**: `ntfy-meta.js` exporta `buildViewAction({label, url})` y `buildHttpAction({label, url, method, headers, body})` (p.ej. header `Authorization` para llamar a la API del bot) — ambos aceptan `clear: true`. Se pasan como JSON en `actions` (query param, igual que la web app).

## Notas y gotchas

- El plugin se carga **al arrancar el servidor opencode** (`opencode serve` / tarea `opencode-server-ciszu`). Para activarlo o recargar cambios hay que **reiniciar**: `opencode-run` (en `scripts/` y copiado en PATH; mata el listener de 4096 si escucha, relanza vía ensure y hace attach) — **es el lanzador por defecto para iniciar sesiones**. ⚠️ Reiniciar corta la sesión en vivo (PC y móvil).
- `ctrl+r` pisa `session_rename` (renombrado de sesión) — ya desactivado en `tui.json` (`"session_rename": "none"`); sigue accesible por `/rename`.
- El keybind `escape` (`tts-stop-pc`) puede pisar cierres de diálogo: si molesta, usar `/tts-stop-pc`.
- En Windows **sox NO puede grabar** (`-d` da "no default audio device") — por eso el patch usa ffmpeg. sox solo sirve para conversión manual raw→wav.
- La parada de grabación por silencio usa ffmpeg `silenceremove`; el `q` de parada manual finaliza el WAV correctamente.
- Si se re-instala opencode y el plugin no carga: borrar caché `~/.cache/opencode/packages/` (solo aplica a plugins npm; el fork local no se cachea).
- Verificar pipeline sin abrir opencode: `node tools/tts-stt-ai/tmp/test-plugin.js` (grabación + whisper + TTS completo).
- `whisper-cli`/`piper`/`ffmpeg` se ejecutan por nombre → dependen del PATH de usuario (3 entradas `runtime\...`). En el plugin, los spawn usan arrays de argumentos (sin shell), así que los espacios en `E:\Ciszu Network` no rompen nada.

## Revertir

1. Borrar la entrada del plugin de `C:\Users\fplay\.config\opencode\tui.json`.
2. Quitar `GEMINI_API_KEY`/`NOTIFY_TOPIC`/`NOTIFY_TOKEN` y las 3 entradas PATH de usuario.
3. Borrar `tools/tts-stt-ai/` del repo (~900 MB con modelos y voces) y el commit del plugin si no se quiere conservar.
