# AI APIs artísticas — investigación y plan de integración (1 ago 2026)

Tarea del TO_DO_LIST: integrar herramientas de diseño artístico con IA en el ecosistema (banners, assets de MuzicMania, logos, iconos).

## Resultado: NO existen claves API en el proyecto

Verificado: ninguna variable tipo `LEONARDO_*`, `RECRAFT_*`, `SILICONFLOW_*`, `CREEN_*` ni `AI_API_*` existe en ningún `.env`/`.env.local` del repo (incluidos backups). **Ninguna de las 4 plataformas tiene key configurada.** La integración real queda pendiente de que el usuario genere las claves; este documento deja el plan y los precios verificados (jul/ago 2026).

## Comparativa de proveedores

| Proveedor | API | Free tier | Coste mínimo pagado | Fuerte en | Uso propuesto en el ecosistema |
|---|---|---|---|---|---|
| **Leonardo AI** | Sí (pay-as-you-go, $5 de crédito inicial) | 150 tokens/día (sin derechos comerciales) | $12/mes Essential | Assets de juego, texturas 3D, personajes consistentes, entrenar modelo propio | Covers/art de **MuzicMania**, banners de flayers |
| **Recraft** | Sí (API por imagen, $1 = 1000 unidades) | Sí (imágenes públicas, sin derechos comerciales) | Raster V4.1 $0.035, vector $0.08 | **SVG vector nativo**, tipografía precisa, brand styles | Generar iconos/logo SVG nativo para el sistema `packages/ui/src/Icon.tsx` y `shared/icons/` |
| **SiliconFlow** | Sí (compatible OpenAI, `https://api.siliconflow.cn/v1` o `.com` internacional) | ~$1 crédito + varios modelos $0 | Pay-as-you-go | FLUX.1, Kolors, Z-Image (6B); muy barato | Ruta económica para generación por lotes (FLUX) |
| **Creen** | **NO tiene API** | Web gratuita sin login (40+ modelos: Sora 2, VEO 3.1, Nano Banana Pro, Seedream) | $10/mes paquete de créditos | 40+ modelos en un solo sitio, video e imagen | Exploración manual de ideas y moodboards, no programática |

## Recomendación por caso de uso

1. **Iconos SVG del proyecto** → **Recraft** (único con SVG nativo real). El sistema de iconos de Ciszu es inline-first (`shared/icons/svg/outline` → registry): Recraft puede generar SVGs vectoriales listos para añadir al catálogo. Ejemplo API:
   ```
   POST https://external.api.recraft.ai/v1/images/generations
   Authorization: Bearer <RECRAFT_API_KEY>
   {"model": "recraftv4.1", "prompt": "...", "image_size": "1024x1024", "response_format": "svg"}
   ```
2. **Assets de juego MuzicMania** (covers de álbumes, skins de flechas, fondos) → **Leonardo** (consistencia de personajes, entrenar modelo con el estilo neon cyan/rosa de la marca) o **SiliconFlow** (FLUX barato para lotes).
3. **Ideación rápida manual** → **Creen** (gratis, sin login, sin API).

## Plan de integración cuando existan claves

- Crear `scripts/generate-art.js` (CLI): `node scripts/generate-art.js <proveedor> <prompt> <output>` que suba el resultado directo a `ciszu-cdn` vía CLI supabase (las `sb_secret_*` no valen para PUT, usar `supabase storage cp`).
- Guardar claves en `services/supabase/.env` (gitignored) como `LEONARDO_API_KEY`, `RECRAFT_API_KEY`, `SILICONFLOW_API_KEY` — NUNCA en el repo ni en docs.
- Antes de commit: rotar/revisar con secretlint si algún día se añaden keys.

## Pendiente del usuario

- Crear cuentas y generar las 3 claves (Leonardo, Recraft, SiliconFlow) si se quiere automatizar. Creen no requiere nada.
- Decidir presupuesto: free tier sirve para pruebas; producción real de assets cuesta ~$0.04-0.12/imagen.
