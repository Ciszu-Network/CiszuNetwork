# STATIC_MIGRATION_PLAN — Migración a render estático (SSG/ISR/PPR) y reducción del consumo de Vercel

Versión: 3.0.0
Actualización: 2026-09-29
Identificador: STATIC_MIGRATION_PLAN_V3.0.0_2026_09_29_ciszunetwork

> **Definición**: plan completo y ejecutable para devolver las 4 webs del ecosistema
> (CiszuNetwork, CiszukoAntony, MuzicMania, CiszuBot) a terreno seguro en el fair-use de
> Vercel Hobby (Fluid Active CPU ≤4 h · Fast Origin Transfer ≤10 GB) **sin degradar la
> experiencia**: quick wins medibles, migración a render estático/ISR, i18n en cliente sin
> rutas, verificación de cada fase y blindaje permanente.
>
> **Estado: EJECUTADO (29 sep 2026).** Las Fases 0-4 están desplegadas y commiteadas
> (`dec44c46` → `cee03153`); el reporte de ejecución está en §11. La **Fase 5** queda
> activa como protocolo de verificación post-deploy 24/48/72 h (§12), alertas y
> presupuesto (§13), con los pendientes declarados en §14. La ventana de no-deploy quedó
> cerrada por la autorización de ejecución del dueño; la cortesía 3× sigue reservada como
> colchón (§1.4). La cuenta ya no está bloqueada (402 levantado), pero el uso sigue por
> encima de los límites incluidos: la reducción debe confirmarse en la verificación (§12).

---

## 1. Resumen ejecutivo

### 1.1 Causa raíz

Cada visita a las webs ejecuta una función de render dinámico: los 4 layouts raíz leen
`cookies()`/`headers()` (i18n por cookie, `x-pathname` inyectado por middleware), el
middleware corre en toda request no estática y varias páginas sondean APIs o hacen
`HEAD /` periódicamente. El resultado medido es **42,7 ms de Fluid Active CPU por
invocación media**, un promedio que solo cuadra con renders de página completos. Con
~1M de invocaciones en la ventana, eso da **11 h 46 m de CPU para un límite de 4 h**.

### 1.2 Estado actual (28 sep 2026, ventana rodante de 30 días)

| Métrica | Consumo | Límite Hobby | % | Lectura |
|---|---|---|---|---|
| **Fluid Active CPU** | 11 h 46 m | 4 h | **294%** | Excedido; causa estructural (§2). |
| **Fast Origin Transfer** | 10,17 GB | 10 GB | **102%** | HTML/RSC dinámico función→edge. |
| **Function Invocations** | 991 K | 1 M | **99%** | A un 1% del límite. |
| CDN Requests | 557 K | 1 M | 56% | Las estáticas no son el problema. |
| CDN Request CPU (edge) | 6 m 15 s | 1 h | 10% | Middleware caro, pero no es el límite. |
| Fluid Provisioned Memory | 38,9 GB-Hrs | 360 | 11% | Instancias, no CPU. |
| Functions Storage | 6,42 GB | 10 GB | 64% | Empaquetado; fuera de alcance. |

- La **cuenta ya no está bloqueada**: el serving de las 4 webs está restaurado. El bloqueo
  anterior (402 `DEPLOYMENT_DISABLED` en serving, reportado como DOWN por UptimeRobot) fue
  fair-use, no una caída de infraestructura.
- El medidor es una **ventana rodante de 30 días** sin ciclo de facturación en Hobby: la
  CPU de hoy sigue en la ventana y solo baja cuando salen los días viejos. Sin cambios,
  el exceso de CPU persiste y se renueva con el tráfico.
- **Vercel ofrece a esta cuenta un aumento de cortesía 3× durante 30 días, una sola vez**
  (según la comunicación, deja los límites efectivos en 16 h/12 h). Es la segunda palanca
  de este plan, nunca la solución (§1.4).

### 1.3 Objetivo

Con el tráfico actual, sin cambiar lo que el usuario ve:

| Métrica | Hoy | Objetivo | Margen |
|---|---|---|---|
| Fluid Active CPU | 11 h 46 m | **< 1,5 h** | ≥2,6× bajo el límite de 4 h |
| Fast Origin Transfer | 10,17 GB | **< 4 GB** | 2,5× bajo el límite de 10 GB |
| Function Invocations | 991 K | < 300 K | 3,3× bajo el límite de 1 M |
| Experiencia | — | Sin parpadeos, sin rutas nuevas, auth/editores intactos | — |

### 1.4 Las dos palancas

1. **Reducir consumo (palanca estructural, Fases 0-5)**: quick wins seguros + estático/ISR
   + i18n en cliente + middleware mínimo + verificación. Es la única que sostiene el
   margen a 12 meses. Estimación global (detalle en §7): CPU ~0,5-2 h · FOT ~1-3 GB.
2. **Cortesía 3× durante 30 días, una sola vez (palanca temporal)**: sube los límites
   (Fluid CPU 4 h → 12 h; FOT 10 GB → 30 GB; invocaciones 1 M → 3 M). Con el consumo
   actual, la CPU quedaría al borde (11 h 46 m vs 12 h) y al expirar el problema vuelve.
   **Uso recomendado: reservarla como colchón de seguridad** si algo inesperado ocurre
   durante la migración, no quemarla como primera medida. Decisión del dueño en §9.

### 1.5 Decisión vigente: cero deploys

Hasta nuevo aviso de Ciszuko Antony **no se despliega nada**. Todas las fases de este plan
quedan bloqueadas esperando aprobación explícita; la Fase 0 (mediciones y alertas, sin
deploy) también espera visto bueno, aunque no toca producción. Este documento es el plan
completo para cuando se autorice.

## 2. Diagnóstico de consumo real

### 2.1 Números de la ventana rodante (Hobby, team ciszunetwork)

Ver tabla completa en §1.2. Dato derivado clave: **42.360 s de CPU / 991.000 invocaciones
≈ 42,7 ms de Active CPU por invocación media**.

### 2.2 Qué implica el ratio de 42,7 ms/invocación

El promedio solo cuadra con un mix dominado por **renders de página completos** (~55-70 ms),
no por APIs baratas (~2-8 ms). Es decir: el grueso del CPU no son las APIs ni el
middleware; son las visitas que ejecutan un render dinámico completo por no poder
servirse de CDN. Cualquier recorte que no baje los renders no baja la CPU de forma
significativa.

### 2.3 Mapa de consumidores verificados en código

**a) Middleware (corre en toda request no estática, incluida `/api/*`).**
- Matcher amplio e idéntico en las 4 webs: `projects/ciszu/website/src/middleware.ts:121-123`
  (y equivalentes en `ciszukoantony`, `muzicmania`, `ciszubot`).
- Por request: cabeceras de seguridad + **CSP construida por request**
  (`buildCsp(...)` en `packages/utils/src/csp.ts:73-116`: ~13 directivas y ~100 orígenes
  con `.map`/`.join` por visita); headers internos (`x-pathname` en antony/muzicmania,
  `x-is-edit`/`x-is-bare` en ciszu); **IAST** con 7 regex sobre el path y 2-3 escaneos por
  parámetro (`packages/utils/src/iast.ts:201-222`); copia de `Headers` del request.
- Corre en Edge (no Fluid CPU), pero paga una vez por cada request, incluidos los sondeos
  de API baratos de §b.

