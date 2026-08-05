# tools/opencode-ai — Generación IA global (Ciszu Network)

Conjunto único de herramientas de generación IA para TODO el ecosistema
(sites, Discord bot, MuzicMania, arte de marca...). Junto a `tools/opencode-voice`
(STT/TTS), aquí viven los generadores de medios.

> **Política**: TODO lo configurado debe funcionar solo con lo **gratuito** o sin
> tarjeta de crédito. Cualquier API configurada que requiera saldo/pago queda
> **implementada pero marcada como "sin usar"** hasta que el usuario lo decida.

## Inventario actual

| Archivo | Modalidad | Proveedores | Estado |
|---|---|---|---|
| `generate-art.js` | Imagen | HF (FLUX.1-schnell), Gemini, SiliconFlow | ✅ HF gratis (HF_TOKEN) |
| `remove-bg.js` | Post-proceso | chroma / BiRefNet | ✅ gratis |
| `generate-music.js` | Música | HF MusicGen (wav), Suno (SUNO_API_KEY) | ⚠️ HF router sin provider; Suno pendiente de key |
| `generate-video.js` | Vídeo | **fal.ai** (Wan 2.5) o HF router (Wan 2.1 / LTX) | ⚠️ fal configurado con `FAL_KEY` pero **cuenta sin saldo → sin usar** |
| `lib.js` | Shared | env/argv/retry/ffmpeg helpers | ✅ |

## Uso rápido

```bash
# Arte 16:9 al estilo de marca
node tools/opencode-ai/generate-art.js --provider hf --subject "a cute cyberpunk female hacker" \
    --outfit "techwear jacket" --expression "confident smirk" --out downloads/art

# Arte transparente (recortar personaje)
node tools/opencode-ai/generate-art.js --provider gemini --subject "logotipo Ciszuko" \
    --transparent --out downloads/art

# Música de catálogo (crea carpeta slug con wav/mp3/ogg + cover + banner + fichas)
node tools/opencode-ai/generate-music.js --genres "synthwave" --title "Neon Runner" \
    --artist "CiszukoAntony" --album "Neon Vol.1" --duration 30

# Empaquetar un wav local (sin generación) — DEBUG
node tools/opencode-ai/generate-music.js --title "Prueba" --offline ruta.wav

# Vídeo (fal — requiere saldo en https://fal.ai/dashboard/billing)
node tools/opencode-ai/generate-video.js --provider fal --prompt "a cyberpunk city at night" \
    --title "Neon City" --out downloads/video

# Quitar fondo a un PNG existente
node tools/opencode-ai/remove-bg.js --input imagen.png --output tras.png
```

## Música (`generate-music.js`) — estructura estándar

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

- Proveedor `hf`: MusicGen (requiere router HF con provider habilitado; hoy **sin provider gratis → usar Suno o package.).
  - `--offline ruta.wav` empaqueta un WAV sin llamar a ninguna API (DEBUG/productivo).
- Proveedor `suno`: encola y escribe `.json` placeholder (async; requiere `SUNO_API_KEY` — **pendiente del usuario**).
- Covers/banners: **GDI+ local vía PowerShell** (`System.Drawing`) — sin red, sin ffmpeg drawtext
  (ffmpeg en Windows falla parsing `fontfile=C:\...`; GDI+ es robusto).

Claves de arte: `--title --artist --album --genres --year --track --duration --provider --model --cover --no-cover --no-log --out --offline`.

## Vídeo (`generate-video.js`) — estado

- **Provider `fal`** (configurado, **sin uso por saldo**): API directa `queue.fal.run/fal-ai/wan-25-preview/text-to-video`
  con `FAL_KEY` (vault). Poll de `status_url` hasta COMPLETED → descarga mp4, extrae `poster.png`
  (frame 0 vía ffmpeg remux), log `<slug>.json` con modelo usado.
- Provider `hf`: intenta `Wan-AI/Wan2.1-T2V-1.3B` y `Lightricks/LTX-Video` vía router HF.
  ⚠️ Ambos devolvieron 404 (router sin provider habilitado en esta cuenta) — retomar cuando se active
  un proveedor de vídeo en HF.

## Nomenclatura y metadatos

- Slugs por carpeta: `slugify()` (matrúsculas→lower, no-alfano→`-`).
- Los mp4/mp3 reciben metadatos `title/artist/album` (+`comment` opcional) vía ffmpeg remux.
- Todo directorio de salida incluye `<slug>.json` con `provider`, `model`, `title`, `artist`,
  `album`, `prompt`, `created_at`, `size_bytes`, `files[]`.

## Claves (solo vault)

`services/supabase/.env` (o `.env.local`): `HF_TOKEN`, `GEMINI_API_KEY`, `SILICONFLOW_API_KEY`,
`SUNO_API_KEY` (pendiente), `FAL_KEY` (configurada). Red: HF requiere DNS estable.

## Reglas DRY / seguridad

- NO pegar keys en el repo; SOLO vault `.env`.
- Scripts nunca imprimen tokens.
- Preferir siempre el proveedor sin coste; requeò de red → aviso por `pnpm notify`.

## Archivo legacy histórico

- `scripts/generate-art.js`, `scripts/remove-bg.js` se movieron aquí (ago 2026). Referencias
  en docs consultable con grep antes de usar rutas legacy.