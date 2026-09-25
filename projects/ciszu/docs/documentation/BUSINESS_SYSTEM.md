# BUSINESS_SYSTEM — Modelos, Estrategia y Estructura de negocio

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: BUSINESS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: marco completo del negocio de Ciszu Network (ago 2026): modelos de
> referencia e ingresos, estrategias de producto/marketing/empresarial/relaciones, y
> estructura organizacional.

Marco completo del negocio de Ciszu Network (ago 2026): modelos de referencia e ingresos, estrategias de producto/marketing/empresarial/relaciones, y estructura organizacional. Complementa `ORGANIZATIONAL_SCALABILITY_PLAN.md`, `COMPANY_REGISTRATION_PLAN.md`, `PAYMENTS_SYSTEM.md`, `ONLINE_SERVICES.md`.

## Modelos de negocio de referencia

| Modelo | Cómo lo aplica Ciszu hoy |
| ------ | ------------------------ |
| **Freemium / F2P** | MuzicMania gratis con monedas in-game y rewards por votar; el bot gratuito con funciones premium futuras |
| **Marketplace / bot lists** | Presencia en top.gg y DBL (auto-post 30 min) para descubrimiento del bot |
| **Modelo de comunidad / Lounge** | Discord como centro de comunidad con economías, niveles, rangos — engagement-driven |
| **Subscription (a futuro, 18+)** | Emails transaccionales ya listos (`@ciszunetwork/email`), payments integrados (NOWPayments) para suscripciones futuras |
| **Donations (patronaje)** | `getDonationMethods()` con direcciones crypto from env (`DONATE_*`); NOWPayments invoices |
| **Devol (para-publisher)** | Música con licencia propia + covers; monetización de contenido en YouTube/Spotify |
| **Portfolio como funnel** | CiszukoAntony como vitrina → servicios (diseño/música/desarrollo) |

## Modelo de ingresos directos (stack actual)

1. **Donaciones crypto** — ahora (NOWPayments IPN, HMAC).
2. **Votos/Premium** — rewards en el bot + futuras funciones de pago.
3. **Servicios profesional** — a través del portfolio (diseño, música, desarrollo).
4. **Suscripciones (18+ / LLC)** — cuando la identidad legal lo permita (`INTERNATIONAL_LLC_PLAN.md`).

## Modelo operativo

- **Operación remota 24/7**: Vercel + Supabase + GitHub Actions (infra en la nube).
- **Bootstrap/costo-cero**: Free tiers cuidados (límites monitoreados — cuota storage 1 GB conocida, ver `AGENTS.md`).
- **Única fuente de verdad**: decisiones de costo/servicio en `ONLINE_SERVICES.md`.

## Referentes de negocio a estudiar

- **Genre/online games indie + bots Discord con monetización por comunidad** (estilo Pancake/Top.gg bots).
- Modelos "solopreneur" con 1-2 productos amplios (patrón que Ciszu sigue: 4 productos de un solo fundador).
- Plataformas de música con licencias abiertas: YouTube Content ID, Spotify for Artists.

## Estrategia de producto (por mercado)

| Producto | Estrategia | Canal de adquisición |
| -------- | ---------- | -------------------- |
| **MuzicMania** | Freemium, juego de ritmo con música propia (tracks gene-IA) | top.gg/DBL, Discord, TikTok (gameplay) |
| **CiszuBot** | Bot gratuito + monetización por comunidad (economía, niveles, música) | Discord App Directory, invitación en webs, top.gg/DBL |
| **CiszukoAntony** | Portfolio personal → atracción de colaboradores/clientes | LinkedIn, IG, redes |
| **CiszuNetwork** | HUB de marca → navegación a productos | Todas las redes (hub CDC) |

## Estrategia de marketing (orgánico, sin ads)

- **Contenido en redes**: TikTok/Instagram para gameplay (MuzicMania) y arte/música; X/LinkedIn para la marca/negocio/portfolio.
- **Transmedia**: mismo universo neon (cian/rosa, Geomanist) en todas las webs y redes → reconocimiento de marca.
- **Comunidad**: Discord Lounge como hub central (invite oficial `W3kMtMMj6E`), moderación con rangos, eventos y rewards.
- **Bot lists**: top.gg + DBL con auto-post cada 30 min (recompensa por votar 500 monedas, webhook de votos en `statsServer`).
- **SEO**: robots.ts/robots.txt por web (allow `/`, disallow `/api/`), metadata completa, `NEXT_PUBLIC_SITE_URL` para OAuth; estructural.

## Estrategia empresarial

