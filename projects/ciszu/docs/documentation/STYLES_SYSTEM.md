# STYLES_SYSTEM — Sistema de Estilos de las Aplicaciones (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: STYLES_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema de estilos global de las aplicaciones: cómo se aplica el color
> (remite a `COLOR_SYSTEM.md`), tipografías, layouts, componentes, patrones de estilo y
> reglas de consistencia visual en las 4 webs.

---

## 1. Identidad visual global

| Criterio | Decisión |
|---|---|
| **Tema** | Oscuro (negro) + acentos neon |
| **Colores núcleo** | Brand `#233f92`, neon cyan/rosa/verde/púrpura |
| **Fondos** | `#000000`, cards `#0a0a0f`, hover `#111118` |
| **Glow** | Sombras neon en bordes/botones (ver `COLOR_SYSTEM.md` §4) |
| **Gradientes** | brand y neon (ver `COLOR_SYSTEM.md` §3) |
| **Tipografías** | IBM Plex, Exo_2, Rajdhani, Inter (según web) |

> **Detalle**: Ciszuko Antony usa Exo_2 (sans) + Rajdhani (header); MuzicMania añade
> Century Gothic (accent); ciszunetwork usa IBM Plex Condensed; ciszubot Inter + Exo_2.

## 2. Arquitectura de estilos

```
globals.css            # @theme (tokens), resets, scrollbar, utilidades
@theme                 # definición de tokens de color/sombra/fuente
public/fonts/*         # fuentes auto-hospedadas (w-off2)
```

- **Tailwind v4** con tokens en `@theme` (CSS-first, sin config JS).
- Los estilos de cada web viven en su propio `src/app/globals.css`.
- Las utilidades compartidas (`text-gradient-*`, `bg-*-gradient`) se definen por web.

## 3. Tokens de estilo (naming)

| Prefijo | Semántica | Ejemplos |
|---|---|---|
| `--color-brand*` | Marca | brand, brand-light, brand-accent, brand-dark |
| `--color-neon-*` | Neon | neon-blue, cyan, green, pink, purple |
| `--color-bg-*` | Fondos | bg-dark, bg-darker, bg-card, bg-card-hover |
| `--shadow-*` | Sombras | shadow-brand, shadow-neon-blue |
| `--drop-shadow-*` | Filtro drop-shadow | drop-shadow-neon-cyan |
| `--font-*` | Tipografías | font-sans, font-header, font-accent |

## 4. Layouts y estructura

| Web | Header | Footer | Contenido |
|---|---|---|---|
| **ciszunetwork** | Sticky, logo + nav + CTA | Multi-columna con redes | Hero + secciones |
| **ciszukoantony** | Sticky, logo + nav | Redes + contacto | Portfolio (proyectos) |
| **muzicmania** | Sticky, nav juego | Legal + redes | Juego + comunidad |
| **ciszubot** | Sticky, nav | Redes + donaciones | Landing del bot |

- `layout.tsx` por app: header, footer, metadata, manifest, guard (Turnstile), IAST.
- `page.tsx`: contenido de cada ruta.
- Reuso de componentes compartidos en `packages/ui` (ver `PACKAGES_SYSTEM.md`).

## 5. Componentes y patrones de estilo

| Componente/Patrón | Estilo |
|---|---|
| Botones | `bg-brand hover:bg-brand-light text-white shadow-neon-blue` |
| Cards | `bg-bg-card border border-brand/20 hover:bg-bg-card-hover` |
| Gradientes de texto | `text-gradient-neon` / `text-gradient-brand` |
| Links neon | `text-neon-cyan hover:text-neon-pink` |
| Navegación activa | Resaltar con `text-neon-cyan` + `border-b` |
| Títulos | `font-header` (Rajdhani/IBM Plex Condensed) |
| Body | `font-sans`, texto `white`/`muted` |

## 6. Tipografías

### 6.1 Fuentes auto-hospedadas

- Archivos `w-off2` en `public/fonts/` de cada web.
- Declaración con `@font-face` y variable CSS (`--font-*`).

### 6.2 Stack de fuentes por web

| Web | Sans | Header | Accent |
|---|---|---|---|
| ciszunetwork | IBM Plex | IBM Plex Condensed | IBM Plex |
| ciszukoantony | Exo_2 | Rajdhani | — |
| muzicmania | Exo_2 | Rajdhani | Century Gothic |
| ciszubot | Inter | Exo_2 | — |

## 7. Gradientes y efectos especiales

```css
.text-gradient-neon {
  background: linear-gradient(135deg, #3a6bf0, #68cfff, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

- Aplicar a héroes y títulos grandes.
- No abusar: usar texto blanco normal para párrafos.

## 8. Responsive y breakpoints

- Mobile-first. Breakpoints Tailwind: `sm md lg xl 2xl`.
- Navegación: menú móvil (hamburguesa) < `md`, nav completo ≥ `md`.
- Grids: `grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

## 9. Reglas de consistencia

