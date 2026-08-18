# Ciszu Network — AGENTS.md

Este archivo es la **primera lectura de toda sesión** y se relee en cada compactación. Es un
**mapa + reglas**, no una enciclopedia: la documentación técnica completa vive en
`projects/ciszu/docs/documentation/` (fuente de verdad de cada sistema). Cuando una tarea toque
un sistema, **lee su doc** antes de codificar; no guardes el detalle aquí.

Regla de oro de este archivo: **contexto suficiente para saber qué leer, no para saberlo todo**.

---

## 1. Identidad

Ecosistema digital y masivo de **Ciszuko Antony** (Francisco García, alias **Ciszuko**) — CEO y
único creador legítimo del proyecto. NUNCA atribuir el desarrollo a IAs en público ni en código.

- Contacto: `ciszunetwork@outlook.com`. Base: Caracas, Venezuela.
- Idioma de trabajo y documentación: **español**. Nombres de archivos docs: inglés.
- Identidad visual: neon cyan/rosa sobre negro, fuente Geomanist.
- Repo GitHub: Organization `Ciszu-Network`, rama `main`. Deploys desde `main`.

## 2. Visión general

Monorepo pnpm con 4 webs Next.js, un bot de Discord, un juego de música y paquetes compartidos.

| Proyecto          | URL (Vercel)               | Carpeta                   | Descripción                                                           |
| ----------------- | -------------------------- | ------------------------- | --------------------------------------------------------------------- |
| **CiszuNetwork**  | `ciszunetwork.vercel.app`  | `projects/ciszu/`         | Web principal — marca, redes, ecosistema.**Centro de documentación**. |
| **CiszukoAntony** | `ciszukoantony.vercel.app` | `projects/ciszukoantony/` | Portfolio personal (logos, medios, música)                            |
| **MuzicMania**    | `muzicmania.vercel.app`    | `projects/muzicmania/`    | Juego de ritmo — scores en schema`muzicmania`, auth, app Tauri + NSIS |
| **CiszuBot**      | `ciszubot.vercel.app`      | `projects/ciszubot/`      | Landing del bot + estado en vivo (`ciszubot.bot_status`)              |

> **Nota de nombre**: la carpeta del portfolio se transcribe mal desde la terminal (nombre
> ambiguo). Resuélvela SIEMPRE en runtime: `Get-ChildItem projects -Directory | Where-Object { $_.Name -match 'antony' }`. No la escribas a mano.

## 3. La documentación es la fuente de verdad

La documentación oficial vive en `projects/ciszu/docs/documentation/` (62 docs, estándar
`<NOMBRE>_<SUFIJO>.md`). Cada proyecto puede tener su propia copia adaptada
(`projects/<name>/docs/documentation/`), pero **lo genérico se referencia a ciszu, no se
duplica**. Las reglas del propio sistema de docs viven en `DOCUMENTATION_SYSTEM.md`.

### 3.1 Convención de nombres

`<NOMBRE>_<SUFIJO>.md` — inglés, MAYÚSCULAS, `_` como separador (sin `-`, sin espacios).

| Sufijo       | Significado                        | Ejemplo                                             |
| ------------ | ---------------------------------- | --------------------------------------------------- |
| `_SYSTEM`    | Sistema que ya funciona (mantener) | `DB_SYSTEM.md`                                      |
| `_PLAN`      | Plan/roadmap/guía a implementar    | `BRAND_PLAN.md`                                     |
| `_PROTOCOLS` | Normas obligatorias                | `SECURITY_PROTOCOLS.md`                             |
| (especial)   | Docs de estado vivos               | `PROJECT_STATE.md`, `PROJECT_HISTORY.md`, `TODO.md` |

Reglas: ; Cabecera estándar (Versión / Actualización / Identificador / Definición); ≥200 líneas salvo
estado e índices; cierre `_Última revisión: ..._` con relacionados.

### 3.2 Dónde investigar por tarea

Antes de codificar, lee el doc del área que tocas. Mapa por tipo de tarea:

