# ORGANIZATIONAL_SCALABILITY_PLAN — Ciszu Network

> **Estado**: Documento de estrategia (plan a futuro, NO implementado).
> **Autor**: Ciszuko (CEO) · **Última revisión**: ago 2026.
> **Propósito**: Definir cómo evoluciona la infraestructura técnica y organizativa de Ciszu Network cuando pase de ser un proyecto individual a una empresa con varios trabajadores de **roles diversos** (no solo devs).

---

## 1. Contexto y diagnóstico actual

**Ciszu Network hoy es un monorepo de una sola persona.** El ecosistema digital (4 webs, bot de Discord, juego MuzicMania, CDN, paquetes compartidos) corre sobre:

| Capa                | Herramienta actual                                                                                                         | Orientada a                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Código / assets** | GitHub**Organization** `Ciszu-Network` (repo privado único `CiszuNetwork` + demo)                                          | 1 persona (yo, ADMIN)               |
| **Base de datos**   | 1 proyecto Supabase`obwzzmbvkrcscqwptlqo` (3 schemas: `ciszunetwork`, `ciszubot`, `muzicmania`) + 1 `service_role` maestra | 1 app/1 dueño                       |
| **Deploy**          | 4 proyectos Vercel bajo la organización (cuenta individual)                                                                | 1 desarrollador                     |
| **CDN / storage**   | Supabase Storage (`ciszu-cdn`, `avatars`)                                                                                  | Developer ops                       |
| **IA / terminal**   | opencode nativo + acceso remoto Tailscale+SSH (personal)                                                                   | 1 CEO                               |
| **Trabajo/deploy**  | GitHub Actions (CI + 4 deploys)                                                                                            | Automatizado, sin aprobación humana |

### Diagnóstico

1. **Los permisos actuales son binarios**: o tienes acceso total al repo, o no tienes nada. No existe "darle solo la parte de la animadora".
2. **El monorepo mezcla contenido creativo (logos, música, docs) con código** → cualquier desarrollador con acceso vería también los assets, o un creativo tendría que ver código para subir un logo.
3. **Hay una sola llave maestra de Supabase (`service_role`)** que da acceso total a la DB de las 3 apps. Compartirla = regalar la base de datos.
4. **No hay herramientas empresariales**: todo es de desarrollo (git, CI, DB). Faltan capas de gestión de equipo, comunicación interna, onboarding, tracking de tareas y gobernanza.

### Decisión estratégica previa (ya resuelta)

> La cuenta ya es una **GitHub Organization** (`Ciszu-Network`), lo que habilita teams, protecciones de rama y permisos granulares sin migrar nada.

---

## 2. Principio rector: **acceso mínimo necesario**

Cada rol recibe **solo lo que necesita para su función**, y nada más. Las reglas de oro:

1. **Contenido ≠ código** : una animadora/editora no necesita el código fuente, solo los assets.
2. **Lectura ≠ escritura** : un auditor de seguridad puede ver la DB sin poder modificarla.
3. **Producción ≠ desarrollo** : los deploys a producción requieren el flujo controlado (yo, o reviewers).
4. **Nunca se comparte una llave maestra** (service_role, tokens Vercel/Cloudflare) — se usa rol/credencial dedicada o se delega con tooling.

---

## 3. Tipos de rol futuros (mapa ampliado)

| Rol                                             | Ejemplo                             | ¿Qué necesita tocar?                               | ¿Qué NO debe ver?                 |
| ----------------------------------------------- | ----------------------------------- | -------------------------------------------------- | --------------------------------- |
| **Creativo/a** (animadora, diseñadora, editora) | Logos, banners, flayers, covers     | Assets del CDN + quizá repost de contenido         | Código, DB, secretos              |
| **Documentador/a**                              | Docs de usuario, manuales, guías    | Docs markdown, screenshot assets                   | Código core, DB                   |
| **Músico/productor**                            | Música del juego                    | Assets de audio (`music/`)                         | Código, DB                        |
| **Desarrollador/a**                             | Frontend/backend                    | Código del repo + schema del dominio que toca      | Secretos, otras apps no asignadas |
| **QA/Tester**                                   | Testing de webs y juego             | Acceso a entornos de preview/staging + bug tracker | Producción/DB real (idealmente)   |
| **Auditor/a de seguridad**                      | Revisa imports, RLS, dependencias   | **Lectura** de repo + **lectura** de schemas       | Escritura, service_role, deploy   |
| **Community manager**                           | Redes sociales, Discord de la marca | Cuentas sociales, canal de la comunidad            | Código, DB                        |
| **Administración/CEO**                          | Yo                                  | Todo (ADMIN en cada capa)                          | —                                 |
| **Contabilidad/legal** _(futuro)_               | Facturas, contratos                 | Documentos de negocio                              | Código, DB                        |

> El modelo no es "1 rol = 1 persona fija": las personas pueden tener **varios roles** (una editora también documenta), y los permisos se otorgan **por rol**, no por individuo.

