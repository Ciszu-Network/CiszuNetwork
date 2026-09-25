# BRAND_PLAN — Plan de Marca Visual de Ciszuko Antony

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: BRAND_PLAN_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: plan de marca **visual** de **Ciszuko Antony** (Francisco García, alias
> Cisco/Ciszuko/Antony): diseño y variantes de logos, tipografía, paleta, banners, botones,
> marcos, GIFs animados y reglas de maquetación del arte del portfolio y las redes.

---

## 1. Propósito y alcance

Este documento es la **biblia visual** de la marca personal de Ciszuko Antony: centraliza el
diseño de los logos (isotipo y logotipo), la paleta, la tipografía, los banners (YouTube y
Reddit), botones de redes, marcos de cámara, GIFs animados y los sketches de diseño. Se apoya
en la marca matriz de `ciszu/docs/documentation/BRAND_PLAN.md` y en los sistemas técnicos
(`COLOR_SYSTEM.md`, `STYLES_SYSTEM.md`, `ICON_SYSTEM.md`) sin duplicarlos.

Alcance: identidad visual del creador en portfolio (`ciszukoantony.vercel.app`), redes
(Instagram, TikTok, YouTube, Twitch, X) y streaming (OBS).

## 2. Identidad de la marca visual

| Dato | Valor |
|---|---|
| Nombre | Francisco García (Ciszuko Antony) |
| Alias | Cisco, Ciszuko, Antony |
| Marca matriz | Ciszu Network |
| Web portfolio | `ciszukoantony.vercel.app` |
| Contacto | `ciszunetwork@outlook.com` |
| Paleta núcleo | Neon cyan/rosa sobre negro |
| Tipografía web | Exo_2 (sans) + Rajdhani (header) |

### 2.1 Propuesta visual

- Estética **neon** (cyan/rosa) sobre negro: inmersiva, gamer y streamer.
- Logos con trazo (`outline`) y sin trazo (`not-outline`) según superficie.
- Multimedia reutilizable: banners, botones, marcos y GIFs para todas las plataformas.

## 3. Diseño de logos

### 3.1 Piezas de marca

| Pieza | Descripción | Ubicación |
|---|---|---|
| **Isotipo** | Símbolo de la marca (variantes color/gradiente/monocromo) | `content/logos/images/{outline|not-outline}/isotype/` |
| **Logotipo** | Texto "ciszuko" (variantes full/simple) | `content/logos/images/{outline|not-outline}/logotype/` |
| **Sketches** | Bocetos de diseño del logo | `content/sketches/bocetoslogo.{ai,png}` |

### 3.2 Nomenclatura de archivos

```
ciszuko_logo_isotipo_outline_z{color|white|black}_c{color|white|black}.{ai|svg|png|webp}
ciszuko_logotipo_outline_{color|degradado|monocroma}_{full|simple}.{psd|png|webp}
```

- `z` = fondo, `c` = forma/contenido del logo.
- `outline` = con trazo; `not-outline` = sin trazo.
- Familias: `color`, `gradient` (degradado), `monochrome` (monocromo).
- Formatos fuente: `.ai` (vector) y `.psd` (edición); entrega web: `.svg`/`.png`/`.webp`.

### 3.3 Variantes disponibles

| Familia | Trazo | Ejemplos |
|---|---|---|
| Color | outline / not-outline | `ciszuko_logo_isotipo_outline_zcolor_ccolor.svg`, `zcolor_cwhite`, `zwhite_ccolor` |
| Gradiente | outline / not-outline | `ciszuko_logo_isotipo_degradado_outline_zcolor_cwhite.ai` |
| Monocromo | outline / not-outline | `ciszuko_logo_isotipo_outline_zblack_cblack.png`, `zwhite_cblack` |
| Logotipo full | outline / not-outline | `ciszuko_logotipo_outline_color_full.png` |
| Logotipo simple | outline / not-outline | `ciszuko_logotipo_outline_color_simple.png` |

