# REMOTE_CONTROL_SYSTEM — Control remoto con OpenCode App + Tailscale

Versión: 3.0.0
Actualización: 2026-11-22
Identificador: REMOTE_CONTROL_SYSTEM_V3.0.0_2026_11_22_ciszunetwork

> **Sistema**: acceso remoto al agente OpenCode del PC desde el móvil usando **Tailscale**
> y la **OpenCode App**. Ya no se usa una terminal SSH de terceros: el móvil se conecta
> directamente al servidor OpenCode compartido. Los avisos siguen saliendo por **ntfy**.

## 1. Arquitectura

```text
PC (Ciszu-PC)
  opencode serve --port 7777 --hostname 0.0.0.0
      ▲
      │ Tailscale (WireGuard)
      │
Móvil: Tailscale + OpenCode App
      └── enlace de emparejamiento /auth/connect/... (un solo uso, 5 min)
```

- El servidor OpenCode es el mismo que usa la TUI del PC: misma sesión, mismo historial y
  mismos agentes.
- El móvil no ejecuta una terminal SSH. La OpenCode App se conecta al servidor por
  Tailscale y queda autenticada con el enlace de emparejamiento.
- El servidor escucha en `127.0.0.1` por defecto. `ciszu-ai pair` lo abre en `0.0.0.0`
  temporalmente para que el móvil pueda alcanzarlo por Wi-Fi o Tailscale.
- Los avisos de tareas terminadas, fallos y recordatorios usan `ntfy.sh`; no dependen de
  la app ni de la sesión abierta.

## 2. Componentes

| Componente | Uso | Estado |
|---|---|---|
| **Tailscale** | Red privada mesh entre PC y móvil | ✅ Activo |
| **OpenCode App** | Cliente móvil que se conecta al servidor | ✅ Instalada |
| **OpenCode server** | Servidor compartido en el PC | ✅ Puerto 7777 |
| **ntfy** | Avisos push unidireccionales | ✅ Activo |
| **`ciszu-ai pair`** | Genera enlaces de emparejamiento | ✅ Activo |

## 3. Requisitos

- Tailscale instalado y con la misma cuenta/tailnet en PC y móvil.
- OpenCode App instalada en el móvil.
- Servidor OpenCode V2 funcionando en el PC.
- `OPENCODE_PASSWORD` definida en el entorno del usuario del PC.
- Firewall de Windows permitiendo `opencode.exe` en redes privadas y Tailscale.
- `ciszu-ai` en el PATH (o usar la ruta completa al `.cmd`).

## 4. Arranque del servidor

```powershell
ciszu-ai start
```

o, si el comando no está en el PATH:

```powershell
& "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" server
```

El servidor queda en:

```text
http://127.0.0.1:7777
```

El bind se guarda en:

```text
%LOCALAPPDATA%\ciszu-ai\server-hostname.txt
```

Valores posibles:

- `127.0.0.1` → solo PC.
- `0.0.0.0` → Wi-Fi/LAN y Tailscale.

## 5. Emparejar el móvil

En el PC:

```powershell
ciszu-ai pair
```

El comando:

1. Garantiza que el servidor esté activo.
2. Lo abre en `0.0.0.0` si hace falta.
3. Genera enlaces de un solo uso para:
   - Wi-Fi/LAN.
   - Tailscale.
   - Loopback (este PC).

En el móvil:

1. Abrir Tailscale y confirmar que está conectado.
2. Abrir OpenCode App.
3. Pegar el enlace de Tailscale en el campo de dirección del servidor.
4. Esperar la confirmación de conexión.

Los enlaces caducan en **5 minutos** y son de un solo uso. Si caducan, ejecutar
`ciszu-ai pair` de nuevo.

## 6. Uso diario

1. En el PC, dejar el servidor encendido.
2. En el móvil, abrir Tailscale.
3. Abrir OpenCode App.
4. Seleccionar la sesión o crear una nueva.
5. Escribir el prompt y esperar la respuesta.

La sesión es la misma que en el PC: lo que se escribe en el móvil aparece en el historial
del PC y viceversa.

## 7. Avisos con ntfy

Los avisos no requieren la OpenCode App:

```powershell
pnpm notify "Título" "Mensaje"
```

- `NOTIFY_TOPIC` y `NOTIFY_TOKEN` viven en el vault o en las variables de usuario.
- La app móvil de ntfy se suscribe al topic.
- No se usa para controlar el agente; es solo un canal de notificación.

## 8. Seguridad

