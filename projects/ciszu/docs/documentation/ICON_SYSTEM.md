# ICON_SYSTEM — Sistema de Iconos (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: ICON_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

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

## Catálogo canónico de iconos (`shared/icons/svg`)

| Estilo | Carpeta | Ejemplos |
|---|---|---|
| **Outline** | `shared/icons/svg/outline/` | Iconos Material 24x24 de trazo fino |
| **Filled** | `shared/icons/svg/filled/` | Iconos Material 24x24 rellenos |
| **Flags** | `shared/icons/svg/flags/` | Banderas (ve, us, co...) |

- El registro (`icon-registry.ts`) se genera con `node scripts/generate-icon-registry.js`
  (lista curada `ICON_LIST`; añadir nombres nuevos ahí).
- **Nunca duplicar SVGs en las apps**: los iconos viven solo en `shared/icons/svg`.

## Cómo añadir un icono (protocolo actualizado)

1. Crear `shared/icons/svg/outline/<nombre>.svg` y/o `filled/<nombre>.svg` (path Material 24x24).
2. Añadir `<nombre>` a la `ICON_LIST` de `scripts/generate-icon-registry.js` si no está.
3. `node scripts/generate-icon-registry.js` → regenera `icon-registry.ts`.
4. Verificar: el nombre debe aparecer en `outline`/`filled` del registro.
5. Build + deploy (los cambios de `packages/**` disparan los deploys de las 4 apps).
6. Test: comprobar que el icono se renderiza inline (SSR + navegación SPA).

## Buenas prácticas de uso

- **Siempre** `<Icon name="..." />` de `@ciszu/ui` en páginas nuevas.
- No mezclar lucide-react con `@ciszu/ui` en el mismo componente (coherencia visual).
- Iconos decorativos con `aria-hidden="true"`; iconos funcionales con `aria-label`/`title`.
- Mantener `currentColor` para heredar el color del contexto (tema claro/oscuro).
- Para banderas de países usar `style="flags"` del registry (o sprites si aún no migrado).

## Estado y métricas

- **Iconos en el registro**: ~5.194 SVGs en `shared/icons/` (contador del repo).
- **Apps usando el sistema compartido**: ciszubot, ciszunetwork, ciszukoantony (3/4).
- **Pendiente**: muzicmania (migración lucide → `@ciszu/ui`), sprites de banderas.

## Arquitectura del registro de iconos

- **Fuente**: `packages/cdn/src/shared/icons/**` (SVG) — el directorio espejo del CDN.
- **Registro generado**: `icon-registry.ts` (generado por `scripts/generate-icon-registry.js`).
- **Componente público**: `<Icon name={...} />` de `@ciszu/ui` → importa el SVG correcto,
  renderiza inline (sin petición HTTP extra) y respeta `currentColor`.
- **Nombres**: kebab-case basado en el path relativo (ej. `music-note`, `brand-discord`).
- **Familias**: `style="outline|fill|flags"` para agrupar variantes de un mismo icono.

## Cómo añadir un icono nuevo

1. Colocar el `.svg` en el subdirectorio correcto de `shared/icons/`.
2. Ejecutar `node scripts/generate-icon-registry.js` (regenera `icon-registry.ts`).
3. Build/typecheck: `pnpm --filter ciszunetwork-website build` (o la app afectada).
4. Usar `<Icon name="nuevo-icono" />` y verificar inline en SSR + navegación SPA.
5. Actualizar `STATISTICS_SYSTEM.md` (contador) y este doc si cambia el total.

## Convenciones de naming

- Minúsculas + guiones (kebab-case), sin espacios ni acentos.
- Prefijo opcional de marca para variantes: `brand-*` (Discord, YouTube, TikTok…).
- Sufijo de estilo solo cuando hay variantes: `-fill`, `-outline` (o carpeta por familia).
- Evitar nombres ambiguos (ej. `save` vs `disk`) — elegir el más descriptivo.

## Troubleshooting

| Problema | Solución |
|---|---|
| Icono no aparece tras añadirlo | Regenerar registry + reiniciar dev (cache de types) |
| `name` desconocido en build | El type del `name` se deriva del registry → typecheck lo marca |
| Icono se ve gigante | Comprobar `viewBox` del SVG (debe ser 24x24) |
| Icono no hereda color | Falta `fill="currentColor"`/`stroke="currentColor"` en el SVG |
| Icono roto en PWA | El SVG debe estar en `shared/icons` (fuente única) |

## Estándar técnico del SVG (formato del catálogo)

- **Canvas**: 24x24 px con `viewBox="0 0 24 24"` (escala correcta al render inline).
- **Estilo**: trazo fino para `outline/` (stroke, `stroke-width` 1.5–2, redondo) y relleno plano para `filled/`.
- **Color**: usar `fill="currentColor"` y/o `stroke="currentColor"` para heredar el tema (claro/oscuro).
- **Optimización**: eliminar metadatos, comentarios y grupos innecesarios; un solo path cuando sea posible;
  idealmente <1 KB por icono. Validar con un validador de SVGs antes de subirlo.
- **Accesibilidad**: el componente añade `aria-hidden="true"` en iconos decorativos y `aria-label`/`title`
  en los funcionales; el catálogo no embebe `title`/`desc` (lo pone el consumidor).

## Rendimiento y bundle

- El registro se importa por demanda: solo trae los SVGs que existen en él; lucide-react (legado)
  soporta tree-shaking por importación nombrada.
- El fallback CDN evita incluir en el bundle los nombres desconocidos; por eso conviene mantener la
  `ICON_LIST` curada y no añadir SVGs sin necesidad.
- Un icono inline cuesta 0 peticiones HTTP extra frente a un `<img>`, a cambio de unos cientos de bytes
  en el bundle.
- Criterio: iconos de uso puntual y pesados → CDN fallback; iconos repetidos en la UI → inline.

## FAQ del sistema de iconos

| Pregunta | Respuesta |
|---|---|
| ¿Puedo añadir un icono solo para una web? | Sí mientras exista en `shared/icons/svg`; el registro es global |
| ¿Por qué no usar lucide en todas? | `@ciszu/ui` ya cubre CDN + fallback; lucide queda como legado de muzicmania |
| ¿Un SVG de otra fuente? | Normalizarlo a 24x24 y `currentColor` antes de entrar al catálogo |
| ¿Los sprites de banderas? | Se mantienen hasta migrarlos a `style="flags"` del registry |
| ¿Se pierden iconos en navegación? | Bug conocido documentado arriba: revisar guard SSR y fallback CDN |

## Relación con otros sistemas

- `MEDIA_FORMATS_SYSTEM.md` — formatos de los assets multimedia del CDN.
- `CDN_SYSTEM.md` — resolución de assets dinámicos cuando no hay registro inline.
- `STATISTICS_SYSTEM.md` — contador de SVGs del catálogo (~5.194).
- `TOOLS_SYSTEM.md` — script `generate-icon-registry.js` y demás generadores.
- `SECURITY_PROTOCOLS.md` — regla `dangerouslySetInnerHTML` + DOMPurify / guard SSR.

_Última revisión: 13 ago 2026._ Relacionado: `MATERIAL_ICONS_PROTOCOLS.md`, `MEDIA_FORMATS_SYSTEM.md`,
`CDN_SYSTEM.md`, `TOOLS_SYSTEM.md`.
