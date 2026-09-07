#!/usr/bin/env bash
# =============================================================================
# Ciszu Network — Backup Cloud (rclone → Mega)
# =============================================================================
# Respalda TODO el monorepo (incluida la documentación interna que NO está en
# GitHub) a un storage cloud privado, EXCLUYENDO lo regenerable o secreto:
# node_modules, .env*, builds, logs, archivos personales pesados.
#
# Uso:
#   bash scripts/backup-cloud.sh [--dry-run] [--check]
#
# Requisitos:
#   - rclone instalado (https://rclone.org)
#   - Remote de rclone configurado con una cuenta Mega (ver
#     projects/ciszu/docs/documentation/BACKUP_SYSTEM.md):
#       rclone config  →  nuevo remote llamado "ciszu-backup" de tipo mega
#
# El sync es espejo: lo borrado localmente se borra en la nube, pero primero
# se mueve a una "papelera" con fecha (CiszuNetwork-trash/<fecha>) como red
# de seguridad, gracias a --backup-dir.
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT_UNIX="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Convert to Windows path for rclone on Windows/Git Bash
# rclone on Windows expects Windows-style paths (E:\...)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" || "$OSTYPE" == "linux-gnu" ]]; then
  # Convert /mnt/e/... to E:\... for rclone
  REPO_ROOT="$(echo "${REPO_ROOT_UNIX}" | sed 's|^/mnt/\([a-z]\)/|\U\1:\\|; s|^/\([a-z]\)/|\U\1:\\|; s|/|\\|g')"
else
  REPO_ROOT="${REPO_ROOT_UNIX}"
fi

REMOTE_NAME="${CISZU_BACKUP_REMOTE:-ciszu-backup}"
REMOTE_DEST="${REMOTE_NAME}:CiszuNetwork"
TRASH_DEST="${REMOTE_NAME}:CiszuNetwork-trash/$(date +%F)"
LOG_FILE="${REPO_ROOT}/backup-cloud.log"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  LOG_FILE="/tmp/backup-cloud.log"
fi

# rclone binary: prefer project-local copy (use full Windows path)
if [[ -x "${REPO_ROOT_UNIX}/tools/rclone/rclone.exe" ]]; then
  RCLONE_CMD="${REPO_ROOT_UNIX}/tools/rclone/rclone.exe"
elif which rclone >/dev/null 2>&1; then
  RCLONE_CMD="rclone"
else
  RCLONE_CMD="rclone"
fi

# Git Bash on Windows reports linux-gnu; treat it as Windows for path quirks
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" || "$OSTYPE" == "linux-gnu" ]]; then
  LOG_FILE="/c/Users/fplay/AppData/Local/Temp/ciszu-backup.log"
fi

MODE_DRY=0
MODE_CHECK=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) MODE_DRY=1 ;;
    --check)   MODE_CHECK=1 ;;
    *) echo "Argumento desconocido: $arg (usa --dry-run o --check)"; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# Exclusiones
# ---------------------------------------------------------------------------
EXCLUDES=(
  # Dependencias y caches (regenerables)
  "node_modules/**"
  "**/node_modules/**"
  ".pnpm-store/**"
  ".turbo/**"
  # Builds (regenerables)
  ".next/**"
  "**/.next/**"
  "dist/**"
  "out/**"
  "build/**"
  "target/**"
  "storybook-static/**"
  # Git / VCS (la historia del código ya vive en GitHub)
  ".git/**"
  # Credenciales — NUNCA a la nube
  ".env"
  ".env.*"
  "**/.env"
  "**/.env.*"
  ".env.keys"
  "**/SECRET_TEMP.env"
  # Logs y temporales
  "*.log"
  "**/*.log"
  "*.err.log"
  "**/*.err.log"
  "gude-*.log"
  "**/gude-*.log"
  ".playwright-mcp/**"
  ".lighthouseci/**"
  ".opencode/temp/**"
  # Directorios de agentes/IA locales (config personal de cada PC)
  ".opencode/data/**"
  ".opencode/pw-browsers/**"
  ".opencode/skills/**"
  ".agents/**"
  ".kiro/**"
  # Pesado / personal / regenerable (clientes, ROMs, descargas, reportes)
  "archives/**"
  "downloads/**"
  "reports/**"
  "clones/**"
  # Runtime de herramientas locales (binarios/modelos/DBs)
  "tools/tts-stt-ai/runtime/**"
  "tools/tts-stt-ai/tmp/**"
  "tools/directus/data/**"
  "tools/cibersecurity/osint/output/**"
  "tools/consoles/local-logs/**"
  # Tests: outputs generados (el código de tests SÍ se respalda)
  "test/art/**"
  "test/music/**"
  "test/video/**"
  "test/osint/**"
  "test/database/**"
  "test/website/vitest/**"
  "test/website/e2e/reports/**"
  "test/website/testing/**"
  "test/website/debug/**"
  # Supabase CLI temp
  "services/supabase/.temp/**"
)

