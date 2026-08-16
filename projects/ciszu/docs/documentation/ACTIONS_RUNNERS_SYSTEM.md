# ACTIONS_RUNNERS_SYSTEM — Sistema de Runners y Automatización Local (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-15
Identificador: ACTIONS_RUNNERS_SYSTEM_V2.0.0_2026_08_15_ciszunetwork

> **Definición**: sistema que documenta cómo el monorepo ejecuta sus automatizaciones (CI,
> tests, deploys) **sin depender del billing de GitHub Actions**: un conjunto de scripts
> locales `pnpm` que simulan los jobs de CI, y el self-hosted runner como vía automática en
> `push`. Sistema híbrido implementado (Vía A activa + Vía B instalada). Incluye términos,
> instalación, reglas, comparativas y alternativas evaluadas.

---

## 1. Contexto y origen del problema

GitHub aplica **límites de minutos** a las organizaciones con repositorios privados en el
plan Free (2.000 min/mes en `ubuntu-latest`, 0 minutos en runners más grandes). Una vez
agotados (o por bloqueos de billing), los workflows fallan a los pocos segundos con errores
del tipo "no minutes left" y no se puede pagar el plan Team mientras el billing esté en
revisión.

Consecuencias concretas en este ecosistema:

| Síntoma | Causa |
|---|---|
| Los 4 deploys (Vercel) no corren en `push` | Los workflows `deploy-*.yml` usan minutos de la organización |
| `ci.yml`, `dast.yml`, `uptime-watch.yml` fallan al inicio | Mismo bloqueo de minutos |
| El pipeline de seguridad semanal no ejecuta | DAST ZAP y CodeQL dependen de GH Actions |

El monorepo **sí** tiene fallbacks operativos (UptimeRobot + watcher ntfy, deploys manuales
con Vercel CLI), pero la automatización de push quedó en pausa. Este documento define el
sistema para **independizarse del billing**: correr las mismas tareas localmente con `pnpm`
(control total, cero coste) y, opcionalmente, recuperar la automatización automática de
`push` con un **self-hosted runner** en esta máquina.

> Decisión de sesión (2026-08-15): hasta que el billing de la organización se regularice,
> **no se usan los runners hospedados de GitHub**. El sistema implementado es híbrido:
> - **Vía A (activa)**: scripts locales `pnpm` (`ci:local`, `ship:prod`, `deploy:*`) — cero
>   coste, funciona offline, validada en la sesión (lint ×8, typecheck ×5, tests 176, builds ×4).
> - **Vía B (instalada)**: self-hosted runner en este PC (`scripts/runner-install.ps1`) para
>   que los workflows corran en `push` de forma automática sin gastar minutos. Requiere la
>   máquina encendida con VPN y el servicio del runner activo.

---

## 2. Términos y definiciones

| Término | Definición en este ecosistema |
|---|---|
| **CI** | Validaciones que corren sobre el código: lint, type-check, tests unitarios, tests de stories, audit y escaneos |
| **Job** | Unidad de trabajo de un workflow (en local: un paso del script maestro) |
| **Workflow** | Fichero `.github/workflows/*.yml` que define automatizaciones de GH Actions |
| **Script maestro local** | Comandos `pnpm` de la raíz que replican los jobs de CI en esta máquina |
| **Self-hosted runner** | Agente de GH Actions instalado en un equipo propio que recibe jobs por polling saliente |
| **Deploy** | Publicación de una web en Vercel (producción) vía Vercel CLI |
| **Turbo / Turborepo** | Orquestador de tareas del monorepo (`turbo.json`) |
| **pnpm filter** | Selección de un workspace por nombre (ej. `--filter ciszunetwork-website`) |
| **Vault** | Conjunto de `.env` protegidos con age (`scripts/vault.ps1`); el token de Vercel vive en `.env.local` de la raíz |

---

## 3. Inventario real de la automatización

### 3.1 Workflows actuales (`.github/workflows/`)

