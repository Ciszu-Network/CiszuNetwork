# REMOTE_CONTROL_SYSTEM — Control Remoto de la Terminal

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: REMOTE_CONTROL_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> **Sistema**: acceso remoto a la terminal de `ciszu-pc` (Windows) desde el móvil o cualquier dispositivo externo. Solución completa en dos capas: avisos push (ntfy) + terminal real en vivo (Tailscale + OpenSSH Server + Termius + opencode `serve`/`attach`, sin WSL/tmux). Referencia técnica y guía de uso.

---

## 1. Visión general del sistema

| Capa | Qué resuelve | Herramienta | Coste | Estado |
|---|---|---|---|---|
| **1. Avisos (push)** | Enterarte al instante de que una tarea terminó / la IA te necesita | **ntfy.sh** + `scripts/ntfy-notif.js` | Gratis, sin registro | ✅ Implementado (jul 2026) |
| **2. Control (terminal real)** | Ver la CLI en vivo y escribir en ella desde el móvil | **Tailscale** + **OpenSSH Server** (Windows nativo) + **Termius** (app oficial) + **opencode `serve`/`attach`** | Gratis | ✅ Implementado y probado (ago 2026) |

**Regla de oro**: ntfy es unidireccional (solo llega el aviso); no es una terminal. Para enviar y leer comandos de verdad hace falta la capa 2. Las dos se complementan: el push despierta, la terminal deja actuar.

**Arquitectura final (Windows nativo, sin WSL/tmux):**

```
opencode serve --port 4096 --hostname 127.0.0.1   ← proceso headless persistente en el PC
   ▲ tarea programada "opencode-server-ciszu" (AtLogOn, oculto) + lanzador la arranca si falta
   │
   ├── PC local:      opencode-ciszu-pc   → opencode attach http://127.0.0.1:4096
   └── Móvil (Termius → SSH → PC :22): opencode-ciszu-cel → opencode attach http://127.0.0.1:4096
```

**Ambos clientes se anclan al MISMO servidor** → sesión única y en vivo (SSE): lo que escribes en el PC aparece en el móvil al instante y viceversa. Los dos lanzadores son idénticos (mismo attach); se diferencian solo por nombre para recordar dónde usarlos.

### Por qué esta combinación (vías evaluadas)

| Vía | Cómo se ve en el móvil | Abre puertos en el router | Complejidad | Veredicto |
|---|---|---|---|---|
| **Tailscale + OpenSSH + Termius** | App nativa de SSH (Termius) | ❌ No (red privada mesh) | Baja (3 piezas, 15 min) | ✅ **RECOMENDADA** |
| Gotty/ttyd + túnel (Cloudflare/Tailscale) | Pestaña del navegador (terminal web) | ❌ No | Media (servidor web + túnel) | 👍 Válida si no se quiere app |
| tmux + SSH + Termius | App nativa | ❌ No (con túnel) o ⚠️ Sí (port-forward) | Media (requiere tmux/WSL) | 👍 Complementaria — **descartada** (ver nota) |
| ntfy solo | Solo push, no terminal | ❌ | Mínima | ❌ No resuelve el control |
| Abrir puerto 22 al internet | Cualquier cliente SSH | ⚠️ **Sí** | Baja | ❌ Riesgo de escaneo/brute-force |

**Decisión**: Tailscale (mesh VPN WireGuard, plan Personal **gratis**: hasta 6 usuarios y 100 dispositivos, MagicDNS, tráfico cifrado de extremo a extremo) + el **OpenSSH Server nativo de Windows** (sin instalar nada de terceros) + **Termius** (app oficial SSH/SFTP para Android/iOS, plan Starter gratis con SSH, SFTP y port-forwarding; el teclado virtual cubre Tab/Ctrl/Esc y atajos).

