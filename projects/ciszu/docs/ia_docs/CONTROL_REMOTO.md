# Control remoto de la terminal + notificaciones al móvil (ago 2026)

> **Guía práctica rápida (uso CEO)**: ver `GUIA_ACCESO_REMOTO_CEO.md` — pasos de acceso al día, FAQ y seguridad. Este documento es la referencia técnica completa.

Investigación solicitada (toDo.md → Prioridad Alta → "ecosistema de túneles para la consola remota"): poder **ver y accionar la terminal de este PC desde el móvil** (o cualquier dispositivo externo) con una app oficial, sin sobreingeniería. Este documento reemplaza al viejo `NOTIFICACIONES.md` (que solo cubría el push de avisos) con la solución completa en dos capas.

## Resumen — solución en dos capas complementarias

| Capa | Qué resuelve | Herramienta | Coste | Estado |
|---|---|---|---|---|
| **1. Avisos (push)** | Enterarte al instante de que una tarea terminó / la IA te necesita | **ntfy.sh** + `scripts/ntfy-notif.js` | Gratis, sin registro | ✅ Implementado (jul 2026) |
| **2. Control (terminal real)** | Ver la CLI en vivo y escribir en ella desde el móvil | **Tailscale** + **OpenSSH Server** (Windows nativo) + **Termius** (app oficial) + **tmux en WSL** para sesiones persistentes | Gratis | ✅ Implementado y probado (ago 2026) |

**Regla de oro**: ntfy es unidireccional (solo te llega el aviso); no es una terminal. Para enviar y leer comandos de verdad hace falta la capa 2. Las dos se complementan: el push te despierta, la terminal te deja actuar.

---

## 1. Capa de avisos — ntfy.sh (implementada)

ntfy es un servicio de push sin registro: la app del móvil se suscribe a un "topic" (una cadena) y cualquier script hace un simple POST HTTP para notificar. Sin cuentas, sin tokens, sin pagos (aunque tener cuenta permite tokens y sync de suscripciones — en uso desde 4 ago 2026).

**Script**: `scripts/ntfy-notif.js` — alias `pnpm notify`

```bash
pnpm notify "Título" "Mensaje"
pnpm notify "Mensaje" --priority urgent --tag warning   # flags
echo "texto" | pnpm notify "Título"                     # pipe desde stdin
pnpm notify --list                                      # lista mensajes recientes
pnpm notify --clear                                     # borra todos (requiere token)
```

**Configuración (4 ago 2026)**: topic y token privados en `NOTIFY_TOPIC` / `NOTIFY_TOKEN`:
1. `.env.local` (raíz del repo, gitignored) — leído automáticamente por el script
2. `services/supabase/.env` (vault de credenciales, gitignored + backup con `update-env-keys.js`) — misma key para respaldo
3. Sobrescritura puntual: `$env:NOTIFY_TOPIC = "otro-topic"; pnpm notify "Mensaje"`

**Puesta en marcha:**
1. Instalar la app **ntfy** en el móvil (Play Store / App Store) y en PC.
2. Iniciar sesión con el token (Settings → cuenta → Access token → pegar `NOTIFY_TOKEN`).
3. Suscribirse al topic de `NOTIFY_TOPIC` (privado tipo `ciszu-<hash-unico>`; suscripción renombrada a "Ciszu-NTFY").

El móvil recibe la notificación al instante. El topic no requiere suscripción previa del script: ntfy permite publicar sin estar suscrito, así que cualquiera de las tareas del bot/agente puede llamar a este script al terminar (builds, deploys, migraciones, cargas CDN). Para borrar un mensaje basta `DELETE /<topic>/<id>` con el token (el `--clear` lo hace en lote).

> ⚠️ Los mensajes borrados pueden seguir apareciendo en `--list` hasta que expire su TTL (~12 h): es el caché del servidor, no un fallo del borrado (el GET individual devuelve 404).

> Complemento en la misma máquina: plugin del ecosistema opencode (`kdcokenny/opencode-notify`) muestra toasts nativos de Windows cuando el agente inicia/termina tareas. No llega al teléfono, pero da visibilidad inmediata sin mirar la consola.

---

## 2. Capa de control — Tailscale + OpenSSH + Termius (por implementar)

### 2.1 Por qué esta combinación (y no otras)

El objetivo es una **app oficial nativa** en el móvil (Android/iOS), segura, sin abrir puertos al router, y con la menor complejidad posible. Comparativa de vías evaluadas:

