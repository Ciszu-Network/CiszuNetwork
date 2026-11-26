#!/usr/bin/env bash
# Genera el archivo fuente mínimo para Flatpak/AUR a partir de un tag.
# Uso: ./make-source.sh [tag] [salida]
set -euo pipefail

REPO="${CISZU_REPO:-$(cd "$(dirname "$0")/../../../.." && pwd)}"
TAG="${1:-launcher-v2.4.2-beta.2}"
OUT="${2:-$REPO/.opencode/temp/muzicmania-2.4.2-src.tar.gz}"

mkdir -p "$(dirname "$OUT")"
git -C "$REPO" archive --format=tar.gz --prefix= -o "$OUT" "$TAG" \
  projects/muzicmania/launcher/src-tauri \
  projects/muzicmania/packaging/assets

echo "Fuente: $OUT"
sha256sum "$OUT"
