# ONLINE_SERVICES — Servicios y sitios en línea usados

Inventario de las plataformas online y servicios usados por Ciszu Network (ago 2026). Incluye enlaces a dashboards, APIs y servicios. Complementa `TECH_STACK.md` (lado técnico de herramientas).

## Hosting / infraestructura

| Servicio | Uso | Acceso |
| -------- | --- | ------ |
| **Supabase** | BD (Postgres+PostgREST), Auth, Storage CDN `ciszu-cdn` | Dashboard `https://supabase.com/dashboard/project/obwzzmbvkrcscqwptlqo` · API `obwzzmbvkrcscqwptlqo.supabase.co` · Management API `/v1/projects/` |
| **Vercel** | 4 deploys (ciszunetworkpage, ciszukoantonypage, ciszubot, muzicmania) | `vercel.com/dashboard` + CLI; log/trafc en cada proyecto |
| **GitHub** | Repo privado `Ciszu-Network/CiszuNetwork`, Actions, dependabot, code/secret scanning | `github.com/Ciszu-Network` |
| **Cloudflare** | DNS/proxy (fase A: Web Analytics beacon + Turnstile captcha ×4 webs; R2 inactivo) | `dash.cloudflare.com` |

## Monitorización y analítica

- **UptimeRobot** — 5 monitores KEYWORD (webs + `supabase-bot-status`): dashboard + API v3. Cuenta `fplayersoffcial@gmail.com`.
- **ntfy.sh** — notificaciones push (topic público `ciszu-1a41fa89...`), watcher `scripts/uptime-watch.js` cada 5 min.
- **PostHog** — analítica de producto/errores (proyecto 550383): `us.i.posthog.com` (ingest) + Dashboard PostHog.
- **Sentry** — errores runtime ×4 webs + bot: `sentry.io/organizations/ciszu-network`.
- **Vercel Speed Insights** — Core Web Vitals (muzicmania).
- **Cloudflare Web Analytics** — tráfico (beacon estático, token público).

## Paquetes de código/comunidad

- **npm/pnpm registry** — dependencias del monorepo; `pnpm audit` vía registry.
- **top.gg / discordbotlist** — bot lists de CiszuBot (auto-post cada 30 min; tokens en vault, sin valores).
- **Discord Developer Portal** — aplicación del bot (OAuth2, redirects, intents, bot token).

## Pagos y monetización (ver `PAYMENTS_SYSTEM.md`)

- **NOWPayments** — invoices/donaciones crypto (IPN HMAC).
- **Lemon Squeezy** — stub a futuro (18 años).
- **Binance P2P / Zinli / MetaMask** — rieles VE.
- **Resend** — emails transaccionales (`@ciszunetwork/email`, ver `EMAILS_SYSTEM.md`; requiere dominio Fase B). Brevo descartado (cuenta suspendida + teléfono no VE).

## Otros en línea

- **age / vault** local (no es servicio online) — ver `VAULT_SECURITY.md`.
- **Google Fonts / fuentes** — Geomanist (local/CDN) + Exo_2/Rajdhani (webs con tema neon).
- **OpenAI-compatible LLM (Gemini)** — endpoint `generativelanguage.googleapis.com/v1beta/openai/` para el sistema de voz (`tools/tts-stt-ai`).
- **Modelos IA generativos** — HF, SiliconFlow, fal.ai (video, sin saldo), AceMusic — ver `EDUCATION.md` y `tools/`.

## Dashboards de Supabase (acciones frecuentes)

- Reports & Usage (cuota storage — el bucket quedó en 16 % tras limpieza).
- Database → Schemas/Advisors (security linter).
- Storage → buckets (`ciszu-cdn`, `avatars`).
- Auth → users/MFA (leaked password advisor es límite Free).

## Reglas

- Las **URLs públicas** (dashboard, invitaciones, redes) pueden ir en docs; secretos solo vía env/vault.
- Si un servicio cambia de cuenta/URL, actualizar aquí + `AGENTS.md` + `VAULT_SECURITY.md`.

_Última revisión: 11 ago 2026._