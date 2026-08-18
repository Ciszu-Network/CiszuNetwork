# TOOLS_SYSTEM — Herramientas de Desarrollo — Análisis Final e Integración (2 ago 2026)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: TOOLS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema de herramientas de desarrollo del ecosistema: análisis comparativo,
> pila instalada (DBeaver, dbvr, Bruno, Fork), integración en el repo y decisiones de premium.

Decisión tomada tras análisis comparativo de las **6 herramientas de `downloads/`** + 1 alternativa (Beekeeper Studio). Criterios dobles: **GUI** (control visual del usuario) + **acceso IA** (CLI/token/API/archivos para el agente).

> Fuente de la decisión: análisis 2026 (CostBench, Toolradar, docs oficiales, precios verificados jul-ago 2026).

---

## 1. Decisión final — pila instalada

| # | Herramienta | Categoría | Para el usuario (GUI) | Para la IA (CLI/API/archivos) |
|---|---|---|---|---|
| 1 | **DBeaver CE 26.1.3** | BD | GUI completa (ERD, SQL editor, exports) | Sin CLI propio → lo cubre dbvr |
| 2 | **dbvr Community** | BD (CLI) | — | SQL headless, exports, **MCP server**, metadata |
| 3 | **Bruno 4.0.0** | API client | GUI API (REST/GraphQL/gRPC, asserts, envs) | `bru run` + colecciones `.bru` en texto plano (git-native) |
| 4 | **Fork 2.16.1** | Git GUI | GUI nativa ligera (diffs, historial, conflicos) | — (el agente usa git CLI) |

**Regla de oro**: nada se pisa — DBeaver es la GUI de BD y dbvr su CLI (comparten workspace/configs); Bruno guarda colecciones en el repo (yo las creo/ejecuto, tú las ves); Fork es solo tu ventana visual (yo opero git por terminal).

---

## 2. Cuadro comparativo analítico — por sección

### 2.1 API Client

| | **Bruno 4.0.0** ✅ | Postman (x64) ❌ | Veredicto |
|---|---|---|---|
| Licencia | MIT (open source) | Propietaria (cloud) | Bruno |
| Cuenta/cloud | No, 100% offline | Login obligatorio, workspace en su nube | Bruno |
| Colecciones | `.bru` texto plano, versionables en git | JSON en su nube (export/import manual) | Bruno |
| CLI | `@usebruno/cli` (`bru run`, reports JSON/JUnit/HTML, env vars) | Newman/Postman CLI, pero **API access limitado en free** (CostBench 2026) | Bruno |
| Free tier | Ilimitado (solo Golden $19 one-time opcional) | 1 usuario, 25 collection runs/mes (mar 2026) | Bruno |
| Largo plazo | Git-native = PRs revisan cambios de API, sin lock-in | Free degradado 2 veces (2023, 2026); pago para destrabar límites propios | Bruno |
| **Conclusión** | **GANA en ambos mundos (free y premium)** — el premium de Postman solo quita límites de su propia nube; Bruno supera a Postman incluso gratis. Descartada Postman definitivamente | | |

### 2.2 Git GUI

| | **Fork 2.16.1** ✅ | GitKraken (Setup) ❌ | Veredicto |
|---|---|---|---|
| Licencia | $49.99 one-time (perpetua, updates incluidas) | Free solo repos públicos; privados → $4.95/mes | Fork |
| Peso | Nativa (Swift/.NET), abre <1s | Electron, ~1GB RAM, startup lento | Fork |
| Repo privado (caso Ciszu) | Sin problema | Free tier inútil (solo público) | Fork |
| Features AI/equipo | Ninguna | AI commits/PRs, boards, Jira, multi-repo (premium) | GitKraken (no necesario) |
| Riesgo | Equipo de 2 personas (Dan/Tanya), activo 10+ años, releases mensuales (v2.69 jul 2026) | Empresa estable, pero modelo suscripción | Empate en riesgo |
| Linux | ❌ No existe | ✅ Sí | GitKraken (no relevante hoy) |
| **Conclusión** | **GANA para este proyecto**: su AI premium (GitKraken) es **redundante** — el agente IA ya genera los commits. Electron pesado + suscripción por features que no se usan. Fork es one-time, nativo, y su "premium" es justo el precio de compra | | |

### 2.3 Gestor BD (GUI)

