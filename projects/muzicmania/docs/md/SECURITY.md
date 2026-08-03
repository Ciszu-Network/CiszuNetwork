MUZICMANIA - DOCUMENTACIÓN OFICIAL
Nombre: SECURITY
Versión: 3.0.0
Actualización: 2026-08-01
Identificador: SECURITY_V3.0.0_2026_08_01_muzicmania
------------------------------------------------------------

# POLÍTICA DE SEGURIDAD / SECURITY POLICY

[ESPAÑOL]
Nuestra prioridad es mantener MuzicMania seguro para todos los jugadores.

- Reporte de Vulnerabilidades: Si encuentras un fallo crítico, por favor contacta a security@muzicmania.com antes de hacerlo público.
- Medidas de Protección: Implementamos cifrado SSL, protección DDoS y sanitización de inputs para prevenir XSS.
- Prácticas Recomendadas: Nunca compartas tu contraseña y usa navegadores actualizados.

MARCO DE DESARROLLO SEGURO (DevSecOps)

MuzicMania aplica la filosofía DevSecOps: la seguridad se integra en cada
etapa del ciclo de vida del desarrollo (SDLC), bajo marcos normativos
globales estables: OWASP Top 10, NIST SP 800-218 (SSDF) e ISO/IEC 27001.

- Shift-Left: pruebas de seguridad desde el pre-commit local hasta el deploy.
- SAST (Análisis Estático): Semgrep, Secretlint, Gitleaks y CodeQL sobre el código fuente.
- DAST (Análisis Dinámico): OWASP ZAP sobre las aplicaciones desplegadas.
- Base de datos: Supabase con RLS, funciones SECURITY INVOKER y policies por comando.
- Auditoría de dependencias: pnpm audit, cargo audit y trivy contra bases CVE/RUSTSEC.
- Gestión de secretos: hooks pre-commit, .env excluido de git, rotación ante filtraciones.

------------------------------------------------------------

[ENGLISH]
Our priority is to keep MuzicMania safe for all players.

- Vulnerability Reporting: If you find a critical flaw, please contact security@muzicmania.com before making it public.
- Protection Measures: We implement SSL encryption, DDoS protection, and input sanitization to prevent XSS.
- Recommended Practices: Never share your password and use updated browsers.

SECURE DEVELOPMENT FRAMEWORK (DevSecOps)

MuzicMania applies the DevSecOps philosophy: security is integrated into
every stage of the software development lifecycle (SDLC), under stable
global regulatory frameworks: OWASP Top 10, NIST SP 800-218 (SSDF) and
ISO/IEC 27001.

- Shift-Left: security tests from local pre-commit to deployment.
- SAST (Static Analysis): Semgrep, Secretlint, Gitleaks and CodeQL on source code.
- DAST (Dynamic Analysis): OWASP ZAP on deployed applications.
- Database: Supabase with RLS, SECURITY INVOKER functions and per-command policies.
- Dependency auditing: pnpm audit, cargo audit and trivy against CVE/RUSTSEC databases.
- Secrets management: pre-commit hooks, .env excluded from git, rotation after leaks.
