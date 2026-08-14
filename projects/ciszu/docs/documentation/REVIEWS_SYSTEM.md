# REVIEWS_SYSTEM — Plataformas de valoración y reputación de Ciszu Network

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: REVIEWS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: plataformas de valoración y reputación de los productos públicos del
> ecosistema (Trustpilot, top.gg, DBL, itch.io, etc.). Complementa a `PAYMENTS_SYSTEM.md`.

**Estado (11 ago 2026)**: verificación de dominio en **Trustpilot** iniciada (archivo HTML `c2b7fd59-74ac-4584-a00d-c3aacd0f931f.html` desplegado y respondiendo 200 en producción). Documenta Trustpilot y el resto de plataformas de valoración/reseñas de los productos públicos del ecosistema. Complementa a `PAYMENTS_SYSTEM.md` (pagos) — **son sistemas independientes**; la verificación de dominio de Trustpilot NO depende de NowPayments ni de ningún proveedor de pago.

## 1. Objetivo

Crear y mantener reputación pública verificada para los productos de Ciszu Network. La valoración externa (reseñas, ratings, badges) da **confianza social** y **SEO** a las 4 webs, al bot de Discord, a MuzicMania y al portfolio. Cada producto se registra en las plataformas que le corresponden por tipo.

## 2. Matriz producto × plataforma de valoración

| Producto | Plataforma | Propósito | Estado |
| --- | --- | --- | --- |
| **Ciszu Network** (web principal) | Trustpilot | Reseñas de la marca/empresa | ⏳ **Verificando dominio** (11 ago 2026) |
| **CiszukoAntony** (portfolio) | Trustpilot | Reseñas del portfolio/creador | ⏳ Futuro |
| **MuzicMania** (juego web) | Trustpilot, Google Play/App Store (si publica), itch.io | Reseñas del juego | ⏳ Futuro |
| **Ciszubot** (bot Discord) | **Top.gg**, **DiscordBotList** (discordbotlist.com) | Rating y reseñas del bot | ✅ **Integrado** (AutoPoster cada 30 min + votos recompensan 500 monedas en `statsServer`) |
| **MuzicMania** (app Tauri/Windows) | Microsoft Store (si publica), trustpilot | Reseñas de la app de escritorio | ⏳ Futuro |
| Webs en general | Google Business Profile / Google Reviews | Reputación local (negocio) | ⏳ Futuro (requiere cuenta Google + dirección) |

## 3. Trustpilot — integración técnica

### 3.1 Cómo funciona la verificación de dominio (método archivo HTML)

1. En Trustpilot Business (perfil de la empresa) → **Verify your domain** → pestaña **Verify with file upload**.
2. Trustpilot genera un archivo HTML **con un código único de un solo uso** (nombre `c2b7fd59-...html`, contenido = el código). **Válido 1 mes**.
3. Se sube a la **raíz del sitio** (en Next.js = `public/`).
4. Se pulsa **Verify domain** en Trustpilot; Trustpilot hace fetch HTTPS de la URL del archivo y comprueba que devuelve el código.
5. Verificado → se puede **borrar el archivo** del repo y del deploy.

### 3.2 Estado real del deploy (11 ago 2026)

- Archivo creado en `projects/ciszu/website/public/c2b7fd59-74ac-4584-a00d-c3aacd0f931f.html` con contenido = el código.
- Commit `deab5f2` + push a `main` → deploy Vercel `ciszunetworkpage` (proyecto `ciszunetworkpage`, filtro `ciszunetwork-website`).
- Verificación con `curl -L`: **HTTP 200**, contenido `c2b7fd59-74ac-4584-a00d-c3aacd0f931f` en `https://ciszunetwork.vercel.app/c2b7fd59-74ac-4584-a00d-c3aacd0f931f.html`.
- ⚠️ **`cleanUrls: true`** en `vercel.json`: la URL `.html` responde 308 redirect a la versión **sin extensión** (`/c2b7fd59-...`), que es la que devuelve 200 con el contenido. Trustpilot sigue redirects y verifica el contenido final — funciona igualmente.

### 3.3 Consideraciones por web

| Web | Vercel project | public/ | Nota |
| --- | --- | --- | --- |
| ciszunetwork | `ciszunetworkpage` | `projects/ciszu/website/public/` | ✅ Archivo desplegado |
| ciszukoantony | `ciszukoantonypage` | `projects/ciszukoantony/website/public/` | Idéntico patrón si se verifica |
| muzicmania | `muzicmania` | `projects/muzicmania/website/public/` | Idéntico patrón |
| ciszubot | `ciszubot` | `projects/ciszubot/website/public/` | Idéntico patrón |

