# PLAN DE AUTENTICACIÓN (Auth Roadmap) — Ciszu Network

> **Estado**: plan a futuro aprobado (10 ago 2026). Documento de decisión: **Supabase-first**,
> Clerk como opción condicional. Ningún cambio de código derivado de aquí por ahora — solo
> guía para cuando surja la necesidad.
> Origen: toDo "Considerar Clerk para autentificacion" (resuelto con este análisis).

---

## 1. Visión: la escalera de autenticación (4 niveles)

El futuro de Ciszu Network es que **todas las apps se autentiquen con una sola cuenta**,
con login social (Google, Discord, GitHub...) y, al final, un **OAuth oficial de Ciszu
Network ("CISZU AUTH")** que delegue en terceros. La escalada es **incremental** — cada
nivel es un paso pequeño, no un salto:

| Nivel | Descripción | Estado |
|---|---|---|
| **N1** | Auth propia, NO centralizada (cada app su cuenta) | ✅ HOY |
| **N2** | Auth propia + OAuth de terceros (Google, etc.) | Próximo paso |
| **N3** | OAuth centralizado (una cuenta en todas las apps, vía terceros o proveedor único) | A futuro |
| **N4** | OAuth centralizado PROPIO + terceros — **"CISZU AUTH"** | Largo plazo |

---

## 2. Estado actual (mapa por app)

| App | Auth hoy | Nivel |
|---|---|---|
| **MuzicMania** | Supabase Auth (email/password, login por `@username`, reCAPTCHA, RLS `auth.uid()`) | N1 |
| **Ciszubot web** | OAuth Discord manual + sesión HMAC casera (`lib/auth.ts`) | N1 |
| **CiszuNetwork** | Sin auth | — |
| **CiszukoAntony** | Sin auth | — |

Dato clave: **MuzicMania ya usa Supabase Auth** (proyecto `obwzzmbvkrcscqwptlqo`). La
infraestructura de identidad del ecosistema ya existe y es gratis.

---

## 3. Decisión estratégica: Supabase-first (NO Clerk hoy)

**Veredicto**: el plan a futuro se construye sobre **Supabase Auth centralizado**, no sobre
Clerk. Motivo: el proyecto YA tiene su IdP (Supabase) funcionando con datos reales; cambiar
a Clerk hoy = reescribir la autenticación de MuzicMania (impacto detallado en §7), que es
exactamente el "cambio de tren" que la política del proyecto evita.

### Comparativa (datos 2026)

| Criterio | Supabase Auth (centralizado) | Clerk |
|---|---|---|
| Precio | **$0** (ya pagado/Free; 50K MAU Free) | Free 50K MRU/app, **Pro $20-25/mes** para social ilimitado + MFA + quitar branding |
| OAuth social (Google/Discord/GitHub/Apple...) | ✅ nativo, config dashboard | ✅ nativo (3 conexiones en Free) |
| Una cuenta en varias apps | ✅ mismo `auth.users` (el proyecto actual) | ✅ satellite domains (Pro) / multi-app |
| UI de login prebuilt | ❌ construirla (o Auth UI) | ✅ excelente (SignIn, UserButton) |
| MFA / passkeys | Básico (2FA TOTP sí) | ✅ pro (Pro) |
| RLS / integración BD | **Nativo** (`auth.uid()`) | Third-Party Auth (JWT `sub` como texto; el viejo JWT template deprecado desde abr 2025) |
| Migración desde el estado actual | **Ninguna** (es el mismo) | Reescribir login/registro + RPC + RLS + mapear IDs (ver §7) |
| OAuth propio ("CISZU AUTH") | ✅ Supabase OAuth Server (OAuth 2.1) | ❌ Clerk es el IdP (re-venta de identidad) |
| Riesgo | Ninguno | Migración de datos + riesgo de downtime |

**Regla**: no cambiar de tren; subir escalones. Clerk se re-evalúa solo si se cumplen los
criterios de §7.

---

## 4. Nivel 2 — OAuth de terceros en MuzicMania (próximo paso, coste bajo)

Cuando alguien pida "login con Google" en MuzicMania:

1. Crear la OAuth app en el proveedor (Google Cloud Console, GitHub, Discord Developer Portal...).
2. Pegar `client_id`/`client_secret` en Supabase Dashboard → Authentication → Providers.
3. Añadir el botón en login/register: `supabase.auth.signInWithOAuth({ provider: 'google' })`.
4. Configurar Redirect URLs (SITE_URL + `https://*-.vercel.app/**` para previews).

**Impacto: nulo** en esquema (mismo `auth.users`; la identidad social queda en
`auth.identities`), nulo en RLS (`auth.uid()` intacto), nulo en perfiles (el trigger
`handle_new_user` ya existe). Es ~1 hora de trabajo total.

**A futuro (mismo nivel, preparando N3)**: la web de ciszubot migrará su OAuth Discord
manual + HMAC a **Supabase Auth con provider Discord** — unifica la identidad con el resto
y elimina la sesión casera.

---

## 5. Nivel 3 — Centralización: una cuenta en las 4 apps

**Cómo (opción elegida)**: las 4 webs apuntan al MISMO proyecto Supabase
(`obwzzmbvkrcscqwptlqo`) usando `@supabase/ssr` (cookies server-side por dominio).

- El registro/login en cualquier web crea el usuario en el **mismo `auth.users`** → mismo
  `user_id` (UUID) → **RLS sin tocar** y datos transversales posibles (p.ej. un profile
  global reutilizable entre webs).
- La sesión es **por dominio** (cookies propias de cada web), pero la **cuenta es única**:
  mismo email + contraseña/Google en las 4.
