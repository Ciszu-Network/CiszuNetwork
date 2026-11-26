#!/usr/bin/env bash
# CISZU Network - lanzador oficial de sesiones Ciszu-AI en Linux.
#
# Espejo POSIX de tools/ciszu-ai/ciszu-ai.cmd (Windows). Mantiene un unico
# servidor OpenCode V2 en 127.0.0.1:7777 para que TUI, escritorio y movil
# compartan la misma sesion e historial.
#
# Solo esta disponible dentro del perfil corporativo:
#
#   ciszu
#   ciszu-ai              entrar/conectar sin reiniciar el servidor
#   ciszu-ai reset        reiniciar el servidor y conectar
#   ciszu-ai server       solo garantizar/levantar el servidor
#   ciszu-ai stop         detener el servidor de 7777
#   ciszu-ai status       estado del servidor
#   ciszu-ai pair         abrir el servidor en la red y generar enlaces moviles
#
# Reglas:
#   - No imprimir OPENCODE_PASSWORD.
#   - No usar puertos distintos de 7777 salvo CISZU_AI_PORT explicito.
#   - El bind se persiste en ~/.local/state/ciszu-ai/server-hostname.txt.

set -euo pipefail

PORT="${CISZU_AI_PORT:-7777}"
PROFILE_MARKER="${CISZU_PROFILE:-}"

if [ "$PROFILE_MARKER" != "1" ]; then
  echo "[ciszu-ai] Solo disponible dentro del perfil Ciszu Network." >&2
  echo "           Ejecuta primero: ciszu" >&2
  exit 1
fi

SELF="$(readlink -f "${BASH_SOURCE[0]:-$0}")"
REPO="${CISZU_REPO:-$(cd "$(dirname "$SELF")/../../.." && pwd)}"
if [ ! -d "$REPO" ]; then
  REPO="$(cd "$(dirname "$SELF")/../../.." && pwd -P)"
fi
OPENCODE_BIN="$(command -v opencode || true)"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ciszu-ai"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/ciszu-ai"
PASSWORD_FILE="$CONFIG_DIR/password"
HOST_FILE="$STATE_DIR/server-hostname.txt"
PID_FILE="$STATE_DIR/server.pid"
LOG_DIR="$REPO/.opencode/temp"
LOG_FILE="$LOG_DIR/opencode-server.log"
ERR_FILE="$LOG_DIR/opencode-server-err.log"
URL="http://127.0.0.1:$PORT"

die() { echo "[ciszu-ai] $*" >&2; exit 1; }

[ -n "$OPENCODE_BIN" ] || die "No se encontro opencode en PATH. Instala OpenCode V2."
[ -d "$REPO" ] || die "No existe el repo: $REPO (define CISZU_REPO)."
mkdir -p "$CONFIG_DIR" "$STATE_DIR" "$LOG_DIR"

# --- Contrasena -------------------------------------------------------------
# Prioridad: entorno (vault/sesion) > archivo local 0600 > generacion segura.
if [ -z "${OPENCODE_PASSWORD:-}" ]; then
  if [ -f "$PASSWORD_FILE" ]; then
    OPENCODE_PASSWORD="$(<"$PASSWORD_FILE")"
  else
    umask 077
    if command -v openssl >/dev/null 2>&1; then
      OPENCODE_PASSWORD="$(openssl rand -hex 32)"
    else
      OPENCODE_PASSWORD="$(head -c 32 /dev/urandom | base64 | tr -dc 'A-Za-z0-9')"
    fi
    printf '%s' "$OPENCODE_PASSWORD" >"$PASSWORD_FILE"
    chmod 600 "$PASSWORD_FILE"
    echo "[ciszu-ai] Contrasena local generada en $PASSWORD_FILE (0600)."
  fi
fi
export OPENCODE_PASSWORD

# --- Helpers ----------------------------------------------------------------
listener_line() {
  ss -H -ltnp "sport = :$PORT" 2>/dev/null | head -n 1 || true
}

listener_pid() {
  local line
  line="$(listener_line)"
  printf '%s' "$line" | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p' | head -n 1
}

listener_addr() {
  local line addr
  line="$(listener_line)"
  [ -n "$line" ] || return 0
  addr="$(printf '%s' "$line" | awk '{print $4}' | sed "s/:$PORT$//")"
  addr="${addr#[}"
  addr="${addr%]}"
  printf '%s' "$addr"
}

health() {
  curl -fsS --max-time 3 -u "opencode:$OPENCODE_PASSWORD" "$URL/api/info" >/dev/null 2>&1
}

stop_server() {
  local pid i
  pid="$(listener_pid)"
  if [ -z "$pid" ] && [ -f "$PID_FILE" ]; then
    pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  fi
  if [ -z "$pid" ]; then
    rm -f "$PID_FILE"
    echo "[ciszu-ai] No habia servidor escuchando en $PORT."
    return 0
  fi
  kill "$pid" 2>/dev/null || true
  for i in 1 2 3 4 5 6 7 8 9 10; do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.3
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  echo "[ciszu-ai] Servidor detenido (PID $pid)."
}

