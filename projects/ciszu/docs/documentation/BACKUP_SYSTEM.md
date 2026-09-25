# Sistema de Backup Cloud — Ciszu Network

> Fecha: 2026-09-05 · Tarea #3 del TODO.md
> Estado: ✅ Elegido e implementado (script + documentación). Pendiente: crear cuenta Mega y ejecutar `rclone config` una sola vez.

## Problema

GitHub solo guarda el código que pasa por el `.gitignore`. El repositorio de
Ciszu Network excluye deliberadamente de GitHub (por ser público):

- Toda la documentación interna (`projects/*/docs/documentation/`)
- Scripts de automatización (`/scripts/`)
- Herramientas (`tools/`), tests (`test/`), servicios (`services/`)
- Contenido pesado (`archives/`, `downloads/`, `reports/`)
- Assets CDN duplicados en `public/` (anti-mirrors)
- Credenciales (`.env*`), logs, caches y builds

El único respaldo externo era GitHub + el disco duro local. Si el disco falla,
toda la documentación, logos, certificados y contenido se pierde.

## Requisitos (del TODO #3)

- Storage cloud **privado** (no código, no CDN).
- Acceso por **CLI y/o API** para automatizar el backup.
- **Mucho espacio** y **gratis**.
- Debe incluir **documentos, contenido, logos**, etc. (todo lo que GitHub no tiene).
- Debe **excluir** `node_modules`, `.env*` y carpetas pesadas innecesarias.

## Tamaño estimado del contenido

- `shared/` (docs, certificados, fuentes, logos): **~150 MB**
- Contenido total del monorepo sin `node_modules`/`.git`/builds: **≈ 300–700 MB**
- Cualquier tier gratuito de ≥ 10 GB sobra con margen de sobra.

## Comparativa de servicios evaluados

| Servicio | Espacio gratis | CLI/API | Privacidad | Verdict |
|---|---|---|---|---|
| **Mega** | **20 GB** | rclone oficial + MEGAcmd + API REST | Cifrado E2E zero-knowledge (ni Mega ve los archivos) | ✅ **ELEGIDO** |
| Cloudflare R2 | 10 GB | S3-compatible → rclone nativo | Server-side, sin cifrado E2E | Candidato 2 (0 egress, pero ½ espacio y sin E2E) |
| Google Drive | 15 GB | rclone oficial + API Google | Google escanea contenido, cuota compartida con Gmail/Fotos | Descartado (privacidad + cuota compartida) |
| pCloud | 10 GB | rclone oficial + API | Cifrado solo en plan de pago (Crypto) | Descartado (½ espacio que Mega, sin E2E gratis) |
| OneDrive | 5 GB | rclone oficial + API Microsoft | Microsoft escanea contenido | Descartado (poco espacio) |
| Dropbox | 2 GB | rclone oficial + API | Escaneo de contenido | Descartado (muy poco espacio) |
| Terabox | ~1 TB | **Sin** CLI/API oficial (solo WebDAV no oficial) | Dudas de privacidad, empresa china | Descartado (no cumple CLI/API) |
| Backblaze B2 | 10 GB | S3-compatible → rclone | Server-side | Descartado (egress de pago en restauración) |
| AWS S3 | 5 GB (12 meses) | S3 nativo | Server-side | Descartado (trial temporal + egress) |

## ✅ Servicio elegido: Mega (mega.io)

### Por qué Mega

1. **20 GB gratis de por vida** — el doble que R2, el triple que pCloud y 4× más que Google Drive libre.
2. **Cifrado de extremo a extremo (zero-knowledge)** — los archivos se cifran en tu máquina antes de subir; ni Mega ni nadie puede leerlos sin tu clave. Es un *servicio de seguridad*, no solo de almacenamiento.
3. **CLI/API completos** — backend oficial de rclone, CLI propio (MEGAcmd) y API REST pública. Automatización total.
4. **Sin tarjeta de crédito** — basta una cuenta email/contraseña.
5. **Sede en la UE** — protegido por GDPR.

### Limitaciones conocidas del plan gratis

- Cuota de transferencia (subida/bajada) limitada por ventana de tiempo (~5–10 GB cada 6 h). Suficiente para nuestro volumen (~700 MB).
- Sin carpeta de sincronización local oficial en el plan gratis (irrelevante: usamos rclone).
- Versiones anteriores de archivos se conservan ~90 días en la papelera (suficiente como red de seguridad extra).

## Instalación y configuración (una sola vez)

### 1. Instalar rclone

