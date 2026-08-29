# UIDBUXDB_PROTOCOLS — UI/UX Design Brief (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: UIDBUXDB_PROTOCOLS_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Brief de diseño UI/UX para la landing web de CiszuGamens. Define principios, patrones, componentes y especificaciones visuales.

## 1. Principios de diseño

| Principio | Descripción |
|---|---|
| **Gaming-first** | Estética gaming (neon, dark mode, video hero) sin sacrificar usabilidad |
| **Claridad sobre decoración** | Cada elemento tiene propósito; no noise visual |
| **Accesibilidad nativa** | WCAG 2.1 AA por defecto, no como afterthought |
| **Performance-first** | Carga < 3s, assets optimizados, streaming donde aplique |
| **Consistencia ecosistema** | Tokens, fuentes, patrones compartidos con `@ciszu/ui` |

## 2. Paleta y tokens (fuente: `BRAND_PLAN.md`)

| Token | Valor | Uso |
|---|---|---|
| `--color-cyan` | `#22d3ee` | Primary accent (CTA, focus, links) |
| `--color-cyan-dark` | `#06b6d4` | Hover/active states |
| `--color-purple` | `#a855f7` | Secondary accent (gradientes, badges) |
| `--color-bg` | `#000000` | Page background |
| `--color-surface` | `#0b0e14` | Cards, modals, header |
| `--color-text` | `#ffffff` | Primary text |
| `--color-text-muted` | `#71717a` | Secondary text, meta |

## 3. Tipografía

| Escala | Tamaño | Línea | Uso |
|---|---|---|---|
| Display XL | 4.5rem / 72px | 1.1 | Hero headline |
| Display LG | 3rem / 48px | 1.1 | Section titles |
| Heading 1 | 2.25rem / 36px | 1.2 | Page titles |
| Heading 2 | 1.875rem / 30px | 1.3 | Subsections |
| Heading 3 | 1.5rem / 24px | 1.4 | Card titles |
| Body LG | 1.125rem / 18px | 1.6 | Lead paragraphs |
| Body | 1rem / 16px | 1.6 | Default text |
| Body SM | 0.875rem / 14px | 1.5 | Meta, captions |
| Caption | 0.75rem / 12px | 1.5 | Footnotes, badges |

**Fuentes**: Geomanist (headings), Inter (body), JetBrains Mono (code)

## 4. Espaciado y layout

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | 4px | Micro spacing |
| `--space-2` | 8px | Tight |
| `--space-3` | 12px | Small gap |
| `--space-4` | 16px | Base unit |
| `--space-6` | 24px | Medium gap |
| `--space-8` | 32px | Section gap |
| `--space-12` | 48px | Large section gap |
| `--space-16` | 64px | Hero padding |
| `--container-max` | 1280px | Max width contenido |
| `--container-pad` | 24px | Padding móvil |

**Grid**: 12 columnas, gap 24px, breakpoints: 640 / 1024 / 1440

## 4. Componentes base (reutilizan `@ciszu/ui`)

| Componente | Variante | Especificación |
|---|---|---|
| **Button** | Primary | `bg-cyan`, `text-black`, `rounded-xl`, `px-6 py-3`, `hover:brightness-110` |
| | Secondary | `bg-transparent`, `border-cyan`, `text-cyan`, `rounded-xl` |
| | Ghost | `text-cyan`, `hover:bg-cyan/10` |
| **Card** | Default | `bg-surface`, `border border-white/10`, `rounded-2xl`, `p-6` |
| | Feature | + `hover:border-cyan/50`, `transition-colors` |
| **Input** | Default | `bg-surface`, `border-white/10`, `focus:border-cyan`, `rounded-xl` |
| **Badge** | Accent | `bg-cyan/20`, `text-cyan`, `rounded-full`, `px-3 py-1` |
| **Tooltip** | Default | `bg-surface`, `border-white/10`, `rounded-lg`, `p-2`, `text-sm` |

## 5. Patrones de página (Landing)

### Hero (above fold)
```
┌─────────────────────────────────────────────────────────────┐
│  [Video Banner GIF - full width, aspect-video]              │
│  Overlay: Gradient negro (0% → 60% opacity)                 │
│  Content (center, max-w-3xl):                               │
│    • Headline: "CiszuGamens — Tu comunidad gaming"          │
│    • Subhead: "Torneos, rankings, comunidad. Únete."        │
│    • CTA Primary: "Unirse al servidor" → Discord invite     │
└─────────────────────────────────────────────────────────────┘
```

### Features (3 columnas)
```
┌─────────┬─────────┬─────────┐
│ 🎮      │ 🏆      │ 📊      │
│ Comunidad│ Torneos │ Rankings│
│ Desc... │ Desc... │ Desc... │
└─────────┴─────────┴─────────┘
```

### Stats Bar
```
┌─────────────────────────────────────────────────────────────┐
│  500+ Miembros    50+ Online    12 Torneos/mes              │
└─────────────────────────────────────────────────────────────┘
```

### Events (próximos)
```
┌─────────────────────────────────────────────────────────────┐
│  Próximos eventos                    [Ver todos →]          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Torneo VAL  │  │ Liga LoL    │  │ Custom CS2  │         │
│  │ 15 Sep      │  │ 22 Sep      │  │ 01 Oct      │         │
│  │ [Inscribirse]│  │ [Inscribirse]│  │ [Inscribirse]│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Footer
```
┌─────────────────────────────────────────────────────────────┐
│  CiszuGamens  |  Ciszu Network  |  CiszuBot  |  Ciszuko Antony│
│  Discord  |  Twitter  |  YouTube  |  GitHub                  │
│  © 2026 Ciszu Network. Todos los derechos reservados.        │
│  [Privacidad] [Términos] [Cookies]                           │
└─────────────────────────────────────────────────────────────┘
```

## 6. Animaciones y micro-interacciones

| Elemento | Animación | Duración | Easing |
|---|---|---|---|
| Hero video | Fade in | 400ms | ease-out |
| CTA hover | Scale + glow | 200ms | ease-out |
| Card hover | Lift + border glow | 300ms | ease-out |
| Scroll reveal | Fade + slide up | 600ms | ease-out |
| Focus ring | Pulse | 1.5s | infinite |
| Stats counter | Count up | 1000ms | ease-out |

## 7. Estados de carga y error

| Estado | UI | Copy |
|---|---|---|
| Loading hero | Skeleton (aspect-video) | "Cargando comunidad..." |
| Loading stats | Spinner inline | — |
| Error stats | Icono alerta + retry | "No se pudieron cargar stats. Reintentar." |
| Error video | Poster estático + play button | "Video no disponible. Click para ver en Discord." |

## 8. Responsive Breakpoints

| Breakpoint | Ancho | Cambios clave |
|---|---|---|
| Mobile | < 640px | Hero: headline 2.5rem, CTA full-width, Features stack 1 col |
| Tablet | 640–1023px | Features 2+1, Stats 2x2, Events scroll horizontal |
| Desktop | ≥ 1024px | Layout completo, hero video autoplay muted |

---

_Última revisión: 29 ago 2026._