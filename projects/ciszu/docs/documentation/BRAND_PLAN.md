# BRAND_PLAN — Plan de Marca Visual del Ecosistema (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: BRAND_PLAN_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: plan de marca **visual** del ecosistema Ciszu Network: diseño de logos
> (isologos, isotipos, logotipos, imagotipos), paleta, tipografía, multimedia (banners,
> flyers, thumbnails), maquetación y reglas de uso del arte en webs, bot, juego y
> comunidades.

---

## 1. Propósito y alcance

Este documento es la **biblia visual de marca** del ecosistema: centraliza el diseño de los
logos, las tipografías, la paleta, los banners, flyers y demás multimedia que se sirven vía
`@ciszunetwork/cdn`. Complementa a `COLOR_SYSTEM.md` (paleta técnica y tokens), `STYLES_SYSTEM.md`
(tipografías y estilos web) e `ICON_SYSTEM.md` (iconografía) sin duplicarlos: aquí se define
**qué se diseña y cómo**; allí, los **cómo técnicos**.

Alcance: marca principal (Ciszu Network) y las marcas locales (Ciszuko Antony, MuzicMania,
CiszuBot, CiszuGamens), cada una con su propio `BRAND_PLAN.md`. Este doc es la fuente maestra
de la que derivan todas.

## 2. Arquitectura de marca

Cada proyecto tiene su propia marca visual, derivada de la identidad matriz:

| Proyecto | Tipo de marca | Paleta núcleo | Fuente principal | Doc local |
|---|---|---|---|---|
| **Ciszu Network** | Ecosistema/hub | Brand `#233f92` + neon cyan/rosa | IBM Plex + Condensed | Este doc |
| **Ciszuko Antony** | Marca personal | Neon cyan/rosa sobre negro | Exo_2 + Rajdhani | `BRAND_PLAN.md` propio |
| **MuzicMania** | Juego de ritmo | Neon violeta/cian + brand | Exo_2 + Rajdhani + Century Gothic | `BRAND_PLAN.md` propio |
| **CiszuBot** | Bot de Discord | Brand azul + surface claro | Inter + Exo_2 | `BRAND_PLAN.md` propio |
| **CiszuGamens** | Comunidad social | Azul/púrpura + neon | — | `BRAND_PLAN.md` propio |

### 2.1 Jerarquía

```
Ciszu Network (marca matriz / hub)
├── Ciszuko Antony  → marca personal del creador
├── MuzicMania      → marca de producto (juego)
├── CiszuBot        → marca de producto (bot)
└── CiszuGamens     → marca de comunidad
```

## 3. Diseño de logos

### 3.1 Terminología

| Término | Significado |
|---|---|
| **Isotipo** | Solo el símbolo/ícono de la marca |
| **Logotipo** | Solo el texto/letras de la marca |
| **Isologo** | Símbolo + texto integrados en una pieza |
| **Imagotipo** | Símbolo + texto como composición separada/alineada |

### 3.2 Sistemas de nomenclatura de archivos

Los logos se almacenan con un esquema consistente por proyecto en `content/logos/images/`:

```
{outline|not-outline}/{isotype|logotype|imagotype}/{color|gradient|monochrome}/
  {marca}_logo_{tipo}_{trazo}_z{fondo}_c{color}.[ai|psd|png|svg|webp]
```

Reglas del nombre:
- `z` = color de **zona/fondo**; `c` = color del **contenido/forma** (p. ej. `zblack_cwhite`).
- `outline` = logo con trazo/filo; `not-outline` = sin trazo.
- Variantes por familia: `color`, `gradient` (degradado), `monochrome` (monocromo).
- Formatos fuente: `.ai` (vector) y `.psd` (edición); entrega: `.png`, `.svg`, `.webp`.

### 3.3 Tipos por proyecto

| Proyecto | Piezas principales | Ejemplo real de archivo |
|---|---|---|
| Ciszu Network | Isotipo + logotipo (outline/not-outline, color/gradient/monocromo) | `ciszu_logo_isotipo_outline_zcolor_ccolor.svg` |
| Ciszuko Antony | Isotipo, logotipo (full/simple), muestras de fondo | `ciszuko_logotipo_outline_color_full.psd` |
| MuzicMania | Logos de juego, arrowskins, backgrounds | `content/arrowskins/*`, `content/logos/*` |
| CiszuBot | Isotipo, logotipo (color/gradient/monocromo), imagotipo | `ciszubot_logotipo_outline_color.svg` |
| CiszuGamens | Imagotipo horizontal, isotipo en combinaciones | `ciszugamens_logo_imagotipo_not_outline_isotipo_zblue_cpurple_logotipo_color.png` |

### 3.4 Reglas del diseño de logos

