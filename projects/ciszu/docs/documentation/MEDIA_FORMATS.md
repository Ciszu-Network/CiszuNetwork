# SISTEMA DE FORMATOS DE CISZU NETWORK

> **Documento maestro de formatos** — imagen, vídeo, audio y no-multimedia.
> **Estado**: diseño completo (8 ago 2026). Habilita el plan final de implementación.
> **Tarea origen**: `toDo.md` → _"Replantear si utilizar WebP o AVIF en vez de PNG, JPEG (JPE, JPG), TIFF, BMP y GIF."_
> Este documento define: **qué formato vive en qué capa**, **para qué se usa**, **cuál es el de entrega**, y **cómo el sistema elige automáticamente el mejor formato** para cada navegador/dispositivo.

---

## 0. Filosofía — el ecosistema en 4 capas

El repositorio y el CDN guardan **UNA única verdad por archivo** (la fuente), pero presentan **varias versiones derivadas** según quién la consuma. Definimos 4 capas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CAPA 1 · TRABAJO (fuente original)                                      │
│  Única verdad. Lo que editas: .psd, .ai, .pdn, .wav, .mov, .png, .docx  │
│  Viene de DaVinci/OBS/Paint.NET/Photoshop/Grabación. JAMÁS se toca.     │
├─────────────────────────────────────────────────────────────────────────┤
│  CAPA 2 · ARCHIVO (masters de entrega lossless)                         │
│  Copia de trabajo de máxima fidelidad, lista para re-exportar:          │
│  .flac, .png (render 4x), .tiff, .svg (vectorial). Peso alto, usa       │
│  oportunidad, se guarda si el original es propietario (.psd/.ai).       │
├─────────────────────────────────────────────────────────────────────────┤
│  CAPA 3 · DEMOSTRACIÓN (exportados compatibles = el repo actual)        │
│  Formatos universales que sirven a todo el mundo y se muestran directo: │
│  .png, .jpg, .gif, .mp4 (H.264), .mp3, .ogg, .wav. Es lo que hoy vive   │
│  en `projects/*/content` y se sube al CDN. Este es el QUE HOY SE VE.      │
├─────────────────────────────────────────────────────────────────────────┤
│  CAPA 4 · ENTREGA (web/CDN — eficiencia)                                │
│  Derivadas optimizadas, generadas automáticamente, para los navegador   │
│  compatibles (la mayoría): .avif, .webp, .webm (VP9/AV1), .opus, .am4a  │
│  Sistema inteligente decide cuándo servirlas (ver §4).                  │
└─────────────────────────────────────────────────────────────────────────┘
```

> **Regla de oro**: nunca se muestra la Capa 1 en web. La Capa 3 garantiza que **TODO** se ve en cualquier navegador (compatibilidad universal). La Capa 4 es **inesencial**: si un navegador no la soporta, se sirve la Capa 3. El sistema es una **capa de compatibilidad inteligente**, no un cambio de normativa.

---

## 1. Catálogo global de formatos

### 1.1 Imágenes

| Formato   | Capa                       | Compresión     | Alpha    | Animación | Soporte web         | Uso esperado                                        |
| --------- | -------------------------- | -------------- | -------- | --------- | ------------------- | --------------------------------------------------- |
| PNG       | 1,2,3                      | lossless       | Si       | APNG raro | universal           | masters + demo                                      |
| PSD       | 1                          | propietario    | —        | —         | no                  | Photoshop (máquinas)                                |
| AI        | 1                          | propietario    | —        | —         | no                  | Ilustrator (máquinas)                               |
| PDN / PFL | 1                          | propietario    | —        | —         | no                  | Paint.NET (máquinas)                                |
| TIFF      | 2                          | ambos          | Si       | —         | no                  | escaneo/impresión                                   |
| SVG       | 1,2,3                      | vectorial      | Si       | Si (SMIL) | **universal**       | logos, iconos (5.208!) — fuente de verdad vectorial |
| JPG/JPE   | 3                          | lossy          | No       | —         | universal           | fotos demo                                          |
| GIF       | 3 (1 si animación máquina) | 8-bit          | Si 1-bit | Si        | universal           | animaciones demo                                    |
| BMP       | 1 (raro)                   | sin            | Si       | —         | no                  | básicamente muerto                                  |
| **AVIF**  | 4                          | lossy+lossless | Si       | irregular | ~96% (Saf 16.4+)    | **entrega fotos/banners**                           |
| **WebP**  | 4                          | lossy+lossless | Si       | animado   | **universal 99.5%** | **entrega logos/ilustra-banners**                   |

### 1.2 Vídeo

| Formato  | Capa | Códec         | Soporte web                      | Uso                                       |
| -------- | ---- | ------------- | -------------------------------- | ----------------------------------------- |
| MOV      | 1    | H.264/ProRes  | no                               | masters DaVinci                           |
| MKV      | 2    | varios        | no                               | archivo backups                           |
| MP4      | 3    | **H.264+AAC** | **universal**                    | demo / entrega estándar                   |
| **WebM** | 4    | VP9 / AV1     | Chrome/FF/Edge + Saf 14.1+/16.4+ | **entrega vídeo ligero** (fondos, promos) |

### 1.3 Audio

| Formato         | Capa | Códec    | Soporte web      | Uso                              |
| --------------- | ---- | -------- | ---------------- | -------------------------------- |
| WAV             | 1    | PCM      | —                | máster de grabación              |
| MP3             | 3    | capa III | 100%             | demo universal                   |
| AAC (.m4a/.aac) | 3    | AAC      | 100%             | demo Apple/internet              |
| OGG             | 3    | Vorbis   | 100% (Saf 16.4+) | demo alternativa                 |
| **FLAC**        | 2,4  | lossless | 95%              | máster digital + entrega visual  |
| **Opus**        | 4    | Opus     | 100% (Saf 16.4+) | **entrega audio** (música juego) |

### 1.4 No-media (datos, docs, temporales) — también parte del sistema

| Tipo            | Format                                          | Capa | Nota                                 |
| --------------- | ----------------------------------------------- | ---- | ------------------------------------ |
| Datos           | `.md`, `.json`, `.yml`, `.toml`, `.csv`, `.log` | 1/2  | fuente de verdad texto               |
| Docs            | `.docx`, `.pdf`, `.odt`                         | 1/3  | distribución oficial                 |
| Fuentes         | `.ttf`, `.otf`, `.woff2`                        | 3    | requeridas por el navegador tal cual |
| Paquete         | `.zip`, `.rar`, `.7z`, `.exe`, `.msi`           | 1/3  | iOS master/instaladores Tauri        |
| Config          | `.env`, `.toml`, `.jsonc`, `.sh`, `.ps1`        | 1    | infra, NO sube a CDN                 |
| Media no-raster | `.psd`, `.ai`, `.pptx`, `.docx`                 | 1    | solo máquinas propias                |

---

## 2. Comparativas detalladas (para entrega real)

### 2.1 WebM (VP9 / AV1) vs MP4 (H.264) — vídeo

| Criterio                    | MP4 H.264 (hoy, capa 3) | WebM VP9         | WebM AV1                                 |
| --------------------------- | ----------------------- | ---------------- | ---------------------------------------- |
| Peso (misma calidad visual) | referencia (100%)       | ~40-60%          | ~50-70%                                  |
| Compatibilidad (2026)       | 100%                    | ~97% (Saf 14.1+) | ~90% (Saf 16.4+, HW decode en GPU nueva) |
| Hardware decode             | universal               | bueno            | depende de GPU (moderna sí)              |
| Codificación (PC)           | rápido                  | media            | **lenta (2-10x)**                        |
| Licencias                   | H.264 patentado         | gratis           | gratis                                   |
| Botones (background, loop)  | sí                      | sí               | sí                                       |

**Beneficio en Ciszu**: el fondo animado de MuzicMania (10 MB mp4) → 5 MB webm VP9 o 3 MB AV1. Promos del álbum con la misma calidad a mitad de peso. El CDN envíe menos gigabytes = más rápido para móvil. **Para entrega**: se mantiene MP4 como la opción universal (se muestra SIEMPRE), y WebM se sirve como alternativa cuando el navegador+dispositivo es compatible.

### 2.2 AVIF vs WebP — imágenes (resumen ejecutivo)

| Caso                                | Ganador          | Por qué                                |
| ----------------------------------- | ---------------- | -------------------------------------- |
| Fotos / fondos / banners            | **AVIF**         | ~50% del JPG, calidad igual o superior |
| Logos / ilustración / texto / alpha | **WebP**         | lossless perfecto, 70-80% del PNG      |
| Animación (GIF)                     | **WebP animado** | universal; AVIF animado es irregular   |

### 2.3 Opus vs MP3 — música (MuzicMania)

| Bitrate/cómputo   | MP3 192k | Opus 128k        | Opus 96k  |
| ----------------- | -------- | ---------------- | --------- |
| Calidad percibida | buena    | igual/major      | muy buena |
| Peso pista 3 min  | ~4,3 MB  | **~2,9 MB**      | ~2,2 MB   |
| Soporte navegador | 100%     | 100% (Saf 16.4+) | 100%      |

**Beneficio directo**: pistas de MuzicMania pasan de 4,3 MB → ~2,9-2,2 MB (30-50% menos) en el CDN, más rápido en móvil. FLAC como capa arquivo del máster (no se sirra a juegos salvo que se quiera).

### 2.4 FLAC vs WAV (masters)

|              | WAV                  | FLAC                                              |
| ------------ | -------------------- | ------------------------------------------------- |
| Fidelidad    | 100%                 | 100% (**lossless** igual)                         |
| Peso (mismo) | 100%                 | ~55-65%                                           |
| Uso          | máquina de grabación | **máster de archivo + entrega de alta fidelidad** |

---

## 3. ¿Cuál es el flujo de transformación?

```
CAPA 1 (fuente)  →  CAPA 2 (archivo)  →  CAPA 3 (demo universal)  →  CAPA 4 (entrega optimizada)

