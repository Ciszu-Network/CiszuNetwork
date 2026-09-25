# COLOR_SYSTEM — Sistema de Colores (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: COLOR_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema oficial de color del ecosistema: paletas, tokens CSS/Tailwind,
> representaciones (hex, rgb, hsl), gradientes, sombras neon y cómo aplicar color en cada
> contexto (CSS, Tailwind, terminal/PowerShell, ANSI escapes, React/Tailwind, SVG, Rust/Tauri).

---

## 1. Identidad de marca (colores núcleo)

Basados en el logotipo oficial: **azul `#233f92`** y **cian `#007bc0`** (CiszuBot).
El ecosistema es **neon cyan/rosa** sobre **negro**.

| Token | Hex | RGB | Uso |
|---|---|---|---|
| **Brand** | `#233f92` | `rgb(35, 63, 146)` | Color principal de marca (logo) |
| **Brand-light** | `#3a6bf0` | `rgb(58, 107, 240)` | Hover/acento brand |
| **Brand-accent** | `#4a7dff` | `rgb(74, 125, 255)` | Acentos de marca |
| **Brand-dark** | `#1a2e6b` | `rgb(26, 46, 107)` | Fondos brand oscuros |

## 2. Paleta neon (los 4 colores base del tema)

| Token | Hex | RGB | Uso |
|---|---|---|---|
| **Neon-blue** | `#59b4ff` | `rgb(89, 180, 255)` | Enlaces, bordes, glows azules |
| **Neon-cyan** | `#68cfff` | `rgb(104, 207, 255)` | Glow cyan, gradientes |
| **Neon-green** | `#00ff88` | `rgb(0, 255, 136)` | Éxito, puntos, validación |
| **Neon-pink** | `#ff33cc` | `rgb(255, 51, 204)` | Acento principal, highlights |
| **Neon-purple** | `#4800ff` | `rgb(72, 0, 255)` | Profundidad, violeta |

### 2.1 Paleta extendida (MuzicMania)

| Token | Hex | Uso |
|---|---|---|
| Neon-violet | `#7830d0` | Modos violeta |
| Neon-sky | `#56d5ff` | Variante cyan |
| Neon-electric | `#0099ff` | Eléctrico |
| Neon-orange | `#ff6600` | Avisos/energía |
| Neon-yellow | `#ffd900` | Estrellas/premios |
| Neon-red | `#ff0000` | Errores/danger |

### 2.2 Paleta de fondo

| Token | Hex | Uso |
|---|---|---|
| Bg-dark | `#000000` | Fondo principal (webs) |
| Bg-darker | `#000617` (MuzicMania) / `#050a14` (portfolio) | Fondo más profundo |
| Bg-card | `#0a0a0f` | Cards |
| Bg-card-hover | `#111118` | Hover de cards |
| Surface | `#ffffff` | Superficies (tema claro CiszuBot) |
| Ink | `#1b2234` | Texto principal (claro) |
| Muted | `#5a6478` | Texto secundario |
| Faint | `#8b93a7` | Texto terciario |

## 3. Gradientes oficiales

| Clase | Gradiente |
|---|---|
| `text-gradient-brand` | `linear-gradient(135deg, #233f92, #4a7dff)` |
| `text-gradient-neon` | `linear-gradient(135deg, #3a6bf0, #68cfff, #00ff88)` |
| `bg-brand-gradient` | `linear-gradient(135deg, #233f92, #3a6bf0)` |
| `bg-neon-gradient` | `linear-gradient(135deg, #233f92, #59b4ff, #00ff88)` |

## 4. Sombras neon (glows)

Patrón: `0 0 10px <color> , 0 0 25px rgba(<color>, alpha)` (3 capas en MuzicMania con 50px).

| Token | Valor |
|---|---|
| `shadow-brand` | `0 0 10px rgba(35,63,146,0.5), 0 0 25px rgba(35,63,146,0.3)` |
| `shadow-neon-blue` | `0 0 10px rgba(89,180,255,0.4), 0 0 25px rgba(89,180,255,0.2)` |
| `shadow-neon-cyan` | `0 0 10px #00f0ff, 0 0 25px rgba(0,157,255,0.57)` |
| `shadow-neon-pink` | `0 0 10px #ff33cc, 0 0 25px rgba(255,80,211,0.35), 0 0 50px rgba(255,51,204,0.15)` |
| `shadow-neon-purple` | `0 0 10px #8000ff, 0 0 25px hsla(270,100%,66%,0.35), 0 0 50px rgba(128,0,255,0.15)` |
| `shadow-neon-green` | `0 0 10px #00ff88, 0 0 25px rgba(51,255,160,0.49)` |
| `shadow-neon-orange` | `0 0 10px #ff6600, 0 0 25px rgba(255,102,0,0.49)` |

## 5. Cómo aplicar color según el contexto

### 5.1 CSS (tokens)

```css
/* vars CSS en @theme (Tailwind v4) */
--color-brand: #233f92;
--color-neon-pink: #ff33cc;
--color-bg-dark: #000000;

/* uso */
.btn { background: var(--color-brand); color: #fff; }
.glow { box-shadow: var(--shadow-neon-pink); }
```

### 5.2 Tailwind v4 (clases)

```tsx
<div className="bg-brand text-white">
<div className="text-neon-pink">
<div className="shadow-neon-blue">
<div className="bg-neon-gradient">
```

