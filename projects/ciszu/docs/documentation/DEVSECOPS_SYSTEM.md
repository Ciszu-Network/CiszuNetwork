# 🛡️ DEVSECOPS_SYSTEM — Sistema de Seguridad Integrada (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: DEVSECOPS_SYSTEM_V2.0.0_2026_08_13_ciszunetwork

> Documentación para agentes de IA. Este documento define la filosofía, los métodos y las
> herramientas de seguridad que Ciszu Network aplica en **todas** las fases del ciclo de vida
> del desarrollo (SDLC). Se opera bajo marcos legales y normativos globales estables (OWASP,
> NIST, ISO/IEC 27001, CVE/CWE) con criterio profesional y serio. Es el **sistema de seguridad
> integrado** del monorepo: SAST + DAST + IAST + auditoría de dependencias + secretos.

---

## 1. Filosofía: DevSecOps

**DevSecOps** es la evolución del desarrollo ágil y de DevOps donde la seguridad (Sec) se integra **desde el principio y en cada etapa** del SDLC, en lugar de aplicarse solo al final del proyecto.

- **Objetivo**: automatizar revisiones de seguridad dentro de las herramientas cotidianas del desarrollador y de los pipelines (CI/CD), reduciendo costos y riesgos.
- **Consecuencia práctica**: ningún commit, deploy o dependencia se acepta sin pasar por los controles automatizados definidos en este documento.

### Los 3 pilares

| Pilar | Descripción | Herramientas Ciszu Network |
|---|---|---|
| **SAST** (Static Application Security Testing) | Análisis estático del código fuente sin ejecutarlo: detecta malas prácticas, inyecciones, XSS y secretos antes de correr | **Semgrep**, **Secretlint**, **Gitleaks**, ESLint, TypeScript strict |
| **DAST** (Dynamic Application Security Testing) | Análisis dinámico desde el exterior contra la app desplegada, simulando ataques reales (SQLi, XSS) | **OWASP ZAP** (semanal en CI), **Playwright security-e2e** (diario en CI) |
| **IAST** (Interactive Application Security Testing) | Sensor DENTRO de la aplicación que observa el tráfico real en runtime y detecta payloads (SQLi/XSS/traversal/command injection/secrets) | **`createIast`** en `@ciszunetwork/utils` — middleware de las 4 webs (edge-safe, solo observa, log `[IAST]`) |
| **Auditoría de dependencias** | Consulta de bases de datos de vulnerabilidades públicas (CVE/CWE) para cada paquete instalado | **pnpm audit**, **cargo audit**, **trivy**, Dependabot, CodeQL |

## 2. Shift-Left (Desplazamiento a la Izquierda)

Filosofía de mover las pruebas de calidad y seguridad **lo más temprano posible** en el proceso:

```
[1] Pre-commit (local) → [2] Push → [3] PR → [4] CI → [5] Deploy → [6] Producción
        ▲                          ▲         ▲       ▲          ▲          ▲
   Secretlint       Gitleaks/   CodeQL  Semgrep   Vercel     ZAP (DAST
   Gitleaks         Semgrep     Review  lint      deploy     semanal CI)
   (hook local)     (CI)                        + IAST (sensor runtime en prod)
```

- **Ideal**: detectar el error en la computadora del programador **antes del commit**.
- **Realidad**: la detección tardía (producción) multiplica el costo de la corrección.

## 3. Herramientas y métodos oficiales

