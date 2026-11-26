# CISZU Network - perfil corporativo para zsh (Linux).
# Se carga con: ciszu
# Banner + prompt identicos al perfil de PowerShell, adaptados a Linux.

CISZU_SHELL_DIR="${${(%):-%x}:A:h}"
export CISZU_REPO="${CISZU_REPO:-${CISZU_SHELL_DIR:h:h}}"
export CISZU_PROFILE=1
[[ -f "$CISZU_SHELL_DIR/env.sh" ]] && source "$CISZU_SHELL_DIR/env.sh"
[[ -f "$CISZU_SHELL_DIR/aliases.sh" ]] && source "$CISZU_SHELL_DIR/aliases.sh"

# ciszu-ai solo existe dentro de este perfil (no se enlaza en ~/.local/bin).
ciszu-ai() {
  if [[ "${CISZU_PROFILE:-}" != "1" ]]; then
    echo "ciszu-ai solo esta disponible dentro del perfil Ciszu Network. Ejecuta: ciszu" >&2
    return 1
  fi
  bash "$CISZU_REPO/shared/scripts/linux/ciszu-ai.sh" "$@"
}

# --- Banner -----------------------------------------------------------------
# Misma cabecera y mismos temas ANSI que el perfil de PowerShell.
#   CISZU_BANNER_FILE  ruta explicita al .ansi (logo por defecto)
#   CISZU_BANNER_THEME logo | rainbow | pastel | darksky
if [[ -z "${CISZU_BANNER_FILE:-}" ]]; then
  _ciszu_theme="${CISZU_BANNER_THEME:-logo}"
  CISZU_BANNER_FILE="$CISZU_REPO/shared/powershell/banners/ciszu-banner-${_ciszu_theme}.ansi"
  if [[ ! -f "$CISZU_BANNER_FILE" ]]; then
    CISZU_BANNER_FILE="$HOME/.config/powershell-banners-custom/ciszu-banner-${_ciszu_theme}.ansi"
  fi
  unset _ciszu_theme
fi

if [[ "${CISZU_PROFILE_BANNER:-1}" != "0" ]]; then
  clear
  print -P "%F{cyan}☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰%f"
  print -P "                 %F{blue}CISZU NETWORK%f %F{magenta}| PORTABLE PROFILE | CLI | TUI%f"
  print -P "%F{cyan}☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰%f"
  echo
  if [[ -f "$CISZU_BANNER_FILE" ]]; then
    cat "$CISZU_BANNER_FILE"
    echo
  fi
  print -P "  %F{cyan}ciszu-ai%f entra al servidor OpenCode 7777  %F{magenta}|%f  %F{cyan}ciszu-ai pair%f enlaza el movil"
  echo
fi

# --- Prompt -----------------------------------------------------------------
setopt prompt_subst

_ciszu_precmd() {
  local branch user time p g
  branch="$(git -C "$CISZU_REPO" rev-parse --abbrev-ref HEAD 2>/dev/null)"
  if [ -n "$branch" ]; then
    g="%F{magenta}($branch) ⛕%f"
  else
    g="%F{red} No git branch ✘%f"
  fi
  user="${USER}@${HOST}"
  time="$(date '+%H:%M')"
  p="${PWD/#$HOME/~}"
  case "$p" in
    *"$CISZU_REPO"*) p="[repo]${p#"$CISZU_REPO"}" ;;
  esac

  PROMPT="%F{cyan} ✦ BIENVENIDO CISZU ✦ %f 〔Repo: ${g} ︙ Time: [${time}] ✇ ︙ Usuario: [${user}] ㋡〕 %F{cyan}✦%f%F{magenta}
♥︎ INGRESAR COMANDO %f%F{cyan}➤ ➤ ➤ %f%F{magenta}"
  RPROMPT=''
}

autoload -Uz add-zsh-hook
add-zsh-hook precmd _ciszu_precmd
_ciszu_precmd