| Workflow | Qué hace | Frecuencia | Dependencia |
|---|---|---|---|
| `ci.yml` | Lint (4 webs: ciszunetwork, ciszukoa, muzicmania, ciszubot), tests Vitest, tests Storybook (`@ciszu/ui`), Semgrep (SAST), `pnpm audit` (SCA), Gitleaks, Security E2E | push/PR/diario 06:00 UTC | GH Actions |
| `codeql.yml` | CodeQL por lenguaje (actions, JS/TS, python, rust) | push/PR/viernes 16:28 UTC | GHAS habilitado |
| `dast.yml` | ZAP baseline sobre las 4 webs de producción | Lunes 06:30 UTC | GH Actions |
| `deploy-ciszunetwork-website.yml` | Deploy Vercel `ciszunetworkpage` | push a main (sin path filter, redespliega en cada push) | GH Actions + token |
| `deploy-ciszukoantony-website.yml` | Deploy Vercel `ciszukoantonypage` | push a main (sin path filter) | GH Actions + token |
| `deploy-ciszubot-website.yml` | Deploy Vercel `ciszubot` | push a main (sin path filter) | GH Actions + token |
| `deploy-muzicmania-website.yml` | Deploy Vercel `muzicmania` | push a main (sin path filter) | GH Actions + token |
| `chromatic.yml` | Publica Storybook de `@ciszu/ui` en Chromatic (visual/a11y) | push en `packages/ui/**` | GH Actions + token |
| `release-please.yml` | Release Please (versionado Changesets) | push en `main` | GH Actions |
| `uptime-watch.yml` | Consulta UptimeRobot API y publica en ntfy solo cambios de estado | cada 5 min | GH Actions + secrets |

### 3.2 Proyectos Vercel reales (verificados vía API)

| pnpm filter | Proyecto Vercel | rootDirectory |
|---|---|---|
| `ciszunetwork-website` | `ciszunetworkpage` | `projects/ciszu/website` |
| `ciszukantony-website` | `ciszukoantonypage` | `projects/ciszukoantony/website` |
| `ciszubot-website` | `ciszubot` | `projects/ciszubot/website` |
| `muzicmania-website` | `muzicmania` | `projects/muzicmania/website` |

> `packages/**` está escuchado por los 4 workflows de deploy: un cambio en `@ciszu/ui` o
> `@ciszunetwork/*` re-despliega las 4 webs. Las 4 webs tienen script `lint` (`eslint .`).

### 3.3 Scripts de la raíz (implementados en `package.json` el 15 ago 2026)

```jsonc
{
  "test": "vitest run",
  "e2e": "playwright test",
  "typecheck": "tsc --noEmit × 5 (@ciszu/ui + 4 webs)",
  "lint:all": "pnpm turbo run lint",
  "test:all": "pnpm test && pnpm --filter @ciszu/ui test:storybook",
  "ci:local": "pnpm lint:all && pnpm typecheck && pnpm test:all",
  "deploy:network": "node scripts/deploy-vercel.js ciszunetworkpage",
  "deploy:antony": "node scripts/deploy-vercel.js ciszukoantonypage",
  "deploy:bot": "node scripts/deploy-vercel.js ciszubot",
  "deploy:muzic": "node scripts/deploy-vercel.js muzicmania",
  "ship:prod": "pnpm ci:local && 4 deploys en secuencia",
  "cdn:upload": "node scripts/upload-cdn.js",
  "db:backup": "node scripts/backup-db.js",
  "notify": "node scripts/ntfy-notif.js",
  "api:test": "node scripts/run-bru.js run . -r --env prod --exclude-tags local"
}
```

> La Vía A ya está **implementada y verificada** (15 ago 2026): `pnpm lint:all` (8 tareas),
> `pnpm typecheck` (5 apps), `pnpm test` (176 tests), y los deploys manuales ×4 se hicieron
> con el mismo flujo que automatiza `scripts/deploy-vercel.js`.

---

## 4. Vía A — Script maestro local (implementada, operativa)

Principio: el mismo trabajo que hacían los jobs de GH Actions se ejecuta en esta máquina con
`pnpm` + Turbo, usando los scripts **reales** de cada workspace y el token de Vercel del
vault. Cero consumo de minutos, cero coste, funcionamiento offline.

### 4.1 Qué valida cada paso (equivalencia real con `ci.yml`)

