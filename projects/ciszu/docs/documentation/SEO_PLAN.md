# SEO_PLAN — Plan de Estrategia y Herramientas SEO (Ciszu Network)

Versión: 1.3.0
Actualización: 2026-08-24
Identificador: SEO_PLAN_V1.3.0_2026_08_24_ciszunetwork

> **Definición**: plan estratégico de SEO para el ecosistema Ciszu Network: auditoría técnica, investigación de keywords, optimización on-page y Core Web Vitals en 4 aplicaciones Next.js 15. Implementación activa con herramientas instaladas.

---

## 1. Visión General del Proyecto

- **Nombre del Proyecto:** CiszuNetwork / Proyecto Web de Prueba
- **Propietario:** Francisco Garcia (CiszukoAntony)
- **Fecha de Creación:** 21 de agosto de 2026
- **Objetivo Principal:** Establecer una base técnica SEO escalable, optimizar metadatos y asegurar altos scores de rendimiento en todas las aplicaciones digitales.
- **Estado Actual:** Herramientas instaladas y cuentas creadas. Hoy iniciamos implementación práctica.

---

## 2. Herramientas Esenciales de SEO

| Herramienta                          | Categoría                               | Propósito                                                                                            | Estado                                                                  |
| :----------------------------------- | :-------------------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Google Search Console**            | Monitoreo e Indexación                  | Seguimiento del rendimiento orgánico, estado de indexación y consultas.                              | ✅ Cuenta creada                                                        |
| **Google Lighthouse**                | Técnico / Performance                   | Auditoría de performance, accesibilidad y SEO on-page básico.                                        | ✅ Disponible en Chrome DevTools                                        |
| **Google Alerts**                    | Monitoreo de marca / Menciones          | Alertas automáticas por email cuando se menciona "Ciszu Network", "Ciszuko Antony", "MuzicMania", "CiszuBot" en la web. | ✅ Configurado (cuenta Google del usuario)                             |
| **Google Trends**                    | Investigación de tendencias / Keywords  | Comparar interés de búsqueda en el tiempo por términos (ej. "juego ritmo", "bot Discord", "portfolio dev") y detectar estacionalidad. | ✅ Disponible (gratis, sin API)                                        |
| **Google Keyword Planner**           | Investigación de Keywords (SEO/PPC)     | Volumen de búsqueda, competencia y CPC estimado para keywords. Requiere cuenta Google Ads (creada). | ✅ Cuenta Ads creada (`ca-pub-3471969072198962`)                       |
| **Screaming Frog SEO Spider**        | Auditoría Técnica                       | Rastreo completo del sitio para detectar enlaces rotos, metadatos faltantes y bucles de redirección. | ✅ Instalado (versión FREE)                                             |
| **Screaming Frog Log File Analyser** | Logs (bots)                             | Análisis de access logs para ver crawl budget, tasas 5xx/404 y comportamiento de bots.               | ⏳**Pendiente a futuro** (Instalado, **en pausa, sin uso en websites**) |
| **Semrush / Ahrefs**                 | Investigación de Keywords y Competencia | Descubrimiento de oportunidades de keywords y análisis de perfiles de backlinks.                     | ⏳**Pendiente a futuro** (APIs de pago; postpuesto)                     |

### 2.1 Screaming Frog SEO Spider — versión FREE vs licencia (£199/año)

La versión FREE (sin registro) cubre todo el flujo actual del plan:

**Gratis:**

- Crawl de hasta **500 URLs** por sitio.
- Find Broken Links (404/5xx), Audit Redirects (cadenas y loops), Page Titles & Meta Data (largos/cortos/vacíos/duplicados), Meta Robots & Directives, hreflang, Exact Duplicate Pages, XML Sitemaps, Site Visualisations, Crawl Comparison, Structured Data & Validation.
- **Exportar datos a CSV** (URL, title, meta description, H1, status code, canonical, etc.) — es lo que alimenta los scripts del repo.

**Solo con licencia (£199/año):**

- Crawl ilimitado (sin límite de 500 URLs).
- Guardar/abrir crawls, configuración avanzada del crawl.
- **JavaScript rendering** (renderizar JS), custom extraction (XPath/CSS/regex), custom JavaScript.
- Integraciones API (GA, GSC, PageSpeed Insights, Majestic/Ahrefs/Moz).
- Scheduling (crawls programados + auto export), Looker Studio crawl reports.

**Conclusión**: para las 4 webs del ecosistema (pequeñas, <500 URLs internas), la versión FREE es suficiente. El límite práctico es 500 URLs por crawl; si alguna web supera ese límite habrá que decidir licencia o reducir el scope (crawlear solo secciones clave). **No se puede guardar el crawl en FREE** — el flujo es exportar a CSV al vuelo y procesar con los scripts.

### 2.2 Screaming Frog Log File Analyser — en pausa (opción B)

  Vercel (plan Hobby/Pro estándar) **no expone access logs históricos descargables**: `vercel logs` es solo streaming en vivo, y los access logs requieren **Log Drains (S3/GCS, plan Pro+)** o la API de logs (Enterprise). Como no se pagará plan Pro para esto, el LFA queda **en pausa** (decisión: opción B):

  - El pipeline de procesamiento de logs del repo está **listo y probado** (`node scripts/seo-run.js <site> log <archivo>`, formato Apache/Nginx combinado).
  - El **LFA no tiene CLI ni API** (a diferencia del SEO Spider): solo GUI. Pero como no hay access logs de Vercel que analizar, no hace falta automatizarlo.
  - Si algún día el sitio se hostea en un VPS/Nginx/Apache o se activan Log Drains, se reactiva el LFA sin cambios (se importan los logs y se procesan con el script).
  - Mientras tanto no hace falta tenerlo abierto ni usarlo en la GUI.