| Tipo de tarea        | Docs a leer primero                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Frontend (webs)      | `FRONTEND_SYSTEM` · `STYLES_SYSTEM` · `FRAMEWORKS_SYSTEM` · `ICON_SYSTEM` · `COLOR_SYSTEM` |
| Backend/API          | `BACKEND_SYSTEM` · `FULL_STACK_SYSTEM` · `ERRORS_SYSTEM`                                   |
| Paquetes compartidos | `PACKAGES_SYSTEM` · `FRONTEND_SYSTEM` · `FULL_STACK_SYSTEM`                                |
| Base de datos        | `DB_SYSTEM` · `SECURITY_PROTOCOLS` (RLS)                                                   |
| Seguridad            | `SECURITY_PROTOCOLS` · `DEVSECOPS_SYSTEM` · `VAULT_SYSTEM`                                 |
| Bot Discord          | `DOCKER_SYSTEM` · `MONITORING_SYSTEM` · `TOOLS_SYSTEM`                                     |
| Assets/CDN           | `CDN_SYSTEM` · `MEDIA_FORMATS_SYSTEM` · `ICON_SYSTEM`                                      |
| Legal/fiscal         | `COMPANY_REGISTRATION_PLAN` · `TAX_PLAN` · `RIF_PERSON_PLAN`                               |
| Imagen/multimedia    | `BRAND_PLAN` · `AI_ART_PLAN` · `ART_PROTOCOLS`                                             |
| Operación diaria     | `WORKFLOW_SYSTEM` · `TOOLS_SYSTEM`                                                         |
| Testing/Dev local    | `LOCAL_TESTING_PROTOCOLS` · `DEBUGGING_SYSTEM` · `DEV_CONSOLE_SYSTEM` · `TESTING_SYSTEM`   |
| Editor visual UI     | `VISUAL_BUILDERS_SYSTEM` · `UI_COMPONENTS_SYSTEM` · `STYLES_SYSTEM` · `COLOR_SYSTEM`        |

### 3.3 Índice de la documentación de ciszu

- **Sistemas**: `ARCHITECTURE.md` · `FULL_STACK_SYSTEM` (stack) · `DB_SYSTEM` · `ORM_SYSTEM` (Drizzle) ·
  `AUTH_SYSTEM` · `CACHING_SYSTEM` · `CDN_SYSTEM` · `ICON_SYSTEM` · `MEDIA_FORMATS_SYSTEM` · `DOCKER_SYSTEM` ·
  `TESTING_SYSTEM` · `TOOLS_SYSTEM` · `WORKFLOW_SYSTEM` · `VAULT_SYSTEM` (credenciales) ·
  `DOMAINS_SYSTEM` · `MONITORING_SYSTEM` (UptimeRobot + ntfy) · `ANALYTICS_SYSTEM` ·
  `ERRORS_SYSTEM` (Sentry) · `EMAILS_SYSTEM` · `PAYMENTS_SYSTEM` · `REVIEWS_SYSTEM` ·
  `GOOGLE_SYSTEM` (negocio y reseñas de Google) ·
  `CORS_SYSTEM` · `BUSINESS_SYSTEM` · `OPENCODE_SYSTEM` (voz + comandos) ·
  `REMOTE_CONTROL_SYSTEM` (SSH/Tailscale/ciszu-ai) · `KNOWLEDGE_SYSTEM` (educación) ·
  `INSTALLERS_SYSTEM` · `ONLINE_SERVICES_SYSTEM` · `STATISTICS_SYSTEM` ·
  `VISUAL_BUILDERS_SYSTEM` (editores visuales UI/UX: Puck-first) ·
  `PROJECTS_SYSTEM` · `STATUS_SYSTEM` · `ACTIONS_RUNNERS_SYSTEM` (CI/deploys locales sin GH Actions) ·
  `DEV_CONSOLE_SYSTEM` (TUI/CLI dev local) · `DEBUGGING_SYSTEM` (depuración local)
- **Arquitectura por capas**: `FRONTEND_SYSTEM` · `BACKEND_SYSTEM` · `PACKAGES_SYSTEM` ·
  `UI_COMPONENTS_SYSTEM` (Storybook/Chromatic/Figma/Tailwind/React) · `FRAMEWORKS_SYSTEM` · `STYLES_SYSTEM` · `COLOR_SYSTEM`
- **Planes**: `COMPANY_REGISTRATION_PLAN` (+ `RIF_PERSON_PLAN` · `TRADEMARK_PLAN` ·
  `COMMERCIAL_REGISTRATION_PLAN` · `TAX_PLAN` · `INTERNATIONAL_LLC_PLAN`) ·
  `ORGANIZATIONAL_SCALABILITY_PLAN` · `RAG_VECTORS_PLAN` · `AI_ART_PLAN` · `BRAND_PLAN` · `VPS_PLAN` ·
  `TOOLS_EVALUATION_PLAN` (investigación de servicios/herramientas candidatas)