| Regla | Descripción |
|---|---|
| **Tokens sobre valores** | Nunca hex/bordes sueltos en componentes; usar tokens |
| **Una web = un globals.css** | No dispersar estilos en archivos múltiples |
| **Gradientes oficiales** | Solo `text-gradient-*`/`bg-*-gradient` definidos |
| **Neon con moderación** | Glows en bordes/botones, no en texto de párrafo |
| **Contraste** | Texto legible: blanco/gris sobre negro |
| **Hover consistentes** | Transiciones cortas (150-200ms) |

## 10. Checklist de implementación de estilo

- [ ] Token definido en `@theme` antes de usarlo.
- [ ] Clase Tailwind derivada (`bg-`, `text-`, `border-`, `shadow-`).
- [ ] Fuente auto-hospedada registrada con `@font-face`.
- [ ] Gradiente usa token/definición oficial.
- [ ] Responsive comprobado (móvil + desktop).
- [ ] Contraste AA donde aplica.

## 11. Conceptos de estilos (contexto informático)

| Concepto | Definición |
|---|---|
| **CSS** | Lenguaje de estilos de la web |
| **Token (design token)** | Variable de diseño (color, fuente, sombra) |
| **Utility class** | Clase atómica (`bg-`, `text-`, `mt-`) |
| **@theme** | Bloque de tokens de Tailwind v4 |
| **Vite / CSS modules** | Alternativas de empaquetado de CSS (no usadas) |
| **Responsive** | Adaptar el layout al tamaño de pantalla |
| **Breakpoint** | Punto de corte del diseño |
| **Mobile-first** | Diseñar primero para móvil |
| **Glow** | Efecto de resplandor con sombras |
| **Gradient** | Transición entre colores |
| **Opacity** | Transparencia (alpha) |
| **Z-index** | Orden de capas |
| **Overflow** | Comportamiento del desbordamiento |
| **Scrollbar** | Barra de desplazamiento (customizada) |

## 12. Reglas de estilos por componente

| Componente | Clases recomendadas |
|---|---|
| **Botón primario** | `bg-brand text-white hover:bg-brand-light shadow-neon-blue` |
| **Botón secundario** | `bg-transparent border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10` |
| **Card** | `bg-bg-card border border-brand/20 rounded-lg` |
| **Badge** | `bg-brand/20 text-neon-cyan text-xs px-2 py-0.5 rounded-full` |
| **Input** | `bg-bg-card border border-brand/20 focus:border-neon-cyan` |
| **Link** | `text-neon-cyan hover:text-neon-pink transition-colors` |
| **Título hero** | `font-header text-4xl text-gradient-neon` |
| **Nav item activo** | `text-neon-cyan border-b-2 border-neon-cyan` |

## 13. Estados (hover, focus, active, disabled)

| Estado | Regla |
|---|---|
| Hover | Aclarar/marcar el elemento (150-200ms transition) |
| Focus | Anillo `focus-visible:ring-2 ring-neon-cyan` |
| Active | Oscurecer/presionar (`active:scale-95` opcional) |
| Disabled | `opacity-50 pointer-events-none` |
| Error | `border-danger text-danger` |
| Loading | Skeleton o `animate-pulse` |

## 14. Media queries y breakpoints

```css
/* Tailwind v4 detecta las clases en el código; breakpoints por defecto: */
/* sm:640px md:768px lg:1024px xl:1280px 2xl:1536px */
```

- Usar clases responsivas (`md:grid-cols-2`) en vez de media queries manuales.
- Para estilos únicos de una web, definir utilidad propia en `globals.css`.

## 15. Accesibilidad de estilos

- Contraste: ver `COLOR_SYSTEM.md` §8.
- No depender solo del color para estados (usar icono/texto + color).
- `prefers-reduced-motion`: respetar para usuarios que piden menos animación.
- Foco visible siempre presente (navegación por teclado).

## 16. Cómo añadir un nuevo estilo (flujo)

1. Definir token en `@theme` del `globals.css` de la web.
2. Si es compartido entre webs, documentarlo en `COLOR_SYSTEM.md` y replicar.
3. Usar la clase generada en el componente.
4. Revisar contraste + responsive.
5. Ejecutar `pnpm lint`/`build` de la web afectada.

## 17. Sobre la fuente Geomanist (identidad de marca)

La identidad visual usa la fuente **Geomanist** (documentada en AGENTS.md) como fuente de
marca. En las webs del repo se sirven fuentes auto-hospedadas (IBM Plex, Exo_2, Rajdhani,
Inter, Century Gothic). Regla: usar las fuentes registradas en `@theme`; no añadir fuentes
externas de Google Fonts en runtime salvo necesidad (rendimiento y privacidad).

## 18. Referencias de código (ubicación de estilos)

| Recurso | Ubicación |
|---|---|
| Tokens y utilidades | `src/app/globals.css` de cada web |
| Fuentes | `public/fonts/*.woff2` |
| Iconos | `@ciszu/ui` (`Icon`) |
| Imágenes optimizadas | `@ciszu/ui` (`SmartImage`) |
| Config de webs | `src/config/` (navigation, site) |

_Última revisión: 13 ago 2026._ Relacionado: `COLOR_SYSTEM.md`, `ICON_SYSTEM.md`,
`FRAMEWORKS_SYSTEM.md`, `FRONTEND_SYSTEM.md`, `FULL_STACK_SYSTEM.md`.