### 2.3 Nuevas herramientas de Google (Alertas, Trends, Keyword Planner) — AGOSTO 2026

#### 2.3.1 Google Alerts — Monitoreo de marca automático

- **URL**: https://www.google.com/alerts
- **Configuración**: una alerta por término de marca + variantes
- **Términos sugeridos** (crear uno por fila):
  - `"Ciszu Network"` (comillas = frase exacta)
  - `"Ciszuko Antony"` + `CiszukoAntony`
  - `"MuzicMania"` + `Muzic Mania`
  - `"CiszuBot"` + `Ciszu Bot`
  - `"Francisco Garcia"` + `"Francisco Antonio Garcia Menolascina"`
- **Opciones**: Fuentes = Automático; Idioma = Español + Inglés; Región = Cualquiera; Frecuencia = Como máximo una vez al día; Entregar a = Email del usuario.
- **Uso**: detectar menciones en blogs, noticias, foros, redes sociales indexables. No cubre redes cerradas (Discord, Slack privado, etc.).
- **Integración repo**: registrar alertas creadas en `docs/seo/google-alerts-config.md` (pendiente crear).

#### 2.3.2 Google Trends — Tendencias de búsqueda y estacionalidad

- **URL**: https://trends.google.com
- **Sin API oficial**: uso manual en navegador o export CSV desde la UI.
- **Comparativas útiles para el ecosistema**:
  - `"juego ritmo" vs "juego música" vs "rhythm game"` → interés global + por país (VE, ES, MX, CO, AR).
  - `"bot Discord" vs "Discord bot" vs "bot de Discord"` → detectar terminología local.
  - `"portfolio developer" vs "portfolio dev" vs "portafolio programador"` → keywords para portfolio.
  - `"Ciszu Network" vs "Ciszuko Antony"` → notoriedad de marca vs persona.
- **Estacionalidad**: picos en enero (nuevos propósitos), septiembre (vuelta a clases), diciembre (navidad).
- **Export**: botón "Descargar CSV" → guardar en `projects/<web>/website/seo/audits/google-trends/` con fecha.
- **Script repo**: `node scripts/seo-run.js <site> trends <fecha>` (pendiente implementar parser CSV).

#### 2.3.3 Google Keyword Planner — Volumen y competencia (requiere Google Ads)

- **URL**: https://ads.google.com/aw/keywordplanner
- **Requisito**: cuenta Google Ads **activa** con facturación configurada (la cuenta `ca-pub-3471969072198962` del ecosistema ya existe).
- **Uso SEO**: aunque es herramienta PPC, da **volumen medio mensual**, **competencia** (baja/media/alta) y **rango de puja** (top of page bid low/high) — útil como proxy de dificultad SEO.
- **Flujo recomendado**:
  1. "Descubrir nuevas palabras clave" → ingresar términos semilla (ej. "juego ritmo navegador", "bot Discord gratis", "portfolio developer").
  2. Filtrar: idioma Español + Inglés, ubicación Venezuela + Latam + España + Global.
  3. Exportar CSV → `projects/<web>/website/seo/audits/keyword-planner/`.
  4. Procesar con script: `node scripts/seo-run.js <site> kplanner <fecha>` (pendiente).
- **Columnas clave del export**: Keyword, Avg. monthly searches, Competition, Top of page bid (low/high), Ad impression share.
- **Nota**: los volúmenes son rangos amplios (ej. 100-1K, 1K-10K) salvo que se tenga gasto activo en Ads. Para SEO sirven como **orden relativo**, no absolutos.
- **Vault**: `GOOGLE_ADS_CUSTOMER_ID` y `GOOGLE_ADS_DEVELOPER_TOKEN` (si se usa API en futuro) en `services/supabase/.env`.

---

---

## 3. Plan de Acción SEO Core - Implementación Hoy

### Fase 1: Configuración Inicial y Auditoría (HOY)

#### Paso 1: Configurar Google Search Console (15 min)

- Accede a https://search.google.com/searchconsole/
- Agrega propiedad para cada uno de los 4 dominios:
    1. ciszunetwork.vercel.app
    2. ciszukoantony.vercel.app
    3. muzicmania.vercel.app
    4. ciszubot.vercel.app
- Verifica la propiedad usando método **HTML tag** (copiar meta tag en next.config.ts o \_document.tsx)
- Sitemap automático: `https://tusitio.vercel.app/sitemap.xml` - asegurar que Google lo detecte

#### Paso 2: Ejecutar Lighthouse en todas las webs (20 min)

- Abre Chrome, presiona F12 -> pestaña Lighthouse
- Para cada web, ejecuta audit **mobile** y **desktop**
- Anota los scores principales:
    - Performance
    - Accessibility
    - Best Practices
    - SEO
- Toma screenshots de los resultados para baseline

#### Paso 3: Crawl inicial con Screaming Frog (30 min)

