# Documentación oficial — Ciszu Network

Esta carpeta (`documentation/`) contiene la **documentación oficial** del proyecto Ciszu
Network: fuente de verdad para decisiones, arquitectura, estándares y estado. Se revisa en
commits como el resto del repo.

> **Reglas del sistema de documentación**: cabecera, nomenclatura, sufijos, formato y límites
> de líneas están definidos en `DOCUMENTATION_SYSTEM.md`. Leerlo antes de crear o modificar
> cualquier documento.

## Índice por categoría

### Sistemas
`ARCHITECTURE.md` · `FULL_STACK_SYSTEM.md` (stack) · `DB_SYSTEM.md` (BD/consultas) · `AUTH_SYSTEM.md` (auth) · `CACHING_SYSTEM.md` · `CDN_SYSTEM.md` · `ICON_SYSTEM.md` · `MEDIA_FORMATS_SYSTEM.md` · `DOCKER_SYSTEM.md` · `TESTING_SYSTEM.md` · `TOOLS_SYSTEM.md` · `WORKFLOW_SYSTEM.md` · `VAULT_SYSTEM.md` (credenciales) · `DOMAINS_SYSTEM.md` · `MONITORING_SYSTEM.md` (UptimeRobot + ntfy) · `ANALYTICS_SYSTEM.md` · `ERRORS_SYSTEM.md` (Sentry) · `EMAILS_SYSTEM.md` · `PAYMENTS_SYSTEM.md` · `REVIEWS_SYSTEM.md` · `GOOGLE_SYSTEM.md` · `GLOBAL_ADVISOR_SYSTEM.md` (mensajes globales del admin a las webs) · `CORS_SYSTEM.md` · `BUSINESS_SYSTEM.md` · `OPENCODE_SYSTEM.md` (voz + comandos) · `MODELS_LLM_SYSTEM.md` (historial y facturación de modelos LLM) · `REMOTE_CONTROL_SYSTEM.md` (SSH/Tailscale/ciszu-ai) · `KNOWLEDGE_SYSTEM.md` (educación) · `DOCUMENTATION_SYSTEM.md` (reglas de docs) · `VISUAL_BUILDERS_SYSTEM.md` (editores visuales UI/UX) · `STATISTICS_SYSTEM.md` · `STATUS_SYSTEM.md` · `PROJECTS_SYSTEM.md` · `ACTIONS_RUNNERS_SYSTEM.md` (CI/deploys locales sin GH Actions) · `STAFF_SYSTEM.md` (gestión de empleados y STAFFCON) · `EMPLOYEES_SYSTEM.md` (modelo organizacional: cargos, rangos, permisos, horarios) · `CUSTOMERS_SYSTEM.md` (gestión de clientes y CUSTOMERSCON)

### Arquitectura por capas
`FRONTEND_SYSTEM.md` (frontend) · `BACKEND_SYSTEM.md` (backend) · `PACKAGES_SYSTEM.md` (paquetes compartidos) · `UI_COMPONENTS_SYSTEM.md` (componentes UI + Storybook/Chromatic/Figma) · `GLOBAL_COMPONENTS_SYSTEM.md` (sistemas globales: disclaimers, toasts, FABs, navbar/footer, zoom/island, theme/lang, auth) · `FRAMEWORKS_SYSTEM.md` (frameworks) · `STYLES_SYSTEM.md` (estilos) · `COLOR_SYSTEM.md` (color)

### Planes
`COMPANY_REGISTRATION_PLAN.md` · `RIF_PERSON_PLAN.md` · `COMMERCIAL_REGISTRATION_PLAN.md` · `INTERNATIONAL_LLC_PLAN.md` · `TAX_PLAN.md` · `TRADEMARK_PLAN.md` · `ORGANIZATIONAL_SCALABILITY_PLAN.md` · `RAG_VECTORS_PLAN.md` · `AI_ART_PLAN.md` · `VPS_PLAN.md` · `TOOLS_EVALUATION_PLAN.md` (evaluación de servicios/herramientas candidatas) · `INSTALLERS_SYSTEM.md`

### Protocolos
`SECURITY_PROTOCOLS.md` · `CODE_PRINCIPLES_PROTOCOLS.md` · `IT_GLOSSARY_PROTOCOLS.md` · `GEOGRAPHIC_CONTEXT_PROTOCOLS.md` · `HISTORICAL_CONTEXT_PROTOCOLS.md` · `TARGET_AUDIENCE_PROTOCOLS.md` · `HEALTH_AND_SAFETY_PROTOCOLS.md` · `SCHEDULE_PROTOCOLS.md` · `CONTACTS_PROTOCOLS.md` · `MATERIAL_ICONS_PROTOCOLS.md` · `ART_PROTOCOLS.md` · `DEVSECOPS_SYSTEM.md` · `ONLINE_SERVICES_SYSTEM.md`

### Estado
`TODO.md` (lista de tareas; solo lo edita Ciszuko Antony) · `PROJECT_HISTORY` (si aplica, ver `PROJECTS_SYSTEM.md`)

## Reglas

- Cambiar esta documentación = actualizar también las **referencias cruzadas** (paths,
  `docs/*.md`, scripts, `AGENTS.md`).
- No borrar secciones sin antes actualizar quien las referencia.
- Todo doc nuevo debe cumplir `DOCUMENTATION_SYSTEM.md`: nombre `NOMBRE_SUFIJO.md` (inglés,
  MAYÚSCULAS, `_`), cabecera estándar (Versión/Actualización/Identificador), mínimo **200
  líneas** y cierre con referencias.
- Los docs de estado quedan exentos del límite de líneas; `TODO.md` solo lo edita Ciszuko
  Antony.

_Última revisión: 24 ago 2026._ Relacionado: `DOCUMENTATION_SYSTEM.md`, `AGENTS.md`.
