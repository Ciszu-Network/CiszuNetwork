# WORKFLOW_SYSTEM — Sistema de Flujo de Trabajo (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: WORKFLOW_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema de operación diaria del monorepo: comandos, pipelines, convenciones
> git, CI/CD, cierre de sesión y protocolos de equipo. Es el manual operativo del agente y
> del desarrollador.

## Flujo de trabajo diario

```bash
pnpm install              # Install all workspaces
pnpm dev                  # Run all apps in dev mode
pnpm build                # Build all apps
pnpm lint                 # Lint all apps
pnpm --filter <name> dev  # Run single app
pnpm test                 # Unit tests (Vitest)
pnpm test:watch           # Vitest watch
pnpm test:ui              # Vitest UI panel (http://localhost:51204/__vitest__/)
pnpm e2e                  # Playwright E2E (smoke + security)
pnpm notify "T" "M"       # Push ntfy (--voice, --priority urgent)
```

## Pipeline de documentación

```bash
node scripts/txt2md.js <docs-path>     # txt → md
node scripts/md2office.js <docs-path>  # md → docx
python scripts/txt2pdf.py <docs-path>  # txt → pdf
node scripts/sync-public-docs.js       # docs/ → public/docs/ de cada web
```

Formato canónico: `txt (source of truth) → md → docx → pdf (distribution)`.

## Gestión de assets / CDN

```bash
pnpm cdn:upload        # Sube a Supabase Storage (ciszu-cdn), espeja el repo
pnpm cdn:verify        # Revisa mimetypes del bucket (check-cdn-mimes.js)
node scripts/upload-cdn.js --prune     # Borra del bucket lo que no existe localmente
node scripts/delete-storage-bucket.js  # Borrado masivo PROTEGIDO (dry-run primero)
node scripts/fix-cdn-mimes.js          # Re-subir solo los objetos con mimetype malo
node scripts/generate-icon-registry.js # Regenera icon-registry.ts desde shared/icons/svg
pnpm sw                                # Sincroniza assets PWA (sync-pwa-assets.js)
```

## Base de datos

```bash
dbvr sql -ds=supabase "SELECT ..."      # Consultas SQL (datasource supabase)
node scripts/backup-db.js               # Backup con timestamp a archives/backups/db/
node scripts/apply-migration-XX.js      # Aplicar migración numerada
```

## Antes de commitear

1. `pnpm lint` — errores de lint.
2. `pnpm test` — tests unitarios (96+).
3. `pnpm build` — verifica builds.
4. `git diff` — revisar cambios.
5. Hooks pre-commit: secretlint + gitleaks (fallos → corregir o `--no-verify` si falso positivo).

## Git conventions

- Commits en español, descriptivos, una línea, sin emojis.
- No commitear sin solicitud explícita del usuario.
- DNS bloquea pushes a GitHub desde este PC → el usuario hace push manualmente.

## CI/CD (GitHub Actions)

Todos los workflows corren en `push: [main, master]` (+ PR y cron diario 06:00 UTC):

- **CI** (`ci.yml`) — lint, unit tests (Vitest), semgrep (SAST), `pnpm audit --prod` (SCA), gitleaks (secret scanning del diff), security-e2e (Playwright DAST contra las 4 webs en prod).
- **CodeQL** (`codeql.yml`) — SAST js + rust en cada push.
- **DAST semanal** (`dast.yml`) — lunes 06:30 UTC, OWASP ZAP baseline sobre las 4 webs.
- **Deploy ×4** — cada web despliega sola a Vercel desde la raíz del repo (`vercel --prod --yes --archive=tgz`), disparado por cambios en `projects/<name>/**` + `packages/**`.
- **Uptime watch** (`uptime-watch.yml`) — cada 5 min consulta UptimeRobot y notifica cambios por ntfy.

## Cierre de tarea

- Commit + push (manual del usuario por DNS), backup DB cuando toque, aviso por push de fin de tarea.
- Actualizar `STATUS_SYSTEM.md`, `PROJECTS_SYSTEM.md` (incluye estado + historial) al cerrar sesión.

## Protocolo de inicio de sesión

1. Leer `STATUS_SYSTEM.md`, `PROJECTS_SYSTEM.md` (estado + historial) y `AGENTS.md`.
2. Leer el doc `_SYSTEM` del área que se va a tocar.
3. Confirmar disponibilidad en 1 línea: "CISZU AI listo. [proveedor/modelo]."