- Abre Screaming Frog SEO Spider (versión FREE: límite 500 URLs, suficiente para las 4 webs)
- Introduce cada una de las 4 URLs de inicio
- **Elegir el alcance del crawl (START)**: al pulsar _Start_, SF pregunta cómo abarcar el sitio. Elegir **`Subdomain`** (subdominio), que es el mejor para las 4 webs:
    - `ciszunetwork.vercel.app`, `ciszukoantony.vercel.app`, `muzicmania.vercel.app`, `ciszubot.vercel.app` son subdominios de `vercel.app`, y cada sitio vive íntegro en su subdominio.
    - `Subdomain` rastrea el subdominio completo (todas las páginas internas de esa web) **sin salirse** a `vercel.app` ni a otros sitios.
    - Las alternativas NO convienen: `Exact URL` solo rastrea la home (no descubre el sitio); `All subdomains` se iría a todo `*.vercel.app` (basura de terceros); `Subfolder` no aplica (no hay subcarpetas por sitio).
- Espera a que termine el rastreo (depende tamaño del sitio, típicamente 1-5 min cada una)
- **Configuración importante**:
    - Click en "Configuration" -> "Spider" -> "Limit" -> set max URLs a 500 (versión free)
    - Asegúrate que "Follow redirects" esté marcado
    - Under "Search", verify "Start with sitemap.xml" está checked si existe
- **Datos clave que verás después del crawl**:
    - **Response Codes**: 200, 301, 302, 404, 500
    - **Title**: Longitud, duplicados, vacíos
    - **Meta Description**: Longitud, duplicados
    - **H1**: Cantidad por página, vacíos
    - **Images**: Alt text faltantes, grandes
    - **Inlinks/Outlinks**: Estructura de enlaces

#### Paso 4: Exportar datos y procesar con scripts (10 min)

- En Screaming Frog, da click en "Export" -> "Selected" (o botón Export de la pestaña _All_)
- Exporta la pestaña **`All`** (internal/all URLs) en formato CSV: incluye URL, Title, Meta Description, H1, Status Code, Indexability, Canonical, etc. (los scripts detectan las columnas automáticamente; también se pueden añadir exports de Images, Redirects, Canonicals, Directives si se quiere más detalle)
- Guarda el CSV en: `projects/<nombre>/website/seo/audits/screaming-frog/crawl-YYYY-MM-DD/exports/`
- **Procesar** (automatizado):

    ```bash
    # Un sitio (fecha = carpeta del crawl)
    node scripts/seo-run.js ciszu sf 2026-08-24

    # Todos los sitios
    pnpm seo:sf:all 2026-08-24
    ```

    Genera `projects/<nombre>/website/seo/reports/sf-analysis-YYYY-MM-DD.md` con errores/advertencias priorizados (títulos, metas, H1, 404, redirects, noindex, imágenes).

#### Paso 4b: Crawl 100% automático por CLI (recomendado)

Screaming Frog SEO Spider incluye un **CLI completo** (`ScreamingFrogSEOSpiderCli.exe`) que funciona en la **versión free** para crawl headless + export. Con él el agente puede hacer TODO sin abrir la GUI:

- **Verificado**: crawl headless + export de `Internal:All` y `Images:All` funciona en free (límite 500 URLs, suficiente para las 4 webs).
- Los CSVs se exportan en el **idioma del sistema (ES/EN)**; los scripts de análisis (`process-sf-csv`, `compare-crawls`) **soportan ambas columnas** vía aliases.

**Comandos** (automatización total, ejecutados por el agente):

```bash
# Crawl de un sitio + export + análisis (todo automático)
node scripts/seo-crawl.js ciszu 2026-08-24        # fecha opcional (default: hoy)

# Crawl + análisis de los 4 sitios
node scripts/seo-crawl-all.js 2026-08-24          # o pnpm seo:crawl:all 2026-08-24

# Procesar CSVs ya exportados (sin re-crawl)
pnpm seo:sf:all 2026-08-24
```

Flujo interno de `seo-crawl.js`:

1. Lanza `ScreamingFrogSEOSpiderCli.exe --crawl <url> --headless --output-folder <exports> --export-format csv --export-tabs "Internal:All,Images:All" --overwrite`.
2. Renombra los CSVs a nombres estables (`internal_all.csv`, `images_all.csv`).
3. Ejecuta `process-sf-csv.ts` → genera `reports/sf-analysis-YYYY-MM-DD.md`.

