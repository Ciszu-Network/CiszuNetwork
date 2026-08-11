# 🛡️ DevSecOps — Marco de Seguridad Integrada (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-01
Identificador: DEVSECOPS_V1.0.0_2026_08_01_ciszunetwork

> Documentación para agentes de IA. Este documento define la filosofía, los métodos y las herramientas de seguridad que Ciszu Network aplica en **todas** las fases del ciclo de vida del desarrollo (SDLC). Se opera bajo marcos legales y normativos globales estables (OWASP, NIST, ISO/IEC 27001, CVE/CWE) con criterio profesional y serio.

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
| **gitleaks** | Secret scanning (DACP) | Pre-commit + historial + **CI (cada push/PR/diario)** | `gitleaks protect --staged --config .gitleaks.toml`; historial: `--log-opts="--all"`; en CI: job `gitleaks` de `ci.yml` (binary v8.30.1 oficial, `gitleaks detect --all --exit-code 1`) |
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