- **Fase 0 legal sin costo** (RIF persona natural, SENIAT, WhatsApp) — ver `COMPANY_REGISTRATION_PLAN.md`.
- **Monetización**: NOWPayments (invoices crypto) + donaciones (métodos env `DONATE_*`); madurar a LLC/18 años (ver `PAYMENTS_SYSTEM.md`, `INTERNATIONAL_LLC_PLAN.md`).
- **Costo controlado**: Free tiers (Supabase 1 GB, Vercel Hobby, Cloudflare Fase A gratis, UptimeRobot 50 monitores, PostHog 1M eventos) — ver `ONLINE_SERVICES.md`.
- **Retención de usuario**: sistema de niveles/XP en el bot, leaderboard de MuzicMania, rewards por votos.

## Estrategia de relaciones

- **Alianzas**: con youtubers/streamers de música y gaming latino; servidores de Discord para integración del bot (canales por servidor).
- **Colaboraciones**: artistas/música (música propia generada), diseñadores; open-source visible en GitHub (`Ciszu-Network`).
- **Comunidad primero**: soporte en Discord + WhatsApp (wa.me/584126858111) + email (fplayersoffcial@gmail.com).

## Métricas y decisiones

- KPIs: eventos PostHog (~1M free), visitas (Web Analytics), votos top.gg/DBL (contadores `ciszu.counters`), récords/scores MuzicMania, crecimiento de servidores del bot (heartbeat `bot_status.guilds`). Ver `ANALYTICS_SYSTEM.md`, `STATISTICS.md`.
- Revisar trimestralmente para decidir dónde invertir tiempo; 0 ads hasta tener datos suficientes.

## Estructura organizacional

### Estructura actual (ago 2026)

| Rol | Persona | Ámbito |
| --- | ------- | ------ |
| Fundador / CEO | Francisco García (Ciszuko Antony) | Decisión, desarrollo, diseño, finanzas, operaciones, marketing, soporte — todo |

- Empresa de **1 persona** (unipersonal). RIF persona natural planificado en Fase 0 (ver `COMPANY_REGISTRATION_PLAN.md`).
- Ecosistema: 4 webs (Ciszunetwork, CiszukoAntony, MuzicMania, CiszuBot), 1 bot Discord, CDN Supabase, paquete de música propio, juego MuzicMania (web + Tauri).
- Cuenta GitHub es **Organization `Ciszu-Network`** (ADMIN: CEO), preparada para equipo.

### Rangos planificados (cuando crezca)

Inspirado en jerarquías de comunidades/discord y startups, ajustado a VE (ver `ORGANIZATIONAL_SCALABILITY_PLAN.md`):

1. **Fundador/CEO** — dirección, marca, decisiones finales.
2. **Admin / Co-lead** — gestión diaria con delegación.
3. **Devs / Creativos** (perfil técnico y artístico).
4. **Mods / Marketing / Soporte** — comunidad y redes.
5. **Colaboradores / beta-testers** — comunidad y feedback.

Los rangos aplican esquema en-discord (roles con color neon cian/rosa y permisos por nivel). Cada rango revisa quién es visible en `CONTACTS.md`.

### Esquema visual (propuesta)

- **Neón**: cian = técnica/dev, rosa = marca/creativo, violeta = gestión.
- Cascada de roles: CEO → Admins → Leads → Team → Community — con ítems-chips en webs para mostrar equipo cuando exista.

## Reglas de decisión

- **Primero gratis, luego monetizar**: la monetización nunca debe romper la utilidad free (evitar paywall en funciones que definen el producto).
- **Fase por edad/legal**: nada de suscripciones o LLC hasta mayoría de edad (ver `COMPANY_REGISTRATION_PLAN.md`, `PAYMENTS_SYSTEM.md`).
- Cada nuevo modelo se valida con datos (PostHog, loyalty) antes de implementar.
- **1 sola fuente de verdad**: la estructura oficial vive aquí + `ORGANIZATIONAL_SCALABILITY_PLAN.md`; no duplicar en varios docs.
- **Acceso = rol mínimo**: no dar acceso de infra a quien no lo requiere (lección del PAT y service_role — ver `VAULT_SYSTEM.md`).
- **Rotación**: revisar la estructura con cada hito (contratación, registro legal, migración de plan).

## Métricas de negocio a seguir (KPIs)

| KPI | Fuente | Meta |
|---|---|---|
| Visitas / usuarios | Cloudflare Web Analytics | Crecimiento mensual |
| Eventos de producto | PostHog | ~1M free/mes |
| Votos top.gg/DBL | `ciszu.counters` | Crecientes por release |
| Servidores del bot | `bot_status.guilds` | 100+ activos |
| Scores/partidas | MuzicMania (scores) | Retención de jugadores |
| Donaciones recibidas | NOWPayments / invoices | > 0 sostenido |
| Tiempo de actividad | UptimeRobot | ≥ 99% |