- **Simetría y trazo**: el trazo (`outline`) se usa para fondos claros y visibilidad; la
  variante `not-outline` para superficies oscuras.
- **Fondo vs. forma**: cada logo existe en combinaciones `zcolor/cwhite`, `zwhite/ccolor`,
  `zblack/cwhite`, `zwhite/cblack`, `zcolor/ccolor` para garantizar contraste en cualquier
  superficie.
- **Espacio de seguridad**: mantener un margen mínimo de seguridad equivalente al ancho de
  un módulo del isotipo alrededor del logo.
- **Tamaño mínimo**: el isotipo no debe usarse por debajo del tamaño mínimo de legibilidad
  del trazo; por debajo de él usar solo isotipo, nunca logotipo ilegible.
- **Prohibido**: deformar, rotar, cambiar colores de forma arbitraria, añadir sombras
  externas o re-componer los elementos del logo.

## 4. Paleta de marca

Fuente completa y tokens: `COLOR_SYSTEM.md`. Resumen visual:

| Token | Hex | Uso en marca |
|---|---|---|
| **Brand** | `#233f92` | Color principal de logo y marca |
| **Brand-light** | `#3a6bf0` | Hover/acento brand |
| **Brand-accent** | `#4a7dff` | Acentos de marca |
| **Neon-cyan** | `#68cfff` | Glow cyan, gradientes |
| **Neon-pink** | `#ff33cc` | Acento principal, highlights |
| **Neon-blue** | `#59b4ff` | Enlaces, bordes, glows azules |
| **Neon-green** | `#00ff88` | Éxito, puntos, validación |
| **Neon-purple** | `#4800ff` | Profundidad, violeta |
| **Bg-dark** | `#000000` | Fondo principal de webs |
| **Surface** | `#ffffff` | Superficies (tema claro CiszuBot) |

Regla de marca visual: **neon cyan/rosa sobre negro**. El cyan representa la tecnología y la
energía; el rosa, la creatividad y la marca personal; el negro, la base inmersiva de juego.

## 5. Tipografía

### 5.1 Fuentes de marca vs. fuentes de producto

| Tipo | Fuentes | Uso |
|---|---|---|
| Identidad/logo | **Geomanist** | Logotipos y piezas de marca (identidad principal) |
| Web principal (ciszunetwork) | **IBM Plex Sans + IBM Plex Sans Condensed** | `next/font/google` en `layout.tsx` |
| Portfolio (ciszukoantony) | **Exo_2** (sans) + **Rajdhani** (header) | `next/font/google` en `layout.tsx` |
| MuzicMania | **Exo_2** + **Rajdhani** (header) + **Century Gothic** (accent) | `next/font/google` + token `--font-accent` |
| CiszuBot | **Inter** (sans) + **Exo_2** (header) | `next/font/google` en `layout.tsx` |

### 5.2 Reglas tipográficas

- Las webs cargan fuentes con `next/font/google`, subset `latin`, variables
  `--font-*` definidas en `globals.css` (`--font-sans`, `--font-header`, `--font-accent`).
- La fuente Geomanist es de **identidad** (logo y arte), no de contenido web.
- El peso/bold se define por token (`--font-header` para `h1..h4`).
- Prohibido mezclar familias ajenas al sistema de cada web.

## 6. Multimedia y maquetación

### 6.1 Inventario por proyecto

| Proyecto | Banners | Flyers | Thumbnails | Otros |
|---|---|---|---|---|
| **Ciszu Network** | `banner.png`, `banner_subs.png` (+`.webp`/`.psd`) | Flyers verticales (branding, curriculum, discord, diseño gráfico, eventos/torneos, ilustración, minecraft, ofimática) en `.png`/`.webp`/`.avif` | — | Botones de redes en `content/buttons` |
| **Ciszuko Antony** | `banner.png`, `banner_rdt.png`, `banner_yt.png` (+`.psd`) | — | — | Botones (discord, roblox, shop, site, twitch, youtube, suscribe), marcos de cámara (`content/layout/frames`), GIFs animados del logo |
| **MuzicMania** | — | — | — | Arrowskins (`content/arrowskins`), skins de flechas, backgrounds, characters |
| **CiszuBot** | `banner.png`, `banner.webp` | `flayer_ (1-3).png/webp` | `thumbnail.png/webp` | Muestras de fondo, círculo, contorno |
| **CiszuGamens** | `bannerdc.png/psd` + video banner (`ciszugamens_video_banner.mp4`/`.gif`) | — | — | Iconos de roles (`content/icons/*.png`), logos imagotipo |

### 6.2 Formatos de entrega

| Formato | Uso |
|---|---|
| `.ai` / `.psd` | Fuente editable (solo proyecto) |
| `.svg` | Vector web (logos, iconos) |
| `.png` | Raster con transparencia (banners, flyers, thumbnails) |
| `.webp` / `.avif` | Web optimizada |
| `.mp4` / `.gif` | Video/banners animados (CiszuGamens) |

