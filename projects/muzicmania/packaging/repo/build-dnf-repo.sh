#!/usr/bin/env bash
# Genera un repositorio DNF a partir de RPM firmados.
# Uso: GPG_KEY=tu@llave ./build-dnf-repo.sh <dir-rpm> <dir-salida>
set -euo pipefail

SRC="${1:?directorio de RPM}"
OUT="${2:?directorio de salida}"
GPG_KEY="${GPG_KEY:-}"

mkdir -p "$OUT"
cp -v "$SRC"/*.rpm "$OUT"/

if [ -n "$GPG_KEY" ]; then
  rpm --addsign --define "_gpg_name $GPG_KEY" "$OUT"/*.rpm
fi

if ! command -v createrepo_c >/dev/null 2>&1; then
  echo "Falta createrepo_c: sudo dnf install createrepo_c" >&2
  exit 1
fi
createrepo_c "$OUT"

if [ -n "$GPG_KEY" ]; then
  gpg --batch --yes --detach-sign --armor --default-key "$GPG_KEY" "$OUT/repodata/repomd.xml"
fi

cp "$(dirname "$0")/muzicmania.repo" "$OUT/"
echo "Repositorio listo en $OUT"