## Protocolo de cierre de sesión

1. Actualizar `PROJECTS_SYSTEM.md` (historial cronológico + estado) con los cambios.
2. Actualizar `STATUS_SYSTEM.md` con nuevo resumen.
3. Actualizar `STATISTICS_SYSTEM.md` si cambiaron cifras verificables.
4. Dejar el siguiente paso claro en el historial.
5. No hacer commit sin solicitud explícita del usuario.

## Protocolo de tarea (ciclo completo)

1. **Definición**: leer la petición, aclarar si es ambiguo, crear checklist en to-do.
2. **Exploración**: investigar el sistema afectado (leer docs + código).
3. **Implementación**: DRY/KISS/YAGNI (ver `CODE_PRINCIPLES_PROTOCOLS.md`).
4. **Verificación**: `pnpm lint` → `pnpm test` → `pnpm build` → verificación externa (curl prod/dbvr).
5. **Documentación**: actualizar el doc `_SYSTEM` del sistema tocado + refs cruzadas.
6. **Cierre**: actualizar estado/historial y avisar al usuario.

## Protocolo de verificación (criterios de "listo")

- Builds 4/4 OK (`pnpm build`).
- Lint 0 errores (`pnpm lint`).
- Tests verdes (Vitest + E2E).
- Verificación externa: si es código, probar contra producción (curl) o dbvr (SQL).
- Docs actualizados sin refs rotas.

## Zonas de trabajo y comandos típicos

| Zona | Comando |
|---|---|
| Web principal | `pnpm --filter ciszunetwork-website dev` |
| Portfolio | `pnpm --filter ciszukoantony-website dev` |
| MuzicMania | `pnpm --filter muzicmania-website dev` · Tauri: `pnpm --filter muzicmania-website tauri dev` |
| CiszuBot web | `pnpm --filter ciszubot-website dev` |
| Bot Discord | `pnpm --filter ciszubot dev` |
| CDN upload | `pnpm cdn:upload` |
| DB consultas | `dbvr sql -ds=supabase "SELECT ..."` |
| API tests | `pnpm api:test` (Bruno) |

## Troubleshooting común

| Síntoma | Solución |
|---|---|
| Push GitHub falla | DNS bloquea github.com → push manual del usuario |
| Build falla con error de types | `pnpm install` (types en packages/ui, no en root) |
| Iconos se pierden en navegación | Ver bug conocido en `ICON_SYSTEM.md` |
| Tests IAST/guard fallan | Revisar `packages/ui/tests` + `SECURITY_PROTOCOLS.md` |
| DOCX→PDF se cuelga | Usar `scripts/txt2pdf.py` (Reportlab) en vez de Word COM |

## Ranuras de trabajo (contexto por tipo de tarea)

| Tipo de tarea | Docs a leer primero |
|---|---|
| Frontend (webs) | `FRONTEND_SYSTEM`, `STYLES_SYSTEM`, `FRAMEWORKS_SYSTEM`, `ICON_SYSTEM`, `COLOR_SYSTEM` |
| Backend/API | `BACKEND_SYSTEM`, `FULL_STACK_SYSTEM`, `ERRORS_SYSTEM` |
| Paquetes compartidos | `PACKAGES_SYSTEM`, `FRONTEND_SYSTEM`, `FULL_STACK_SYSTEM` |
| Base de datos | `DB_SYSTEM`, `SECURITY_PROTOCOLS` (RLS) |
| Seguridad | `SECURITY_PROTOCOLS`, `DEVSECOPS_SYSTEM`, `VAULT_SYSTEM` |
| Bot Discord | `DOCKER_SYSTEM`, `MONITORING_SYSTEM`, `TOOLS_SYSTEM` |
| Assets/CDN | `CDN_SYSTEM`, `MEDIA_FORMATS_SYSTEM`, `ICON_SYSTEM` |
| Legal/fiscal | `COMPANY_REGISTRATION_PLAN`, `TAX_PLAN`, `RIF_PERSON_PLAN` |

## Verificación de cabeceras de documentación

Todo doc de `documentation/` debe cumplir:
1. Cabecera con **Versión**, **Actualización** e **Identificador** (`*_V2.0.0_<fecha>_ciszunetwork`).
2. Mínimo **200 líneas** de contenido útil (definición + secciones + tablas).
3. Cierre con `_Última revisión: <fecha>_` y referencias a docs relacionados.
4. Las refs cruzadas apuntan a archivos existentes (sin rutas rotas).

