# Empaquetado Linux de MuzicMania

MuzicMania es **MIT / open source**. App ID canónico:
`network.ciszu.muzicmania`.

Este directorio prepara la distribución para repositorios oficiales y
comunitarios. AppImage queda fuera de este flujo.

## Herramientas

En Fedora:

```bash
sudo dnf install -y flatpak-builder rpm-build createrepo_c dpkg dpkg-dev
```

Flathub usa `org.flatpak.Builder` (Flatpak) para construir; Snapcraft se instala
con `snap install snapcraft --classic` y requiere `snapd`. Los repos oficiales
(Flathub, Fedora, Snap Store, AUR) requieren cuenta, revisión y aceptación de
sus políticas; este directorio solo prepara los artefactos y la configuración.

## Canales

| Canal | Discover | Requisitos | Notas |
|---|---|---|---|
| Flathub | Sí | Manifiesto, AppStream, licencia MIT, PR y revisión | Mejor opción para Discover en Fedora/KDE |
| Fedora oficial | Sí | Spec RPM, licencia MIT, revisión Fedora | Solo software libre; MIT cumple |
| RPM Fusion nonfree | Sí | Licencia redistribuible | No necesario al ser MIT |
| Copr / OBS | Tras añadir repo | Spec RPM | Pruebas y repos temporales |
| Snap Store | Solo con snapd | Snapcraft y revisión | No viene activo en Fedora |
| Repo DNF propio | Tras añadir `.repo` | RPM firmados + `createrepo_c` | Control total, no “oficial” |
| AUR | Arch | PKGBUILD | Comunidad Arch |
| Repo DEB propio | Debian/Ubuntu | `.deb` + `Packages` + `Release` | Comunidad Debian/Ubuntu |

## Identidad

- App ID: `network.ciszu.muzicmania`
- Desktop: `network.ciszu.muzicmania.desktop`
- Metainfo: `network.ciszu.muzicmania.metainfo.xml`
- Icono: `launcher/src-tauri/icons/512x512.png`
- Licencia: `launcher/src-tauri/LICENSE.txt` (MIT)
- Binario: `muzicmania`

## Flathub

```bash
flatpak install flathub org.flatpak.Builder
flatpak run org.flatpak.Builder --user --install --force-clean \
  --state-dir=.flatpak-builder build-dir \
  packaging/flatpak/network.ciszu.muzicmania.yml
flatpak run network.ciszu.muzicmania
```

Para enviar a Flathub:

1. Fork de `flathub/network.ciszu.muzicmania`.
2. Copia el manifiesto y los assets.
3. Ejecuta el build local y verifica icono, metainfo y licencia.
4. Abre un PR; el bot construye en x86_64/aarch64 y revisa permisos.
5. Corrige avisos de `flatpak-builder-lint` y AppStream.

El manifiesto usa `org.gnome.Platform` (incluye WebKitGTK) y la extensión
`org.freedesktop.Sdk.Extension.rust-stable`. Para Flathub conviene sustituir
`type: dir` por una fuente `git`/`archive` fijada a un tag y un commit.

## Fedora / RPM

```bash
# Crear el tarball fuente
git archive --format=tar.gz --prefix=muzicmania-2.4.2/ \
  -o packaging/rpm/muzicmania-2.4.2.tar.gz HEAD

rpmbuild -ba packaging/rpm/muzic-mania.spec \
  --define "_sourcedir $PWD/packaging/rpm" \
  --define "_rpmdir $PWD/packaging/rpm/RPMS"
```

Para Fedora oficial: pasar `fedora-review`, usar macros Rust de Fedora y
declarar todas las dependencias. Para Copr:

```bash
copr-cli create muzicmania --chroot fedora-45-x86_64
copr-cli build muzicmania packaging/rpm/muzic-mania.spec
```

## Snap

```bash
snapcraft --destructive-mode
sudo snap install --dangerous muzicmania_2.4.2_amd64.snap
snapcraft upload --release=stable muzicmania_2.4.2_amd64.snap
```

El Snap necesita `snapd` en Fedora y no aparece en Discover por defecto.

## Arch (AUR)

```bash
cd packaging/aur
makepkg -si
```

## Repos propios

### DNF

```bash
packaging/repo/build-dnf-repo.sh ./rpm-output ./public/rpm
```

Genera `repodata/`, firma los RPM y `repomd.xml`, y deja
`muzicmania.repo` para que el usuario lo añada.

### DEB

```bash
packaging/repo/build-deb-repo.sh ./deb-output ./public/deb
```

Genera `Packages`, `Packages.gz`, `Release` y `Release.gpg`.

## Checklist antes de publicar

- [ ] Licencia MIT coherente en código, web, docs y metadatos.
- [ ] `network.ciszu.muzicmania.desktop` y metainfo con el mismo ID.
- [ ] Iconos 32/128/256/512 y capturas.
- [ ] `appstreamcli validate` sin errores (el aviso de URL 402 de Vercel es temporal).
- [ ] Flatpak local arranca, reproduce audio y actualiza.
- [ ] RPM instala en Fedora limpia y crea entrada de menú.
- [ ] DEB instala en Debian/Ubuntu limpia.
- [ ] Snap instala con `--dangerous` y luego desde el Store.
- [ ] Checksums y firmas GPG publicados.
- [ ] `TODO.md` no se toca; el estado se actualiza en `STATUS_SYSTEM`/`PROJECTS_SYSTEM`.

## Limitaciones actuales

- Flathub, Fedora, Snap Store y AUR requieren cuentas, revisión y aceptación
  de sus políticas; no se pueden publicar solo desde este repo.
- El launcher usa WebView/online; Flathub puede pedir justificar la dependencia
  de red y el contenido de terceros.
- La música y assets de terceros no quedan cubiertos por la MIT; sus licencias
  se documentan aparte.
