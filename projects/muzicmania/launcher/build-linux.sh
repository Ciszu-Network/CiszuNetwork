#!/usr/bin/env bash
# Compila MuzicMania Launcher para Linux (deb + rpm + AppImage).
#
#   bash projects/muzicmania/launcher/build-linux.sh
#
# Requisitos en Fedora:
#   sudo dnf install -y webkit2gtk4.1-devel gtk3-devel librsvg2-devel \
#     libappindicator-gtk3-devel openssl-devel rpm-build patchelf fuse fuse-libs
#
# El resultado queda en src-tauri/target/release/bundle/{deb,rpm,appimage}.

set -euo pipefail

LAUNCHER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$LAUNCHER_DIR/../../.." && pwd)"
TAURI_CLI="$LAUNCHER_DIR/../website/node_modules/@tauri-apps/cli/tauri.js"

cd "$LAUNCHER_DIR"

fail() { echo "ERROR: $*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || fail "falta node (instala Node 24 con fnm)"
command -v pnpm >/dev/null 2>&1 || fail "falta pnpm (corepack prepare pnpm@12.16.1 --activate)"
command -v cargo >/dev/null 2>&1 || fail "falta cargo (rustup)"
command -v pkg-config >/dev/null 2>&1 || fail "falta pkg-config"

for lib in webkit2gtk-4.1 gtk+-3.0 librsvg-2.0; do
  pkg-config --exists "$lib" || fail "falta $lib (dnf install ${lib}-devel)"
done

if ! pkg-config --exists ayatana-appindicator3-0.1 && ! pkg-config --exists appindicator3-0.1; then
  echo "Aviso: no se encontro appindicator; la bandeja puede no funcionar."
fi

[ -f "$TAURI_CLI" ] || {
  echo "Instalando dependencias JS..."
  (cd "$REPO_DIR" && pnpm install --frozen-lockfile)
}
[ -f "$TAURI_CLI" ] || fail "no existe el CLI de Tauri en $TAURI_CLI"

# Version y fecha inyectadas por build.rs (si aplica) y config de plataforma.
[ -f src-tauri/tauri.linux.conf.json ] || fail "falta tauri.linux.conf.json"

echo "Compilando MuzicMania para Linux (deb, rpm, appimage)..."
node "$TAURI_CLI" build --bundles deb,rpm,appimage

BUNDLE_DIR="src-tauri/target/release/bundle"
echo
echo "Artefactos:"
find "$BUNDLE_DIR" -maxdepth 2 -type f \( -name '*.deb' -o -name '*.rpm' -o -name '*.AppImage' \) -printf '  %p (%s bytes)\n' 2>/dev/null || \
  find "$BUNDLE_DIR" -maxdepth 2 -type f \( -name '*.deb' -o -name '*.rpm' -o -name '*.AppImage' \)

echo
echo "Publicando artefactos Linux en downloads/ (OS/arch/version/channel)..."
node "$LAUNCHER_DIR/scripts/publish-linux-downloads.mjs"

echo
echo "Prueba local:"
echo "  sudo dnf install -y $BUNDLE_DIR/rpm/*.rpm"
echo "  chmod +x $BUNDLE_DIR/appimage/*.AppImage && $BUNDLE_DIR/appimage/*.AppImage"