```bash
# Windows (Git Bash / winget)
winget install Rclone.Rclone
# o manual: descargar https://rclone.org/downloads/ y añadir al PATH

# Linux/macOS
curl https://rclone.org/install.sh | sudo bash
```

Verificar: `rclone version`

### 2. Crear cuenta Mega

1. Ir a https://mega.io (o https://mega.nz) → *Create account* con tu email.
2. Confirmar el email. (Los 20 GB ya vienen en el plan gratis; se pueden ampliar gratis con tareas/achivements si algún día hiciera falta.)

### 3. Configurar el remote en rclone

```bash
rclone config
```

- `n` (new remote) → nombre: **ciszu-backup**
- Tipo de storage: buscar `mega` → `Mega`
- `user`: tu email de Mega
- `pass`: tu contraseña de Mega (rclone la guarda ofuscada en `rclone.conf`)
- Resto de opciones: Enter (defaults)
- `y` para confirmar y `q` para salir

Verificar conexión:

```bash
rclone lsd ciszu-backup:
```

> Alternativa no interactiva (sustituye los valores):
> ```bash
> rclone config create ciszu-backup mega user TU_EMAIL pass "$(rclone obscure TU_PASSWORD)"
> ```
> ⚠️ Nunca guardes la contraseña en un archivo del repo.

## Uso del script

```bash
# Vista previa (no sube nada)
bash scripts/backup-cloud.sh --dry-run

# Backup real (sync espejo: borra en la nube lo que ya no existe en local,
# y mueve lo reemplazado/borrado a una papelera con fecha en la nube)
bash scripts/backup-cloud.sh

# Backup + verificación de integridad (rclone check)
bash scripts/backup-cloud.sh --check
```

### Qué incluye

Todo el monorepo **excepto** lo excluido (ver lista en el script):

- ✅ Documentación (`projects/*/docs/` — incluida `documentation/` que NO está en GitHub)
- ✅ Contenido (`shared/`, `content/`, logos, flyers, banners, certificados, fuentes)
- ✅ Código fuente de todas las webs, packages, workers y servicios
- ✅ Scripts, tools (código), tests (código), configs

### Qué excluye (regla de oro: regenerable o secreto)

- `node_modules`, `pnpm-store`, caches y builds (`.next`, `dist`, `out`, `build`, `.turbo`)
- `.env*`, `.env.keys` y cualquier credencial (regla de seguridad: **nunca** en la nube)
- `.git` (GitHub ya guarda la historia del código)
- Logs (`*.log`, `cdn*.log`, `dev*.log`, `gude-*.log`, playright/consolas)
- Pesado regenerable o personal: `archives/`, `downloads/`, `reports/`, `clones/`,
  `tools/*/runtime`, `tools/directus/data`, `test/art|music|video|osint|database|website/outputs`
- Directorios de agentes locales: `.opencode/`, `.playwright-mcp/`, `.kiro/`, `.agents/`

## Automatización (backup periódico)

### Windows — Programador de tareas

1. `Win+R` → `taskschd.msc` → *Crear tarea básica*.
2. Nombre: `Ciszu Cloud Backup` → disparador: *Diariamente* a la hora que quieras.
3. Acción: *Iniciar programa* → programa: `C:\Program Files\Git\bin\bash.exe`
   Argumentos: `-lc "cd /c/Users/<TU_USUARIO>/CiszuNetwork && bash scripts/backup-cloud.sh"` (ajusta la ruta).
4. Marcar *Ejecutar tanto si el usuario inició sesión o no* (opcional).

### Linux/macOS — cron

```cron
0 4 * * * cd /ruta/a/CiszuNetwork && bash scripts/backup-cloud.sh >> /tmp/ciszu-backup.log 2>&1
```

## Restauración (recuperación de desastres)

```bash
# Descargar TODO el backup a un directorio local (sin tocar nada del actual)
rclone copy ciszu-backup:CiszuNetwork/ /ruta/restore/ --progress

# Restaurar un archivo concreto
rclone copyto ciszu-backup:CiszuNetwork/projects/ciszu/docs/documentation/TODO.md ./TODO.md

# Recuperar un archivo borrado/sobrescrito (papelera con fecha del sync)
rclone lsf ciszu-backup:CiszuNetwork-trash/2026-09-05/ --recursive
rclone copyto ciszu-backup:CiszuNetwork-trash/2026-09-05/<ruta> /ruta/restore/<ruta>
```