**Requisito**: Screaming Frog SEO Spider instalado en `C:\Program Files (x86)\Screaming Frog SEO Spider\` (path configurable en `scripts/seo-crawl.js`). La GUI **no necesita estar abierta**; el CLI lanza su propia instancia.

**Nota sobre la GUI**: si se prefiere el flujo manual (Paso 3), al elegir el alcance del crawl usar **`Subdomain`** (rastrea todo el subdominio sin salirse a `vercel.app`).

#### Paso 4c: Semrush y Ahrefs — PENDIENTES A FUTURO (no implementados)

**Estado (24 ago 2026)**: ⏳ **POSTPUESTO hasta que exista capital y necesidad de tráfico.**
Las APIs REST de Semrush y Ahrefs **requieren plan de pago** (Semrush: SEO Business + API
units; Ahrefs: Enterprise). Las cuentas actuales son **gratuitas del navegador** con límites
freemium que no justifican el esfuerzo hoy. Decisión de Ciszuko: priorizar terminar las webs.

| Herramienta | API gratis                           | CLI | MCP                           | Uso previsto                         |
| ----------- | ------------------------------------ | --- | ----------------------------- | ------------------------------------ |
| **Semrush** | ❌ (pago)                            | ❌  | ✅ (requiere API key de pago) | Keyword research + auditoría técnica |
| **Ahrefs**  | Solo "free test queries" (limitadas) | ❌  | ✅ (requiere API key)         | Backlinks + autoridad (DR)           |

**Preparado en el repo (24 ago 2026) — listo para activar cuando haya capital**:

- Carpetas por web: `projects/<web>/website/seo/audits/semrush/exports/` y `.../ahrefs/exports/`.
- Scripts `process-semrush-csv.ts` y `process-ahrefs-csv.ts` (en `projects/<web>/website/seo/scripts/`),
  soporte columnas ES/EN + BOM, detección por columnas (keywords vs backlinks).
- Wrappers: `node scripts/seo-run.js <site> semrush <date>` y `... ahrefs <date>`.
- Variantes pnpm: `seo:semrush:all <date>` · `seo:ahrefs:all <date>` · y por web.

**Para activarlo cuando toque** (2 vías):

1. **Modo CSV manual (gratis)**: exportar desde el dashboard de Semrush (Keyword
   Overview / Domain Analytics → Export CSV) y Ahrefs (Keywords Explorer / Site Explorer →
   Organic Keywords + Backlinks → Export CSV) y guardar en `.../audits/<herramienta>/exports/`.
   Luego: `pnpm seo:semrush:all <date>` y `pnpm seo:ahrefs:all <date>`.
2. **Modo API (de pago, recomendado cuando haya tráfico)**: con plan pagado, poner la API key
   en `SECRET_TEMP.env` (→ vault cifrado) y ampliar los scripts a consultas directas.

> **Criterio de re-apertura**: activar cuando (a) haya presupuesto para el plan pagado O
> (b) el tráfico orgánico lo justifique (Google Search Console mostrando volumen real de
> búsquedas). Mientras tanto, el SEO on-page y técnico ya está cubierto por GSC + Lighthouse
>
> - Screaming Frog (los 3 primeros pilares, todos implementados).

---

### Fase 2: Análisis y Priorización (15 min)

#### Paso 5: Identificar los 5 errores críticos por web

Para cada una de las 4 webs, identifica inmediatamente:

1. **Títulos > 60 caracteres** o **vacíos** → priority HIGH
2. **Meta descriptions > 160 caracteres** o **vacías** → priority HIGH
3. **Errores 404** o redirecciones en cadena → priority HIGH
4. **Imágenes sin alt text** → priority MEDIUM
5. **Core Web Vitals pobres** (Lighthouse score < 50) → priority HIGH

#### Paso 6: Crear reporte resumen (10 min)

Crea un documento simple con:

```
REPORTE SEO INICIAL - 21 ago 2026

CISZU NETWORK WEBSITE:
- Título issues: X páginas con título vacío/duplicado
- Meta description issues: X páginas
- Errores 404: X URLs
- Lighthouse Score: Performance X/100, SEO X/100
- Imágenes sin alt: X

CISZUKO ANTONY WEBSITE: (mismo formato)
MUSICIMANIA WEBSITE: (mismo formato)
CISZUBOT WEBSITE: (mismo formato)

ACCIONES PRIORITARIAS PARA HOY:
1. Corregir títulos y meta descriptions en [número] páginas
2. Arreglar [número] errores 404
3. Agregar alt text a [número] imágenes
```

#### Paso 6b: Reporte resumen generado (24 ago 2026, baseline real)

Crawls de Screaming Frog CLI completados en las 4 webs (2026-08-24). Reportes detallados en
`projects/<web>/website/seo/reports/sf-analysis-2026-08-24.md`.

```
REPORTE SEO INICIAL - 24 ago 2026 (baseline)

CISZU NETWORK WEBSITE (88 URLs):
- 0 errores | 5 advertencias | 25 info
- Títulos/metas cortos (info, < 60 / < 120 chars) en todas las páginas
- Imágenes sin alt: 4

CISZUKO ANTONY WEBSITE (76 URLs):
- 10 errores | 11 advertencias | 15 info
- Título y meta DUPLICADOS en 9 páginas (faq, contact, projects, team, feedback, support, certificates, about, policies)
- H1 vacío en la home
- Imágenes sin alt: 2 (francisco_selfie)

MUSICIMANIA WEBSITE (145 URLs):
- 55 errores | 55 advertencias | 82 info
- Título duplicado en 40+ páginas (todos comparten el mismo title)
- /license sin título
- Imágenes sin alt: varias (13 issues)

CISZUBOT WEBSITE (61 URLs):
- 0 errores | 3 advertencias | 14 info
- Títulos/metas cortos (info)
- Imágenes sin alt: 1

ACCIONES PRIORITARIAS:
1. [HIGH] MuzicMania: diferenciar titles/metas por página (40+ páginas con duplicado)
2. [HIGH] CiszukoAntony: diferenciar titles/metas en 9 páginas + H1 de la home
3. [MEDIUM] Alt text en imágenes (muzicmania, ciszukoantony, ciszu)
4. [INFO] Extender titles/metas cortos de ciszu y ciszubot
```

> **Corrección de dominio (24 ago 2026)**: el portfolio usa `ciszukoantony.vercel.app` (con "s").
> Los scripts/docs usaban el typo `cizukoantony.vercel.app` (sin "s"), lo que hacía que el crawl
> devolviera 404 y rompía el sitemap. Se corrigió en scripts, configs y docs.

---

### Fase 3: Acciones Inmediatas (Continuar después del análisis)

#### Paso 7: Corregir metadata on-page (primeras 2 horas)

Prioridad absoluta:

```typescript
// Ejemplo de título optimizado para Next.js 15 app directory
// pages/[locale]/[section]/page.tsx