> El `public/` de las webs NO es espejo de `content/` (política 11 ago 2026) — un archivo de verificación en `public/` es contenido propio y viaja en el build normal. No lo borra ningún script.

## 4. Otras plataformas de valoración por tipo de producto

### 4.1 Discord bot (Ciszubot)

- **Top.gg** y **DiscordBotList**: ya integrados en `src/services/botlists.ts` (AutoPoster top.gg + DBL cada 30 min + webhook). Faltan **tokens** (`TOP_GG_TOKEN`, `DISCORDBOTLIST_TOKEN` en vault sin valor) y **subir el bot** en cada panel (dashboard del proveedor → Add bot).
- Los **votos** recompensan economía: `POST /api/votes` webhook top.gg → `bumpCounter('topgg_votes')` + 500 monedas (rate limit 10/h por IP — ver `CACHING_SYSTEM.md`).

### 4.2 Juego / apps (MuzicMania)

- **itch.io**: perfil de desarrollador gratuito, rating + comentarios + venta de juegos (requiere 13+, sin tarjeta para publicar gratis). Alternativa natural al no poder publicar aún en Steam (steamworks 100$).
- **Microsoft Store**: para la app Tauri/NSIS — requiere cuenta developer (partner) y publicación; futuro.
- **Google Play** (si alguna vez se hace app móvil): cuenta developer 25$ — futuro lejano.

### 4.3 Negocio / webs

- **Google Business Profile**: reputación local + Google Reviews. Requiere cuenta Google del negocio y una dirección/área servida. Se enlaza con las webs para reseñas de Google.
- **Trustpilot**: el principal para webs/marca (sección §3).
- **Product Hunt** (para lanzamientos): plataforma de lanzamiento + upvotes/comentarios — útil al lanzar MuzicMania o una app nueva.

### 4.4 Software / dev

- **GitHub Stars**: ya aplicable (repo privado hoy; si se hace público, las estrellas son señal de confianza).
- **AlternativeTo / Capterra / G2**: listados de software con ratings — secundario, futuro, solo si hay producto SaaS.

## 5. Enlaces útiles

- Trustpilot: https://www.trustpilot.com (Business → Verify domain)
- Top.gg: https://top.gg (bot del usuario)
- DiscordBotList: https://discordbotlist.com
- itch.io: https://itch.io (developers)
- Product Hunt: https://www.producthunt.com
- Google Business Profile: https://business.google.com

## 6. Tareas del usuario (para activar)

1. **Trustpilot**: pulsar **Verify domain** en Trustpilot para `ciszunetwork.vercel.app` (el archivo ya está en producción). Tras verificar, se puede borrar el archivo del repo y el deploy.
2. **Top.gg / DBL**: subir el bot Ciszubot en cada panel + conseguir tokens (`TOP_GG_TOKEN`, `DISCORDBOTLIST_TOKEN`) → vault → `.env` del bot → reiniciar bot (el AutoPoster ya está codificado).
3. **itch.io**: crear perfil y publicar MuzicMania (build Tauri ya existe).
4. **Google Business Profile**: crear ficha del negocio y enlazar Google Reviews con las webs.
5. **(Futuro)** Microsoft Store / Steam / Product Hunt según lanzamientos.

## 7. Verificación de la implementación (Trustpilot)

- `curl -sS -L https://ciszunetwork.vercel.app/c2b7fd59-74ac-4584-a00d-c3aacd0f931f.html` → **200** con el código en el body (verificado 11 ago 2026).
- Deploy READY en Vercel (`ciszunetworkpage`, deployment `dpl_2aP6...`).
- La verificación final la hace Trustpilot al pulsar "Verify domain" (fetch server-side desde Trustpilot, no desde el navegador del usuario).

## Conceptos de reputación (contexto informático)

| Término | Definición |
|---|---|
| **Reseña/Review** | Valoración pública de un producto |
| **Rating** | Puntuación (estrellas, upvotes) |
| **Verificación de dominio** | Probar que controlas la web (archivo HTML/DNS TXT) |
| **Badge/Insignia** | Sello de confianza mostrado en la web |
| **Reputación social** | Confianza derivada de reseñas externas |
| **SEO off-page** | Enlaces/backlinks de sitios externos |
| **AutoPoster** | Script que actualiza stats del bot automáticamente |
| **Voto (bot)** | Recompensa social del bot (top.gg/DBL) |

## Checklist de reputación por producto

