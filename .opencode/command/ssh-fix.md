---
description: Diagnostica y repara el acceso remoto (OpenCode App/Tailscale/SSH) en Windows o Linux.
---

Diagnostica y repara el acceso remoto desde el móvil (OpenCode App → Tailscale →
OpenSSH) en este PC. Si el usuario reporta timeout SSH, "conectando..." sin
respuesta o caídas post-auth:

**Windows**:

1. `powershell -ExecutionPolicy Bypass -File scripts/ensure-ssh.ps1` (diagnóstico
   + fix; `-CheckOnly` para solo comprobar).
2. Interpreta la salida:
   - `firewall = Allow / Profile Any` → OK. Si lo reparó, se aplicó Profile=Any
     (con Profile Private el tráfico por Tailscale se bloquea).
   - `no hay listener en :22` → reinicia sshd.
   - `probe local :22 = False` → sshd muerto; revisar `services.msc`.
3. Revisa `C:\ProgramData\ssh\logs\sshd.log`.

**Linux (Fedora)**:

```bash
sudo systemctl status sshd
sudo systemctl restart sshd
ss -ltnp | grep ':22'
sudo tailscale status
tailscale ping <ip-movil>
sudo journalctl -u sshd -n 50 --no-pager
```

Comprueba que el firewall permite Tailscale: `sudo firewall-cmd --get-active-zones`
y que la interfaz `tailscale0` esté en la zona correcta. En Fedora, `sshd` no
escucha por defecto hasta `systemctl enable --now sshd`.

Reporta qué se reparó y el estado final de cada check. No imprimas claves.
