# BRAND_PLAN — Identidad Visual (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: BRAND_PLAN_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Identidad visual completa de CiszuGamens: paleta, tipografía, logos, assets y reglas de uso.

## Paleta de colores

| Color | Hex | Uso | Contexto |
|---|---|---|---|
| **Cian principal** | `#22d3ee` | Acento primario | Botones, links, focus, badge "AD" |
| **Cian oscuro** | `#06b6d4` | Hover/active | Estados interactivos |
| **Púrpura gaming** | `#a855f7` | Acento secundario | Gradientes, badges especiales |
| **Negro puro** | `#000000` | Fondo principal | Background web, modales |
| **Gris oscuro** | `#0b0e14` | Superficies | Cards, modales, inputs |
| **Blanco** | `#ffffff` | Texto principal | Headings, body text |
| **Gris neutro** | `#71717a` | Texto secundario | Descripciones, meta |

## Tipografía

| Fuente | Uso | Fuente fallback |
|---|---|---|
| **Geomanist** | Headings, branding | `system-ui, sans-serif` |
| **Inter** | Body text, UI | `system-ui, sans-serif` |
| **JetBrains Mono** | Código, monospace | `monospace` |

> **Nota**: Las fuentes se sirven desde `shared/fonts/` y se configuran en `@ciszu/ui` (Tailwind v4).

## Logos (assets recuperados)

### Isotipos (outline)

| Archivo | Carpeta | Dimensiones | Uso |
|---|---|---|---|
| `ciszugamens_logo_isotipo_outline_color_cpurple_zblack.png` | `outline/isotype/color/` | 512×512 | Avatar Discord, favicon, app icon |
| `ciszugamens_logo_isotipo_outline_degradado_cpurple_zblue.png` | `outline/isotype/gradient/color/` | 512×512 | Banner hero, splash screens |
| `ciszugamens_logo_isotipo_outline_monochrome_cwhite_zblack.png` | `outline/isotype/monochrome/` | 512×512 | Fondos oscuros, watermarks |

### Logotipos (outline)

| Archivo | Carpeta | Dimensiones | Uso |
|---|---|---|---|
| `ciszugamens_logotipo_outline_color.png` | `outline/logotype/color/` | 1024×256 | Header web, documentos oficiales |
| `ciszugamens_logotipo_outline_monochrome_black.png` | `outline/logotype/monochrome/` | 1024×256 | Fondos claros, impresión B/N |

### Variantes not-outline (copias para compatibilidad)

| Archivo | Carpeta |
|---|---|
| `ciszugamens_logo_isotipo_notoutline_color_cpurple_zblack.png` | `not-outline/isotype/color/` |
| `ciszugamens_logo_isotipo_notoutline_monochrome_cwhite_zblack.png` | `not-outline/isotype/monochrome/` |

## Banner / Video

| Archivo | Dimensiones | Uso |
|---|---|---|
| `ciszugamens_video_banner.gif` | 1920×1080 | Hero landing, Discord Bot List banner, Twitter header |

## Reglas de uso

1. **Espacio de respiración**: mínimo 24px alrededor del isotipo
2. **No deformar**: mantener aspect ratio 1:1 (isotipo) / 4:1 (logotipo)
3. **Contraste**: isotipo color solo sobre fondos oscuros (≥4.5:1)
4. **No recolorear**: usar archivos provistos; no aplicar filtros CSS
5. **Animación**: solo `ciszugamens_video_banner.gif` en hero; logos estáticos

## Integración en ecosistema

- **Sistema de anuncios**: `source: 'ciszugamens'`, acento `#22d3ee`
- **Discord**: avatar servidor = isotipo color; banner servidor = video banner
- **Web landing**: hero usa `ciszugamens_video_banner.gif`; header usa logotipo color

## Assets en CDN

Rutas Supabase Storage (`ciszu-cdn`):
```
projects/ciszugamens/content/logos/images/outline/isotype/color/ciszugamens_logo_isotipo_outline_color_cpurple_zblack.png
projects/ciszugamens/content/logos/images/outline/isotype/gradient/color/ciszugamens_logo_isotipo_outline_degradado_cpurple_zblue.png
projects/ciszugamens/content/logos/images/outline/isotype/monochrome/ciszugamens_logo_isotipo_outline_monochrome_cwhite_zblack.png
projects/ciszugamens/content/logos/images/outline/logotype/color/ciszugamens_logotipo_outline_color.png
projects/ciszugamens/content/logos/images/outline/logotype/monochrome/ciszugamens_logotipo_outline_monochrome_black.png
projects/ciszugamens/content/banners/images/ciszugamens_video_banner.gif
```

Subida: `pnpm cdn:upload` desde raíz.

---

_Última revisión: 29 ago 2026._