- La anon key y URL son públicas (publishable) — ya están en las 4 apps.
- Redirect URLs: `SITE_URL` propio por web + wildcard de Vercel (los previews ya funcionan).

**Trabajo estimado**: añadir `@supabase/ssr` a las 3 webs sin auth (ciszunetwork,
ciszukoantony, ciszubot web) + una UI de login por web + reemplazar el HMAC de ciszubot.
No toca MuzicMania (ya está en Supabase Auth).

**Por qué no Clerk para esto**: mismo resultado con reescritura (§7) + coste. Supabase
centralizado ya cubre "una cuenta en todas las apps".

---

## 6. Nivel 4 — "CISZU AUTH" (largo plazo, requiere dominio)

**Objetivo**: un OAuth oficial de Ciszu Network — login en `auth.ciszu.network` (dominio
propio, Fase B de Cloudflare) que delega en Google/Discord/etc. y da identidad propia a
los usuarios de todo el ecosistema.

**Cómo**: **Supabase OAuth Server** — Supabase Auth puede actuar como OAuth 2.1 provider.
Con el dominio propio (`ciszu.network`) como marca:

- `auth.ciszu.network` = pantalla "Entra con CISZU AUTH" + proveedores de terceros.
- Las 4 webs (y apps futuras) redirigen a él (SSO entre dominios).
- Los usuarios pueden tener cuenta `@ciszu.network` propia o social.

**Condición previa**: dominio propio + plan de Fase B (ver `CLOUDFLARE_SISTEMA.md`).
Hasta entonces, N3 (sesión por dominio, misma cuenta) ya da el 90% del valor.

---

## 7. Clerk — punto de decisión (cuándo SÍ)

**Qué aporta Clerk que Supabase administrado no dé**: UI de login/registro prebuilt de
calidad, MFA/passkeys de primera clase, organizations B2B, tooling de migración, satellite
domains (una instance multi-dominio con sesión compartida), billing transparente.

**Cuándo contratarlo**: SOLO si se cumple al menos uno:
1. El equipo decide priorizar "no construir/auth administrado" sobre "no migrar", **y**
2. Se acepta la reescritura del auth de MuzicMania (impacto abajo).

**Impacto real de migrar MuzicMania hoy (auditoría 10 ago 2026 — `src/`)**: MEDIO-ALTO.
Puntos concretos que se rompen:
- **`muzicmania.submit_game_score` (RPC)**: usa `auth.uid()` → falla con Clerk (los IDs
  `user_...` no son UUID; `auth.uid()` lanza error). Reescribir como API route server-side.
- **Trigger `handle_new_user` sobre `auth.users`**: con Clerk `auth.users` no se puebla →
  crear `profiles` vía webhook `user.created`.
- **RLS en 8+ tablas** (profiles, scores, likes, reviews, review_likes, tickets,
  support_tickets, user_relations, deleted_accounts): policies con `auth.uid()` → migrar a
  `auth.jwt()->>'sub'` comparando contra columna **TEXT** (los IDs de Clerk no son UUID) +
  **re-tipear columnas user_id de UUID a TEXT** + mapear los IDs existentes (el riesgo
  mayor de la migración de datos).
- **Login por `@username`**: `resolve-username` lee `auth.users.email` → la fuente del
  email pasa a ser la API de usuarios de Clerk.
- **6 métodos de auth en 6 archivos** (getSession/onAuthStateChange ×5, signOut ×3,
  signIn/signUp/resetPassword/verifyOtp/updateUser en login/register) → sustituir por las
  APIs de Clerk (useAuth/useUser/signIn/signUp/...).
- **Dev tools** (`dbManager.ts` con `auth.admin.listUsers()`) dejan de funcionar.
- Se conserva: storage de avatares (anon key + RLS de storage), el resto de la BD.

Días de trabajo + riesgo de datos, para un beneficio que N2/N3 con Supabase ya dan. **No
es rentable hoy.**

---

## 8. Roadmap incremental

| Fase | Disparador | Acción | Coste |
|---|---|---|---|
| A | — (ya decidido) | Nada: documento aprobado | $0 |
| B | Alguien pide "login con Google" en MuzicMania | N2: providers en Supabase Auth + botón `signInWithOAuth` | ~1h |
| C | Una 2ª web necesita cuentas | N3: `@supabase/ssr` + UI login en 3 webs; unificar ciszubot web a Supabase | días |
| D | Dominio propio activo (Fase B Cloudflare) | N4: CISZU AUTH con Supabase OAuth Server | semanas |
| E | Si N3 se vuelve cuello de botella (MFA/orgs/UI) | Re-evaluar Clerk con criterios de §7 | decisión |

**Reglas anti-sobreingeniería**:
- Una cuenta = un `auth.users`. Nunca dos IdPs por app simultáneos.
- No añadir un IdP nuevo sin evaluar el mapeo de `user_id` (UUID ↔ texto).
- OAuth propio solo con dominio propio.
- Clerk solo si se cumplen los criterios de §7.

---

## Referencias

- Auditoría del auth de MuzicMania: `projects/muzicmania/website/src/` (login/register,
  `AuthProvider.tsx`, `config/supabase.ts`, `middleware.ts`) + migraciones en
  `services/supabase/migrations/`.
- Integración Clerk↔Supabase (Third-Party Auth, deprecación del JWT template):
  supabase.com/docs/guides/auth/third-party/clerk · clerk.com/docs.
- Precios Clerk 2026: clerk.com/pricing (Free 50K MRU/app, Pro $20/mes anual).
- Supabase OAuth Server: supabase.com/docs/guides/auth/oauth-server.
- Dominios/Fase B: `CLOUDFLARE_SISTEMA.md`.
