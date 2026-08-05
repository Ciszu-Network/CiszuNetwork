# 🎨 MuzicMania - Guía de Estilos y Directrices de Implementación

**Fecha de Creación:** 12 de Febrero, 2026
**Autor:** Ciszuko Antony (Francisco Garcia)
**Propósito:** Establecer estándares visuales y técnicos uniformes para todo desarrollo futuro de MuzicMania

---

## 📐 Propósito de este Documento

Esta guía asegura que:
- Todos los componentes UI mantengan la estética **neon/synthwave/futurista**
- El código sea consistente y mantenible
- Los nuevos desarrolladores comprendan las reglas del proyecto
- Se evite la introducción de elementos que rompan la cohesión visual

---

## 🎨 1. Paleta de Colores

### Variables CSS Oficiales

**Ubicación:** `styles.css` líneas 1-69

```css
/* Fondos */
--bg-black: #000000;          /* Fondo base absoluto */
--bg-dark: #0a0a14;           /* Fondo principal */
--bg-darker: #050508;         /* Fondo de cards/modales */

/* Azules (Colores Principales) */
--neon-blue: #00d4ff;         /* Azul neón primario */
--neon-cyan: #00f0ff;         /* Cyan brillante */
--neon-electric: #0099ff;     /* Azul eléctrico */
--neon-sky: #33ccff;          /* Azul cielo */

/* Verdes (Transiciones y Estados) */
--neon-green: #00ff88;        /* Verde neón */
--neon-emerald: #00ff44;      /* Verde esmeralda */
--neon-lime: #ccff00;         /* Lima */

/* Rosas (Acentos) */
--neon-pink: #ff33cc;         /* Rosa neón */
--neon-rose: #ff66d9;         /* Rosa suave */
--neon-accent: #ffccee;       /* Rosa pastel */

/* Púrpuras (Highlights) */
--neon-purple: #8000ff;       /* Púrpura intenso */
--neon-violet: #a855f7;       /* Violeta */
```

### Gradientes Predefinidos

```css
--gradient-main: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple), var(--neon-pink));
--gradient-accent: linear-gradient(90deg, var(--neon-purple), var(--neon-pink));
--gradient-transition: linear-gradient(90deg, var(--neon-blue), var(--neon-green), var(--neon-blue), var(--neon-green));
```

### Reglas de Uso

✅ **PERMITIDO:**
- Usar variables CSS (`var(--neon-blue)`) siempre
- Combinar colores de la paleta para gradientes
- Ajustar opacidad con `rgba()` convirtiendo HEX primero

