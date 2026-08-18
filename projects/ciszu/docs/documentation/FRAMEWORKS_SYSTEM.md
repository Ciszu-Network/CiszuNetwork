# FRAMEWORKS_SYSTEM — Sistema de Frameworks (Ciszu Network)

Versión: 1.1.0
Actualización: 2026-08-19
Identificador: FRAMEWORKS_SYSTEM_V1.1.0_2026_08_19_ciszunetwork

> **Definición**: sistema que documenta los **frameworks** (concepto de informática:
> conjunto de código/abstracciones para desarrollar aplicaciones) usados en el monorepo:
> qué son, para qué se usan, versiones y cuándo usarlos. Complementa `FULL_STACK_SYSTEM.md`
> (que lista todo el stack) centrándose en los frameworks web/desktop/bot.

---

## 1. Frameworks por capa

| Capa | Framework | Versión (verificada) | Dónde |
|---|---|---|---|
| **Web (frontend)** | Next.js (React) | 15.5.22 | Las 4 webs |
| **Testeo local (compilación)** | Next.js (`next build` / `next dev`) | 15.5.22 | Las 4 webs — build valida el código |
| **Estilos** | Tailwind CSS | 4.2.4 | Todas las webs |
| **Desktop** | Tauri | 2.x (api 2.11.0) | MuzicMania (desktop) |
| **Bot** | Discord.js | 14.22.0 | CiszuBot |
| **Editor visual UI** | Puck (`@puckeditor/core`) | 0.23.0 | ciszunetwork (editor de páginas) |
| **ORM/DB** | Drizzle ORM | (monorepo `packages/db`) | Todas las webs (server-only) |
| **Backend** | Supabase (PostgreSQL + PostgREST) | — | Todos los proyectos |
| **Monorepo** | Turborepo | 2.5.0 | Raíz |
| **Testing** | Vitest | 4.1.10 | Paquetes y webs |
| **Testing E2E** | Playwright | 1.62.1 | `test/` (E2E) |

## 2. Definición y propósito (contexto informático)

Un **framework** es una estructura de software que dicta el esqueleto de la app y te da
utilidades: routing, componentes, estilos, build. A diferencia de una **librería** (la
llamas tú), el framework llama a tu código (inversión de control).

| Framework | Tipo | Qué aporta |
|---|---|---|
| Next.js | Full-stack React framework | Routing, SSR/SSG, API routes, optimización de assets |
| Next.js (testeo local) | Compilación local como verificación | `next build`/`next dev` atrapan errores de bundling/TS antes de desplegar |
| Tailwind | CSS framework (utility-first) | Clases atómicas (`bg-brand`, `text-neon-pink`) |
| Tauri | Desktop framework (Rust + WebView) | Shell de escritorio liviano |
| Discord.js | Librería/framework de bot | Interfaz sobre la API de Discord |
| Puck | Editor visual de páginas (React) | `<Puck>` editor + `<Render>` difusión, bloques propios |
| Drizzle | ORM TypeScript (SQL-first) | Queries tipadas + migraciones SQL versionadas |
| Supabase | BaaS | BD, auth, storage listos |
| Turborepo | Build orchestration | Caché y pipeline de tareas |

## 3. Next.js (web)

### 3.1 Versión y decisión

- **Next.js 15.x con App Router** — obligatorio en las 4 webs.
- React 19.x. Estilos con Tailwind v4 (no config JS: `@theme` en CSS).
- Las webs NO se migran a otra solución (Vite/Remix) sin decisión explícita.

### 3.2 Estructura App Router

```
src/app/
├── layout.tsx          # layout raíz (nav, footer, metadata, manifest, guard)
├── globals.css         # @theme + estilos globales
├── page.tsx            # página principal
├── (secciones)/        # rutas agrupadas
└── api/                # API routes (serverless)
```

### 3.3 Convenciones

- Componentes interactivos: `'use client'` en archivos `.tsx`.
- Server Components por defecto (sin `'use client'`).
- `metadata` export en layouts/pages para SEO.
- Assets: resolver/CDN (`@ciszunetwork/cdn`), nunca duplicados en `public/`.
- SW: `public/sw.js` + register en client.

### 3.4 Next.js como framework de testeo local (compilación)

`next build` (y `next dev`) actúa **también como framework de testeo local**: compila las 4
webs, tipa con el tsconfig de cada app y falla en errores de bundling/import/SSR. Reglas:

- **Antes de dar por terminada cualquier tarea de frontend**: correr `pnpm --filter <web> build`
  (o al menos que compile en `next dev` con `[ON]` en la consola). La compilación local es
  verificación obligatoria, nunca asumir que "compila porque tipo bien".
