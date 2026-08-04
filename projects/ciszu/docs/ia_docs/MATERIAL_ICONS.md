# Material Icons & Product Icons — Investigación y aplicación en Ciszu Network

> Tarea del to-do: *"Investigar material icons y su estructura de formatos/folders para integrar en la organizacion actual posible."*
> Fecha: 4 ago 2026 · Fuentes primarias: `folderIcons.ts` y `fileIcons.ts` del repo `material-extensions/vscode-material-icon-theme` (v5.36.1, branch main).

## 1. Qué es cada cosa (diferencia clave)

| | **Material Icon Theme** | **Material Product Icons** |
|---|---|---|
| Extensión | `PKief.material-icon-theme` (34.5M installs) | `PKief.material-product-icons` (680K installs) |
| Qué pinta | Iconos de **archivos y carpetas** en el Explorer | Iconos de la **UI de VS Code** (activity bar, status bar, paneles) |
| Cómo se activa | File Icon Theme | Product Icon Theme (`workbench.productIconTheme`) |
| ¿Afecta estructura de carpetas? | **Sí — matchea por nombre** de carpeta/archivo | **No** — es puramente estética del editor |
| Base | Material Design icons (Google) | Material Design icons (Google) |

**Conclusión directa**: cuando hablamos de "nomenclatura correcta" de carpetas (`image` vs `imagen`), hablamos de **Material Icon Theme**. Product Icons no tiene reglas de nombres de carpetas: solo reemplaza los iconos del interfaz de VS Code. Si se usa, es opcional y sin impacto en el repo.

## 2. ¿Es una "regla real de la informática"?

**No.** Material Icon Theme no implementa un estándar oficial. Son **listas de strings** (alias) mantenidas por la comunidad en inglés:

- `folderNames: [...]` — nombres de carpeta que reciben un icono
- `fileExtensions: [...]` — extensiones que reciben un icono
- `fileNames: [...]` — nombres de archivo exactos

**El matching es por coincidencia exacta de string, en inglés.** No hay regex, no hay traducciones, no hay "español soportado". Una carpeta `imagen` simplemente no matchea ninguna entrada y cae en el icono genérico de carpeta.