| Vía | Cómo se ve en el móvil | Abre puertos en el router | Complejidad | Veredicto |
|---|---|---|---|---|
| **Tailscale + OpenSSH + Termius** | App nativa de SSH (Termius) | ❌ No (red privada mesh) | Baja (3 piezas, 15 min) | ✅ **RECOMENDADA** |
| Gotty/ttyd + túnel (Cloudflare/Tailscale) | Pestaña del navegador (terminal web) | ❌ No | Media (servidor web + túnel) | 👍 Válida si no se quiere app |
| tmux + SSH + Termius | App nativa | ❌ No (con túnel) o ⚠️ Sí (port-forward) | Media (requiere tmux/WSL) | 👍 Complementaria (sesiones persistentes) |
| ntfy solo | Solo push, no terminal | ❌ | Mínima | ❌ No resuelve el control |
| Abrir puerto 22 al internet | Cualquier cliente SSH | ⚠️ **Sí** | Baja | ❌ Riesgo de escaneo/brute-force |

**Decisión**: Tailscale (red privada virtual tipo WireGuard, plan Personal **gratis**: hasta 6 usuarios y 100 dispositivos, MagicDNS, tráfico cifrado de extremo a extremo) + el **OpenSSH Server nativo de Windows** (sin instalar nada de terceros) + **Termius** (app oficial SSH/SFTP para Android/iOS, plan Starter gratis con SSH, SFTP y port-forwarding; el teclado virtual cubre Tab/Ctrl/Esc y atajos).

### 2.2 Qué es cada pieza

- **Tailscale** (`tailscale.com`): mesh VPN sin configuración de red. Cada dispositivo obtiene una IP privada fija `100.x.x.x` y se conectan directo entre sí (P2P, cifrado WireGuard) aunque estén detrás de NAT. No hace falta abrir puertos ni DNS dinámico. Apps oficiales para Windows y móvil. Plan Personal: gratis, sin tarjeta.
- **OpenSSH Server** (componente nativo de Windows): convierte el PC en servidor SSH (puerto 22). Ya viene instalado en Windows 10/11 — en este PC el servicio `sshd` **existe pero está detenido y sin configurar** (falta `C:\ProgramData\ssh\sshd_config`), y la regla de firewall `OpenSSH SSH Server (sshd)` **ya está habilitada** (perfil Private).
- **Termius** (`termius.com`): cliente SSH/SFTP con apps nativas Android/iOS/desktop. Plan Starter gratis: SSH, Mosh, Telnet, port forwarding y SFTP, multi-tab, temas, claves ed25519. La bóveda cloud (sync entre dispositivos) es Pro; para un solo host no hace falta.

### 2.3 Cómo se implementó (3 ago 2026 — HECHO)

> Script reproducible y automatizado: `scripts/setup-remote-control.ps1` (PowerShell admin, re-ejecutable). Lo que sigue documenta la implementación real.

#### Paso 1 — OpenSSH Server en el PC ✅

El PC tenía una instalación **legada rota** (binario 9.5.5.1 en `System32` con capability `NotPresent`; el servicio moría al arrancar, evento 7031 en crash-loop). Se resolvió así:

```powershell
# 1. Eliminar el servicio roto y reinstalar con el paquete oficial (MSI Win32-OpenSSH 10.0.0)
sc.exe delete sshd
winget install --id Microsoft.OpenSSH.Preview --source winget --accept-source-agreements --accept-package-agreements --silent
# (el MSI deja el servicio sshd creado y en Automatic; binario en C:\Program Files\OpenSSH\sshd.exe)

# 2. Config por defecto del MSI (sshd_config_default -> C:\ProgramData\ssh\sshd_config)
#    Incluye la regla "Match Group administrators -> administrators_authorized_keys"

# 3. Arrancar
sc.exe failure sshd reset= 0 actions= restart/5000/restart/5000/""/0
Start-Service sshd; Set-Service -Name sshd -StartupType Automatic
```

⚠️ **Bug crítico encontrado**: el servicio arrancaba y moría en loop (7031 ×754) con `WARNING: UNPROTECTED PRIVATE KEY FILE`. Causa: las host keys generadas con `ssh-keygen -A` tenían **owner `fplay`** y permisos con acceso para el usuario → OpenSSH en contexto SYSTEM las rechaza. Fix oficial (clave del problema): usar el módulo del MSI, que corrige owner + ACL:

```powershell
Import-Module 'C:\Program Files\OpenSSH\OpenSSHUtils.psm1' -Force
Repair-SshdHostKeyPermission -FilePath 'C:\ProgramData\ssh\ssh_host_ed25519_key' -Confirm:$false
Repair-SshdHostKeyPermission -FilePath 'C:\ProgramData\ssh\ssh_host_rsa_key'    -Confirm:$false
Repair-SshdHostKeyPermission -FilePath 'C:\ProgramData\ssh\ssh_host_ecdsa_key'  -Confirm:$false
Repair-SshdConfigPermission  -FilePath 'C:\ProgramData\ssh\sshd_config'         -Confirm:$false
# Resultado: owner = NT AUTHORITY\SYSTEM, solo SYSTEM + Administradores con acceso
```

