---
description: Genera vídeo IA. Uso: /video <descripción>
---

# Generación de vídeo

Entrada del usuario: `$ARGUMENTS`

Estado real (5 ago 2026): `tools/opencode-ai/generate-video.js` implementado. Provider **fal** directo
(`FAL_KEY`, modelo `fal-ai/wan-25-preview/text-to-video`, poll + descarga mp4 + poster + log JSON).
⚠️ La cuenta fal está **sin saldo** → el provider fal NO se puede usar hasta recargar (pagado, avisar
al usuario). Provider `hf` (Wan2.1-T2V-1.3B / LTX-Video vía router) devuelve 404 sin provider habilitado.

Flujo:
1. Lee `tools/opencode-ai/README.md` (sección "Vídeo") y `tools/opencode-ai/generate-video.js`.
2. Ejecuta:

```
node tools/opencode-ai/generate-video.js --provider fal --prompt "<descripción>" --title "<título>" [--out downloads/video]
```

3. Si fal falla por saldo (error "User is locked / Exhausted balance"): avisar al usuario por
   `pnpm notify` (recarga en fal.ai/dashboard/billing) y NO usar APIs de pago sin confirmación.
4. Las APIs de pago (Runway/Luma/Kling) NO se usan sin confirmación previa del usuario.

Regla: nunca usar APIs de pago sin confirmación del usuario.