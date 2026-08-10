# PLAN DE AUTENTICACIÓN (Auth Roadmap) — Ciszu Network

> **Estado**: plan a futuro aprobado (10 ago 2026). Documento de decisión: **Supabase-first,
> sin híbridos**, Clerk y alternativas evaluados y descartados con criterios de re-apertura.
> Ningún cambio de código derivado de aquí por ahora — solo guía para cuando surja la necesidad.
> Origen: toDo "Considerar Clerk para autentificacion" (resuelto con este análisis).

---

## 1. Visión: la escalera de autenticación (4 niveles)

El futuro de Ciszu Network es que **todas las apps se autentiquen con una sola cuenta**,
con login social (Google, Discord, GitHub...) y, al final, un **OAuth oficial de Ciszu
Network ("CISZU AUTH")** que delegue en terceros. La escalada es **incremental** — cada
nivel es un paso pequeño, no un salto:

| Nivel  | Descripción                                            | Estado       |
| ------ | ------------------------------------------------------ | ------------ |
| **N1** | Auth propia, NO centralizada (cada app su cuenta)      | ✅ HOY       |
| **N2** | Auth propia + OAuth de terceros (Google, etc.)         | Próximo paso |
| **N3** | OAuth centralizado (una cuenta en todas las apps)      | A futuro     |
| **N4** | OAuth centralizado PROPIO + terceros —**"CISZU AUTH"** | Largo plazo  |

---

## 2. Estado actual (mapa por app)

| App               | Auth hoy                                                                          | Nivel |
| ----------------- | --------------------------------------------------------------------------------- | ----- |
| **MuzicMania**    | Supabase Auth (email/password, login por`@username`, reCAPTCHA, RLS `auth.uid()`) | N1    |
| **Ciszubot web**  | OAuth Discord manual + sesión HMAC casera (`lib/auth.ts`)                         | N1    |
| **CiszuNetwork**  | Sin auth                                                                          | —     |
| **CiszukoAntony** | Sin auth                                                                          | —     |

Dato clave: **MuzicMania ya usa Supabase Auth** (proyecto `obwzzmbvkrcscqwptlqo`). La
infraestructura de identidad del ecosistema ya existe y es gratis.

---

## 3. Cuadro comparativo extenso (precios verificados ~may 2026)

### 3.1. Coste a distintas escalas (US$/mes)

| Proveedor              | Tipo                | Free tier                     | 50K MAU    | 100K MAU          | 500K MAU         |
| ---------------------- | ------------------- | ----------------------------- | ---------- | ----------------- | ---------------- | --- | --- |
| **Supabase Auth**      | BaaS (Postgres)     | **50K MAU**                   | $0         | **~$162**         | ~$1,487          |     |
| **Clerk**              | Servicio            | 50K MRU\*                     | $0         | **~$1,000-1,825** | ~$9,800          |     |
| **Auth0 (Okta)**       | Servicio enterprise | 25K MAU                       | ~$175-240  | ~$525+            | $20K-40K         |     |
| **Firebase Auth**      | BaaS (Google)       | 50K MAU                       | $0         | ~$275             | ~$1,500+         |     |
| **WorkOS AuthKit**     | Servicio            | **1M MAU**                    | $0         | $0                | $0 (SSO de pago) |     |
| **Kinde**              | Servicio            | 10.5K MAU                     | ~$1,383    | ~$2,758           | más              |     |
| **SuperTokens**        | OSS auto-hospedado  | $0 (self-host) / 5K (managed) | $0+hosting | $0+hosting        | $0+hosting       |     |     |
| **Better Auth**        | OSS librería (MIT)  | **$0 para siempre**           | $0+hosting | $0+hosting        | $0+hosting       |     |     |
| **Auth.js (NextAuth)** | OSS librería        | $0 para siempre               | $0+hosting | $0+hosting        | $0+hosting       |     |     |

\* **MRU ≠ MAU**: Clerk cobra por _Monthly Returning Users_ (usuarios que vuelven en el mes).
Con apps de alta retención, MRU ≈ MAU — el free de 50K no es más generoso de lo que parece.