| Paso local | Comando real | Job de GH Actions equivalente |
|---|---|---|
| Lint de las 3 webs con lint | `pnpm --filter ciszunetwork-website lint` + `pnpm --filter ciszukoantony-website lint` + `pnpm --filter muzicmania-website lint` | `lint` (matrix de 3 apps) |
| Type-check | `pnpm --filter ciszunetwork-website exec tsc --noEmit` (repetir por las 4 webs y `@ciszu/ui`) | — (no existía en CI) |
| Tests unitarios | `pnpm test` (Vitest root, 176 tests) | `unit-tests` |
| Tests de stories | `pnpm --filter @ciszu/ui test:storybook` | `storybook-tests` |
| Audit de producción | `pnpm audit --prod --audit-level high` | `audit` |
| Security E2E | `pnpm exec playwright test test/website/e2e/security.spec.ts` | `security-e2e` |
| Build agregado | `pnpm turbo run build` (4 webs + paquetes) | — (solo se hacía en deploy) |

### 4.2 Scripts implementados en `package.json` raíz

```jsonc
{
  "scripts": {
    "typecheck": "pnpm --filter @ciszu/ui exec tsc --noEmit && pnpm --filter ciszunetwork-website exec tsc --noEmit && pnpm --filter ciszukoantony-website exec tsc --noEmit && pnpm --filter ciszubot-website exec tsc --noEmit && pnpm --filter muzicmania-website exec tsc --noEmit",
    "lint:all": "pnpm turbo run lint",
    "test:all": "pnpm test && pnpm --filter @ciszu/ui test:storybook",
    "ci:local": "pnpm lint:all && pnpm typecheck && pnpm test:all",
    "deploy:network": "node scripts/deploy-vercel.js ciszunetworkpage",
    "deploy:antony": "node scripts/deploy-vercel.js ciszukoantonypage",
    "deploy:bot": "node scripts/deploy-vercel.js ciszubot",
    "deploy:muzic": "node scripts/deploy-vercel.js muzicmania",
    "ship:prod": "pnpm ci:local && pnpm deploy:network && pnpm deploy:antony && pnpm deploy:bot && pnpm deploy:muzic"
  }
}
```

### 4.3 Script de deploy (`scripts/deploy-vercel.js`)

Los workflows reales enlazan y despliegan **desde la raíz** del monorepo (no desde
`apps/...` ni desde `projects/<x>/website`), porque cada proyecto Vercel tiene configurado su
`rootDirectory`:

```js
const { execSync } = require('node:child_process');
const token = process.env.VERCEL_TOKEN;

if (!token) {
  console.error('[deploy] VERCEL_TOKEN no presente. Usar: $env:VERCEL_TOKEN = (cargo del vault)');
  process.exit(1);
}

const project = process.argv[2]; // ciszunetworkpage | ciszukoantonypage | ciszubot | muzicmania

const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
run(`vercel link --yes --project ${project} --token=${token}`);
run(`vercel --prod --yes --archive=tgz --token=${token}`);
```

> `VERCEL_TOKEN` NO se hardcodea: se toma del entorno. Se puede cargar desde `.env.local`
> (vault) sin exponerlo. `vercel link` además descarga el `.env` del proyecto y actualiza el
> `.env.local` de la raíz (comportamiento ya observado en la sesión del 15 ago 2026).

### 4.4 Uso diario

| Comando | Qué hace | Cuándo |
|---|---|---|
| `pnpm ci:local` | Lint + type-check + tests (unit + stories) | Antes de cada commit relevante |
| `pnpm deploy:network` | Deploy de la web principal | Cuando cambia `projects/ciszu/**` |
| `pnpm ship:prod` | CI local + deploys de las 4 webs en secuencia | Publicar todo el ecosistema |
| `pnpm audit --prod --audit-level high` | Chequeo de dependencias en producción | Semanal / antes de release |

**Reglas de la Vía A**:

1. `ship:prod` para las 4 webs es secuencial: los 4 proyectos comparten `.vercel/` en la raíz,
   y `vercel link` sobrescribe el enlace actual (no se pueden lanzar en paralelo).
2. Los deploys tardan ~9-11 min en Vercel (build remoto); el comando local espera al "Ready".
3. Las 4 webs tienen script `lint` (`eslint .`): el monoturbo `lint:all` cubre las 4.
4. El tipo-check con `tsc --noEmit` es local y no existe en CI: es un extra de calidad, no una
   restricción de GH.

---

## 5. Vía B — Self-hosted runner (instalada; vía automática)

