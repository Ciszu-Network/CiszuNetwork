---
description: Genera música IA (ACE-Step/AceMusic por defecto). Uso: /music <géneros + tema>
---

# Generar música IA de forma global

Entrada del usuario: `$ARGUMENTS`

1. Usa `tools/music-ai/generate-music.js` (leerlo si necesitas flags).
2. Extrae de la petición: géneros (`--genres "synthwave, retrowave"`), título (`--title`), opcional `--album`, `--artist` (default `CiszukoAntony`), `--duration <seg>` (ace soporta minutos), `--bpm`.
3. Comando tipo:

```
node tools/music-ai/generate-music.js --genres "<géneros>" --title "<título>" --artist "CiszukoAntony" [--bpm 120] [--duration <seg>]
```

   - **`--provider ace` es el DEFAULT** (AceMusic ACE-Step `acemusic/acestep-v1.5-turbo` — mismo servicio/modele que generó Genesis Neon). Requiere `ACE_API_KEY` en el vault.
   - Salida/carpeta: `<slug>/` con wav + mp3(full ID3+cover) + ogg + cover/banner GDI+ + fichas + `<slug>.json` (estructura MuzicMania/CDN). El audio ACE se normaliza a WAV PCM con ffmpeg.
   - Alternativas: `--provider hf` (MusicGen, router sin provider gratis hoy) y `--provider suno` (requiere `SUNO_API_KEY`).
   - Si NO hay `ACE_API_KEY`: avisar al usuario por `pnpm notify` pidiendo la key (apanel de AceMusic). `--offline` sirve para empaquetar un wav existente sin API.
4. Devuelve la ruta generada. Si es música para MuzicMania, sugiere validar y en llamar `pnpm cdn:upload`.

Manejo de errores: verifica `ACE_API_KEY`/`HF_TOKEN`/`SUNO_API_KEY` en el vault; ante 503/red reintenta (retry ya en script) y `pnpm notify` si persiste.