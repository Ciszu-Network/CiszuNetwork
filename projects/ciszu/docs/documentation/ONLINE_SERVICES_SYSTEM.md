# ONLINE_SERVICES_SYSTEM — Servicios y sitios en línea usados (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: ONLINE_SERVICES_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> Inventario oficial de las plataformas online y servicios usados por Ciszu Network (ago 2026).
> Incluye enlaces a dashboards, APIs y servicios. Complementa `FULL_STACK_SYSTEM.md` (lado técnico
> de herramientas), `CONTACTS_PROTOCOLS.md` (contactos) y `VAULT_SYSTEM.md` (secretos).

---

## 1. Hosting / infraestructura

| Servicio | Uso | Acceso |
| -------- | --- | ------ |
| **Supabase** | BD (Postgres+PostgREST), Auth, Storage CDN `ciszu-cdn` | Dashboard `https://supabase.com/dashboard/project/obwzzmbvkrcscqwptlqo` · API `obwzzmbvkrcscqwptlqo.supabase.co` · Management API `/v1/projects/` |
| **Vercel** | 4 deploys (ciszunetworkpage, ciszukoantonypage, ciszubot, muzicmania) | `vercel.com/dashboard` + CLI; log/traffic en cada proyecto |
| **GitHub** | Repo privado `Ciszu-Network/CiszuNetwork`, Actions, dependabot, code/secret scanning | `github.com/Ciszu-Network` |
| **Cloudflare** | Turnstile (CAPTCHA ×4 webs) + Web Analytics + DNS/proxy futuro (R2 inactivo) | `dash.cloudflare.com` — ver `CDN_SYSTEM.md` |

## 2. Monitorización y analítica

- **UptimeRobot** — 5 monitores KEYWORD (webs + `supabase-bot-status`): dashboard + API v3.
  Cuenta `fplayersoffcial@gmail.com`. Ver `MONITORING_SYSTEM.md`.
- **ntfy.sh** — notificaciones push (topic público `ciszu-1a41fa89...`), watcher
  `scripts/uptime-watch.js` cada 5 min (cron GH Actions).
- **PostHog** — analítica de producto/errores (proyecto 550383): `us.i.posthog.com` (ingest)
  + Dashboard PostHog. Ver `ANALYTICS_SYSTEM.md`.
- **Sentry** — errores runtime ×4 webs + bot: `sentry.io/organizations/ciszu-network`. Ver `ERRORS_SYSTEM.md`.
- **Vercel Speed Insights** — Core Web Vitals (muzicmania).
- **Cloudflare Web Analytics** — tráfico (beacon estático, token público).

## 3. Paquetes de código/comunidad

- **npm/pnpm registry** — dependencias del monorepo; `pnpm audit` vía registry.
- **top.gg / discordbotlist** — bot lists de CiszuBot (auto-post cada 30 min; tokens en vault, sin valores).
- **Discord Developer Portal** — aplicación del bot (OAuth2, redirects, intents, bot token).

## 4. Pagos y monetización (ver `PAYMENTS_SYSTEM.md`)

| Servicio | Uso | Estado |
|---|---|---|
| **NOWPayments** | Invoices/donaciones crypto (IPN HMAC) | ✅ Activo |
| **Lemon Squeezy** | Stub a futuro (18 años) | ⏳ Futuro |
| **Binance P2P / Zinli / MetaMask** | Rieles VE | ✅ Activo |
| **Resend** | Emails transaccionales (`@ciszunetwork/email`, ver `EMAILS_SYSTEM.md`; requiere dominio Fase B) | ⏳ Futuro |
| **Brevo** | DESCARTADO (cuenta suspendida + teléfono no VE) | ❌ |

## 5. Otros en línea

- **age / vault** local (no es servicio online) — ver `VAULT_SYSTEM.md`.
- **Google Fonts / fuentes** — Geomanist (local/CDN) + Exo_2/Rajdhani (webs con tema neon).
- **OpenAI-compatible LLM (Gemini)** — endpoint `generativelanguage.googleapis.com/v1beta/openai/`
  para el sistema de voz (`tools/tts-stt-ai`).
- **Modelos IA generativos** — HF, SiliconFlow, fal.ai (video, sin saldo), AceMusic —
  ver `KNOWLEDGE_SYSTEM.md` y `tools/`.
