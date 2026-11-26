#!/usr/bin/env bash
# Genera un repositorio APT/Debian a partir de .deb.
# Uso: GPG_KEY=tu@llave ./build-deb-repo.sh <dir-deb> <dir-salida>
set -euo pipefail

SRC="${1:?directorio de .deb}"
OUT="${2:?directorio de salida}"
GPG_KEY="${GPG_KEY:-}"

mkdir -p "$OUT"
cp -v "$SRC"/*.deb "$OUT"/

if ! command -v dpkg-scanpackages >/dev/null 2>&1; then
  echo "Falta dpkg-dev: sudo dnf install dpkg-dev" >&2
  exit 1
fi

cd "$OUT"
dpkg-scanpackages . /dev/null > Packages
gzip -kf Packages
apt-ftparchive release . > Release

if [ -n "$GPG_KEY" ]; then
  gpg --batch --yes --clearsign --default-key "$GPG_KEY" -o InRelease Release
  gpg --batch --yes --armor --detach-sign --default-key "$GPG_KEY" -o Release.gpg Release
fi

echo "Repositorio APT listo en $OUT"
