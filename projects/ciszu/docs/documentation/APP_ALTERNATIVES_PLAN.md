# APP_ALTERNATIVES_PLAN — Inventario Windows → alternativas Linux

Versión: 1.0.0
Actualización: 2026-11-24
Identificador: APP_ALTERNATIVES_PLAN_V1.0.0_2026_11_24_ciszunetwork

> **Definición**: inventario de las aplicaciones instaladas en el PC de Ciszuko
> Antony y su equivalente en Fedora/Linux, con la política de sustitución del
> ecosistema. El inventario se generó del registro de Windows (101 entradas),
> `Get-AppxPackage`, `E:\Installed Programs` y las bibliotecas de juegos.

## 1. Método

```powershell
# Registro (programas de escritorio)
Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
                 'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
                 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' |
  Where-Object DisplayName | Select-Object DisplayName, DisplayVersion, Publisher

# Apps de la Store
Get-AppxPackage | Where-Object { -not $_.IsFramework -and $_.SignatureKind -ne 'System' }

# Portables
Get-ChildItem 'E:\Installed Programs' -Directory
```

## 2. Prioridades y decisiones

| Tema | Decisión |
| --- | --- |
| Contenedores | **Podman rootless** (`podman-docker`); Docker CE solo si se pide |
| Virtualización | **KVM/libvirt**, no VirtualBox |
| Audio | **LMMS** para producción; Audacity/Ardour para edición |
| Windows-only | Wine/Bottles o VM Windows; nunca bloquear el flujo principal |
| Tiendas | dnf + Flathub; RPM propio para MuzicMania |

## 3. Leyenda

| Estado | Significado |
| --- | --- |
| **Nativo** | Existe para Linux y se instala con dnf/Flatpak |
| **Alternativa** | No es el mismo programa, cubre la misma tarea |
| **Web** | Se usa en el navegador |
| **Wine** | Funciona con Wine/Bottles/Proton (no siempre estable) |
| **VM** | Solo en una máquina virtual Windows (KVM/QEMU) |
| **No aplica** | Componente de Windows sin equivalente necesario |

## 4. Desarrollo y datos

| Windows | Linux | Estado | Nota |
| --- | --- | --- | --- |
| Visual Studio Code | VS Code (rpm/Flatpak) | Nativo | Misma extensión y settings sync |
| Git | git | Nativo | |
| GitHub CLI | gh | Nativo | `gh auth login` |
| Node.js 24 | fnm + Node 24 | Nativo | repo exige >= 24 |
| Bun | bun | Nativo | |
| Python 3.14 | python3 + pipx | Nativo | |
| Rustup | rustup | Nativo | |
| Eclipse Temurin JDK/JRE | temurin-25-jdk / java-25-openjdk | Nativo | `dbvr` usa Java 25 |
| Docker Desktop | Podman + podman-docker | Alternativa | Docker CE opcional |
| Oracle VirtualBox | KVM + virt-manager | Alternativa | Mejor rendimiento en Linux |
| DBeaver / dbvr | DBeaver CE | Nativo | |
| PostgreSQL 17/18 | postgresql-server | Nativo | |
| sqlite | sqlite3 | Nativo | |
| Bruno | Bruno (AppImage/deb) | Nativo | |
| OpenCode | opencode CLI / rpm | Nativo | ver `LINUX_SYSTEM.md` |
| Tailscale | tailscale | Nativo | |
| ZAP (Checkmarx) | zaproxy | Nativo | |
| Trivy | trivy | Nativo | |
| Screaming Frog SEO Spider | Wine o `lighthouse` + `crawl4ai` | Wine/Alternativa | Sin build Linux oficial |
| Screaming Frog Log Analyser | Wine o `goaccess` | Wine/Alternativa | |
| GnuWin32 Grep | grep | Nativo | |
| Pandoc | pandoc | Nativo | |
| Microsoft .NET SDK | dotnet-sdk | Nativo | |
| Visual Studio Build Tools | gcc/clang | Alternativa | MSVC no existe en Linux |
| Windows SDK | mingw + Wine/VM | VM | Solo para compilar Win32 |
| XNA Framework | MonoGame/FNA | Alternativa | |
| OpenAL | openal-soft | Nativo | |
| R for Windows | R | Nativo | |

## 5. Diseño, vídeo y audio