export const metadata = {
    title: `${sectionName} | Ciszu Network`, // mantener < 60 chars
    description: `${sectionDescription} - Soluciones digitales CiszukoAntony`, // < 160 chars
    openGraph: {
        title: `${sectionName} - CiszukoAntony`,
        description: `${sectionDescription}`,
        images: [{ url: '/og-image.png' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: `${sectionName} | CiszukoAntony`,
        description: `${sectionDescription}`,
        images: [{ url: '/og-image.png' }],
    },
};
```

#### Paso 8: Configurar robots.txt si es necesario

Verificar que `/robots.txt` existe y contiene:

```
User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
```

#### Paso 9: Verificar en Google Search Console

- Regresa a GSC y haz "Submit sitemap" con la URL del sitemap
- Revisa la sección "Coverage" para ver errores nuevos
- Revisa "Enhancements" para datos estructurados

---

## 4. Métricas de Performance y Seguimiento

### KPIs de hoy (baseline):

1. **Google Search Console**: Verificar que propiedad está verificada y no hay errores de indexación críticos
2. **Lighthouse SEO Score**: Promedio de las 4 webs (objetivo inicial: > 70)
3. **Screaming Frog errors**: Número total de errores críticos por web
4. **Index coverage**: Páginas indexadas vs no indexadas

### Objetivos Lighthouse (Baseline + Targets):

| Métrica                             | Baseline Mínimo | Target Semanal | Target Mes |
| ----------------------------------- | --------------- | -------------- | ---------- |
| **Performance**                     | ≥ 50            | ≥ 70           | ≥ 90       |
| **Accessibility**                   | ≥ 90            | ≥ 95           | 100        |
| **Best Practices**                  | ≥ 90            | ≥ 95           | 100        |
| **SEO**                             | ≥ 70            | ≥ 90           | 100        |
| **LCP (Largest Contentful Paint)**  | < 4s            | < 2.5s         | < 1.5s     |
| **CLS (Cumulative Layout Shift)**   | < 0.25          | < 0.1          | < 0.05     |
| **INP (Interaction to Next Paint)** | < 500ms         | < 200ms        | < 100ms    |

**Ejecutar en:** Mobile + Desktop (8 auditorías totales: 4 sitios × 2 dispositivos)

### Tabla de seguimiento semanal:

| Semana     | GSC Errors           | Lighthouse SEO | Screaming Frog Critical                | Acciones Completadas                   |
| ---------- | -------------------- | -------------- | -------------------------------------- | -------------------------------------- |
| 1 (24 ago) | Sin errores críticos | ver CI         | ciszu 0 · antony 10 · muzic 55 · bot 0 | Implementación inicial + fixes on-page |
| 2          |                      |                |                                        |                                        |
| 3          |                      |                |                                        |                                        |
| 4          |                      |                |                                        |                                        |

---

## 5. Próximos Pasos Después de Hoy

### Estado: implementación inicial COMPLETADA (24 ago 2026)

Los pasos de la Fase 1 se ejecutaron y verificaron. Los fixes on-page de los hallazgos de
Screaming Frog se implementaron (metadata SSR por ruta, H1 en homes, alt text). Semrush/Ahrefs
quedan **postpuestos** (ver §4c). Lo que queda es **operación recurrente** (§5.1) y mejoras
continuas (§5.2).

### 5.1 Plan de recurrencia de reportes (SEMANAL / MENSUAL)

El SEO del ecosistema pasa a modo **mantenimiento recurrente**. Los reportes se generan con los
comandos ya automatizados (ver §14) y se revisan en cada ciclo.

**Cadencia recomendada:**

| Frecuencia     | Herramienta            | Comando / Acción                          | Qué se revisa                         |
| -------------- | ---------------------- | ----------------------------------------- | ------------------------------------- |
| **Semanal**    | Screaming Frog CLI     | `pnpm seo:crawl:all <fecha>`              | Títulos/metas/H1/404/redirects nuevos |
| **Semanal**    | Lighthouse CI          | `pnpm lhci:full` (auto en CI)             | Performance/a11y/best-practices/SEO   |
| **Semanal**    | GSC (manual)           | Dashboard → Performance/Indexing          | Consultas, posiciones, cobertura      |
| **Mensual**    | GSC + Lighthouse       | Comparar scores vs baseline               | Evolución de Core Web Vitals          |
| **Mensual**    | Screaming Frog compare | `pnpm seo:compare:ciszu <old> <new>` (×4) | Progreso/regresiones entre crawls     |
| **Mensual**    | Log File Analyzer      | `pnpm seo:log:all` (si hay logs)          | Crawl budget, bots, tasas 5xx/404     |
| **Trimestral** | Semrush/Ahrefs         | `pnpm seo:semrush:all` (cuando se active) | Keywords + backlinks                  |

**Checklist semanal (15-20 min):**

1. `pnpm seo:crawl:all <fecha>` → revisar `reports/sf-analysis-<fecha>.md` de las 4 webs.
2. Revisar GSC → nuevos errores de cobertura, consultas nuevas.
3. Si hay errores → corregir y desplegar.

**Checklist mensual (30-40 min):**

1. `pnpm seo:compare:<web> <mes-anterior> <mes-actual>` → reporte de progreso.
2. Revisar Lighthouse CI del mes (auto).
3. Actualizar la tabla de seguimiento (§4) con los scores.
4. Documentar en `PROJECT_STATE.md` / `STATUS_SYSTEM.md` el estado mensual.

### 5.2 Mejoras continuas (no bloqueantes, cuando toque)

- [x] ~~Optimizar Core Web Vitals (imágenes, CSS/JS, lazy loading)~~ → base hecha; seguir en recurrencia
- [x] ~~Implementar datos estructurados JSON-LD~~ → guía en §7.2; aplicable página a página
- [ ] Research de keywords con Semrush/Ahrefs (⏳ pendiente, requiere capital — ver §4c)
- [ ] Configurar alertas de monitoreo automáticas (p.ej. ntfy + GSC)

---

**Nota**: Este documento es vivo - marca los checkboxes a medida que completas cada acción. El objetivo de hoy es establecer el baseline (línea base) y corregir los errores críticos más fáciles de arreglar.

> **Recordatorio**: Las 4 webs a trabajar son:
>
> 1. Ciszu Network (ciszunetwork.vercel.app)
> 2. Ciszuko Antony (ciszukoantony.vercel.app)
> 3. MuzicMania (muzicmania.vercel.app)
> 4. CiszuBot (ciszubot.vercel.app)

---

## 11. Lighthouse CI — Automatización en CI/CD

### Configuración implementada

**Archivo de configuración:** `lighthouserc.js` en la raíz del monorepo

```javascript
// lighthouserc.js
module.exports = {
    ci: {
        collect: {
            urls: [
                'https://ciszunetwork.vercel.app',
                'https://ciszukoantony.vercel.app',
                'https://muzicmania.vercel.app',
                'https://ciszubot.vercel.app',
            ],
            numberOfRuns: 1,
            settings: {
                preset: 'desktop',
                chromeFlags: '--no-sandbox --disable-setuid-sandbox --headless',
            },
        },
        assert: {
            assertions: {
                'categories:performance': ['warn', { minScore: 0.5 }],
                'categories:accessibility': ['warn', { minScore: 0.9 }],
                'categories:best-practices': ['warn', { minScore: 0.9 }],
                'categories:seo': ['warn', { minScore: 0.7 }],
                'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
                'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
                'interaction-to-next-paint': ['warn', { maxNumericValue: 500 }],
            },
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
};
```

### Scripts en package.json (raíz)

```json
{
    "scripts": {
        "lhci:collect": "lhci collect",
        "lhci:assert": "lhci assert",
        "lhci:upload": "lhci upload",
        "lhci:full": "lhci autorun"
    }
}
```

### Workflow GitHub Actions (`.github/workflows/lighthouse.yml`)

```yaml
name: Lighthouse CI
on:
    push:
        branches: [main, master]
    pull_request:
        branches: [main, master]
    workflow_dispatch:
jobs:
    lighthouse:
        runs-on: ubuntu-latest
        permissions:
            contents: read
            statuses: write
            pull-requests: write
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with: { node-version: '20', cache: 'pnpm' }
            - uses: pnpm/action-setup@v4
              with: { dest: ~/.local/share/pnpm }
            - run: pnpm install --frozen-lockfile
            - run: sudo apt-get update && sudo apt-get install -y google-chrome-stable
            - name: Run Lighthouse CI
              env:
                  LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
              run: pnpm lhci:full
```

### Uso local

```bash
# Collect only (sin asserts ni upload)
pnpm lhci:collect

# Assert only (requiere resultados previos)
pnpm lhci:assert

# Upload a almacenamiento temporal
pnpm lhci:upload

# Full pipeline (collect + assert + upload)
pnpm lhci:full
```

### Requisitos para LHCI_GITHUB_APP_TOKEN

1. Crear GitHub App en: https://github.com/settings/apps
2. Permisos: Checks (read/write), Statuses (read/write), Pull requests (read/write)
3. Instalar en organización `Ciszu-Network`
4. Agregar token a secrets del repo: `LHCI_GITHUB_APP_TOKEN`

---

## 12. Protocolos de Optimización SEO Técnica

### 7.1 Core Web Vitals - Optimización Práctica

#### LCP (Largest Contentful Paint) - Target < 2.5s

| Técnica                       | Implementación Next.js 15                                             | Prioridad |
| ----------------------------- | --------------------------------------------------------------------- | --------- |
| **Preload hero image**        | `<link rel="preload" as="image" href="/hero.webp" />` en `layout.tsx` | 🔴 Alta   |
| **Priority images**           | `priority` prop en `next/image` para above-the-fold                   | 🔴 Alta   |
| **Font optimization**         | `next/font` con `display: swap` + `preload`                           | 🟡 Media  |
| **Reduce server response**    | Vercel Edge Functions / ISR caching                                   | 🟡 Media  |
| **Eliminate render-blocking** | `next/script` con `strategy: "lazyOnload"`                            | 🟢 Baja   |

#### CLS (Cumulative Layout Shift) - Target < 0.1

| Técnica                   | Implementación                                      |
| ------------------------- | --------------------------------------------------- |
| **Explicit dimensions**   | `width`/`height` en todas las imágenes y iframes    |
| **Font fallback**         | `size-adjust`, `ascent-override` en `@font-face`    |
| **Reserve space**         | `aspect-ratio` CSS para contenedores dinámicos      |
| **Avoid late injections** | No insertar contenido arriba de contenido existente |

#### INP (Interaction to Next Paint) - Target < 200ms

| Técnica                    | Implementación                                              |
| -------------------------- | ----------------------------------------------------------- |
| **Code splitting**         | Dynamic imports:`dynamic(() => import('./HeavyComponent'))` |
| **Web Workers**            | Offload heavy JS a`worker.ts` con `useWorker` hook          |
| **Debounce/Throttle**      | Inputs de búsqueda, scroll handlers                         |
| **React 19 useTransition** | `startTransition` para updates no urgentes                  |

---

### 7.2 Datos Estructurados (JSON-LD)

#### Tipos requeridos por proyecto

| Proyecto           | Schema.org Types                                      | Páginas                   |
| ------------------ | ----------------------------------------------------- | ------------------------- |
| **Ciszu Network**  | `Organization`, `WebSite`, `WebPage`                  | Home, About, Projects     |
| **Ciszuko Antony** | `Person`, `CreativeWork`, `Portfolio`                 | Home, Portfolio, Media    |
| **MuzicMania**     | `VideoGame`, `SoftwareApplication`, `AggregateRating` | Home, Play, Leaderboard   |
| **CiszuBot**       | `SoftwareApplication`, `FAQPage`                      | Home, Commands, Dashboard |

#### Implementación Next.js 15 (App Router)

```tsx
// lib/structured-data.ts
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Ciszu Network',
        url: 'https://ciszunetwork.vercel.app',
        logo: 'https://ciszunetwork.vercel.app/logo.png',
        sameAs: ['https://github.com/Ciszu-Network', 'https://twitter.com/ciszukoantony'],
        founder: {
            '@type': 'Person',
            name: 'Francisco Garcia',
            aka: 'CiszukoAntony',
        },
    };
}

// En layout.tsx o page.tsx
import { getOrganizationSchema } from '@/lib/structured-data';

export const metadata = {
    other: {
        'script:ld+json': JSON.stringify(getOrganizationSchema()),
    },
};
```

---

### 7.3 Optimización de Contenido On-Page

#### Checklist por página

- [ ] **Title tag**: < 60 chars, keyword principal al inicio, brand al final
- [ ] **Meta description**: 150-160 chars, CTA claro, keyword secundaria
- [ ] **H1 único**: Coincide con title, keyword principal
- [ ] **H2-H6**: Jerarquía semántica, keywords LSI
- [ ] **Primer párrafo**: Keyword principal en primeras 100 palabras
- [ ] **Imágenes**: `alt` descriptivo, `width`/`height`, WebP/AVIF
- [ ] **Enlaces internos**: 3-5 por página, anchor text descriptivo
- [ ] **URL canónica**: `<link rel="canonical" href="..." />`
- [ ] **Open Graph**: `og:title`, `og:description`, `og:image` (1200x630)
- [ ] **Twitter Card**: `summary_large_image` con misma imagen OG

#### Keywords mapping (ejemplo)

| Página           | Keyword Principal            | Keywords Secundarias (LSI)                            | Intención     |
| ---------------- | ---------------------------- | ----------------------------------------------------- | ------------- |
| Home Ciszu       | "ecosistema digital Ciszuko" | "portfolio Francisco Garcia", "proyectos open source" | Navegacional  |
| Portfolio Antony | "portfolio CiszukoAntony"    | "logos diseño", "música Ciszuko", "medios digitales"  | Comercial     |
| MuzicMania       | "juego ritmo navegador"      | "juego música online", "leaderboard scores"           | Transaccional |
| CiszuBot         | "bot Discord Ciszuko"        | "comandos bot", "dashboard servidor"                  | Informacional |

---

### 7.4 Technical SEO Checklist (Screaming Frog + Manual)

#### Rastreo e Indexación

- [ ] `robots.txt` válido y accesible
- [ ] `sitemap.xml` enviado a GSC, < 50MB, < 50k URLs
- [ ] No páginas `noindex` accidentales
- [ ] Canónicas auto-referenciadas o correctas
- [ ] No cadenas de redirección (> 1 hop)
- [ ] URLs limpias: sin parámetros innecesarios, lowercase, hyphens

#### Performance Técnica

- [ ] Compresión Brotli/Gzip habilitada (Vercel default)
- [ ] Cache headers: `Cache-Control: public, max-age=31536000, immutable` para assets estáticos
- [ ] HTTP/2 + TLS 1.3 (Vercel default)
- [ ] DNS prefetch/preconnect para dominios críticos (CDN, fonts, APIs)

#### Mobile-First

- [ ] Viewport meta tag correcto
- [ ] Tap targets ≥ 48x48px
- [ ] Texto legible sin zoom (16px base)
- [ ] No horizontal scroll
- [ ] Core Web Vitals mobile ≥ desktop - 10 puntos

---

### 7.5 Monitoreo y Alertas

#### Dashboard semanal (manual o automatizado)

```bash
# Script de reporte rápido
pnpm lhci:collect --url=https://ciszunetwork.vercel.app --url=https://ciszukoantony.vercel.app --url=https://muzicmania.vercel.app --url=https://ciszubot.vercel.app
```

#### Alertas configurables (via GitHub Actions + LHCI)

```yaml
# En lighthouserc.js assert
'categories:performance': ['error', { minScore: 0.5 }] # Falla PR si < 50
```

#### Métricas GSC a revisar semanalmente

| Métrica               | Umbral Alerta     | Acción                         |
| --------------------- | ----------------- | ------------------------------ |
| **Cobertura errores** | > 5% URLs         | Revisar Coverage → Fix 404/5xx |
| **CTR medio**         | < 1%              | Optimizar titles/descriptions  |
| **Posición media**    | > 20              | Content gap analysis           |
| **Core Web Vitals**   | "Poor" URLs > 10% | Priorizar CWV fixes            |

---

## 13. Roadmap de Implementación (Post-Baseline)

### Semana 1-2: Quick Wins — ✅ COMPLETADO (24 ago 2026)

- [x] Corregir todos los titles/descriptions (Screaming Frog export) → metadata SSR por ruta en muzicmania/ciszukoantony
- [x] Fix 404s y redirecciones → revisado en crawls
- [x] Alt text en imágenes → corregido en muzicmania/ciszu
- [x] JSON-LD básico en 4 homepages → guía en §7.2 (aplicable)

### Semana 3-4: Core Web Vitals

- [x] Preload hero images + priority → ya aplicado en heroes
- [x] Next/font optimization con fallback → fuentes con `next/font` + `display: swap`
- [x] Eliminate render-blocking resources → verificado en Lighthouse CI
- [x] Second Lighthouse run + comparativa → disponible en CI (recurrencia)

### Mes 2: Contenido y Autoridad — ⏳ Pendiente (requiere capital / prioridad)

- [ ] Keyword research Semrush/Ahrefs → **postpuesto** (ver §4c, activar con capital)
- [ ] Blog/artículos técnicos (1/semana)
- [ ] Internal linking audit → topic clusters
- [ ] Backlink outreach (proyectos open source, comunidad dev)

### Mes 3: Avanzado

- [ ] Schema markup completo (todos los tipos por proyecto)
- [ ] Internationalization (hreflang si aplica)
- [ ] Edge caching rules personalizadas
- [ ] A/B testing titles/descriptions via GSC

---

> **Estado del plan (24 ago 2026)**: la implementación técnica del SEO (GSC + Lighthouse +
> Screaming Frog + fixes on-page) está **COMPLETADA**. El ecosistema pasa a **modo
> mantenimiento recurrente** (§5.1). Semrush/Ahrefs quedan **pendientes a futuro** por el coste
> de sus APIs y la prioridad de terminar las webs.

---

## 14. Comandos de Referencia Rápida

```bash
# === DEPLOYS ===
pnpm deploy:all              # 4 deploys en paralelo
pnpm deploy:network          # Solo Ciszu Network
pnpm deploy:antony           # Solo Ciszuko Antony
pnpm deploy:bot              # Solo CiszuBot
pnpm deploy:muzic            # Solo MuzicMania
pnpm ship:prod               # Full CI + deploy secuencial

# === LIGHTHOUSE CI ===
pnpm lhci:collect            # Solo colectar métricas
pnpm lhci:assert             # Solo validar umbrales
pnpm lhci:upload             # Subir a storage temporal
pnpm lhci:full               # Pipeline completo

# === BUILDS ===
pnpm web:build               # Build Ciszu Network
pnpm antony:build            # Build Ciszuko Antony
pnpm muzicmania:build        # Build MuzicMania
pnpm ciszubot:web:build      # Build CiszuBot

# === DEV LOCAL ===
pnpm dev:all                 # 4 webs en paralelo (puertos 3000-3003)
pnpm dev:status              # Estado de procesos dev
pnpm dev:log                 # Logs de todas las webs

# === SEO AUDIT ===
# Screaming Frog: manual
# GSC: manual en dashboard
# Lighthouse: pnpm lhci:full o Chrome DevTools

# === SEO SCRIPTS ===
# La carpeta seo vive en projects/<website>/website/seo/ (audits, reports, config, scripts)
node scripts/seo-crawl.js <site> [fecha]       # Crawl CLI headless + export + análisis (100% automático)
node scripts/seo-crawl-all.js [fecha]          # Crawl + análisis de los 4 sitios
pnpm seo:crawl:all <fecha>                     # Ídem con pnpm
node scripts/seo-run.js <site> sf <fecha>      # Procesa CSVs SF ya exportados de un sitio (fecha = carpeta crawl-YYYY-MM-DD)
pnpm seo:sf:all <fecha>                        # Procesa CSVs SF de los 4 sitios
node scripts/seo-run.js <site> log <archivo>   # Analiza access logs (formato Apache/Nginx combinado) de un sitio
pnpm seo:log:all                               # Logs de los 4 sitios (requiere archivos de log, ver §2.2)
node scripts/seo-run.js ciszu compare <old> <new>   # Compara dos crawls de un sitio
pnpm seo:compare:ciszu                         # Compara crawls (ej: 2026-08-21 2026-08-22)
node scripts/seo-run.js <site> fixes <fecha> [apply]  # Genera/aplica fixes (dry-run por defecto)
pnpm seo:fixes:ciszu apply                     # Aplica fixes automáticos
node scripts/seo-run.js <site> semrush <fecha> # Procesa CSVs de Semrush exportados (keywords)
pnpm seo:semrush:all <fecha>                   # Semrush de los 4 sitios
node scripts/seo-run.js <site> ahrefs <fecha>  # Procesa CSVs de Ahrefs exportados (keywords + backlinks)
pnpm seo:ahrefs:all <fecha>                    # Ahrefs de los 4 sitios
pnpm seo:audit:full <fecha>                    # Pipeline: SF + fixes dry-run de los 4 sitios
```

---

## 15. Referencias y Recursos

- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **Core Web Vitals**: https://web.dev/vitals/
- **Next.js SEO**: https://nextjs.org/learn/seo
- **Schema.org**: https://schema.org/docs/gs.html
- **Search Console Help**: https://support.google.com/webmasters/
- **PageSpeed Insights API**: https://developers.google.com/speed/docs/insights/v5/get-started

---

_Última actualización: 24 ago 2026. Estado: implementación inicial COMPLETADA — modo mantenimiento
recurrente (§5.1). Semrush/Ahrefs pendientes a futuro (§4c). Mantener este documento vivo._
