# VISUAL_BUILDERS_SYSTEM — Editores visuales de UI/UX (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-18
Identificador: VISUAL_BUILDERS_SYSTEM_V1.0.0_2026_08_18_ciszunetwork

> **Definición**: sistema que documenta la decisión de qué editor visual de UI/UX usar en el
> ecosistema: comparativa Onlook vs Plasmic vs Puck vs Subframe (estado verificado 18 ago 2026),
> análisis de compatibilidad con el stack real (Next.js 15 App Router + React 19 + Tailwind 4 +
> monorepo pnpm) y el plan de implementación del híbrido elegido.

> **Problema**: la tarea del `TODO.md` pide implementar un editor visual para construir y retocar
> UI/UX de las 4 webs sin escribir código a mano, documentado en este archivo. Antes de decidir
> hay que responder tres preguntas con datos verificados: ¿la herramienta edita el código real del
> monorepo local?, ¿es compatible con el stack (Next 15 + React 19 + Tailwind 4 + pnpm)?, ¿encaja
> con la filosofía del proyecto (open source, local-first, sin suscripciones)? Este doc responde
> eso para cada candidata y fija el plan de implementación.

---

## 1. Resumen ejecutivo (la respuesta corta)

| Herramienta | Licencia | Edita código local | Compatible con el stack | Veredicto |
|---|---|---|---|---|
| **Onlook** | Apache 2.0 (OSS) | ⚠️ Parcial (via web container, no edita el repo directamente) | Next.js + Tailwind, pero exige Docker + CodeSandbox + OpenRouter + waitlist | ⚠️ Prototipado AI, NO para editar este monorepo |
| **Plasmic** | MIT + AGPL (platform) | ⚠️ Sí, pero vía plataforma en la nube + CLI de sync | Next.js 15 ✅ (loader-nextjs 2.0.23) | ⚠️ CMS/builder en la nube — exceso para ajustes locales |
| **Puck** | **MIT** | ✅ **Sí — es una librería React embebida, 100% local** | **Next 15 + React 19 (peer `^18||^19`) + Tailwind** | ✅ **ELEGIDO (base del híbrido)** |
| **Subframe** | Propietario (freemium) | ❌ No (diseñas en su nube, exportas código) | Exporta React/Tailwind, pero no edita en vivo | ❌ Descartado |

**Decisión**: **híbrido Puck-first**. Puck (`@puckeditor/core`) como editor visual embebido dentro de
las apps que lo necesiten, operando 100% sobre el código real del monorepo, sin nube ni
suscripción. Onlook queda reservado como herramienta de prototipado AI opcional (no integrado),
Plasmic/Subframe descartados por su dependencia de plataformas externas. Detalle: §5 y §6.

---

## 2. Contexto: el stack real del monorepo (verificado en código, 18 ago 2026)

Antes de elegir hay que saber qué hay instalado. Datos tomados de los `package.json` reales:

| Capa | Valor real | Nota |
|---|---|---|
| Framework | **Next.js 15.5.22** (App Router) | 4 webs (`ciszu`, `ciszukoantony`, `muzicmania`, `ciszubot`) |
| React | **React 19.2.7** + React DOM 19.2.7 | Criterio duro: el editor debe soportar React 19 |
| Tailwind | **Tailwind CSS 4.2.4** + `@tailwindcss/postcss` | Config en CSS-first (v4), no `tailwind.config.js` clásico |
| TypeScript | 6.0.3 | Strict |
| Package manager | **pnpm 10.8.1** monorepo | Workspaces en la raíz (`pnpm-workspace.yaml`) |
| UI compartido | `@ciszu/ui` (workspace) | Iconos, tokens, Modal Radix accesible; Storybook + Chromatic |
| Resolución de assets | `@ciszunetwork/cdn` (`assetResolver`) | SVG/imágenes vía Supabase Storage `ciszu-cdn` |
| Validación | `zod` 4.4.3 + `@ciszunetwork/utils` (TypeBox server-only) | — |
| Estado client | `zustand` 5.0.14 | — |
| Animación | `framer-motion` 12.38.0 | — |