.wav            →  .flac (máster lossless)       → .mp3 192k / .ogg  → .opus 96-128k (opcional)
.psd / .ai       →  .png 4x / .svg export        → .png / .jpg       → .webp / .avif (por categoría)
.mov             →  .mp4 H.264 máster             → .mp4              → .webm (VP9/AV1, opcional)
.gif máquina     →  .png frames (solo si se pide) → .gif              → .webp animado
.gif máquina     →  .png frames (solo si se pide)→ .gif              → .webp animado
```

**Reglas del pipeline**:

1. La **Capa 4 siempre sale de la Capa 3** (nunca de la 1) — la 3 ya es compatible y validada.
2. La conversión a Capa 4 **nunca** sobrees durante el original ni elimina la Capa 3.
3. Si la Capa 4 es **más pesada** que la 3 para ese archivo → **no se genera** (el sistema solo gana).
4. El formato de Capa 4 se elige **por categoría** (§ del plan WebP/AVIF) y por **soporte dinámico** del cliente (ver §4).
5. Los formatos de Capa 1/2/3 **viven en el repo**. La Capa 4 puede generarse por script en el repo (recomendable, commit) o bajo demanda (futuro).

---

## 4. EL SISTEMA HÍBRIDO INTELIGENTE (capa de compatibilidad)

### 4.1 Qué es

Un **resolver de formatos** en el código de las webs (`packages/cdn`) y en el CDN que, dado un asset, decide **cuál es el formato de entrega óptimo para el cliente actual**, sin romper jamás la compatibilidad:

```
petición de asset "banner_album"
     │
     ▼
