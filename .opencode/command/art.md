---
description: Genera arte IA con estilo Ciszu (FLUX/Gemini/SiliconFlow). Uso: /art <descripción>
---

Genera arte de IA al estilo Ciszu usando `tools/image-ai/generate-art.js`.

Entrada del usuario: `$ARGUMENTS`

1. Lee `tools/image-ai/generate-art.js` y, si es necesario, `projects/ciszu/docs/documentation/ART_GUIDE.md` (§8/§9) para la plantilla default.
2. Interpreta lo descrito:
   - **Personaje suelto / para recortar / transparente** → añade `--transparent` (por defecto `--bg-method birefnet`).
   - **Escena completa con fondo** → sin `--transparent` (PNG/JPEG normal).
   - **Banner 16:9** → 1024x576 por defecto.
3. Traduce la petición a los placeholders en inglés `--subject`, `--outfit`, `--expression` (o usa `--prompt <texto>` si el usuario pide algo custom).
4. Ejecuta por defecto `--provider hf` (FLUX.1-schnell). Si HF falla (503/DNS), prueba `--provider gemini` (si la quota está activa) o `--provider siliconflow` (si hay saldo).
5. Salida en `test/art` por defecto (raíz `test/`, categorías `art|music|video|website`); para nombres legibles para CDN usa `--name <base>`.

Formato:
```
node tools/image-ai/generate-art.js --provider hf --subject "..." --outfit "..." --expression "..." [--transparent] --name <base> --out test/art
```

Claves del vault: HF_TOKEN, GEMINI_API_KEY, SILICONFLOW_API_KEY. Si hay error de red o cuota, avisa (puede requerir activar VPN). Nunca pegues claves en el chat.