### 2.1 Implicaciones para cualquier editor visual

1. **React 19**: el editor y su runtime deben declarar peerDependency compatible con `^19` (o
   `^18 || ^19`). Un editor con peer `^18` duro rompe el workspace.
2. **Monorepo pnpm**: los bloques/editables deben ser componentes de `@ciszu/ui` o de cada app;
   el editor no puede asumir un único `pages/` ni una sola carpeta de componentes.
3. **Tailwind 4 (CSS-first)**: las clases se resuelven en build; un editor que "vea" el DOM en vivo
   necesita que las clases estén presentes (Puck renderiza los props tal cual, sin re-generar CSS).
4. **App Router**: el editor se monta como página/ruta dentro de la app (no `_app.tsx` global
   obligatorio, pero debe funcionar con server/client components).
5. **Assets vía CDN**: los bloques usan `assetResolver` → el editor embebido no rompe la resolución
   de imágenes.

---

## 3. Metodología de evaluación

Para cada herramienta se verificó (18 ago 2026) contra **fuentes primarias** (repo oficial,
docs oficiales, registry npm) y contra el **código real del monorepo**:

1. **Licencia y modelo**: OSS o propietario; costo real sin tarjeta.
2. **Edición de código local**: ¿modifica los `.tsx`/`.css` del repo donde corres la app?
3. **Compatibilidad con el stack**: Next 15 App Router, React 19, Tailwind 4, pnpm monorepo.
4. **Lock-in / nube**: ¿depende de un servicio externo para funcionar o para guardar?
5. **Seguridad**: qué secretos/permisos pide; si el editor puede acceder al filesystem.

No se instaló ninguna librería: la decisión es documental y cualquier instalación posterior
requiere aprobación explícita (regla 7.1 de `AGENTS.md`).

---

## 4. Análisis por herramienta (estado verificado)

### 4.1 Onlook (`onlook-dev/onlook`)

- **Repo**: `onlook-dev/onlook` (public). **Stars**: 26.5k. **Licencia**: Apache 2.0.
- **Qué es hoy**: "The Cursor for Designers" — herramienta de diseño AI-first para Next.js +
  Tailwind. Evolucionó: ya **no es solo un overlay sobre `localhost:3000`**.
- **Arquitectura actual** (docs oficiales `docs.onlook.com`):
  1. Crea una app (o importa) y carga el código en un **web container** (CodeSandbox SDK).
  2. El container corre y sirve la app; el editor la muestra en un iframe.
  3. El editor indexa el código, mapea elementos a su posición y edita en el iframe y en código.
  4. El chat AI tiene acceso a código y herramientas para editar.
- **Requisitos para correrla localmente** (dev/self-host):
  - **Bun** (runtime del monorepo), **Docker** (backend Supabase local), Node ≥ 20.16.
  - API keys obligatorias: **CodeSandbox** (para los dev containers), **OpenRouter** (chat AI),
    **MorphLLM o Relace** (fast-apply AI).
- **Producto alojado**: en **early access vía waitlist** (no abierto).
- **Compatibilidad**: enfocada en Next.js + Tailwind; "non-NextJS / non-Tailwind" en soporte avanzado.
- **Ventajas**: experiencia de diseño figma-like + AI; detección de componentes; branching.
- **Desventajas para este proyecto**:
  - Edita un **container de CodeSandbox**, no el filesystem del monorepo local directamente.
  - Exige **Docker + CodeSandbox + OpenRouter + fast-apply** para self-host: una plataforma completa.
  - Producto hosted cerrado (waitlist); self-host es infraestructura pesada.
- **Veredicto**: ⚠️ **reservado como prototipado AI opcional** (ver §6.3). No se integra como editor
  del monorepo; el costo de infraestructura no justifica editar 4 webs ya escritas.

### 4.2 Plasmic (`plasmicapp/plasmic`)

- **Repo**: `plasmicapp/plasmic` (public). **Stars**: 7k. **Licencia**: MIT (fuera de `platform/`),
  `platform/` bajo **AGPL**.
