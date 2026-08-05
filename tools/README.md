# tools — Suite IA global (Ciszu Network)

Herramientas de generación IA para TODO el ecosistema (sites, Discord bot, MuzicMania,
arte de marca...). Organizadas por modalidad en carpetas desacopladas y generalizadas
(no ligadas a opencode): cada una puede usarse desde PowerShell, opencode o CI.

> **Política**: TODO lo configurado debe funcionar solo con lo **gratuito** o sin
> tarjeta de crédito. Cualquier API configurada que requiera saldo/pago queda
> **implementada pero marcada como "sin usar"** hasta que el usuario lo decida.

## Estructura

| Carpeta | Script | Modalidad | Proveedores | Estado |
|---|---|---|---|---|
| `image-ai/` | `generate-art.js` | Imagen | HF (FLUX.1-schnell), Gemini, SiliconFlow | ✅ HF gratis (HF_TOKEN) |
| `removebg-ai/` | `remove-bg.js` | Post-proceso | chroma / BiRefNet | ✅ gratis |
| `music-ai/` | `generate-music.js` | Música | **ACE-Step** (AceMusic, default), HF MusicGen, Suno | ⚠️ ace requiere `ACE_API_KEY` (el mismo modelo que generó Genesis Neon) |
| `video-ai/` | `generate-video.js` | Vídeo | **fal.ai** (Wan 2.5) o HF router (Wan 2.1 / LTX) | ⚠️ fal configurado con `FAL_KEY` pero **cuenta sin saldo → sin usar** |
| `shared/` | `lib.js` | Shared | helpers (env/argv/retry/ffmpeg) | ✅ |
| `tts-stt-ai/` | plugin de voz | STT/TTS para opencode | whisper.cpp + Piper + Gemini (LLM) | ✅ local (offline) |

Cada `*-ai/` es independiente; solo `music-ai/` y `video-ai/` comparten `shared/lib.js`.
Los binarios de ffmpeg/ffprobe viven en `tts-stt-ai/runtime/` (gitignored) y se resuelven
vía `findFfmpeg()` de `shared/lib`.

## Uso rápido

```bash
# Arte 16:9 al estilo de marca
node tools/image-ai/generate-art.js --provider hf --subject "a cute cyberpunk female hacker" \
    --outfit "techwear jacket" --expression "confident smirk" --out downloads/art

# Arte transparente (recortar personaje)
node tools/image-ai/generate-art.js --provider gemini --subject "logotipo Ciszuko" \
    --transparent --out downloads/art

# Música de catálogo (crea carpeta slug con wav/mp3/ogg + cover + banner + fichas)
node tools/music-ai/generate-music.js --genres "synthwave" --title "Neon Runner" \
    --artist "CiszukoAntony" --album "Neon Vol.1" --bpm 124 --duration 30

# Misma pista pero vía ACE-Step explícito (el default)
node tools/music-ai/generate-music.js --provider ace --genres "synthwave" --title "Neon Runner" --duration 30

# Empaquetar un wav local (sin generación) — DEBUG
node tools/music-ai/generate-music.js --title "Prueba" --offline ruta.wav

# Vídeo (fal — requiere saldo en https://fal.ai/dashboard/billing)
node tools/video-ai/generate-video.js --provider fal --prompt "a cyberpunk city at night" \
    --title "Neon City" --out downloads/video

# Quitar fondo a un PNG existente
node tools/removebg-ai/remove-bg.js --input imagen.png --output tras.png
```

## Música (`music-ai/generate-music.js`) — estructura estándar

Cada pista genera un **directorio `<slug>/`** con la estructura MuzicMania-CDN:

```
downloads/<carpeta>/
  <slug>/                 → slug título (minúsculas, guiones)
    about_readme.md/.txt   → ficha: artista, álbum, género, año, proveedor
    banner.png             → portada 1600x900 (GDI+ neón)
    cover.png              → portada cuadrada 1024x1024 (GDI+ neón)
    license.md/.txt        → licencia
    <slug>.wav             → master
    <slug>.mp3             → 192k CBR + ID3 todo + cover embebida
    <slug>.ogg             → Vorbis ~q5
    <slug>.json            → LOG (proveedor, modelo, prompt, metadatos, archivos)
```

- Proveedor `ace` (**DEFAULT**): AceMusic ACE-Step (`acemusic/acestep-v1.5-turbo`) — mismo servicio/modelo
  que generó el álbum Genesis Neon de MuzicMania (ver `projects/muzicmania/website/scripts/generate-tracks.ps1`).
  Endpoint `https://api.acemusic.ai/v1/chat/completions`, prompt estilo "Generate a N second instrumental
  track at BPM". Devuelve MP3 → se normaliza a WAV PCM con ffmpeg local. Requiere `ACE_API_KEY`.
- Proveedor `hf`: MusicGen (requiere router HF con provider habilitado; hoy **sin provider gratis**).
- Proveedor `suno`: pide `SUNO_API_KEY` — **pendiente del usuario** (link: `https://suno.com/account/api-keys`).
- `--offline ruta.wav` empaqueta un WAV sin llamar a ninguna API (DEBUG/productivo).
- Covers/banners: **GDI+ local vía PowerShell** (`System.Drawing`) — sin red, sin ffmpeg drawtext
  (ffmpeg en Windows falla parsing `fontfile=C:\...`; GDI+ es robusto).

Claves de arte: `--title --artist --album --genres --year --track --duration --provider --model --cover --no-cover --no-log --out --offline`.

## Vídeo (`video-ai/generate-video.js`) — estado

- **Provider `fal`** (configurado, **sin uso por saldo**): API directa `queue.fal.run/fal-ai/wan-25-preview/text-to-video`
  con `FAL_KEY` (vault). Poll de `status_url` hasta COMPLETED → descarga mp4, extrae `poster.png`
  (frame 0 vía ffmpeg), log `<slug>.json` con modelo usado.
- Provider `hf`: `Wan-AI/Wan2.1-T2V` y `Lightricks/LTX-Video` vía router HF.
  ⚠️ Ambos devolvieron 404 (router sin provider habilitado) — retomar cuando se active uno.

## Nomenclatura y metadatos

- Slugs por carpeta: `slugify()` (mayúsculas→lower, no-alfanum→`-`).
- Los mp4/mp3 reciben metadatos `title/artist/album` (+`comment` opcional) vía ffmpeg remux.
- Todo directorio de salida incluye `<slug>.json` con `provider`, `model`, `title`, `artist`,
  `album`, `prompt`, `created_at`, `size_bytes`, `files[]`.

## Claves (solo vault)

`services/supabase/.env` (o `.env.local`): `ACE_API_KEY`, `HF_TOKEN`, `GEMINI_API_KEY`,
`SILICONFLOW_API_KEY`, `SUNO_API_KEY` (pendiente), `FAL_KEY` (configurada). Red: HF requiere DNS estable.

## Reglas DRY / transmisión

- NO pegar keys en el repo; SOLO vault `.env`.
- Scripts nunca imprimen tokens.
- Preferir siempre el proveedor sin coste; error de red → aviso por `pnpm notify`.

## Historial

- `tools/opencode-ai/` y `tools/opencode-voice/` se dividieron (5 ago 2026) en los folders
  por modalidad actuales. Referencias legacy: grep antes de usar rutas viejas.