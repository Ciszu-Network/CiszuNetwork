# CISZU Network - comandos compartidos para zsh/bash.
# Espejo POSIX de las funciones del perfil PowerShell (shared/powershell).
# Se carga desde shared/shell/zshrc.

# --- Navegacion -------------------------------------------------------------
repo() { cd "$CISZU_REPO" || return 1; }

# --- Desarrollo -------------------------------------------------------------
dev() {
  local _app _filter
  # start/stop/restart/status/log pertenecen al CLI nativo (shared/scripts/linux/dev.sh);
  # sin este dispatch, la funcion tapaba al ejecutable de ~/.local/bin/dev.
  case "${1:-}" in
    start|stop|restart|status|log)
      "$CISZU_REPO/shared/scripts/linux/dev.sh" "$@"
      return $?
      ;;
  esac
  _app="${1:-network}"
  if [ "$#" -gt 0 ]; then shift; fi
  case "$_app" in
    network)  _filter="ciszunetwork-website" ;;
    antony)   _filter="ciszukoantony-website" ;;
    ciszubot) _filter="ciszubot-website" ;;
    muzic)    _filter="muzicmania-website" ;;
    *)        _filter="$_app" ;;
  esac
  pnpm --filter "$_filter" dev "$@"
}

devall()  { "$CISZU_REPO/shared/scripts/linux/dev.sh" start all "$@"; }
devstop() { "$CISZU_REPO/shared/scripts/linux/dev.sh" stop all; }
buildall() { pnpm turbo run build "$@"; }
lintall()  { pnpm lint:all "$@"; }
testall()  { pnpm test:all "$@"; }
test()     { pnpm test "$@"; }
testwatch() { pnpm test:watch "$@"; }
e2e()      { pnpm e2e "$@"; }
e2egui()   { pnpm e2e "$@" && pnpm exec playwright show-report; }

cdnupload() { pnpm cdn:upload "$@"; }
cdnverify() { pnpm cdn:verify "$@"; }
doctor()    { pnpm run doctor "$@"; }
cmds()      { pnpm commands "$@"; }

# Repara carpetas creadas por Windows que quedaron sin escritura (555) en NTFS.
# Uso: fixperms [rutas...]  (sin args: repo + Installed Games de D:/E:)
fixperms() {
  local roots=("$@")
  if [ ${#roots[@]} -eq 0 ]; then
    roots=("$CISZU_REPO" "/mnt/CiscoData1/Installed Games" "/mnt/CiscoData2/Installed Games")
  fi
  local r
  for r in "${roots[@]}"; do
    [ -d "$r" ] || continue
    find "$r" -xdev -type d ! -perm -u+w -exec chmod u+rwx {} + 2>/dev/null
    find "$r" -xdev -type f ! -perm -u+w -exec chmod u+rw {} + 2>/dev/null
    echo "Permisos reparados: $r"
  done
}

cleannext() { pnpm clean:next "$@"; }
cleanlogs() { pnpm clean:logs "$@"; }
cleanall()  { pnpm clean:all "$@"; }

# Storybook (@ciszu/ui)
sb()      { pnpm --filter @ciszu/ui storybook "$@"; }
sbtest()  { pnpm --filter @ciszu/ui test:storybook "$@"; }
sbwatch() { pnpm --filter @ciszu/ui exec vitest --config vitest.config.mts "$@"; }
sbbuild() { pnpm --filter @ciszu/ui build-storybook "$@"; }
sbchrom() { pnpm --filter @ciszu/ui chromatic "$@"; }

# --- Git --------------------------------------------------------------------
gs()   { git status --short "$@"; }
gd()   { git diff "$@"; }
glog() { git log --oneline --graph --decorate -20 "$@"; }
gpull() { git pull --ff-only "$@"; }
gp()   { git push "$@"; }

_gc_safe_all() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "gc: no estas dentro de un repositorio git" >&2
    return 1
  fi
  if git status --porcelain -uall 2>/dev/null | grep -Eq '(^|/)\.env($|\.)|SECRET_TEMP\.env$|\.age$'; then
    echo "gc: commit bloqueado, hay archivos sensibles en el stage potencial:" >&2
    git status --porcelain -uall | grep -E '(^|/)\.env($|\.)|SECRET_TEMP\.env$|\.age$' >&2
    return 1
  fi
  git add -A
}

gc() {
  [ "$#" -gt 0 ] || { echo 'Uso: gc "mensaje de commit"' >&2; return 1; }
  _gc_safe_all && git commit -m "$*"
}

gcp() {
  [ "$#" -gt 0 ] || { echo 'Uso: gcp "mensaje de commit"' >&2; return 1; }
  _gc_safe_all && git commit -m "$*" && git push
}

# --- Sistema ----------------------------------------------------------------
free() {
  df -h --output=source,size,used,avail,pcent,target / /home 2>/dev/null | sort -u
}
ports() {
  for _port in ${CISZU_DEV_PORTS:-3000 3001 3002 3003}; do
    if ss -ltn "sport = :$_port" 2>/dev/null | grep -q LISTEN; then
      echo "$_port: LISTEN"
    else
      echo "$_port: free"
    fi
  done
}

# --- Perfil -----------------------------------------------------------------
profile-edit()   { "${EDITOR:-vi}" "$CISZU_REPO/shared/shell/zshrc"; }
profile-reload() { source "$CISZU_REPO/shared/shell/zshrc"; }
profile-path()   { echo "$CISZU_REPO/shared/shell"; echo "$CISZU_REPO"; }

# --- Herramientas IA (Node; mismas rutas que el perfil PowerShell) ----------
art()      { node "$CISZU_REPO/tools/image-ai/generate-art.js" "$@"; }
music()    { node "$CISZU_REPO/tools/music-ai/generate-music.js" "$@"; }
video()    { node "$CISZU_REPO/tools/video-ai/generate-video.js" "$@"; }
removebg() { node "$CISZU_REPO/tools/removebg-ai/remove-bg.js" "$@"; }
textart()  { node "$CISZU_REPO/tools/ascii-ai/textart.js" "$@"; }

# --- Atajos -----------------------------------------------------------------
alias g='git'
alias pn='pnpm'
alias ll='ls -lah --color=auto'
alias la='ls -A --color=auto'
alias ..='cd ..'
alias ...='cd ../..'
alias q='exit'

if command -v eza >/dev/null 2>&1; then
  alias ls='eza --icons=auto --group-directories-first'
  alias ll='eza -lah --icons=auto --group-directories-first'
fi
if command -v bat >/dev/null 2>&1; then
  alias cat='bat --paging=never'
fi
