# BRAND_PLAN — Plan de Marca Visual de CiszuBot

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: BRAND_PLAN_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: plan de marca **visual** de **CiszuBot**: diseño y variantes de logos,
> paleta, tipografía, banners, flyers, thumbnails y reglas de maquetación del arte del bot de
> Discord y su landing web (`ciszubot.vercel.app`).

---

## 1. Propósito y alcance

Este documento es la **biblia visual** de CiszuBot: centraliza el diseño de logos (isotipo y
logotipo), la paleta (brand azul + tema claro), la tipografía (Inter + Exo_2), los banners,
flyers, thumbnails y muestras de logo. Se apoya en la marca matriz de
`ciszu/docs/documentation/BRAND_PLAN.md` y en los sistemas técnicos (`COLOR_SYSTEM.md`,
`STYLES_SYSTEM.md`).

Alcance: identidad visual del bot en la landing web, Discord (avatar, invitación) y piezas de
promoción.

## 2. Identidad de la marca visual

| Dato | Valor |
|---|---|
| Nombre | CiszuBot |
| Marca matriz | Ciszu Network |
| Web | `ciszubot.vercel.app` |
| Paleta núcleo | Brand `#233f92` / cian `#007bc0` + surface claro |
| Tipografía web | Inter (sans) + Exo_2 (header) |
| Tema | Oscuro en web (neon sobre negro) con variante clara (bot) |

### 2.1 Propuesta visual

- Logos basados en el logo oficial: **azul `#233f92`** y **cian `#007bc0`**.
- El bot combina identidad de marca (azul) con la estética neon del ecosistema.
- Piezas promocionales: banner, flyers (3) y thumbnail para la landing.

## 3. Diseño de logos

### 3.1 Piezas de marca

| Pieza | Descripción | Ubicación |
|---|---|---|
| **Isotipo** | Símbolo del bot (variantes color/monocromo) | `content/logos/images/not-outline/isotype/` |
| **Logotipo** | Texto "ciszubot" (color/gradiente/monocromo) | `content/logos/images/not-outline/logotype/` |
| **Imagotipo** | Isotipo + logotipo horizontal sobre fondo | `content/logos/images/samples/background/imagotype/horizontal/` |

### 3.2 Nomenclatura de archivos

```
ciszubot_logotipo_outline_{color|degradado|black|white}.{ai|svg|png}
ciszubot_logo_isotipo_{color|monocroma}.png
```

- `outline` = con trazo; `not-outline` = sin trazo.
- Familias: `color`, `gradient` (degradado), `monochrome` (black/white).
- Formatos fuente: `.ai` (vector); entrega web: `.svg`/`.png`/`.webp`.

### 3.3 Variantes disponibles

| Familia | Ejemplos |
|---|---|
| Isotipo color | `ciszubot_logo_isotipo_color.png` |
| Isotipo monocromo | `ciszubot_logo_isotipo_monocroma.png` |
| Logotipo color | `ciszubot_logotipo_outline_color.svg` |
| Logotipo gradiente | `ciszubot_logotipo_outline_color.svg` (degradado) |
| Logotipo monocromo | `ciszubot_logotipo_outline_black.svg`, `ciszubot_logotipo_outline_white.svg` |
| Imagotipo horizontal | `ciszubot_outline_color.png` (sobre fondo) |

### 3.4 Reglas del diseño del logo

- **Contraste garantizado**: variantes black/white para fondos claros/oscuros.
- **Trazo**: `outline` para visibilidad; `not-outline` para superficies planas.
- **Muestras**: el logotipo horizontal (`imagotype/horizontal/`) se usa en cabeceras.
- **Prohibido**: deformar, rotar, cambiar colores arbitrariamente o recomponer el símbolo.

## 4. Paleta de marca

Fuente completa: `COLOR_SYSTEM.md`. Paleta visual del bot:

| Token | Hex | Uso |
|---|---|---|
| **Brand** | `#233f92` | Color principal de marca (logo) |
| **Brand-light** | `#3a6bf0` | Hover/acento brand |
| **Brand-accent** | `#4a7dff` | Acentos de marca |
| **Brand-dark** | `#1a2e6b` | Fondos brand oscuros |
| **Neon-blue** | `#59b4ff` | Enlaces, bordes, glows azules |
| **Neon-cyan** | `#68cfff` | Glow cyan, gradientes |
| **Neon-pink** | `#ff33cc` | Acento principal, highlights |
| **Surface** | `#ffffff` | Superficies (tema claro del bot) |
| **Ink** | `#1b2234` | Texto principal (claro) |
| **Muted** | `#5a6478` | Texto secundario |
| **Bg-dark** | `#000000` | Fondo principal (web) |

Regla: **brand azul + cian como base del bot**; la web mantiene la estética neon sobre negro.

## 5. Tipografía

