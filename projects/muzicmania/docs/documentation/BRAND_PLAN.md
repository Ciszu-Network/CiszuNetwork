# BRAND_PLAN — Plan de Marca Visual de MuzicMania

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: BRAND_PLAN_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: plan de marca **visual** del juego de ritmo **MuzicMania**: diseño y
> variantes de logos, paleta neon del juego, tipografía, arrowskins, particleskins, portadas
> de álbumes musicales y reglas de maquetación del arte del juego (web + app Tauri).

---

## 1. Propósito y alcance

Este documento es la **biblia visual** de MuzicMania: centraliza el diseño de logos (isotipo
y logotipo), la paleta neon extendida, la tipografía (Exo_2, Rajdhani, Century Gothic), los
arrowskins (flechas de notas), los particleskins, las portadas de los álbumes musicales y las
reglas de uso del arte en la web (`muzicmania.vercel.app`), la app desktop (Tauri) y el
schema de datos. Se apoya en la marca matriz de `ciszu/docs/documentation/BRAND_PLAN.md` y en
los sistemas técnicos (`COLOR_SYSTEM.md`, `STYLES_SYSTEM.md`, `ICON_SYSTEM.md`).

Alcance: identidad visual del juego en todas sus superficies.

## 2. Identidad de la marca visual

| Dato | Valor |
|---|---|
| Nombre | MuzicMania |
| Marca matriz | Ciszu Network |
| Web | `muzicmania.vercel.app` |
| Paleta núcleo | Neon violeta/cian + brand azul |
| Tipografía web | Exo_2 (sans) + Rajdhani (header) + Century Gothic (accent) |
| Fondo | `#000000` / `#000617` (bg-darker) |

### 2.1 Propuesta visual

- Estética **neon inmersiva** (violeta/cian) sobre negro, con acentos musicales.
- Flechas de juego (arrowskins) con skins configurables por estilo.
- Álbumes musicales con portadas propias (`content/music/albums/`).

## 3. Diseño de logos

### 3.1 Piezas de marca

| Pieza | Descripción | Ubicación |
|---|---|---|
| **Isotipo** | Símbolo del juego (variantes color/degradado) | `content/logos/images/not-outline/isotype/` |
| **Logotipo** | Texto "muzicmania" (degradado color) | `content/logos/images/not-outline/logotype/` |

### 3.2 Nomenclatura de archivos

```
muzicmania_logo_isotipo_notoutline_degradado_color.{ai|png|svg}
muzicmania_logotipo_degradado_color.{ai|png|svg}
```

- `notoutline` = sin trazo (sobre fondos oscuros).
- Familia visual: `gradient` (degradado) con color.
- Formatos fuente: `.ai` (vector); entrega web: `.svg`/`.png`.

### 3.3 Variantes disponibles

| Pieza | Archivo |
|---|---|
| Isotipo degradado color | `muzicmania_logo_isotipo_notoutline_degradado_color.svg` |
| Logotipo degradado color | `muzicmania_logotipo_degradado_color.svg` |

### 3.4 Reglas del diseño del logo

- El logo sin trazo se usa sobre fondos oscuros del juego.
- Degradado reservado a piezas destacadas; en web preferir `.svg`.
- **Prohibido**: deformar, rotar, cambiar colores arbitrariamente o recomponer el símbolo.

## 4. Paleta de marca

Fuente completa: `COLOR_SYSTEM.md`. Paleta extendida del juego:

| Token | Hex | Uso |
|---|---|---|
| **Neon-violet** | `#7830d0` | Modos violeta |
| **Neon-sky** | `#56d5ff` | Variante cyan |
| **Neon-electric** | `#0099ff` | Eléctrico |
| **Neon-cyan** | `#68cfff` | Glow cyan, gradientes |
| **Neon-orange** | `#ff6600` | Avisos/energía |
| **Neon-yellow** | `#ffd900` | Estrellas/premios |
| **Neon-red** | `#ff0000` | Errores/danger |
| **Neon-green** | `#00ff88` | Éxito, puntos, validación |
| **Neon-purple** | `#4800ff` | Profundidad, violeta |
| **Brand** | `#233f92` | Color de marca |
| **Bg-dark** | `#000000` | Fondo principal |
| **Bg-darker** | `#000617` | Fondo más profundo (juego) |

Regla: **neon violeta/cian sobre negro** con acentos por estado (verde=éxito, rojo=error,
amarillo=estrellas).

## 5. Tipografía

| Tipo | Fuente | Uso |
|---|---|---|
| Sans (cuerpo) | **Exo_2** | `--font-sans` en `globals.css` |
| Header (títulos) | **Rajdhani** | `--font-header` en `globals.css` |
| Accent | **Century Gothic** | `--font-accent` (token propio del juego) |

- Cargadas con `next/font/google` (subset `latin`) y token `--font-century-gothic`.
- Century Gothic es el toque distintivo del juego (fuente en `shared/fonts/CenturyGothic.ttf`).

## 6. Multimedia y maquetación

### 6.1 Arrowskins (flechas de juego)

