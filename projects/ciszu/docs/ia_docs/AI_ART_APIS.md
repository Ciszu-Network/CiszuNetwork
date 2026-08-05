# AI APIs artísticas — plan definitivo (4 ago 2026)

Tarea del TO_DO_LIST (alta prioridad): integrar generación de arte IA en el ecosistema (banners, assets de MuzicMania, logos, iconos) siguiendo la biblia `projects/muzicmania/docs/ia_docs/ART_GUIDE.md` (§8 plantillas).

## Decisión final (usuario, 4 ago 2026)

**100% gratis al inicio + derechos comerciales.** Combinación elegida:

| Prioridad | Proveedor | Modelo | Estado real en este PC | Licencia comercial |
|---|---|---|---|---|
| **1 — PRIMARIO** | **Hugging Face Inference** | `black-forest-labs/FLUX.1-schnell` | **FUNCIONA** (vía `router.huggingface.co`, provider auto=nscale). Requiere VPN si el DNS del PC falla. 503 intermitentes del provider (retry en el script) | Apache 2.0 |
| 2 | **SiliconFlow** | `black-forest-labs/FLUX.1-schnell` | **402 "account balance is insufficient"** — el crédito $1 de bienvenida se agotó/expiró. Endpoint real: `api.siliconflow.com` (`.cn` da 401). La key es válida (GET /v1/models → 200). Requiere recargar saldo | Apache 2.0 |
| 3 | **Gemini** | `gemini-2.5-flash-preview-image` | **429 quota `limit: 0`** (free tier imagen deshabilitada en el proyecto/región). Texto OK con `gemini-3.5-flash`. Nombre del modelo de imagen: `gemini-2.5-flash-preview-image` (no `-image`) | Uso comercial permitido en los términos |

### Descartados (no cumplen el criterio free+comercial)

| Proveedor | Motivo del descarte |
|---|---|
| **Leonardo AI** | Free = 150 tokens/día, imágenes públicas sin licencia comercial, API solo de pago |
| **Recraft** | Free = imágenes públicas sin licencia comercial; SVG nativo solo en API de pago |
| **Creen** | No tiene API (solo web, útil para moodboards manuales) |

## Claves (vault `services/supabase/.env`, gitignored)

- `HF_TOKEN` = token HF (cuenta nueva, type Read). Credenciales S3 de HF también guardadas (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `HF_S3_ENDPOINT=https://s3.hf.co`).
- `GEMINI_API_KEY` = key Gemini nueva (proyecto 539098412240).
- `SILICONFLOW_API_KEY` = key SiliconFlow (balance $1 de bienvenida).
- **Endpoints HF probados**: `api-inference.huggingface.co` y `router.huggingface.co` fallan DNS en este PC (sin VPN); el SDK `@huggingface/inference` usa el router correctamente con la VPN activa. Las rutas raw antiguas (`/hf-internal/models/...`) dieron 404.
- Verificación secretlint: correr `secretlint` sobre el repo tras estos cambios no muestra keys nuevas en archivos trackeados.

## Script de generación: `scripts/generate-art.js`

CLI multi-provider con retry (503/hot aplicar backoff):

```bash
node scripts/generate-art.js --provider hf --subject "a cute cyberpunk female hacker" \
  --outfit "wearing a fitted high-collar techwear jacket" \
  --expression "dynamic standing pose with confident smirk" --count 2
```

- Usa la plantilla §§8.1/8.3 de ART_GUIDE por defecto (placeholders `[SUBJECT]`, `[OUTFIT_AND_ACCESSORIES]`, `[EXPRESSION_AND_POSE]` + prompt negativo oficial).
- Default: 1024x576 (16:9) pedido, pero **FLUX.1-schnell responde 1024x1024** (ignora el height; verificar en el log JSON).
- Flags: `--provider hf|gemini|siliconflow`, `--subject/--outfit/--expression/--negative/--width/--height/--count/--out/--name/--model`.
- `--provider gemini` requiere GEMINI_API_KEY y modelo de imagen con quota activa; `--provider siliconflow` requiere saldo (402 si no).
- **Nomenclatura de salida**: `<service>_<modelo_corto>_<name>_<YYYYMMDDHHMMSS>_<hex4>.png` — ej. `hf_fluxschnell_hacker_20260805012529_3ba8.png`. Service: `hf`/`gemini`/`siliconflow`; modelo corto: `fluxschnell`, `gem25flash` (o slug del `--model`).
- **Log por imagen**: junto a cada PNG se escribe `<nombre>.json` con prompt, negative_prompt, subject, outfit, expression, service, provider, modelo completo, dimensiones, tamaño y timestamp (formato legible por máquina).
- Prueba de alto nivel (5 ago 2026): imagen del personaje Ciszuko replicado desde análisis de Gemini con visión → `hf_fluxschnell_ciszuko_char_*.png` + log.

