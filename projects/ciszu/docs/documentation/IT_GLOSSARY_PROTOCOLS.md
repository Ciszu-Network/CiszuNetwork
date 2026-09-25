# IT_GLOSSARY_PROTOCOLS — Glosario de Términos de Informática (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: IT_GLOSSARY_PROTOCOLS_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: glosario de referencia de términos informáticos usados en el monorepo.
> A diferencia de `FULL_STACK_SYSTEM.md` (qué tecnologías usamos), aquí se explican **conceptos y
> términos**: arquitectura, protocolos, estándares, jerga. Protocolo de uso: un término
> técnico mencionado en cualquier doc debe poder encontrarse aquí.

---

## 1. Protocolo de uso del glosario

1. **Cobertura**: cualquier acrónimo o término técnico en docs/código debe tener entrada aquí.
2. **Formato**: cada entrada = término (EN/ES), definición breve y contexto Ciszu Network.
3. **Añadir términos**: al usarlos por primera vez en una doc, añadir aquí (no duplicar la
   explicación en la doc: enlazar).
4. **No inventar**: solo términos reales del stack (ver `FULL_STACK_SYSTEM.md`) y conceptos de
   informática general que apliquen.

---

## 2. Arquitectura y sistemas

| Término | Definición | En Ciszu Network |
|---|---|---|
| **Monorepo** | Repositorio único que contiene múltiples proyectos/paquetes | pnpm workspaces + Turborepo en la raíz |
| **Turborepo** | Orquestador de builds con caché para monorepos | `pnpm build` con caché de tareas |
| **pnpm workspace** | Gestión de dependencias multi-paquete con links simbólicos | `packages/*` + 4 apps en `projects/` |
| **BaaS** (Backend-as-a-Service) | Backend gestionado por un tercero (BD, auth, storage) | Supabase |
| **SaaS** (Software-as-a-Service) | Software entregado por suscripción vía web | Productos futuros |
| **Serverless** | Ejecución de funciones sin gestionar servidores | Vercel Functions, edge |
| **Edge** (cómputo) | Ejecución cerca del usuario (CDN/región) | Middleware Next.js, Cloudflare |
| **API** (Application Programming Interface) | Interfaz para que programas se comuniquen | REST de Supabase, APIs de Vercel |
| **REST** | Estilo de API basado en recursos HTTP (GET/POST/PUT/DELETE) | PostgREST de Supabase |
| **RPC** (Remote Procedure Call) | Llamar una función remota como local | RPC de Supabase (functions) |
| **SDK** | Kit de desarrollo que envuelve una API | supabase-js, Discord.js |

## 3. Web y frontend

| Término | Definición | En Ciszu Network |
|---|---|---|
| **Next.js** | Framework React con SSR/SSG/App Router | 4 webs del ecosistema |
| **App Router** | Router de Next.js 15 con archivos `app/` y server components | Todas las webs |
| **SSR** (Server-Side Rendering) | Renderizar HTML en el servidor | Layouts/guard de las webs |
| **SSG** (Static Site Generation) | Generar HTML estático en build | Páginas estáticas |
| **SPA** (Single Page Application) | App que navega sin recargar | Componentes client (`'use client'`) |
| **CSR** (Client-Side Rendering) | Renderizar en el navegador | Componentes interactivos |
| **CWV** (Core Web Vitals) | Métricas de rendimiento real (LCP/CLS/INP) | Vercel Speed Insights (MuzicMania) |
| **LCP** | Largest Contentful Paint: tiempo de pintura principal | Se vigila tras el fix del guard SSR |
| **CLS** | Cumulative Layout Shift: saltos de layout | `overflow:hidden` en guard activo |
| **INP** | Interaction to Next Paint: latencia de interacción | — |
| **JSX/TSX** | Sintaxis de React embebida en JS/TS | Componentes `.tsx` |
| **hydration** | Proceso de "activar" HTML estático en el cliente | MuzicMania (shim legacy) |
| **PWA** | Progressive Web App: instalable con SW + manifest | 4 webs (manifest + sw + botón instalar) |
| **Service Worker** | Script que intercepta red/caché en el cliente | `sw.js` de las webs |
| **CSP** (Content-Security-Policy) | Cabecera que restringe recursos | `buildCsp()` en middlewares |

## 4. Backend y base de datos

| Término | Definición | En Ciszu Network |
|---|---|---|
| **PostgreSQL** | Motor de BD relacional open-source | BD de Supabase |
| **PostgREST** | Convierte Postgres en API REST | REST de Supabase |
| **Schema** | Contenedor lógico de tablas | `ciszubot`, `muzicmania`, `ciszu` |
| **RLS** (Row Level Security) | Filtrar filas según el usuario en la BD | 28/28 tablas, migración 16 |
| **Policy** | Regla de acceso de RLS (SELECT/INSERT/UPDATE/DELETE) | Policies separadas por comando |
| **SQLi** (SQL Injection) | Inyección de SQL malicioso | Protegido con ORM parametrizado/RPC |
| **CTE** | Common Table Expression (`WITH`) | Consultas complejas |
| **Migration** | Cambio versionado del esquema | `apply-migration-XX.js`, 16 aplicadas |
| **Trigger** | Función que se ejecuta ante un evento de tabla | Trigger functions (REVOKE EXECUTE) |
| **Heartbeat** | Señal periódica de que algo sigue vivo | Bot cada 60s → `bot_status` |
| **Cache invalidation** | Borrar/actualizar datos cacheados | Caché multi-tienda |