| | **DBeaver CE** ✅ | TablePlus (Setup) ❌ | Beekeeper Studio (tercero) ⚠️ | Veredicto |
|---|---|---|---|---|
| Licencia | Apache 2.0 (gratis) | Free: 2 conexiones/2 tabs; $99 one-time | GPLv3 Community gratis; Personal $18/mo → lifetime tras 12m | DBeaver |
| GUI | Completa pero Java (~1-2GB RAM) | Nativa, bonita, rápida | Electron moderna, ligera | TablePlus/Beekeeper |
| CLI | **dbvr (Apache-2.0, standalone)** ✅ | ❌ Ninguna | ❌ Ninguna | DBeaver |
| Empresa detrás | DBeaver Corp (estable, producto comercial PRO) | Equipo pequeño | Beekeeper Studio Inc. | DBeaver |
| Windows | ✅ | ✅ (lag de features vs macOS) | ✅ | DBeaver |
| **Conclusión** | **GANA**: único con CLI (dbvr) + MCP server. TablePlus se descarta: sin acceso programático y $99 que no compran nada que DBeaver no dé gratis. Beekeeper Community es alternativa GUI válida si DBeaver pesa, pero su premium (JSON viewer, import/export) no aporta a la IA | | |

### 2.4 Resumen por tanda (carpeta `downloads/`)

| Tanda | Herramientas | Resultado |
|---|---|---|
| **A — Freemium/open source/ligeras** | Bruno, Fork, DBeaver CE | ✅ **Las 3 instaladas** |
| **B — Pesadas/populares** | Postman, GitKraken, TablePlus | ❌ **Las 3 descartadas** |
| **Tercero evaluado** | Beekeeper Studio (no descargado) | ⚠️ Alternativa GUI BD si DBeaver pesa en RAM |

---

## 3. Visión plazos — corto vs largo

### Corto plazo (hoy, free/open source)

| Herramienta | Rol inmediato |
|---|---|
| DBeaver CE + dbvr | Inspeccionar las 13 tablas `ciszubot`, schemas `muzicmania`/`ciszunetwork`, dumps/backups headless |
| Bruno | Health checks de las 4 webs + endpoints del bot + PostgREST desde el repo |
| Fork | Revisión visual de commits/diffs antes de pushear |

### Largo plazo (con capital → premium solo si aporta)

| Premium | ¿Cuándo justifica el pago? | Costo |
|---|---|---|
| **dbvr PRO** | Solo si los dumps/exports deben ir a S3/GCP/Azure (hoy: disco local) | anual/máquina |
| **DBeaver PRO** | Solo si el stack añade NoSQL/cloud DBs (Mongo, Redshift, BigQuery) | ~$20-30/mes |
| **Bruno Cloud** | Solo con 2+ devs colaborando (git ya lo resuelve vía PRs) | bajo |
| **Beekeeper Personal** | Solo si DBeaver pesa demasiado y se migra la GUI a Beekeeper | $18/mes → lifetime |

**Regla analítica aplicada**: ninguna premium se compra hoy. Los upsells de estas herramientas venden AI assistants (redundantes — el agente ya es la IA) o nube (lock-in). Con capital o sin él, la pila óptima es la misma.

---

## 4. Descartadas — razones analíticas (incluso con capital)

| Herramienta | Razón de descarte |
|---|---|
| **Postman** | Free degradado (1 user, 25 runs/mes, mar 2026); API access limitado en free (CostBench); login+cloud obligatorios; el premium solo quita límites propios. Bruno lo supera gratis |
| **GitKraken** | Free inútil con repo privado; $4.95/mes recurrente; Electron pesado; su AI premium duplica al agente IA que ya tienes |
| **TablePlus** | Sin CLI/API en Windows (cero acceso para la IA); Windows va rezagado vs macOS (feature lag confirmado); $99 que no compran nada que DBeaver CE dé gratis |
| **Beekeeper Studio** (tercero) | No descargado/no instalado: se pisa con DBeaver (ambas GUI BD) y su Personal no aporta a la IA. Solo recomendado como reemplazo GUI si DBeaver pesa en RAM |

---

## 5. Instalación paso a paso

### 5.1 DBeaver CE (de `downloads/`)
1. Ejecutar `dbeaver-ce-26.1.3-windows-x86_64.exe` (next → next → install).
2. Requiere Java (el instalador lo gestiona o usa JAVA_HOME existente; el PC ya tiene JDK 25).