start_server() {
  local host="$1" pid i
  : >"$LOG_FILE"
  : >"$ERR_FILE"
  echo "[ciszu-ai] Iniciando opencode serve en $URL (host $host)..."
  (
    cd "$REPO"
    nohup "$OPENCODE_BIN" serve --port "$PORT" --hostname "$host" \
      >"$LOG_FILE" 2>"$ERR_FILE" &
    echo $! >"$PID_FILE"
  )
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  for i in $(seq 1 60); do
    if health; then
      echo "[ciszu-ai] Servidor listo (PID ${pid:-?}) en $URL."
      return 0
    fi
    sleep 0.5
  done
  echo "[ciszu-ai] FALLO: el servidor no respondio. Revisa $ERR_FILE" >&2
  tail -n 20 "$ERR_FILE" 2>/dev/null | sed 's/^/  /' >&2 || true
  return 1
}

ensure_server() {
  local host="${1:-127.0.0.1}" addr
  if health; then
    addr="$(listener_addr)"
    if [ "$host" = "0.0.0.0" ] && [ "$addr" != "0.0.0.0" ] && [ "$addr" != "::" ]; then
      echo "[ciszu-ai] El servidor escucha en $addr y se pidio $host; reiniciando..."
      stop_server
    else
      echo "[ciszu-ai] Servidor ya corriendo en $URL (host ${addr:-?})."
      return 0
    fi
  elif [ -n "$(listener_pid)" ]; then
    echo "[ciszu-ai] El puerto $PORT esta ocupado pero no responde sano; reiniciando..."
    stop_server
  fi
  start_server "$host"
}

saved_host() {
  if [ -f "$HOST_FILE" ]; then
    tr -d '[:space:]' <"$HOST_FILE"
  else
    echo "127.0.0.1"
  fi
}

api_pair_code() {
  local response
  response="$(curl -fsS --max-time 5 -u "opencode:$OPENCODE_PASSWORD" \
    -X POST -H 'Content-Type: application/json' -d '{}' "$URL/api/pair")" || return 1
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$response" | jq -r '.code // empty'
  else
    printf '%s' "$response" | sed -n 's/.*"code":"\([^"]*\)".*/\1/p'
  fi
}

collect_ips() {
  local lan ts
  lan="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<=NF;i++) if ($i=="src") {print $(i+1); exit}}')"
  if [ -z "$lan" ]; then
    lan="$(ip -4 -brief addr show 2>/dev/null | awk '$1 != "lo" {print $3}' | cut -d/ -f1 | head -n 1)"
  fi
  ts="$(ip -4 -brief addr show 2>/dev/null | awk '$1 ~ /^tailscale/ {print $3}' | cut -d/ -f1)"
  if [ -n "$lan" ]; then printf 'Wi-Fi/LAN %s\n' "$lan"; fi
  if [ -n "$ts" ] && [ "$ts" != "$lan" ]; then printf 'Tailscale %s\n' "$ts"; fi
}

pair_phone() {
  local host label ip code
  host="$(saved_host)"
  if [ "$host" != "0.0.0.0" ]; then
    host="0.0.0.0"
  fi
  ensure_server "$host"
  printf '0.0.0.0' >"$HOST_FILE"
  echo
  echo "[ciszu-ai] Enlaces de emparejamiento (caducan en 5 min, un solo uso):"
  if collect_ips | while read -r label ip; do
    code="$(api_pair_code || true)"
    if [ -n "${code:-}" ]; then
      printf '  %-10s http://%s:%s/auth/connect/%s\n' "$label" "$ip" "$PORT" "$code"
    else
      printf '  %-10s ERROR al crear codigo para %s\n' "$label" "$ip"
    fi
  done; then :; fi
  code="$(api_pair_code || true)"
  if [ -n "${code:-}" ]; then
    printf '  %-10s http://127.0.0.1:%s/auth/connect/%s\n' "Este PC" "$PORT" "$code"
  fi
  echo
  echo "Pega el enlace en la app de OpenCode o escanealo."
  echo "Si el movil no conecta, revisa Tailscale y el firewall local del puerto $PORT."
}

status_server() {
  local addr pid
  addr="$(listener_addr)"
  pid="$(listener_pid)"
  echo "CISZU-AI - estado"
  echo "  repo      : $REPO"
  echo "  servidor  : $URL"
  echo "  bind      : ${addr:-no escucha}"
  echo "  pid       : ${pid:-?}"
  if health; then
    echo "  salud     : OK (autenticado)"
  else
    echo "  salud     : sin respuesta"
  fi
  echo "  password  : $([ -f "$PASSWORD_FILE" ] && echo "archivo $PASSWORD_FILE" || echo "entorno")"
  echo "  logs      : $LOG_FILE"
}

usage() {
  sed -n '2,25p' "$0" | sed 's/^# \{0,1\}//'
}

action="${1:-attach}"
case "$action" in
  attach|"")
    ensure_server "127.0.0.1"
    cd "$REPO"
    echo "[ciszu-ai] Conectando al servidor compartido $URL..."
    exec "$OPENCODE_BIN" --server "$URL"
    ;;
  reset)
    stop_server
    ensure_server "127.0.0.1"
    cd "$REPO"
    echo "[ciszu-ai] Conectando al servidor compartido $URL..."
    exec "$OPENCODE_BIN" --server "$URL"
    ;;
  server|start)
    ensure_server "$(saved_host)"
    ;;
  stop)
    stop_server
    ;;
  status)
    status_server
    ;;
  pair)
    pair_phone
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "[ciszu-ai] Accion desconocida: $action" >&2
    usage >&2
    exit 2
    ;;
esac