| Windows | Linux | Estado | Nota |
| --- | --- | --- | --- |
| Adobe Animate 2024 | Synfig Studio / OpenToonz / Krita | Alternativa | Animación 2D |
| Adobe Audition 2026 | Audacity / Ardour / REAPER | Alternativa | |
| Adobe Photoshop | GIMP / Krita / Photopea | Alternativa/Web | |
| Adobe Illustrator | Inkscape | Alternativa | |
| Adobe After Effects | Natron / Fusion (Resolve) | Alternativa | |
| Adobe Premiere | DaVinci Resolve / Kdenlive | Alternativa | |
| Affinity Photo/Designer | GIMP / Krita / Inkscape | Alternativa | |
| CorelDRAW | Inkscape | Alternativa | |
| Canva | Canva web | Web | |
| Krita | Krita | Nativo | |
| Paint.NET | GIMP / Krita | Alternativa | |
| PSD CODEC | GIMP / Krita (import PSD) | Nativo | |
| DaVinci Resolve 21 | DaVinci Resolve Linux | Nativo | Requiere GPU compatible |
| DaVinci Control Panels | Resolve Linux | Nativo | Panel puede requerir permisos udev |
| Blackmagic RAW | Resolve Linux | Nativo | |
| OBS Studio | OBS Studio | Nativo | |
| VLC | VLC | Nativo | |
| K-Lite Codec Pack | ffmpeg + gstreamer | No aplica | Linux no usa ese pack |
| FL Studio 2025 | LMMS / Bitwig / REAPER / Wine | Alternativa/Wine | FL Studio en Wine funciona |
| FL Studio ASIO | PipeWire/JACK | No aplica | |
| Mp3tag | Kid3 / puddletag | Nativo | |
| AutoSubs | faster-whisper / Subtitle Edit (Wine) | Alternativa | |
| Wondershare Filmora | Kdenlive / Shotcut | Alternativa | |
| Wondershare UniConverter | HandBrake / ffmpeg | Alternativa | |
| Wondershare NativePush | — | No aplica | |
| Spotify | Spotify (Flatpak) | Nativo | |
| Audacity | Audacity | Nativo | |

## 6. Ofimática, web y comunicación

| Windows | Linux | Estado | Nota |
| --- | --- | --- | --- |
| Microsoft 365 | LibreOffice / OnlyOffice / web | Alternativa | |
| Microsoft Edge | Edge Linux | Nativo | |
| Google Chrome | Chrome Linux | Nativo | |
| Opera GX | Opera GX Linux | Nativo | |
| Firefox | Firefox | Nativo | |
| Discord | Discord (Flatpak) | Nativo | |
| WhatsApp Desktop | WhatsApp (Flatpak) | Nativo | |
| Telegram Desktop | Telegram Desktop | Nativo | |
| Proton VPN | Proton VPN Linux (rpm) / CLI | Nativo | |
| Free Download Manager | Motrix / aria2 / Persepolis | Alternativa | |
| iLovePDF | Stirling PDF / pdfarranger / qpdf | Alternativa/Web | |
| OneDrive Photos | rclone / OneDrive client | Alternativa | |
| Microsoft Photos | DigiKam / Gwenview | Alternativa | |
| Screen Sketch | Spectacle / Flameshot | Nativo | |
| Windows Terminal | kitty | Nativo | |
| Windows Notepad | Kate / gedit | Nativo | |
| Windows Calculator | KCalc | Nativo | |
| Windows Camera | Cheese / Kamoso | Nativo | |
| Windows Alarms | KClock | Nativo | |
| Your Phone | KDE Connect | Alternativa | |
| Microsoft Store | Discover + Flathub | Alternativa | |

## 7. Utilidades del sistema

| Windows | Linux | Estado | Nota |
| --- | --- | --- | --- |
| 7-Zip | p7zip / Ark | Nativo | |
| WinRAR | Ark / 7z / unrar | Alternativa | |
| Everything | fd / Baloo / plocate | Alternativa | |
| PowerToys | KDE utilities + fzf | Alternativa | |
| Rufus | Ventoy / balenaEtcher / dd | Alternativa | |
| Ventoy | Ventoy Linux | Nativo | Ya usado en el USB |
| WizTree | ncdu / baobab / dust | Alternativa | |
| Rainmeter | Conky / widgets KDE | Alternativa | |
| RocketDock | Plank / Latte Dock | Alternativa | |
| Windhawk | — | No aplica | |
| MiniTool Partition Wizard | GParted / KDE Partition Manager | Alternativa | |
| AMD Software | Mesa/amdgpu + LACT/CoreCtrl | Alternativa | |
| Realtek Audio Control | alsamixer / pavucontrol | Alternativa | |
| GTK3 Runtime | gtk3 | Nativo | |
| scrcpy | scrcpy | Nativo | |
| Xbox / Gaming Services | — | No aplica | |

