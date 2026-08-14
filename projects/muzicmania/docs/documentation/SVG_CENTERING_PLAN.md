# SVG_CENTERING_PLAN — Plan de Centrado de Iconos SVG (MuzicMania)

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: SVG_CENTERING_PLAN_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: plan del patrón CSS para centrar iconos SVG con `<use>` dentro de
> contenedores circulares, badges y headers. Documenta el problema recurrente de desalineación
> visual en MuzicMania, la solución estándar (`position: absolute` + `translate(-50%, -50%)`),
> sus variantes, verificación, alternativas y troubleshooting.

---

## 1. Propósito y alcance

En MuzicMania, los iconos se consumen desde sprites SVG mediante `<use>` (ver
`` `ICON_SYSTEM.md` ``). Es un patrón recurrente encontrar que el icono **aparece descentrado**
(inclinado a la izquierda o ligeramente desplazado) dentro de contenedores circulares o
flexbox, incluso cuando el contenedor está perfectamente centrado.

Esta guía documenta:

- La causa raíz del problema.
- La solución estándar adoptada en el proyecto.
- Casos de uso aplicados (botones circulares, badges, headers).
- Variantes y alternativas (flexbox, grid).
- Verificación en DevTools.
- Mejores prácticas, troubleshooting y FAQ.

> El sistema de sprites e iconos del juego se documenta en `` `ICON_SYSTEM.md` ``; el estándar
> de iconos del ecosistema, en `` `ICON_SYSTEM.md` `` (ver ciszu).

## 2. Problema recurrente

Los iconos SVG con `<use>` aparecen **descentrados** (inclinados a la izquierda) dentro de
contenedores circulares o flexbox.

**Síntomas típicos:**

- El icono queda desplazado hacia arriba-izquierda unos pocos píxeles.
- El glyph interno del sprite (`<use href="...">`) no respeta el centrado del `<svg>` padre.
- En botones redondos (`border-radius: 50%`) el icono se "cae" hacia un lado.

## 3. Causa

Los SVG heredan estilos de texto y **no tienen centrado absoluto por defecto**. El navegador
los trata como elementos inline, alineados a la línea base del texto (baseline). Esto causa
que se alineen como si fueran texto, resultando en una desalineación visual dentro de
contenedores perfectamente centrados con `flex`/`grid`.

Además, el contenido interno del sprite (`<use>` → `<symbol>`) puede conservar su propio
`viewBox` con padding, de modo que el centrado del contenedor no garantiza el centrado del
glifo.

## 4. Solución estándar

```css
.container svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

Cómo funciona cada propiedad:

| Propiedad | Función |
|---|---|
| `position: absolute` | Saca el SVG del flujo normal y lo posiciona respecto al contenedor (`position: relative`). |
| `top: 50%; left: 50%` | Coloca la esquina superior izquierda del SVG en el centro geométrico del contenedor. |
| `transform: translate(-50%, -50%)` | Compensa el tamaño del SVG moviéndolo exactamente la mitad de sus dimensiones hacia arriba e izquierda. |

> **Requisito**: el contenedor debe tener `position: relative` (o ser un elemento posicionado),
> o el `absolute` se anclará al ancestro posicionado más cercano.

## 5. Casos de uso

### 5.1 Botones circulares

```css
.close-warning-debug {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
}

