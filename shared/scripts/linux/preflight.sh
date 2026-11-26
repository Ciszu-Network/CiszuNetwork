#!/usr/bin/env bash
# CISZU Network - reconocimiento previo de Fedora.
# Solo LEE el sistema: no instala, no borra, no reinicia, no pide sudo.
#
#   bash shared/scripts/linux/preflight.sh
#
# Salida: secciones legibles + resumen PASS/WARN/FAIL. Codigo 0 si se puede
# continuar, 1 si hay un bloqueo (repo ausente o poco disco).

set -u

SELF="$(readlink -f "${BASH_SOURCE[0]:-$0}")"
REPO="${CISZU_REPO:-$HOME/Ciszu Network}"
if [ ! -d "$REPO" ]; then
  REPO="$(cd "$(dirname "$SELF")/../../.." && pwd -P)"
fi
FAIL=0
WARN=0
WARNINGS=()
FAILURES=()

section() { echo; echo "== $* =="; }

ok()   { printf '  [OK]   %s\n' "$*"; }
warn() { printf '  [WARN] %s\n' "$*"; WARN=$((WARN + 1)); WARNINGS+=("$*"); }
bad()  { printf '  [FAIL] %s\n' "$*"; FAIL=$((FAIL + 1)); FAILURES+=("$*"); }

has() { command -v "$1" >/dev/null 2>&1; }

version_of() {
  case "$1" in
    node)   node -v 2>/dev/null ;;
    pnpm)   pnpm -v 2>/dev/null ;;
    pwsh)   pwsh -NoLogo -NoProfile -Command '$PSVersionTable.PSVersion.ToString()' 2>/dev/null ;;
    rustc)  rustc -V 2>/dev/null | awk '{print $2}' ;;
    *)      "$1" --version 2>/dev/null | head -n1 ;;
  esac
}

section "Sistema"
if [ -f /etc/fedora-release ]; then
  ok "$(cat /etc/fedora-release)"
else
  warn "No parece Fedora ($(uname -s))"
fi
echo "  kernel: $(uname -r)"
echo "  sesion: ${XDG_SESSION_TYPE:-desconocida} / ${XDG_CURRENT_DESKTOP:-desconocido}"
echo "  usuario: $(id -un) (grupos: $(id -nG))"
echo "  shell: ${SHELL:-?}"

if has getenforce; then
  echo "  selinux: $(getenforce)"
fi
if has mokutil; then
  echo "  secure boot: $(mokutil --sb-state 2>/dev/null | head -n1)"
elif has bootctl; then
  echo "  secure boot: $(bootctl status 2>/dev/null | grep -i 'secure boot' | head -n1)"
fi

section "Discos y espacio"
if has lsblk; then
  lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINTS | sed 's/^/  /'
fi
AVAIL_GB=$(df -BG --output=avail / 2>/dev/null | tail -n1 | tr -dc '0-9')
AVAIL_GB=${AVAIL_GB:-0}
echo "  libre en /: ${AVAIL_GB} GB"
if [ "$AVAIL_GB" -lt 5 ]; then
  bad "Menos de 5 GB libres: no compiles ni instales paquetes pesados"
elif [ "$AVAIL_GB" -lt 10 ]; then
  warn "Menos de 10 GB libres: evita builds grandes (Tauri/RPM)"
else
  ok "Espacio suficiente"
fi
if has findmnt; then
  findmnt -no FSTYPE,SOURCE / | sed 's/^/  raiz: /'
fi

section "Herramientas instaladas"
for tool in git gh node pnpm rustc cargo pwsh podman docker lmms kitty zsh fastfetch opencode tailscale rclone code flatpak btrfs rpm; do
  if has "$tool"; then
    printf '  %-10s %s\n' "$tool" "$(version_of "$tool")"
  else
    printf '  %-10s no instalado\n' "$tool"
  fi
done

section "Servicios y puertos"
for svc in sshd tailscaled libvirtd docker podman.socket; do
  if has systemctl; then
    state=$(systemctl is-active "$svc" 2>/dev/null || true)
    [ -n "$state" ] && printf '  %-12s %s\n' "$svc" "$state"
  fi
done
if has ss; then
  echo "  puertos relevantes:"
  ss -ltn 2>/dev/null | awk 'NR==1 || $4 ~ /:(3000|3001|3002|3003|4096|5432|7777|8788|54321)$/' | sed 's/^/    /'
fi

section "Repositorio"
if [ -d "$REPO" ]; then
  ok "Repo: $REPO"
  if git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "  rama: $(git -C "$REPO" rev-parse --abbrev-ref HEAD)"
    changes=$(git -C "$REPO" status --porcelain | wc -l | tr -d ' ')
    echo "  cambios sin commit: $changes"
    [ "$changes" -gt 0 ] && warn "El repo tiene cambios locales; no sobrescribir ni resetear"
  else
    warn "La carpeta existe pero no es un repo git"
  fi
  [ -d "$REPO/node_modules" ] && ok "node_modules presente" || warn "node_modules ausente (pnpm install pendiente)"
  for envfile in "services/supabase/.env" "projects/ciszubot/discord-bot/.env" "projects/ciszu/docs/documentation/SECRET_TEMP.env"; do
    if [ -f "$REPO/$envfile" ]; then
      echo "  secreto local: $envfile (presente, no se lee)"
    fi
  done
else
  bad "No se encontro el repo en $REPO (define CISZU_REPO)"
fi

section "OpenCode"
if has opencode; then
  ok "opencode $(version_of opencode)"
  opencode debug paths 2>/dev/null | sed 's/^/  /' || warn "opencode debug paths fallo"
  SKILLS="$HOME/.config/opencode/skills"
  if [ -d "$SKILLS" ]; then
    echo "  skills: $(find -L "$SKILLS" -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')"
  else
    warn "No hay skills en $SKILLS"
  fi
else
  warn "opencode no instalado"
fi

section "Resumen"
if [ "$FAIL" -gt 0 ]; then
  echo "  BLOQUEOS: $FAIL"
  for item in "${FAILURES[@]}"; do echo "    - $item"; done
  if [ "$WARN" -gt 0 ]; then
    echo "  ADVERTENCIAS: $WARN"
    for item in "${WARNINGS[@]}"; do echo "    - $item"; done
  fi
  echo
  echo "  Detente y reporta antes de instalar o compilar."
  exit 1
fi
if [ "$WARN" -gt 0 ]; then
  echo "  ADVERTENCIAS: $WARN"
  for item in "${WARNINGS[@]}"; do echo "    - $item"; done
  echo
  echo "  Puedes continuar, pero revisa cada advertencia y adapta los pasos."
  exit 0
fi
echo "  Todo en orden. Puedes continuar con el runbook."
