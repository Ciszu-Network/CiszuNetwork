# AI APIs artísticas — plan definitivo (4 ago 2026)

Tarea del TO_DO_LIST (alta prioridad): integrar generación de arte IA en el ecosistema (banners, assets de MuzicMania, logos, iconos) siguiendo la biblia `projects/ciszu/docs/documentation/ART_GUIDE.md` (§8 plantillas). **Completado (5 ago 2026)** — ver "Cierre de la tarea".

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

## Script de generación: `tools/image-ai/generate-art.js`

CLI multi-provider con retry (503/hot aplicar backoff):

```bash
node tools/image-ai/generate-art.js --provider hf --subject "a cute cyberpunk female hacker" \
  --outfit "wearing a fitted high-collar techwear jacket" \
  --expression "dynamic standing pose with confident smirk" --count 2
```

- Usa la plantilla §§8.1/8.3 de ART_GUIDE por defecto (placeholders `[SUBJECT]`, `[OUTFIT_AND_ACCESSORIES]`, `[EXPRESSION_AND_POSE]` + prompt negativo oficial). `--prompt <texto>` sobreescribe la plantilla (para fondos de escena custom, ej. volcán).
- Default: 1024x576 (16:9) pedido, pero **FLUX.1-schnell responde 1024x1024** (ignora el height; verificar en el log JSON).
- Flags: `--provider hf|gemini|siliconflow`, `--subject/--outfit/--expression/--negative/--width/--height/--count/--out/--name/--model/--prompt/--format/--transparent/--bg-method/--no-log`.
- `--provider gemini` requiere GEMINI_API_KEY y modelo de imagen con quota activa; `--provider siliconflow` requiere saldo (402 si no).
- **Nomenclatura (5 ago 2026 — decisión del usuario: SEPARAR nomenclatura PNG vs JSON)**:
  - Con `--name <nombre>`: el **PNG se llama SOLO `nombre.png`** (ej. `ciszuko_volcan.png`) — SIN servicio/modelo/datos técnicos, listo para uso comercial o CDN sin renombrar. El **JSON sí conserva la nomenclatura técnica** en nombre y contenido (ej. `hf_fluxschnell_ciszuko_volcan_20260805...json`).
  - Sin `--name`: comportamiento legacy `<service>_<modelo_corto>_<name>_<YYYYMMDDHHMMSS>_<hex4>.png`. Service: `hf`/`gemini`/`siliconflow`; modelo corto: `fluxschnell`, `gem25flash` (o slug del `--model`).
- **Log por imagen**: junto a cada PNG se escribe `<nombre>.json` con prompt, negative_prompt, subject, outfit, expression, service, provider, modelo completo, dimensiones, tamaño, timestamp y `transparent`. `--no-log` omite el JSON.
- **`--format png|jpeg`**: formato de salida (default png). `jpeg` requiere `sharp` instalado (si no, avisa y guarda PNG).
- **`--transparent` (encadenado, separado de la generación)**: tras generar el PNG llama a `tools/removebg-ai/remove-bg.js` (método `--bg-method chroma|birefnet`, default chroma) → `<nombre>_transparent.png`. **El sistema de transparencia es OPT-IN, NO automático**: solo se usa cuando se pide imagen "sin fondo/para recortar/transparente". Si se pide "con fondo de X" (escena completa) se genera PNG/JPEG normal sin quitar fondo.
- Validado (5 ago 2026): **4 imágenes — 3 personajes CON transparencia** (aventurera roja, hechicera plata, androide cian → `ciszuko_*_transparent.png`) **y 1 SIN transparencia** (aventurera con fondo anime de volcán en erupción, escena completa). Confirma que el sistema divide correctamente: con transparencia por defecto para personajes sueltos, sin transparencia para escenas con fondo. La aventurera se regeneró (mano voladora del primer intento) manteniendo el diseño: prompt correctivo (`both hands firmly planted on her hips`, negative con `floating limbs, detached hand, extra hand`). Test adicional del flag `--transparent` (bunny → PNG transparente).