**b) `/api/*` por visitante.**
- **`GET /api/ads/push`**: existe en las 4 webs; en producción responde `{enabled:false}`
  (`projects/ciszu/website/src/app/api/ads/push/route.ts:18-21`), pero el cliente lo
  sondeaba **cada 1,5 s por pestaña abierta** (`packages/ui/src/Ads.tsx:734-749`).
  **APLICADO (28 sep)**: guard `NODE_ENV === 'development'` (solo devcon). Los pushes
  globales siguen por Supabase (20 s; no toca Vercel).
- `POST /api/ads/impression`: 1 invocación por impresión mostrada, cross-site hacia
  ciszunetwork (`packages/ui/src/Ads.tsx:462` → `ciszu/.../api/ads/impression/route.ts:20-48`,
  rate limit 60/min). Tráfico legítimo y acotado.
- `GET /api/leaderboard` (MuzicMania y CiszuBot): caché en memoria 60 s,
  `force-dynamic` y sin cabeceras CDN (`muzicmania/.../api/leaderboard/route.ts:6,16-66`).
  **APLICADO (28 sep)**: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- Dev-only: `/api/ads/debug` (sondeo 2 s, `Ads.tsx:694-708`) y `/api/changelogs/debug`.
- `GET/HEAD /api/ping` (muzicmania) solo al cambiar el estado de red
  (`muzicmania/website/src/hooks/useNetworkStatus.ts:15`); `/api/build-status` no tiene
  cliente que lo llame.
- Auth/2FA/Puck/webhooks: fuera del tráfico de visita (se quedan como están).
- **Polling de cliente que NO pasa por Vercel** (pero sí por Supabase): GlobalAdvisor 20 s
  (`packages/ui/src/GlobalAdvisor.tsx:46,205-209`), GlobalDisclaimer 20 s
  (`Disclaimer.tsx:754-756,810`), changelogs 20 s (`usePublishedChangelogs.ts:131-132,214`),
  estado del bot 60 s (`ciszubot/.../useLiveBotStatus.ts:48`), stats 30 s (ver d).
- `GlobalAdvisorConfirm` (RSC montado en los 4 layouts): hace fetch a Supabase por render,
  pero es **no-op en Vercel** (`packages/ui/src/server/GlobalAdvisorConfirm.tsx:20,39`:
  `IS_BUILD` incluye `VERCEL=1`). Candidato a eliminarlo del render.

**c) i18n por cookies (fuerza dinámico todo el árbol).**
El idioma se resuelve con `cookies()` (y `headers()` en 3 webs) en los 4 layouts raíz:
`ciszu/.../layout.tsx:73-78`, `ciszukoantony/.../layout.tsx:39-41,69-73`,
`muzicmania/.../layout.tsx:36-37,65-66`, `ciszubot/.../layout.tsx:64-69`; y en páginas
server de CiszuNetwork vía `lib/i18n-server.ts:12-16` (about, projects, donate, feedback…).
Los diccionarios son objetos estáticos ya construidos (`getDict` en `lib/i18n.ts:939`) →
parsearlos no cuesta; **el coste es que `cookies()`/`headers()` ópticamente hacen
dinámica la ruta entera**, anulando incluso los `revalidate = 60` ya declarados
(`ciszubot/.../page.tsx:6,42-43`; `about/page.tsx:19`; `help/page.tsx:11`; `team/page.tsx:36`).

**d) Datos por request.**
La mayoría de páginas son `'use client'` y consultan Supabase desde el navegador (reviews,
stats, disclaimers, changelogs, ads globales), así que el I/O en render es poco: el caso
server es `getBotStatus` en el home de CiszuBot (`fetch` con `next.revalidate=60` anulado
por `cookies()`, `page.tsx:14-43`). El hallazgo grande está en cliente: **las páginas
`/stats` de ciszu, antony y ciszubot hacían `HEAD /` cada 30 s** mientras están abiertas
(`stats/page.tsx:85-86,141-143` las tres) → cada sondeo era **un render dinámico completo**.
**APLICADO (28 sep)**: HEAD a `/sitemap.xml` (estático y fuera del matcher del middleware)
en las tres.

**e) Fuentes de invocaciones.**
(1) Render dinámico por visita (layout) ≈ 55-70% del total y >90% del CPU; (2) **prefetch
de `<Link>`**: ninguna web usa `prefetch={false}` y las navbars tienen 7-13 enlaces
(`ciszu/Navbar.tsx`, `muzicmania/Navbar.tsx`, `ciszubot/Navbar.tsx`); **sin `loading.tsx`
en ninguna web** (glob verificado), el volumen real de prefetch debe medirse en
Observability; (3) sondeos de APIs (§b, ya recortados en parte); (4) sitemaps/robots ya son
`force-static` (`*/sitemap.ts:2-5`) y no consumen; (5) bots/auditores (UptimeRobot ya
espaciado, §6).

### 2.4 Causa raíz común

**Todo cuelga del layout raíz**, y una sola lectura de `cookies()` o `headers()` en el
árbol óptica la ruta completa a dinámica. El i18n por cookie y la inyección de
`x-pathname` desde middleware son, hoy, los dos disparadores principales. A eso se suman
prefetch sin límite, sondeos de cliente y APIs públicas sin caché de CDN. Cualquier plan
que no retire esas lecturas del layout raíz no arregla el problema de fondo.

### 2.5 Marco fair-use (por qué puede repetirse)

Hechos verificados con fuentes oficiales (28 sep 2026):

| Pregunta | Respuesta | Fuente |
|---|---|---|
| ¿Hay ciclo de facturación en Hobby? | No. "As the Hobby plan is a free tier there are no billing cycles [...] you will have to wait until 30 days have passed before you can use the feature again". | https://vercel.com/docs/plans/hobby#hobby-billing-cycle |
| ¿Cada cuánto se resetea el medidor? | Ventana **rodante de 30 días**: la pestaña Usage muestra "Last 30 days" y el uso de hace 31+ días cuenta como anterior, no actual. | https://github.com/vercel/community/discussions/4084 |
| ¿El 402 de serving se levanta solo? | No está garantizado: los proyectos se reanudan de uno en uno y nunca automáticamente. | https://vercel.com/kb/guide/why-is-my-account-deployment-blocked · https://community.vercel.com/t/hobby-plan-remains-paused-after-30-day-usage-reset/43093 |
| ¿Y el soft-block de deployments? | Mismo origen: bloques por límite/fair-use. | https://vercel.com/docs/errors/deployment_disabled |
| ¿Se puede acelerar el desbloqueo sin pagar? | No hay auto-desbloqueo público documentado; la vía es el email de Vercel y el soporte. | https://vercel.com/docs/limits · https://community.vercel.com/t/hobby-team-disabled-with-deployment-disabled-request-to-unpause/48766 |

