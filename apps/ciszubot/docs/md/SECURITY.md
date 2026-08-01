CISZUBOT - DOCUMENTACIÓN OFICIAL
Nombre: SECURITY
Versión: 3.0.0
Actualización: 2026-08-01
Identificador: SECURITY_V3.0.0_2026_08_01_ciszubot

---


SEGURIDAD / SECURITY

[ESPAÑOL]

SEGURIDAD DEL BOT

TOKEN Y CREDENCIALES:
- El token de Discord se almacena en .env (no versionado)
- Variables requeridas: DISCORD_TOKEN, CLIENT_ID, GUILD_ID
- No compartir el token ni commitearlo

PANEL DE ADMINISTRACIÓN:
- Express corre en localhost:5000 (no expuesto públicamente)
- No agregar rutas sensibles sin autenticación

COMANDOS:
- confess publica el mensaje y elimina el original (anonimato)
- No almacenar confesiones en base de datos
- Validar entradas del usuario en todos los comandos

DEPENDENCIAS:
- Mantener discord.js y express actualizados
- Ejecutar npm audit regularmente
- Usar pnpm con ignore-scripts=true

MARCO DE DESARROLLO SEGURO (DevSecOps)

CiszuBot aplica la filosofía DevSecOps bajo marcos normativos globales
estables: OWASP Top 10, NIST SP 800-218 (SSDF) e ISO/IEC 27001.

- Shift-Left: pruebas de seguridad desde el pre-commit local hasta el deploy.
- SAST: Semgrep, Secretlint y Gitleaks detectan secretos y malas prácticas en el código.
- DAST: OWASP ZAP escanea la landing page desplegada.
- Auditoría de dependencias: pnpm audit contra bases CVE.
- Gestión de secretos: hooks pre-commit, .env excluido de git, rotación ante filtraciones.


---


[ENGLISH]

BOT SECURITY

TOKEN AND CREDENTIALS:
- The Discord token is stored in .env (not versioned)
- Required variables: DISCORD_TOKEN, CLIENT_ID, GUILD_ID
- Do not share the token or commit it

ADMIN PANEL:
- Express runs on localhost:5000 (not publicly exposed)
- Do not add sensitive routes without authentication

COMMANDS:
- confess posts the message and deletes the original (anonymous)
- Do not store confessions in a database
- Validate user input on all commands

DEPENDENCIES:
- Keep discord.js and express updated
- Run npm audit regularly
- Use pnpm with ignore-scripts=true

SECURE DEVELOPMENT FRAMEWORK (DevSecOps)

CiszuBot applies the DevSecOps philosophy under stable global regulatory
frameworks: OWASP Top 10, NIST SP 800-218 (SSDF) and ISO/IEC 27001.

- Shift-Left: security tests from local pre-commit to deployment.
- SAST: Semgrep, Secretlint and Gitleaks detect secrets and bad practices in code.
- DAST: OWASP ZAP scans the deployed landing page.
- Dependency auditing: pnpm audit against CVE databases.
- Secrets management: pre-commit hooks, .env excluded from git, rotation after leaks.