¿navegador/UA soporta AVIF? ──► sí → /banner_album.avif
     │no
     ▼
¿soporta WebP? ──────────────► sí → /banner_album.webp
     │no
     ▼
  └──► /banner_album.png   (capa 3, SIEMPRE existe y se ve)
```

Las mismas 3 preguntas para vídeo (MP4 → WebM → MP4) y audio (MP3 → Opus → MP3/OGG).

### 4.2 Cómo se implementa en el código

1. **En `packages/cdn`**: una función `resolveDelivery(type, path, clientHints)`:
    - Entrada: `clientHints` del UA/accept header del navegador (enviado desde el cliente con `navigator.userAgent` o con el header `Accept`/`Accept-CH` de `image/avif`).
    - Devuelve la URL del mejor formato EXISTENTE (marca en build qué derivadas existen).
    - Fallback por defecto: Capa 3 (universal).
2. **En los componentes**: `<img>` / `<video>` / `<audio>` reemplazan sus `src` fijos por `assetResolver.resolve()`, que elige la Capa 4 solo cuando existe el archivo derivado; si el objeto no existe (404), el componente cae a la Capa 3 (el onError del element lo resuelve).
3. **Detector ligero**: `detectAvif()` puede usar `HTMLImageElement.decode()` o regex según UA — los navegadores modernos de todos modos anuncian soporte en el header `Accept`.

### 4.3 Cómo colabora el CDN

- El bucket **ciszu-cdn** guarda TODAS las capas (1, 2, 3 y la 4 derivada) — el mirror 1:1 del repo ya lo cubre.
- Los **mimetypes** se verifican (`pnpm cdn:verify`) — se añade al mapa: `.avif`, `.webm`, `.opus`, `.flac`, `.wav`, `.m4a`, `.aac`.
- Las capas 3 y 4 conviven: la 4 se añade, la 3 nunca se borra (compatibilidad garantizada).
- **Estrategia de carga**: la web pide el recurso de la Capa 4; si el objeto no existe (404), el `onError` del componente cae a la Capa 3.

---

## 5. Aplicación práctica por web

| Asset                         | Capa 3 (actual) | Capa 4 (entrega)               | Dónde se decide |
| ----------------------------- | --------------- | ------------------------------ | --------------- |
| Isotype/ilustraciones (logos) | `.png`/`.svg`   | `.webp` (lossless)             | resolver        |
| Banners MuzicMania            | `.png`          | `.avif`                        | resolver        |
| Covers album                  | `.png`/`.jpg`   | `.webp`/`.avif` según alpha    | resolver        |
| Fondo animado web             | `.mp4`          | `.webm` VP9                    | `<video>` tags  |
| Pistas música juego           | `.mp3`, `.ogg`  | `.opus` 128k + `.flac` opción  | resolver        |
| PPT/Docs                      | `.pdf`, `.docx` | — (sin cambiar)                | —               |
| Iconos                        | `.svg`          | **se queda**. SVG ya es óptimo | —               |

---

## 6. Inventario real del repo (para el plan de implementación)

| Métrica                             | Valor                                                 |
| ----------------------------------- | ----------------------------------------------------- |
| PNG                                 | 4.294                                                 |
| JPG/JPE/JPEG                        | 458                                                   |
| GIF                                 | 35                                                    |
| SVG                                 | 5.205                                                 |
| MP4                                 | 102 · MOV 60 (masters, no CDN)                        |
| MP3                                 | 64 · AAC 47 · OGG 12 · WAV 4                          |
| Masters de diseño (PSD/AI/PDN/PFL)  | ~500+ (no se suben)                                   |
| **Total media (capa 3, subir CDN)** | ~2 GB (imagen) + 7 GB (video master) + 113 MB (audio) |

---

## 7. Dudas frecuentes del sistema

1. **¿Un navegador viejo lo tendrá todo?** Sí — siempre cae a Capa 3.
2. **¿El sistema gasta más almacenamiento?** Para imágenes, un `-15%` del total (los .avif/webp corren ~50-70% del png). Para audio/vídeo es opcional y medido.
3. **¿Puedo revertir?** 100% — las capas 1-3 están intactas, solo se añaden.
4. **¿Los masters (PSD/AI/WAV) se tocan?** **Nunca**.
5. **¿Se aplica a los SVG?** No — SVG es de capa 1-2-3 y óptimo; esto es un formato vectorial perfecto del sistema.
6. **¿Chrome/Edge/Firefox de hace 3 años?** → 100% funcionando con Capa 3.

---

## 8. Fases de implementación (el plan final)

> **ESTADO: ✅ IMPLEMENTADO (8 ago 2026)** — las 8 fases completadas.

- **Fase A** ✅ — `scripts/convert-media.py` (genera WebP/AVIF/Opus de la Capa 3, al lado; solo si gana bytes; reporte `.opencode/temp/convert-media/report.json`; `--critical|--all|--audio|--dry-run|--limit N`). Resultados: 34 imágenes (4 críticos + 30 banners/flyers/thumbnails/covers, −36.32 MB) + 8 pistas MuziMania `.opus` 96k (4 nuevas).
- **Fase B** — ✅ `packages/cdn`: `deliveryVariants()` + `resolveDelivery()` (candidatos avif→webp→original en cadena; opus→original para audio; SVG/sin derivada = original) + componente `SmartImage` en `@ciszu/ui` (fallback onError escalón a escalón, SSR con 1ª variante).
- **Fase C** — ✅ Migración a `SmartImage` en 2 webs: Ciszuko (Navbar/Footer/Home/Projects, 4 rutas críticas) y CiszuBot (Navbar/Footer/Home, logotipos). El resto sigue con SVG (óptimo).
- **Fase D** — ✅ MIME maps actualizados en `upload-cdn.js`, `check-cdn-mimes.js` y `getContentType()` (`.avif/.webm/.opus/.flac/.wav/.m4a/.aac/.mov`); `cdn:upload` subió las derivadas (fin de la ñ → pre-existente inválida); `scripts/fix-cdn-mimes.js` (nuevo) re-subió 14 objetos con mimetype incorrecto; `cdn:verify` = **0 malos en 9.055 objetos**.
- **Fase E** — ✅ Opus 96k para las 8 pistas de MuzicMania (`genesis_neon/*`); extendible con `--audio`.
- **Fase F** — ✅ Tests (`packages/cdn/tests/cdn-delivery.test.ts`, 96/96 globales), builds 4/4 webs OK, docs y AGENTS.md actualizados.

> Nota CDN: los `InvalidKey 400` en archivos con `ñ`/espacios (ej. `flayer_vertical_diseñografico`, `ANIMACIÓN...mp4`) son un límite pre-existente de Supabase Storage en claves no-ASCII — no afecta a las derivadas nuevas.

> ⚠️ Para lanzarse: **solo Fases A-D** son necesarias hoy. La Fase E queda condicionada por análisis.
