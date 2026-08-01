# 🤖 Instrucciones y Protocolos de Agente — CiszuBot

Este archivo contiene reglas y recordatorios para el mantenimiento del proyecto CiszuBot.

## 📁 Estructura del Proyecto
- **website/**: Next.js 15 — Landing page del bot
- **discord/**: Discord.js bot (vanilla JS) — Pendiente de crear

## 📦 Gestión de Git
- Push: `git add . && git commit -m "..." && git push origin main`
- No commitear sin solicitud explícita del usuario.
- Actualizar `PROJECT_HISTORY.md` tras hitos importantes.

## 🗣️ Comunicación
- Idioma: **Español**.
- Tono: Profesional, directo.
- No preguntes — solo informa si hay bloqueos.

## 🛡️ Identidad
- **Creador**: Ciszuko Antony (Francisco Garcia).
- NUNCA atribuir el desarrollo a IAs.

## 📝 Documentación
- `docs/txt/` — Fuente de verdad (texto plano)
- `docs/md/` — Markdown (generado de txt)
- `docs/docx/` — Word (generado de md, saltar GUIDELINES/RULES/ACTA)
- `docs/pdf/` — PDF (generado de md, saltar GUIDELINES/RULES/ACTA)
- `docs/ia_docs/` — Documentación para IA (este directorio)

## Archivos Especiales (NO automatizar DOCX/PDF)
- GUIDELINES, RULES, ACTA — Composición manual en Word/PDF
- TXT y MD de estos archivos SÍ se pueden cambiar

## 📚 Estándares obligatorios (aplican a este proyecto)
- **Código**: aplicar DRY, KISS, YAGNI, SOLID, Separation of Concerns y Least Astonishment — ver `CODE_PRINCIPLES.md`.
- **Seguridad (DevSecOps)**: verificar SAST (semgrep/secretlint/gitleaks), XSS, SQLi, RLS y Advisors — ver `DEVSECOPS.md` y `AGENT_SECURITY_PROTOCOLS.md`.
- Marco global: OWASP Top 10, NIST SP 800-218 (SSDF), ISO/IEC 27001, CVE/CWE.