#!/usr/bin/env bash
# Lanzador de consolas PowerShell en Linux (pwsh + PlatformCompat).
# Se invoca con el nombre del comando: devcon, staffcon, customerscon, tui.
# Instalacion: shared/shell/install.sh crea los enlaces en ~/.local/bin.

set -euo pipefail

NAME="$(basename "$0")"
SELF="$(readlink -f "${BASH_SOURCE[0]:-$0}")"
REPO="${CISZU_REPO:-$(cd "$(dirname "$SELF")/../../.." && pwd)}"
if [ ! -d "$REPO" ]; then
  REPO="$(cd "$(dirname "$SELF")/../../.." && pwd -P)"
fi
PWSH="$(command -v pwsh || true)"

case "$NAME" in
  devcon)       TARGET="$REPO/test/website/debug/dev_console.ps1" ;;
  staffcon)     TARGET="$REPO/tools/consoles/staffcon.ps1" ;;
  customerscon) TARGET="$REPO/tools/consoles/customerscon.ps1" ;;
  tui)          TARGET="$REPO/tools/consoles/tui.ps1" ;;
  *) echo "Uso: devcon | staffcon | customerscon | tui" >&2; exit 2 ;;
esac

if [ -z "$PWSH" ]; then
  echo "PowerShell 7 (pwsh) no esta instalado." >&2
  echo "  sudo dnf install -y powershell   (repo de Microsoft)" >&2
  echo "  Alternativa para desarrollo web: dev start all" >&2
  exit 1
fi

exec "$PWSH" -NoLogo -NoProfile -File "$REPO/shared/scripts/linux/console-run.ps1" -Target "$TARGET" "$@"
