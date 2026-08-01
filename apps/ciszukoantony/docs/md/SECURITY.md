CISZUKO ANTONY - DOCUMENTACIÓN OFICIAL
Nombre: SECURITY
Versión: 3.0.0
Actualización: 2026-08-01
Identificador: SECURITY_V3.0.0_2026_08_01_ciszukoantony

---


SEGURIDAD / SECURITY

[ESPAÑOL]

SEGURIDAD DEL PORTFOLIO

SITIO WEB:
- Portfolio estático — no procesa datos de usuario
- No hay base de datos, autenticación ni formularios
- Los enlaces externos usan HTTPS

DEPENDENCIAS:
- Mantener Next.js, React y dependencias actualizadas
- Ejecutar npm audit regularmente

ASSETS:
- Los logos e imágenes están en public/ (estáticos)
- Los assets compartidos vía @ciszunetwork/cdn son de solo lectura

MARCO DE DESARROLLO SEGURO (DevSecOps)

El portfolio aplica la filosofía DevSecOps bajo marcos normativos globales
estables: OWASP Top 10, NIST SP 800-218 (SSDF) e ISO/IEC 27001.

- Shift-Left: pruebas de seguridad desde el pre-commit local hasta el deploy.
- SAST: Semgrep, Secretlint y Gitleaks detectan secretos y malas prácticas en el código.
- DAST: OWASP ZAP escanea la web desplegada.
- Auditoría de dependencias: pnpm audit contra bases CVE.
- Gestión de secretos: hooks pre-commit, .env excluido de git, rotación ante filtraciones.


---


[ENGLISH]

PORTFOLIO SECURITY

WEBSITE:
- Static portfolio — does not process user data
- No database, authentication, or forms
- External links use HTTPS

DEPENDENCIES:
- Keep Next.js, React, and dependencies updated
- Run npm audit regularly

ASSETS:
- Logos and images are in public/ (static)
- Shared assets via @ciszunetwork/cdn are read-only

SECURE DEVELOPMENT FRAMEWORK (DevSecOps)

The portfolio applies the DevSecOps philosophy under stable global
regulatory frameworks: OWASP Top 10, NIST SP 800-218 (SSDF) and ISO/IEC 27001.

- Shift-Left: security tests from local pre-commit to deployment.
- SAST: Semgrep, Secretlint and Gitleaks detect secrets and bad practices in code.
- DAST: OWASP ZAP scans the deployed website.
- Dependency auditing: pnpm audit against CVE databases.
- Secrets management: pre-commit hooks, .env excluded from git, rotation after leaks.