.close-warning-debug svg {
    width: 16px;
    height: 16px;
    /* Centrado perfecto */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

### 5.2 Badges con iconos

```css
.badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.badge svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

### 5.3 Headers centrados

```css
.header-icon-container {
    position: relative;
    width: 40px;
    height: 40px;
}

.header-icon-container svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

### 5.4 Clase utilitaria reutilizable

```css
.svg-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

```html
<div class="icon-btn">
    <svg class="svg-center" width="16" height="16">
        <use href="/sprite.svg#icon-ri-outline-close"></use>
    </svg>
</div>
```

## 6. Variantes

### 6.1 Centrado por insets (alternativa a transform)

```css
.container svg {
    position: absolute;
    inset: 0;
    margin: auto;
}
```

- Útil cuando el SVG tiene tamaño explícito y el contenedor es cuadrado.
- No requiere `transform`; puede fallar si el SVG es flexible o el contenedor no tiene altura
  definida.

### 6.2 Variante con `translate` moderno

```css
.container svg {
    position: absolute;
    inset: 50% auto auto 50%;
    translate: -50% -50%;
}
```

- La propiedad `translate` es independiente de `transform` y evita colisiones con otras
  transformaciones (rotaciones, scales) del mismo elemento.

## 7. Verificación

1. Abre el Inspector de DevTools.
2. Selecciona el elemento SVG.
3. Verifica los valores computados:
   - `top` debe calcularse como el centro vertical del contenedor.
   - `left` debe calcularse como el centro horizontal del contenedor.
   - `transform` debe mostrar `translate(-50%, -50%)`.
4. Comprueba que el contenedor tenga `position: relative` en el panel de Computed.

## 8. Alternativas

### 8.1 Flexbox (no siempre funciona)

```css
.container {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* A veces no es suficiente para SVG <use> */
```

**Limitación**: flexbox centra el contenedor SVG, pero el contenido interno (`<use>`) puede
seguir desalineado debido a herencias de estilo y a la línea base del glyph.

### 8.2 Grid (alternativa viable)

```css
.container {
    display: grid;
    place-items: center;
}

.container svg {
    /* Puede requerir ajuste adicional */
}
```

**Limitación**: `place-items: center` centra la caja del SVG; si el sprite interno tiene
padding en su `viewBox`, puede requerir compensación adicional con `inset` o `translate`.

## 9. Mejores prácticas

1. **Usa `position: absolute` + `transform`** cuando:
   - El contenedor es circular.
   - El tamaño del contenedor es fijo.
   - Necesitas centrado pixel-perfect.
2. **Evita confiar solo en flexbox** para SVG `<use>`.
3. **Especifica dimensiones explícitas** del SVG:
   ```css
   svg {
       width: 16px !important;
       height: 16px !important;
   }
   ```
4. **Prueba visualmente** en DevTools con distintos niveles de zoom.
5. **Define `display: block`** en el SVG para eliminar el espacio de línea base
   (`vertical-align` extra).
6. **Consistencia**: centraliza el patrón en una clase utilitaria y reutilízala.

## 10. Casos aplicados en MuzicMania

- **DevDebug Close Button** (`scripts/layout.js`, líneas 771-779).
- **Iconos en navegación circular**.
- **Badges de notificaciones**.

## 11. Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| El SVG se ancla a otra parte de la página | El contenedor no tiene `position: relative` | Añadir `position: relative` al contenedor |
| El icono queda centrado pero el glyph no | Padding interno del `<symbol>` en el sprite | Recortar el `viewBox` o ajustar el tamaño del `<svg>` |
| `transform` no aplica | El navegador trata el SVG como inline | Añadir `display: block` al SVG |
| El icono se corta en contenedores pequeños | Tamaño del SVG mayor que el contenedor | Reducir `width`/`height` del SVG |
| Doble centrado (flex + absolute) produce saltos | Ambos mecanismos compiten | Usar solo `absolute` + `transform` en esos nodos |

## 12. FAQ

**¿Por qué flexbox no centra el contenido interno del sprite?**
Porque flexbox centra la caja del `<svg>`, no el glifo del `<symbol>`. El `<use>` hereda
alineaciones de texto y el `viewBox` puede contener margen.

**¿Puedo usar `place-items: center` de grid para todo?**
Sí, para la mayoría de contenedores. Si un glyph sigue descentrado, aplica la solución
`absolute` + `translate` como corrección final.

**¿El patrón afecta al layout responsivo?**
No: `translate(-50%, -50%)` usa porcentajes relativos al propio SVG, por lo que se adapta a
cualquier tamaño.

**¿Debo quitar el flexbox si uso absolute?**
Puedes conservarlo, pero si el SVG es el único hijo centrado, `absolute` + `transform` es
suficiente y evita comportamientos de competición.

## 13. Referencias

- `` `ICON_SYSTEM.md` `` — sistema de sprites e iconos del juego.
- `` `STYLES_SYSTEM.md` `` (ver ciszu) — estándares de estilos del ecosistema.
