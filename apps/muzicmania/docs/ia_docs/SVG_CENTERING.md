# Patrón de Centrado SVG

## Problema Recurrente

Los iconos SVG con `<use>` aparecen **descentrados** (inclinados a la izquierda) dentro de contenedores circulares o flexbox.

## Causa

Los SVG heredan estilos de texto y no tienen centrado absoluto por defecto. Esto causa que se alineen como si fueran texto, resultando en una desalineación visual dentro de contenedores perfectamente centrados.

## Solución Estándar

```css
.container svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

Esta técnica:
- **`position: absolute`**: Saca el SVG del flujo normal
- **`top: 50%; left: 50%`**: Posiciona la esquina superior izquierda del SVG en el centro
- **`transform: translate(-50%, -50%)`**: Compensa el tamaño del SVG, moviéndolo exactamente la mitad de sus dimensiones hacia arriba e izquierda

## Casos de Uso

### 1. Botones Circulares

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

### 2. Badges con Iconos

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

### 3. Headers Centrados

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

## Verificación

1. Abre DevTools Inspector
2. Selecciona el elemento SVG
3. Verifica valores computados:
   - `top`debería ser calculado como el centro vertical del contenedor
   - `left` debería ser calculado como el centro horizontal del contenedor
   - `transform` debería mostrar `translate(-50%, -50%)`

## Alternativas

### Flexbox (No siempre funciona)

```css
.container {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* A veces no es suficiente para SVG <use> */
```

**Limitación:** Flexbox solo centra el contenedor SVG, pero el contenido interno (`<use>`) puede seguir desalineado debido a herencias de estilo.

### Grid (Alternativa viable)

```css
.container {
    display: grid;
    place-items: center;
}

.container svg {
    /* Puede requerir ajuste adicional */
}
```

## Mejores Prácticas

1. **Siempre usa position absolute + transform** cuando:
   - El contenedor es circular
   - El tamaño del contenedor es fijo
   - Necesitas centrado pixel-perfect

2. **Evita confiar solo en flexbox** para SVG `<use>`

3. **Especifica dimensiones explícitas** del SVG:
   ```css
   svg {
       width: 16px !important;
       height: 16px !important;
   }
   ```

4. **Prueba visualmente** en DevTools con diferentes tamaños de zoom

## Casos Aplicados en MuzicMania

- **DevDebug Close Button** (`scripts/layout.js`, líneas 771-779)
- **Iconos en navegación circular**
- **Badges de notificaciones**

---

**Autor:** Antigravity AI
**Fecha:** 12 de Febrero, 2026
**Última Actualización:** 2026-02-12