- **Protocolos de contexto**: `GEOGRAPHIC_CONTEXT_PROTOCOLS` · `HISTORICAL_CONTEXT_PROTOCOLS` ·
  `TARGET_AUDIENCE_PROTOCOLS` · `HEALTH_AND_SAFETY_PROTOCOLS` · `SCHEDULE_PROTOCOLS` ·
  `SECURITY_PROTOCOLS` · `CONTACTS_PROTOCOLS` · `IT_GLOSSARY_PROTOCOLS` · `MATERIAL_ICONS_PROTOCOLS`
- **Protocolos (testing/operación)**: `LOCAL_TESTING_PROTOCOLS` (pruebas locales obligatorias) ·
  `LSP_PROTOCOLS` (servidores LSP del agente) · `MCP_PROTOCOLS` (servidores MCP del ecosistema)
- **Estado (vivo)**: `PROJECT_STATE.md` · `PROJECT_HISTORY.md` · `TODO.md`
- **Estándares**: `CODE_PRINCIPLES_PROTOCOLS` (DRY/KISS/YAGNI/SOLID) · `DEVSECOPS_SYSTEM`
  (SAST/DAST, shift-left) · `DOCUMENTATION_SYSTEM` (reglas de docs)

Cada proyecto replica solo lo propio (estado, stack/architecture/workflow adaptados). La
matriz completa de qué se replica a qué proyecto está en `DOCUMENTATION_SYSTEM.md` §12.5.

---

## 4. Estructura del monorepo

```
E:\Ciszu Network\
├── projects/            # Aplicaciones: ciszu, ciszukoantony, muzicmania, ciszubot, ciszugamens
├── packages/            # Paquetes compartidos: cdn, config, db, email, payments, ui, utils
├── services/            # Infraestructura: supabase (migraciones), vercel
├── shared/              # Assets compartidos: fonts, icons, etc.
├── scripts/             # Scripts de automatización (txt2md, upload-cdn, vault, ...)
├── tools/               # Herramientas locales IA/ops (ascii-ai, ciszou-ai, convert, ...)
├── apis/                # Colecciones Bruno (health/, rest/)
├── archives/            # Backups y archivos grandes (gitignored parcialmente)
├── test/                # Tests E2E Playwright
├── .github/workflows/   # CI/CD: ci.yml, codeql, dast, deploys ×4, uptime-watch
└── AGENTS.md            # Este archivo
```

La consola de dev local vive en `test/website/debug/` (TUI `dev_console.ps1` + guías
`dev_console.{md,txt}`); los logs de dev en `test/website/debug/local-logs/`. Detalle:
`DEV_CONSOLE_SYSTEM.md`.

### 4.1 Workspaces pnpm y entry points

| pnpm filter            | Location                          | What                                        |
| ---------------------- | --------------------------------- | ------------------------------------------- |
| `ciszunetwork-website` | `projects/ciszu/website/`         | Next.js — web principal                     |
| `ciszukoantony-website` | `projects/ciszukoantony/website/` | Next.js — portfolio                         |
| `muzicmania-website`   | `projects/muzicmania/website/`    | Next.js + Tauri — juego                     |
| `ciszubot-website`     | `projects/ciszubot/website/`      | Next.js — landing del bot                   |
| `ciszubot`             | `projects/ciszubot/discord-bot/`  | Discord.js bot (TS, pnpm workspace, Docker) |
| `@ciszunetwork/cdn`    | `packages/cdn/`                   | Asset resolver                              |

Package manager: **pnpm v10.8.1**, Node >=20. Todas las webs: Next.js 15 (App Router) +
Tailwind 4 + PostCSS + ESLint. Assets vía resolver/CDN (`public/` solo docs/pwa/sw.js).

### 4.2 Paquetes compartidos (`packages/`)