La lista de alias crece por issues de la comunidad (hay 508 issues abiertos pidiendo iconos nuevos, p.ej. `datastructure` en #2721). No es normativo: **es una convención visual de navegación rápida**.

### ¿Merece la pena seguirlo a pie de letra?

**Parcialmente.** Argumentos en contra de obsesionarse:

- No rompe nada técnico: una carpeta `imagen` funciona idéntico en el código, el CDN y el resolver.
- Material Icons es un gusto personal del CEO; el repo no lo recomienda en `.vscode/extensions.json`.
- Renombrar carpetas existentes **rompe el CDN** (el bucket espeja rutas del repo) y los resolvers hardcodeados → coste alto.

Argumentos a favor de alinear:

- **Inglés = idioma del código** (consistencia con el resto del monorepo).
- **Sin espacios/acentos/guiones bajos** → rutas seguras en URLs y CDN. Este proyecto ya sufrió el bug de `not outline` (espacio) rompiendo `<img>` y preloads.
- Iconos diferenciados aceleran la navegación visual (el Explorer es la puerta de entrada al repo).
- Convención inglesa = estándar de facto en la industria (si mañana entra un dev, entenderá `images` al instante; `imagen` o `thumbails` le confunden).

## 3. Análisis del repo actual (qué matchea y qué no)

### 3.1 Carpetas de `projects/*/content/` — estado real

| Carpeta en el repo | ¿Reconocida por Material? | Icono que recibe | Observación |
|---|---|---|---|
| `imagen` (15x) | ❌ NO | carpeta genérica | La correcta sería `image`, `images`, `picture(s)`, `photo(s)`, `img`, `pics` — **todas** matchean `folder-images` |
| `video` (15x) | ✅ SÍ | `folder-video` | también `videos`, `movie`, `media` |
| `logos` (5x) | ❌ NO | genérica | no existe icono de "logos" |
| `banners` (4x) | ❌ NO | genérica | no existe icono de "banners" |
| `thumbails` (4x) | ❌ NO | genérica | **typo** de `thumbnails` (que tampoco tiene icono propio) |
| `flayers` (3x) | ❌ NO | genérica | **typo** de `flyers` |
| `bocetos` (3x) | ❌ NO | genérica | en inglés: `sketch(es)`, `draft(s)`, `concept(s)` → **sí** matchean `folder-mock` |
| `resources` (3x) | ✅ SÍ | `folder-resource` | también `asset(s)`, `static` |
| `assets` (1x) | ✅ SÍ | `folder-resource` | |
| `media` (1x) | ✅ SÍ | `folder-video` | |
| `music` (1x) | ✅ SÍ | `folder-audio` | también `audio`, `song(s)`, `sound(s)` |
| `icons` (1x) | ✅ SÍ | `folder-images` | (los iconos UI cuentan como imágenes) |
| `arrowskins`/`particleskins` | ❌ NO | genérica | no existe icono de skins |
| `mc_skin` | ❌ NO | genérica | |
| `gif` / `gifs` | ❌ NO | genérica | solo como extensión de archivo matchea |
| `muestras` | ❌ NO | genérica | en inglés `samples` (no existe); `examples` **sí** matchea `folder-examples` |
| `layaout` (1x) | ❌ NO | genérica | **typo** de `layout` → el correcto **sí** matchea `folder-layout` |
| `contorn` | ❌ NO | genérica | typo de `contorno` |
| `persons` | ❌ NO | genérica | |
| `not outline` / `not_outline` | ❌ NO | genérica | inconsistente: unos con espacio, otros con guion bajo |
| `outline` / `filled` | ❌ NO | genérica | dentro de `shared/icons/svg/` (la carpeta `svg` sí matchea) |
| `bocetos` | ❌ NO | genérica | → `sketch`/`concept`/`draft` matchean `folder-mock` |
| `long videos` | ❌ NO | genérica | espacio en el nombre (ya causó bugs de rutas) |
| `__MACOSX` | ❌ NO | genérica | basura de zip de macOS |

### 3.2 Formatos de archivo (fileIcons)

| Extensión | ¿Cubierta? | Icono |
|---|---|---|
| `.png .jpg .jpeg .gif .ico .tif .avif .bmp .webp` | ✅ | `image` |
| `.svg` | ✅ | `svg` |
| `.mp4 .mov .avi .mkv .ogg .webm` | ✅ | `video` |
| `.mp3 .flac .wav .aac .ogg` | ✅ | `audio` |
| `.ttf .otf .woff .woff2 .eot` | ✅ | `font` |
| `.json .md .txt .pdf .docx .doc` | ✅ | `json`, `markdown`, `document`, `pdf`, `word` |
| `.log` | ✅ | `log` |
| `.ai` | ✅ | `adobe-illustrator` |
| `.psd` | ✅ | (bloque Adobe) |
| `.pdn` (Paint.NET) | ✅ | dentro de `image` |
| `.wfp` | ✅ | dentro de `image` |
| `.pfl` | ❌ NO | genérico — formato de font (FontLab?) |
| `.drp` (DaVinci Resolve) | ❌ NO | genérico |
| `.xcf` (GIMP) | ✅ | dentro de `image` |

**Veredicto formatos**: los formatos reales del proyecto están bien cubiertos. Solo `.pfl` y `.drp` (formas de trabajo internas) quedan como genéricos — irrelevante.

## 4. Estrategia recomendada (sin romper nada)

### Principio rector
**No renombrar carpetas existentes** (rompe CDN + resolver + mirrors). **Solo actuar sobre carpetas nuevas** y **mascarar lo existente con asociaciones custom**.

### 4.1 Configuración custom en `.vscode/settings.json` (raíz)

Material Icon Theme permite mapear cualquier nombre custom a un icono existente:

```json
"material-icon-theme.folders.associations": {
    "imagen": "images",
    "thumbails": "images",
    "flayers": "images",
    "banners": "images",
    "logos": "images",
    "bocetos": "mock",
    "muestras": "examples",
    "layaout": "layout",
    "mc_skin": "theme",
    "arrowskins": "theme",
    "particleskins": "theme",
    "gif": "images",
    "gifs": "images"
}
```

Con esto, **sin mover un solo archivo**, el Explorer pinta los iconos correctos (imagenes, bocetos, layout...). Los typos (`thumbails`, `flayers`, `layaout`) quedan camuflados visualmente hasta que se renombren con calma.

### 4.2 Convención para carpetas NUEVAS (regla de oro)

| Evitar (español/typos/espacios) | Usar (reconocido/estándar) |
|---|---|
| `imagen` | `image` o `images` |
| `thumbails` | `thumbnails` (o `images`) |
| `flayers` | `flyers` |
| `layaout` | `layout` |
| `bocetos` | `sketch` / `sketches` |
| `muestras` | `examples` / `samples` |
| `not outline` (espacio) | `outline-off` o similar sin espacio |
| `long videos` (espacio) | `long-videos` |

Regla general: **minúsculas, inglés, sin espacios, sin acentos, sin guiones bajos** (kebab-case si hace falta separar). Esto además previene bugs de `encodePath()`/CDN.

### 4.3 Opcional: recomendar el theme en `.vscode/extensions.json`

Añadir `"PKief.material-icon-theme"` a las recommendations (y `PKief.material-product-icons` si se quiere la UI en Material). Así cualquier dev futuro que abra el repo lo verá sugerido.

## 5. Respuesta directa a las dudas del CEO

> **"¿imagen no es reconocido, la nomenclatura correcta sería image/images/picture/pictures?"**
> Correcto. `folder-images` matchea exactamente: `image, images, img, imgs, ico, icos, icon, icons, pic, pics, picture, pictures, photo, photos, photograph(s), figure(s), fig(s), screenshot(s), texture(s)`. `imagen` (español) no está en la lista.

> **"¿Es necesario seguirlo a pie de letra? ¿Estoy mal? ¿Podemos ignorarlo?"**
> No estás mal y **no es obligatorio** — no hay ninguna regla informática detrás, es una convención visual comunitaria en inglés. **Ignorarlo es legítimo**; lo único que pierdes es el icono visual y la consistencia con el idioma del código. Lo que NO se debe ignorar es la parte estructural real: **sin espacios/acentos en rutas** (por CDN y URLs) — eso sí tiene consecuencias técnicas (bug ya sufrido con `not outline`).

> **"¿Product icons también tiene reglas de carpetas?"**
> No. Product Icons solo pinta la UI de VS Code (botones, activity bar). No matchea carpetas ni archivos.

> **"¿En un punto de vista raíz estamos perdiendo algo?"**
> A nivel raíz el repo está bien estructurado (`projects/`, `packages/`, `scripts/`, `shared/`, `apis/`, `archives/`) y esas carpetas **sí** matchean iconos existentes (`packages` ✅, `scripts` ✅, `shared` ✅, `apis` ≈ `api` ✅, `projects` ✅, `docs` ✅). Los puntos flacos están en el nivel de `content/` (ver tabla 3.1).

## 6. Acciones concretas propuestas

- [ ] Añadir `material-icon-theme.folders.associations` al `.vscode/settings.json` raíz (bloque 4.1)
- [ ] Añadir `PKief.material-icon-theme` (+ opcional `PKief.material-product-icons`) a `.vscode/extensions.json`
- [ ] Aplicar la regla de oro (4.2) SOLO a carpetas nuevas; no renombrar las existentes
- [ ] (Baja prioridad) Renombrar typos de carpetas existentes (`thumbails→thumbnails`, `flayers→flyers`, `layaout→layout`) **solo** en el próximo ciclo de re-upload del CDN, con re-verificación de referencias en código (`assetResolver.resolve`, `copy-assets.js`)

## 7. Fuentes

- Marketplace: `PKief.material-icon-theme` (v5.36.1) — docs de associations/customClones
- `folderIcons.ts` (1449 líneas) — lista oficial de `folderNames`
- `fileIcons.ts` — lista oficial de `fileExtensions`/`fileNames`
- Repo Product Icons: `material-extensions/vscode-material-product-icons`
- Issue #2721 — ejemplo de proceso de request de iconos (comunidad, no estándar)