### 5.2 dbvr Community (⚠️ **descarga SEPARADA** — NO viene en el instalador de DBeaver)
1. Descargar de **https://dbeaver.io/dbvr/** (Community) o GitHub: `github.com/dbeaver/dbvr/releases`.
2. Windows installer `.exe` (incluye OpenJDK 21 bundle desde v23 — no necesitas instalar Java aparte).
3. Verificar: `dbvr --version` (release cada 2 semanas; requiere Java 21+ si no usas el bundle).

### 5.3 Bruno (de `downloads/`)
1. Ejecutar `bruno_4.0.0_x64_win.exe` (instalador estándar).
2. CLI para el agente: `pnpm add -g @usebruno/cli` (o `npm i -g @usebruno/cli`).

### 5.4 Fork (de `downloads/`)
1. Ejecutar `Fork-2.16.1.exe`.
2. Evaluación gratuita ilimitada; $49.99 one-time si se conserva.

---

## 6. Integración real en el repo

### 6.1 Bruno — `apis/bruno/` (ya configurado en el repo)

```
apis/bruno/
├── opencollection.yml          # raíz de la colección (version 4)
├── README.md
├── health/
│   ├── bot-status.bru          # POST /api/votes/dbl (health bot)
│   ├── ciszubot-website.bru        # GET https://ciszubot.vercel.app
│   ├── muzicmania.bru          # GET https://muzicmania.vercel.app
│   ├── ciszunetwork.bru        # GET https://ciszunetwork.vercel.app
│   └── ciszukoantony.bru       # GET https://ciszukoantony.vercel.app
└── environments/
    ├── prod.example.yml        # plantilla (gitignore no aplica — contiene placeholders)
    └── prod.yml                # ⚠️ gitignored — contiene secrets reales
```

- **Ejecutar**: `pnpm api:test` (raíz) → `bru run apis/bruno --env prod`
- **Secrets**: `--env-var SUPABASE_ANON_KEY=...` o en `environments/prod.yml` (gitignored). NUNCA en `.bru` ni en el repo.
- **Reports**: `bru run --env prod --reporter-json .opencode/temp/bru-report.json`

### 6.2 dbvr — acceso headless a Supabase (Postgres)

```bash
# 1. Ver drivers registrados
dbvr driver list

# 2. Crear datasource (una sola vez; password vía -p, guardar con --save-password=true)
dbvr datasource create \
  --driver=postgres-jdbc \
  --name=supabase \
  --host=db.obwzzmbvkrcscqwptlqo.supabase.co \
  --port=5432 \
  --database=postgres \
  --user=postgres \
  --save-password=true

# 3. SQL directo
dbvr sql -ds=supabase "select current_date;"

# 4. Export a JSON/CSV
dbvr sql -ds=supabase -format=json -out=.opencode/temp/bot_status.json \
  "select * from ciszubot.bot_status;"

# 5. Metadata (tablas/schemas/DDL)
dbvr meta schema list -ds=supabase
dbvr meta table list -ds=supabase --schema=ciszubot
dbvr meta table ddl -ds=supabase --schema=ciszubot --name=guild_configs

# 6. ⚠️ CREDENCIALES: dbvr guarda password en su workspace (fuera del repo).
#    Los secrets reales viven SOLO en services/supabase/.env (gitignored).
```

### 6.3 dbvr MCP server (acceso de la IA a la BD vía MCP)

```bash
# Configurar y arrancar el MCP server (expone el datasource a agentes IA)
dbvr mcp configuration -ds=supabase
dbvr mcp start -ds=supabase
```

Permite que el agente consulte la BD directamente como herramienta MCP (en vez de solo SQL por terminal).

### 6.4 Fork — integración

- Abrir el repo `E:\Ciszu Network` en Fork para revisar diffs/commits visualmente.
- El agente sigue usando git CLI; Fork es solo tu ventana visual. Cero conflicto (mismo working tree).

### 6.5 Scripts raíz añadidos (`package.json`)

| Script | Comando | Descripción |
|---|---|---|
| `api:test` | `node scripts/run-bru.js run . -r --env prod --exclude-tags local` | Health checks + REST del ecosistema (7 requests, 10 tests) |
| `api:test:report` | ídem + `--reporter-json ../.opencode/temp/bru-report.json` | Ídem con report JSON |
| `api:test:local` | `node scripts/run-bru.js run . -r --env prod` | Incluye tests con tag `local` (ej. `:5000` del bot) |

