# Sistema de Iconos — Ciszu Network

> Documenta los dos sistemas de iconos en uso, sus diferencias, ventajas/desventajas
> y el plan de migración hacia el sistema unificado.

## Sistemas en uso

| Sistema | Dónde se usa | Render | Assets dinámicos/CDN | Purificación |
|---|---|---|---|---|
| **`@ciszu/ui` → `Icon` + registry generado** | ciszubot, ciszunetwork, ciszukoantony | Inline SVG (sin red) o `<img>` CDN | ✅ Sí: inline-first → CDN → recall local → oculto | ⚠️ DOMPurify en cliente; sin `window` no sanitiza (guard SSR) |
| **lucide-react + SVG nativos + sprites propios** | muzicmania (legado) | Inline SVG (bundle) | ❌ No | ✅ Sin necesidad: no hay `dangerouslySetInnerHTML` |

## Sistema compartido `@ciszu/ui`

- `packages/ui/src/Icon.tsx` — componente `Icon` con estrategia híbrida:
  1. **INLINE-FIRST**: si el nombre está en el registro generado (`generated/icon-registry.ts`), renderiza SVG inline — sin red, coloreable (`currentColor`).
  2. **FALLBACK CDN**: nombres no registrados → `<img>` al CDN dinámico (`assetResolver`).
  3. **RECALL LOCAL**: si el CDN falla (onError) → ruta local → oculto si tampoco existe.
- `packages/ui/src/generated/icon-registry.ts` — archivo **GENERADO** desde el catálogo canónico `shared/icons/svg/{outline,filled,flags}` con `node scripts/generate-icon-registry.js` (lista curada `ICON_LIST` en el script; añadir nombres nuevos ahí).
- Las 4 apps dependen de `@ciszu/ui`.

### Purificación (verificación correcta)

- El SVG del registro se inyecta con `dangerouslySetInnerHTML` → debe sanitizarse con DOMPurify.
- **SSR (Node)**: `DOMPurify.sanitize` NO existe sin `window` → guard obligatorio:
  `typeof window === 'undefined' ? entry.inner : DOMPurify.sanitize(entry.inner, sanitizeConfig)`
  (fuente = SVGs propios del repo generados desde `shared/icons`, no hay input de usuario).
- **Semgrep CI**: la regla `react-dangerouslysetinnerhtml` bloquea si no ve `DOMPurify.sanitize` directo;
  con el ternario no la reconoce → se usa `/* nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml */`
  en la misma línea del uso (documentado en `Icon.tsx`).
- Regresión conocida (2 ago 2026): quitar el guard SSR rompió TODOS los iconos inline de las webs
  que usan `@ciszu/ui` (TypeError en SSR). NO eliminar ese guard.

### Bug conocido: iconos que se pierden en navegación (2 ago 2026, sin arreglar)

- **Síntoma**: los iconos se muestran al cargar (SSR inline), pero al rato o al cambiar de página
  (navbar) se pierden. Consola: `shield.svg:1 Failed to load resource: 404` y `gift.svg:1 404`.
- **Datos verificados**:
  - `gift` y `shield` SÍ existen en `packages/ui/src/generated/icon-registry.ts` (SVGs Font Awesome,
    líneas ~137/142).
  - Los archivos `shared/icons/svg/outline/gift.svg` y `outline/shield.svg` NO existen en disco
    (solo `filled/`); el registro los contiene igualmente (ICON_LIST curada del script).
  - El fallback CDN no puede servirlos: `ciszu-cdn` no tiene esos paths → 404.
- **Hipótesis a investigar al arreglar**: en navegación cliente `getIcon(style, name)` devuelve
  `undefined` para esos nombres (¿style pedido distinto al registrado? ¿hidratación del módulo
  `'use client'`? ¿nombres sin archivo fuente en `shared/icons/svg`?) → el componente cae al
  fallback CDN en vez de renderizar inline.
- **Pendiente trackeado**: toDo de ciszubot (Prioridad Media).

### Cómo añadir un icono al sistema compartido

1. Crear `shared/icons/svg/outline/<nombre>.svg` y/o `filled/<nombre>.svg` (path Material 24x24).
2. Añadir `<nombre>` a la `ICON_LIST` de `scripts/generate-icon-registry.js` si no está.
3. `node scripts/generate-icon-registry.js` → regenera `icon-registry.ts`.
4. Verificar: el nombre debe aparecer en `outline`/`filled` del registro.
5. Build + deploy (los cambios de `packages/**` disparan los deploys de las 4 apps).

## Sistema legado de muzicmania

- Formularios/auth: iconos **lucide-react** (`I.mail`, `I.lock`, `I.user`, `I.globe`, `I.phone`…).
- StatsTicker: lucide (`Users`, `Gamepad2`, `Trophy`, `Star`).
- `AuthFeedback`: SVG nativos inline (componentes React, sin strings HTML).
- Banderas: sprites propios `/icons/sprites/sprite-flags.svg` (FlagIcon, FlagVE, CountrySelect).

### Por qué es seguro sin sanitizar

Los iconos son componentes React pre-compilados de un vendor confiable → JSX real, nunca strings HTML
→ sin `dangerouslySetInnerHTML` → sin superficie XSS → semgrep no los marca.

### Limitaciones

- Solo iconos existentes en el paquete: sin catálogo propio, sin CDN, sin fallback.
- No permite assets dinámicos/desconocidos (logos, covers, generados).

## Veredicto

- **Dinámicos/CDN**: solo `@ciszu/ui`.
- **Purificación**: lucide es "safe por diseño" (no sanitiza nada); `@ciszu/ui` purifica bien con el guard SSR.
- **Recomendación**: páginas nuevas → `<Icon name="..." />` de `@ciszu/ui` (mismo sistema en las 4).

## Migración futura (muzicmania)

- [ ] Migrar lucide-react → `@ciszu/ui` Icon en muzicmania: verificar que los iconos usados existan en
  `shared/icons/svg` (o añadirlos al registro), sustituir imports, mantener sprites de banderas
  (o migrarlos a `flag` del registry).
- [ ] Evaluar si el sistema `Icon` de `@ciszu/ui` necesita una variante sin DOMPurify para SSR puro
  (o mantener el guard documentado arriba).
- Beneficios: CDN + fallback + catálogo propio unificado en las 4 apps.
