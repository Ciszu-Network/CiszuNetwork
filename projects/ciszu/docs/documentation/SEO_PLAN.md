# SEO_PLAN — Plan de Estrategia y Herramientas SEO (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-21
Identificador: SEO_PLAN_V1.0.0_2026_08_21_ciszunetwork

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

| Herramienta                   | Categoría                               | Propósito                                                                                            | Estado                               |
| :---------------------------- | :-------------------------------------- | :--------------------------------------------------------------------------------------------------- | :----------------------------------- |
| **Google Search Console**     | Monitoreo e Indexación                  | Seguimiento del rendimiento orgánico, estado de indexación y consultas.                              | ✅ Cuenta creada                     |
| **Google Lighthouse**         | Técnico / Performance                   | Auditoría de performance, accesibilidad y SEO on-page básico.                                        | ✅ Disponible en Chrome DevTools     |
| **Screaming Frog SEO Spider** | Auditoría Técnica                       | Rastreo completo del sitio para detectar enlaces rotos, metadatos faltantes y bucles de redirección. | ✅ Instalado (Log File + SEO Spider) |
| **Semrush / Ahrefs**          | Investigación de Keywords y Competencia | Descubrimiento de oportunidades de keywords y análisis de perfiles de backlinks.                     | ✅ Cuentas creadas                   |

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

- Abre Screaming Frog SEO Spider
- Introduce cada una de las 4 URLs de inicio
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

#### Paso 4: Exportar datos básicos (10 min)

- En Screaming Frog, da click en "Export" -> "Selected"
- Guarda como CSV: "Title", "Meta Description", "H1", "H1 count", "Response Code"
- Guardar en carpeta del proyecto: `projects/ciszu/seo-audit-2026-08-21/`

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

| Semana  | GSC Errors | Lighthouse SEO | Screaming Frog Critical | Acciones Completadas  |
| ------- | ---------- | -------------- | ----------------------- | --------------------- |
| 1 (hoy) | X          | X              | X                       | Configuración inicial |
| 2       |            |                |                         |                       |
| 3       |            |                |                         |                       |
| 4       |            |                |                         |                       |

---

## 5. Próximos Pasos Después de Hoy

### Inmediate (mañana):

- [ ] Revisar resultados del crawl Screaming Frog
- [ ] Priorizar fixes de título y meta description
- [ ] Publicar fixes en Next.js y hacer nuevo deploy

### Esta semana:

- [ ] Corregir todos los títulos < 60 chars y meta descriptions < 160 chars
- [ ] Arreglar errores 404 detectados
- [ ] Agregar alt text a imágenes principales
- [ ] Ejecutar segundo Lighthouse para comparar scores

### Próximas 2 semanas:

- [ ] Optimizar Core Web Vitals (imágenes, CSS/JS, lazy loading)
- [ ] Research de keywords con Semrush/Ahrefs
- [ ] Implementar datos estructurados JSON-LD
- [ ] Configurar reportes automáticos

---

**Nota**: Este documento es vivo - marca los checkboxes a medida que completas cada acción. El objetivo de hoy es establecer el baseline (línea base) y corregir los errores críticos más fáciles de arreglar.

> **Recordatorio**: Las 4 webs a trabajar son:
>
> 1. Ciszu Network (ciszunetwork.vercel.app)
> 2. Ciszuko Antony (cizukoantony.vercel.app)
> 3. MuzicMania (muzicmania.vercel.app)
> 4. CiszuBot (ciszubot.vercel.app)

---

## 6. Lighthouse CI — Automatización en CI/CD

### Configuración implementada