# ---------------------------------------------------------------------------
# Pre-flight
# ---------------------------------------------------------------------------
# rclone installed via winget on Windows — add project-local fallback to PATH
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  export PATH="${REPO_ROOT}/tools/rclone:$PATH"
fi

if [[ -z "${RCLONE_CMD}" || ! -x "${RCLONE_CMD}" ]]; then
  if ! command -v rclone >/dev/null 2>&1; then
    echo "❌ rclone no está instalado. Instálalo: https://rclone.org/downloads/"
    exit 1
  fi
  RCLONE_CMD="rclone"
fi

if ! "${RCLONE_CMD}" lsd "${REMOTE_NAME}:" >/dev/null 2>&1; then
  echo "❌ No se puede conectar al remote '${REMOTE_NAME}'. Configúralo con:"
  echo "   rclone config   (tipo de storage: mega, nombre: ${REMOTE_NAME})"
  echo "   Ver: projects/ciszu/docs/documentation/BACKUP_SYSTEM.md"
  exit 1
fi

# ---------------------------------------------------------------------------
# Construir args de exclusión
# ---------------------------------------------------------------------------
EXCLUDE_ARGS=()
for pat in "${EXCLUDES[@]}"; do
  EXCLUDE_ARGS+=(--exclude "${pat}")
done

RCLONE_ARGS=(sync "${REPO_ROOT}" "${REMOTE_DEST}")
RCLONE_ARGS+=("${EXCLUDE_ARGS[@]}")
RCLONE_ARGS+=(--backup-dir "${TRASH_DEST}")
RCLONE_ARGS+=(--delete-excluded --fast-list --transfers 4 --stats 30s)

if [[ "${MODE_DRY}" == "1" ]]; then
  RCLONE_ARGS+=(--dry-run)
  echo "🔍 MODO VISTA PREVIA (--dry-run): no se sube nada."
fi

if [[ "${MODE_CHECK}" == "1" ]]; then
  echo "🔎 Verificando integridad del backup remoto (rclone check)…"
  "${RCLONE_CMD}" check "${REPO_ROOT}" "${REMOTE_DEST}" "${EXCLUDE_ARGS[@]}" \
    --fast-list --transfers 4
fi

# ---------------------------------------------------------------------------
# Ejecutar sync
# ---------------------------------------------------------------------------
echo "📦 Backupeando ${REPO_ROOT} → ${REMOTE_DEST}"
echo "   Papelera de cambios: ${TRASH_DEST}"
echo "   Log: ${LOG_FILE}"
echo

"${RCLONE_CMD}" "${RCLONE_ARGS[@]}"

if [[ "${MODE_DRY}" == "1" ]]; then
  echo
  echo "✅ Vista previa terminada. Ejecuta sin --dry-run para subir de verdad."
else
  # Limpiar trash >30 días para evitar llenar el espacio de Mega
  echo "🧹 Limpiando papelera (>30 días)..."
  "${RCLONE_CMD}" delete "${REMOTE_NAME}:CiszuNetwork-trash/" --min-age 30d --fast-list 2>/dev/null || true
  echo
  echo "✅ Backup completado: $(date '+%Y-%m-%d %H:%M:%S')"
fi