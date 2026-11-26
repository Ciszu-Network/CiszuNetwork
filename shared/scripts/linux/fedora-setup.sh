#!/usr/bin/env bash
# CISZU Network - preparacion de Fedora (Workstation 45+).
#
#   bash scripts/linux/fedora-setup.sh [opciones]
#
# Opciones:
#   --docker      Instala Docker CE en vez de Podman (por defecto Podman)
#   --tailscale   Instala y activa Tailscale
#   --vscode      Instala VS Code (repo oficial de Microsoft)
#   --opencode    Instala OpenCode CLI
#   --kvm         Instala KVM/libvirt (alternativa a VirtualBox)
#   --no-repo     No ejecuta pnpm install en el repo
#
# Es idempotente: se puede ejecutar varias veces.

set -euo pipefail

USE_DOCKER=0
USE_TAILSCALE=0
USE_VSCODE=0
USE_OPENCODE=0
USE_KVM=0
INSTALL_REPO=1

for arg in "$@"; do
  case "$arg" in
    --docker) USE_DOCKER=1 ;;
    --tailscale) USE_TAILSCALE=1 ;;
    --vscode) USE_VSCODE=1 ;;
    --opencode) USE_OPENCODE=1 ;;
    --kvm) USE_KVM=1 ;;
    --no-repo) INSTALL_REPO=0 ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    *) echo "Opcion desconocida: $arg" >&2; exit 2 ;;
  esac
done

if [ "$(id -u)" -eq 0 ]; then
  echo "No ejecutes este script como root; usa tu usuario (pedira sudo cuando haga falta)." >&2
  exit 1
fi

if [ ! -f /etc/fedora-release ]; then
  echo "Aviso: este script esta pensado para Fedora. Continuo igualmente..." >&2
fi

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
echo "Repo: $REPO_DIR"

step() { echo; echo "== $* =="; }

# --- 1. Paquetes base -------------------------------------------------------
step "Paquetes base (dnf)"
sudo dnf install -y \
  git curl wget unzip tar xz zstd jq \
  ripgrep fd-find bat eza zoxide fzf btop fastfetch \
  neovim ffmpeg-free ImageMagick pandoc poppler-utils \
  gh rclone starship kitty zsh zsh-autosuggestions zsh-syntax-highlighting \
  fontconfig mesa-dri-drivers lmms keepassxc

step "Compilacion y Tauri"
sudo dnf install -y gcc gcc-c++ make pkgconf-pkg-config openssl-devel
for pkg in webkit2gtk4.1-devel gtk3-devel librsvg2-devel \
           libappindicator-gtk3-devel libayatana-appindicator-gtk3-devel \
           rpm-build patchelf fuse fuse-libs; do
  sudo dnf install -y "$pkg" || echo "  (omitido: $pkg no esta en los repos)"
done

# --- 2. Node 24 + pnpm 12.16.1 ---------------------------------------------
step "Node 24 + pnpm 12.16.1"
if ! command -v fnm >/dev/null 2>&1; then
  curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell
fi
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env --shell bash)"
fnm install 24 >/dev/null
fnm default 24 >/dev/null
if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@12.16.1 --activate
else
  npm install -g pnpm@12.16.1
fi

# --- 3. Rust ----------------------------------------------------------------
step "Rust (rustup)"
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
# shellcheck disable=SC1091
[ -f "$HOME/.cargo/env" ] && source "$HOME/.cargo/env"

# --- 3.5 PowerShell 7 (consolas del ecosistema) -----------------------------
step "PowerShell 7 (pwsh)"
sudo dnf install -y "https://packages.microsoft.com/config/fedora/$(rpm -E %fedora)/packages-microsoft-prod.rpm" || true
sudo dnf install -y powershell || echo "  (no se pudo instalar powershell; revisa el repo de Microsoft)"

# --- 4. Contenedores --------------------------------------------------------
if [ "$USE_DOCKER" -eq 1 ]; then
  step "Docker CE"
  sudo dnf install -y dnf-plugins-core
  sudo dnf config-manager addrepo --from-repofile=https://download.docker.com/linux/fedora/docker-ce.repo || true
  sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER" || true
else
  step "Podman (rootless) + compatibilidad docker"
  sudo dnf install -y podman podman-docker podman-compose
fi

if [ "$USE_KVM" -eq 1 ]; then
  step "KVM / libvirt (alternativa a VirtualBox)"
  sudo dnf install -y @virtualization
  sudo systemctl enable --now libvirtd
  sudo usermod -aG libvirt "$USER" || true
fi

# --- 5. Tailscale -----------------------------------------------------------
if [ "$USE_TAILSCALE" -eq 1 ]; then
  step "Tailscale"
  sudo dnf config-manager addrepo --from-repofile=https://pkgs.tailscale.com/stable/fedora/tailscale.repo || true
  sudo dnf install -y tailscale
  sudo systemctl enable --now tailscaled
  echo "Autentica con: sudo tailscale up"
fi

# --- 6. VS Code -------------------------------------------------------------
if [ "$USE_VSCODE" -eq 1 ]; then
  step "VS Code"
  sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
  sudo tee /etc/yum.repos.d/vscode.repo >/dev/null <<'EOF'
[code]
name=Visual Studio Code
baseurl=https://packages.microsoft.com/yumrepos/vscode
enabled=1
autorefresh=1
type=rpm-md
gpgcheck=1
gpgkey=https://packages.microsoft.com/keys/microsoft.asc
EOF
  sudo dnf install -y code
fi

# --- 7. OpenCode ------------------------------------------------------------
if [ "$USE_OPENCODE" -eq 1 ]; then
  step "OpenCode CLI"
  curl -fsSL https://opencode.ai/v2/install | bash
fi

# --- 8. Fuentes y shell -----------------------------------------------------
step "Fuentes de marca"
mkdir -p "$HOME/.local/share/fonts"
if [ -d "$REPO_DIR/shared/fonts" ]; then
  cp -f "$REPO_DIR/shared/fonts/"*.otf "$HOME/.local/share/fonts/" 2>/dev/null || true
  cp -f "$REPO_DIR/shared/fonts/"*.ttf "$HOME/.local/share/fonts/" 2>/dev/null || true
fi
fc-cache -f >/dev/null 2>&1 || true

step "Perfil de shell hibrido"
bash "$REPO_DIR/shared/shell/install.sh"

step "OpenCode global (skills + config)"
bash "$REPO_DIR/shared/opencode/install.sh"

# --- 9. Git y repo ----------------------------------------------------------
step "Git"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global pull.ff only

if [ "$INSTALL_REPO" -eq 1 ] && [ -f "$REPO_DIR/pnpm-workspace.yaml" ]; then
  step "Dependencias del monorepo"
  (cd "$REPO_DIR" && pnpm install)
fi

# --- 10. Verificacion -------------------------------------------------------
step "Verificacion"
for tool in git node pnpm rustc cargo python3 podman kitty zsh rclone gh; do
  if command -v "$tool" >/dev/null 2>&1; then
    case "$tool" in
      node) printf '  %-10s %s\n' "$tool" "$(node -v)" ;;
      pnpm) printf '  %-10s %s\n' "$tool" "$(pnpm -v)" ;;
      *)    printf '  %-10s %s\n' "$tool" "$("$tool" --version 2>/dev/null | head -n1)" ;;
    esac
  else
    printf '  %-10s FALTA\n' "$tool"
  fi
done

echo
echo "Listo. Cierra y abre la sesion (o 'exec zsh')."
echo "Pendiente manual: iniciar sesion en gh, tailscale y opencode auth."