- **Discord (servidor de la comunidad)** — invitación `discord.com/invite/W3kMtMMj6E`.
- **Email** — `fplayersoffcial@gmail.com` (soporte/operativo) y `ciszunetwork@outlook.com` (corporativo).
- **WhatsApp** — `wa.me/584126858111` (soporte directo).

## 6. Dashboards de Supabase (acciones frecuentes)

- Reports & Usage (cuota storage — el bucket quedó en 16 % tras limpieza).
- Database → Schemas/Advisors (security linter).
- Storage → buckets (`ciszu-cdn`, `avatars`).
- Auth → users/MFA (leaked password advisor es límite Free).

## 7. Servicios descartados y por qué

| Servicio | Motivo del descarte |
|---|---|
| Brevo | Cuenta suspendida + teléfono no VE (emails) |
| Cloudflare R2 | Requiere tarjeta de crédito (incluso gratis) |
| Vercel Analytics | Sustituido por Cloudflare Web Analytics + PostHog |
| Plausible/Umami/Fathom | Solo tráfico y/o de pago; PostHog cubre producto |
| Tailscale | ✅ se usa (control remoto) en vez de Cloudflare Tunnel |
| Matomo self-host | Requiere VPS (sobreingeniería hoy) |

## 8. Reglas y protocolo de inventario

- Las **URLs públicas** (dashboard, invitaciones, redes) pueden ir en docs; secretos solo vía
  env/vault (`VAULT_SYSTEM.md`).
- Si un servicio cambia de cuenta/URL, actualizar aquí + `AGENTS.md` + `VAULT_SYSTEM.md`.
- Un servicio se añade al inventario cuando: está en producción, en fase de integración, o
  es candidato evaluado (documentar el estado y la alternativa).
- Los tokens/keys NUNCA se documentan en este archivo (solo mapeo cuenta→servicio).

## 9. Matriz cuenta ↔ servicio (resumen)

| Cuenta/identidad | Servicios |
|---|---|
| `fplayersoffcial@gmail.com` | UptimeRobot, email soporte |
| `ciszunetwork@outlook.com` | Email corporativo formal |
| Org GitHub `Ciszu-Network` | Repo, Actions, scans |
| Supabase proyecto `obwzzmbvkrcscqwptlqo` | BD, Auth, Storage CDN |
| Vercel (4 proyectos) | Deploys de las 4 webs |
| Cloudflare | Turnstile, Web Analytics, DNS futuro |
| PostHog proyecto `550383` | Analítica de producto |
| Sentry org `ciszu-network` | Errores runtime |
| Discord (app del bot) | Bot + comunidad |

## 10. Checklist de alta de un nuevo servicio

- [ ] ¿Qué problema resuelve y por qué no lo cubre uno existente? (anti-solapamiento)
- [ ] ¿Gratis sin tarjeta? ¿Límites free? (registrar en tabla)
- [ ] ¿Requiere cuenta/email? ¿cuál? (registrar en §9)
- [ ] ¿Secretos? → `VAULT_SYSTEM.md` + `.env.local`/Vercel, nunca en código.
- [ ] Actualizar `AGENTS.md`, `FULL_STACK_SYSTEM.md` y este documento.

## 11. Criterios de permanencia de un servicio

Un servicio se mantiene en el ecosistema si cumple al menos 2 de 3:

- **Costo cero o mínimo** en el plan actual (sin tarjeta, dentro de límites free).
- **Uso real** (métricas PostHog/uptime que justifican su presencia).
- **Valor único** (no es duplicable con otro servicio ya presente).

Un servicio que no cumple → plan de retirada: migrar datos, quitar envs, actualizar docs,
borrar cuentas y registrar el cierre en `PROJECT_HISTORY`.

## 12. Tabla de alta/estado por servicio

| Servicio | Estado | Uso real |
|---|---|---|
| Supabase | Activo | BD + auth + Storage (CDN) |
| Vercel | Activo | Deploys 4 webs |
| GitHub Actions | Activo | CI/CD |
| UptimeRobot | Activo | Monitor 24/7 |
| ntfy | Activo | Notificaciones push |
| PostHog | Activo | Analítica |
| Sentry | Activo | Errores |
| Cloudflare | Activo | Turnstile + Web Analytics |
| Discord Developer | Activo | Bot |
| Binance / NOWPayments | Activo | Rieles de pago VE |
| R2 Cloudflare | En evaluación | Requiere tarjeta |
| Railway/Fly/etc. | No | No necesario |

## 13. Costos aproximados