### 3.4 Reglas del diseño del logo

- **Contraste garantizado**: siempre elegir una variante `z`/`c` válida para el fondo destino.
- **Trazo**: usar `outline` sobre fondos claros/neutros; `not-outline` sobre fondos oscuros.
- **Gradiente**: reservado para piezas destacadas; en web preferir `.svg` con el degradado
  integrado.
- **Espacio de seguridad**: margen mínimo equivalente a un módulo del isotipo.
- **Prohibido**: deformar, rotar, cambiar colores arbitrariamente, añadir sombras externas o
  recomponer el símbolo y el texto.

## 4. Paleta de marca

Fuente completa: `COLOR_SYSTEM.md`. Paleta visual de la marca personal:

| Token | Hex | Uso |
|---|---|---|
| **Neon-cyan** | `#68cfff` | Glow cyan, gradientes |
| **Neon-pink** | `#ff33cc` | Acento principal, highlights |
| **Neon-blue** | `#59b4ff` | Enlaces, bordes, glows azules |
| **Neon-purple** | `#4800ff` | Profundidad, violeta |
| **Neon-green** | `#00ff88` | Éxito, puntos, validación |
| **Brand** | `#233f92` | Color de marca (logo) |
| **Bg-dark** | `#000000` | Fondo principal |
| **Bg-darker** | `#050a14` | Fondo profundo del portfolio |

Regla: **neon cyan/rosa sobre negro**; cyan = tecnología/energía, rosa = creatividad/marca.

## 5. Tipografía

| Tipo | Fuente | Uso |
|---|---|---|
| Sans (cuerpo) | **Exo_2** | `--font-sans` en `globals.css` |
| Header (títulos) | **Rajdhani** | `--font-header` en `globals.css` |
| Identidad (logo) | **Geomanist** (marca matriz) | Logotipos y piezas de marca |

- Cargadas con `next/font/google` (subset `latin`) en `src/app/layout.tsx`.
- Variables `--font-exo2` y `--font-rajdhani` aplicadas en `<html className>`.

## 6. Multimedia y maquetación

### 6.1 Banners

| Asset | Ubicación | Uso |
|---|---|---|
| `banner.png` / `banner.psd` | `content/banners/images/` | Banner principal |
| `banner_rdt.png` / `banner_rdt.psd` | `content/banners/images/` | Banner Reddit |
| `banner_yt.png` / `banner_yt.psd` | `content/banners/images/` | Banner YouTube |

### 6.2 Botones de redes

| Botón | Servicio | Fuente |
|---|---|---|
| `button_discord.png/psd` | Discord | `content/buttons/` |
| `button_twitch.png/psd` | Twitch | `content/buttons/` |
| `button_youtube.png/psd` | YouTube | `content/buttons/` |
| `button_roblox.png/psd` | Roblox | `content/buttons/` |
| `button_shop.png/psd` | Tienda | `content/buttons/` |
| `button_site.png/psd` | Web | `content/buttons/` |
| `button_ social.png/psd` | Redes sociales | `content/buttons/` |
| `button_template.png/psd` | Plantilla base | `content/buttons/` |
| `suscribe.png/psd` | Suscripción | `content/buttons/` |

### 6.3 Marcos y layout

| Asset | Ubicación | Uso |
|---|---|---|
| `marco_camara_1.png/psd` | `content/layout/frames/` | Marco de cámara (streaming) |
| GIFs animados del logo | `content/video/gif/` | Animaciones del logo (trazado color/gradiente/monocromo) |
| Fondos de logo animados | `content/video/background/logotype/gradient/` | Fondo animado del logotipo |

### 6.4 Assets auxiliares