**Archivo de configuración:** `lighthouserc.js` en la raíz del monorepo

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      urls: [
        'https://ciszunetwork.vercel.app',
        'https://cizukoantony.vercel.app',
        'https://muzicmania.vercel.app',
        'https://ciszubot.vercel.app'
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --headless'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.7 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
        'interaction-to-next-paint': ['warn', { maxNumericValue: 500 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
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

## 7. Protocolos de Optimización SEO Técnica

### 7.1 Core Web Vitals - Optimización Práctica

#### LCP (Largest Contentful Paint) - Target < 2.5s

| Técnica | Implementación Next.js 15 | Prioridad |
|---------|---------------------------|-----------|
| **Preload hero image** | `<link rel="preload" as="image" href="/hero.webp" />` en `layout.tsx` | 🔴 Alta |
| **Priority images** | `priority` prop en `next/image` para above-the-fold | 🔴 Alta |
| **Font optimization** | `next/font` con `display: swap` + `preload` | 🟡 Media |
| **Reduce server response** | Vercel Edge Functions / ISR caching | 🟡 Media |
| **Eliminate render-blocking** | `next/script` con `strategy: "lazyOnload"` | 🟢 Baja |

#### CLS (Cumulative Layout Shift) - Target < 0.1

| Técnica | Implementación |
|---------|----------------|
| **Explicit dimensions** | `width`/`height` en todas las imágenes y iframes |
| **Font fallback** | `size-adjust`, `ascent-override` en `@font-face` |
| **Reserve space** | `aspect-ratio` CSS para contenedores dinámicos |
| **Avoid late injections** | No insertar contenido arriba de contenido existente |

#### INP (Interaction to Next Paint) - Target < 200ms

| Técnica | Implementación |
|---------|----------------|
| **Code splitting** | Dynamic imports: `dynamic(() => import('./HeavyComponent'))` |
| **Web Workers** | Offload heavy JS a `worker.ts` con `useWorker` hook |
| **Debounce/Throttle** | Inputs de búsqueda, scroll handlers |
| **React 19 useTransition** | `startTransition` para updates no urgentes |

---

### 7.2 Datos Estructurados (JSON-LD)

#### Tipos requeridos por proyecto

| Proyecto | Schema.org Types | Páginas |
|----------|------------------|---------|
| **Ciszu Network** | `Organization`, `WebSite`, `WebPage` | Home, About, Projects |
| **Ciszuko Antony** | `Person`, `CreativeWork`, `Portfolio` | Home, Portfolio, Media |
| **MuzicMania** | `VideoGame`, `SoftwareApplication`, `AggregateRating` | Home, Play, Leaderboard |
| **CiszuBot** | `SoftwareApplication`, `FAQPage` | Home, Commands, Dashboard |

#### Implementación Next.js 15 (App Router)

```tsx
// lib/structured-data.ts
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ciszu Network",
    "url": "https://ciszunetwork.vercel.app",
    "logo": "https://ciszunetwork.vercel.app/logo.png",
    "sameAs": [
      "https://github.com/Ciszu-Network",
      "https://twitter.com/ciszukoantony"
    ],
    "founder": {
      "@type": "Person",
      "name": "Francisco Garcia",
      "aka": "CiszukoAntony"
    }
  };
}

// En layout.tsx o page.tsx
import { getOrganizationSchema } from '@/lib/structured-data';

export const metadata = {
  other: {
    'script:ld+json': JSON.stringify(getOrganizationSchema())
  }
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

| Página | Keyword Principal | Keywords Secundarias (LSI) | Intención |
|--------|-------------------|----------------------------|-----------|
| Home Ciszu | "ecosistema digital Ciszuko" | "portfolio Francisco Garcia", "proyectos open source" | Navegacional |
| Portfolio Antony | "portfolio CiszukoAntony" | "logos diseño", "música Ciszuko", "medios digitales" | Comercial |
| MuzicMania | "juego ritmo navegador" | "juego música online", "leaderboard scores" | Transaccional |
| CiszuBot | "bot Discord Ciszuko" | "comandos bot", "dashboard servidor" | Informacional |

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
pnpm lhci:collect --url=https://ciszunetwork.vercel.app --url=https://cizukoantony.vercel.app --url=https://muzicmania.vercel.app --url=https://ciszubot.vercel.app
```

#### Alertas configurables (via GitHub Actions + LHCI)

```yaml
# En lighthouserc.js assert
'categories:performance': ['error', { minScore: 0.5 }]  # Falla PR si < 50
```

#### Métricas GSC a revisar semanalmente

| Métrica | Umbral Alerta | Acción |
|---------|---------------|--------|
| **Cobertura errores** | > 5% URLs | Revisar Coverage → Fix 404/5xx |
| **CTR medio** | < 1% | Optimizar titles/descriptions |
| **Posición media** | > 20 | Content gap analysis |
| **Core Web Vitals** | "Poor" URLs > 10% | Priorizar CWV fixes |

---

## 8. Roadmap de Implementación (Post-Baseline)

### Semana 1-2: Quick Wins
- [ ] Corregir todos los titles/descriptions (Screaming Frog export)
- [ ] Fix 404s y redirecciones
- [ ] Alt text en imágenes top 50 por tráfico
- [ ] JSON-LD básico en 4 homepages

### Semana 3-4: Core Web Vitals
- [ ] Preload hero images + priority
- [ ] Next/font optimization con fallback
- [ ] Eliminate render-blocking resources
- [ ] Second Lighthouse run + comparativa

### Mes 2: Contenido y Autoridad
- [ ] Keyword research Semrush/Ahrefs → content calendar
- [ ] Blog/artículos técnicos (1/semana)
- [ ] Internal linking audit → topic clusters
- [ ] Backlink outreach (proyectos open source, comunidad dev)

### Mes 3: Avanzado
- [ ] Schema markup completo (todos los tipos por proyecto)
- [ ] Internationalization (hreflang si aplica)
- [ ] Edge caching rules personalizadas
- [ ] A/B testing titles/descriptions via GSC

---

## 9. Comandos de Referencia Rápida

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
```

---

## 10. Referencias y Recursos

- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **Core Web Vitals**: https://web.dev/vitals/
- **Next.js SEO**: https://nextjs.org/learn/seo
- **Schema.org**: https://schema.org/docs/gs.html
- **Search Console Help**: https://support.google.com/webmasters/
- **PageSpeed Insights API**: https://developers.google.com/speed/docs/insights/v5/get-started

---

_Última actualización: 22 ago 2026. Mantener este documento vivo._