| Herramienta | Tipo | Fase | Cómo se ejecuta |
|---|---|---|---|
| **secretlint** | Secret scanning (SAST) | Pre-commit | Hook `pre-commit` global (`node .../secretlint.js --secretlintrc .secretlintrc.json`) |
| **gitleaks** | Secret scanning (DACP) | Pre-commit + **CI (cada push/PR/diario)** | `gitleaks protect --staged --config .gitleaks.toml`; en CI: job `gitleaks` de `ci.yml` (binary v8.30.1 oficial, escanea **solo el diff del push/PR**, no el historial completo) |
| **semgrep** | SAST (reglas p/security-audit) | CI / manual | `semgrep scan --config p/security-audit` (con `.semgrepignore`) |
| **CodeQL** | SAST (GitHub Advanced Security) | CI (cada push) | Workflow `codeql.yml` (javascript + rust) |
| **pnpm audit** | Auditoría de dependencias | CI (cada push/PR/diario) | Job `audit` en `ci.yml`: `pnpm audit --prod --audit-level high` (0 vulns) |
| **cargo audit** | Auditoría Rust (Tauri) | Manual / CI | `cargo audit` (17 warnings permitidos: glib/unic-ucd-version) |
| **trivy** | Escaneo de imágenes/lockfiles | Manual | `trivy fs --config trivy.yaml pnpm-lock.yaml` |
| **IAST** (`createIast`) | IAST runtime | **Producción (siempre activo)** | Middleware de las 4 webs → `console.warn('[IAST] {json}')`; Vercel Logs filtrando "IAST" |
| **Playwright security-e2e** | DAST interactivo | CI (cada push/PR/diario) | Job `security-e2e` en `ci.yml`: `test/website/e2e/security.spec.ts` contra las 4 webs en prod |
| **ZAP** (OWASP) | DAST full | Semanal (lunes 06:30 UTC) + manual local | Workflow `dast.yml` (matrix 4 webs, `zaproxy/action-baseline@v0.15.0`); local: daemon + API REST (`spider` + `ascan`), reporte HTML |
| **Sentry** | Observabilidad (errores en runtime) | Producción | Free tier: error monitoring + tracing (5k errores/mes) |

### Contexto: secretos y control de versiones

- **CVE** (Common Vulnerabilities and Exposures): catálogo público mundial de vulnerabilidades. `pnpm audit`/`cargo audit`/trivy consultan bases basadas en CVE (y en Rust, RUSTSEC).
- **CWE**: taxonomía de tipos de debilidad (usada por semgrep y CodeQL para clasificar findings).
- **Secret Sprawl** (proliferación de secretos): ocurre cuando credenciales sensibles se multiplican y filtran por error en configs, historial de git o capturas. Mitigación: rotación periódica, `.env` gitignored, hooks pre-commit, lista de rotación `Temp\opencode\tokens_a_rotar.md`.
- **OWASP Top 10 / NIST SP 800-218 (SSDF) / ISO/IEC 27001**: marcos de referencia globales que guían las reglas de RLS, auth y manejo de secretos del proyecto.

## 4. Reglas de oro para el agente (checklist obligatorio)

1. **Advisors**: tras cualquier cambio en policies/funciones de Supabase, verificar Security + Performance Advisors.
2. **XSS**: nunca `innerHTML`/`dangerouslySetInnerHTML` con datos de usuario sin sanitizar (DOMPurify si es inevitable).
3. **SQLi**: nunca concatenar SQL; usar ORM parametrizado (`@supabase/supabase-js`) o RPC con objetos.
4. **SECURITY DEFINER**: solo cuando sea estrictamente necesario (triggers); preferir INVOKER.
5. **RLS**: policies separadas por comando (no ALL), `auth.*()` envuelto en `(SELECT ...)`, evitar `USING(true)`.
6. **Secretos**: nunca imprimir valores de `.env`; referirse a variables genéricamente.
7. **Dependencias**: proponer librerías nuevas y esperar aprobación humana; nunca instalar sin validar.
8. **DAST**: correr ZAP (spider + ascan) sobre las 4 webs antes de anunciar "cero vulnerabilidades".

## 5. Métricas de cierre de la sesión de seguridad (jul 2026)

- Code scanning (CodeQL): 31/31 fixed · Dependabot: 35/36 (resta `glib` Rust, requiere Tauri 3)
- Secret scanning: 1 alerta cerrada (PAT revocado, 1 ago 2026)
- Semgrep: 0 findings reales · ZAP: 0 High / 4 Medium (CSP, ACAO `:*`, clickjacking, SRI)
- pnpm audit: 0 vulns · trivy: 0 HIGH/CRITICAL · cargo audit: 17 warnings permitidos

## 6. Pipeline de seguridad completo (shift-left, una línea)

```
Pre-commit (secretlint, gitleaks) → Push → CI (lint, vitest, semgrep, pnpm audit, gitleaks,
codeql, security-e2e) → Deploy (Vercel, IAST siempre activo en prod) → Producción (ZAP semanal,
Sentry, advisors Supabase)
```

## 7. Protocolos de seguridad obligatorios (resumen ejecutivo)