| Paquete                  | Qué hace                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| `@ciszu/ui`              | Componentes UI compartidos (iconos, tokens, **Modal Radix accesible**) + Storybook/Chromatic (dev-only) |
| `@ciszunetwork/cdn`      | Resolver de assets vía CDN                                             |
| `@ciszunetwork/utils`    | Utilidades:`createRateLimiter`, `buildCsp`, `createIast`, `escapeHtml`. Subpaths server-only: `logger` (pino), `schema` (TypeBox), `effect` (retries) — NUNCA en client/edge |
| `@ciszunetwork/email`    | Envío de emails                                                        |
| `@ciszunetwork/payments` | Pasarela de pagos                                                      |
| `@ciszunetwork/config`   | Configuración compartida                                               |
| `@ciszunetwork/db`       | Capa de datos server-only: schemas Drizzle (ciszubot/muzicmania/ciszunetwork/ciszu) + cliente pg |

Detalle, contratos y reglas de publicación: `PACKAGES_SYSTEM.md`. Un cambio en `packages/**`
re-despliega las 4 webs (los workflows escuchan ese path).

### 4.3 Servicios e infraestructura

- **Supabase** (`services/supabase/`) — proyecto `obwzzmbvkrcscqwptlqo`: auth, Postgres,
  Storage CDN `ciszu-cdn`. Las migraciones SQL viven ahí (`migrations/`) y se aplican con
  `scripts/apply-migration-XX.js`. Consultas: `dbvr sql -ds=supabase "..."`. **RLS obligatorio
  en toda tabla nueva.**
- **Vercel** — 4 proyectos, deploys vía GitHub Actions desde la raíz
  (`vercel --prod --yes --archive=tgz`; nunca `vercel pull/prebuilt` dentro de `projects/*/website`).
- **GitHub Actions** (`.github/workflows/`) — CI (lint/test/semgrep/audit/gitleaks),
  CodeQL, DAST semanal ZAP, deploys ×4, uptime-watch cada 5 min.
- **ntfy** — notificaciones push (`pnpm notify "Mensaje"`).
- **UptimeRobot** — monitorización de las webs.
- **Sentry** — errores. **PostHog** — analytics. **Bruno** — colecciones de API.

---

## 5. Quick start

```bash
pnpm install              # instala todos los workspaces
pnpm dev                  # turbo: todas las apps en dev
pnpm build                # turbo: build de todas las apps
pnpm lint                 # turbo: lint de todas las apps
pnpm test                 # unit tests (Vitest)
pnpm e2e                  # Playwright E2E
pnpm --filter <name> dev  # una app individual
pnpm notify "Mensaje"     # push ntfy
pnpm cdn:upload           # sube assets a Supabase Storage (ciszu-cdn)
pnpm api:test             # tests de API con Bruno (prod)
```

**Dev local de las webs** (consola `test/website/debug/dev_console.ps1`, puertos fijos):
`devcon` (TUI) · `pnpm dev:all` / `dev:stop` · `pnpm dev:status` · `devlog <web>`.
Por web: `pnpm web:dev` (3000) · `antony:dev` (3001) · `ciszubot:web:dev` (3002) ·
`muzicmania:dev` (3003). Detalle en `LOCAL_TESTING_PROTOCOLS` y `DEV_CONSOLE_SYSTEM`.

Comandos de Storybook/fert (wrapper `scripts/storybook.ps1` y funciones del perfil PowerShell:
`sb`/`sbtest`/`sbwatch`/`sbbuild`/`sbchrom`/`checkall`):

| Comando          | Acción                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| `pnpm --filter @ciszu/ui storybook` | Arranca Storybook dev            |
| `pnpm --filter @ciszu/ui test:storybook` | Ejecuta los tests de interacción de stories (Vitest browser + Playwright) |
| `sb` / `sbtest` etc. | Atajos PowerShell (ver `scripts/storybook.ps1` y perfil)            |
| `checkall`       | lint + type-check + tests + build de todas las apps                    |

Pipeline de documentación: `node scripts/txt2md.js` (txt→md) · `node scripts/md2office.js`
(md→docx) · `python scripts/txt2pdf.py` (txt→pdf) · `node scripts/sync-public-docs.js`
(docs/ → public/docs/ de cada web). Formato canónico `txt → md → docx → pdf`.

---

## 6. Reglas del agente

### 6.1 Comunicación

- Tono profesional y directo, sin introducciones ni cortesías.
- **No preguntes por defecto**: ejecuta scripts y comandos automáticamente si son seguros.
  Solo informa si hay bloqueo o ambigüedad real.
- Responde conciso. Identidad del creador: Ciszuko Antony (nunca IAs).

### 6.2 Git

- Commits en español, descriptivos, una línea, **sin emojis**. Trabajo directo en `main`.
- **No commitear ni pushear sin solicitud explícita.** Trabajo directo en `main`; el push
  puede hacerse desde este PC.
