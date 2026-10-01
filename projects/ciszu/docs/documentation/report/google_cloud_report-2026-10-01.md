# Google Cloud: estado actual y que podemos hacer con los proyectos

**(asunto):** google_cloud · **Reporte:** 2026-10-01
**Solicitado por:** Ciszuko Antony

---

## 1. Estado actual (lo que YA existe)

- Los **4 proyectos de Google Cloud Console** se crearon al registrar los sitios de
  reCAPTCHA (v2 y v3) de cada web: ciszunetwork, ciszubot, ciszukoantony y muzicmania.
- Lo unico en uso hoy: **reCAPTCHA v2 + v3** (claves en el vault/Vercel; el backend
  verifica con `createRecaptchaHandler` de `@ciszunetwork/utils`).
- **No hay facturacion activa** ni APIs extra habilitadas: todo esta en el **tier
  gratuito** y asi debe quedarse (objetivo: coste 0).

## 2. Que se puede hacer SIN pagar (candidatos priorizados)

### P1 — Alto valor e inmediato
1. **reCAPTCHA Enterprise (capa gratis 10k evaluaciones/mes)**
   - Scores mas finos que v3 clasico, deteccion de fraude con mas senales y
     `WAF` para bloquear en el borde. Migracion por sitio, opcional y progresiva;
     se puede empezar por ciszubot (registros) y muzicmania (cuentas).
   - En Consola: APIs y servicios → reCAPTCHA Enterprise → crear claves por sitio.
2. **Cloud Monitoring — Uptime checks gratis (1M checks/mes) + alertas**
   - Alternativa/complemento a UptimeRobot: checks HTTPS a las 4 webs + `status`
   - Alertas a email/ntfy via webhook (Cloud Monitoring soporta canales webhook).
   - Util para el `MONITORING_SYSTEM` (redundancia: si UptimeRobot cae, Cloud avisa).
3. **GA4 → BigQuery export (sandbox gratis)**
   - El enlace GA4→BigQuery permite dashboards propios en **Looker Studio** sin los
     limites de la UI de GA4 (la tarea pendiente de Looker Studio encaja aqui).
   - BigQuery tiene **1 TB de consultas + 10 GB de almacenamiento gratis al mes**
     (mas que suficiente para nuestro trafico).

### P2 — Evaluar con prueba tecnica
4. **Vertex AI / Gemini API (tier gratuito limitado)**
   - Un modelo gestionado para features IA (resumen de changelogs, respuestas de
     soporte asistidas, clasificacion de reviews). Encaja con `MODELS_LLM_SYSTEM`.
   - Riesgo: el tier gratis es acotado; disenar con fallback local (los modelos
     actuales del agente) y medir coste real antes de activar.
5. **Firebase (plan Spark gratis) para la app de escritorio**
   - MuzicMania desktop (Tauri): **Crashlytics** y **Remote Config** serian utiles
     para telemetria de fallos sin coste; Analytics propio ya lo cubrimos con GA4.
   - Nota: no sustituye Supabase; es complementario.
6. **Secret Manager (6 versiones activas gratis/mes)**
   - Posible respaldo/rotacion de secretos para el futuro VPS (`VPS_PLAN`), no para
     sustituir el vault local (que sigue siendo la fuente + Bitwarden).

### P3 — Solo si el ecosistema escala
7. **Cloud Run / GKE**: alternativa a Vercel si algun dia los limites de Hobby
   aprietan de verdad; revisar en `VPS_PLAN`/`INTERNATIONAL_LLC_PLAN` (coste 0 solo
   con free tier muy limitado; no es sustituto directo hoy).
8. **Cloud Storage + Cloud CDN**: competiria con Supabase Storage (ya en uso);
   solo si superamos los limites gratis de Supabase.

## 3. Lo que NO conviene ahora

- Activar facturacion "por si acaso": puede habilitar cargos accidentales; mantener
  todo en free tier y evaluar caso por caso.
- Duplicar funciones que ya cubrimos: PostHog (analytics de producto), Sentry
  (errores), UptimeRobot (uptime), Supabase (DB/storage).

## 4. Pasos concretos propuestos (orden)

1. **Habilitar Cloud Monitoring** en el proyecto principal y crear 4 uptime checks
   (`https://<web>.vercel.app` + `/api/health` si existe) con alerta por email;
   opcionalmente webhook→ntfy. (15 min, coste 0)
2. **Probar reCAPTCHA Enterprise en UNA web** (ciszubot) con las mismas credenciales
   del vault; medir scores y comparar con v3 actual. (1-2 h, coste 0)
3. **Enlazar GA4→BigQuery** para ciszunetwork y montar 1 dashboard en Looker Studio
   (visitantes, fuentes, eventos de anuncios). (1 h, coste 0)
4. **POC de Gemini** para una tarea acotada (resumen de changelog semanal) midiendo
   consumo. (2 h, coste 0 dentro del tier)
5. Solo con datos en mano: decidir Fase 2 (Enterprise general, Firebase desktop,
   Secret Manager).

## 5. Riesgos y consideraciones

- **Consentimiento/legal**: las APIs de Google añaden procesadores de datos; hay que
  reflejarlo en la Política de Privacidad si se activan (GA4→BigQuery ya esta cubierto
  por la politica actual; Enterprise/Firebase requeririan mencion).
- **Secretos**: cualquier clave nueva (Enterprise, service accounts) va al **vault
  cifrado + Bitwarden**, nunca al repo (que es publico).
- **Coste**: definir presupuesto 0 y revisar mensualmente el panel de cuotas; las
  alertas de presupuesto de GCP se pueden configurar a 1 $.

## 6. Conclusion

Los 4 proyectos de Google pueden darnos **monitorizacion redundante, analitica
avanzada gratuita y seguridad anti-bot de siguiente nivel**, todo dentro del tier
gratuito si se activa con cuidado. El siguiente paso mas rentable (y reversible) es
**uptime checks + GA4→BigQuery**; el mas estrategico a medio plazo es **reCAPTCHA
Enterprise** en la web con mas registros.

_Reporte generado: 2026-10-01. Relacionado: `GOOGLE_SYSTEM.md`, `MONITORING_SYSTEM.md`,
`ANALYTICS_SYSTEM.md`, `SECURITY_PROTOCOLS.md`, `MODELS_LLM_SYSTEM.md`, `VPS_PLAN.md`._