1. **RLS en toda tabla nueva** en la misma migración + policy por comando; verificar con dbvr.
2. **Rate limit en todo POST** que muta o consume servicio externo (`createRateLimiter`).
3. **Secretos solo como `process.env.X`** (server-only); `NEXT_PUBLIC_` solo para lo público.
4. **XSS**: nunca `dangerouslySetInnerHTML`/`innerHTML` con datos de usuario; `escapeHtml()`.
5. **SQLi**: ORM parametrizado o RPC con objetos; nunca concatenar SQL.
6. **SECURITY DEFINER** solo en triggers; preferir INVOKER con `search_path` explícito.
7. **RLS policies separadas por comando**, `auth.*()` envuelto en `(SELECT ...)`.
8. **Webs nuevas**: `robots.ts` + middleware (security headers + CSP `buildCsp()`) + IAST `createIast()`.
9. **Verificar con fuentes externas** (dbvr, curl prod, build output) — no confiar en estado local.
10. Tras cambios en policies/funciones: Security + Performance Advisors en dashboard.

## 8. Cómo auditar un cambio (checklist de seguridad)

- [ ] ¿Toca BD/policies? → Advisors + dbvr + revisar migración numerada.
- [ ] ¿Expones datos? → verificar RLS de la tabla, `USING`/`WITH CHECK`.
- [ ] ¿Acepta input de usuario? → escape/XSS + validación server-side + rate limit.
- [ ] ¿Usa secretos? → `process.env` server-only, sin fallbacks hardcodeados.
- [ ] ¿Nueva dependencia? → aprobación humana + `pnpm audit`.
- [ ] ¿Cambia headers/CSP? → mantener `buildCsp()` y no romper IAST.

## 9. Incidentes y respuesta

- **Sospecha de secret filter**: rotar la key, cerrar alerta en GitHub, actualizar `VAULT_SYSTEM.md`
  (lista `tokens_a_rotar` en `Temp\opencode\tokens_a_rotar.md`).
- **Vulnerabilidad dependencia**: `pnpm audit` / `cargo audit`, actualizar paquete, re-build.
- **Ataque en runtime**: logs Vercel filtrando `[IAST]`, Sentry, ZAP manual contra la web.
- **Repo público**: rotar TODAS las keys de Turnstile (pendiente cuando GitHub sea público).

## 10. Relación con otros sistemas

- `SECURITY_PROTOCOLS.md` — checklist completo no negociable (fuente de detalle).
- `VAULT_SYSTEM.md` — almacenamiento de secretos (age, ACLs NTFS, BitLocker E:).
- `ERRORS_SYSTEM.md` — observabilidad de errores (Sentry).
- `TESTING_SYSTEM.md` — tests unitarios y E2E de seguridad (Playwright).
- `TOOLS_SYSTEM.md` — instalación/uso de ZAP, semgrep, trivy, gitleaks, secretlint.

## 11. Herramientas SAST/DAST del repo

| Herramienta | Fase | Cuándo corre | Qué detecta |
|---|---|---|---|
| **ESLint + types** | Code review | local + CI | errores, bugs, tipos |
| **semgrep** | SAST | CI (`ci.yml`) | patrones inseguros (SQLi, XSS, `dangerouslySetInnerHTML`) |
| **gitleaks** | Secrets | pre-commit + CI | secretos en diff |
| **secretlint** | Secrets | pre-commit | secretos conocidos en files |
| **CodeQL** | SAST | CI (`codeql.yml`) | vulns js + rust |
| **pnpm audit / cargo audit** | SCA | CI + manual | dependencias vulnerables |
| **OWASP ZAP** | DAST | semanal (`dast.yml`) + manual | ataques contra webs en prod |
| **Playwright security-e2e** | DAST | CI | cabeceras, CSP, IAST, paths |
| **UptimeRobot** | Availability | 24/7 | downtime webs + bot |

## 12. Ciclo de vida de una vulnerabilidad (playbook)

1. **Detección**: CI falla / alerta GitHub / alerta UptimeRobot / ZAP / PostHog anomalía.
2. **Triaje**: ¿afecta prod? ¿crítica? ¿requiere acción inmediata?
3. **Respuesta**: fix + test de regresión + re-deploy (push a `main`).
4. **Post-mortem**: registrar en `ERRORS_SYSTEM.md` / `PROJECT_HISTORY`, rotar secrets si aplica.
5. **Prevención**: actualizar `SECURITY_PROTOCOLS.md` y `DEVSECOPS_SYSTEM.md` con la lección.