## Conceptos de negocio (contexto informático)

| Término | Definición |
|---|---|
| **Funnel** | Embudo de conversión (visita → acción) |
| **Acquisition** | Adquisición de usuarios/canales |
| **Retention** | Retención de usuarios |
| **Monetización** | Forma de generar ingresos |
| **Freemium** | Gratis con funciones premium |
| **In-game currency** | Moneda virtual (rewards) |
| **Loyalty** | Fidelización (niveles/XP) |
| **Churn** | Abandono de usuarios |
| **TAM/SAM** | Mercado total / alcanzable |

## Reglas de decisión (resumen ejecutivo)

1. **Gratis primero**; monetizar sin romper la utilidad free.
2. **Nada legal/pagos hasta mayoría de edad** y registro (ver `COMPANY_REGISTRATION_PLAN.md`).
3. **Datos antes de invertir**: validar con PostHog/votos antes de escalar.
4. **Una fuente de verdad** por tema (este doc + `ORGANIZATIONAL_SCALABILITY_PLAN.md`).
5. **Acceso mínimo por rol**: nadie con acceso que no lo requiera (seguridad).

## Roadmap de negocio (fases)

| Fase | Hito | Docs |
|---|---|---|
| Fase 0 (hoy) | RIF persona natural, donaciones crypto, operación $0 | `COMPANY_REGISTRATION_PLAN.md`, `RIF_PERSON_PLAN.md` |
| Fase 1 | Crecimiento orgánico + monetización de votos/rewards | `PAYMENTS_SYSTEM.md` |
| Fase 2 | LLC internacional / 18+ (suscripciones, servicios) | `INTERNATIONAL_LLC_PLAN.md` |
| Fase 3 | Equipo + delegación por roles | `ORGANIZATIONAL_SCALABILITY_PLAN.md` |

## Riesgos y mitigaciones de negocio

| Riesgo | Mitigación |
|---|---|
| Dependencia de free tiers | Monitorear cuotas y migrar planes solo cuando se justifique |
| Proyecto unipersonal (bus factor 1) | Documentar todo en este repo; delegar por roles al crecer (Fase 3) |
| Pagos limitados por edad/país | NOWPayments hoy; LLC + Stripe/PayPal en Fase 2 |
| Canal único de distribución (Discord) | Multiplicar canales: bot lists, itch.io, store fronts |
| Cambio normativo fiscal VE | Revisar `TAX_PLAN.md` y actualizar el calendario |

## Reglas de priorización de proyectos

1. Mantener operando los 4 productos con costo $0 (no romper lo que funciona).
2. Monetizar solo lo que ya tiene tracción de usuarios (votos, scores, donaciones).
3. Antes de cada hito legal (RIF, empresa, LLC), revisar este doc y los planes de registro.
4. Validar nuevas ideas con datos (PostHog, comunidades) antes de construir.

## Preguntas frecuentes de negocio

**¿Cuándo monetizar con suscripciones?** Tras la mayoría de edad y con identidad legal
(LLC o empresa) que permita cobrar formalmente (Fase 2).

**¿Cómo medir si un producto funciona?** Por los KPIs de la tabla §Métricas: visitas,
eventos, votos, servidores y scores; revisión trimestral.

**¿Qué hacer si un free tier se agota?** Consultar `ONLINE_SERVICES.md` antes de pagar;
migrar solo si el límite es bloqueante.

**¿Cuál es el canal de contacto oficial del negocio?** Soporte en Discord + WhatsApp
(wa.me/584126858111) + email (fplayersoffcial@gmail.com); el contacto institucional del
ecosistema es `ciszunetwork@outlook.com`.

## Decisiones tomadas (registro)

- Priorizar los free tiers hasta tener datos que justifiquen un plan pagado.
- No abrir suscripciones ni crear LLC antes de la mayoría de edad y de ingresos sostenidos.
- Todas las decisiones de costo/servicio se documentan en `ONLINE_SERVICES.md`.

## Relación con otros sistemas

| Sistema | Relación |
|---|---|
| `PAYMENTS_SYSTEM.md` | Modelos de ingresos y pagos del ecosistema |
| `COMPANY_REGISTRATION_PLAN.md` | Fases legales y de registro |
| `ORGANIZATIONAL_SCALABILITY_PLAN.md` | Estructura y delegación al crecer |
| `ANALYTICS_SYSTEM.md` | KPIs y métricas de decisión |
| `REVIEWS_SYSTEM.md` | Reputación y confianza social |
| `ONLINE_SERVICES.md` | Fuente de verdad de costos/servicios |

_Última revisión: 13 ago 2026._