- **Qué es**: visual builder para React/Next. Uso típico: CMS/landing con drag-and-drop de
  componentes propios registrados (`PLASMIC.registerComponent`).
- **Cómo funciona**:
  - **Studio en la nube** (`studio.plasmic.app`) donde diseñas; los tokens (`PLASMIC_TOKEN`,
    `PLASMIC_PUBLIC_TOKEN`, `PLASMIC_SECRET_TOKEN`, `PLASMIC_CMS_ID`) están en el vault.
  - **Loader** (`@plasmicapp/loader-nextjs` v2.0.23) o **codegen** (`plasmic codegen`) para llevar
    el diseño al código local.
  - Publicación vía webhooks / revalidación incremental.
- **Compatibilidad**: Next.js 15 ✅ (loader-nextjs activo). Peer de React compatible con 19.
- **Ventajas**: maduro, drag-and-drop potente, codegen de componentes React limpios, CMS para
  contenido no técnico.
- **Desventajas para este proyecto**:
  - **Depende de la nube de Plasmic** para diseñar (Studio); no es 100% local.
  - Versiones exactas encadenadas entre `@plasmicapp/*` (dedupe frágil en monorepo).
  - Para "ajustar la UI de webs ya hechas" es excesivo: brilla construyendo páginas nuevas desde
    cero o como CMS, no retocando el código existente.
  - AGPL en `platform/` limita el fork/self-host de la plataforma.
- **Veredicto**: ⚠️ **descartado como base**; se documenta como alternativa futura si se necesita
  un **CMS visual para contenido no técnico** (marketing/landings). Secretos ya guardados en vault.

### 4.3 Puck (`puckeditor/puck`, antes `measuredco/puck`) — ELEGIDO

- **Repo**: `puckeditor/puck` (public). **Stars**: 13.2k. **Licencia**: **MIT**.
- **Qué es**: "The visual editor for React" — una **librería React** que se instala dentro de tu
  app (no una plataforma externa). Construyes experiencias drag-and-drop con **tus propios
  componentes**.
- **Cómo funciona**:
  - `@puckeditor/core` (paquete nuevo desde el rename; `@measured/puck` quedó deprecado).
  - Versionado: **0.23.0** (última, verificada en registry npm). Peer dependency:
    **`react: ^18.0.0 || ^19.0.0`** → compatible con React 19 del monorepo ✅.
  - `<Puck config={...} data={...} onPublish={save} />` renderiza el editor; `<Render>` muestra la
    página. `config` declara los bloques (components propios) y sus campos.
  - Recipes oficiales: **next** (App Router + SSG) y **react-router** → encaja con Next 15.
  - El estado del editor se guarda como JSON (tú decides dónde: DB, archivo, CMS).
- **Ventajas**:
  - **100% local y offline**: vive en el monorepo, sin servidores externos ni suscripción.
  - **Sin lock-in**: "You own your data" (cita del README oficial).
  - Registras como bloques los componentes reales de `@ciszu/ui` → diseño coherente con la marca.
  - Compatibilidad verificada: React 19 ✅, Next 15 App Router ✅, pnpm ✅.
  - **Puck AI** (opcional): el repo `puckeditor/skills` añade un skill para agentes que integra
    Puck y configura Puck AI (requiere cuenta Puck Cloud con crédito + `PUCK_API_KEY`).
- **Desventajas**:
  - No es "arrastrar elementos libres arbitrarios": se arma con **bloques/secciones predefinidas**
    que tú registras (paradigma page-builder, no free-form).
  - Requiere programar el `config` inicial (declarar cada bloque y sus campos).
  - Puck AI requiere cuenta de nube de Puck (opcional; el core no la necesita).
- **Veredicto**: ✅ **base del híbrido**. Ver plan en §6.

### 4.4 Subframe

- **Qué es**: plataforma **web** (estilo Figma) para diseñar con componentes Tailwind y **exportar**
  código React/Tailwind limpio.
- **Modelo**: freemium; plan gratuito limitado, Pro de pago (la URL de pricing devolvió 404 al
  verificar el 18 ago 2026 → modelo cambiante, no fiable).