## Remoción de fondo → PNG transparente: `tools/removebg-ai/remove-bg.js`

`node tools/removebg-ai/remove-bg.js --input <png> [--output <png>] [--tolerance 35] [--method chroma|birefnet]`

- **Método `chroma` (default, 100% gratis, comercial OK)**: flood-fill desde los bordes detectando el color de fondo dominante (las imágenes ART_GUIDE llevan franja de color sólido → corte limpio). Librería `pngjs` (MIT).
- **Método `birefnet` (calidad Photoshop, gratis, comercial OK)**: BiRefNet (MIT, pesos libres) vía `rembg` local (Python: `pip install "rembg[cpu]" onnxruntime`, 1ª descarga ~1GB). Mejor en bordes finos/cabello. **✅ INSTALADO y VERIFICADO (5 ago 2026)**: rembg 2.0.77 + onnxruntime 1.28 en Python 3.14. Modelo `birefnet-general.onnx` (927 MB) descargado manualmente con curl reanudable a `C:\Users\fplay\.u2net\` (el downloader de rembg cae con red lenta — usar curl: `curl.exe -L -C - -o C:\Users\fplay\.u2net\birefnet-general.onnx https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-epoch_244.onnx`).
- **Descartado**: RMBG-2.0 de BRIA (CC BY-NC → sin uso comercial gratis) y todas las APIs hosted (remove.bg, Photoroom, PixelAPI, etc. — free tier limitado o licencia de pago). BiRefNet ganó por ser MIT (código+pesos) en el benchmark del cutout.
- **⚠️ `chroma` (flood-fill) tiene 3 fallos conocidos** (5 ago 2026): (1) come cabello si su color se acerca al fondo, (2) deja franjas/fondo como bolsas aisladas sin conectar a los bordes, (3) no limpia huecos cerrados (p.ej. espacio brazo-torso en pose de manos en cadera). **`birefnet` resuelve los 3** (segmentación semántica del personaje completo, no flood-fill). Recomendado: `birefnet` como método por defecto.
- Prueba real (5 ago 2026): `ciszuko_{aventurera,hechicera,androide}_transparent.png` con BiRefNet → 61.9-79.7% transparente, esquinas alpha=0, fondo eliminado por completo (incluidos huecos y cabello intacto).

## Cierre de la tarea (5 ago 2026 — actualizado)

- Script ampliado y probado (`tools/image-ai/generate-art.js`): nomenclatura separada PNG/JSON, `--transparent` encadenado opt-in (corregido `--bg-method` con guión), `--format`, `--prompt`, `--no-log`. Plantilla con **full body** por defecto (`full body shot, whole character visible from head to toe, not cropped`) — FLUX recortaba a la cintura sin esa directriz.
- `test/art/` regenerado (antes `downloads/test/art/`): 3 personajes full body con transparencia BiRefNet (aventurera, hechicera, androide) + volcán con escena completa sin transparencia (gitignored).
- **Biblia de prompts añadida** en `ART_GUIDE.md` §9: 10 bancos modulares (sujetos fem/masc/no-humano, ropa, expresiones, poses, cámaras con full body, fondos con/sin, estilos, negativos extra, personalidades) + 10 prompts completos listos para copiar (A-J).
- El sistema de transparencia queda **desacoplado y opt-in**: solo `--transparent` cuando se pide personaje sin fondo/para recortar; escenas con fondo no se recortan. **Método recomendado: `birefnet`** (chroma solo para fondos planos sin huecos).
- Subida final a `ciszu-cdn` pendiente de decisión: subir solo los assets aprobados con `pnpm cdn:upload` (los archivos en `test/` se subirían con la ruta del repo correspondiente).

## Pendiente del usuario

- **Rotar tokens**: los tokens se pegaron en el chat de opencode. Aunque el repo es privado y el vault está gitignored, conviene rotar `HF_TOKEN`, `GEMINI_API_KEY`, `SILICONFLOW_API_KEY` en sus paneles y actualizar `services/supabase/.env` con `scripts/update-env-keys.js`.