- `OPENCODE_PASSWORD` debe definirse en el entorno del usuario, nunca en el repo.
- El servidor no debe exponerse a Internet. El bind `0.0.0.0` es solo para Wi-Fi de
  confianza o Tailscale.
- Mantener Tailscale como red privada; no abrir el puerto 7777 en el router.
- Revisar que `opencode.exe` tenga reglas de firewall solo en Private/Tailscale.
- Rotar `OPENCODE_PASSWORD` si se sospecha filtración y volver a emparejar.
- El enlace de emparejamiento es de un solo uso y caduca; no reutilizarlo.
- No guardar enlaces de emparejamiento en el repo, notas públicas ni capturas.

### Volver a loopback

```powershell
Remove-Item "$env:LOCALAPPDATA\ciszu-ai\server-hostname.txt" -ErrorAction SilentlyContinue
ciszu-ai reset
```

## 9. Diagnóstico

| Síntoma | Causa probable | Acción |
|---|---|---|
| La app no conecta | Tailscale desconectado | Abrir Tailscale y verificar `tailscale status` |
| La app no conecta | Servidor en loopback | Ejecutar `ciszu-ai pair` |
| La app no conecta | Firewall bloquea 7777 | Revisar regla de `opencode.exe` |
| Enlace caducado | Pasaron más de 5 min | Generar otro con `ciszu-ai pair` |
| `401` | `OPENCODE_PASSWORD` distinta | Reiniciar el servidor con la variable correcta |
| No aparecen sesiones | Servidor equivocado | Verificar el puerto 7777 y el bind |
| La sesión no sincroniza | App apuntando a otro servidor | Revisar la URL de la app |

Comandos útiles:

```powershell
opencode --version
opencode api get /api/info
Get-NetTCPConnection -LocalPort 7777 -State Listen
Get-Content "$env:LOCALAPPDATA\ciszu-ai\server-hostname.txt"
tailscale status
```

## 10. Lanzadores

- **Entrar/conectar**: `ciszu-ai`, `ciszu-ai-pc`, `opencode-ciszu-pc`.
- **Arrancar sin conectar**: `ciszu-ai-start`, `opencode-ciszu-start`.
- **Detener**: `ciszu-ai-stop`, `opencode-ciszu-stop`.
- **Reiniciar**: `ciszu-ai-reset`, `opencode-ciszu-reset`.
- **Emparejar móvil**: `ciszu-ai pair`.

Los lanzadores no reinician el servidor por defecto; solo lo garantizan si no responde.

## 11. Archivos y estado

| Ruta | Uso |
|---|---|
| `tools/ciszu-ai/ensure-server.ps1` | Arranque idempotente del servidor |
| `tools/ciszu-ai/attach-session.ps1` | Cliente TUI contra el servidor |
| `tools/ciszu-ai/pair-phone.ps1` | Enlaces de emparejamiento |
| `tools/ciszu-ai/ciszu-ai.cmd` | Lanzador oficial |
| `%LOCALAPPDATA%\ciszu-ai\server-hostname.txt` | Bind persistido |
| `.opencode/temp/opencode-server{,-err}.log` | Logs del servidor |

## 12. FAQ

**¿Necesito SSH en el móvil?** No. La OpenCode App se conecta directamente al servidor.

**¿Necesito abrir el puerto en el router?** No. Tailscale crea la red privada.

**¿La sesión es la misma que en el PC?** Sí. Es el mismo servidor y el mismo historial.

**¿Qué pasa si cierro la app?** El servidor sigue corriendo en el PC; la sesión queda
guardada.

**¿Puedo usar el móvil fuera de casa?** Sí, siempre que Tailscale esté conectado.

**¿Puedo seguir usando la TUI del PC?** Sí, con `ciszu-ai` o `opencode --server`.

**¿Dónde están las notificaciones?** En ntfy; la app no reemplaza a ntfy.

## 13. Referencias

- `OPENCODE_SYSTEM.md` — configuración de OpenCode V2 y comandos.
- `MODELS_LLM_SYSTEM.md` — modelo y proveedor.
- `MONITORING_SYSTEM.md` — ntfy y monitorización.
- `SECURITY_PROTOCOLS.md` — credenciales y firewall.
- `AGENTS.md` §6.9 — coexistencia de agentes.

_Última revisión: 22 nov 2026._ Relacionado: `OPENCODE_SYSTEM.md`, `MODELS_LLM_SYSTEM.md`,
`MONITORING_SYSTEM.md`, `SECURITY_PROTOCOLS.md`, `AGENTS.md`.