> El remote del script usa un solo remote (`ciszu-backup`) con dos carpetas:
> `CiszuNetwork/` (espejo actual) y `CiszuNetwork-trash/<fecha>/` (papelera de `--backup-dir`).

## Seguridad

- Las credenciales de Mega viven solo en `rclone.conf` (ofuscadas) — nunca en el repo.
- El contenido viaja cifrado E2E: Mega no puede leerlo.
- El script **nunca** sube `.env*` ni archivos con secretos (doble filtro: exclude + `.gitignore` como referencia).
- El remote se puede añadir con `--drive-acknowledge-abuse`-style confirmaciones solo si rclone las pide (no aplica a Mega).

## ⏳ Pasos pendientes (solo usuario — credenciales propias)

> rclone ya está instalado (v1.75.1). Falta la cuenta Mega y la primera configuración.

### 1. Crear la cuenta Mega (2 min)

1. Ir a https://mega.io (o https://mega.nz) → *Create account*.
2. Usar un email real y confirmarlo desde el correo.
3. No hace falta tarjeta de crédito. Los 20 GB vienen incluidos en el plan gratis.

### 2. Configurar el remote en rclone (2 min)

Abrir una terminal (Git Bash en Windows) y ejecutar:

```bash
rclone config
```

- `n` (new remote)
- Nombre: `ciszu-backup`
- Tipo de storage: buscar `mega` → `Mega`
- `user`: el email de la cuenta Mega
- `pass`: la contraseña de Mega (rclone la guarda ofuscada en `rclone.conf`)
- Resto de preguntas: Enter (defaults)
- `y` para guardar, `q` para salir

Verificar la conexión:

```bash
rclone lsd ciszu-backup:
```

### 3. Primer backup (2-5 min según conexión)

```bash
# Vista previa (no sube nada)
bash scripts/backup-cloud.sh --dry-run

# Backup real (espejo + papelera con fecha)
bash scripts/backup-cloud.sh
```

### 4. Backup diario automático (opcional, 5 min)

Windows: `Win+R` → `taskschd.msc` → *Crear tarea básica* → nombre `Ciszu Cloud Backup`
→ disparador *Diariamente* → acción *Iniciar programa*:

- Programa: `C:\Program Files\Git\bin\bash.exe`
- Argumentos: `-lc "cd /c/Users/<TU_USUARIO>/CiszuNetwork && bash scripts/backup-cloud.sh"`

Linux/macOS: cron `0 4 * * * cd /ruta/a/CiszuNetwork && bash scripts/backup-cloud.sh >> /tmp/ciszu-backup.log 2>&1`

---

## ⚠️ IMPORTANTE: No usar Mega Desktop App en modo SINCRONIZACIÓN

> **Regla de oro**: El remote `ciszu-backup` se gestiona **EXCLUSIVAMENTE con rclone**.
> **NO uses** la aplicación Mega Desktop App en modo *Sincronización* (sync) sobre la carpeta del monorepo.
> 
> **Por qué falló antes (06 sep 2026)**: activar el modo SYNC de Mega Desktop sobre la carpeta del repo subió TODO (node_modules, .env, builds, logs, caches, archivos pesados de `archives/`, `downloads/`, `clones/`) llenando los 20 GB gratis en minutos. Además, el sync de Mega Desktop no respeta `.gitignore` ni exclusiones, y conflictúa con el espejo de rclone (ambos intentando controlar el mismo destino).
> 
> **Uso correcto de Mega Desktop App** (solo si se quiere):
> - Modo **Explorador/Archivos** (no sincronizar): para ver/descargar archivos puntuales desde la nube.
> - **NUNCA** activar "Sincronizar esta carpeta" sobre `E:\Ciszu Network` o cualquier subcarpeta del monorepo.
> - El remote `ciszu-backup` en rclone es la **única** autoridad de escritura/sync.
> 
> ### Estado actual (06 sep 2026)
> - ✅ Remote `ciszu-backup` configurado en rclone (tipo mega, user `ciszunetwork@gmail.com`).
> - ✅ Backup real completado: **1.04 GiB**, 3,735 objetos en `ciszu-backup:CiszuNetwork/`.
> - ✅ Script `scripts/backup-cloud.sh` funcional (ruta Windows corregida, rclone path fix).
> - ✅ Exclusiones aplicadas: node_modules, .env*, builds, logs, caches, archives/, downloads/, clones/, .opencode/, etc.
> - ✅ Papelera con fecha (`CiszuNetwork-trash/<fecha>/`) configurada via `--backup-dir`.