Para verificar todo el folder:

```bash
powershell -Command "$doc='projects/ciszu/docs/documentation'; Get-ChildItem $doc/*.md | ForEach-Object { $c=(Get-Content $_.FullName).Count; $h=[bool](Select-String $_.FullName -Pattern '^Versión:'); \"$($_.Name): $c lineas header=$h\" }"
```

## Retiro de un doc

1. Avisar al usuario (no borrar sin permiso).
2. Buscar referencias cruzadas (`rg "NOMBRE"` en `documentation/` + `AGENTS.md` + scripts).
3. Actualizar refs → apuntar al doc sustituto o eliminar la mención.
4. Ejecutar `node scripts/sync-public-docs.js` si el doc se espejaba en alguna web.
5. Registrar el retiro en `PROJECT_HISTORY`.

## Flujo de trabajo para cambios en `packages/**`

Los paquetes compartidos afectan a las 4 webs (los deploys escuchan `packages/**`):

1. Leer el `_SYSTEM.md` del área (UI → `ICON_SYSTEM.md`, seguridad → `SECURITY_PROTOCOLS.md`).
2. Hacer el cambio en `packages/<nombre>`, con tests de Vitest si aplica (`packages/*/tests`).
3. Verificar desde la raíz: `pnpm build` (los consumers compilan contra el contrato TS).
4. Cuidado con breaking changes de tipos: exigen actualizar a la vez las apps que lo consumen.
5. Commit descriptivo + listo para deploy (los 4 proyectos se re-despliegan si toca).

## Convenciones de ramas y commits

- Trabajo directo en `main` (repo de un solo dev); sin ramas largas salvo feature externa con permiso.
- Commits: español, una línea, sin emojis; p. ej. `fix: rate limit en webhooks de pagos`.
- Hooks pre-commit: secretlint + gitleaks sobre `--staged` (no usar `--no-verify` salvo falso positivo justificado).
- Push desde este PC falla por DNS → el usuario hace push manual; avisar al solicitarlo.

## Temporización de los CI/cron

| Workflow | Cuándo corre | Nota |
|---|---|---|
| `ci.yml` | push/PR/diario 06:00 UTC | lint, tests, semgrep, audit, gitleaks, security-e2e |
| `codeql.yml` | cada push | análisis estático js + rust |
| `dast.yml` | semanal (lun 06:30 UTC) | ZAP baseline ×4 webs |
| Deploys ×4 | push a `main` con cambio en el path | `vercel --prod --archive=tgz` |
| `uptime-watch.yml` | cada 5 min | UptimeRobot → ntfy |

## Flujo de verificación rápida (antes de cerrar tarea)

```bash
pnpm lint && pnpm test && pnpm build   # local
dbvr sql -ds=supabase "SELECT 1"       # comprueba conexión BD
curl -sI https://ciszunetwork.vercel.app | Select-String -Pattern "200"  # prod
```

- Si algo de esto falla, NO cerrar la tarea como "lista".
- Verificación externa obligatoria para código (regla `SECURITY_PROTOCOLS.md` #9).

## FAQ de flujo de trabajo

| Pregunta | Respuesta |
|---|---|
| ¿Siempre `pnpm test` completo? | Sí si tocaste código; en docs basta con revisar refs |
| ¿Puedo usar `--no-verify`? | Solo con falso positivo justificado y aviso |
| ¿Quién hace push? | El usuario manualmente (DNS) |
| ¿Qué hago si un deploy falla? | Revisar logs de Vercel, build y el path tocado |

## Relación con otros sistemas

- `DEVSECOPS_SYSTEM.md` — los checks pre-commit y CI en profundidad.
- `PROJECTS_SYSTEM.md` / `STATUS_SYSTEM.md` — cierre de sesión y handover.
- `TOOLS_SYSTEM.md` — instalación y uso de las herramientas citadas.
- `ARCHITECTURE.md` — por qué existen estos comandos y rutas.

_Última revisión: 13 ago 2026._ Relacionado: `CODE_PRINCIPLES_PROTOCOLS.md`,
`DEVSECOPS_SYSTEM.md`, `TOOLS_SYSTEM.md`, `PROJECTS_SYSTEM.md`.