- **Edición local**: ❌ no edita en vivo tu repo; diseñas en su nube y exportas/sincronizas.
- **Lock-in**: cerrado, propietario; el código exportado es tuyo pero el flujo depende de su web.
- **Veredicto**: ❌ **descartado**. Duplica lo que ya se resuelve con Tailwind + componentes propios,
  y añade dependencia de una nube de terceros.

---

## 5. Comparativa directa (criterios del proyecto)

| Criterio | Onlook | Plasmic | **Puck** | Subframe |
|---|---|---|---|---|
| **Licencia** | Apache 2.0 | MIT + AGPL (platform) | **MIT** | Propietario |
| **Edita el repo local** | ⚠️ Container, no filesystem | ⚠️ Vía sync/codegen + nube | ✅ **Embebido en la app** | ❌ Exporta |
| **100% offline** | ❌ (Docker + CodeSandbox + keys) | ❌ (Studio en la nube) | ✅ **Sí** | ❌ (nube) |
| **React 19** | ✅ (enfoque Next/Tailwind) | ✅ (loader 2.0.23) | ✅ **peer `^18||^19`** | n/a (exporta código) |
| **Next 15 App Router** | ✅ | ✅ | ✅ **recipe oficial** | ✅ (exporta) |
| **Tailwind 4** | ✅ | ⚠️ (gen. v3 principalmente) | ✅ (usa tus clases) | ✅ (exporta v4) |
| **pnpm monorepo** | ⚠️ (self-host pesado) | ⚠️ (dedupe frágil) | ✅ | ⚠️ (flujo web) |
| **Sin suscripción** | ⚠️ (self-host gratis, hosted waitlist) | ⚠️ (freemium) | ✅ **Gratis y OSS** | ❌ (freemium/Pro) |
| **Bloques = componentes propios** | ⚠️ (detección) | ✅ (registerComponent) | ✅ **config con tus comps** | ❌ (catalogo de ellos) |
| **AI asistido** | ✅ (nativo) | ✅ (opcional) | ✅ **Puck AI (opcional)** | ❌ |
| **Lock-in** | Medio (container) | Alto (Studio) | **Nulo (datos tuyos)** | Alto (nube) |
| **Curva / integración** | Alta (plataforma) | Media (CLI + Studio) | **Media (config en TS)** | Baja (export) |

**Lectura**: para un monorepo local-first, OSS y sin suscripciones, Puck es la única candidata que
cumple *todas* las restricciones duras (offline, React 19, App Router, pnpm, MIT, datos propios).
Onlook sigue siendo atractiva para **diseño AI de prototipos**, no para mantener código existente.

---

## 6. Plan de implementación (híbrido Puck-first)

### 6.1 Fase 0 — Instalación del skill y del paquete (requiere aprobación)

Regla 7.1 de `AGENTS.md`: **no instalar librerías sin confirmación humana**. Pendiente de
aprobación:

```bash
# Skill oficial para agentes que integra Puck + Puck AI (docs puckeditor/skills)
npx skills add puckeditor/skills --skill "puck"

# Paquete core (en el workspace que lo necesite, p. ej. una web o un paquete compartido)
pnpm --filter <workspace> add @puckeditor/core
```

- Instalarlo en **cada web** que quiera editor visual, o en un paquete compartido (`@ciszu/ui`) si
  se quiere reutilizar el `config` de bloques entre webs.
- `@ciszu/ui` ya exporta componentes accesibles → registrarlos como bloques de Puck.

### 6.2 Fase 1 — Config de bloques con componentes de `@ciszu/ui`

- Crear `puck.config.ts` (o `puck/` dentro del paquete) que registre los bloques: `Hero`,
  `Card`, `Navbar`, `Footer`, `FeatureGrid`, etc., usando los componentes reales de la marca.
- Los assets de los bloques resuelven con `assetResolver` de `@ciszunetwork/cdn` (sin romper CDN).
- Rutas: `/edit` (editor, client component) + render de páginas publicadas vía `<Render>`.
- Guardado del estado (JSON) a decidir: local (archivo/dev) → DB (Supabase) para producción.