| Producto | Plataforma | Estado | Acción |
|---|---|---|---|
| CiszuNetwork | Trustpilot | ⏳ Verificando | Pulsar Verify domain |
| CiszukoAntony | Trustpilot | ⏳ Futuro | Seguir patrón archivo HTML |
| MuzicMania | Trustpilot/itch.io | ⏳ Futuro | Publicar build en itch.io |
| CiszuBot | Top.gg + DBL | ✅ Integrado | Subir bot + tokens |
| Apps desktop | Microsoft Store | ⏳ Futuro | Cuenta partner |

## Buenas prácticas de reputación

1. Responder reseñas (positivas y negativas) con cortesía.
2. No pagar por reseñas falsas (prohibido y dañino).
3. Mantener la verificación de dominio al día (Trustpilot 1 mes de validez del archivo).
4. Enlazar badges en las webs cuando estén disponibles.
5. Monitorear menciones en redes y Discord (ver `MONITORING_SYSTEM.md`).

## Flujo para verificar una web nueva en Trustpilot

1. En Trustpilot Business: perfil → Verify your domain → file upload.
2. Descargar el HTML generado (código de un solo uso, válido ~1 mes).
3. Colocarlo en `public/` de la web correspondiente (ver tabla §3.3).
4. Hacer deploy (commit + push a `main` → Vercel).
5. Comprobar con `curl -L` que la URL devuelve el código (seguir redirects de cleanUrls).
6. Pulsar Verify domain en Trustpilot y confirmar el estado.
7. Borrar el archivo del repo y del deploy (el verificador ya no lo necesita).

## Métricas de reputación a seguir

| Métrica | Fuente | Nota |
|---|---|---|
| Rating promedio | Trustpilot / top.gg / DBL | Mantener ≥ 4.5 estrellas |
| Número de reseñas | Cada plataforma | Crecimiento mensual |
| Votos del bot | top.gg / DBL webhooks | Recompensan economía (500 monedas) |
| Tasa de respuesta | Reseñas respondidas | Responder en < 48 h |
| Menciones | Redes + Discord | Ver `MONITORING_SYSTEM.md` |

## Política de respuestas a reseñas

- **Positivas**: agradecer, citar el producto, invitar al Discord.
- **Negativas**: disculparse, ofrecer solución concreta, pedir contacto privado.
- **Nunca**: pagar por reseñas, inventar reseñas, atacar al usuario públicamente.
- Las respuestas se coordinan desde el canal de soporte (Discord/WhatsApp).

## Reviews y SEO off-page

- Los perfiles con reviews generan backlinks y entidades en buscadores (E-E-A-T).
- Enlazar el perfil de Trustpilot desde la web y las redes (nofollow recomendado).
- Mantener nombre, categoría y URL consistentes en todas las plataformas.

## Preguntas frecuentes

**¿Es obligatorio Trustpilot?** No; es una opción de confianza social. top.gg/DBL son los
críticos para el bot; las reviews de Google, para el negocio local.

**¿El archivo de verificación se puede borrar tras verificar?** Sí; Trustpilot solo lo
comprueba en el momento de la verificación.

**¿Puedo publicar MuzicMania en itch.io sin tarjeta?** Sí, el perfil y la publicación
gratuita no requieren tarjeta (13+).

**¿Los votos del bot afectan a la reputación en webs?** No directamente; son reputación del
bot en top.gg/DBL y alimentan la economía interna del servidor.

## Checklist de lanzamiento de reseñas por producto

- [ ] Trustpilot: archivo de verificación desplegado y respondiendo 200.
- [ ] Top.gg/DBL: bot subido, tokens en vault y `.env`, AutoPoster activo.
- [ ] itch.io: perfil creado y build de MuzicMania publicado.
- [ ] Google Business Profile: ficha creada y vinculada a la web.
- [ ] Badges/links de reviews visibles en cada web.
- [ ] Respuestas a reseñas monitoreadas semanalmente.

## Relación con otros sistemas

| Sistema | Relación |
|---|---|
| `PAYMENTS_SYSTEM.md` | Reviews son independientes de pagos; votos del bot alimentan economía |
| `MONITORING_SYSTEM.md` | Alertas de menciones y reputación |
| `BUSINESS_SYSTEM.md` | La reputación alimenta la estrategia de marca |
| `ANALYTICS_SYSTEM.md` | Medir el impacto de reviews en conversión |
| `ONLINE_SERVICES_SYSTEM.md` | Plataformas y cuentas asociadas |

_Última revisión: 13 ago 2026._ Relacionado: `PAYMENTS_SYSTEM.md`, `MONITORING_SYSTEM.md`,
`ONLINE_SERVICES_SYSTEM.md`, `BUSINESS_SYSTEM.md`.
