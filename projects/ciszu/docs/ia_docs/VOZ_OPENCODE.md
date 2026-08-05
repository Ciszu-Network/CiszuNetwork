# Voz para opencode (STT + TTS) — ago 2026

Sistema bidireccional de voz para opencode en Windows, basado en el plugin **`@renjfk/opencode-voice` v0.6.0** (MIT, GitHub `renjfk/opencode-voice`) con un **fork local parcheado para Windows integrado en el repo** (`tools/opencode-voice/`).

- **STT**: grabación con `ffmpeg` (DirectShow) → transcripción local con `whisper-cli` (whisper.cpp) → normalización LLM.
- **TTS**: normalización LLM → síntesis con `piper` → reproducción con `ffplay` (PC) o push de audio por ntfy (móvil).

Todo el sistema vive **dentro del repo** (`E:\Ciszu Network`): el código del plugin se trackea en git; los binarios, modelos y voces van en `runtime/` (gitignored); los temporales en `tmp/` (gitignored). No hay carpetas de voz fuera del repo.

## Instalación (ya realizada)

| Componente | Ruta | Notas |
|---|---|---|
| Plugin parcheado (código) | `tools/opencode-voice/` (trackeado) | `index.js` + `lib/` (stt, tts, session, llm-client, logger) + package.json |
| whisper.cpp v1.9.2 | `tools/opencode-voice/runtime/whisper/Release/` (`whisper-cli.exe` + dlls ggml) | Descargado `whisper-bin-x64.zip` de GitHub releases |
| Modelo whisper | `tools/opencode-voice/runtime/models/ggml-large-v3-turbo-q5_0.bin` (574 MB) | Default del plugin |
| Piper (Windows) | `tools/opencode-voice/runtime/piper/piper/piper.exe` (+ espeak-ng-data con español) | `piper_windows_amd64.zip` release 2023.11.14-2 |
| Voces Piper | `tools/opencode-voice/runtime/piper-voices/` | **`sharvard` (ES, femenina — DEFAULT)**, `amy` (EN, femenina), `ryan` (EN), `bryce` (EN), `davefx` (ES) |
| ffmpeg 9.0 essentials | `tools/opencode-voice/runtime/ffmpeg-9.0-essentials_build/bin/` | Grabación dshow + reproducción ffplay + conversión mp3 |
| sox 14.4.2 (win32) | `tools/opencode-voice/runtime/sox/sox-14.4.2/` | Solo utilidad manual (raw↔wav); el plugin NO lo usa en Windows |
| Config | `C:\Users\fplay\.config\opencode\tui.json` | Plugin por ruta local + keybinds + endpoint LLM |
| Env vars (user) | `GEMINI_API_KEY`, `NOTIFY_TOPIC`, `NOTIFY_TOKEN` + PATH | PATH: `runtime\whisper\Release`, `runtime\piper\piper`, `runtime\ffmpeg...\bin` |

Endpoint LLM de normalización: **Gemini OpenAI-compatible** (`https://generativelanguage.googleapis.com/v1beta/openai/`, modelo `gemini-3.6-flash`, `apiKeyEnv: GEMINI_API_KEY`). La clave vive en el vault `services/supabase/.env`. `NOTIFY_TOPIC`/`NOTIFY_TOKEN` (topic ntfy del proyecto) se exportan como variables de usuario desde el vault para que el plugin pueda enviar audio al móvil.

## Patches Windows aplicados al plugin (vs upstream)

- `lib/stt.js`:
  - `VOICE_BASE` = `path.dirname(path.dirname(fileURLToPath(import.meta.url)))` → raíz del plugin. Todo path se deriva de ahí (repo-relativo, sobrevive a movidas del repo).
  - `WAV_FILE` → `tmp\opencode-stt.wav`; `MODELS_DIRS` → primero `runtime\models`; `INBOX_DIR`/`PROCESSED_DIR` → `tmp\inbox`/`tmp\processed` (win32).
  - `transcribe(kv, logger, filePath = WAV_FILE)` — ahora acepta un archivo arbitrario (usado por `/stt-file`).
  - `startRecording()`: en win32 spawn de **ffmpeg dshow** (`-f dshow -i audio=<mic>` + `silenceremove=stop_periods=-1:stop_duration=0.8:stop_threshold=-35dB`) con stdin pipe; la parada se hace escribiendo `q` (cierre limpio → WAV válido). En Linux/macOS queda sox.
  - `stopRecording()`: win32 → `stdin.write("q")` + `end()`; fallback SIGKILL.
  - `listInputDevices()`: win32 → parsea `ffmpeg -list_devices true -f dshow -i dummy` (regex `"([^"]+)"\s+\(audio\)`).
  - `forceKillSox()`: `pkill` solo en no-win32.
- `lib/tts.js`:
  - `VOICES_DIR` → `runtime\piper-voices`; `AUDIO_DIR` → `tmp` (win32).
  - `TTS_VOICES` → voces femeninas añadidas: `sharvard` (es_ES, **DEFAULT**) y `amy` (en_US); se mantienen ryan/bryce/davefx.
  - `piperOnPath()` → acepta `piper.exe` en win32.
  - Playback: win32 → **ffplay** (`-f s16le -ar 22050 -ch_layout mono -nodisp -autoexit -loglevel quiet -i -`); Linux/macOS → `play`.
  - **`/tts-phone`**: sintetiza la última respuesta del asistente y la publica como **attachment de audio en el topic ntfy** (`NOTIFY_TOPIC` + `Authorization: Bearer NOTIFY_TOKEN`) → la app ntfy del móvil reproduce la voz.

