---
description: Enciende/garantiza el server headless de opencode en 127.0.0.1:4096 (sin adjuntar sesion).
---

Garantiza que el servidor headless de Ciszu-AI este corriendo en `127.0.0.1:4096`:
`opencode serve --port 4096 --hostname 127.0.0.1`, lanzado de forma idempotente por `tools/ciszu-ai/ensure-server.ps1`.

1. Ejecuta: `ciszu-ai-start` (o `call "C:\Users\fplay\ciszu-ai\ciszu-ai.cmd" server` si falla el PATH).
2. Verifica que responde: `Invoke-WebRequest http://127.0.0.1:4096 -UseBasicParsing`.
3. Reporta el PID y el contenido de `.opencode-tmp/opencode-server.log` si algo falla.