**Estado verificado**: `sshd Running + Automatic`, escucha en `0.0.0.0:22` y `[::]:22`, login OK con clave ed25519 (`SSH_OK — ciszu-pc\fplay`). Regla firewall `OpenSSH SSH Server (sshd)` ya habilitada en Private (solo alcanzable desde la tailnet, no desde internet).

#### Paso 2 — Tailscale en PC y móvil ✅ (PC) / 🔄 (móvil, usuario)

1. PC: `winget install --id Tailscale.Tailscale` (v1.98.10) → `tailscale up` → login con cuenta de Google del usuario. ✅
2. Móvil: instalar **Tailscale** de Play Store/App Store → login con la **misma cuenta** de Google. (pendiente usuario)
3. **IP del PC en la tailnet: `100.75.124.72`** (hostname `ciszu-pc`). Verificable: `"C:\Program Files\Tailscale\tailscale.exe" status`.

#### Paso 3 — Clave SSH para Termius ✅ (clave lista, app pendiente usuario)

1. Instalar **Termius** (Play Store / App Store), cuenta con Google (gratis).
2. La clave ed25519 **ya está generada** en el PC (`ciszu_pc_ed25519`, sin passphrase) y su pública está autorizada en `C:\ProgramData\ssh\administrators_authorized_keys`. El usuario la pega entera en Termius → *Keys* → *Import*.
3. Añadir el **Host**: Alias "Mi PC", Hostname = `100.75.124.72`, Port `22`, Username = `fplay`, Key = la importada.

#### Paso 4 — Probar ✅ (desde el PC) / pendiente (desde el móvil)

SSH por la IP tailnet ya probado desde el PC: `ssh -i ciszu_pc_ed25519 fplay@100.75.124.72` → `TAILNET_SSH_OK`. Desde el móvil: tocar el host en Termius (con WiFi o 4G, en casa o en la calle) → terminal de PowerShell del PC:

```powershell
whoami
Get-Service sshd
```

### 2.4 Sesiones persistentes — opencode NATIVO de Windows (decidido 4 ago 2026)

**Decisión final tras probar WSL+tmux**: se descartó WSL/tmux y se usa **opencode nativo de Windows directamente**.