- `.gitignore` excluye binarios grandes (`.mp4`, `.gif`, `.exe`, `.mp3`), `content/` de
  proyectos y secrets. Al añadir un patrón nuevo: `git rm -r --cached <ruta>`.
- Pre-commit hooks: secretlint + gitleaks sobre `--staged`. `--no-verify` solo con falso
  positivo justificado.

### 6.3 Sesiones (handover)

- **Iniciar**: leer `PROJECT_STATE.md`, `PROJECT_HISTORY.md` y `TODO.md`
  (`projects/ciszu/docs/documentation/`) + este AGENTS.md. Después el `_SYSTEM` del área a tocar.
  Confirmar disponibilidad en 1 línea: "CISZU AI listo. [proveedor/modelo]."
- **Cerrar**: actualizar `PROJECTS_SYSTEM.md` (historial + estado) y `STATUS_SYSTEM.md` con los
  cambios; dejar el siguiente paso claro. No commitear sin permiso.
- **Pensar por tarea, no "saberlo todo"**: cada sesión lee lo necesario para la tarea actual.
  No cargues el contexto con docs de áreas que no se tocan.
- **TODO.md es sagrado**: solo puede editarse/actualizarse con permiso explícito de Ciszuko
  Antony. El agente NUNCA lo edita, borra ni marca casillas. Una tarea NO marcada en el
  TODO.md = NO terminada, por definición, sin importar el estado del código. No asumir que
  una tarea está hecha solo porque el código parezca implementarla; verificar contra el
  TODO.md y ejecutarla si sigue sin marcar.

### 6.4 Disco y temporales

- Disco C limitado. Temporales SIEMPRE en `E:\Ciszu Network\.opencode\temp/` (gitignored);
  borrarlos al terminar o limpiar los >1 semana. Nunca usar `C:\Users\fplay\AppData\Local\Temp`.
  Verificar espacio (`Get-PSDrive C,E`) antes de descargas grandes.
- El data dir global de opencode (`C:\Users\fplay\.local\share\opencode`, db de sesiones + snapshots)
  se migró a `E:\Ciszu Network\.opencode\data/` con un junction en la ruta original (historia intacta,
  sin env vars). Script de migración: `.opencode/temp/migrate-opencode-data.ps1` (correr con opencode
  cerrado). Nunca mover/borrar ese junction ni el data dir directamente.
- **Clones de repositorios externos**: todo repo de terceros que se clone y deba persistir vive en
  `E:\Ciszu Network\clones/<nombre>/`, **gitignored** (`clones/`). Uno por carpeta, nunca en
  `tools/`. Protocolo y estado: `TOOLS_SYSTEM.md` §6.6. Primer clon: `clones/spiderfoot` (SpiderFoot
  4.0.0, 18 ago 2026).

### 6.5 Puente de secretos de documentación (SECRET_TEMP.env)

- **`projects/ciszu/docs/documentation/SECRET_TEMP.env`** (gitignored) es el **puente**
  transitorio entre los secretos que Ciszuko pasa y su uso real. **Nunca se cifra** (se abre
  a cada rato) y **nunca se sube a ningún sitio**; solo existe local.
- Ciszuko **nunca pasa secretos en texto plano** por el chat: los escribe como variables en
  `SECRET_TEMP.env` y los referenciados en docs/TODO por nombre (`ver SECRET_TEMP.env → <VAR>`).
- **Protocolo de resolución**: cuando un MD/TODO refiera un token/API key/ID **no incluido**,
  o el usuario diga "te paso un token"/"está en SECRET_TEMP", el agente debe **abrir
  `SECRET_TEMP.env` y leer el valor de la variable** antes de ejecutar cualquier tarea que lo
  necesite (curl, wrappers, vault, etc.). Si la variable no existe, pedirla al usuario.
- **Tarea del agente con cada secreto**: **llevarlo al vault cifrado**
  (`services/supabase/.env` + `vault.ps1 crypt`) y a **Bitwarden**, y **después** usarlo en
  la tarea. El `SECRET_TEMP` es solo el contenedor de entrada; el oficial y durable es el
  vault cifrado (que además es la fuente para Bitwarden). Cuando Ciszuko vea la tarea
  terminada, **él** elimina la variable de `SECRET_TEMP.env`; el valor se mantiene cifrado
  en vault/Bitwarden.