| Tipo | Fuente | Uso |
|---|---|---|
| Sans (cuerpo) | **Inter** | `--font-sans` en `globals.css` |
| Header (títulos) | **Exo_2** | `--font-header` en `globals.css` |

- Cargadas con `next/font/google` (subset `latin`) en `src/app/layout.tsx`.
- Variables `--font-inter` y `--font-space-grotesk` aplicadas en `<html className>`
  (token header referenciado como `--font-exo2` en `globals.css`).

## 6. Multimedia y maquetación

### 6.1 Banners

| Asset | Ubicación | Uso |
|---|---|---|
| `banner.png` | `content/banners/` | Banner de la landing |
| `banner.webp` | `content/banners/` | Banner optimizado para web |

### 6.2 Flyers

| Asset | Ubicación | Uso |
|---|---|---|
| `flayer_ (1).png/webp` | `content/flyers/images/` | Flyer promocional 1 |
| `flayer_ (2).png/webp` | `content/flyers/images/` | Flyer promocional 2 |
| `flayer_ (3).png/webp` | `content/flyers/images/` | Flyer promocional 3 |

### 6.3 Thumbnails

| Asset | Ubicación | Uso |
|---|---|---|
| `thumbnail.png` / `thumbnail.psd` | `content/thumbnails/images/` | Miniatura de la landing |
| `thumbnail.webp` | `content/thumbnails/images/` | Miniatura optimizada |

### 6.4 Muestras de logo

| Muestra | Ubicación |
|---|---|
| Imagotipo horizontal sobre fondo | `content/logos/images/samples/background/imagotype/horizontal/` |
| Isotipo sobre fondo | `content/logos/images/samples/background/isotype/` |
| Isotipo en círculo | `content/logos/images/samples/circle/` |
| Isotipo con contorno | `content/logos/images/samples/contour/` |

### 6.5 Reglas de maquetación

- Banners y thumbnails se exportan en `.png` y `.webp` (web optimizada).
- Los flyers mantienen el estilo de marca y la paleta del bot.
- El imagotipo horizontal se usa en cabeceras y piezas de ancho completo.
- Todo el contenido se sirve vía `@ciszunetwork/cdn`; no duplicar en `public/`.

## 7. Encabezado de marca

Fragmento reutilizable en piezas y documentos:

```
╔══════════════════════════════════════════════════════════════╗
║                      CISZUBOT — BOT DE DISCORD                ║
║                                                               ║
║  RED:         Ciszu Network                                   ║
║  WEB:         ciszubot.vercel.app                             ║
║  ACTUALIZACIÓN: [FECHA]                                        ║
╚══════════════════════════════════════════════════════════════╝
```

## 8. Tono y estilo de comunicación

| Aspecto | Regla |
|---|---|
| Idioma | Español |
| Tono | Cercano, directo, orientado a usuarios de Discord |
| Formalidad | Profesional en la landing; desenfadado en Discord |
| Estética | Brand azul/cian sobre negro (web) con variante clara |
| Autoría | Desarrollo atribuido a Ciszuko Antony, nunca a IAs |
| Derechos | Respetar derechos de autores y material de terceros |

## 9. Checklist de diseño

- [ ] El logo usa una variante con contraste sobre el fondo destino.
- [ ] Los colores son de la paleta oficial (`COLOR_SYSTEM.md`).
- [ ] La tipografía es Inter (sans) + Exo_2 (header).
- [ ] Banners/flyers/thumbnails siguen la maquetación de la sección 6.5.
- [ ] El multimedia se sirve vía `@ciszunetwork/cdn`, no duplicado en `public/`.
- [ ] Los `.ai`/`.psd` fuente se conservan; en web se entrega `.svg`/`.webp`.
- [ ] No se atribuye desarrollo a IAs.

## 10. FAQ

**¿Por qué el bot tiene tema claro y la web oscuro?** El bot usa superficie clara (Surface +
Ink) para la legibilidad en Discord; la landing web mantiene la estética neon sobre negro del
ecosistema.

**¿Qué es el imagotipo?** La composición horizontal de isotipo + logotipo sobre fondo
(`content/logos/images/samples/background/imagotype/horizontal/`).

**¿Dónde está la paleta completa?** En `COLOR_SYSTEM.md` (tokens brand, neon y fondos).

## 11. Resumen ejecutivo

- Marca visual: brand azul `#233f92` + cian `#007bc0`; web neon sobre negro.
- Tipografía: Inter (sans) + Exo_2 (header).
- Multimedia: banner, 3 flyers, thumbnail y muestras de logo (fondo/círculo/contorno).
- Contenido servido vía `@ciszunetwork/cdn`.

_Última revisión: 2026-08-14._ Relacionado: `ARCHITECTURE.md`, `STACK_SYSTEM.md`,
`WORKFLOW_SYSTEM.md`, `DISCORD_SECURITY_PROTOCOLS.md`, `README.md`.