---

## 4. Arquitectura de permisos por capa

### 4.1 GitHub Organization (código + contenido)

El monorepo sigue siendo **un solo repo**, pero con **teams + permisos por rol**:

- GitHub Organización ya creada: `Ciszu-Network` (yo ADMIN).
- Crear **teams**:
    - `core` (yo + devs senior) → Permisos **Write/Admin** en `CiszuNetwork` + protección de `main`.
    - `content-creators` (creativos, editores) → **Read** (o repo `assets` separado, ver 4.2).
    - `security-auditors` → **Read** (triage de issues de seguridad).
- **Protección de rama `main`**: PRs obligatorios + `ci.yml` verde + mínimo 1 reviewer (yo).
- **`CODEOWNERS`**: las carpetas críticas (`packages/`, `services/supabase/`, `.github/workflows/`) exigen aprobación de `core`.
- Cada miembro nuevo entra con una **cuenta personal de GitHub** añadida a su team — revocable al instante.

**¿Repo único o split?**

| Opción                                                      | Pros                                                                         | Contras                                        |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| **Monorepo único + teams (Read por rol)**                   | Simplicidad, un solo clone                                                   | El creativo**ve** el código aunque no lo toque |
| **Repo de assets separado** (`ciszu-assets` para creativos) | Separación física real: el creativo nunca ve código                          | 2ª estructura para mantener, sync CDN          |
| **Híbrido (recomendado)**                                   | Monorepo para devs;`ciszu-assets` con Action de deploy al CDN para creativos | Un workflow más                                |

> **Recomendación CEO-2**: cuando entre el primer creativo, crear `Ciszu-Network/ciszu-assets` (privado) + workflow "push → `pnpm cdn:upload`". El creativo _solo_ ve esa carpeta.

### 4.2 Supabase — acceso a datos por rol

Nunca se comparte `service_role`. Patrón de acceso:

| Rol                          | Mecanismo                                                                                                   | Qué toca                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **App (anon/authenticated)** | `anon` key + **RLS** (ya existe)                                                                            | Datos de su app vía API                   |
| **Auditor**                  | **Usuario Postgres `auditor` read-only** (creado con `GRANT SELECT` por schema/tabla) + conexión vía pooler | Ve, no modifica                           |
| **Dev**                      | `anon` + `service_role` **solo en entorno de desarrollo** de su dominio                                     | Su schema, sin datos reales de otras apps |
| **Deploy/backend (yo)**      | `service_role` **guardada en secreto de Vercel/GH**                                                         | Todo (es el "flywheel")                   |

- Se explota la separación por **schemas** ya existente (`ciszunetwork`, `ciszubot`, `muzicmania`): se pueden dar `GRANT` selectivos **por schema** a un usuario.
- Las **funciones RPC SECURITY DEFINER/INVOKER** ya documentadas en AGENTS.md se mantienen; los roles nuevos solo reciben lo estrictamente necesario.
- **Dashboard Supabase**: solo ADMIN (el Dashboard es acceso total al proyecto).

### 4.3 Vercel — deploys

- Mantener 4 proyectos bajo la organización; añadir miembros con **Viewer** (ven dashboard/deploys) o **Developer** (pueden deploy).
- Idealmente solo `core` tiene deploy a producción; QA usa **preview deploys** por PR.

### 4.4 CDN (Supabase Storage)

- El bucket `ciszu-cdn` es público (CDN), así que el acceso al contenido ya es abierto por URL (es el punto).
- Lo que se gestiona es **quién puede subir**: solo `core` / el workflow de assets (no acceso directo al bucket para creativos).

### 4.5 Terminal remota / IA (opencode)

- **El PC del CEO no es una oficina compartida.** Cada trabajador debe tener su **propio entorno** (VPS o máquina con clone) — los servicios (bot, builds) deberían migrar a un VPS (ver `docs/documentation/VPS_247.md`).
- Para **supervisión** (que YO vea lo que hacen, o que un dev senior supervise): replicar el patrón Tailscale+SSH del móvil — con One-off **Tailscale node sharing** o **Tailscale Business** (multi-usuario, 2FA).

---

## 5. Brecha de herramientas de CEO (lo que falta)

> "Las herramientas actuales son de 1 persona / informáticas, no empresariales." — correcto. Estas son las capas ausentes y las opciones baratas para empezar.