## 13. Métricas de seguridad que se monitorizan

- Secretos detectados y bloqueados (0 en historial limpio).
- Vulnerabilidades abiertas de `pnpm audit`/CodeQL (target: 0 críticas).
- Cabeceras/CSP de las 4 webs (Playwright security-e2e verde).
- Uptime de las 4 webs + bot (UptimeRobot ≥ 99%).
- Advisors de Supabase (Security + Performance) sin warning pendiente.

## 14. Defensa en profundidad (capas de control)

| Capa | Control | Herramienta |
|---|---|---|
| **Código** | SAST + tipos + superficie mínima | semgrep, CodeQL, ESLint, TypeScript strict |
| **Commit** | Secret scanning + lint de secretos | gitleaks, secretlint (hooks) |
| **Repositorio/deps** | SCA + revisión de PR | pnpm/cargo audit, trivy, Dependabot |
| **App en runtime** | IAST + errores + trazado | `createIast`, Sentry, Playwright security-e2e |
| **Perímetro** | DAST + cabeceras/CSP | ZAP semanal, `buildCsp()`, Cloudflare |
| **Datos** | RLS + políticas + audit | Supabase (Advisors), migraciones con RLS |

## 15. Matriz de priorización de remediación

| Severidad | Ejemplo | SLA objetivo | Acción |
|---|---|---|---|
| **Crítica** | Secreto filtrado, RCE | <24 h | Rotar secreto + fix + redeploy + post-mortem |
| **Alta** | SQLi en endpoint público | <72 h | Fix + test de regresión + re-deploy |
| **Media** | Cabecera CSP incompleta, ACAO `:*` | ≤1 semana | Recoger en to-do; no bloquea release |
| **Baja** | Falso positivo, queja menor | Backlog | Evaluar en la siguiente auditoría |

- Referencia de severidad actual: ZAP 0 High / 4 Medium (ver §5).
- "Cero vulnerabilidades" ≠ sin deuda: hay que distinguir criticidad y bloqueo de release.

## 16. Seguridad en cada fase del SDLC

1. **Diseño** — amenazas (STRIDE ligero), RLS/rate limit planificados en la migración.
2. **Desarrollo** — tipos, hooks, semgrep local, no imprimir secretos (regla §4.6).
3. **Build/CI** — lint, vitest, semgrep, audit, gitleaks diff, CodeQL, security-e2e.
4. **Deploy** — Vercel production, envs por proyecto, IAST siempre activo.
5. **Producción** — ZAP semanal, Sentry, UptimeRobot, Advisors, rotación de tokens.

## 17. Indicadores tempranos de incidente

- Picos de errores en Sentry no explicados por un cambio.
- `[IAST]` en logs de Vercel con payloads anómalos (SQLi/XSS/traversal).
- Alerta UptimeRobot/ntfy fuera de horario de deploy.
- Advisors de Supabase con warning inesperado.
- Dependencia con CVE crítica recién publicada (Dependabot).

En esos casos abrir incidente según el playbook (§12) en vez de esperar a la auditoría.

## 18. FAQ de DevSecOps

| Pregunta | Respuesta |
|---|---|
| ¿Qué se ejecuta en cada push? | CI: lint, tests, semgrep, audit, gitleaks, security-e2e + CodeQL |
| ¿ZAP corre automático? | Sí, semanal (lunes) vía `dast.yml`; manual con el daemon local |
| ¿Si hay IAST hace falta ZAP? | Sí: IAST observa, ZAP ataca; suman superficie |
| ¿Dónde están las reglas RLS? | `SECURITY_PROTOCOLS.md` (no negociables) |
| ¿Y los falsos positivos? | Se documentan con `--no-verify` justificado; se revisan en auditoría |

_Última revisión: 13 ago 2026._ Relacionado: `SECURITY_PROTOCOLS.md`, `CODE_PRINCIPLES_PROTOCOLS.md`,
`VAULT_SYSTEM.md`, `TESTING_SYSTEM.md`.