❌ **PROHIBIDO:**
- Colores hardcodeados (#FF0000, red, blue, etc.)
- Colores fuera de la paleta oficial
- Sobrescribir variables CSS en archivos individuales

---

## 🖼️ 2. Sistema de Iconografía

### Regla de Oro: **SOLO SVG SPRITES**

**Ubicación del Sistema:** `scripts/layout.js` (líneas 6-66) + `content/icons/sprites/`

### Iconos Permitidos

1. **Sprites SVG Generados:**
   - `sprite-filled.svg` → Iconos rellenos (UI, navegación)
   - `sprite-flags.svg` → Banderas de países

2. **Fuente de Iconos:**
   - [Remix Icon](https://remixicon.com/) (prefijo `ri-filled-`)
   - [Font Awesome](https://fontawesome.com/) → **SOLO como fuente para descargar SVG** (prefijo `fa-filled-`)
   - [Tabler Icons](https://tablericons.com/)

### Proceso de Integración

1. **Descargar SVG** de la fuente oficial
2. **Guardar en:** `content/icons/svg-src/[tipo]/[nombre].svg`
   - Tipos: `filled`, `outline`, `color`
3. **Ejecutar:** `npm run generate-icons`
4. **Usar en código:**
   ```javascript
   ${ICONS_LIB.get('ri-filled-home-4', bp)}
   ```

### ⚠️ Reglas Estrictas para SVGs Nuevos

1. **Color:**
   - Los iconos deben ser **Blanco Puro (`#FFFFFF`)** o **Negro Puro (`#000000`)**.
   - **NO** usar colores predefinidos (azul, rojo, etc.) salvo en la carpeta `color/` (para logos originales).
   - El sistema de sprites eliminará o ignorará atributos de color si no están configurados correctamente, por lo que el blanco/negro asegura compatibilidad con `fill: currentColor` en CSS.

2. **Nomenclatura y Ubicación:**
   - **Filled (Rellenos):** Guardar en `content/icons/svg-src/filled/`.
     - *Ejemplo:* `custom-vscode.svg`, `ri-filled-user.svg`.
   - **Outline (Contorno):** Guardar en `content/icons/svg-src/outline/`.
     - *Ejemplo:* `ri-line-home.svg`.
   - **Originales (Logos):** Guardar en `content/icons/svg-src/color/`.
     - *Nota:* Estos mantienen sus colores originales.

3. **Formato:**
   - Limpiar metadatos innecesarios (usar herramientas como SVGO o "Guardar como SVG optimizado").
   - `viewBox` debe estar presente y correcto (usualmente `0 0 24 24`).

### Iconos en HTML

```html
<!-- CORRECTO -->
<svg class="icon">
  <use href="content/icons/sprites/sprite-filled.svg#ri-filled-home-4"></use>
</svg>

<!-- INCORRECTO -->
<i class="fas fa-home"></i>  ❌ NO usar FontAwesome como librería
<span>🏠</span>               ❌ NO usar emojis
```

### Reglas Estrictas

✅ **PERMITIDO:**
- SVG sprites generados con `svg-sprite`
- Iconos del sistema `ICONS_LIB` en `layout.js`
- Atributo `fill="currentColor"` para cambios de color CSS

❌ **PROHIBIDO:**
- Emojis unicode (🏠, ❤️, 🎮)
- `<i class="fas fa-...">` de FontAwesome como librería externa
- Iconos rasterizados (PNG, JPG, GIF) para UI
- Librerías de iconos CDN distintas al sistema

---

## 📝 3. Tipografías

### Fuentes Oficiales

**Ubicación:** `styles.css` línea 6

```css
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@600;700;900&family=Rajdhani:wght@500;600;700&display=swap');
```

### Jerarquía Tipográfica

| Elemento | Fuente | Peso | Uso |
|----------|--------|------|-----|
| **Headers (H1-H6)** | `Exo 2` | 900 (Black) | Títulos principales |
| **Body Text** | `Rajdhani` | 600 (SemiBold) | Párrafos, botones, nav |
| **Code Blocks** | `monospace` | 400 | Terminal, código fuente |

### Variables CSS

```css
--font-header: 'Exo 2', sans-serif;
--font-body: 'Rajdhani', sans-serif;
```

### Reglas de Uso

✅ **PERMITIDO:**
- Headers: `font-family: var(--font-header);`
- Body: `font-family: var(--font-body);`
- Code: `font-family: monospace;`

❌ **PROHIBIDO:**
- Arial, Helvetica, Times New Roman
- Google Fonts adicionales sin aprobación
- `font-family: inherit;` en elementos críticos

---

## 🧩 4. Componentes UI (Patrones)

### Botones

#### Botón Primario (Azul Neón)

```css
.btn {
    background: var(--neon-blue);
    color: #000;
    border: 2px solid var(--neon-blue);
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-family: var(--font-header);
    font-weight: 700;
    text-transform: uppercase;
    transition: all 0.3s ease;
    cursor: pointer;
}

.btn:hover {
    background: transparent;
    color: var(--neon-blue);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
    transform: translateY(-2px);
}
```

#### Botón Secundario (Rosa Gradiente)

```css
.btn-red-gradient {
    background: linear-gradient(135deg, var(--neon-pink), var(--neon-purple));
    color: #fff;
    border: 2px solid transparent;
}

.btn-red-gradient:hover {
    box-shadow: 0 0 20px rgba(255, 51, 204, 0.6);
}
```

### Cards (Tarjetas)

```css
.card {
    background: rgba(10, 10, 20, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 15px;
    padding: 2rem;
    transition: all 0.3s ease;
}

.card:hover {
    border-color: var(--neon-blue);
    box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);
    transform: translateY(-5px);
}
```

### Modales (Ventanas Emergentes)

```css
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    z-index: 9999;
}

.modal {
    background: var(--bg-darker);
    border: 2px solid var(--neon-cyan);
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 500px;
    box-shadow: 0 0 50px rgba(0, 212, 255, 0.3);
}
```

---

## ✨ 5. Efectos Visuales

### Glassmorphism (Efecto Vidrio)

```css
.glass-effect {
    background: rgba(10, 10, 20, 0.4);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Glow Neón (Resplandor)

```css
.neon-glow {
    box-shadow: 0 0 10px var(--neon-blue),
                0 0 20px rgba(0, 212, 255, 0.5),
                0 0 30px rgba(0, 212, 255, 0.3);
}

.neon-text {
    color: var(--neon-cyan);
    text-shadow: 0 0 10px rgba(0, 240, 255, 0.8),
                 0 0 20px rgba(0, 240, 255, 0.5);
}
```

### Hover Estándar

```css
.interactive:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
    border-color: var(--neon-blue);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## 📐 6. Espaciado y Layout

### Variables de Espaciado

```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 2rem;     /* 32px */
--spacing-lg: 3rem;     /* 48px */
--spacing-xl: 5rem;     /* 80px */
```

### Márgenes y Padding

```css
/* CORRECTO */
padding: var(--spacing-md);
margin-bottom: var(--spacing-lg);

/* INCORRECTO */
padding: 25px;  ❌ No usar valores arbitrarios
```

### Contenedor Principal

```css
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
}
```

---

## 🚫 7. Prohibiciones Técnicas

### ❌ NUNCA Usar:

1. **Estilos Inline Excesivos**
   ```html
   <!-- MAL -->
   <div style="color: #00d4ff; padding: 20px; background: black;">

   <!-- BIEN -->
   <div class="card">
   ```

2. **Librerías CSS No Autorizadas**
   - Bootstrap ❌
   - Tailwind CSS ❌ (a menos que se apruebe explícitamente)
   - Material UI ❌

3. **Fuentes de Iconos CDN**
   ```html
   <!-- MAL -->
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
   ```

4. **Colores Hardcodeados**
   ```css
   /* MAL */
   color: #ff0000;
   background: blue;

   /* BIEN */
   color: var(--neon-pink);
   background: var(--bg-dark);
   ```

5. **Fuentes No Autorizadas**
   - Comic Sans ❌
   - Papyrus ❌
   - Arial, Times New Roman ❌ (usar solo en fallback)

---

## 📋 8. Checklist de Implementación

Antes de hacer commit de nuevos componentes, verificar:

- [ ] ¿Se usan **solo variables CSS** para colores?
- [ ] ¿Los iconos son **SVG sprites** del sistema?
- [ ] ¿La tipografía usa `--font-header` o `--font-body`?
- [ ] ¿Los efectos hover incluyen **glow neón**?
- [ ] ¿El componente usa **glassmorphism** donde aplica?
- [ ] ¿Se evitaron estilos inline innecesarios?
- [ ] ¿El espaciado usa variables `--spacing-*`?
- [ ] ❌ **NO hay emojis** en el código
- [ ] ❌ **NO hay FontAwesome** como librería externa

---

## 🔄 9. Ejemplos de Migración

### Antes (Incorrecto)

```html
<button style="background: blue; color: white; padding: 10px 20px;">
    <i class="fas fa-home"></i> Inicio 🏠
</button>
```

### Después (Correcto)

```html
<button class="btn btn-primary">
    <svg class="icon">
        <use href="content/icons/sprites/sprite-filled.svg#ri-filled-home-4"></use>
    </svg>
    <span>Inicio</span>
</button>
```

---

## 📚 10. Referencias

### Archivos Clave del Proyecto

- **Paleta:** [`styles.css`](file:///e:/Archivos/Antigravity/Testing/MuzicMania/styles.css) (líneas 1-69)
- **Iconos:** [`scripts/layout.js`](file:///e:/Archivos/Antigravity/Testing/MuzicMania/scripts/layout.js) (ICONS_LIB)
- **Sprites:** [`content/icons/sprites/`]
- **Componentes:** [`styles.css`](file:///e:/Archivos/Antigravity/Testing/MuzicMania/styles.css) (secciones de botones, cards, etc.)

### Documentación Externa

- **Remix Icon:** https://remixicon.com/
- **Tabler Icons:** https://tablericons.com/
- **Google Fonts (Exo 2):** https://fonts.google.com/specimen/Exo+2
- **Google Fonts (Rajdhani):** https://fonts.google.com/specimen/Rajdhani

---

## 📝 11. Notas Finales

Este documento es **VIVO** y debe actualizarse cuando:
- Se agreguen nuevas variables CSS
- Se introduzcan nuevos patrones de componentes
- Se descubran malas prácticas que prohibir
- Se aprueben excepciones justificadas

**Última actualización:** 12 de Febrero, 2026
**Próxima revisión:** Al finalizar Fase Beta Pública

---

> **Recordatorio para Agentes IA:** Este documento es tu biblia de estilos. Cualquier código generado que viole estas reglas debe ser corregido inmediatamente.