## 5. Seguridad

| Término | Definición | En Ciszu Network |
|---|---|---|
| **SAST** | Análisis estático de seguridad | Semgrep, CodeQL, secretlint |
| **DAST** | Análisis dinámico contra la app desplegada | OWASP ZAP (semanal), Playwright security-e2e |
| **IAST** | Sensor de seguridad en runtime dentro de la app | `createIast()` en `@ciszunetwork/utils` |
| **XSS** | Cross-Site Scripting: ejecutar scripts en la web | `escapeHtml()`, DOMPurify |
| **CSRF** | Cross-Site Request Forgery | Cookies httpOnly, HMAC (dashboard bot) |
| **OAuth2** | Protocolo de autorización delegada | Dashboard de CiszuBot (Discord OAuth) |
| **HMAC** | Firma basada en hash para verificar integridad | Cookies del dashboard + IPN NOWPayments |
| **CAPTCHA** | Prueba humano-o-máquina | Turnstile (Cloudflare) |
| **CVE/CWE** | Catálogos públicos de vulnerabilidades/debilidades | pnpm audit, cargo audit, trivy |
| **Secret Sprawl** | Proliferación de secretos filtrados | Rotación + hooks + vault |
| **Zero Trust** | No confiar en nada por defecto | Filosofía RLS + rate limits |

## 6. Infraestructura y despliegue

| Término | Definición | En Ciszu Network |
|---|---|---|
| **CDN** (Content Delivery Network) | Red de servidores que sirve assets cerca del usuario | Supabase Storage `ciszu-cdn` |
| **Proxy** | Intermediario entre cliente y servidor | Cloudflare (capa DNS, futuro) |
| **DNS** | Sistema de nombres de dominio → IP | En `DOMAINS_SYSTEM.md` |
| **Vercel** | Plataforma de deploy para Next.js | 4 proyectos, deploy desde `main` |
| **CI/CD** | Integración y despliegue continuos | GitHub Actions (ci, codeql, dast, deploy) |
| **Build cache** | Caché de resultados de compilación | Turborepo |
| **Docker** | Contenedores de aplicación | Bot (node:24-alpine) |
| **Tauri** | Framework de apps de escritorio con WebView + Rust | MuzicMania desktop |
| **WebView2** | Motor de renderizado de Windows para Tauri | MuzicMania en Windows |
| **NSIS** | Instalador de Windows | Instaladores de MuzicMania |

## 7. Redes y protocolos

| Término | Definición | En Ciszu Network |
|---|---|---|
| **HTTP/HTTPS** | Protocolo de transferencia web / seguro | Todas las webs |
| **Webhook** | Notificación HTTP enviada por un servicio | ntfy, GitHub Actions |
| **IPN** (Instant Payment Notification) | Notificación de pago de NOWPayments | Firma HMAC verificada |
| **SSE/WebSocket** | Comunicación bidireccional/streaming | — (futuro, scores en vivo) |
| **Tailscale** | VPN/malla para conectar máquinas | Control remoto (`REMOTE_CONTROL_SYSTEM.md`) |
| **UDP/TCP** | Protocolos de transporte | Subyacente a todo lo de red |

## 8. Datos y analítica

| Término | Definición | En Ciszu Network |
|---|---|---|
| **Funnel / Embudo** | Secuencia de pasos que un usuario sigue | Embudos en PostHog (fase 2) |
| **Retención** | Qué % de usuarios vuelve | PostHog |
| **Cohorte** | Grupo de usuarios por criterio (fecha, atributo) | PostHog |
| **Evento** | Acción registrada (pageview, click, score) | `$pageview`, `submit_score` |
| **Session replay** | Grabación de la sesión del usuario | PostHog (solo páginas de producto) |
| **RUM** (Real User Monitoring) | Métricas de usuarios reales | Vercel Speed Insights |
| **ETL** (Extract-Transform-Load) | Pipeline de datos | — |
| **KPI** | Indicador clave de rendimiento | Votos, scores, guilds |

## 9. Jerga de desarrollo (daily)

