# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

Investigar y arreglar errorr de Speed Insights de Vercel en muzicmania:

Desktop

Real Experience Score

No data available. Make sure you are using the latest @vercel/speed-insights package.[Learn more](https://vercel.com/docs/speed-insights/quickstart#add-@vercel/speed-insights-to-your-project)

---

Measures the overall user experience. To provide a good user experience, pages should have a RES of more than 90.

[Learn more about RES](https://vercel.com/docs/speed-insights/metrics?device=desktop#how-the-scores-are-determined)

P75 P90 P95 P99

RoutesPaths

**RES**

**Poor**

<50

No poor scores

**Needs Improvement**

50 - 90

/

**54**

**52**

/download

**11**

**85**

**Great**

> 90

No good scores

Countries

**Poor**

<50

United Kingdom

**9**

**33**

**Needs Improvement**

50 - 90

**Great**

> 90

This report is based on **64** data points

---

## Speed Insights (muzicmania) — RESUELTO 12 ago 2026

- [x] Causa: `<SpeedInsights />` estaba DENTRO del `CloudflareGuard` (muzicmania), que no renderiza hijos hasta pasar Turnstile → el sensor perdía las mediciones del primer render → "No data available".
- [x] Fix: movido `<SpeedInsights />` fuera del guard, directo en `<body>` en `projects/muzicmania/website/src/app/layout.tsx` (misma posición que PwaRegister/PostHogAnalytics).
- [x] El sensor YA recolecta (70 data points, métricas reales: FCP 5.66s, LCP 10.57s, INP 264ms). El RES 52 era el score REAL, no el error.
- [x] **Fix LCP (12 ago 2026, manteniendo el gate Turnstile íntegro)**: el guard devolvía `null` en SSR → el HTML inicial no tenía la página → FCP/LCP esperaban la verificación completa. Ahora `packages/ui/src/CloudflareGuard.tsx` renderiza SIEMPRE `{children}` detrás del overlay fijo (gate intacto: pantalla negra + widget hasta verificar; `inert`+`aria-hidden` en el contenido). El wrapper de MuzicMania ya no devuelve `null` en `!mounted`. Hero de `/` con `priority` (logotipos SVG eager). Verificar en Vercel que el LCP baja a ~1-3s en el siguiente reporte.