- El build local detecta: imports inexistentes, errores de tipos en runtime de pages,
  componentes client/server mal mezclados, rutas dinámicas inválidas.
- No sustituye a Vitest (lógica) ni Playwright (navegador): es la primera capa de verificación
  (barata, sin navegador) antes de las demás. Ver `TESTING_SYSTEM.md` y `LOCAL_TESTING_PROTOCOLS.md`.
- Los deploys automáticos de Vercel corren `build` en CI, pero verificar localmente antes del
  push evita despliegues rotos y fallos en cadena (los workflows re-despliegan las 4 webs si
  cambia `packages/**`).

## 4. Tailwind CSS (estilos)

### 4.1 Versión y formato

- **Tailwind v4**: definición de tokens en `@theme` dentro de `globals.css`.
- No hay `tailwind.config.js` (v4 usa CSS-first config).

```css
@theme {
  --color-brand: #233f92;
  --color-neon-pink: #ff33cc;
  --shadow-neon-blue: 0 0 10px rgba(89, 180, 255, 0.4);
}
```

### 4.2 Uso

```tsx
<div className="bg-brand text-white shadow-neon-blue">
```

- Clases generadas de `--color-*`: `bg-*`, `text-*`, `border-*`.
- Nunca usar `style={{}}` para color; siempre clases/tokens.

## 5. Tauri (desktop)

- Framework de escritorio: Rust + WebView2.
- App principal: MuzicMania (launcher/game).
- Build: `pnpm tauri build` → instaladores NSIS.
- Ver `INSTALLERS_SYSTEM.md` para la cadena de distribución.

## 6. Discord.js (bot)

- Librería para bots de Discord, v14.
- CiszuBot: bot con slash commands + context menu (ver `PROJECTS_SYSTEM.md`).
- Corre en Node 24-alpine (Docker) con Dockerfile.

## 6.5 Puck (`@puckeditor/core`) — editor visual (18 ago 2026)

- Librería React, MIT, para construir **editores visuales drag-and-drop** con tus propios
  componentes. No es una plataforma externa: vive en el monorepo, 100% offline.
- Instalada en `ciszunetwork-website` (`0.23.0`, peer `react ^18 || ^19`). Config en
  `src/puck.config.tsx` con los bloques Hero/SectionTitle/Stats/Cta/Wrapper; rutas
  `/edit/[[...path]]` (editor) y `/pages/[[...path]]` (render público); guardado vía
  `POST /api/puck/save` (rate limit) hacia `ciszu.puck_pages` (RLS). Ver
  `VISUAL_BUILDERS_SYSTEM.md` §6 para el detalle de la implementación.
- **Regla**: solo instalar en las webs que tengan editor; el `config` de bloques puede
  compartirse vía un paquete compartido si se reutiliza. Franquicia opcional (Puck AI)
  documentada en `VISUAL_BUILDERS_SYSTEM.md` §6.3.

## 6.6 Drizzle (ORM)

- ORM TypeScript SQL-first usado por `@ciszunetwork/db` (capa de datos server-only del
  monorepo). Schemas en `packages/db/src/schemas/{ciszubot,muzicmania,ciszunetwork,ciszu}.ts`;
  cliente `pg` + `NodePgDatabase`, helpers de query re-exportados (`eq`, `and`, `sql`, …).
- Migraciones: SQL versionado en `services/supabase/migrations/` (aplicadas a Supabase vía
  `scripts/apply-migration-XX.js` o dbvr). Detalle: `ORM_SYSTEM.md` y `DB_SYSTEM.md`.
- **Regla**: NUNCA usar en client/edge (solo server, `import "server-only"`); queries
  parametrizadas (sin concatenación SQL).

## 7. Supabase (backend)

- BaaS: PostgreSQL + Auth + Storage.
- Access: supabase-js; REST via PostgREST.
- Seguridad: RLS (ver `SECURITY_PROTOCOLS.md` y `BACKEND_SYSTEM.md`).

## 8. Reglas de uso de frameworks

| Regla | Descripción |
|---|---|
| **No mezclar frameworks web** | Las webs usan Next.js; no añadir otro framework de UI sin aprobación |
| **Tailwind v4 obligatorio** | No volver a v3 ni usar CSS modules salvo excepción |
| **Tauri y no Electron** | Decisión fijada (ver `ARCHITECTURE.md`) |
| **Discord.js v14** | No migrar el bot a otra librería |
| **Frameworks nuevos** | Requieren aprobación y documentación antes de usar |
| **Versiones** | Pinning en `FULL_STACK_SYSTEM.md`; subir major solo con validación |

## 9. Checklist de adopción de un framework nuevo

