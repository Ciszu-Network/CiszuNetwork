# CISZU Network - variables comunes para zsh/bash.
# Se carga desde shared/shell/zshrc (Linux) y puede sourcearse desde .bashrc.

# --- Raiz del repositorio ---------------------------------------------------
# Si CISZU_REPO viene de una sesion vieja o de otro disco, se descarta y se
# vuelve a resolver. Esto evita errores tras mover/renombrar el repo.
if [ -n "${CISZU_REPO:-}" ] && [ ! -d "$CISZU_REPO" ]; then
  unset CISZU_REPO
fi
if [ -z "${CISZU_REPO:-}" ]; then
  for _candidate in \
    "/mnt/CiscoData2/Ciszu Network" \
    "/mnt/CiscoData2/CiszuNetwork" \
    "$HOME/Ciszu Network" \
    "$HOME/ciszu-network" \
    "$HOME/repos/CiszuNetwork"
  do
    if [ -d "$_candidate" ]; then
      CISZU_REPO="$_candidate"
      break
    fi
  done
fi
if [ -z "${CISZU_REPO:-}" ]; then
  CISZU_REPO="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
fi
export CISZU_REPO
unset _candidate

# --- Herramientas de usuario ------------------------------------------------
export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
export PATH="$PNPM_HOME:$HOME/.local/bin:$HOME/.cargo/bin:$HOME/.opencode/bin:$PATH"

# --- Node 24 via fnm --------------------------------------------------------
# fedora-setup.sh instala fnm; sin esto la sesion seguiria usando el Node del
# sistema (22). En Windows el equivalente lo resuelve fnm/nvm en el perfil.
if [ -d "$HOME/.local/share/fnm" ]; then
  export PATH="$HOME/.local/share/fnm:$PATH"
  if command -v fnm >/dev/null 2>&1; then
    if [ -n "${ZSH_VERSION:-}" ]; then
      eval "$(fnm env --shell zsh 2>/dev/null)" || true
    else
      eval "$(fnm env --shell bash 2>/dev/null)" || true
    fi
  fi
fi

# --- Editor / paginador -----------------------------------------------------
if [ -z "${EDITOR:-}" ]; then
  for _ed in micro nano vim nvim; do
    if command -v "$_ed" >/dev/null 2>&1; then EDITOR="$_ed"; break; fi
  done
fi
export EDITOR="${EDITOR:-vi}"
export VISUAL="$EDITOR"
export PAGER="${PAGER:-less}"
unset _ed

# --- Node / pnpm ------------------------------------------------------------
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# --- Secretos locales (nunca en el repo) ------------------------------------
# Sincronizados desde el vault/Windows en ~/.config/ciszu/secrets.env (0600).
if [ -f "$HOME/.config/ciszu/secrets.env" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$HOME/.config/ciszu/secrets.env"
  set +a
fi

# --- Entorno de desarrollo --------------------------------------------------
export CISZU_DEV_PORTS="3000 3001 3002 3003"
export CISZU_PROFILE_BANNER="${CISZU_PROFILE_BANNER:-1}"
