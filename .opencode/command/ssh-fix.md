---
description: Diagnostica y repara el SSH remoto (Termius/Tailscale) — firewall Profile=Any + restart sshd si hace falta.
---

Diagnostica y repara el acceso SSH desde el móvil (Termius → Tailscale → OpenSSH) en este PC. Si el usuario reporta timeout SSH, "conectando..." sin respuesta o caídas de sesión post-auth, ejecuta esto:

1. Lanza el health-check: `powershell -ExecutionPolicy Bypass -File scripts/ensure-ssh.ps1` (modo diagnóstico + fix automático; usa `-CheckOnly` para solo comprobar).
2. Interpreta la salida:
   - `firewall = Allow / Profile Any` → OK. Si dice que lo reparó, el fix de Profile=Any se aplicó (lección 8 ago 2026: con Profile Private el tráfico por el adaptador Tailscale se bloquea en silencio).
   - `no hay listener en :22` → el script reinicia sshd (`Restart-Service sshd -Force`) para limpiar listeners zombis.
   - `probe local :22 = False` → sshd muerto; reintentar restart o ver `services.msc`.
3. Si sigue fallando, verifica el lado móvil: `tailscale ping <ip-móvil>` y que Termius tenga la clave correcta. Revisa `C:\ProgramData\ssh\logs\sshd.log` por errores de handshake.
4. Reporta resumen: qué se reparó y estado final de cada check.
