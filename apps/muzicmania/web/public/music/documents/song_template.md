# MuzicMania — Template de Canción

## Archivos Requeridos

- [ ] audio.mp3 (o audio.ogg) — Archivo de audio principal
- [ ] cover.png — Carátula 600x600px
- [ ] license.txt — Licencia de la canción
- [ ] about_readme.txt — Información de la canción

## Metadatos Requeridos (ID3 / Vorbis)

- title: Nombre de la canción
- artist: Artista
- album: Álbum
- date: Año de lanzamiento
- genre: Género musical
- track: Número de pista
- TBPM: Beats por minuto
- description: Descripción breve

## Convención de Nombres

- Carpetas: snake_case (ej: mi_cancion)
- Archivos: nombre_cancion.ext (ej: mi_cancion.mp3)
- IDs: snake_case (ej: mi_cancion)

## Notas

- Los covers se generan automáticamente con sharp
- Los metadatos se incrustan con ffmpeg
- Los OGG se convierten desde MP3