| Skin | Estilo | Ubicación |
|---|---|---|
| `default` | Flechas por defecto | `content/arrowskins/default/` |
| `default_round` | Redondeadas | `content/arrowskins/default_round/` |
| `default_simplify` | Simplificadas | `content/arrowskins/default_simplify/` |
| `circle` / `circle_full` | Circulares | `content/arrowskins/circle/`, `circle_full/` |
| `rectangle` / `rectangle_full` | Rectangulares | `content/arrowskins/rectangle/`, `rectangle_full/` |
| `header` / `header_full` | Header | `content/arrowskins/header/`, `header_full/` |
| `maniac` / `manic_round` | Maniac | `content/arrowskins/maniac/`, `manic_round/` |
| `stylish` / `stylish_round` | Stiloso | `content/arrowskins/stylish/`, `stylish_round/` |

- Cada skin incluye flechas (arriba/abajo/izquierda/derecha), estados `-press`/`-fail`,
  `hold-head`/`hold-tail`/`hold-trail` y `skin.json`.
- Formatos: `.svg` (y `.png` en `default`).

### 6.2 Particleskins

| Skin | Ubicación |
|---|---|
| `default` | `content/particleskins/default/` (`particle.png`, `particle.svg`, `skin.json`) |

### 6.3 Música y portadas

| Álbum | Pistas | Ubicación |
|---|---|---|
| **Genesis Neon** | `cyber_beat`, `digital_soul`, `neon_dreams`, `oled_darkness` | `content/music/albums/genesis_neon/` |

- Cada pista tiene `cover.png`/`cover.webp`, `banner.png`/`banner.webp`, `disc.svg`,
  `playlist.md/txt`, `license.md/txt` y el audio en `.mp3`/`.ogg`/`.opus`.
- La portada de cada álbum mantiene la paleta neon del juego.

### 6.4 Reglas de maquetación

- Los arrowskins se exportan como `.svg` + `skin.json` para el motor de juego.
- Las partículas siguen la estética neon (`.svg`/`.png`).
- Las portadas de álbumes usan la paleta del juego y formato `cover.webp` para web.
- Todo el contenido se sirve vía `@ciszunetwork/cdn`; no duplicar en `public/`.

## 7. Encabezado de marca

Fragmento reutilizable en piezas y documentos:

```
╔══════════════════════════════════════════════════════════════╗
║                     MUZICMANIA — JUEGO DE RITMO               ║
║                                                               ║
║  RED:         Ciszu Network                                   ║
║  WEB:         muzicmania.vercel.app                           ║
║  ACTUALIZACIÓN: [FECHA]                                        ║
╚══════════════════════════════════════════════════════════════╝
```

## 8. Tono y estilo de comunicación

| Aspecto | Regla |
|---|---|
| Idioma | Español |
| Tono | Energético, cercano, orientado a jugadores |
| Formalidad | Desenfadado en redes del juego; técnico en docs |
| Estética | Neon violeta/cian sobre negro con acentos musicales |
| Autoría | Desarrollo atribuido a Ciszuko Antony, nunca a IAs |
| Derechos | Créditos de canciones y material de terceros siempre visibles |

## 9. Checklist de diseño

- [ ] El logo usa variantes con contraste válido sobre el fondo destino.
- [ ] Los colores son de la paleta extendida del juego (`COLOR_SYSTEM.md` §2.1).
- [ ] La tipografía es Exo_2 (sans) + Rajdhani (header) + Century Gothic (accent).
- [ ] Los arrowskins incluyen todos los estados (`-press`/`-fail`, holds) y `skin.json`.
- [ ] Las portadas de álbumes mantienen la paleta y formato `cover.webp`.
- [ ] El contenido se sirve vía `@ciszunetwork/cdn`, no duplicado en `public/`.
- [ ] No se atribuye desarrollo a IAs.

## 10. FAQ

**¿Qué es un arrowskin?** Es el conjunto de flechas de juego (arriba/abajo/izquierda/derecha
y holds) con estados de presión/fallo; cada skin tiene su `skin.json`.

**¿Por qué Century Gothic?** Es la fuente accent distintiva del juego (token
`--font-accent`), que refuerza la estética musical junto a Exo_2 y Rajdhani.

**¿Dónde está la paleta completa?** En `COLOR_SYSTEM.md` §2.1 (paleta extendida MuzicMania).

**¿Dónde están las pistas?** En `content/music/albums/genesis_neon/` con portadas, banners,
`disc.svg`, playlists y licencias por pista.

## 11. Resumen ejecutivo

- Marca visual: neon violeta/cian sobre negro, con isotipo + logotipo en degradado.
- Tipografía: Exo_2 (sans) + Rajdhani (header) + Century Gothic (accent).
- Multimedia: arrowskins y particleskins configurables, portadas de álbumes musicales.
- Contenido servido vía `@ciszunetwork/cdn`.

_Última revisión: 2026-08-14._ Relacionado: `TAURI_SYSTEM.md`, `ICON_SYSTEM.md`,
`DOC_EXPORT_PROTOCOLS.md`, `README.md`.