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
- Default: 1024x576 (16:9), salida a `downloads/test/`, nombres `art_<YYYYMMDDHHMMSS>_<hex4>.png`.
- Flags: `--provider hf|gemini|siliconflow`, `--subject/--outfit/--expression/--negative/--width/--height/--count/--out/--name/--model`.
- `--provider gemini` requiere GEMINI_API_KEY y modelo de imagen con quota activa; `--provider siliconflow` requiere red sin geo-bloqueo.
- Smoke test ejecutado 4 ago 2026: 6 imágenes FLUX válidas (PNG, ~600 KB-1 MB) en `downloads/test/` con nombres identificativos (`hf_hacker_*` ×2, `hf_android_cyber_*`, `hf_adventurer_red_*`, `hf_mecha_robot_*`, `hf_dj_musician_*`).
- Estado de herramientas no-HF en este PC: SiliconFlow → 402 balance insuficiente (recargar para activarla); Gemini → 429 quota free imagen `limit: 0` (sin billing no se desbloquea).

## Nota de red

El PC tiene DNS inestable para dominios HF (intermitente: `huggingface.co`, `router.huggingface.co`, `api-inference.huggingface.co`). Con la VPN activa funcionó. Si falla mucho, es preferible activar VPN y no buscar vías alternativas (decisión del usuario).

## Cierre de la tarea

- Script listo y probado (`scripts/generate-art.js`).
- `downloads/test/` es la carpeta de pruebas de salida (gitignored).
- Subida final a `ciszu-cdn` pendiente de decisión: subir solo los assets aprobados con `pnpm cdn:upload` (los archivos en `downloads/` se subirían con la ruta del repo correspondiente).

## Pendiente del usuario

- **Rotar tokens**: los tokens se pegaron en el chat de opencode. Aunque el repo es privado y el vault está gitignored, conviene rotar `HF_TOKEN`, `GEMINI_API_KEY`, `SILICONFLOW_API_KEY` en sus paneles y actualizar `services/supabase/.env` con `scripts/update-env-keys.js`.