- **Regla de oro**: `SECRET_TEMP.env` y `services/supabase/.env` **nunca** se suben ni se
  importan; cualquier valor que llegue de ahí se usa al vuelo y solo se persiste en el vault
  cifrado (+ Bitwarden).
- Los secretos de `SECRET_TEMP.env` **nunca** se imprimen en resúmenes ni logs; se usan desde
  la variable al vuelo. Ver `VAULT_SYSTEM.md` §3.7 y `CIBERSECURITY_SYSTEM.md` §5.
- **Regla para docs**: al terminar una tarea que usó secretos, verificar que ningún `.md`
  haya quedado con valores en claro (solo referencias). `gitleaks`/`secretlint` bloquean en
  pre-commit.

### 6.6 El vault de secrets (`services/supabase/.env`) — solo lo escribe Ciszuko

- **`services/supabase/.env`** es el vault local de credenciales (descifrado para el flujo
  diario; la copia cifrada es `.env.age`). **Solo Ciszuko Antony lo edita/escribe** a partir
  de ahora: contiene los secrets que él pasa directamente. El agente **NUNCA borra, modifica
  ni reordena ninguna entrada existente** de ese archivo, y solo lo **lee** para usar
  variables al vuelo o cifrarlo/verificarlo (`vault.ps1 crypt|verify|backup`).
- Excepción: cuando el agente añada secretos nuevos que el usuario le entregue a través del
  SECRET_TEMP para guardar (p. ej. los de una tarea aprobada), puede **añadir entradas nuevas
  al final** del `.env` (mismo nombre de variable) y ejecutar `vault crypt` + Bitwarden;
  nunca tocar lo existente. Si duda si una modificación es segura, preguntar antes.
- El `SECRET_TEMP.env` es el canal de ENTRADA; el **vault cifrado es el oficial**: debe
  replicar el contenido del SECRET_TEMP (lo que esté destinado a persistir) porque es la copia
  cifrada de la que se alimenta Bitwarden.

### 6.7 LSP (Language Server Protocol) del agente — estado actual

**El agente usa LSP** (activado 19 ago 2026). Cómo está configurado:

- `opencode.json` (raíz del monorepo) define `"lsp": true`, que habilita los LSP servers
  built-in de opencode (typescript, eslint, yaml, bash, etc.).
- La activación exige que las deps estén resueltas **desde la raíz del workspace**:
  opencode arranca el server `typescript` solo si `typescript` es resoluble en el proyecto, y
  `eslint` solo con `eslint` resoluble. Por eso `package.json` (raíz) tiene `typescript
  ^6.0.3` y `eslint ^9.0.0` en `devDependencies` (los workspaces de las webs traen TS, pero
  pnpm no hoista sus deps al root).
- La config se carga **al arranque**: cualquier cambio en `opencode.json` o nuevo server
  requiere reiniciar opencode. Si la UI muestra el LSP "disabled", verificar primero que
  `node -e "require.resolve('typescript')"` resuelve desde la raíz y que opencode se reinició
  **después** de la instalación de deps.
- `permission.lsp: allow` en `opencode.json` habilita al agente las **tools LSP
  experimentales** (queries de definitions, hover, references). Para activarlas por completo
  hace falta además la env var `OPENCODE_EXPERIMENTAL_LSP_TOOL=true` **antes** de arrancar la
  sesión (p. ej. en el perfil PowerShell o con `$env:` en la terminal de lanzamiento);
  `OPENCODE_DISABLE_LSP_DOWNLOAD=true` evita descargas de servers en redes restringidas.
- Los diagnósticos LSP (tipos/errores vía typescript y eslint) alimentan al agente de forma
  proactiva, pero **no sustituyen** la verificación de compilación por comando:
  ejecutar `tsc --noEmit` / `pnpm --filter <web> exec tsc --noEmit`, `eslint`, `next build`
  y `pnpm test` documentadas aquí y en `LOCAL_TESTING_PROTOCOLS.md` §3.3. No asumir que el
  código "tipo bien" solo por no ver errores LSP: verificar con build real.

---

## 7. Seguridad — obligatorio en toda implementación

Checklist completo: `SECURITY_PROTOCOLS.md`. Reglas no negociables:

1. **RLS en toda tabla nueva** en la misma migración (`ENABLE ROW LEVEL SECURITY` + policy
   explícita; Supabase da `GRANT ALL` a anon/authenticated por defecto). Verificar con dbvr.