### 3.2. Características (verificado 2026)

| Feature                                       | Supabase Auth     | Clerk               | Auth0           | Firebase   | Better Auth             | WorkOS    | SuperTokens |
| --------------------------------------------- | ----------------- | ------------------- | --------------- | ---------- | ----------------------- | --------- | ----------- | --- | --- | --- |
| Email/password                                | ✅                | ✅                  | ✅              | ✅         | ✅                      | ✅        | ✅          |
| OAuth social (Google/Discord/GitHub/Apple...) | ✅ 20+            | ✅ (solo 3 en Free) | ✅ 70+          | ✅ 10+     | ✅ 34+                  | ✅        | ✅          |
| Magic link                                    | ✅                | ✅                  | ✅              | parcial    | plugin                  | ✅        | ✅          |
| MFA (TOTP)                                    | ✅ (TOTP)         | ⚠️ solo Pro         | ✅              | ✅         | plugin                  | ✅        | ✅          |
| Passkeys                                      | beta              | ⚠️ solo Pro         | ✅              | beta       | plugin                  | ✅        | ✅          |
| UI prebuilt                                   | ❌ (comunidad)    | ✅ excelente        | ✅              | FirebaseUI | plugin (better-auth-ui) | AuthKit   | ✅          |
| Organizations/B2B                             | ❌ (manual)       | ✅                  | ✅ (pago)       | ❌         | plugin                  | ✅ fuerte | ⚠️ pago     |
| SAML/SSO enterprise                           | ❌                | pago                | ✅              | ❌         | plugin                  | ✅ (core) | pago        |
| **RLS nativa (auth.uid)**                     | ✅**único**       | ❌                  | ❌              | ❌         | ❌                      | ❌        | ❌          |
| OAuth provider propio (ser IdP)               | ✅ OAuth Server   | ❌                  | ✅ (enterprise) | ❌         | plugin OIDC             | ❌        | ❌          |
| Self-hosted / open source                     | ✅ (GoTrue)       | ❌                  | ❌              | ❌         | ✅ MIT                  | ❌        | ✅          |
| Una cuenta en varias apps                     | ✅ mismo proyecto | satellite (Pro)     | ✅              | ✅         | manual                  | ✅        | ✅          |
| Coste por usuario extra                       | **$0.00325/MAU**  | $0.02/MRU           | ~$0.07/MAU      | $0.0055    | $0                      | $0 (1M)   | $0 (self)   |     |     |     |

### 3.3. Los muros de Clerk (Free tier, 2026)

Clerk **NO es totalmente gratis** para todo lo que quieres:

1. **Solo 3 conexiones sociales** en Free (Google + Discord + 1 más; ilimitadas en Pro).
2. **Sin MFA ni passkeys** (Pro $20-25/mes).
3. **Sesión fija de 7 días** (sin personalizar; Pro).
4. **Sin quitar el branding de Clerk** (Pro) — tu login diría "Powered by Clerk".
5. **Satellite domains** (sesión compartida entre dominios — clave para "una cuenta en
   varias apps") son **Pro, $10/mes por dominio**.
6. **Overage $0.02/MRU** → a 100K MAU cuesta ~$1,000-1,825/mes (6-11× Supabase).
7. UI y dashboard limitados a 3 seats en Free.

**Conclusión de coste**: el plan a futuro de Ciszu (multi-app + social + "CISZU AUTH")
toca TODOS los muros → Clerk gratis no llega; Clerk de pago sale 6-11× más caro que
Supabase a escala, para features que Supabase ya cubre o se construyen en código.

---

## 4. Decisión estratégica: Supabase-first, SIN híbridos

**Veredicto**: Supabase Auth centralizado (el proyecto actual). Clerk NO. Híbrido
(Supabase + Clerk) NO — peor opción: dos IdPs, dos `user_id`, duplicar la identidad.

**¿Clerk tiene algún beneficio que NO pise Supabase?** Sí, pero todos son "conveniencia
administrada", no capacidades imposibles en Supabase:

| Beneficio de Clerk                                  | ¿Cubre Supabase?                  | Esfuerzo de cubrirlo en Supabase                                              |
| --------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| UI prebuilt (SignIn/UserButton/UserProfile)         | No tiene UI oficial               | Construir ~3 páginas de login + avatar (una vez, reutilizables en las 4 webs) |
| MFA/passkeys de primera                             | TOTP 2FA básico sí; passkeys beta | Aceptable hoy; activar TOTP es 1 línea                                        |
| Organizations B2B                                   | No                                | No lo necesitamos (B2C)                                                       |
| Satellite domains (sesión compartida multi-dominio) | Sesión por dominio (misma cuenta) | Con N4 + dominio propio se logra SSO real                                     |
| Audit logs / device tracking                        | Parcial                           | Para usuarios de verdad, no para hoy                                          |
| Entorno Dev/Prod + impersonación                    | No                                | Menor                                                                         |
| Tooling de migración                                | No aplica                         | No lo necesitamos                                                             |

**Regla**: no cambiar de tren; subir escalones. Un IdP nuevo se re-evalúa SOLO si se
cumplen los criterios de §8.

---

## 5. Alternativas evaluadas (y por qué no)

| Alternativa                                                        | Veredicto  | Motivo                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Better Auth** (OSS, MIT, 30K⭐, mejor DX TS del mercado 2025-26) | ⚠️ Vigilar | Gratis para siempre + plugins (2FA, orgs, OIDC, passkeys).**Pero**: pisa RLS (su sesión no entra en `auth.jwt()` de Supabase → habría que migrar muzicmania igual que con Clerk) y hay que operarlo. Opción de emergencia si Supabase encarece; no hoy. |
| **WorkOS AuthKit** (1M MAU gratis)                                 | ❌         | 1M gratis es el mejor free del mercado, pero es otro IdP administrado (migración) y SSO enterprise de pago; no aporta sobre Supabase en B2C.                                                                                                            |
| **Auth0**                                                          | ❌         | El más caro (enterprise), fechas de precio anuales; "poco motivo para empezar en Auth0 en 2026" (consenso del mercado).                                                                                                                                 |
| **Firebase Auth**                                                  | ❌         | 50K MAU gratis pero lock-in Google + BD nuestra es Supabase; B2B pobre.                                                                                                                                                                                 |
| **SuperTokens**                                                    | ❌         | OSS self-hosted gratis pero hay que operarlo; DX peor que Better Auth; orgs/SAML de pago.                                                                                                                                                               |
| **Kinde**                                                          | ❌         | Caro a escala (~$2,758/100K); no aporta sobre Supabase.                                                                                                                                                                                                 |
| **Auth.js / NextAuth v5**                                          | ❌         | Gratis y maduro, pero tipado manual, config compleja y sin RLS; no aporta sobre Supabase.                                                                                                                                                               |
| **AWS Cognito**                                                    | ❌         | Solo si se viviera en AWS.                                                                                                                                                                                                                              |
| **Keycloak/Logto/Ory (self-hosted)**                               | ❌         | Operación pesada; overkill para el ecosistema.                                                                                                                                                                                                          |

**Ninguna alternativa da una ventaja sobre "Supabase Auth + RLS ya funcionando" en las
fases N1-N4.** Supabase es, además, el **más barato a escala** de los servicios administrados
($0.00325/MAU, 6× menos que Clerk) y open source (escape hatch: auto-hospedar GoTrue).

---

## 6. Roadmap incremental

| Fase | Disparador                                    | Acción                                                                         | Coste    |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------ | -------- |
| A    | — (ya decidido)                               | Nada: documento aprobado                                                       | $0       |
| B    | Alguien pide "login con Google" en MuzicMania | **N2**: providers en Supabase Auth + botón `signInWithOAuth`                   | ~1h      |
| C    | Una 2ª web necesita cuentas                   | **N3**: `@supabase/ssr` + UI login en 3 webs; unificar ciszubot web a Supabase | días     |
| D    | Dominio propio activo (Fase B Cloudflare)     | **N4**: CISZU AUTH con Supabase OAuth Server                                   | semanas  |
| E    | N3 se vuelve cuello de botella (UI/MFA/orgs)  | Re-evaluar con criterios de §8                                                 | decisión |

**Reglas anti-sobreingeniería**:

- Una cuenta = un `auth.users`. **Nunca dos IdPs por app** (el híbrido es lo peor: dos
  identidades por usuario, sincronización, migración doble).
- No añadir un IdP nuevo sin evaluar el mapeo de `user_id` (UUID ↔ texto).
- OAuth propio solo con dominio propio.
- Cambiar de proveedor = reescritura de MuzicMania (impacto en §7) — solo si el criterio
  de §8 se cumple de verdad.

---

## 7. Impacto real de migrar MuzicMania a un IdP externo (auditoría 10 ago 2026)

**Dificultad: MEDIA-ALTA** (días de trabajo + riesgo de datos). Puntos que se rompen con
Clerk/Better Auth/WorkOS (cualquier IdP que no sea Supabase Auth):

- **`muzicmania.submit_game_score` (RPC)**: usa `auth.uid()` → con Clerk los IDs `user_...`
  no son UUID y `auth.uid()` lanza error → reescribir como API route server-side.
- **Trigger `handle_new_user` sobre `auth.users`**: con IdP externo `auth.users` no se
  puebla → crear `profiles` vía webhook del IdP.
- **RLS en 8+ tablas** (profiles, scores, likes, reviews, review_likes, tickets,
  support_tickets, user_relations, deleted_accounts): policies con `auth.uid()` → migrar a
  `auth.jwt()->>'sub'` (texto) + **re-tipear columnas user_id de UUID a TEXT** + mapear IDs
  existentes (el riesgo mayor de la migración de datos).
- **Login por `@username`**: `resolve-username` lee `auth.users.email` → la fuente del
  email pasa a la API del nuevo IdP.
- **6 métodos de auth en 6 archivos** (getSession/onAuthStateChange ×5, signOut ×3,
  signIn/signUp/resetPassword/verifyOtp/updateUser) → sustituir por las APIs del IdP.
- **Dev tools** (`dbManager.ts` con `auth.admin.listUsers()`) dejan de funcionar.
- Se conserva: storage de avatares (anon key + RLS de storage), el resto de la BD.

---

## 8. Punto de decisión (cuándo re-abrir el tema de Clerk u otro IdP)

Re-evaluar SOLO si se cumple al menos uno:

1. El equipo decide priorizar "no construir UI/auth" sobre "no migrar", **y** se acepta la
   reescritura de §7 (días + riesgo).
2. Se necesitan **organizations/B2B profundas** (SAML/SCIM/directory sync) — ahí Clerk/WorkOS
   ganan claramente (mientras tanto: Better Auth plugin es la alternativa OSS).
3. Supabase deja de ser el stack de BD (dejaría de tener sentido su auth).
4. El coste de Supabase supera a un IdP administrado (a 100K MAU: $162 Supabase vs
   ~$1,000 Clerk — improbable que ocurra).

Hasta entonces: **decisión cerrada — Supabase-only.**

---

## Referencias

- Auditoría del auth de MuzicMania: `projects/muzicmania/website/src/` (login/register,
  `AuthProvider.tsx`, `config/supabase.ts`, `middleware.ts`) + migraciones en
  `services/supabase/migrations/`.
- Comparativas 2026: cheapstack.dev/tools/auth-services · clirank.dev/compare/auth-apis ·
  youngju.dev (Auth Provider Shootout 2026) · pricingapis.com/auth.
- Precios Clerk 2026: clerk.com/pricing (Free 50K MRU/app, Pro $20/mes anual, satellite
  domains $10/mes).
- Integración Clerk↔Supabase (Third-Party Auth, deprecación JWT template abr 2025):
  supabase.com/docs/guides/auth/third-party/clerk.
- Supabase OAuth Server: supabase.com/docs/guides/auth/oauth-server.
- Better Auth: better-auth.com (MIT, plugins, better-auth-ui).
- WorkOS AuthKit: 1M MAU gratis (2026).
- Dominios/Fase B: `CLOUDFLARE_SISTEMA.md`.
