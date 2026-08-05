# Ciszu Network — Architecture Overview

## Repository Structure
```
ciszu-network/
├── projects/
│   ├── website/              # CiszuNetwork main page (Next.js 15)
│   ├── ciszukoantony/        # Portfolio (Next.js 15)
│   │   └── website/
│   ├── muzicmania/           # Music game
│   │   ├── website/          # Web version (Next.js 15 + Tauri)
│   │   ├── launcher/         # Desktop app (Tauri + Rust)
│   │   └── mobile/           # Mobile placeholder
│   └── ciszubot/             # Discord bot
│       ├── website/          # Bot landing page (Next.js 15)
│       └── discord/          # Bot code (Node.js/vanilla)
├── packages/
│   ├── cdn/                  # Asset resolver (@ciszunetwork/cdn)
│   └── ...                    # Future shared packages
├── services/
│   └── supabase/             # Supabase config & migrations
├── scripts/                  # Root-level automation scripts
├── docs/                     # Root-level documentation
├── ciszugamens/              # Gaming community (standalone)
├── ciszukoantony/            # Personal brand (standalone)
└── content/                  # Master media assets
```

## Key Design Decisions
- **pnpm workspaces** for dependency management
- **Next.js 15** for all websites (App Router)
- **Tailwind 4 + PostCSS** for styling
- **Supabase** for backend (auth, DB, storage)
- **Vercel** for deployment
- **CDN assets** served from Supabase Storage (not git)

## Document Format Pipeline
```
txt (source of truth) → md (markdown) → docx (Word) → pdf (distribution)
```

## Active Projects
- CiszuNetwork Page (projects/ciszu/website)
- Ciszuko Antony Portfolio (projects/ciszukoantony/website)
- MuzicMania (projects/muzicmania)
- CiszuBot (projects/ciszubot)
- CiszuGamens Community (ciszugamens/)