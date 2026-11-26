---
description: Enciende/garantiza el server headless de opencode en 127.0.0.1:7777 (sin conectar sesion).
---

Garantiza que el servidor headless de Ciszu-AI este corriendo en `127.0.0.1:7777`:
`opencode serve --port 7777 --hostname 127.0.0.1` (V2), lanzado de forma idempotente por `tools/ciszu-ai/ensure-server.ps1`.

1. Ejecuta: `ciszu-ai-start` (o `call "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" server` si falla el PATH).
2. Verifica que responde: `opencode api get /api/info --server http://127.0.0.1:7777` (Basic auth: usuario `opencode` + valor de `OPENCODE_PASSWORD`; nunca escribir la contraseña en el repo).
3. Reporta el PID y el contenido de `.opencode/temp/opencode-server.log` si algo falla.

**Linux** (dentro del perfil `ciszu`):

```bash
ciszu-ai server
ciszu-ai status
```

`ciszu-ai` garantiza el server, la contraseña y el bind; no imprimir secretos.
Logs en `.opencode/temp/opencode-server{,-err}.log`.