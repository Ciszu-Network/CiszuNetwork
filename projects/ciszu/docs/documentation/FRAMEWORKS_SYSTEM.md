# FRAMEWORKS_SYSTEM — Sistema de Frameworks (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: FRAMEWORKS_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta los **frameworks** (concepto de informática:
> conjunto de código/abstracciones para desarrollar aplicaciones) usados en el monorepo:
> qué son, para qué se usan, versiones y cuándo usarlos. Complementa `FULL_STACK_SYSTEM.md`
> (que lista todo el stack) centrándose en los frameworks web/desktop/bot.

---

## 1. Frameworks por capa

| Capa | Framework | Versión | Dónde |
|---|---|---|---|
| **Web (frontend)** | Next.js (React) | 15.x | Las 4 webs |
| **Estilos** | Tailwind CSS | v4 | Todas las webs |
| **Desktop** | Tauri | 2.x | MuzicMania (desktop) |
| **Bot** | Discord.js | v14 | CiszuBot |
| **Backend** | Supabase (PostgreSQL + PostgREST) | — | Todos los proyectos |
| **Monorepo** | Turborepo | 2.x | Raíz |
| **Testing** | Vitest, Playwright | — | Paquetes y webs |

## 2. Definición y propósito (contexto informático)

Un **framework** es una estructura de software que dicta el esqueleto de la app y te da
utilidades: routing, componentes, estilos, build. A diferencia de una **librería** (la
llamas tú), el framework llama a tu código (inversión de control).

| Framework | Tipo | Qué aporta |
|---|---|---|
| Next.js | Full-stack React framework | Routing, SSR/SSG, API routes, optimización de assets |
| Tailwind | CSS framework (utility-first) | Clases atómicas (`bg-brand`, `text-neon-pink`) |
| Tauri | Desktop framework (Rust + WebView) | Shell de escritorio liviano |
| Discord.js | Librería/framework de bot | Interfaz sobre la API de Discord |
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
    │
    ├── @ciszu/ui (React 19, componentes compartidos)
    ├── @ciszunetwork/cdn (assets: imágenes, skins)
    ├── @ciszu/utils (rate limit, IAST, escapeHtml)
    └── Supabase-js ── Supabase (Postgres/Auth/Storage)

Tauri (desktop) ── Rust + WebView2 ── sirve la web de MuzicMania

Discord.js (bot) ── Node 24 ── Supabase (heartbeat, comandos)
```

## 13. Buenas prácticas por framework

| Framework | Práctica |
|---|---|
| Next.js | Server Components por defecto; metadata en layouts |
| Tailwind | Tokens en `@theme`; sin CSS inline |
| Tauri | `bundle.targets` mínimo necesario; versionar instaladores |
| Discord.js | Slash commands; guardar datos en Supabase no en memoria |
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
| Next.js | 15.x |
| React | 19.x |
| Tailwind CSS | 4.x |
| Tauri | 2.x |
| Discord.js | 14.x |
| Turborepo | 2.x |
| supabase-js | v2.x |

_Última revisión: 13 ago 2026._ Relacionado: `FULL_STACK_SYSTEM.md`, `INSTALLERS_SYSTEM.md`,
`BACKEND_SYSTEM.md`, `IT_GLOSSARY_PROTOCOLS.md`, `COLOR_SYSTEM.md`.
