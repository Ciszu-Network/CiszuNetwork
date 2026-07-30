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

## Shared Packages
- **@ciszunetwork/cdn** — Asset resolver (icons, multimedia)

## Tooling
- **Pandoc 3.10** — Document conversion (md → docx)
- **Python/pip** — PDF generation (reportlab), weasyprint (GTK)
- **Windows** — Primary development platform