### 6.3 Reglas de maquetación

- **Banners**: usar el formato de cada plataforma (YouTube `banner_yt`, Reddit `banner_rdt`,
  Discord `bannerdc`); exportar también `.webp` para web.
- **Flyers verticales**: composición vertical con la paleta del proyecto; nombre de archivo
  `ciszu_flayer_vertical_<servicio>.{avif,png,webp}`.
- **Botones**: un botón por servicio (`button_discord`, `button_twitch`, …) con plantilla
  base `button_template`; exportar `.psd` fuente + `.png`.
- **Thumbnails**: `thumbnail.png` + `.webp`; PSD fuente para reutilizar.
- Todo el contenido multimedia se sirve vía `@ciszunetwork/cdn`; no duplicar en `public/`.

## 7. Cabecera visual de marca

Fragmento reutilizable en piezas gráficas y documentos:

```
╔══════════════════════════════════════════════════════════════╗
║               CISZU NETWORK — ECOSISTEMA DIGITAL              ║
║                                                               ║
║  CREADOR:     Ciszuko Antony (Francisco García)               ║
║  RED:         Ciszu Network                                   ║
║  WEB:         ciszunetwork.vercel.app                         ║
║  ACTUALIZACIÓN: [FECHA]                                        ║
╚══════════════════════════════════════════════════════════════╝
```

## 8. Reglas de uso del arte

### 8.1 Logos

- Usar siempre una variante con contraste válido (`z`/`c`) sobre el fondo destino.
- Preferir `.svg` en web; `.png` cuando se necesite raster; conservar `.ai`/`.psd` como fuente.
- No alterar proporciones, colores ni trazo de los logos oficiales.

### 8.2 Banners y flyers

- Mantener la paleta oficial de cada marca (remitir a la sección 4 y a cada `BRAND_PLAN.md`).
- Incluir el encabezado/cabecera de marca cuando aplique (sección 7).
- Exportar en los formatos de la sección 6.2 según destino.

### 8.3 Contenido y derechos

- El arte generado con IA se produce según `ART_PROTOCOLS.md` (plantillas, prompts, corte de
  fondo); la autoría pública siempre es de Ciszuko Antony.
- Créditos de canciones y material de terceros siempre visibles en las piezas.
- Emojis permitidos en piezas de marca/redes/comunidad, prohibidos en docs técnicos.

## 9. Checklist de diseño

- [ ] El logo usa una variante `z`/`c` con contraste sobre el fondo.
- [ ] El logo respeta el espacio de seguridad y el tamaño mínimo.
- [ ] Los colores son de la paleta oficial (`COLOR_SYSTEM.md`).
- [ ] La tipografía es la asignada a la web/pieza (sección 5).
- [ ] Banners/flyers/thumbnails siguen la maquetación de la sección 6.3.
- [ ] El multimedia se sirve vía `@ciszunetwork/cdn`, no duplicado en `public/`.
- [ ] No se atribuye desarrollo a IAs.
- [ ] Los `.ai`/`.psd` fuente se conservan; en web se entrega `.svg`/`.webp`.

## 10. FAQ

**¿Por qué Geomanist no está en las webs?** Geomanist es la fuente de **identidad/logo**; las
webs usan tipografías de producto optimizadas (IBM Plex, Exo_2, Rajdhani, Inter, Century
Gothic) para legibilidad web.

**¿Dónde está la paleta completa?** En `COLOR_SYSTEM.md` (tokens, gradientes, sombras). Este
doc resume solo los colores de marca visual.

**¿Qué significa `zcolor_ccolor` en los nombres de logos?** `z` es el fondo y `c` el contenido
de la pieza; `zcolor_ccolor` = fondo con color de marca + forma con color de marca.

**¿Dónde está el logo de MuzicMania?** En `muzicmania/content/logos/`; su marca visual se
detalla en su propio `BRAND_PLAN.md`.

## 11. Resumen ejecutivo

- Marca visual: neon cyan/rosa sobre negro, logo brand `#233f92`, fuente de identidad Geomanist.
- Logos en variantes `outline/not-outline` × `color/gradient/monochrome` × `z/c`.
- Tipografías por web: IBM Plex (hub), Exo_2/Rajdhani (portfolio), Century Gothic (juego),
  Inter/Exo_2 (bot).
- Multimedia centralizado en `content/` de cada proyecto y servido vía `@ciszunetwork/cdn`.

_Última revisión: 2026-08-14._ Relacionado: `COLOR_SYSTEM.md`, `STYLES_SYSTEM.md`,
`ICON_SYSTEM.md`, `ART_PROTOCOLS.md`, `ARCHITECTURE.md`, `README.md`.