> **Colección Bruno en formato OpenCollection YAML** (`opencollection.yml` + `*.yml`, **NO `.bru`**): el CLI 4.x no mezcla formatos — los requests `.bru` bajo `opencollection.yml` dan "0 requests". Estructura: `health/` (5 webs + bot status) y `rest/` (leaderboard muzicmania, bot_status completo, stats local `:5000` con tag `local`). Env: `environments/prod.yml` con lista `variables: [{name, value}]` (gitignored; ejemplo en `prod.example.yml`).
> **CLI**: `pnpm add -g @usebruno/cli` (instalado 4.0.0). Requiere `PNPM_HOME` en PATH (`pnpm setup`; `C:\Users\fplay\AppData\Local\pnpm\bin`). El wrapper `scripts/run-bru.js` ejecuta `bru` con cwd `apis/bruno/` y crea el dir de `--reporter-json`.

### 6.6 Clones de repositorios externos (`clones/`) — protocolo

**Regla (18 ago 2026)**: todo repositorio de terceros que se clone y deba **persistir en disco**
(herramientas, fuentes, dependencias de trabajo) vive en **`E:\Ciszu Network\clones\<nombre>/`**,
**gitignored** (`clones/` en `.gitignore`). No quedarse en `C:\Users\...` (disco C limitado,
AGENTS §6.4) ni en `downloads/`.

- Separación: un clon por carpeta (`clones/spiderfoot`, `clones/myskull`, …). NO bajo
  `tools/` — `tools/` es solo código propio del repo.
- Instalación de dependencias: dentro del clon, vía su propio gestor (pip/npm/pnpm/…).
- **NUNCA** commitear el clon; reportes/artefactos generados van a `test/` o `tools/cibersecurity/osint/output/`
  según su naturreza (ver `OSINT_PROTOCOLS.md`, `CIBERSECURITY_SYSTEM.md`).
- El wrapper/conector debe buscar el clon en `clones/` (p. ej. `tools/cibersecurity/osint/spiderfoot.ps1`
  resuelve `clones\spiderfoot\sf.py`).
- Registro del clon: ver §8 Estado.

---

## 7. Documentación oficial de referencia

| Herramienta | Docs |
|---|---|
| dbvr | https://dbeaver.com/docs/dbvr/ (cheat sheet: `Installation/`, `Cheat-Sheet/`, `datasource-create/`, `sql/`, `mcp/`) |
| DBeaver CE | https://dbeaver.io / wiki GitHub |
| Bruno | https://docs.usebruno.com (CLI: `@usebruno/cli`, formatos `.bru`, envs, reports) |
| Fork | https://git-fork.com |

---

## 8. Estado (2 ago 2026 — sesión de configuración completada)

