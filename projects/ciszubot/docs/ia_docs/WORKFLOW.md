# CiszuBot — Development Workflow

## Comandos
```bash
pnpm --filter ciszubot-web dev    # Desarrollo del website
pnpm --filter ciszubot-web build  # Build del website
pnpm --filter ciszubot-web lint   # Lint del website
node index.js                     # Iniciar bot de Discord (en discord/)
```

## Documentación
```bash
node scripts/txt2md.js projects/ciszubot/docs
node scripts/md2office.js projects/ciszubot/docs
python scripts/txt2pdf.py projects/ciszubot/docs
```

## Git
- `git add . && git commit -m "..." && git push origin main`
- Solo commitear cuando el usuario lo solicite.