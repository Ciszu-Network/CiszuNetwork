---
description: Genera cabeceras ASCII/ANSI grandes para terminal. Uso: /ascii CISZU [--scale 2 --ansi]
---

# Generar arte ASCII de texto

Usa `tools/ascii-ai/textart.js` (sin dependencias, offline, fuente bloque propia).

Entrada del usuario: `$ARGUMENTS`

1. Lee `tools/ascii-ai/textart.js` si necesitas flags.
2. Comando tipo (texto default `CISZU`):

```
node tools/ascii-ai/textart.js --text "<TEXTO>" --scale 2 [--ansi] [--frame] [--color neon] [--out archivo]
```

3. Para cabeceras del perfil PowerShell, generar en plano y pegar en `Show-CisZHeader` del
   perfil (o ejecutar `node tools/ascii-ai/textart.js --text "CISZU" --scale 2`).
4. Devuelve el arte enorme; si `--out`, guarda el resultado en un archivo.