Restaura la automatización **automática** al hacer `git push` (jobs que se ejecutan en esta
máquina en lugar de los runners hospedados), sin gastar minutos. Funciona por **polling
saliente**: el agente pregunta a GitHub "¿hay trabajo para mí?" — no requiere abrir puertos.
Los workflows con `runs-on: self-hosted` (4 deploys + jobs portables del CI) se encolan en
este runner; el resto (semgrep, gitleaks, security-e2e, DAST, CodeQL) queda documentado en
§5.4.

### 5.1 Requisitos previos en esta máquina

| Requisito | Estado actual |
|---|---|
| Node ≥ 20 + pnpm 10.8.1 | ✅ instalado |
| Git + SSH/https operativo | ✅ con VPN activa (requisito para que el runner se registre y hable con GitHub) |
| WSL2 + Docker Desktop (opcional, para jobs con contenedores) | ✅ operativo (15 ago 2026, engine 29.6.2) |
| Espacio en disco | ⚠️ limitado (C:); runner vive en `E:\actions-runner\` (fuera del repo; rutas sin espacios obligatorias) |

### 5.2 Instalación (Windows nativo, automatizada)

El script `scripts/runner-install.ps1` orquesta todo (descarga, checksum, configuración con el
token del vault y registro como servicio). El token de registro se lee de `RUNNER_REGISTRATION_TOKEN`
en `.env.local` (vault cifrado) y **nunca** se hardcodea ni se commitea.

| Acción | Comando |
|---|---|
| Instalar (descarga + config + servicio) | `.\scripts\runner-install.ps1 install` |
| Arrancar el servicio | `.\scripts\runner-install.ps1 start` |
| Detener | `.\scripts\runner-install.ps1 stop` |
| Modo manual (pruebas) | `.\scripts\runner-install.ps1 run` |
| Estado del servicio | `.\scripts\runner-install.ps1 status` |
| Desinstalar | `.\scripts\runner-install.ps1 uninstall` |

Detalles del script (versión 2.336.0, `E:\actions-runner\`):
1. Descarga `actions-runner-win-x64-2.336.0.zip` y valida SHA256 (`d59123a4…`).
2. Extrae con `System.IO.Compression` en `E:\actions-runner\` — **la ruta NO puede contener
   espacios**: `RunnerService.exe init` falla si el binPath del servicio los tiene (error
   -532462766 que se vio al instalar en `E:\Ciszu Network\.opencode\runner`).
3. Configura con `config.cmd --unattended --url https://github.com/Ciszu-Network/CiszuNetwork --token <vault>`.
4. `--runasservice` (sin sufijo `svc.cmd`, eliminado en runner 2.33x): `config.cmd` instala y
   arranca el servicio `actions.runner.Ciszu-Network-CiszuNetwork.CISZU-PC` con arranque
   **automático retardado** y reinicio en fallo. Nombre de runner: `CISZU-PC`.

> El token de registro es **de un solo uso y expira**; si caduca, generar uno nuevo en
> GitHub → Settings → Actions → Runners y actualizarlo en `.env.local` + volver a cifrar el
> vault (`scripts/vault.ps1 backup`).

### 5.3 Adaptación de los workflows (hecha el 15 ago 2026, ampliada el 16 ago 2026)

Todos los jobs usan el **switch de runner centralizado** `${{ vars.PREFERRED_RUNNER || 'self-hosted' }}`
(repo → Settings → Secrets and variables → Actions → Variables). El valor actual es `self-hosted`
(billing hosted bloqueado). Cuando se restauren los minutos, basta cambiar la variable a
`ubuntu-latest` y los jobs corren en la nube sin tocar los `.yml` (los pasos son multiplataforma:
semgrep usa `setup-python` en Linux, gitleaks descarga el binario de cada OS).

| Workflow | Jobs en `self-hosted` |
|---|---|
| `deploy-ciszunetwork-website.yml` | `deploy` |
| `deploy-ciszukoantony-website.yml` | `deploy` |
| `deploy-ciszubot-website.yml` | `deploy` |
| `deploy-muzicmania-website.yml` | `deploy` |
| `ci.yml` | `lint`, `unit-tests`, `storybook-tests`, `audit`, `semgrep`, `gitleaks`, `security-e2e` |
| `codeql.yml` | `check` (+ `analyze` cuando GHAS esté habilitado) |
| `chromatic.yml` | `chromatic` |
| `release-please.yml` | `release-please` |
| `uptime-watch.yml` | `watch` |
| `dast.yml` | ⚠️ schedule-only, aún en `ubuntu-latest` (necesita Docker Linux; ver §5.4) |