> Los tokens `--color-*` del `@theme` generan clases `bg-*`, `text-*`, `border-*`, `shadow-*`
> automáticamente en Tailwind v4.

### 5.3 Representaciones (hex ↔ rgb ↔ hsl)

| Formato | Ejemplo | Uso |
|---|---|---|
| Hex | `#ff33cc` | CSS, diseño, docs |
| RGB | `rgb(255, 51, 204)` | Shadows con alpha, JS |
| RGBA | `rgba(255, 51, 204, 0.35)` | Glows con opacidad |
| HSL | `hsl(314, 100%, 60%)` | Manipular tono/sat/luz |
| HSLA | `hsla(270, 100%, 66%, 0.35)` | Con alpha (se usa en shadows purple) |

**Conversión rápida de #ff33cc**:
- R = `0xff` = 255, G = `0x33` = 51, B = `0xcc` = 204
- H: max=255 (rojo), min=51 (verde) → `60*( (0-204)/204 )`... **usar calculadora/herramienta**
  (`node -e` o `convert.js` en `tools/convert`).

### 5.4 Terminal / PowerShell (ANSI escape codes)

| Color | Código ANSI (fg) | Código ANSI (bg) |
|---|---|---|
| Negro | `\x1b[30m` | `\x1b[40m` |
| Rojo | `\x1b[31m` | `\x1b[41m` |
| Verde | `\x1b[32m` | `\x1b[42m` |
| Amarillo | `\x1b[33m` | `\x1b[43m` |
| Azul | `\x1b[34m` | `\x1b[44m` |
| Magenta/Rosa | `\x1b[35m` | `\x1b[45m` |
| Cyan | `\x1b[36m` | `\x1b[46m` |
| Blanco | `\x1b[37m` | `\x1b[47m` |
| Bright (neon) | `\x1b[90m`–`\x1b[97m` | `\x1b[100m`–`\x1b[107m` |
| Reset | `\x1b[0m` | — |

```powershell
Write-Host "Neon Pink" -ForegroundColor Magenta
# u otros estilos
Write-Host "[IAST] alerta" -ForegroundColor Red -BackgroundColor Black
```

> PowerShell soporta `-ForegroundColor` (Black/DarkBlue/DarkGreen/DarkCyan/DarkRed/DarkMagenta/
> DarkYellow/Gray/DarkGray/Blue/Green/Cyan/Red/Magenta/Yellow/White). Para RGB exacto se usa
> `$Host.UI.RawUI.ForegroundColor = [ConsoleColor]::Magenta` o códigos ANSI con
> `$PSStyle.Foreground` (PS 7+).

### 5.5 Node.js / scripts (colores)

```js
// ANSI en Node (sin librerías)
const neon = (s) => `\x1b[35m${s}\x1b[0m`;   // magenta/rosa
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const reset = '\x1b[0m';
console.log(cyan('[OK]') + ' ' + neon(s));
```

> En los scripts del repo se usa este patrón directo (sin deps) — mantenerlo.

### 5.6 React / Tailwind en las 4 webs

```tsx
// usar tokens, nunca hex sueltos
<button className="bg-brand hover:bg-brand-light text-white shadow-neon-blue">
```

### 5.7 SVG (fill/stroke)

```svg
<svg fill="#ff33cc" stroke="#68cfff" ...>
```

> Los iconos del registro `@ciszu/ui` usan `currentColor` para heredar el color del contexto.

### 5.8 Rust / Tauri

```rust
// en tauri.conf.json o CSS del frontend
// los colores van en el CSS/HTML de la app (WebView), no en Rust
```

## 6. Consistencia por web

| Web | Tema | Fuentes |
|---|---|---|
| **ciszunetwork** | Negro + brand azul + neon | IBM Plex / IBM Plex Condensed |
| **ciszukoantony** | Negro + brand azul + neon rosa/púrpura | Exo_2 / Rajdhani |
| **muzicmania** | Negro + neon extendido (9 colores) | Exo_2 / Rajdhani / Century Gothic |
| **ciszubot** | Tema claro/oscuro + brand azul + violet | Inter / Exo_2 |

## 7. Colores de marca de terceros (botones sociales)

| Red | Color |
|---|---|
| Discord | `#5865F2` |
| X (Twitter) | `#000000` |
| GitHub | `#333333` |
| YouTube | `#FF0000` |
| WhatsApp | `#25D366` |
| Twitch | `#9146FF` |

## 8. Accesibilidad (contraste)

- Texto blanco sobre `bg-dark #000` ✅ alto contraste.
- Texto `muted #5a6478` sobre `surface #fff` → verificar contraste ≥4.5:1 (revisar al usar).
- Neon sobre negro: bueno para glows, EVITAR texto largo en neon (fatiga visual).
- Regla: **texto principal siempre blanco/gris claro sobre negro**; neon solo para
  acentos, bordes, sombras y elementos cortos.

## 9. Checklist al aplicar color

- [ ] Usar tokens (`var(--color-*)` / clases Tailwind), nunca hex sueltos en componentes.
- [ ] Texto legible: no neon como color de párrafo.
- [ ] Glows: usar los tokens `shadow-*` existentes, no inventar valores.
- [ ] Nuevos colores: añadir al `@theme` de cada web + a este documento.
- [ ] En scripts: usar ANSI directo (sin librerías).

_Última revisión: 13 ago 2026._ Relacionado: `STYLES_SYSTEM.md`, `ICON_SYSTEM.md`,
`TOOLS_SYSTEM.md`, `ARCHITECTURE.md`.