**Por qué se descartó WSL/tmux** (lecciones aprendidas):
- opencode en WSL tiene su **propia db de sesiones y theme** (`~/.config/opencode` + `~/.local/share/opencode`) — separada de la de Windows (4 GB con todo el historial). Migrarla era inviable.
- El repo se monta como `/mnt/e/Ciszu Network` (paths distintos a `E:\`), con git "dubious ownership" y fricción general.
- Dos clientes tmux con tamaños de pantalla distintos (móvil vertical 49x34 vs PC) **deformaban la TUI** (caracteres corruptos `111/1111/...`).
- opencode 1.18.12 ya guarda y reanuda conversaciones solo (`opencode --continue`) → tmux no aporta nada para el caso de uso (retomar la charla).

**Arquitectura final (serve + attach, sin WSL):**

```
opencode serve --port 4096 --hostname 127.0.0.1   ← proceso headless persistente en el PC
   ▲ tarea programada "opencode-server-ciszu" (AtLogOn, oculto) + lanzador la arranca si falta
   │
   ├── PC local:      opencode-ciszu-pc   → opencode attach http://127.0.0.1:4096
   └── Móvil (Termius → SSH → PC :22): opencode-ciszu-cel → opencode attach http://127.0.0.1:4096
```

**Ambos clientes se anclan al MISMO servidor** → la sesión es única y en vivo (SSE): lo que escribes en el PC aparece en el móvil al instante y viceversa. Los dos lanzadores son idénticos (mismo attach); se diferencian solo por nombre para recordar dónde usarlos.

**Piezas configuradas:**
1. `DefaultShell` del sshd = `powershell.exe` (valor estándar; **NO** cargar el perfil del usuario en sesiones SSH — los perfiles no se ejecutan por defecto en OpenSSH).
2. `C:\Users\fplay\opencode-server-ensure.ps1` — script idempotente: si 127.0.0.1:4096 no responde, arranca `opencode serve` oculto (logs en `E:\Ciszu Network\.opencode-tmp\opencode-server{,-err}.log`). Lo usa el lanzador y la tarea programada.
3. Tarea programada **`opencode-server-ciszu`** (AtLogOn, oculto, Limited): arranca el servidor headless al iniciar sesión → el móvil siempre lo encuentra.
4. Lanzadores (PATH de usuario + stub en `AppData\Roaming\npm` para resolver en cualquier terminal): ejecutan el ensure y luego `opencode attach http://127.0.0.1:4096`.
   - PC: `C:\Users\fplay\opencode-ciszu-pc.cmd`
   - Móvil: `C:\Users\fplay\opencode-ciszu-cel.cmd`
5. Las conversaciones se guardan en la db de opencode del PC (persisten entre reinicios del servidor).

**Notas**:
- El servidor escucha solo en `127.0.0.1` (nada expuesto a la red; el móvil llega vía SSH local). Sin `OPENCODE_SERVER_PASSWORD` (el servidor avisa en el log que es "unsecured", pero al estar ligado a loopback no es alcanzable remotamente).
- El móvil debe usarse en **horizontal** (la TUI necesita ancho).
- `opencode` a secas sigue disponible como instancia local independiente (sin live-sync); para la sesión compartida usar SIEMPRE un lanzador.
- ⚠️ El tamaño de la caja de texto en el móvil **no es configurable** (el schema de TUI solo expone `prompt.max_height`/`max_width` para la pantalla de inicio, no para la caja del chat; `--mini` cambiaría toda la interfaz). Se probó y se descartó.

---

## 3. Seguridad

- **Nada queda expuesto a internet**: Tailscale cifra todo (WireGuard) y no hay puerto abierto en el router. Aunque el puerto 22 del PC esté abierto en el firewall de Windows, solo es alcanzable desde la tailnet (IP `100.x.x.x`), no desde internet.
- **Autenticación por clave SSH** (ed25519) en lugar de contraseña: se elimina el riesgo de brute-force con credenciales. La clave privada vive solo en el móvil (protegible con huella/PIN de Termius).
- **Account Tailscale personal**: una sola cuenta con 2FA, control de dispositivos desde la consola admin (se puede revocar el móvil al instante).
- No usar en redes públicas desconocidas **sin** activar Tailscale como todo-conduit si se prefiere; por defecto el tráfico SSH ya va cifrado por el mesh.
- ⚠️ El token del bot y demás secrets NO deben nunca escribirse en la terminal remota de forma que queden en historial público; el PC es el mismo, así que no cambia la política de credenciales del repo.

## 4. Estado actual (4 ago 2026)

- [x] `scripts/ntfy-notif.js` creado y documentado (capa 1 — ntfy) + alias `pnpm notify` con envío/`--list`/`--clear`/pipe/flags
- [x] Topic + token privados configurados en `.env.local` y en `services/supabase/.env` (vault) — probado con push real (4 ago 2026)
- [x] Suscripción "Ciszu-NTFY" vinculada en móvil y PC (login con access token) — recepción verificada
- [x] **OpenSSH Server instalado y corriendo** (v10.0.0 MSI oficial, `Running` + `Automatic`, escucha en 22, `DefaultShell` = PowerShell)
- [x] **Bug host keys resuelto** (owner SYSTEM + Repair-SshdHostKeyPermission) — ver paso 1
- [x] **Tailscale instalado y logueado en PC** (v1.98.10, IP `100.75.124.72`)
- [x] **Clave ed25519 generada y autorizada** (`administrators_authorized_keys`); SSH probado por tailnet OK
- [x] **Script reproducible**: `scripts/setup-remote-control.ps1`
- [x] **Apps en el móvil**: Tailscale (misma cuenta, tailnet activa) y Termius (clave `CISZU SSH Key` importada, host `Ciszu-PC` funcional)
- [x] **Enfoque final = opencode NATIVO de Windows con `serve` + `attach`** (SSH → PowerShell → `opencode-ciszu-pc` → `opencode attach http://127.0.0.1:4096`). Misma sesión en vivo en PC y móvil vía servidor headless. WSL/tmux eliminado (no aportaba y duplicaba historial/theme). Ver 2.4.
- [x] **Servidor headless operativo**: `opencode serve --port 4096` corriendo + tarea programada `opencode-server-ciszu` (AtLogOn) + lanzador `opencode-ciszu-pc.cmd` con ensure idempotente. Probado vía SSH (la TUI ancla al servidor).
- [x] **Prueba real desde el móvil OK (4 ago 2026)**: Termius → `Ciszu-PC` → `opencode-ciszu-cel` → seleccionar sesión → **live-sync confirmado** (mensaje escrito en el PC apareció al instante en el teléfono y viceversa). Usar en horizontal.
- [x] **Lanzador en PATH de usuario + stub en `AppData\Roaming\npm`** (resuelve en cualquier terminal, incluso con PATH viejo en memoria)

**Pendiente solo del usuario**: ninguno — el acceso remoto con sesión en vivo está operativo y probado desde el móvil.

Coste total del proyecto: **0 €** (las tres herramientas tienen plan gratis suficiente).