- [ ] ¿Resuelve un problema real que el stack actual no cubre?
- [ ] ¿Aprobado por el usuario (regla de `CODE_PRINCIPLES_PROTOCOLS.md`)?
- [ ] ¿Versionada y estable (no alpha)?
- [ ] ¿Compatibilidad con Next 15 / React 19 / Tailwind v4 verificada?
- [ ] ¿Documentado aquí y en `FULL_STACK_SYSTEM.md`?

## 10. Troubleshooting de frameworks

| Problema | Causa | Solución |
|---|---|---|
| Clases Tailwind no aplican | Token no en `@theme` o nombre incorrecto | Añadir token y rebuildar |
| Componente no hidrata en client | Falta `'use client'` | Añadir directiva |
| Build Tauri lento | Primera compilación Rust | Cachear target; usar releases |
| Bot no responde | Token/perms | Revisar env + invite perms |

## 11. Cómo instalar o actualizar frameworks

### 11.1 En el monorepo (pnpm)

```bash
# añadir dependencia a una app concreta
pnpm --filter ciszunetwork-website add <paquete>

# actualizar a nivel de workspace
pnpm up <paquete>
```

- Versiones de frameworks de referencia en `FULL_STACK_SYSTEM.md` (pinning).
- Antes de subir de major: validar build de las 4 webs + tests.

### 11.2 Tauri (Rust toolchain)

- Requiere Rust toolchain: `rustup update`.
- Build: `pnpm --filter muzicmania-website tauri build`.
- Iconos: `tauri icon <png>`.

### 11.3 Supabase (CLI)

```bash
supabase link --project-ref obwzzmbvkrcscqwptlqo
supabase db push   # aplicar migraciones locales a prod (o via apply-migration-*.js)
```

## 12. Mapa de dependencias entre frameworks

```
Next.js (web) ── Tailwind v4 (estilos)
    │            └─ next build/dev = testeo local (compilación)
    ├── @ciszu/ui (React 19, componentes compartidos)
    ├── @ciszunetwork/cdn (assets: imágenes, skins)
    ├── @ciszunetwork/db (Drizzle ORM, server-only) ── Supabase (Postgres/Auth/Storage)
    ├── @ciszu/utils (rate limit, IAST, escapeHtml)
    ├── @puckeditor/core (editor visual /edit de ciszunetwork) ── ciszu.puck_pages
    └── Supabase-js ── Supabase (Postgres/Auth/Storage)

Tauri (desktop) ── Rust + WebView2 ── sirve la web de MuzicMania
Discord.js (bot) ── Node 24 ── Supabase (heartbeat, comandos)
Testing: Vitest (unit) + Playwright (E2E) + next build (verificación local) + Storybook (@ciszu/ui)
```

## 13. Buenas prácticas por framework

| Framework | Práctica |
|---|---|
| Next.js | Server Components por defecto; metadata en layouts |
| Tailwind | Tokens en `@theme`; sin CSS inline |
| Tauri | `bundle.targets` mínimo necesario; versionar instaladores |
| Discord.js | Slash commands; guardar datos en Supabase no en memoria |
| Puck | Bloques = componentes propios de marca; estado editado en BD (RLS), no en archivos |
| Drizzle | Solo server-side; `onConflictDoUpdate` para upserts; RLS siempre |
| Supabase | RLS siempre; anon key solo en cliente |
| Turborepo | Definir `turbo.json` con tareas tipadas |

## 14. Frameworks descartados o prohibidos

| Framework | Motivo |
|---|---|
| **Electron** | Peso y RAM; sustituido por Tauri |
| **Vite standalone** | Las webs son Next.js; Vite solo en utilidades |
| **Express propio** | Backend lo cubre Supabase (BaaS) |
| **jQuery** | Obsoleto; usar React/vanilla moderno |
| **Sass/SCSS** | Tailwind v4 lo cubre; no añadir preprocesador |

## 15. Versiones actuales (referencia rápida)

| Framework | Versión |
|---|---|
| Next.js | 15.5.22 |
| React | 19.2.7 |
| Tailwind CSS | 4.2.4 |
| Tauri | 2.x (api 2.11.0) |
| Discord.js | 14.22.0 |
| Puck (`@puckeditor/core`) | 0.23.0 |
| Turborepo | 2.5.0 |
| Vitest | 4.1.10 |
| Playwright | 1.62.1 |
| supabase-js | v2.x |

_Última revisión: 19 ago 2026._ Relacionado: `FULL_STACK_SYSTEM.md`, `INSTALLERS_SYSTEM.md`,
`BACKEND_SYSTEM.md`, `IT_GLOSSARY_PROTOCOLS.md`, `COLOR_SYSTEM.md`, `VISUAL_BUILDERS_SYSTEM.md`,
`ORM_SYSTEM.md`.
