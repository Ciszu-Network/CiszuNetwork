# NAVIGATION_SYSTEM — Header y páginas de información

Cómo se reparte la navegación en las 4 webs y por qué. Aplica a `ciszu`,
`ciszubot`, `ciszukoantony` y `muzicmania`.

## Regla: dos niveles, sin duplicados

**Nivel 1 — header (navegación primaria).** Producto + secciones vivas del
sitio. Estas seis son secciones de contenido, no documentación, así que van
en el header:

`reviews` · `stats` · `leaderboard` · `downloads`/`download` · `changelog` · `feedback`

**Nivel 2 — desplegable `Information`.** Solo lo institucional y legal:
`information`, `about`, `team`, `faq`, `help`, `documentation`, `support`,
`contact`, `policies`/`terms`/`privacy`, `forum`, `donate`/`donation`.

Un enlace vive en **un** sitio: header **o** desplegable, nunca en los dos.
Esto era el bug original: el desplegable mezclaba secciones vivas con
documentación, se volvía una lista de 17 entradas y el header perdía enlaces
que la gente usa a diario.

## Responsive: lo importante nunca se oculta

El header no puede mostrar 10 enlaces a zoom 100% (1280 px). Cada enlace declara
sus breakpoints en `hideCls` (muzicmania) o en una tabla por índice
(`NAV_HIDE_CLS` en ciszu/ciszubot; `hideCls` en `NavItem` de ciszukoantony).
El orden va de lo más esencial a lo menos y los últimos se ocultan al reducir
el ancho.

**El desplegable `Information` nunca se oculta.** Es el índice del sitio: si se
esconde, se pierde el acceso a todo lo institucional (era el bug reportado en
ciszubot a zoom 100%).

Los enlaces ocultos siguen accesibles desde el menú lateral y la búsqueda
global, que indexan el catálogo completo de páginas.

## Dónde está definida la navegación

| Web | Fuente |
|---|---|
| muzicmania | `src/config/navigation.tsx` — `MAIN_NAV_LINKS`, `HEADER_NAV_LINKS`, `INFO_DROPDOWN_LINKS`, `COMMUNITY_LINKS`, `GENERAL_INFO_LINKS`, `LEGAL_LINKS` |
| ciszukoantony | `src/config/navigation.tsx` — `NAV_MAIN` (enlaces con `hideCls` + grupo `Information`) y `ALL_PAGES` |
| ciszu | `src/components/layout/Navbar.tsx` — `NAV_ITEMS`, `NAV_HIDE_CLS`, `ALL_PAGES` |
| ciszubot | `src/components/layout/Navbar.tsx` — `NAV_PAGES` (header), `INFO_PAGES` (desplegable), `SEARCH_PAGES` |

`ALL_PAGES` / `MAIN_NAV_LINKS` / `SEARCH_PAGES` se mantienen **completos**: son
los que alimentan el menú lateral, la búsqueda y el footer, así que un enlace
puede estar oculto en el header y seguir siendo alcanzable.

## Páginas de información

Las páginas `information`, `about`, `team`, `help` y `faq` comparten estructura
en las 4 webs (la de referencia es MuzicMania) usando los bloques de
`@ciszu/ui`:

- `InfoHero` — icono + título + bajada.
- `InfoLinkGrid` — índice por grupos (páginas de navegación).
- `InfoCardGrid` — tarjetas de contenido (qué es, stack, valores, roles).
- `InfoSteps` — pasos numerados (empezar, colaborar, solución de problemas).
- `InfoAccordion` — FAQ desplegable.
- `InfoCtaRow` — acciones finales.

El tema se inyecta por props (`accent`, `accentBg`, `accentBorder`, `card`,
`border`, `gradient`) para que cada web conserve su paleta. Los iconos son
nombres del registro real (`shared/icons/svg`) servido por el CDN: los nombres
fuera del registro caen a `<img>` remoto y **no** toman `currentColor`, por eso
se usan solo nombres registrados (`history`, `star`, `trophy`, `signal`,
`download`, `message`, `comment`, `support`, `help`, `faq`, `team`, `mail`,
`lock`, `terms`, `certificates`, `policies`, `rocket`, `gamepad`, `info`).

## Donaciones: Ko-fi NO se puede incrustar

`https://ko-fi.com/<usuario>/?embed=true` **no se puede** mostrar en un
`<iframe>`: Ko-fi responde con

```
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self';
```

así que el navegador rechaza el marco con `ERR_BLOCKED_BY_RESPONSE` y el
usuario ve «ko-fi.com rechazó la conexión». No es la CSP del sitio ni un
problema del CDN: es una decisión de Ko-fi y no se puede saltar desde el
cliente.

La integración soportada (y la que se usa) es un **panel de enlace**:
`KoFiPanel` de `@ciszu/ui` dibuja el SVG real de Ko-fi del CDN y abre el perfil
en una pestaña nueva, sin scripts de terceros, sin CSS remoto y sin imágenes
externas. Si en el futuro se quiere el botón oficial de Ko-fi
(`storage.ko-fi.com/cdn/widget/Widget_2.js`), la CSP ya permite
`storage.ko-fi.com` en `script-src` e `img-src`.

NOWPayments sí permite embed y su iframe se mantiene.

## Verificación

`tmp/verify-nav.mjs` (Playwright) comprueba en el build de producción:

1. que las seis secciones movidas están en el header;
2. que el desplegable `Information` **no** las contiene;
3. que `Information` sigue visible a 1280 px;
4. que `/information`, `/help`, `/about`, `/team` y `/faq` cargan con HTTP 200;
5. que `/donate` no tiene ningún `iframe` de `ko-fi.com` y sí un enlace válido;
6. que no hay errores de consola.

## Pendiente conocido

`ciszubot` registra un aviso de hidratación de React (`#418`) en todas sus
páginas, incluida `/`, que no entra en este trabajo. La causa está localizada:
el script de AdSense reescribe su propio `<script>` dentro del `<head>` antes de
que React hidrate, así que el árbol del `<head>` no coincide. React regenera ese
subárbol, no rompe la UI. Se arregla cargando AdSense con `next/script`
`strategy="afterInteractive"` (dejando el script estático solo para la
verificación de Google), y queda como tarea aparte.