| Servicio | Plan actual | Coste |
|---|---|---|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| GitHub | Private | $0 |
| PostHog | Free | $0 |
| Sentry | Free | $0 |
| UptimeRobot | Free | $0 |
| ntfy | Self-hosted (servidor del usuario) | $0 |
| VPS bot (futuro) | Oracle Free ARM | $0 |

## Procedimiento de rotación / baja de un servicio

1. **Baja**: agotar los datos o migrarlos (BD, archivos del bucket, eventos de analítica).
2. **Eliminar secretos**: revocar API keys/DSNs en el panel del proveedor y retirar las
   variables de `.env.local`, `.env` y Vercel (production+preview+development).
3. **Actualizar docs**: quitar el servicio de este inventario (§11), de `AGENTS.md`,
   `FULL_STACK_SYSTEM.md` y de las referencias cruzadas.
4. **Registrar el cierre** en `PROJECT_HISTORY.md` con fecha y motivo.
5. Si afecta a las webs (CSP, widgets, fuentes): actualizar middleware/CSP y validar en un build.

## Rotación de credenciales (recomendación)

| Tipo de secreto | Frecuencia sugerida |
|---|---|
| API keys de servicios en producción | Cada 6-12 meses o al filtrarse |
| DSN / tokens de Sentry | Solo si se filtran o al cambiar de plan |
| Tokens de deploys (Vercel/GitHub) | Cada 6 meses; revocar los de máquinas viejas |
| Keys de pago (NOWPayments IPN) | Solo si se filtran o se rota la HMAC |

Tras rotar: actualizar el vault (`VAULT_SYSTEM.md`), los `.env`/`.env.local` correspondientes
y Vercel, y probar un flujo real (p.ej. un envío de test).

## Servicios por rol de uso

| Rol | Servicios habituales |
|---|---|
| Desarrollo/configuración | Supabase, Vercel, GitHub, Cloudflare, Discord Developer |
| Operativo (día a día) | UptimeRobot, ntfy, PostHog, Sentry |
| Soporte/comunicación | Email Gmail/Outlook, WhatsApp, Discord de la comunidad |
| Monetización | NOWPayments, Binance P2P, Zinli, MetaMask / Lemon Squeezy (futuro) |

## Relación con otros sistemas

- `VAULT_SYSTEM.md` — dónde viven los secretos de cada servicio (nunca en este archivo).
- `CONTACTS_PROTOCOLS.md` — canales de soporte y cuentas de contacto del usuario.
- `FULL_STACK_SYSTEM.md` — lado técnico (versiones, SDKs) de las herramientas listadas aquí.
- `MONITORING_SYSTEM.md` / `ANALYTICS_SYSTEM.md` / `ERRORS_SYSTEM.md` — los servicios de
  observabilidad referenciados en §2.
- `PAYMENTS_SYSTEM.md` — detalle de los rieles de pago de §4.

## Preguntas frecuentes

**¿Dónde se apunta el email de una cuenta?** A `fplayersoffcial@gmail.com` (operativo) o
`ciszunetwork@outlook.com` (corporativo), según el rol.

**¿Un servicio free puede convertirse en pago?** Revisar aquí los límites (§13 costos) y en
`PAYMENTS_SYSTEM.md`; si supera el free se busca un sustituto (regla de financiación).

**¿Cómo se añade un servicio nuevo?** Seguir el checklist §10: problema que resuelve, free sin
tarjeta, cuenta/email, secretos, y actualizar este doc + `AGENTS.md` + `FULL_STACK_SYSTEM.md`.

## Checklist de auditoría semestral

- [ ] ¿Cada servicio de §1-§5 se sigue usando? (consultar métricas PostHog/UptimeRobot/Sentry)
- [ ] ¿Alguno duplica a otro? → aplicar §11 (criterios de permanencia).
- [ ] ¿Las cuentas/roles de las webs siguen siendo los suyos?
- [ ] ¿Los límites free siguen vigentes y sin riesgo de corte?
- [ ] ¿El inventario está actualizado en este doc, `AGENTS.md` y `VAULT_SYSTEM.md`?

_Última revisión: 13 ago 2026._ Relacionado: `CONTACTS_PROTOCOLS.md`, `VAULT_SYSTEM.md`,
`ANALYTICS_SYSTEM.md`, `MONITORING_SYSTEM.md`, `PAYMENTS_SYSTEM.md`, `FULL_STACK_SYSTEM.md`.