- Los steps que usan `actions/*`, `pnpm/*`, `cache` siguen funcionando: el runner los descarga
  y ejecuta igual.
- En `ci.yml`, el job `storybook-tests` usa `pnpm exec playwright install chromium` (sin
  `--with-deps`, que es apt/Linux y fallaría en Windows).
- `semgrep` reemplazó `returntocorp/semgrep-action` (contenedor) por el CLI nativo vía pip:
  `py -m pip install semgrep==1.172.0` + `py -m semgrep scan --config p/security-audit --oss-only`.
- `gitleaks` reemplazó el tar.xz Linux por el binario Windows (`gitleaks_8.30.1_windows_x64.zip`),
  ejecutándose con `shell: powershell` en vez de bash (el runner solo tiene Windows PowerShell 5.1,
  NO `pwsh` — los steps con `shell: pwsh` fallan con `ScriptHandler` error).
- `codeql.yml` ejecuta `shell: powershell` en el check (bash no está por defecto en el runner Windows).
- **Execution policy obligatoria**: el servicio corre como `NT AUTHORITY\NETWORK SERVICE`; sin
  `Set-ExecutionPolicy RemoteSigned -Scope LocalMachine` los pasos PowerShell fallan con
  `PSSecurityException` (fijado el 16 ago 2026, `Get-ExecutionPolicy -List` debe mostrar
  `LocalMachine: RemoteSigned`).

### 5.4 Jobs NO portables a Windows (alternativas)

| Job | Motivo | Alternativa |
|---|---|---|
| `dast.yml` (ZAP) | `zaproxy/action-baseline` necesita Docker Linux | Docker Desktop en WSL2, o ejecutar ZAP manualmente en `pnpm dast:zap` |

> El default-setup de CodeQL de GitHub ("Code Quality", `dynamic/github-code-scanning/codeql`)
> NO está en los archivos del repo y corre en runners hosted con GHAS. Como GHAS está
> deshabilitado en el repo y el billing hosted bloqueado, ese check siempre falla: hay que
> desactivarlo en GitHub → Settings → Code security → Code scanning (default setup).

---

## 6. Comparativa de alternativas (incluye planes evaluados y descartados)

### 6.1 Matriz comparativa

| Alternativa | Coste | Automático en push | Complejidad | Veredicto |
|---|---|---|---|---|
| **Vía A — Scripts locales pnpm** | 0 | No (manual) | Baja | ✅ **Implementada y activa** |
| **Vía B — Self-hosted runner** | 0 | Sí | Media (red + VPN + Windows) | ✅ **Instalada** (script `runner-install.ps1`) |
| GH Actions + plan Team pagado | ~20 USD/mes | Sí | Baja | ❌ Descartado: billing bloqueado, objetivo es no depender |
| Repos públicos (minutos gratis) | 0 | Sí | — | ❌ Repos privados por diseño (código privado) |
| GitLab CI/CD (`gitlab.com`) | 0 en runner propio | Sí | Alta (migrar pipelines) | ❌ Descartado: migración grande, sin necesidad real |
| Azure DevOps Pipelines | 0 (self-hosted) | Sí | Alta | ❌ Descartado: duplica infraestructura de GH |
| Jenkins / DroneCI self-hosted | 0 (infra local) | Sí | Muy alta | ❌ Descartado: requiere VPS propio (ver `VPS_PLAN.md`) |
| Buildkite / CircleCI | Gratis limitado | Sí | Media | ❌ Descartado: freemium con límites nuevos |
| Woodpecker CI (VPS) | 0 (VPS propio) | Sí | Alta | ⏳ Posible cuando exista el VPS (plan futuro) |
| Webhooks propios (ntfy/local) | 0 | Parcial | Media | ⚠️ Descartado para CI; útil solo para notificaciones |

### 6.2 Decisiones tomadas

1. **No** se paga GitHub Team: el objetivo del sistema es justamente independizarse.
2. **Sí** scripts locales como vía operativa (implementados el 15 ago 2026: lint ×8, typecheck
   ×5, tests 176, builds ×4 y deploys ×4 sin GH).