### 6.3 Fase 2 — Puck AI (opcional)

- Requiere **cuenta Puck Cloud con crédito** + `PUCK_API_KEY`. En el vault existen `PUCK_KEY` y
  `PUCK_ORG_KEY` (referenciadas en `TODO.md`); verificar si corresponden a la API key de Puck
  Cloud antes de usarlas (`SECRET_TEMP.env` → vault → usar al vuelo).
- El skill `puckeditor/skills` incluye la guía "Set up Puck AI".

### 6.4 Fase 3 — Onlook como herramienta de prototipado (opcional, no integrado)

- No se instala en el monorepo. Si se quiere experimentar diseño AI: usar la versión hosted
  (waitlist) o self-host (Docker + CodeSandbox + OpenRouter + fast-apply) en un entorno separado.
- El código generado se traería a mano al repo (copy/paste de componentes) y se limpiaría para
  cumplir estándares del proyecto.

### 6.5 Criterios de aceptación

- [ ] Un editor visual funcional en al menos una web (p. ej. ciszunetwork) construyendo una
      sección con bloques de `@ciszu/ui`.
- [ ] El estado publicado se guarda en Supabase (nueva tabla **con RLS**, regla 1 de
      `SECURITY_PROTOCOLS.md`).
- [ ] Rate limiting si el guardado es un endpoint POST (`createRateLimiter`).
- [ ] Build de la web OK, lint OK, E2E sin regresiones.
- [ ] Documentado en este doc (esta sección se actualiza al implementar).

---

## 7. Seguridad

- **Secretos**: `PLASMIC_*`, `PUCK_*`, `SUBFRAME_*` están en `services/supabase/.env` (vault
  cifrado) y referenciados por nombre en `TODO.md` y `VAULT_SYSTEM.md`. **Nunca** en código ni en
  este doc. El puente `SECRET_TEMP.env` solo los contiene si Ciszuko los vuelve a pasar.
- **RLS**: cualquier tabla nueva para páginas publicadas requiere RLS + policy explícita en la
  misma migración.
- **Endpoints POST** (guardar página): `createRateLimiter` obligatorio.
- **Si se integra Puck AI**: la `PUCK_API_KEY` va en server-only (env del server), nunca expuesta
  al cliente.
- **No instalar** ninguna de estas librerías sin aprobación explícita (regla 7.1).

---

## 8. Historial

| Fecha | Cambio |
|---|---|
| 2026-08-18 | Creación. Investigación verificada de las 4 candidatas (repos/registry npm/docs), decisión híbrido Puck-first, plan en fases. |

---

## 9. Relación con otros docs

- `FRONTEND_SYSTEM.md` — arquitectura frontend de las webs.
- `UI_COMPONENTS_SYSTEM.md` — componentes `@ciszu/ui` (bloques de Puck) + Storybook/Chromatic.
- `STYLES_SYSTEM.md` y `COLOR_SYSTEM.md` — Tailwind 4 y tokens de la marca.
- `PACKAGES_SYSTEM.md` — reglas de los paquetes compartidos (dónde podría vivir el `config` de Puck).
- `CDN_SYSTEM.md` y `MEDIA_FORMATS_SYSTEM.md` — `assetResolver` para assets de los bloques.
- `DB_SYSTEM.md` y `SECURITY_PROTOCOLS.md` — guardado del estado + RLS.
- `TOOLS_EVALUATION_PLAN.md` — metodología de evaluación de herramientas candidatas.
- `VAULT_SYSTEM.md` — secretos de Plasmic/Puck/Subframe.
- `TODO.md` — tarea origen (solo lo edita Ciszuko Antony).

_Última revisión: 18 ago 2026._ Relacionado: `FRONTEND_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md`,
`STYLES_SYSTEM.md`, `PACKAGES_SYSTEM.md`, `CDN_SYSTEM.md`, `SECURITY_PROTOCOLS.md`,
`TOOLS_EVALUATION_PLAN.md`, `VAULT_SYSTEM.md`.
