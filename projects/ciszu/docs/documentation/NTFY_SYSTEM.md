# NTFY_SYSTEM

> **Versión**: 1.0
> **Actualización**: 09 oct 2026
> **Identificador**: NTFY_SYSTEM
> **Definición**: Sistema de notificaciones push del ecosistema: canales (ntfy.sh y self-hosted), seguridad, suscripción, políticas de contenido y operación.

---

## 1. Canales

| Canal | Uso | Seguridad |
| --- | --- | --- |
| **ntfy.sh** (`NOTIFY_TOPIC`) | Avisos operativos 24/7 (aunque el PC esté apagado): consolas, moderación, uptime, agentes | Topic rotado `CZ-ntfytask-<32 dígitos>` (vault). Reserva en ntfy.sh pendiente para impedir publicación ajena; la lectura es pública por nombre ⇒ **nunca contenido sensible** |
| **Self-hosted** (`NTFY_SELFHOST_URL`) | Canal privado para el staff y datos internos | `auth-default-access: deny-all` + usuarios con ACL; solo accesible por **Tailscale** (firewall limita 8080 a 100.64.0.0/10); credenciales en el vault |

## 2. Self-hosted (PC, sin Docker ni VPS)

- Binario: `tools/ntfy/ntfy.exe` (v2.29.0) + `tools/ntfy/server.yml`.
- Config clave: `listen-http :8080`, `auth-default-access deny-all`, `auth-file user.db`,
  `base-url http://100.75.124.72:8080`.
- Arranque automático: tarea programada **"Ciszu ntfy self-host"** (al iniciar Windows).
- Firewall: regla "Ciszu ntfy (Tailscale 8080)" → solo 100.64.0.0/10 + 127.0.0.1.
- Usuario administrador: `ciszuko` (vault: `NTFY_USER`/`NTFY_PASS`); los usuarios nuevos se
  crean con `NTFY_PASSWORD=... ntfy user --config server.yml add <usuario>` (no interactivo) y
  su ACL con `ntfy access <usuario> <topic> read|write|read-write`.
- Verificado (09 oct 2026): health 200; publicación/lectura anónima **403**; auth 200.

### Operar

```powershell
# arrancar/parar manualmente
Start-Process "E:\Ciszu Network\tools\ntfy\ntfy.exe" -ArgumentList 'serve --config "E:\Ciszu Network\tools\ntfy\server.yml"' -WindowStyle Hidden
Stop-Process -Name ntfy
# estado
Invoke-WebRequest http://127.0.0.1:8080/v1/health
```

## 3. Suscripción (móvil)

- **ntfy.sh**: app ntfy → add subscription → servidor por defecto → topic del vault
  (`CZ-ntfytask-...`). Si se filtra el nombre, rotar (ver §5).
- **Self-hosted**: app ntfy → add subscription → URL `http://100.75.124.72:8080` → usuario
  `ciszuko` (o el usuario propio del staff) con su contraseña. Requiere Tailscale activo en el
  dispositivo.

## 4. Política de contenido

- Por ntfy.sh **NUNCA**: secretos, tokens, credenciales, datos personales, detalles de
  incidentes, información de clientes. Solo avisos operativos breves.
- El contenido sensible va por email o por el canal self-hosted (con credenciales).
- Los scripts (`ntfy-notif.js`, `moderation.js`, `uptime-watch.js`) leen `NOTIFY_TOPIC` del
  vault; `NOTIFY_TOKEN`, si existe, se adjunta automáticamente.

## 5. Rotación

1. Generar `CZ-ntfytask-<32 dígitos>` nuevos.
2. Actualizar `NOTIFY_TOPIC` en el vault + `gh secret set NOTIFY_TOPIC` (uptime-watch en CI).
3. `vault.ps1 crypt` + `verify` y re-suscribir a los staff.
4. Registrar el cambio en `SECURITY_PROTOCOLS.md` (sección ntfy).

## 6. Roadmap

- Reservar el topic en ntfy.sh + `NOTIFY_TOKEN` (cuenta del owner).
- Usuarios self-host por rol del staff y migración de avisos internos al canal privado.
- Evaluar ntfy self-hosted en un host 24/7 cuando exista (hoy: PC con Tailscale).

---

_Última revisión: 09 oct 2026._ Relacionados: `SECURITY_PROTOCOLS.md`,
`ACCESS_CONTROL_SYSTEM.md`, `MONITORING_SYSTEM.md`, `VAULT_SYSTEM.md`.