| Término | Definición |
|---|---|
| **Lint** | Análisis estático de estilo/errores |
| **Typecheck** | Verificación de tipos TS |
| **Build** | Compilación a producción |
| **Deploy** | Publicar en producción |
| **Regression** | Error que reaparece tras un cambio |
| **Hotfix** | Corrección urgente |
| **Refactor** | Reescribir sin cambiar comportamiento |
| **DRY/KISS/YAGNI/SOLID** | Principios (ver `CODE_PRINCIPLES_PROTOCOLS.md`) |
| **Tech debt** | Deuda técnica acumulada |
| **Stub** | Implementación vacía a futuro (p.ej. Lemon Squeezy) |

## 10. Checklist de uso

- [ ] Término nuevo en una doc → añadir entrada aquí.
- [ ] Acrónimo → escribir el significado completo la 1ª vez + enlazar glosario.
- [ ] No duplicar definiciones largas en cada doc (usar este glosario).

## 11. Acrónimos frecuentes (maestro)

| Acrónimo | Significado | Nota |
|---|---|---|
| **AI/IA** | Inteligencia Artificial | Agentes, modelos |
| **API** | Application Programming Interface | — |
| **BaaS** | Backend-as-a-Service | Supabase |
| **CSP** | Content-Security-Policy | Cabecera de seguridad |
| **CVE** | Common Vulnerabilities and Exposures | Catálogo de vulns |
| **CWV** | Core Web Vitals | Métricas de rendimiento |
| **DNS** | Domain Name System | — |
| **E2E** | End-to-End | Tests de flujo completo |
| **HTTP(S)** | HyperText Transfer Protocol (Secure) | — |
| **IPN** | Instant Payment Notification | NOWPayments |
| **JWT** | JSON Web Token | Sesiones |
| **KPI** | Key Performance Indicator | — |
| **LCP/CLS/INP** | Métricas CWV | — |
| **NSIS** | Nullsoft Scriptable Install System | Instalador Windows |
| **OAuth2** | Protocolo de autorización | Dashboard bot |
| **ORM** | Object-Relational Mapping | — |
| **PWA** | Progressive Web App | — |
| **RLS** | Row Level Security | — |
| **RPC** | Remote Procedure Call | — |
| **SAST/DAST/IAST** | Análisis estático/dinámico/IAST de seguridad | — |
| **SaaS** | Software-as-a-Service | — |
| **SPA** | Single Page Application | — |
| **SQL** | Structured Query Language | — |
| **SSR/SSG** | Server-Side Rendering / Static Site Generation | — |
| **UI/UX** | User Interface / User Experience | — |
| **URL/URI** | Uniform Resource Locator/Identifier | — |

## 12. Glosario de herramientas del repo (rápido)

| Herramienta | Tipo | Para qué |
|---|---|---|
| Supabase | BaaS | BD/Auth/Storage/CDN |
| Vercel | Hosting | Deploy de las webs |
| GitHub Actions | CI/CD | Pipelines |
| Turborepo | Monorepo | Builds con caché |
| Docker | Contenedores | Bot en node:24-alpine |
| Tauri | Desktop | MuzicMania |
| Playwright | E2E | Tests de navegador |
| Vitest | Unit | Tests de lógica |
| Semgrep | SAST | Escaneo estático |
| OWASP ZAP | DAST | Escaneo dinámico |
| PostHog | Analytics | Producto |
| Sentry | Errores | Runtime errors |
| UptimeRobot | Uptime | Disponibilidad |
| ntfy | Push | Notificaciones |
| dbvr | Consola SQL | Scripts de BD |
| Pandoc | Docs | Conversión de formatos |

## 13. Terminología de caché

| Término | Definición |
|---|---|
| **TTL** (Time To Live) | Tiempo de vida de un dato en caché |
| **Key-value store** | Almacén por clave→valor |
| **Hit/Miss** | Encontrado/no encontrado en caché |
| **Invalidación** | Borrar datos obsoletos |
| **Stale** | Dato caducado |
| **Multi-tier cache** | Varias capas de caché (mem→KV→BD) |
| **Persistencia** | Dato sobrevive reinicios |
| **Redundancia** | Replicación para disponibilidad |

## 14. Terminología de despliegue

| Término | Definición |
|---|---|
| **Deploy** | Publicar nueva versión |
| **Rollback** | Volver a versión anterior |
| **Preview** | Deploy de vista previa |
| **Producción** | Entorno real de usuarios |
| **Staging** | Entorno de pruebas |
| **CI** | Compilación+tests automáticos |
| **CD** | Despliegue automático |
| **Artifact** | Archivo generado (build) |
| **Release** | Versión publicada |
| **Changelog** | Registro de cambios |

## 15. Regla de mantenimiento del glosario

- Revisar al añadir un doc nuevo: si introduce términos no listados, añadirlos aquí.
- Mantener orden alfabético dentro de cada sección.
- Los docs del sistema enlazan el glosario en su pie de "Relacionado".

_Última revisión: 13 ago 2026._ Relacionado: `FULL_STACK_SYSTEM.md`, `FRAMEWORKS_SYSTEM.md`,
`BACKEND_SYSTEM.md`, `IT_GLOSSARY` es el índice conceptual del stack.