| Capa de gestión                    | Necesidad                              | Opciones (de menor a mayor)                                | Recomendación                                          |
| ---------------------------------- | -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| **Tracking de tareas / proyectos** | Ver qué hace cada persona, prioridades | GitHub Projects / Linear / Notion / Jira                   | **GitHub Projects** (gratis, ya integrado en la org)   |
| **Comunicación interna**           | Chats por rol, avisos, decisiones      | Discord (ya existe ecosistema) / Slack / Teams             | **Discord** con canales por equipo                     |
| **Documentación de negocio**       | Contratos, NDA, manuales               | Notion / Confluence / docs en repo                         | **Notion** (no técnicos) + docs .md en repo (técnicos) |
| **Onboarding**                     | Qué puede/no puede hacer cada rol      | `RUNBOOK_ROL_<X>.md` en repo/Notion                        | Documentar por rol                                     |
| **Secretos de equipo**             | Rotar/guardar credenciales compartidas | 1Password / Bitwarden Business                             | **Bitwarden** (opensource, barato)                     |
| **Gobernanza de acceso**           | Revisar quién tiene acceso a qué       | GitHub org audit log + revisión trimestral                 | Revisión periódica manual (hoy)                        |
| **Métricas de negocio** _(futuro)_ | Entender qué funciona                  | Supabase analytics / Vercel analytics / página de métricas | Pendiente decisión                                     |

**Acciones de CEO inmediatas (bajo costo):**

1. Crear teams en la org de GitHub (aunque solo esté yo, deja la estructura lista).
2. Activar protección de rama `main` (PRs obligatorios) — útil incluso solo.
3. Pre-rotar las credenciales antes de dar acceso a cualquiera (service_role, anon, tokens) — ver "Seguridad".
4. Decidir entorno compartido (VPS) para que el PC dejo de ser punto único de fallo.

---

## 6. Seguridad — bloqueos que deben resolverse ANTES de invitar a nadie

1. **Rotar `service_role`** (o al menos asegurarla en secretos y fuera del repo — ya operativa).
2. **Revisar RLS** de cada schema: que `authenticated` no vea datos que no deba.
3. **Token de Vercel** (`vcp_`, GH secret `VERCEL_TOKEN`): rotar y limitar a deploys.
4. **PAT filtrado del historial**: ya revocado (jul 2026) — ver AGENTS.md.
5. **secretlint/gitleaks**: mantener los hooks pre-commit activos para que nadie suba secretos nuevos.
6. **2FA** obligatorio en toda cuenta GitHub que entre a la org.

---

## 7. Hoja de ruta por fases (mapa de decisión)

### Fase 0 — HOY (individual) ✅

- Estructura completa operativa (4 webs, CDN, DB, bot). No hay nada que romper.
- **Acción CEO**: preparar estructura de teams + rama de protección (10 min).

### Fase 1 — Primer creativo/a (editora, animadora)

1. Crear repo `ciszu-assets` + Action de deploy a CDN.
2. Invitarlo/a a la org con permiso **solo** en `ciszu-assets`.
3. Documentar `RUNBOOK_CREATIVO.md` (cómo clonar, subir, ver resultado en el CDN).
4. Canal de Discord para el equipo creativo.

### Fase 2 — Primer técnico (dev / QA)

1. Teams de GitHub + `core` con Write + protección de `main`.
2. Reviewer obligatorio (yo) en PRs.
3. Usuario Postgres `auditor` **read-only** para quien necesite ver datos.
4. Credenciales rotadas; acceso vía cuenta GitHub personal.

### Fase 3 — Equipo creciendo (+3-5 personas, roles mixtos)

1. **VPS** para servicios (bot 24/7, entornos de equipo) — deja de depender del PC del CEO.
2. Tailscale **Business** o node sharing para acceso remoto multi-persona.
3. Notion para negocio + GitHub Projects para tareas.
4. Bitwarden para secretos de equipo.

### Fase 4 — Empresa formal (contratos, métricas, finanzas)

1. Gestión documental/legal (contratos, NDA).
2. Auditoría de acceso trimestral.
3. Métricas de producto (cuáles apps/secciones funcionan).
4. (Decisión de negocio) estrutura de pagos / roles remunerados — fuera de scope técnico.

---

## 8. Decisiones pendientes del CEO

- [ ] ¿Repo de assets separado cuando entre el primer creativo, o confiar en teams Read del monorepo? _(recomendado: separado)_
- [ ] ¿VPS para servicios cuando crezca el equipo? — ver `docs/documentation/VPS_247.md`
- [ ] ¿Tailscale personal compartiendo nodo (gratis) o Business (multi-usuario) cuando haya >1 persona remota?
- [ ] ¿Contactar con un desarrollador → GitHub team `core` con protección de `main`?
- [ ] ¿Cuándo rotar las credenciales antes de invitar a nadie?
- [ ] ¿GitHub Projects como tool de tracking, o Linear/Notion?

---

## 9. Referencias relacionadas

- `AGENTS.md` — mapa completo del monorepo, credenciales y seguridad
- `docs/documentation/REMOTE_CONTROL.md` — infraestructura Tailscale+SSH actual (base para multi-persona)
- `docs/documentation/VPS_247.md` — hosting del bot (punto de partida para entornos de equipo)
- `docs/documentation/TOOLS.md` — decisión de herramientas de desarrollo
- `docs/documentation/DEVSECOPS.md` — políticas de seguridad (XSS, SQLi, RLS)
- `GH org` → `Ciszu-Network` (ya creada, ADMIN: yo)
