#!/usr/bin/env bash
# Sincroniza la configuracion de OpenCode del repo con ~/.config/opencode
# (Linux). Espejo de lo que usa Windows: mismas skills, mismo cli.json
# (adaptado de rutas) y mismo opencode.json global.
#
#   bash shared/opencode/install.sh
#
# No toca auth.json ni secretos: la autenticacion de proveedores se hace con
# `opencode auth login` en cada maquina.

set -euo pipefail

SHARED_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SHARED_DIR/../.." && pwd)"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
STAMP="$(date +%Y%m%d%H%M%S)"

echo "Repo: $REPO_DIR"
mkdir -p "$CONFIG_DIR"

backup_if_needed() {
  local path="$1"
  if [ -e "$path" ] && [ ! -L "$path" ]; then
    mv "$path" "$path.bak.$STAMP"
    echo "Backup: $path -> $path.bak.$STAMP"
  fi
}

# --- Skills -----------------------------------------------------------------
# Symlink al repo: cualquier skill nueva queda disponible sin copiar de nuevo.
backup_if_needed "$CONFIG_DIR/skills"
ln -sfn "$REPO_DIR/.opencode/skills" "$CONFIG_DIR/skills"
echo "Enlazado $CONFIG_DIR/skills -> $REPO_DIR/.opencode/skills"

# --- opencode.json global ---------------------------------------------------
backup_if_needed "$CONFIG_DIR/opencode.json"
ln -sfn "$SHARED_DIR/opencode.json" "$CONFIG_DIR/opencode.json"
echo "Enlazado $CONFIG_DIR/opencode.json -> $SHARED_DIR/opencode.json"

# --- cli.json (tema, plugins, sesion) ---------------------------------------
# Se genera porque el plugin de voz necesita la ruta absoluta del repo.
backup_if_needed "$CONFIG_DIR/cli.json"
sed "s|@CISZU_REPO@|$REPO_DIR|g" "$SHARED_DIR/cli.json.template" >"$CONFIG_DIR/cli.json"
chmod 600 "$CONFIG_DIR/cli.json"
echo "Generado $CONFIG_DIR/cli.json (plugin de voz: $REPO_DIR/tools/tts-stt-ai)"

# --- Verificacion -----------------------------------------------------------
if command -v opencode >/dev/null 2>&1; then
  echo
  echo "OpenCode: $(opencode --version)"
  echo "Config:   $CONFIG_DIR"
fi
echo
echo "Listo. Las skills se recargan al guardar; reinicia la TUI si cambiaste cli.json."
