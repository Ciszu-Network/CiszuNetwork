# Ciszu Network — Development Workflow

## Daily Commands
```bash
pnpm install           # Install all dependencies
pnpm dev               # Run all apps in dev mode
pnpm build             # Build all apps
pnpm lint              # Lint all apps
pnpm --filter <name> dev  # Run single app
```

## Documentation Pipeline
```bash
# Generate md from txt
node scripts/txt2md.js <docs-path>

# Generate docx from md
node scripts/md2office.js <docs-path>

# Generate pdf from md
python scripts/txt2pdf.py <docs-path>
```

## Asset Management
```bash
pnpm cdn:upload        # Upload assets to Supabase Storage
```

## Before Committing
1. Run `pnpm lint` to check for errors
2. Run `pnpm build` to verify builds
3. Review changes with `git diff`

## Git Conventions
- No emojis in commit messages
- Spanish/descriptive messages
- No commit without explicit user request
- DNS blocks GitHub pushes → user pushes manually

## CI/CD Workflows
- `.github/workflows/ci.yml` — Lint only
- Deploy workflows: auto-deploy on push to main/master
- Each app deploys independently to Vercel