| Asset | Ubicación | Uso |
|---|---|---|
| `campanita.{ai,png,psd}` | `content/assets/` | Campanita de suscripción |
| `like.{ai,png,psd}` | `content/assets/` | Like de redes/videos |
| `youtube_canal.png` | `content/assets/` | Miniatura de canal |
| `images.jpe` | `content/assets/` | Imagen de apoyo |

### 6.5 Reglas de maquetación

- Exportar banners en el formato de la plataforma destino (YouTube, Reddit, Discord).
- Los botones se generan desde `button_template` manteniendo el mismo estilo y proporciones.
- Los marcos de cámara se reutilizan para streaming en OBS (escena de juego y música).
- Todo el multimedia se sirve vía `@ciszunetwork/cdn`; no duplicar en `public/`.

## 7. Encabezado de marca

Fragmento reutilizable en piezas y documentos:

```
╔══════════════════════════════════════════════════════════════╗
║              CISZUKO ANTONY — MARCA PERSONAL                  ║
║                                                               ║
║  NOMBRE:      Francisco Antonio (Ciszuko Antony)              ║
║  ALIAS:       Cisco, Ciszuko, Antony                          ║
║  RED:         Ciszu Network                                    ║
║  SOCIAL:      @itz.ciszukoant0nyz                             ║
║  ACTUALIZACIÓN: [FECHA]                                        ║
╚══════════════════════════════════════════════════════════════╝
```

## 8. Tono y estilo de comunicación

| Aspecto | Regla |
|---|---|
| Idioma | Español |
| Tono | Cercano, directo, con emojis y decoración visual en redes/streaming |
| Formalidad | Profesional en web; desenfadado en redes/streaming |
| Consistencia | Mismos alias y handles en todas las plataformas |
| Derechos | Respetar autores de canciones, memes y material de terceros |
| Autoría | Desarrollo atribuido a Ciszuko Antony, nunca a IAs |

## 9. Checklist de diseño

- [ ] El logo usa una variante `z`/`c` con contraste sobre el fondo.
- [ ] El logo respeta el espacio de seguridad y el tamaño mínimo.
- [ ] Los colores son de la paleta oficial (`COLOR_SYSTEM.md`).
- [ ] La tipografía es Exo_2 (sans) + Rajdhani (header); Geomanist solo en logos.
- [ ] Banners/botones/marcos siguen la maquetación de la sección 6.5.
- [ ] El multimedia se sirve vía `@ciszunetwork/cdn`, no duplicado en `public/`.
- [ ] Los `.ai`/`.psd` fuente se conservan; en web se entrega `.svg`/`.webp`.
- [ ] No se atribuye desarrollo a IAs.

## 10. FAQ

**¿Por qué hay logos con `outline` y `not-outline`?** El trazo (`outline`) mejora la
visibilidad sobre fondos claros; la versión sin trazo se usa sobre superficies oscuras.

**¿Qué significa `full` y `simple` en los logotipos?** `full` incluye el detalle completo;
`simple` es la versión reducida para usos pequeños.

**¿Dónde está el banner de YouTube?** `content/banners/images/banner_yt.png` (fuente
`banner_yt.psd`).

**¿Qué handle es el correcto para TikTok?** `@ciszukoantony` (fuente de las notas de marca);
la web puede referir `@ciszukoantonY` en la constante `SOCIALS`.

## 11. Resumen ejecutivo

- Marca visual: neon cyan/rosa sobre negro, con isotipo + logotipo en variantes
  color/gradiente/monocromo y trazo outline/not-outline.
- Tipografía web: Exo_2 (sans) + Rajdhani (header); Geomanist para logos.
- Multimedia: banners (principal/Reddit/YouTube), botones por red, marcos de cámara, GIFs
  animados y campanita/like.
- Todo el arte se sirve vía `@ciszunetwork/cdn`.

_Última revisión: 2026-08-14._ Relacionado: `PROMPTS_PLAN.md`, `STACK_SYSTEM.md`,
`ARCHITECTURE.md`, `README.md`.