> **WSL/tmux descartado (4 ago 2026)**: opencode en WSL tiene su propia db de sesiones y theme (`~/.config/opencode` + `~/.local/share/opencode`) separada de Windows; el repo se monta como `/mnt/e/Ciszu Network` (paths distintos a `E:\`, git "dubious ownership"); dos clientes tmux con tamaños de pantalla distintos (móvil vertical 49x34 vs PC) deformaban la TUI (caracteres corruptos); opencode ya guarda y reanuda conversaciones solo (`opencode --continue`) → tmux no aporta nada para retomar la charla.

---

## 2. Capa de avisos — ntfy.sh

ntfy es un servicio de push sin registro: la app del móvil se suscribe a un "topic" (una cadena) y cualquier script hace un simple POST HTTP para notificar. Sin cuentas, sin tokens, sin pagos (aunque tener cuenta permite tokens y sync de suscripciones — en uso desde 4 ago 2026).

**Script**: `scripts/ntfy-notif.js` — alias `pnpm notify`

```bash
pnpm notify "Título" "Mensaje"
pnpm notify "Mensaje" --priority urgent --tag warning   # flags
echo "texto" | pnpm notify "Título"                     # pipe desde stdin
pnpm notify --list                                      # lista mensajes recientes
pnpm notify --clear                                     # borra todos (requiere token)
```

**Configuración (4 ago 2026)** — topic y token privados en `NOTIFY_TOPIC` / `NOTIFY_TOKEN`:
1. `.env.local` (raíz del repo, gitignored) — leído automáticamente por el script
2. `services/supabase/.env` (vault de credenciales, gitignored + backup con `update-env-keys.js`) — misma key para respaldo
3. Sobrescritura puntual: `$env:NOTIFY_TOPIC = "otro-topic"; pnpm notify "Mensaje"`

**Puesta en marcha:**
1. Instalar la app **ntfy** en el móvil (Play Store / App Store) y en PC.
2. Iniciar sesión con el token (Settings → cuenta → Access token → pegar `NOTIFY_TOKEN`).
3. Suscribirse al topic de `NOTIFY_TOPIC` (privado tipo `ciszu-<hash-unico>`; suscripción renombrada a "Ciszu-NTFY").

El móvil recibe la notificación al instante. El topic no requiere suscripción previa del script: ntfy permite publicar sin estar suscrito. Para borrar un mensaje basta `DELETE /<topic>/<id>` con el token (el `--clear` lo hace en lote).

> ⚠️ Los mensajes borrados pueden seguir apareciendo en `--list` hasta que expire su TTL (~12 h): es el caché del servidor, no un fallo del borrado (el GET individual devuelve 404).

### 2.1 Ciclo de notificaciones — cuándo avisar (política activa desde 4 ago 2026)

El agente opencode **notifica al móvil del CEO en cada hito relevante** de una tarea. Ciclo integrado en el flujo normal, no un extra opcional.

| Momento | Ejemplo de mensaje | Prioridad | Tag |
|---|---|---|---|
| **Inicio de tarea** (investigación, refactor, deploy...) | "Tarea iniciada: <resumen>" | default | `robot` |
| **Fin de tarea** | "Tarea terminada: <resumen> — OK/fallo" | default | `white_check_mark` / `warning` |
| **Antes de pedir un acceso** (permiso/confirmación que bloquea) | "Te necesito: <qué acceso y para qué>" | high | `exclamation` |
| **Advertencia** (riesgo, cambio irreversible, nota) | "Aviso: <detalle>" | high | `warning` |
| **Error** (comando falló, deploy falló, script rompió) | "Error en <tarea>: <mensaje>" | urgent | `rotating_light` |
| **Necesidad de credential** (token, id, cuenta, OTP) | "Necesito tu <token/id>: <para qué>" | high | `key` |
| **Pregunta puntual** (decisión rápida del CEO) | "Pregunta: <decisión>" | default | `question` |

**Reglas de la política:**
1. **No spam**: un push por hito. No notificar cada herramienta/edición — solo transiciones de tarea, bloqueos y errores.
2. **Inicio y fin se emparejan**: toda tarea iniciada con push debe cerrarse con su push de fin (OK o fallo).
3. **Antes de `question`/pedir acceso**: avisar siempre un instante antes con `high`, para que el CEO sepa que llega una petición.
4. **Errores en segundo plano** (builds, migraciones, CDN): `urgent` si rompen algo; `high` si son recuperables.
5. **Idioma de los mensajes**: español, título corto (`Ciszubot`, `Ciszu Network`, `<dominio>`) y cuerpo con el resumen accionable.
6. Los pushes usan **`pnpm notify`** y heredan el reintento con backoff y el error detallado en consola (ver 2.2).

### 2.2 Robustez del script (4 ago 2026)

- **Reintentos con backoff** (`RETRY_DELAYS_MS = [1500, 4000, 10000]`): si ntfy.sh responde `429` o `5xx`, reintenta hasta 3 veces antes de fallar. Los errores del cliente (4xx distintos de 429) no se reintentan.
- **Error detallado y capturable**: el error final se imprime completo en consola (`HTTP <status> <statusText> — <cuerpo/hasta 200 chars>` o `red: <mensaje>`).

> Complemento en la misma máquina: plugin del ecosistema opencode (`kdcokenny/opencode-notify`) muestra toasts nativos de Windows cuando el agente inicia/termina tareas. No llega al teléfono, pero da visibilidad inmediata sin mirar la consola.

### 2.3 Solución de problemas en el móvil (4 ago 2026)

Diagnóstico con el Tecno Spark Go (XOS):

| Síntoma | Causa | Fix |
|---|---|---|
| Los mensajes solo aparecen al abrir la app | Instant delivery (WebSocket) caído en segundo plano | Activar **⚡ Instant delivery** en la suscripción + exención de batería |
| Notificación "Subscription service" ausente | El servicio WebSocket no está vivo | Ver notificación permanente; no ocultarla/deslizarla |
| `SocketTimeoutException` en el diálogo de error de ntfy | XOS (Tecno) mata el WebSocket al dormir el móvil | Gestor de teléfono → Batería → ntfy → **Sin restricciones** + permitir autorrestart |
| Batería <10-15% | Modo ahorro extremo de XOS suspende el servicio | No probar con batería crítica; cargar el móvil |
| Flechas rojas ↑ | Entrega OK por conexión activa (instant delivery) | Normal |
| Flechas grises ↓ / sin icono | Push aplazado por FCM (búfer hasta abrir la app) | Habilitar instant delivery (ver arriba) |

**Regla de oro operativa**: con el móvil cargado y ntfy exento de batería, los pushes urgentes llegan al instante con el teléfono minimizado.

---

## 3. Componentes

### 3.1 OpenSSH Server (nativo de Windows)

- Componente nativo de Windows: convierte el PC en servidor SSH (puerto 22). Ya viene instalado en Windows 10/11; en este PC el servicio `sshd` existe y está **Running + Automatic**.
- Instalación oficial: MSI `Microsoft.OpenSSH.Preview` (Win32-OpenSSH 10.0.0), binario en `C:\Program Files\OpenSSH\sshd.exe`.
- Config por defecto del MSI (`sshd_config_default` → `C:\ProgramData\ssh\sshd_config`) incluye la regla `Match Group administrators -> administrators_authorized_keys`.
- `DefaultShell` del sshd = `powershell.exe` (valor estándar; **NO** carga el perfil del usuario en sesiones SSH — los perfiles no se ejecutan por defecto en OpenSSH).
- Escucha en `0.0.0.0:22` y `[::]:22`; solo alcanzable desde la tailnet, no desde internet.

### 3.2 Tailscale

- Mesh VPN sin configuración de red: cada dispositivo obtiene una IP privada fija `100.x.x.x` y se conectan P2P (cifrado WireGuard) aunque estén detrás de NAT. No hace falta abrir puertos ni DNS dinámico. Apps oficiales para Windows y móvil. Plan Personal: gratis, sin tarjeta.
- PC en la tailnet: **IP `100.75.124.72`**, hostname `ciszu-pc` (v1.98.10). Verificable: `"C:\Program Files\Tailscale\tailscale.exe" status`.

### 3.3 Termius

- Cliente SSH/SFTP con apps nativas Android/iOS/desktop. Plan Starter gratis: SSH, Mosh, Telnet, port forwarding y SFTP, multi-tab, temas, claves ed25519. La bóveda cloud (sync entre dispositivos) es Pro; para un solo host no hace falta.
- En el móvil: clave privada `CISZU SSH Key` importada + host `Ciszu-PC` creado (`fplay@100.75.124.72:22`).

### 3.4 opencode serve/attach (headless)

- Servidor headless persistente: `opencode serve --port 4096 --hostname 127.0.0.1`.
- Arrancado por la tarea programada **`opencode-server-ciszu`** (AtLogOn, oculto, Limited) y por el lanzador si falta (ensure idempotente).
- Client: `opencode attach http://127.0.0.1:4096` (mismo comando desde PC y móvil).
- Las conversaciones se guardan en la db de opencode del PC (persisten entre reinicios del servidor).
- **Notas**:
  - El servidor escucha solo en `127.0.0.1` (nada expuesto a la red; el móvil llega vía SSH local). Sin `OPENCODE_SERVER_PASSWORD` (el log avisa que es "unsecured", pero ligado a loopback no es alcanzable remotamente).
  - El móvil debe usarse en **horizontal** (la TUI necesita ancho).
  - `opencode` a secas sigue disponible como instancia local independiente (sin live-sync); para la sesión compartida usar SIEMPRE un lanzador.
  - ⚠️ El tamaño de la caja de texto en el móvil **no es configurable** (el schema de TUI solo expone `prompt.max_height`/`max_width` para la pantalla de inicio, no para la caja del chat; `--mini` cambiaría toda la interfaz). Se probó y se descartó.

---

## 4. Setup / instalación

> Script reproducible y automatizado: **`scripts/setup-remote-control.ps1`** (PowerShell admin, re-ejecutable). Lo que sigue documenta la implementación real.

### Paso 1 — OpenSSH Server en el PC ✅

```powershell
# 1. Eliminar un servicio legacy roto y reinstalar con el paquete oficial (MSI Win32-OpenSSH 10.0.0)
sc.exe delete sshd
winget install --id Microsoft.OpenSSH.Preview --source winget --accept-source-agreements --accept-package-agreements --silent
# (el MSI deja el servicio sshd creado y en Automatic; binario en C:\Program Files\OpenSSH\sshd.exe)

# 2. Config por defecto del MSI (sshd_config_default -> C:\ProgramData\ssh\sshd_config)

# 3. Arrancar
sc.exe failure sshd reset= 0 actions= restart/5000/restart/5000/""/0
Start-Service sshd; Set-Service -Name sshd -StartupType Automatic
```

**Fix host keys (obligatorio si se generaron con `ssh-keygen -A`)**: las host keys generadas así quedan con owner `fplay` y permisos con acceso para el usuario; OpenSSH en contexto SYSTEM las rechaza (`WARNING: UNPROTECTED PRIVATE KEY FILE`). Fix oficial con el módulo del MSI (corrige owner + ACL):

```powershell
Import-Module 'C:\Program Files\OpenSSH\OpenSSHUtils.psm1' -Force
Repair-SshdHostKeyPermission -FilePath 'C:\ProgramData\ssh\ssh_host_ed25519_key' -Confirm:$false
Repair-SshdHostKeyPermission -FilePath 'C:\ProgramData\ssh\ssh_host_rsa_key'    -Confirm:$false
Repair-SshdHostKeyPermission -FilePath 'C:\ProgramData\ssh\ssh_host_ecdsa_key'  -Confirm:$false
Repair-SshdConfigPermission  -FilePath 'C:\ProgramData\ssh\sshd_config'         -Confirm:$false
# Resultado: owner = NT AUTHORITY\SYSTEM, solo SYSTEM + Administradores con acceso
```

### Paso 2 — Tailscale en PC y móvil ✅ (PC) / 🔄 (móvil, usuario)

1. PC: `winget install --id Tailscale.Tailscale` (v1.98.10) → `tailscale up` → login con la cuenta de Google del usuario. ✅
2. Móvil: instalar **Tailscale** de Play Store/App Store → login con la **misma cuenta** de Google.
3. **IP del PC en la tailnet: `100.75.124.72`** (hostname `ciszu-pc`).

### Paso 3 — Clave SSH para Termius ✅

1. Instalar **Termius** (Play Store / App Store), cuenta con Google (gratis).
2. La clave ed25519 **ya está generada** en el PC (`ciszu_pc_ed25519`, sin passphrase) y su pública está autorizada en `C:\ProgramData\ssh\administrators_authorized_keys`. Pegar la privada entera en Termius → *Keys* → *Import*.
3. Añadir el **Host**: Alias "Mi PC"/"Ciszu-PC", Hostname = `100.75.124.72`, Port `22`, Username = `fplay`, Key = la importada.

### Paso 4 — Verificación ✅

```powershell
whoami
Get-Service sshd
ssh -i ciszu_pc_ed25519 fplay@100.75.124.72   # → TAILNET_SSH_OK
```

Desde el móvil: tocar el host en Termius (con WiFi o 4G, en casa o en la calle) → terminal de PowerShell del PC.

---

## 5. Comandos / uso diario (PC y móvil)

### Acceso desde el PC (igual que siempre)

```powershell
opencode-ciszu-pc     # ancla al servidor compartido (sesión en vivo)
opencode              # alternativa: instancia local independiente (sin live-sync)
```

### Acceso desde el móvil (Termius) — pasos de cada vez

**Prerrequisitos (ya hechos):** app **Tailscale** instalada y logueada con la cuenta de Google del CEO; app **Termius** con la clave privada `CISZU SSH Key` importada y el host `Ciszu-PC` creado (`fplay@100.75.124.72:22`).

1. Abrir **Termius**.
2. Tocar el host **Ciszu-PC**.
3. Escribir el comando que retoma tu conversación:

    ```
    opencode-ciszu-cel
    ```

    (un lanzador del PC, ubicado en `C:\Users\fplay\opencode-ciszu-cel.cmd` — carpeta añadida al PATH de usuario — que arranca el servidor si no está y hace `opencode attach http://127.0.0.1:4096`). Ya no hace falta `.\`.

4. Ya estás dentro de opencode, anclado al **servidor compartido**: la MISMA sesión que el PC, en vivo.
5. Al terminar: **cerrar la app**. El servidor sigue corriendo en el PC y la conversación queda guardada.
6. Para volver: tocar el host → `opencode-ciszu-cel` de nuevo → vuelves a la misma sesión en vivo.

> ⚠️ Girar el móvil a **horizontal**: la TUI de opencode necesita ancho; en vertical se ve pequeña/cortada.

### Lanzadores (resumen)

- **Entrar (attach, sin matar)**: `ciszu-ai`, `ciszu-ai-pc`, `ciszu-ai-cel`, `opencode-ciszu-pc`, `opencode-ciszu-cel`, `opencode-run`
- **Arrancar/garantizar (sin attach)**: `ciszu-ai-start`, `opencode-ciszu-start`
- **Detener**: `ciszu-ai-stop`, `opencode-ciszu-stop`
- **Reiniciar (explícito)**: `ciszu-ai-reset`, `opencode-ciszu-reset` (= stop + ensure + attach)
- Todos existen en `.cmd` y `.bat`, en `C:\Users\fplay\` y `AppData\Roaming\npm\` (stubs delegantes).

---

## 6. El lanzador `ciszu-ai`

**Tool canónica**: `tools/ciszu-ai/ciszu-ai.cmd` (lanzador oficial, subcomandos `server`/`stop`/`reset`; **default = ensure + attach SIN matar el listener**). `tools/ciszu-ai/opencode-run.cmd` es alias de compatibilidad que delega en `ciszu-ai`.

- **`tools/ciszu-ai/ensure-server.ps1`** — script idempotente: si `127.0.0.1:4096` no responde, arranca `opencode serve` oculto (logs en `E:\Ciszu Network\.opencode\temp\opencode-server{,-err}.log`). Rutas derivadas del repo, params `-Port/-Exe`; valida que `opencode.exe` sea un PE real (>1 KB, sig `MZ/PE`) y repara solo con el postinstall si está corrupto. Espejo: `C:\Users\fplay\ciszu-ai\ensure-server.ps1` (con `-RepoRoot`). Lo usa el lanzador y la tarea programada.
- **Stubs delegantes** (PATH de usuario, en `AppData\Roaming\npm` y `C:\Users\fplay`, en `.cmd` y `.bat`): llaman al **espejo sin espacios** `C:\Users\fplay\ciszu-ai\ciszu-ai.cmd` (el path `E:\Ciszu Network` con espacios rompe cmd: "E:\Ciszu no se reconoce"). Hay también espejo `C:\Users\fplay\ciszu-ai\`.
- **El reinicio es SIEMPRE explícito** (`ciszu-ai reset`); el default NO reinicia el server — solo ensure (arranca si no responde) + `opencode attach`.
- **Sesión local**: abre `attach-session.ps1` (ensure-server.ps1 idempotente + `opencode attach http://127.0.0.1:4096`) en PowerShell dentro de **Windows Terminal** (`wt.exe`; si no eres admin relanza `wt.exe -Verb RunAs` (UAC), si ya eres admin abre `wt.exe` directo; la consola SSH/Termius NO toca WT y NO eleva — detecta `SESSIONNAME` distinto de `Console`). `chcp 65001` al inicio. El server `opencode serve :4096` corre sin elevar (tarea `opencode-server-ciszu` InteractiveToken) → matarlo no requiere admin.
- **Autocompletado PowerShell** en `$PROFILE` (`Register-ArgumentCompleter` para subcomandos `start/server/stop/reset`) y **comandos opencode**: `/server-start`, `/server-stop`, `/server-reset` (`.opencode/command/` + copia global; **requieren reinicio del server si se cambian**).
- **Snippets móvil (Termius)**: en `archives/backups/termius/snippets.json`.
- **Gotchas del parser cmd.exe**: los `.cmd` requieren **finales de línea CRLF** (Git avisa "LF will be replaced by CRLF"; con LF, `cmd` falla con "No se esperaba ... en este momento" y la ventana se cierra al instante). **NUNCA usar paréntesis dentro de `echo ...` en un bloque `if (...) ( ... )`** — rompe el parser; el script usa `goto`/etiquetas en lugar de bloques anidados.

---

## 7. Troubleshooting (gotchas)

### 7.1 Firewall — perfil de la regla sshd

Las reglas de firewall `OpenSSH SSH Server (sshd)` vienen por defecto con `Profile: Private`; el tráfico entrante por el adaptador Tailscale puede clasificarse en otro perfil y Windows lo bloquea en silencio (síntoma: Termius se queda en "conectando…" y timeout, aunque `tailscale ping` y el escaneo local del puerto 22 funcionen). Fix:

```powershell
Set-NetFirewallRule -DisplayName "OpenSSH SSH Server (sshd)" -Profile Any
```

Tras reinicios/crash del sshd, `Restart-Service sshd -Force` limpia listeners zombis.

### 7.2 Host keys — crash-loop (evento 7031)

Si el servicio sshd entra en crash-loop (`service terminated unexpectedly`) con `WARNING: UNPROTECTED PRIVATE KEY FILE`, la causa es owner/permisos de las host keys → **NUNCA crear con `ssh-keygen -A`** en `C:\ProgramData\ssh` sin reparar. Fix:

```powershell
Import-Module 'C:\Program Files\OpenSSH\OpenSSHUtils.psm1'
Repair-SshdHostKeyPermission   # para cada ssh_host_*_key
Repair-SshdConfigPermission    # owner SYSTEM, solo SYSTEM+Admins con acceso
```

### 7.3 Instalación legacy de OpenSSH

Si el servicio sshd existe pero la capability `OpenSSH.Server` = `NotPresent` (binario roto en `System32`), borrarlo (`sc.exe delete sshd`) y reinstalar con winget (el MSI crea el servicio correctamente).

### 7.4 Tailscale login headless

`tailscale up` abre el navegador y caduca la URL si no se completa pronto; para rotar, ver `https://login.tailscale.com/a/<hash>` en stdout.

### 7.5 SSH sin perfil de PowerShell

OpenSSH en Windows **no carga el perfil de PowerShell del usuario** en sesiones SSH: los aliases/funciones del perfil NO existen al conectar — usar scripts `.cmd` con ruta absoluta en su lugar. `C:\Users\fplay` está en el PATH de usuario → los lanzadores `.cmd` ahí (p.ej. `opencode-ciszu-pc`, `opencode-ciszu-cel`) se ejecutan escribiendo solo su nombre, sin `.\`.

### 7.6 Test interactivo con `ssh -tt` directo

Los `Start-Job` de PowerShell no preservan el pty y dan falsos negativos del attach — probar siempre con `ssh -tt` interactivo.

### 7.7 Fallos comunes (móvil)

| Síntoma | Causa probable | Solución |
|---|---|---|
| "Connection refused" / no conecta | Tailscale apagado en PC o móvil | Abrir Tailscale en el dispositivo y esperar a que reconecte |
| Conecta pero a PowerShell normal (sin opencode) | Aún no escribiste `opencode-ciszu-cel` | Escribir `opencode-ciszu-cel` |
| La pantalla se ve pequeña/cortada | Móvil en vertical | Girar a horizontal |
| "Permission denied (publickey)" | La clave privada no está en Termius | Revisar Keys → `CISZU SSH Key` presente y seleccionada en el host |
| Al escribir salen caracteres raros | Móvil en vertical (TUI muy estrecha) | Girar a horizontal |
| "Connection refused" a 127.0.0.1:4096 | El servidor headless no está corriendo (se apagó sin reiniciar sesión) | Lanzar `opencode-ciszu-pc` o `opencode-ciszu-cel` de nuevo: ellos arrancan el servidor si no existe |

### 7.8 Protocolos / verificaciones

- **Verificación OpenSSH**: `Get-Service sshd` → `Running` + `Automatic`; escucha en `0.0.0.0:22` y `[::]:22`; login OK con clave ed25519 (`SSH_OK — ciszu-pc\fplay`).
- **Verificación host keys**: owner = `NT AUTHORITY\SYSTEM`, solo SYSTEM + Administradores con acceso.
- **Verificación Tailscale**: `"C:\Program Files\Tailscale\tailscale.exe" status` → IP `100.75.124.72`, hostname `ciszu-pc`.
- **Verificación SSH por tailnet**: `ssh -i ciszu_pc_ed25519 fplay@100.75.124.72` → `TAILNET_SSH_OK`.
- **Verificación live-sync**: Termius → `Ciszu-PC` → `opencode-ciszu-cel` → seleccionar sesión → un mensaje escrito en el PC aparece al instante en el teléfono y viceversa. Usar en horizontal.
- **Bot del opencode**: `node tools/tts-stt-ai/tmp/test-plugin.js` para smoke test del plugin de voz sin TUI.

---

## 8. Guía práctica para el CEO

**Para quién**: Ciszuko (CEO). Uso personal — acceso a la terminal de IA del PC desde el móvil.

### Qué es esto

El PC (ciszu-pc) expone **opencode nativo de Windows** (la IA que trabaja en el monorepo) alcanzable desde el móvil mediante SSH. Es el MISMO opencode que usas en el PC: mismo theme, mismo historial de conversaciones y exactamente la misma carpeta `E:\Ciszu Network`. Ambos lanzadores se anclan al MISMO servidor → misma sesión, mismo historial, en vivo. No hay WSL ni tmux de por medio: la sincronización la hace el propio servidor de opencode (`serve` + `attach`), sin sobreingeniería.

### Qué pasa si… (FAQ)

| Evento | Resultado |
|---|---|
| Cierro Tailscale en el teléfono | No conectas hasta reabrirlo; al reabrirlo todo vuelve solo |
| Cierro Tailscale en el PC | Igual que arriba; reconecta al abrir la app |
| Reinicio el PC | `sshd` + Tailscale arrancan solos (servicios Automatic). El servidor opencode lo levanta la tarea programada `opencode-server-ciszu` al iniciar sesión. Tus conversaciones siguen en disco (se reanudan con `opencode-ciszu-pc`) |
| Apago el PC | Nada conecta hasta encenderlo |
| Trabajo en el PC y entra el móvil | ✅ Sin problema y sin duplicar: ambos se anclan al mismo servidor → misma sesión, en vivo, en los dos a la vez |

### Referencias

- Implementación técnica completa y troubleshooting: `projects/ciszu/docs/documentation/REMOTE_CONTROL_SYSTEM.md`
- Script reproducible de la infraestructura: `scripts/setup-remote-control.ps1`
- Lanzadores (ninguno reinicia por defecto: solo ensure si falta + `opencode attach http://127.0.0.1:4096`; para reiniciar usar los `-reset`): **Entrar (PC)** `ciszu-ai-pc`/`opencode-ciszu-pc` (alias → tool oficial `C:\Users\fplay\ciszu-ai\ciszu-ai.cmd`, espejo sin espacios) · **Entrar (móvil)** `ciszu-ai-cel`/`opencode-ciszu-cel` · **Arrancar/garantizar** `ciszu-ai-start`/`opencode-ciszu-start` · **Detener** `ciszu-ai-stop`/`opencode-ciszu-stop` · **Reiniciar (explícito)** `ciszu-ai-reset`/`opencode-ciszu-reset`. Todos existen en `.cmd` y `.bat`, en `C:\Users\fplay\` y `AppData\Roaming\npm\`; tool oficial en `E:\Ciszu Network\tools\ciszu-ai\ciszu-ai.cmd` (subcomandos `server`/`stop`/`reset`).
- Tool del servidor headless: `E:\Ciszu Network\tools\ciszu-ai\ensure-server.ps1` (espejo `C:\Users\fplay\ciszu-ai\ensure-server.ps1` con `-RepoRoot`; tarea programada `opencode-server-ciszu` al iniciar sesión).
- Host del PC en la tailnet: `100.75.124.72` (hostname `ciszu-pc`).

---

## 9. Seguridad

- **Nada queda expuesto a internet**: Tailscale cifra todo (WireGuard) y no hay puerto abierto en el router. Aunque el puerto 22 del PC esté abierto en el firewall de Windows, solo es alcanzable desde la tailnet (IP `100.x.x.x`), no desde internet.
- **Autenticación por clave SSH** (ed25519) en lugar de contraseña: se elimina el riesgo de brute-force con credenciales. La clave privada vive solo en el móvil (protegible con huella/PIN de Termius).
- 🔑 **La clave privada `ciszu_pc_ed25519` NO debe copiarse en ningún documento/chat/doc.** Vive solo en:
  - **Termius (móvil)** — protegida con huella/PIN de la app.
  - **Copia local del PC** en `E:\Ciszu Network\.opencode\temp\termius-key\` (carpeta gitignored, fuera de git).
  - Opcional recomendado: subir esa copia local a un gestor de contraseñas (vault) y borrarla del disco.
- **Account Tailscale personal**: una sola cuenta con 2FA, control de dispositivos desde la consola admin (`https://login.tailscale.com/admin`) — se puede revocar el móvil al instante (ya hecho). Si el móvil se pierde: revocar el dispositivo desde la consola admin.
- No usar en redes públicas desconocidas **sin** activar Tailscale como todo-conduit si se prefiere; por defecto el tráfico SSH ya va cifrado por el mesh.
- ⚠️ El token del bot y demás secrets NO deben escribirse nunca en la terminal remota de forma que queden en historial público; el PC es el mismo, así que no cambia la política de credenciales del repo.
- El servidor headless escucha solo en `127.0.0.1` (sin `OPENCODE_SERVER_PASSWORD`): ligado a loopback, no alcanzable remotamente.

---

## 10. Estado actual

- ✅ `scripts/ntfy-notif.js` (capa 1 — ntfy) + alias `pnpm notify` con envío/`--list`/`--clear`/pipe/flags; retry/backoff + error capturable (commit `4d46698`).
- ✅ Ciclo de notificaciones activo (sección 2.1) + instant delivery operativo en el móvil.
- ✅ Topic + token privados en `.env.local` y `services/supabase/.env` (vault) — push real probado; suscripción "Ciszu-NTFY" en móvil y PC.
- ✅ **OpenSSH Server** v10.0.0 (MSI oficial, `Running` + `Automatic`, escucha en 22, `DefaultShell` = PowerShell); host keys reparadas (owner SYSTEM).
- ✅ **Tailscale** instalado y logueado en PC (v1.98.10, IP `100.75.124.72`).
- ✅ Clave ed25519 `ciszu_pc_ed25519` generada y autorizada (`administrators_authorized_keys`); SSH probado por tailnet OK.
- ✅ **Script reproducible**: `scripts/setup-remote-control.ps1`.
- ✅ **Apps en el móvil**: Tailscale (misma cuenta, tailnet activa) y Termius (clave `CISZU SSH Key` importada, host `Ciszu-PC` funcional).
- ✅ **Enfoque final = opencode NATIVO de Windows con `serve` + `attach`**: servidor headless operativo + tarea programada `opencode-server-ciszu` (AtLogOn) + lanzadores con ensure idempotente. WSL/tmux eliminado.
- ✅ **Prueba real desde el móvil OK (4 ago 2026)**: live-sync confirmado (mensaje escrito en el PC apareció al instante en el teléfono y viceversa).
- ✅ **Lanzadores en PATH de usuario + stubs en `AppData\Roaming\npm`** (resuelven en cualquier terminal, incluso con PATH viejo en memoria).

**Pendiente solo del usuario**: ninguno — el acceso remoto con sesión en vivo está operativo y probado desde el móvil.

Coste total del proyecto: **0 €** (las tres herramientas tienen plan gratis suficiente).
