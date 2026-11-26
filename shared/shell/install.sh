#!/usr/bin/env bash
# Instala el perfil hibrido de Ciszu Network en Linux.
#   bash shared/shell/install.sh
# Crea enlaces simbolicos; no copia archivos, asi el repo es la fuente de verdad.

set -euo pipefail

SHELL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SHELL_DIR/../.." && pwd)"
KITTY_SRC="$REPO_DIR/shared/kitty/kitty.conf"

echo "Repo: $REPO_DIR"

# --- zsh --------------------------------------------------------------------
if [ -e "$HOME/.zshrc" ] && [ ! -L "$HOME/.zshrc" ]; then
  mv "$HOME/.zshrc" "$HOME/.zshrc.bak.$(date +%Y%m%d%H%M%S)"
  echo "Backup de ~/.zshrc creado"
fi
mkdir -p "$HOME/.config/ciszu"
ln -sfn "$SHELL_DIR" "$HOME/.config/ciszu/shell"
ln -sfn "$SHELL_DIR/zshrc" "$HOME/.zshrc"
echo "Enlazado ~/.zshrc -> $SHELL_DIR/zshrc"

# --- kitty ------------------------------------------------------------------
if command -v kitty >/dev/null 2>&1; then
  mkdir -p "$HOME/.config/kitty"
  if [ -e "$HOME/.config/kitty/kitty.conf" ] && [ ! -L "$HOME/.config/kitty/kitty.conf" ]; then
    mv "$HOME/.config/kitty/kitty.conf" "$HOME/.config/kitty/kitty.conf.bak.$(date +%Y%m%d%H%M%S)"
  fi
  ln -sfn "$KITTY_SRC" "$HOME/.config/kitty/kitty.conf"
  echo "Enlazado ~/.config/kitty/kitty.conf -> $KITTY_SRC"
fi

# --- comandos Linux ---------------------------------------------------------
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"
ln -sfn "$REPO_DIR/shared/scripts/linux/dev.sh" "$BIN_DIR/dev"
for _name in devcon staffcon customerscon tui; do
  ln -sfn "$REPO_DIR/shared/scripts/linux/consoles.sh" "$BIN_DIR/$_name"
done
chmod +x "$REPO_DIR/shared/scripts/linux/"*.sh "$REPO_DIR/shared/scripts/linux/bin/"* 2>/dev/null || true
ln -sfn "$REPO_DIR/shared/scripts/linux/bin/explorer.exe" "$BIN_DIR/explorer.exe"
ln -sfn "$REPO_DIR/shared/scripts/linux/bin/powershell.exe" "$BIN_DIR/powershell.exe"
unset _name
echo "Comandos enlazados en $BIN_DIR: dev, devcon, staffcon, customerscon, tui"

# --- shell por defecto ------------------------------------------------------
if command -v zsh >/dev/null 2>&1; then
  CURRENT_SHELL="$(getent passwd "$USER" | cut -d: -f7)"
  ZSH_BIN="$(command -v zsh)"
  if [ "$CURRENT_SHELL" != "$ZSH_BIN" ]; then
    if chsh -s "$ZSH_BIN" 2>/dev/null; then
      echo "Shell por defecto cambiado a zsh"
    else
      echo "Aviso: no se pudo cambiar el shell. Ejecuta: chsh -s $ZSH_BIN"
    fi
  fi
else
  echo "Aviso: zsh no esta instalado. Ejecuta: sudo dnf install -y zsh"
fi

echo
echo "Listo. Abre una terminal nueva o ejecuta: exec zsh"
echo "Perfil personal por defecto. Perfil corporativo: ciszu"
echo "Comandos: dev start all / dev status / devcon / staffcon / customerscon"
