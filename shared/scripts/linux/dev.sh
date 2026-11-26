#!/usr/bin/env bash
# CISZU Network - CLI de desarrollo para Linux (equivalente al devcon de Windows).
#
#   dev start <network|antony|ciszubot|muzic|all>
#   dev stop  <key|all>
#   dev restart <key|all>
#   dev status
#   dev log <key>
#
# Sin argumentos muestra el estado.

set -euo pipefail

SELF="$(readlink -f "${BASH_SOURCE[0]:-$0}")"
REPO="${CISZU_REPO:-$(cd "$(dirname "$SELF")/../../.." && pwd)}"
if [ ! -d "$REPO" ]; then
  REPO="$(cd "$(dirname "$SELF")/../../.." && pwd -P)"
fi
LOG_DIR="$REPO/.opencode/temp/dev-logs"
PID_DIR="$REPO/.opencode/temp/dev-pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

keys="network antony ciszubot muzic"

filter_for() {
  case "$1" in
    network) echo ciszunetwork-website ;;
    antony) echo ciszukoantony-website ;;
    ciszubot) echo ciszubot-website ;;
    muzic) echo muzicmania-website ;;
    *) echo "$1" ;;
  esac
}

port_for() {
  case "$1" in
    network) echo 3000 ;;
    antony) echo 3001 ;;
    ciszubot) echo 3002 ;;
    muzic) echo 3003 ;;
    *) echo '' ;;
  esac
}

port_busy() {
  ss -ltn 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$1$"
}

pid_alive() {
  [ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null
}

start_web() {
  local key="$1" filter port log pid
  filter="$(filter_for "$key")"
  port="$(port_for "$key")"
  if [ -z "$port" ]; then echo "Web desconocida: $key" >&2; return 1; fi
  if port_busy "$port"; then
    echo "$key: ya esta escuchando en $port"
    return 0
  fi
  log="$LOG_DIR/$key.log"
  ( cd "$REPO" && nohup pnpm --filter "$filter" exec next dev -p "$port" >"$log" 2>&1 & echo $! > "$PID_DIR/$key.pid" )
  echo "$key: iniciando en http://localhost:$port (log: $log)"
}

stop_web() {
  local key="$1" pid port
  pid="$(cat "$PID_DIR/$key.pid" 2>/dev/null || true)"
  port="$(port_for "$key")"
  if pid_alive "$pid"; then
    pkill -TERM -P "$pid" 2>/dev/null || true
    kill -TERM "$pid" 2>/dev/null || true
    sleep 1
    if pid_alive "$pid"; then
      pkill -KILL -P "$pid" 2>/dev/null || true
      kill -KILL "$pid" 2>/dev/null || true
    fi
    echo "$key: detenida"
  else
    echo "$key: no estaba corriendo"
  fi
  rm -f "$PID_DIR/$key.pid"
  if [ -n "$port" ] && port_busy "$port"; then
    pkill -f "next dev -p $port" 2>/dev/null || true
    echo "$key: procesos restantes en $port terminados"
  fi
}

status_web() {
  local key="$1" port pid
  port="$(port_for "$key")"
  pid="$(cat "$PID_DIR/$key.pid" 2>/dev/null || true)"
  if port_busy "$port"; then
    echo "  $key\t:$port\tLISTEN (pid ${pid:-?})"
  else
    echo "  $key\t:$port\tlibre"
  fi
}

all_keys() { echo "$keys"; }

case "${1:-status}" in
  start)
    shift
    if [ "${1:-}" = all ]; then for k in $keys; do start_web "$k"; done
    else start_web "${1:?Uso: dev start <key|all>}"; fi ;;
  stop)
    shift
    if [ "${1:-}" = all ]; then for k in $keys; do stop_web "$k"; done
    else stop_web "${1:?Uso: dev stop <key|all>}"; fi ;;
  restart)
    shift
    if [ "${1:-}" = all ]; then for k in $keys; do stop_web "$k"; start_web "$k"; done
    else stop_web "${1:?}"; start_web "$1"; fi ;;
  status)
    echo "CISZU dev - estado"
    for k in $keys; do status_web "$k"; done ;;
  log)
    key="${2:?Uso: dev log <key>}"
    tail -n 60 -f "$LOG_DIR/$key.log" ;;
  *)
    sed -n '2,12p' "$0" ;;
esac