## 8. Juegos y lanzadores

| Windows | Linux | Estado | Nota |
| --- | --- | --- | --- |
| Steam | Steam + Proton | Nativo | |
| Epic Games Launcher | Heroic Games Launcher | Alternativa | |
| GOG Galaxy | Heroic / Lutris | Alternativa | |
| Roblox | Sober (Flatpak) / Grapejuice | Alternativa/Wine | |
| osu! (lazer) | osu!lazer AppImage | Nativo | |
| Minecraft (Java/UWP) | PrismLauncher / launcher oficial | Alternativa | |
| Juegos GOG/Steam locales | Proton / Lutris / Bottles | Alternativa | Verificar anti-cheat |
| Juegos con anti-cheat kernel | — | VM/No | Muchos no funcionan en Linux |

Portables en `E:\Installed Programs`: `grub` (temas), `Oracle VirtualBox` (→ KVM),
`scrcpy-win64-v4.0` (→ scrcpy), `sqlite` (→ sqlite3), `ventoy-1.1.18` (→ Ventoy Linux).

## 9. Instalación recomendada

```bash
# Base (script idempotente)
bash shared/scripts/linux/fedora-setup.sh --opencode --vscode

# Extras del inventario (Podman y LMMS pedidos para Linux)
sudo dnf install -y podman podman-docker podman-compose lmms \
  gimp krita inkscape blender obs-studio kdenlive audacity vlc keepassxc

# Flatpak
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub \
  com.spotify.Client com.discordapp.Discord org.telegram.desktop \
  org.kde.krita org.gimp.GIMP org.inkscape.Inkscape org.blender.Blender \
  org.audacityteam.Audacity org.kde.kdenlive com.obsproject.Studio \
  com.heroicgameslauncher.hgl org.prismlauncher.PrismLauncher \
  net.lutris.Lutris com.usebottles.bottles org.vinegarhq.Sober \
  org.onlyoffice.desktopeditors io.dbeaver.DBeaverCommunity
```

## 10. Política de sustitución y licencias

1. **Nativo primero** (repos Fedora). Si no está, Flatpak/Flathub.
2. **Web** cuando la app oficial funciona mejor que una alternativa (Canva, Office web, Photopea).
3. **Wine/Bottles** solo para herramientas sin sustituto (Screaming Frog, FL Studio si se necesita).
4. **VM Windows** para MSVC/Windows SDK, anti-cheat y software fiscal venezolano.
5. **RPM Fusion** solo para codecs/drivers con patentes (ffmpeg completo, NVIDIA); es un repo de terceros, no Fedora oficial.

Sobre Discover y Flathub: Discover es un gestor que muestra repos del sistema y
Flatpak; Flathub es el repositorio comunitario. Publicar es abierto a
desarrolladores independientes, pero pasa por revisión de manifiesto, licencias y
build reproducible. Las apps propietarias se aceptan con condiciones; no es
"subir y ya". Para MuzicMania: RPM/AppImage en GitHub Releases primero, Flatpak
después con manifiesto propio.

## 11. Pendientes

- Probar en Fedora: DBeaver + `dbvr`, ZAP, Bruno, Screaming Frog (Wine).
- Confirmar codecs H.264/AAC para WebKitGTK del launcher.
- Decidir si se mantiene Proton VPN o se usa Tailscale/WireGuard.
- Evaluar LACT/CoreCtrl para la GPU AMD.
- Documentar en `LINUX_SYSTEM.md` cualquier app que requiera VM.

---

_Última revisión: 24 nov 2026. Relacionados: `LINUX_SYSTEM.md`,
`TOOLS_SYSTEM.md`, `BRAND_PLAN.md`, `MEDIA_FORMATS_SYSTEM.md`._