2. **Rate limit en todo endpoint POST** que muta o consume un servicio externo
   (`createRateLimiter` de `@ciszunetwork/utils`).
3. **Secretos nunca en fallbacks de código** ni hardcodeados. Secrets solo `process.env.X`
   (sin prefijo) en server-only. `NEXT_PUBLIC_` solo para lo público por diseño.
4. **XSS**: nunca `dangerouslySetInnerHTML`/`innerHTML` con datos de usuario; usar
   `escapeHtml()`/`textContent`; DOMPurify si es imprescindible.
5. **SQL injection**: nunca concatenar strings; ORM parametrizado o RPC con objetos.
6. **SECURITY DEFINER** solo cuando sea estrictamente necesario (triggers); preferir INVOKER
   con `search_path` explícito.
7. **RLS policies**: separar por comando (nunca `FOR ALL`), envolver `auth.*()` en
   `(SELECT auth.X())`.
8. **Webs nuevas**: `robots.ts` (allow `/`, disallow `/api/`), middleware con cabeceras de
   seguridad + CSP (`buildCsp()`) + sensor IAST (`createIast()`).
9. **Verificar con fuentes externas** (dbvr, curl a producción, output de build) — no confiar
   en el propio estado.
10. Tras cambios en policies/funciones, verificar Security + Performance Advisors en Dashboard.

### 7.1 Dependencias y secretos

- NUNCA instalar una librería sin confirmar: proponer y esperar aprobación humana.
- pnpm con `ignore-scripts=true`. Auditorías: `pnpm audit --prod`, `cargo audit`, `trivy`.
- NUNCA imprimir `.env`/tokens en logs o resúmenes; referirse genéricamente. Si un secreto se
  filtra: rotarlo y registrarlo en `scripts/tokens_a_rotar.md`.

---

## 8. Cómo escribir este AGENTS.md (reglas horizontales)

Este archivo es **retroalimentación automática**: cuando el ecosistema cambie, actualízalo.
Normas para mantenerlo correcto:

1. **Es un mapa, no una enciclopedia.** Todo concepto técnico = línea de "qué es + dónde se
   documenta", y el detalle vive en el doc de ciszu. Nunca dupliques contenido de un doc aquí.
2. **YAGNI sobre tokens**: al inicio de sesión se relee por completo; lo que no sirva a esa
   lectura, bórralo de AGENTS y capéralo en su doc `_SYSTEM`. Mantenlo ≤1000 líneas.
3. **No to-do's aquí**: tareas → `TODO.md` (solo edita Ciszuko Antony). Estado → `PROJECT_STATE.md`.
4. **Verifica las rutas**: cada `projects/<nombre>/`, URL y filtro pnpm debe ser real
   (comprueba con `Get-ChildItem`/`git ls-files`). No inventes carpetas ni nombres.
5. **Sesión vs tarea**: actualiza este archivo solo cuando cambie. Estructura (catálogo de
   rutas/servicios/mapas) o reglas; no por cada entregable.
6. **Convenciones que deben vivir aquí**: nombres de carpeta ambiguos (como la del portfolio),
   URLs de despliegue, filtros pnpm, y las 10 reglas de seguridad no negociables.
7. Respetar el formato de tabla/código; contenido en español; sin emojis.
8. Al cambiar un doc en `documentation/`: actualizar sus refs cruzadas y, si toca, el índice
   del §3.3 y el `README.md` de la carpeta.

---

## 9. Límite de contexto de sesión (opencode)

Cerca de **120k tokens** el modelo se vuelve muy lento. Reglas:

1. Al llegar al umbral (~110-120k): avisar por push (`pnpm notify`) y proponer cambiar de sesión.
2. Antes de cambiar: commitear el trabajo, actualizar AGENTS.md, guardar estado del to-do,
   dejar resumen del próximo paso.
3. La nueva sesión empieza con "continúa" + resumen guardado.
4. No escribir código nuevo tras el umbral salvo trivial — priorizar guardar estado.

Una sesión normal rinde ~60-90k tokens; con muchos outputs de tools llega antes.

---

_Última revisión: 19 ago 2026._ Fuente de verdad: `projects/ciszu/docs/documentation/`.
Estándar de docs: `DOCUMENTATION_SYSTEM.md`. Operación diaria: `WORKFLOW_SYSTEM.md`.