## Remoción de fondo → PNG transparente: `scripts/remove-bg.js`

`node scripts/remove-bg.js --input <png> [--output <png>] [--tolerance 35] [--method chroma|birefnet]`

- **Método `chroma` (default, 100% gratis, comercial OK)**: flood-fill desde los bordes detectando el color de fondo dominante (las imágenes ART_GUIDE llevan franja de color sólido → corte limpio). Librería `pngjs` (MIT).
- **Método `birefnet` (calidad Photoshop, gratis, comercial OK)**: BiRefNet (MIT, pesos libres) vía `rembg` local (Python: `pip install "rembg[cpu]" onnxruntime`, 1ª descarga ~1GB). Mejor en bordes finos/cabello.
- **Descartado**: RMBG-2.0 de BRIA (CC BY-NC → sin uso comercial gratis) y todas las APIs hosted (remove.bg, Photoroom, PixelAPI, etc. — free tier limitado o licencia de pago). BiRefNet ganó por ser MIT (código+pesos) en el benchmark del cutout.
- Prueba real (5 ago 2026): `hf_fluxschnell_ciszuko_char_*_transparent.png` → 50.8% transparente, esquinas alpha=0, centro del personaje alpha=255, fondo detectado rgb(248,248,248). ⚠️ Bug corregido: `Number(undefined)` daba NaN y borraba toda la imagen — ahora default 40 (35 recomendado).

## Cierre de la tarea

- Script listo y probado (`scripts/generate-art.js`).
- `downloads/test/` es la carpeta de pruebas de salida (gitignored).
- Subida final a `ciszu-cdn` pendiente de decisión: subir solo los assets aprobados con `pnpm cdn:upload` (los archivos en `downloads/` se subirían con la ruta del repo correspondiente).

## Pendiente del usuario

- **Rotar tokens**: los tokens se pegaron en el chat de opencode. Aunque el repo es privado y el vault está gitignored, conviene rotar `HF_TOKEN`, `GEMINI_API_KEY`, `SILICONFLOW_API_KEY` en sus paneles y actualizar `services/supabase/.env` con `scripts/update-env-keys.js`.

## ⚠️ PENDIENTE PRÓXIMA SESIÓN (5 ago 2026 — cambio de sesión por umbral 120k)

El usuario pidió (en este orden) — decír "continúa" a la nueva sesión:

1. **Limpiar `downloads/test/`** (borrar las 8 imágenes + logs + transparent de las pruebas anteriores).
2. **Generar 3 personajes MUY diferentes entre sí con distintas personalidades** (usar `scripts/generate-art.js`, provider hf).
3. **CAMBIAR NOMENCLATURA** (decisión nueva del usuario): el archivo PNG debe llevar **SOLO el nombre** (ej. `ciszuko_volcan.png`), SIN servicio/modelo/datos técnicos (los renombraría a mano para uso comercial/CDN). El archivo JSON **sí** conserva la nomenclatura técnica completa tanto en el nombre como por dentro (ej. `hf_fluxschnell_ciszuko_volcan_20260805...json`).
4. **Sistema de transparencia SEPARADO del de generación**: NO todas las imágenes son PNG con transparencia. El usuario pedirá a veces imagen sin transparencia (ej. fondo anime completo). Detectarlo por la petición: si pide "personaje sin fondo/para recortar/transparente" → generar + `remove-bg.js`; si pide "con fondo de X" → NO quitar fondo (formato PNG o JPEG normal).
5. **Generar 1 imagen extra**: uno de los 3 personajes regenerado con **fondo anime de volcán en erupción** (sin transparencia; PNG o JPEG da igual).
6. **Documentar todo esto** (actualizar `AI_ART_APIS.md` + AGENTS.md si aplica) y **commitear**.
   - Cambio en `generate-art.js`: flag `--name <solo-nombre-png>` y que el JSON siga con nomenclatura técnica; flag tipo `--no-log`/`--format png|jpeg` si conviene.
   - Considerar flag `--transparent` en `generate-art.js` que encadene `remove-bg.js` cuando aplique.
