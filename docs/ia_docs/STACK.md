# Ciszu Network — Technology Stack

## Core
- **Runtime:** Node.js 20+
- **Package Manager:** pnpm 10.8.1
- **Language:** TypeScript (strict)

## Web Apps (All Next.js 15)
- Framework: Next.js 15 (App Router)
- Styling: Tailwind 4 + PostCSS
- UI: Custom components (no UI library)
- Fonts: Geist via next/font
- Linting: ESLint (flat config)

## Backend
- **Auth & DB:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (bucket: ciszu-assets)
- **Client:** @supabase/supabase-js

## Desktop
- **Framework:** Tauri v2
- **Language:** Rust
- **Installer:** NSIS (Windows)
- **Splash Screen:** HTML/CSS/JS

## Discord Bot
- **Runtime:** Node.js
- **Library:** Discord.js
- **Language:** Vanilla JavaScript

## CI/CD
- **Platform:** GitHub Actions
- **Deployment:** Vercel (all websites)
- **Checks:** ESLint only (no tests)

## Security Stack (DevSecOps — SAST/DAST/Supply Chain)
- **Secretlint 13.0.4** — pre-commit hook (`.secretlintrc.json`)
- **Gitleaks 8.30.1** — pre-commit + history scan (`.gitleaks.toml`)
- **Semgrep 1.172.0** — SAST `p/security-audit` (`.semgrepignore`)
- **CodeQL (GitHub)** — SAST js + rust en cada push
- **OWASP ZAP 2.17.0** — DAST (daemon + API) sobre webs desplegadas
- **pnpm audit / cargo audit / trivy 0.72.0** — supply chain (CVE/RUSTSEC)
- **Sentry** — observabilidad free tier (error monitoring + tracing)
- **Configs**: `.gitleaks.toml`, `.semgrepignore`, `trivy.yaml`, `.secretlintrc.json`
- **Doctrina**: `docs/ia_docs/DEVSECOPS.md`, `docs/ia_docs/CODE_PRINCIPLES.md`

## Shared Packages
- **@ciszunetwork/cdn** — Asset resolver (icons, multimedia)

## Tooling
- **Pandoc 3.10** — Document conversion (md → docx)
- **Python/pip** — PDF generation (reportlab), weasyprint (GTK)
- **Windows** — Primary development platform