3. **Self-hosted runner** instalado (Vía B): se usa `scripts/runner-install.ps1`; requiere
   VPN/red estable para registrar y operar. Los jobs de seguridad se quedan en `ubuntu-latest`
   o se replican localmente (ver §5.4).
4. Los **crons** de seguridad (DAST, uptime-watch) tienen reemplazo local:
   - `uptime-watch.js` ya existe y funciona como script (Task Scheduler).
   - ZAP y Semgrep se pueden correr localmente con comandos documentados.
5. El sistema es **híbrido**: si la máquina está encendida con el runner activo, los `push`
   corren solos (Vía B); con solo la terminal, los scripts locales ejecutan lo mismo (Vía A).

---

## 7. Reglas del sistema

1. **Nunca** guardar `VERCEL_TOKEN` en código ni en docs; vive en el vault (`.env.local`),
   protegido por age (`scripts/vault.ps1`). En logs solo se referencia genéricamente.
2. `ship:prod` corre CI local **antes** de desplegar; si falla un paso, no se despliega.
3. Los deploys locales son **secuenciales** (comparten `.vercel/` en la raíz). No paralelizar.
4. Un cambio en `packages/**` implica re-desplegar las 4 webs (igual que los workflows).
5. Las 4 webs tienen lint (`eslint .`); `lint:all` y la matriz del CI las cubren a las 4.
6. Toda nueva automatización del ecosistema debe documentarse aquí o en `WORKFLOW_SYSTEM.md`,
   no quedarse solo en GH Actions.
7. Si el billing de GitHub se regulariza, los workflows de GH **siguen existiendo**; el sistema
   local es complementario (fallback y control), no excluyente.
8. Los secretos de GH Actions (secrets del repo) y los locales (vault) deben estar
   sincronizados: un mismo `VERCEL_TOKEN`, `NOTIFY_TOPIC`, `UPTIMEROBOT_API_KEY`.

---

## 8. Operación diaria del sistema

| Momento | Acción del CEO (o agente) | Comando |
|---|---|---|
| Antes de commit | Validar CI local | `pnpm ci:local` |
| Al cambiar una web | Desplegar solo esa | `pnpm deploy:network` / `deploy:antony` / `deploy:bot` / `deploy:muzic` |
| Publicar todo | CI + deploys ×4 | `pnpm ship:prod` |
| Semanal (lunes) | DAST manual si el runner no está activo | ZAP CLI sobre las 4 URLs (ver `dast.yml`) |
| Semanal | Auditoría de dependencias | `pnpm audit --prod --audit-level high` |
| Al encender la máquina | arrancar servicio (auto, retardado) | `.\scripts\runner-install.ps1 status` |
| Cierre de sesión | Notificar resultados | `pnpm notify "Deploys OK: 4/4"` |

---

## 9. Hoja de ruta (siguientes pasos)

- [x] Añadir los scripts `typecheck` / `lint:all` / `test:all` / `ci:local` y los `deploy:*`
      + `ship:prod` con `scripts/deploy-vercel.js` en la raíz (Vía A).
- [x] Validar `pnpm ci:local` completo (lint ×8, tsc ×5, vitest 176, stories) en verde.
- [x] Probar `pnpm deploy:<web>` individual (deploys ×4 manuales hechos el 15 ago 2026).
- [ ] Probar `ship:prod` completo de principio a fin (CI + 4 deploys en una sola pasada).
- [ ] Ejecutar `scripts/runner-install.ps1 install` y `start` con VPN activa; verificar que los
      workflows con `runs-on: self-hosted` se encolan y ejecutan en este PC.
- [ ] Documentar alternativas cron: Task Scheduler para `uptime-watch.js`.
- [ ] (Futuro) Decidir runner Windows nativo vs Linux/WSL2 para los jobs de seguridad
      (CodeQL, DAST, Semgrep) — ver §5.4.

_Última revisión: 15 ago 2026._ Relacionado: `WORKFLOW_SYSTEM.md`, `DOCKER_SYSTEM.md`,
`MONITORING_SYSTEM.md`, `SECURITY_PROTOCOLS.md`, `VAULT_SYSTEM.md`, `VPS_PLAN.md`,
`DEVSECOPS_SYSTEM.md`, `PROJECTS_SYSTEM.md`, `STATUS_SYSTEM.md`.
