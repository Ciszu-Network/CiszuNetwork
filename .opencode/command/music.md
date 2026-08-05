---
description: Genera música IA (MusicGen/Suno) de forma global. Uso: /music <géneros + tema>
---

# Generar música IA de forma global

Entrada del usuario: `$ARGUMENTS`

1. Usa `tools/opencode-ai/generate-music.js` (leerlo si necesitas flags).
2. Extrae de la petición: géneros (`--genres "synthwave, retrowave"`), título (`--title`), opcional `--album`, `--artist` (default `CiszukoAntony`), `--duration <seg>`.
3. Comando tipo:

```
node tools/opencode-ai/generate-music.js --genres "<géneros>" --title "<título>" --artist "CiszukoAntony" --duration <seg>
```

   - Salida/carpeta: `<slug>/` con wav+mp3(full ID3+cover)+ogg+cover/banner GDI+ + fichas + `<slug>.json` (estructura MuzicMania/CDN).
   - `--provider hf` intenta MusicGen (router HF) — **hoy sin provider gratis → fallará**; `--provider suno` requiere `SUNO_API_KEY`.
   - Si NO se puede generar por API (sin key/provider), usar `--offline` con un wav local para probar el empaquetado, o avisar al usuario por `pnpm notify` pidiendo la key.
4. Devuelve la ruta generada. Si es música para MuzicMania, sugiere validar y en su caso `pnpm cdn:upload`.

Manejo de errores: verifica HF_TOKEN / SUNO_API_KEY en el vault; ante 503/red reintenta (retry en script) y `pnpm notify` si persiste.