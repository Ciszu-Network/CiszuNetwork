# ICON_SYSTEM — Sistema de Iconos SVG del Juego (MuzicMania)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: ICON_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema de gestión de iconos SVG del juego MuzicMania: sprites generados
> desde `content/icons/svg-src` con `svg-sprite`, consumo vía `<use>` con IDs
> `icon-[nombre]`, y automatización desde la consola de desarrollo (`pnpm console` /
> `pnpm icons:build`). Es el sistema **legado** del juego; el estándar central del ecosistema
> se documenta en `` `ICON_SYSTEM.md` `` (ver ciszu).

---

## 1. Propósito y alcance

MuzicMania necesita cientos de iconos en toda la interfaz (navegación, gameplay, badges,
notificaciones). Para mantener **escalabilidad y portabilidad** sin repetir archivos SVG por
componente, se implementó un sistema automatizado basado en **sprites SVG symbols**:
los iconos fuente viven en carpetas organizadas y se compilan en uno o dos sprites que el
frontend consume con `<use href="/sprite.svg#icon-...">`.

Este documento cubre:

- Herramientas y generadores del pipeline.
- Estructura de carpetas (`content/icons/`).
- Nomenclatura de archivos fuente y de IDs.
- Automatización (consola de desarrollo y `icons:build`).
- Consumo en el frontend (`<use>`).
- Protocolo de gestión de iconos.
- Troubleshooting y FAQ.

> El patrón de centrado de esos `<use>` se documenta en `` `SVG_CENTERING_PLAN.md` ``.

## 2. Herramientas

| Herramienta | Rol |
|---|---|
| **Task Runner** | `npm scripts` + `chokidar-cli` (watch de carpetas fuente) |
| **Generador SVG** | `svg-sprite` (compila los `.svg` en sprites symbols) |
| **Generador PNG** | `ImageMagick` (opcional, exporta PNG de compatibilidad) |
| **Fuentes de iconos** | Remix Icon, Tabler Icons, Font Awesome |

### 2.1 Pipelines

- **Sprites**: `svg-sprite` genera un `<symbol>` por icono dentro de un único archivo SVG.
- **PNG**: ImageMagick rasteriza iconos seleccionados para entornos sin soporte SVG completo.
- **Watch**: chokidar recompila sprites automáticamente al cambiar un icono fuente.

## 3. Estructura de archivos

```
debug/download/         # Recursos externos ZIP/Unzipped (IGNORADO EN GIT)
content/icons/
├── svg-src/            # Iconos fuente, organizados con nomenclatura estándar
│   ├── outline/        # [lib]-outline-[name].svg
│   └── filled/         # [lib]-filled-[name].svg
├── sprites/            # ARCHIVOS GENERADOS (SVG Symbols)
│   ├── sprite-outline.svg
│   └── sprite-filled.svg
└── png/                # Iconos exportados para compatibilidad
```

> `debug/download/` y el árbol de `content/` están excluidos de git (ignorados). El sistema
> completo vive en el workspace de la web del juego.

## 4. Nomenclatura

### 4.1 Archivos fuente

Los SVG fuente siguen el patrón:

```
[lib]-[estilo]-[nombre].svg
```

| Componente | Valor | Ejemplo |
|---|---|---|
| `[lib]` | `ri` (Remix), `tb` (Tabler), `fa` (Font Awesome) | `ri` |
| `[estilo]` | `outline` o `filled` | `outline` |
| `[nombre]` | nombre del icono | `home` |

Ejemplo: `ri-outline-home.svg`, `tb-filled-play.svg`, `fa-outline-music.svg`.

### 4.2 IDs de sprite

Al compilar, cada `[lib]-outline-[name].svg` se convierte en el símbolo con ID:

```
icon-[lib]-outline-[name]
```

Ejemplos:

- `ri-outline-home.svg` → `icon-ri-outline-home`
- `ri-filled-home.svg` → `icon-ri-filled-home`
- `tb-outline-play.svg` → `icon-tb-outline-play`

## 5. Automatización

La consola de desarrollo centraliza la gestión de iconos en el submenú `icons`.

| Comando | Acción |
|---|---|
| `pnpm console` | Acceso a la consola principal de depuración (submenú `icons`) |
| `pnpm icons:build` | Atajo para ejecutar el sistema completo (Sprite + PNG + AI) |

- `pnpm icons:build` ejecuta la consola en modo `icons`, que regenera sprites y PNG.
- El submenú permite añadir, actualizar y regenerar iconos sin tocar el código a mano.

## 6. Cómo usar un icono

Usa el ID completo siguiendo el formato `icon-[nombre]`:

```html
<svg class="nav-icon">
  <use href="/sprite.svg#icon-ri-outline-home"></use>
</svg>
```

Reglas de uso:

1. **Ruta del sprite**: `/sprite.svg` (o el sprite correspondiente: `sprite-outline.svg` /
   `sprite-filled.svg` según el build).
2. **ID completo**: siempre con el prefijo `icon-`.
3. **Dimensiones explícitas**: define `width`/`height` (o clase) en el `<svg>`.
4. **Centrado**: si el icono va en contenedores circulares/badges, aplica el patrón de
   `` `SVG_CENTERING_PLAN.md` ``.

Ejemplo completo con estilo y tamaño:

```html
<svg class="icon-btn" width="20" height="20" aria-hidden="true">
  <use href="/sprite-filled.svg#icon-ri-filled-play"></use>
</svg>
```

```css
.icon-btn {
    fill: currentColor;
    color: #22d3ee; /* neon cyan del tema */
}
```

> `fill: currentColor` permite colorear el glifo con el color de texto (neon cyan/rosa del
> tema del juego).

## 7. Protocolo de gestión

1. **Origen**: descargar el icono en `debug/download` (ZIP de la librería fuente).
2. **Procesar**: ejecutar `pnpm icons:build`.
3. **Verificar**: comprobar que el ID aparezca en el sprite correspondiente
   (`content/icons/sprites/sprite-outline.svg` o `sprite-filled.svg`).
4. **Usar**: referenciar el ID con `<use>` en el componente.
5. **Limpiar**: eliminar los ZIP temporales de `debug/download` al terminar.

### 7.1 Añadir un icono nuevo

1. Coloca el SVG fuente en `content/icons/svg-src/outline/` o `filled/` con la nomenclatura
   `[lib]-[estilo]-[nombre].svg`.
2. Ejecuta `pnpm icons:build`.
3. Confirma el nuevo ID en el sprite (grep del nombre).
4. Consúmelo en el frontend.

### 7.2 Actualizar un icono existente

1. Reemplaza el archivo fuente manteniendo el mismo nombre.
2. Re-ejecuta `pnpm icons:build`.
3. Verifica que el ID no cambió (el símbolo se regenera in-place).

## 8. Reglas y buenas prácticas

- **Nunca edites los sprites a mano**: son generados; cualquier cambio manual se pierde al
  recompilar.
- **Prefiere el estilo que ya usa la zona** (outline vs. filled) para consistencia visual.
- **Mantén el nombre corto y descriptivo** del icono (kebab-case).
- **Colorea con `currentColor`** para heredar el tema (neon cyan/rosa).
- **Un solo sprite por estilo**: no dupliques iconos; reutiliza los IDs existentes.
- **Compatibilidad**: usa el `png/` solo cuando el destino no soporte SVG.

## 9. Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| El icono no aparece en el sprite | No se recompiló o el nombre no coincide | Ejecutar `pnpm icons:build` y verificar el ID |
| `<use>` en blanco en runtime | Ruta del sprite o ID incorrectos | Comprobar `href` y prefijo `icon-` |
| El icono se ve descentrado | Falta el patrón de centrado | Aplicar `` `SVG_CENTERING_PLAN.md` `` |
| El sprite pesa demasiado | Muchos iconos sin uso | Eliminar fuentes no usadas y recompilar |
| ImageMagick no está instalado | Generador PNG opcional ausente | Instalar ImageMagick o ignorar el paso PNG |
| `pnpm icons:build` falla | La consola no arranca (deps) | Verificar `tsx`/`prompts` y `pnpm install` |

## 10. FAQ

**¿Por qué sprites y no archivos SVG individuales?**
Un solo `<symbol>` por sprite reduce peticiones HTTP, permite colorear con CSS y simplifica
el mantenimiento (un archivo, mil iconos).

**¿Puedo usar estos iconos fuera del juego?**
Sí, son SVG estándar: basta copiar el sprite o el glifo. El estándar central del ecosistema
define las reglas globales de uso (ver `` `ICON_SYSTEM.md` `` en ciszu).

**¿Por qué el sistema está "legacy"?**
La web moderna del juego ya no depende de este pipeline (los assets se sirven vía CDN), pero
la consola de desarrollo y los componentes que aún usan `<use>` lo siguen necesitando. El
doc central de ciszu documenta ambos sistemas.

**¿`chokidar-cli` recompila en caliente?**
Sí, en modo watch recompila los sprites al detectar cambios en `svg-src/`.

**¿Dónde vive el código fuente del pipeline?**
En el workspace `muzicmania-website` (scripts de la consola de desarrollo y dependencias
`svg-sprite`, `chokidar-cli`, `prompts`, `picocolors`, `ora`).

## 11. Referencias

- `` `SVG_CENTERING_PLAN.md` `` — patrón de centrado de `<use>` en contenedores.
- `` `ICON_SYSTEM.md` `` (ver ciszu) — sistema central de iconos del ecosistema.
- `` `STYLES_SYSTEM.md` `` (ver ciszu) — estándares de estilos del ecosistema.