- ✅ Análisis completo de 7 herramientas (6 descargadas + Beekeeper) con criterio dual GUI+IA
- ✅ Pila decidida e **instalada**: DBeaver CE 26.1.3/26.1.4 + dbvr 26.1.4 + Bruno 4.0.0 + Fork 2.16.1
- ✅ **dbvr conectado a Supabase**: datasource `supabase` (pooler `aws-1-us-east-1.pooler.supabase.com:6543`, user `postgres.obwzzmbvkrcscqwptlqo`, db `postgres`, `--save-password=true`). Verificado: `dbvr sql -ds=supabase "select version();"` → PostgreSQL 17.6. ⚠️ Solo el **pooler transaction 6543** responde desde este PC (session 5432 y directa timeout).
- ✅ **Password BD reseteado vía Management API** (`PATCH /v1/projects/{ref}/database/password` — la API nunca lo devuelve en claro): nuevo valor en `services/supabase/.env` como `SUPABASE_DB_PASSWORD` (gitignored). Tokens anon/service_role NO se ven afectados.
- ✅ **`scripts/backup-db.js` reparado**: usaba el endpoint muerto `/database/connection` (404). Ahora usa `/config/database/pooler` + `SUPABASE_DB_PASSWORD` de `.env`, con fix CRLF en el parser. El script busca `pg_dump` en `C:\Program Files\PostgreSQL\17\bin\pg_dump.exe` (y 16/15/14/`pg_dump`) — el backup real quedó pendiente de tener pg_dump ≥17 (el pg_dump 13.x del sistema daba "server version mismatch" con el server 17.6).
- ✅ **Colección Bruno ampliada y funcional** (formato OpenCollection YAML): `health/` + `rest/`, 7 requests / 10 tests, `pnpm api:test` → **7/7 PASS** (4 webs + bot_status ×2 + leaderboard muzicmania). `environments/prod.yml` creado con secrets reales (gitignored).
- ✅ **Bruno CLI 4.0.0 instalado** globalmente (`pnpm setup` corrió el PATH); wrapper `scripts/run-bru.js` para ejecutar desde la raíz del repo.
- ✅ **DBeaver GUI**: la conexión `supabase` ya aparece en DBeaver (dbvr y DBeaver comparten el workspace `DBeaverData\workspace6`); driver PostgreSQL 42.7.13 descargado. DBeaver estaba abierto durante la sesión — refrescar si no se ve la conexión.
- ✅ **PostgreSQL 18.4 instalado (10 ago 2026, instalación manual desde postgresql.org)**: `C:\Program Files\PostgreSQL\18\bin\pg_dump.exe` 18.4 (queda también el 17.10 que vino con winget — `backup-db.js` prioriza el 18). **Primer backup real ejecutado y OK** (ciszu-db-20260809.sql, 3.43 MB → `archives/backups/db/`). ⏳ Opcional (ya no bloquea): configurar MCP server de dbvr (§6.3) para acceso IA directo a la BD
- ✅ **Protocolo `clones/` creado (18 ago 2026, §6.6)**: carpeta gitignored para repositorios de terceros persistidos en disco. Primer clon: **SpiderFoot 4.0.0** en `clones\spiderfoot` (instalado, aprobación AGENTS §7.1). Dependencias con pip (nota: `lxml<5` sin rueda para Python 3.14 — se instaló lxml 6.1.1 que es compatible; quitar `--only-binary` para ipaddr/otras pure-python). Verificado: `python sf.py -V` → 4.0.0.

## Resumen de la pila instalada

| Herramienta | Versión | Rol |
|---|---|---|
| DBeaver CE | 26.1.3/26.1.4 | GUI de BD (ERD, SQL) |
| dbvr | 26.1.4 | CLI de BD (headless, MCP) |
| Bruno | 4.0.0 | API client (git-native `.bru`/YAML) |
| Fork | 2.16.1 | Git GUI (visual) |
| PostgreSQL | 18.4 | Tooling local (pg_dump) |
| **Bun** | 1.3.14 | **Runner local opcional de scripts** (`C:\Users\fplay\.bun\bin\bun.exe`) — piloto 14 ago 2026: CJS y TS nativo OK; NO sustituye a Node en producción. Ver `FULL_STACK_SYSTEM.md` §Runtime |

## Reglas de la pila

1. **Nada se pisa**: DBeaver = GUI de BD, dbvr = su CLI (comparten workspace).
2. **Bruno en el repo**: colecciones versionables, `pnpm api:test`.
3. **Fork = ventana visual**; el agente opera git por terminal.
4. **Premium solo si aporta**: ninguna premium comprada hoy.
5. **Secrets nunca en el repo**: prod.yml gitignored, `.env` solo en vault.

## Comandos de verificación rápida

```bash
dbvr --version
dbvr sql -ds=supabase "select current_date;"
pnpm api:test
node scripts/backup-db.js
```

## Troubleshooting

| Problema | Solución |
|---|---|
| dbvr no conecta (timeout) | Usar pooler transaction 6543, no 5432 directa |
| pg_dump version mismatch | Usar PostgreSQL ≥17 (instalado el 18) |
| Bruno "0 requests" | Formato OpenCollection YAML, no mezclar `.bru` |
| Bruno CLI no encontrado | `pnpm setup` + `PNPM_HOME` en PATH |
| DBeaver no ve la conexión | Refrescar; comparte workspace con dbvr |

_Última revisión: 18 ago 2026._ Relacionado: `DB_SYSTEM.md`, `WORKFLOW_SYSTEM.md`,
`FULL_STACK_SYSTEM.md`, `KNOWLEDGE_SYSTEM.md`, `STATUS_SYSTEM.md`, `CIBERSECURITY_SYSTEM.md`.