Conclusión operativa: **un segundo exceso reincide**. La única salida sostenible en Hobby
es que el consumo quede holgadamente por debajo de los límites. Límites Hobby relevantes:
4 h de Active CPU, 360 GB-horas de memoria provisionada, 1M de invocaciones, 1M de Edge
Requests, 100 GB Fast Data Transfer, 10 GB Fast Origin Transfer
(https://vercel.com/docs/limits/fair-use-guidelines).

## 3. Base técnica: estático primero

### 3.1 Qué dice la industria

- Next.js recomienda renderizar estático por defecto y usar APIs dinámicas (`cookies()`,
  `headers()`, `searchParams`) solo cuando la ruta realmente lo necesita; cada API
  dinámica óptica la ruta a dinámica y a ejecución por request:
  https://nextjs.org/docs/app/guides/caching
- Los sitios grandes (marketing, docs, portales de contenido) sirven HTML pre-renderizado
  desde CDN y reservan SSR para lo personalizado:
  https://vercel.com/solutions/marketing-sites
- ISR permite pre-renderizar y revalidar por tiempo o bajo demanda:
  https://nextjs.org/docs/app/guides/incremental-static-regeneration
- PPR combina shell estático cacheado con huecos dinámicos en streaming:
  https://nextjs.org/docs/app/guides/partial-prerendering
- Fluid compute cobra Active CPU (solo mientras el código corre) y Provisioned Memory
  (mientras la instancia vive). El render estático servido de CDN no consume ninguno:
  https://vercel.com/docs/fluid-compute · https://vercel.com/docs/functions/usage-and-pricing

### 3.2 Fortalezas del render estático para este monorepo

| Beneficio | Efecto concreto |
|---|---|
| Coste por visita ~0 en Fluid CPU | La visita cacheada no invoca función; el HTML sale del CDN |
| Menos Fast Origin Transfer | Sin respuesta función→edge por cada visita |
| Menos superficie de fallo | Sin cold starts, sin timeouts de DB en el path de render |
| TTFB menor | HTML en edge cache, no ida y vuelta a origen |
| Escala gratis | Un pico de tráfico no dispara invocaciones ni CPU |
| Cache compartida | Un render sirve a miles de visitas (ISR) |
| Menos líos de fair-use | Deja margen para lo verdaderamente dinámico (APIs, auth, stats) |

### 3.3 Debilidades y contras (honestas)

| Contra | Detalle | Mitigación |
|---|---|---|
| Frescura | El HTML puede quedar desfasado hasta el `revalidate` | ISR corto + revalidación on-demand por tag |
| Personalización | Un HTML estático no conoce al usuario | Shell estático + datos de usuario vía API/client |
| i18n | El idioma debe resolverse sin `cookies()` si se quiere estático | §4 Fase 3 |
| Auth | UI de sesión en HTML cacheado se congela | `AuthProvider` cliente y rutas de cuenta 100% dinámicas |
| Builds | Pre-renderizar N rutas × M idiomas alarga el build (límite Hobby: 45 min) | Generar subset y dejar el resto on-demand |
| Invalidación | Hay que saber cuándo revalidar | Tags + webhooks + `revalidatePath` |
| Datos vivos | Stats, reviews y contadores cambian | ISR corto o fetch cliente contra API |

### 3.4 i18n sin rutas ni subdominios: opciones evaluadas

Requisito: auto-detectar país/idioma como google.com (misma URL, sin `/es` ni
`es.sitio.com`) sin romper el render estático.

**Opción A — Client-side puro (base estática + swap en el navegador)**
El HTML se genera en el idioma base (español) y un script cliente lee
`navigator.languages`/`Accept-Language` (o preferencia guardada) y cambia textos y
`document.documentElement.lang` tras hidratar.
- Fluid CPU: ~0 (todo estático; sin middleware).
- Pros: cero funciones por visita; simple; preferencia en localStorage/cookie.
- Contras: SEO solo del idioma base (Google indexa el HTML inicial); parpadeo si no se
  mitiga; contenido no traducible en el HTML servido.

**Opción B — Detección geo en edge + rewrite invisible a variante prebuilt (opcional,
segunda iteración)**
Middleware lee `x-vercel-ip-country` / `request.geo`
(https://vercel.com/docs/headers/request-headers) y, si el país mapea a otro idioma, hace
`rewrite` (no redirect) a la variante pre-renderizada de ese locale; la URL visible no
cambia. El HTML final sale del CDN; el middleware corre antes de la cache
(https://vercel.com/docs/routing-middleware).
- Fluid CPU: 1 invocación + ~1-3 ms de Active CPU + memoria mínima por request HTML. La
  variante servida es estática (0 CPU de render). El fair-use impone ~50 ms de CPU media
  a middleware edge: https://vercel.com/docs/limits/fair-use-guidelines
- Pros: misma URL para todos; contenido localizado servido ya en el HTML; sin
  `cookies()`: la preferencia explícita (estilo NCR de Google) se guarda en
  cookie/localStorage y el middleware la respeta.
- Contras: el middleware ejecuta en cada request de HTML; sin hreflang real.
- Ajuste fino: matcher que excluya `_next/static`, assets, API y rutas de cuenta; el
  middleware solo decide rewrite.

**Opción C — Middleware + redirect visible a rutas por idioma**
Igual que B pero con `redirect` a `/es/...` (rutas reales); es la opción que Next.js
documenta (https://nextjs.org/docs/app/guides/internationalization).
- Pros: SEO multiidioma real (hreflang). Contras: incumple "sin rutas"; más builds.
- Se conserva como fase futura si SEO multiidioma pasa a ser prioridad.

**Opción D — Cookie en layout + `Vary`/cache por variante**
El layout lee `cookies()` y devuelve idioma; para cachear en CDN habría que variar por
cookie. En la práctica hace la respuesta no compartible.
- Veredicto: es lo que tenemos y lo que causó el problema. **Descartada**.

**Opción E — ISR por locale sin detección (usuario elige)**
Páginas `/es` y `/en` pre-renderizadas; el selector navega; sin middleware.
- Fluid CPU: ~0 para visitas cacheadas. Contras: URLs por idioma; primera visita en el
  idioma por defecto.

| Opción | Coste Fluid CPU por visita | ¿HTML localizado? | SEO multiidioma | ¿Cumple "sin rutas"? |
|---|---|---|---|---|
| A. Client-side | ~0 | Tras hidratar | No | Sí |
| B. Geo + rewrite invisible | 1 invocación + ~1-3 ms (edge) | Sí | No (sin hreflang) | Sí |
| C. Geo + redirect | 1 invocación + ~1-3 ms | Sí | Sí | No |
| D. Cookie + Vary | Render por visitante | Sí | Parcial | Sí (pero caro) |
| E. ISR por locale | ~0 | Por navegación | Sí | No |

**Recomendación**: base opción A (elimina `cookies()` del layout y reaprovecha
`getDict`); evolución opción B solo si hace falta servir el HTML ya localizado en la
primera visita (coste acotado y medible); opción C/E solo si el SEO multiidioma pasa a
ser prioridad.

## 4. Plan por fases (ejecutable)

### 4.0 Reglas de ejecución

- **Gate de despliegue**: rige la ventana de no-deploy hasta nuevo aviso. Ninguna acción
  que llegue a producción se ejecuta sin autorización explícita.
- **Una fase por deploy**: cada fase se despliega y verifica por separado (48-72 h de
  medición) para poder atribuir impacto y hacer rollback limpio. Excepción: los ítems ya
  marcados `[HECHO]` (aplicados el 28 sep antes de esta consolidación).
- **Rollback por ruta**: ante cualquier regresión, la ruta afectada vuelve a
  `force-dynamic` sin revertir la fase completa. Por acción: revert del commit atómico.
- **Regla dura**: nunca cachear respuestas con datos de usuario; esas rutas van
  `force-dynamic` + `Cache-Control: private`. Los checklists `- [ ]` viven en este
  documento; **no** sustituyen ni editan `TODO.md`.

### 4.1 Fase 0 — Baseline, medición y alertas (sin deploy)

**Objetivo**: línea base por proyecto y top de rutas, más alertas antes de tocar nada.
No despliega; también queda a la espera de aprobación.

- [ ] 0.1 Volcar Usage (últimos 30 días) por proyecto a la tabla §2.1 y firmar la línea base.
- [ ] 0.2 Extraer el top 10 de rutas por invocaciones y CPU media en Observability por web.
- [ ] 0.3 Configurar alertas de uso al 80% por email (CPU, FOT, invocaciones); si Hobby no
      lo permite, job local `vercel usage` + `pnpm notify`.
- [ ] 0.4 Confirmar el espaciado de auditores (UptimeRobot, workflows, §6) y congelarlo.
- [ ] 0.5 Fijar presupuesto y criterios de aceptación de Fase 5 (§7) con el dueño.

| # | Acción | Archivo(s):línea | Impacto (CPU · inv · FOT) | Esf. | Riesgo | Verificación | Rollback |
|---|---|---|---|---|---|---|---|
| 0.1 | Baseline Usage 30 d por proyecto | Dashboard Vercel (Usage) | — (medición) | XS | Nulo | Tabla §2.1 completada con fecha | n/a |
| 0.2 | Top rutas por inv/CPU | Observability | — (medición) | S | Nulo | Lista "ruta → inv → CPU media" por web | n/a |
| 0.3 | Alertas al 80% por email | Vercel Settings o script local | — (prevención) | S | Nulo | Correo/prueba de alerta recibido | Desactivar alerta |
| 0.4 | Congelar auditores | UptimeRobot · `.github/workflows/*` | −inv/CPU variable | XS | Nulo | Cron schedules revisados (§6) | Revertir intervalo |
| 0.5 | Aprobar presupuesto y criterios | este doc (§7, Fase 5) | — | XS | Nulo | Aprobación registrada | n/a |

### 4.2 Fase 1 — Quick wins seguros (sin cambio visual)

**Objetivo**: recortar invocaciones y FOT obvios sin tocar UI/UX ni layout. Los ítems
1.1-1.3 ya están aplicados (28 sep); el resto espera aprobación.

- [ ] 1.1 **[HECHO]** Guard dev-only del sondeo `/api/ads/push` (1,5 s → solo devcon).
- [ ] 1.2 **[HECHO]** `/stats`: `HEAD /` → `HEAD /sitemap.xml` (3 webs).
- [ ] 1.3 **[HECHO]** `s-maxage` CDN en `/api/leaderboard` (muzicmania + ciszubot).
- [ ] 1.4 `prefetch={false}` selectivo en enlaces masivos de navbars/footers (4 webs),
      dejando prefetch solo en los enlaces primarios que se midan útiles.
- [ ] 1.5 Quitar `GlobalAdvisorConfirm` del render de los 4 layouts (no-op en Vercel).
- [ ] 1.6 Unificar pollings cliente y pausarlos con `document.hidden` (GlobalAdvisor,
      Disclaimer, changelogs, bot status): alivia Supabase y batería (no Vercel).
- [ ] 1.7 Auditoría de peso de payload HTML/RSC (diccionarios i18n inline, `themeScript`,
      JSON embebido) y verificación de compresión Brotli de Vercel; mover payloads
      grandes a chunks estáticos cacheados.

| # | Acción | Archivo(s):línea | Impacto (CPU · inv · FOT) | Esf. | Riesgo | Verificación | Rollback |
|---|---|---|---|---|---|---|---|
| 1.1 | **[HECHO]** Guard dev-only ads/push | `packages/ui/src/Ads.tsx:734-749` | −2/8% CPU · **−20/45% inv** · ~0 FOT | XS | Nulo | `/api/ads/push` fuera del top de prod | Revertir guard |
| 1.2 | **[HECHO]** Stats HEAD → sitemap | 3 × `app/stats/page.tsx:85-86,141-143` | **−10/20% CPU** · −5/15% inv · −5/15% FOT | XS | Nulo | HEAD `/` ya no genera renders | Revertir URL del HEAD |
| 1.3 | **[HECHO]** s-maxage leaderboard | `muzicmania` + `ciszubot` `api/leaderboard/route.ts:6,16-66` | −1/3% CPU · −2/8% inv · −1/3% FOT | XS | Bajo | `curl -I` muestra `s-maxage=60` | Quitar cabecera |
| 1.4 | Prefetch selectivo | 4 × `Navbar.tsx` + 4 × `Footer.tsx` | −5/15% CPU · −10/35% inv · −5/15% FOT (medir) | S | Bajo (UX nav) | Observability: bajar requests RSC; nav manual fluida | Revertir `prefetch={false}` |
| 1.5 | Quitar `GlobalAdvisorConfirm` del render | 4 × `layout.tsx` + `packages/ui/src/server/GlobalAdvisorConfirm.tsx:20,39` | Ruido de render (marginal) | XS | Nulo | `next build` local sin warnings; advisor siguen OK | Re-añadir el componente |
| 1.6 | Pollings unificados + `document.hidden` | `GlobalAdvisor.tsx:46,205-209` · `Disclaimer.tsx:754-756,810` · `usePublishedChangelogs.ts:131-132,214` · `useLiveBotStatus.ts:48` | No invoca Vercel; alivia Supabase/batería | S | Bajo | Pestaña oculta no consulta; al volver, refresca | Revertir intervalos |
| 1.7 | Peso de payload + Brotli | `layout.tsx` (scripts), `lib/i18n.ts`, chunks RSC | FOT −5/15% | S | Bajo | Peso de HTML/RSC antes/después; `content-encoding` | Revertir cambios de payload |

### 4.3 Fase 2 — Edge/Infra (middleware y cabeceras)

**Objetivo**: abaratar el middleware por request (CDN Request CPU y invocaciones edge) y
preparar cabeceras de caché de HTML. No toca Fluid CPU directamente, pero reduce coste
por request y habilita Fase 4.

- [ ] 2.1 Precomputar CSP a nivel de módulo (una vez por instancia edge) en los 4
      middleware, en lugar de `buildCsp(...)` por request.
- [ ] 2.2 Matcher más estrecho: excluir lo estático ya servido por CDN y evaluar la
      exclusión de `api/*` de la CSP, **manteniendo IAST en endpoints de escritura**;
      revisar `SECURITY_PROTOCOLS.md` antes.
- [ ] 2.3 Definir política de `Cache-Control` HTML para páginas públicas (tras Fase 4):
      `s-maxage` + `stale-while-revalidate` por tipo; nunca con datos de usuario.
- [ ] 2.4 Retirar headers internos (`x-pathname`, `x-is-edit`, `x-is-bare`) cuando sus
      consumidores desaparezcan en Fase 3/Fase 4 (coordinado, no antes).

| # | Acción | Archivo(s):línea | Impacto (CPU · inv · FOT) | Esf. | Riesgo | Verificación | Rollback |
|---|---|---|---|---|---|---|---|
| 2.1 | CSP precomputada a nivel de módulo | 4 × `middleware.ts` + `packages/utils/src/csp.ts:73-116` | −20/40% CPU **edge** (no Fluid) | S | Nulo | Observability: CPU middleware ≤2 ms | Revertir a por-request |
| 2.2 | Matcher más estrecho | 4 × `middleware.ts:121-123` | Menos invocaciones edge · CDN CPU | M | Medio (seguridad) | `security-e2e` + `curl -I` con headers correctos | Revertir matcher |
| 2.3 | Política `Cache-Control` HTML | `next.config.ts` / páginas públicas | −70/90% FOT (con F4) | M | Medio | `curl -I` + `x-vercel-cache: HIT` | Quitar cabecera |
| 2.4 | Retirar headers internos | `middleware.ts` + layouts consumidores | CPU edge + render evitado (con F3) | S | Bajo | Grep sin consumidores; build local OK | Re-añadir header |

### 4.4 Fase 3 — i18n en cliente sin rutas (patrón google.com)

**Objetivo**: que ninguna página de contenido lea `cookies()`/`headers()` en el servidor y
el idioma se resuelva en cliente, manteniendo la misma URL para todos.

**Detalle técnico**:
1. HTML base pre-renderizado en español; `getDict` sigue siendo la fuente de diccionarios.
2. `LangProvider` cliente: preferencia guardada (localStorage/cookie `ciszu_lang`
   compatible) → `navigator.languages` → base `es`; aplica el diccionario y actualiza
   `document.documentElement.lang` tras hidratar.
3. Script inline anti-parpadeo (mismo patrón que `themeScript`,
   `ciszu/.../layout.tsx:60-70`): lee la preferencia antes del primer pintado.
4. `x-pathname` → `usePathname()` en componentes cliente; metadata por segmento
   (`generateMetadata` sin `headers()`); `x-is-edit`/`x-is-bare` se resuelven en cliente o
   se aíslan en los segmentos de editor.
5. Rutas que sí necesitan cookies/headers (auth, dashboard, editores) se aíslan en su
   propio segmento con `force-dynamic`, no en el layout raíz.
6. **Opcional (medir antes)**: middleware geo con `x-vercel-ip-country` + `rewrite`
   invisible a variante prebuilt (opción B), con matcher mínimo y preferencia explícita
   respetada. Coste: 1 invocación + ~1-3 ms por request HTML (edge, no Fluid).

- [ ] 3.1 Retirar `cookies()`/`headers()` de los 4 layouts raíz.
- [ ] 3.2 Crear `LangProvider` + script anti-parpadeo + `lang` dinámico.
- [ ] 3.3 Sustituir `x-pathname`/metadata SSR por `usePathname()`/metadata por segmento.
- [ ] 3.4 Aislar rutas funcionales en segmentos `force-dynamic`.
- [ ] 3.5 (Opcional, solo si se decide) middleware geo + rewrite para HTML localizado.
- [ ] 3.6 Criterio de salida: `next build` marca las rutas de contenido como `○`/`●` y no `ƒ`.

| # | Acción | Archivo(s):línea | Impacto (CPU · inv · FOT) | Esf. | Riesgo | Verificación | Rollback |
|---|---|---|---|---|---|---|---|
| 3.1 | Layouts sin APIs dinámicas | 4 × `layout.tsx:73-78,39-41,36-37,64-69` | **−60/80% CPU** · −50/70% inv · −60/85% FOT | L | Medio (parpadeo i18n) | `next build` local: rutas `○`/`●`; sin flash en navegación | Restaurar lectura de cookie |
| 3.2 | `LangProvider` + anti-parpadeo | `lib/i18n.ts`, nuevos providers (4 webs) | Incluido en 3.1 | M | Medio | Cambio de idioma persiste; primer pintado correcto | Volver a cookie server |
| 3.3 | `x-pathname` → `usePathname()` | `middleware.ts`, `Navbar.tsx`, metadata de muzicmania/antony | Incluido en 3.1 | M | Bajo | Metadata por ruta correcta en build | Re-añadir header |
| 3.4 | Aislar rutas dinámicas | `auth/*`, `dashboard/*`, editores | Evita falsos estáticos | S | Bajo | Build marca `ƒ` solo donde toca | Revertir segmento |
| 3.5 | Middleware geo (opcional) | `middleware.ts` + rutas por locale | +1 inv/HTML · +1-3 ms edge · 0 render | M | Medio (rewrite) | `x-vercel-ip-country` → variante correcta; sin loop | Quitar rewrite |

### 4.5 Fase 4 — Estático/ISR de páginas públicas

**Objetivo**: eliminar el render por visita del contenido público (el >90% del CPU).

**Orden por web**: CiszukoAntony (pocas páginas) → CiszuNetwork (contenido) →
MuzicMania → CiszuBot (más superficie).

**Qué rutas primero**: home, about, projects, donate, feedback, legal
(privacy/terms/policy), faq, credits, information, help, team, docs y `socials/[platform]`
(donde ya existen `generateStaticParams`, extender el patrón). Páginas con datos que
envejecen bien (status del bot, reviews públicas, stats): ISR 60-600 s + tags.

**Qué queda dinámico por diseño**: auth/2FA/sesión, dashboards (`/dashboard`),
editores (Plasmic/Puck), escritura de reviews, stats en vivo (fetch cliente contra API),
APIs (con caché CDN solo las públicas), webhooks.

- [ ] 4.1 Pasar las rutas de contenido a SSG/ISR por web, en el orden acordado.
- [ ] 4.2 `revalidate` + tags y revalidación on-demand en flujos de publicación.
- [ ] 4.3 Añadir `loading.tsx` donde falte (hoy no existe en ninguna web) para transición
      de rutas con datos, verificando el efecto sobre el prefetch.
- [ ] 4.4 Mover el fetch server con `revalidate` anulado (home de CiszuBot) a ISR real.
- [ ] 4.5 (Opcional, tras estabilizar) PPR en páginas mixtas: shell estático + huecos
      dinámicos en streaming (feature experimental de Next 15; verificar compatibilidad).

**Invalidación**: por tiempo (`revalidate` por segmento), por demanda
(`revalidatePath`/`revalidateTag` desde API/webhook tras publicar), y natural por deploy.
Revisar coste ISR antes de revalidaciones agresivas:
https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing

| # | Acción | Archivo(s):línea | Impacto (CPU · inv · FOT) | Esf. | Riesgo | Verificación | Rollback |
|---|---|---|---|---|---|---|---|
| 4.1 | SSG/ISR de páginas públicas | páginas de las 4 webs | Acumulado **−85/95% CPU** y renders → solo revalidaciones | L | Medio (frescura) | `next build`: `○`/`●`; HTML con `x-vercel-cache: HIT` | `force-dynamic` por ruta |
| 4.2 | Revalidación on-demand | APIs de publicación/webhooks | Mantiene frescura | M | Bajo | Publicar → ver contenido nuevo sin deploy | Quitar `revalidateTag` |
| 4.3 | `loading.tsx` | `app/**/loading.tsx` (4 webs) | UX + control de prefetch | S | Bajo | Navegación fluida; medir prefetch en Observability | Eliminar archivo |
| 4.4 | ISR real en home de CiszuBot | `ciszubot/.../page.tsx:14-43` | Elimina render por visita del home | S | Bajo | Home servido de CDN con `revalidate=60` | Volver a fetch por request |
| 4.5 | PPR (opcional) | páginas mixtas | CPU ~0 en shell | L | Medio (experimental) | Build + QA visual | Desactivar feature |

### 4.6 Fase 5 — Verificación y blindaje

**Objetivo**: confirmar el resultado, fijar umbrales y evitar regresiones futuras.

- [ ] 5.1 Medir 48-72 h tras cada fase desplegada y comparar con la línea base (§2.1).
- [ ] 5.2 Alertas al 80% activas (§4.1) + **umbral de congelación al 90%**: pausar
      auditorías externas y abrir revisión antes de acercarse al límite.
- [ ] 5.3 Presupuesto de CPU por tipo de ruta (tabla siguiente) y vigilancia del ratio
      ms/invocación en Observability.
- [ ] 5.4 Criterios de aceptación (abajo) cumplidos con el tráfico actual.
- [ ] 5.5 Documentar rutas estáticas nuevas en `STATUS_SYSTEM.md`/`PROJECTS_SYSTEM.md`.
- [ ] 5.6 Regla permanente: **ningún layout raíz lee `cookies()`/`headers()`**; toda
      personalización va a segmento propio `force-dynamic`. Revisión en cada PR/build.

**Presupuesto de CPU por ruta**:

| Tipo de ruta | Presupuesto | Medición |
|---|---|---|
| HTML estático servido de CDN | 0 ms (sin función) | CDN Requests, no Functions |
| Middleware | ≤2 ms por request HTML | Observability middleware |
| API pública cacheada | ≤5 ms por invocación no cacheada | Top functions |
| API de escritura (rate-limited) | ≤20 ms | Top functions |
| Render dinámico (auth/dashboard) | ≤50 ms p95 | Top functions |
| Revalidación ISR | ≤100 ms por revalidación | Logs de runtime/build |

**Criterios de aceptación (tráfico actual)**: CPU < 1,5 h · FOT < 4 GB · invocaciones
< 300 K · sin 402 · sin regresiones en auth/login/2FA, dashboards, ads, cambio de idioma
y reviews · Observability sin renders de página para contenido público.

| # | Acción | Archivo(s):línea | Impacto (CPU · inv · FOT) | Esf. | Riesgo | Verificación | Rollback |
|---|---|---|---|---|---|---|---|
| 5.1 | Medición post-fase | Dashboard + Observability | — (control) | S | Nulo | Tabla comparativa baseline → post | n/a |
| 5.2 | Alertas 80% + freeze 90% | Vercel / script local | — (prevención) | XS | Nulo | Alertas disparan en pruebas | Desactivar |
| 5.3 | Presupuesto por ruta | este doc | — (gobierno) | XS | Nulo | Revisión mensual | n/a |
| 5.4 | Criterios de aceptación | este doc | CPU <1,5 h · FOT <4 GB · inv <300 K | — | — | Dashboard de la ventana | Reabrir fase implicada |
| 5.5 | Documentar rutas estáticas | `STATUS_SYSTEM.md` · `PROJECTS_SYSTEM.md` | — | S | Nulo | Docs actualizados con aprobación | n/a |
| 5.6 | Regla anti-regresión layouts | `layout.tsx` (4 webs) | Evita recaídas | XS | Nulo | Grep de `cookies()/headers()` en layouts = 0 | n/a |

## 5. Casos especiales

| Caso | Estrategia |
|---|---|
| Auth/2FA/sesión | Sigue dinámico; el estado se hidrata en cliente (`AuthProvider`) |
| Dashboard CiszuBot | `force-dynamic` por diseño; no entra en la migración |
| Reviews / feedback | Lectura pública con ISR corto; escritura por API con rate limit |
| Stats/status en vivo | ISR 60 s o fetch cliente contra API cacheada |
| Editores (Plasmic/Puck/pages/edit) | Dinámicos; fuera de alcance |
| AdSense/consentimiento | Scripts cliente; el HTML estático no debe contener decisiones por usuario |
| Bots/auditores | Se limita su frecuencia (§6); son parte del CPU histórico |
| i18n | Fase 3; preferencia explícita persistida; SEO solo del idioma base hasta decidir C/E |

## 6. Reducciones operativas ya aplicadas (para no volver a exceder)

| Cambio | Antes | Después | Motivo |
|---|---|---|---|
| UptimeRobot (4 webs) | 300 s | 1800 s | Menos checks a producción; mismo propósito |
| CI `security-e2e` | Cada push/PR + diario | Solo schedule diario + dispatch | ~80-100 requests a producción por run |
| Lighthouse CI | Cada push/PR | Semanal (lunes) + dispatch | 4 auditorías completas por run |
| uptime-watch cron | Cada 5 min | Cada 30 min | Alineado con el intervalo del monitor |

## 7. Estimaciones consolidadas

Supuestos a validar en Fase 0: render dinámico medio 20-100 ms de Active CPU; páginas de
contenido = mayoría del tráfico; middleware ~1-3 ms por request HTML.

| Escenario | Function Invocations | Fluid Active CPU | Fast Origin Transfer |
|---|---|---|---|
| Hoy (baseline dashboard) | 991 K | 11 h 46 m | 10,17 GB |
| Cortesía 3× sola (30 días, una vez) | límite 3 M | límite 12 h (al borde) | límite 30 GB |
| Quick wins F1 (+ parte F2) | −40/60% → ~400-600 K | −15/30% → ~8-10 h | −15/30% → ~7-9 GB |
| Migración completa F2-F4 | −85/95% → ~50-150 K | −85/95% → **~0,5-2 h** | −70/90% → **~1-3 GB** |
| Blindaje F5 | Presupuesto + alertas 80% + freeze 90% | Objetivo <1,5 h sostenido | Objetivo <4 GB sostenido |

**Conclusión honesta**: los quick wins recortan invocaciones (sobre todo el sondeo de
1,5 s y el HEAD de `/stats`) pero **no bajan el CPU Fluid por debajo de las 4 h**, porque
el grueso del CPU son renders completos (42,7 ms de media). La cortesía 3× sola tampoco
arregla: deja la CPU al borde (11 h 46 m vs 12 h) y expira. **Solo la combinación
quick wins + Fases 2-4 completas + blindaje deja margen holgado** (CPU ~0,5-2 h · FOT
~1-3 GB con el tráfico actual), suficiente para absorber picos sin volver a exceder.
La cortesía queda como colchón temporal durante la migración, no como solución.

## 8. Riesgos, rollback y contingencias

| Riesgo | Mitigación / rollback |
|---|---|
| Ruta estática sirve datos de usuario | Auditoría antes de cachear; test que verifica ausencia de sesión en HTML estático |
| Contenido desactualizado | `revalidate` corto + on-demand; rollback a `force-dynamic` por ruta |
| Build excede 45 min | Pre-renderizar subset y usar `dynamicParams`; medir en Fase 4 |
| i18n con parpadeo o SEO del idioma base | Script anti-parpadeo + preferencia persistida; opción B/C si el SEO lo exige |
| Regresión SEO | Mantener `sitemap`/metadata; evaluar opción C si hace falta hreflang |
| Middleware >50 ms CPU media | Matcher mínimo, sin I/O en middleware, CSP precomputada; medir en Observability |
| Prefetch retirado empeora la navegación | Prefetch selectivo (solo enlaces primarios); revertir por enlace |
| `loading.tsx` cambia el volumen de prefetch | Medir antes/después en Observability; ajustar con `prefetch` por link |
| Rewrite geo entra en loop o filtra | Matcher mínimo + lista de países; probar con `x-vercel-ip-country` simulado |
| Segundo bloqueo Vercel | Presupuesto bajo límites + alertas 80%/90%; plan de contacto a soporte documentado (§2.5) |
| Cortesía 3× quemada sin necesidad | No usarla como primera medida; reservarla como red de seguridad (§9) |
| Deploy no autorizado por error | Ventana de no-deploy vigente; ningún comando de deploy hasta aprobación |

Rollback general: cada fase es un conjunto de commits atómicos y reversibles; ninguna fase
elimina `cookies()`/`headers()` de rutas funcionales, solo de layout/contenido. Ante
problema, se restaura `force-dynamic` en la ruta afectada sin revertir toda la migración.

## 9. Qué necesita aprobación del dueño

Decisiones explícitas pendientes (ninguna se ejecuta sin respuesta):

1. **Ventana de no-deploy**: mantener "cero deploys hasta nuevo aviso" (recomendado:
   mantener hasta decidir la primera fase). Los ítems `[HECHO]` ya están aplicados.
2. **Cortesía 3× (30 días, una sola vez)**: (a) reservarla como colchón y no usarla ahora
   (recomendado); (b) activarla ya como red de seguridad; (c) no usarla nunca.
3. **Ejecución por fases**: autorizar F0 → F1 → F2 → F3 → F4 → F5, una fase por deploy y
   verificación de 48-72 h entre ellas (recomendado), o paquetes distintos.
4. **Opción i18n**: A (cliente puro, recomendada como base) vs B (geo + rewrite) vs C/E
   (rutas con SEO multiidioma). Decisión necesaria antes de Fase 3.
5. **Tradeoff SEO aceptado**: con A/B el HTML inicial solo indexa el idioma base.
6. **Autorizar Fase 0** (mediciones y alertas; no despliega).
7. **Presupuesto y criterios de aceptación**: validar CPU <1,5 h, FOT <4 GB, inv <300 K
   y los umbrales de alerta 80% / congelación 90%.
8. **Canal de alertas**: confirmar el email que recibe los avisos de uso (o el job local
   `pnpm notify` si Hobby no ofrece alertas por email).

## 10. Historial del documento

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0.0 | 2026-09-28 | Plan inicial: migración a estático + i18n sin rutas. |
| 1.1.0 | 2026-09-28 | Añadidos §13 diagnóstico real y §14 plan priorizado quick wins → estructural. |
| 2.0.0 | 2026-09-28 | Consolidación completa: estado actual (cuenta desbloqueada, uso excedido), cortesía 3×, Fases 0-5 con checklists ejecutables, estimaciones consolidadas, riesgos/rollback y aprobaciones pendientes; decisión vigente de no-deploy. |
| 3.0.0 | 2026-09-29 | Fases 0-4 ejecutadas y desplegadas. Añadidos: reporte de ejecución (§11), protocolo de verificación post-deploy 24/48/72 h (§12), alertas y presupuesto de CPU (§13), pendientes declarados (§14). Estado del plan: ejecutado (Fase 5 activa). |

## 11. Reporte de ejecución (Fases 0-4)

> **Nota de alcance**: esta sección documenta la ejecución real (28-29 sep 2026). Los
> checklists `- [ ]` de §4.1-§4.5 quedan como registro del plan original; lo ejecutado
> consta aquí. La Fase 5 se protocoliza en §12-§14.

| Fase | Qué se hizo | Commits | Evidencia | Impacto estimado |
|---|---|---|---|---|
| **0 — Baseline y medición** | `@vercel/speed-insights@2.0.0` en CiszuNetwork, CiszuBot y CiszukoAntony (no en MuzicMania); baseline de uso y top de rutas en Observability; reducciones operativas de auditores (§6). | `dec44c46` | 7 archivos: dependencia + `<SpeedInsights/>` en los 3 `layout.tsx`; build local OK. | Medición (0 CPU); habilita CWV y el protocolo §12. |
| **1 — Quick wins** | `/api/ads/push` con guard dev-only (fin del sondeo de 1,5 s en prod); `s-maxage` CDN en `/api/leaderboard`; prefetch selectivo en navbars/footers; `HEAD /` → `/sitemap.xml` en `/stats` (3 webs); `GlobalAdvisorConfirm` fuera del render (no-op en Vercel); auditoría de intervalos (CI `security-e2e`, Lighthouse, uptime-watch). | `024c0961` | 27 archivos; `s-maxage=60` verificable con `curl -I`; auditores ya en schedule (§6). | −40/60% inv · −15/30% CPU · −15/30% FOT (estimado §7). |
| **2 — Edge/infra** | CSP precomputada a nivel de módulo (`packages/utils/src/csp.ts`; resultado idéntico byte a byte); matcher estrechado en los 4 `middleware.ts` (excluye estáticos/API); 13 `loading.tsx` (ciszu 3 · ciszubot 4 · antony 3 · muzicmania 3). | `2177f138` | 18 archivos; CSP byte a byte idéntica verificada; 13 skeletons; build local OK. | −20/40% CPU **edge** (no Fluid); habilita F3/F4. |
| **3 — i18n en cliente** | `cookies()`/`headers()` fuera de los 4 layouts raíz; idioma resuelto en cliente (`LangSync`/`I18nProvider`/`useClientI18n` + preferencia persistida) sin parpadeo; cabeceras de navegación al cliente. | `0b7561b9` | 23 archivos; verificación Playwright: 95 checks, 0 errores de hidratación; build marca rutas de contenido `○`/`●`. | −60/80% CPU (acumulado; desbloquea el estático). |
| **4 — Estático/ISR** | **~152 rutas públicas `ƒ` → `○`/`●`/ISR**: ciszu 42 + 1 SSG + 1 ISR · antony 37 + 1 SSG · muzicmania 36 · ciszubot 34 + 1 ISR. Layouts sin `headers()`; middleware sin `x-pathname`/`x-is-edit`/`x-is-bare` (sustituidos por `usePathname()`/`BareGate`/`HideOnEdit` en cliente); 44 layouts de metadata por segmento; `GlobalAdvisorConfirm` fuera del árbol; `.gitignore` de `downloads/` corregido. | `cee03153` | Salida de `next build` de las 4 webs (conteo `○`/`●`/ISR; sin `ƒ` en rutas públicas); los `ƒ` restantes son por diseño (§14). | **−85/92% CPU** e invocaciones del contenido público; apunta a CPU <1,5 h · FOT <4 GB · inv <300 K en la ventana. |

Estado por web tras Fase 4: las 4 webs sirven su contenido público desde CDN; el render
dinámico queda reducido a auth/dashboard/editores/CMS y a las revalidaciones ISR.

## 12. Protocolo de verificación post-deploy (Fase 5)

**Clave de interpretación**: el medidor de Hobby es una **ventana rodante de 30 días**
(§2.5); el total de Usage **no bajará de inmediato** aunque hoy no se consuma nada,
porque los días viejos siguen contando hasta salir de la ventana. La medición válida
durante la verificación es el **consumo diario nuevo** en Observability (Last 24 h), no
el acumulado. Objetivos diarios equivalentes: **CPU ≤3 min/día** (1,5 h/30 d) ·
**FOT ≤133 MB/día** (4 GB/30 d) · **invocaciones ≤10 K/día** (300 K/30 d).

### 12.1 Checklist 24/48/72 h

**A las 24 h**
- [ ] Observability (Functions, Last 24 h) por web: CPU nueva ≤3 min/día · inv ≤10 K/día · ratio medio ≤10 ms/invocación.
- [ ] Renders de página pública = 0; las únicas invocaciones de contenido son revalidaciones ISR.
- [ ] `curl -I` a una muestra (home, about, faq, `socials/[platform]`, `/api/leaderboard`): HTML con `x-vercel-cache: HIT`; APIs públicas con `s-maxage` + `stale-while-revalidate`.
- [ ] Sin 5xx nuevos en logs; Speed Insights sin caída de CWV; E2E/`security-e2e` (cuando corran) en verde.

**A las 48 h**
- [ ] Tendencia estable 2 días seguidos bajo los objetivos diarios.
- [ ] Top 10 de Functions por invocaciones: ninguna ruta pública sin cachear (auditar paths).
- [ ] Revalidaciones ISR acotadas: home CiszuBot ≤1/min · `/donate` ≤1/5 min · detalles paramétricos solo por tag/on-demand.
- [ ] Middleware edge: CPU media ≤2 ms/request (presupuesto §4.6).

**A las 72 h**
- [ ] 3 días consecutivos bajo objetivos; comparativa baseline (§2.1) vs post publicada en §11.
- [ ] QA manual sin regresiones: login/2FA, dashboards, editores, ads, cambio de idioma, reviews/feedback.
- [ ] Umbral de congelación 90% (§13.1): si la ventana acumulada sigue >90%, pausar auditores externos y abrir revisión (es memoria de la ventana vieja, no fallo de F4).

### 12.2 Cómo medir

| Qué | Dónde | Cómo |
|---|---|---|
| CPU/invocaciones por función y path | Vercel → project → Observability → Functions | Filtrar Last 24 h / 7 d; ordenar por invocaciones y CPU; agrupar por ruta |
| Consumo acumulado de la ventana | Dashboard → team `ciszunetwork` → Usage (Last 30 days) | CPU, FOT e invocaciones por proyecto |
| Fallback CLI | `vercel usage` (raíz del repo) | Volcado de la ventana; si Hobby no expone alertas, este output alimenta el job `pnpm notify` |
| Estado de caché del HTML | `curl -I https://<web>/<ruta>` | `x-vercel-cache: HIT` y `Cache-Control` con `s-maxage` |
| Revalidaciones ISR | Logs de runtime del proyecto | Buscar revalidaciones tras `revalidate`/tags; contar por ruta |
| CWV | Vercel Speed Insights | Comparar contra la línea base de Fase 0 |

### 12.3 Si los números no bajan (orden de diagnóstico)

1. **Detalles paramétricos mal clasificados**: auditar el build por `ƒ` inesperados y los
   paths del top de Functions; completar `generateStaticParams`/`dynamicParams`.
2. **Revalidaciones**: `revalidate` demasiado corto o revalidaciones por tag en exceso;
   agrupar tags y subir a 300-600 s donde la frescura no sea crítica.
3. **Pollings cliente**: cualquier intervalo golpeando APIs de Vercel (buscar `/api/*` en el
   top de invocaciones) → guard dev-only, `document.hidden` o `s-maxage`.
4. **Prefetch**: volumen RSC alto → `prefetch={false}` en enlaces secundarios.
5. **Middleware**: matcher filtrando estáticos o CSP recomputándose por request (verificar
   memoización por instancia).
6. **Último recurso**: usar la cortesía 3× como colchón (§1.4) y reabrir la fase implicada;
   no usarla para tapar una regresión identificable.

## 13. Alertas y presupuesto

### 13.1 Alertas de uso

- **Configuración**: Vercel → Settings → Notifications (team `ciszunetwork`) → activar
  avisos de **Usage al 80%** para Fluid Active CPU, Fast Origin Transfer y Function
  Invocations, con el email del team; confirmar que llega un correo de prueba.
- **Fallback local**: si Hobby no ofrece alertas por email, job programado con
  `vercel usage` + `pnpm notify "Uso Vercel al X%"`, mismo umbral 80%.
- **Umbral 90% (congelación)**: pausar auditorías externas (UptimeRobot ya a 1800 s; CI
  `security-e2e` y Lighthouse ya en schedule) y abrir revisión antes de acercarse al límite.

### 13.2 Presupuesto de CPU por tipo de ruta

| Tipo de ruta | Ejemplo | Frecuencia de render | Presupuesto |
|---|---|---|---|
| Estática `○` servida de CDN | legales, about, faq, projects | 0 (sin función) | 0 ms/visita |
| ISR home CiszuBot `●` | home con estado del bot | 1 revalidación/min máx (`revalidate=60`) | ~1,3 min CPU/día máx |
| ISR `/donate` | contenido con env en runtime | 1 revalidación/5 min | acotado (§14) |
| ISR detalles paramétricos | `projects/[slug]`, `socials/[platform]` | 1 por ruta publicada + tags | acotado a publicación |
| APIs públicas con CDN | `/api/leaderboard`, `/api/ads/push` | 1 origen/60 s (`s-maxage`) | ≤5 ms/invocación no cacheada |
| APIs de escritura (rate limit) | `/api/ads/impression` | por evento legítimo | ≤20 ms |
| Auth/dashboard/editores `ƒ` | login, dashboard, Puck/Plasmic | por request (diseño) | ≤50 ms p95 |

### 13.3 Regla de diseño permanente

**Toda página nueva debe ser estática (`○`) o ISR (`●`) salvo justificación explícita**
(cookies, sesión, editor o datos por usuario); en ese caso el segmento va `force-dynamic`,
**nunca** el layout raíz. Regla anti-regresión asociada: **ningún layout raíz lee
`cookies()`/`headers()`** (§4.6 5.6); se revisa en cada PR/build (grep = 0).

## 14. Pendientes declarados (post-Fase 4)

| Pendiente | Detalle | Seguimiento |
|---|---|---|
| `ƒ` por diseño | auth/2FA/sesión, dashboards, editores, CMS, `changelog/[id]`, `projects/[slug]` de ciszu, `profile/[id]` | Fuera de alcance; no entran en la migración (§5) |
| Delta de `/youareanidiot` | Queda fuera del estático por usar scripts en `<head>`; el resto de la web sí migró | Evaluar mover los scripts a componente cliente para hacerla estática |
| CiszuBot sin fallback SSR de sesión | El estado de sesión se resuelve solo en cliente; no hay SSR de respaldo | Revisar si requiere fallback o mantener como decisión de diseño |
| ISR de `/donate` con env en runtime | La página lee configuración de entorno al revalidar; el ISR depende de que el env esté presente en runtime | Revisar si conviene fijar el valor en build o mantener runtime |
| `lib/i18n-server.ts` de ciszu sin uso | Tras Fase 3/4 quedó sin consumidores | Candidato a borrar en limpieza futura (con grep previo) |
| `#418` preexistentes | Errores de hidratación React previos a la migración (no ligados a F3/F4) | Investigar aparte; F3 verificó 0 hidrataciones nuevas |

_Última revisión: 2026-09-29._ Relacionado: `PROJECT_STATE.md`, `PROJECT_HISTORY.md`,
`FRAMEWORKS_SYSTEM.md`, `FRONTEND_SYSTEM.md`, `STYLES_SYSTEM.md`, `CACHING_SYSTEM.md`,
`SECURITY_PROTOCOLS.md`, `ACTIONS_RUNNERS_SYSTEM.md`, `MONITORING_SYSTEM.md`, `TODO.md`,
`DOCUMENTATION_SYSTEM.md`.