## Uso (dentro del TUI de opencode)

| Acción | Comando / tecla |
|---|---|
| Grabar/transcribir (toggle) | `/stt-record` o `ctrl+r` |
| Grabar + transcribir + enviar prompt | `/stt-submit` o `ctrl+x` luego `r` |
| Cancelar grabación | `/stt-stop` |
| Elegir micrófono | `/stt-mic` |
| Elegir modelo whisper | `/stt-model` |
| Transcribir audio del móvil (inbox) | `/stt-file` |
| Transcribir + enviar prompt del móvil | `/stt-file-submit` |
| Leer última respuesta | `/tts-speak` o `ctrl+x` luego `s` |
| Auto-TTS (responde hablado) | `/tts-mode` o `ctrl+x` luego `v` |
| Parar reproducción | `/tts-stop` (escape) |
| Elegir voz | `/tts-voice` (sharvard ES ♀ default / amy EN ♀ / ryan / bryce / davefx) |
| Enviar última respuesta al móvil | `/tts-phone` (push ntfy con audio) |

Mics detectados en este PC: `Micrófono Ciszuko (Realtek(R) Audio)` y `Micrófono de escritorio (3- Microsoft® LifeCam HD-3000)`.

## Voz en el móvil (Termius + ntfy)

El TUI corre en el PC, así que el móvil no puede hablar por micrófono. Flujo soportado:

1. **Hablar al PC**: grabar en el móvil (Grabadora de audio) → SFTP con Termius a `E:\Ciszu Network\tools\opencode-voice\tmp\inbox\` → en el TUI `/stt-file` (o `/stt-file-submit`). El plugin coge el audio **más reciente** del inbox (wav/mp3/flac/ogg/m4a/aac/opus/webm; si no es wav, lo convierte con ffmpeg), transcribe y añade/envía el texto. El archivo se mueve a `tmp/processed/`.
2. **Que la IA hable al móvil**: `/tts-phone` → el asistente normaliza su última respuesta y envía un push ntfy con el audio adjunto (máx. ~15 MB gratis ≈ 40 s de audio). Se reproduce desde la propia notificación.

## Avisos ntfy con audio (`scripts/ntfy-notif.js`)

Política (ago 2026): los avisos push del proyecto pueden llevar **audio** además de texto, en un único push (la app ntfy lo reproduce).

- `node scripts/ntfy-notif.js "Titulo" "Mensaje" --voice` → adjunta el audio del mensaje sintetizado con Piper (voz **sharvard** por defecto; `--voice amy|ryan|bryce|sharvard|davefx`).
- Sintetiza con piper (stdin → wav) + ffmpeg (wav → mp3) usando los binarios de `tools/opencode-voice/runtime/`; el mp3 se borra tras enviar.
- Si la síntesis falla, el aviso se envía solo en texto (con warning).
- El topic/token se leen de `NOTIFY_TOPIC`/`NOTIFY_TOKEN` (env → `.env.local` → `services/supabase/.env` → defaults).

## Notas y gotchas

- El plugin se carga **al arrancar el servidor opencode** (`opencode serve` / tarea `opencode-server-ciszu`). Para activarlo o recargar cambios hay que **reiniciar**: `opencode-restart.cmd` (en `scripts/` y copiado en PATH: mata el listener de 4096, relanza vía ensure y hace attach). ⚠️ Reiniciar corta la sesión en vivo (PC y móvil).
- `ctrl+r` pisa `session_rename` (renombrado de sesión) — ya desactivado en `tui.json` (`"session_rename": "none"`); sigue accesible por `/rename`.
- El keybind `escape` (tts-stop) puede pisar cierres de diálogo: si molesta, usar `/tts-stop`.
- En Windows **sox NO puede grabar** (`-d` da "no default audio device") — por eso el patch usa ffmpeg. sox solo sirve para conversión manual raw→wav.
- La parada de grabación por silencio usa ffmpeg `silenceremove`; el `q` de parada manual finaliza el WAV correctamente.
- Si se re-instala opencode y el plugin no carga: borrar caché `~/.cache/opencode/packages/` (solo aplica a plugins npm; el fork local no se cachea).
- Verificar pipeline sin abrir opencode: `node tools/opencode-voice/tmp/test-plugin.js` (grabación + whisper + TTS completo).
- `whisper-cli`/`piper`/`ffmpeg` se ejecutan por nombre → dependen del PATH de usuario (3 entradas `runtime\...`). En el plugin, los spawn usan arrays de argumentos (sin shell), así que los espacios en `E:\Ciszu Network` no rompen nada.

## Revertir

1. Borrar la entrada del plugin de `C:\Users\fplay\.config\opencode\tui.json`.
2. Quitar `GEMINI_API_KEY`/`NOTIFY_TOPIC`/`NOTIFY_TOKEN` y las 3 entradas PATH de usuario.
3. Borrar `tools/opencode-voice/` del repo (~900 MB con modelos y voces) y el commit del plugin si no se quiere conservar.
