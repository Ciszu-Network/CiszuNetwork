---
description: Genera enlaces de emparejamiento para la app movil de OpenCode V2 (un solo uso, 5 min).
---

Genera un enlace para conectar la app de OpenCode del telefono al servidor compartido del PC.

1. Ejecuta: `ciszu-ai pair` (o `call "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" pair` si falla el PATH).
2. Muestra al usuario los enlaces Wi-Fi/LAN y Tailscale; caducan en 5 minutos y son de un solo uso.
3. Indica que pegue el enlace en el campo de direccion del servidor de la app (o lo escanee si la app lo ofrece).
4. Si falla, revisa `.opencode/temp/opencode-server-err.log`, que el telefono este en la misma Wi-Fi o en Tailscale, y que `opencode.exe` tenga regla de entrada en el Firewall.
5. No reveles ni imprimas `OPENCODE_PASSWORD`; la app se autentica con el enlace de emparejamiento.
